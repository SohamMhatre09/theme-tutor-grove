from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
import subprocess
import tempfile
import os
import shutil
import json
import docker
from fastapi.middleware.cors import CORSMiddleware
import uuid
import logging
import re

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Code Execution API")

# Add CORS middleware to allow requests from any origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Docker client
docker_client = docker.from_env()

# Predefined compatible versions for Python packages
PYTHON_PACKAGE_VERSIONS = {
    "numpy": "1.24.3",
    "pandas": "1.5.3",
    "matplotlib": "3.7.2",
    "requests": "2.31.0"
}

def ensure_docker_images():
    required_images = {
        "python": "python:3.9-slim",
        "javascript": "node:16-alpine",
        "golang": "golang:1.20-alpine",
        "cpp": "gcc:11"
    }
    
    logger.info("Checking and pulling required Docker images...")
    for lang, image in required_images.items():
        try:
            docker_client.images.get(image)
            logger.info(f"Image {image} for {lang} is already available.")
        except docker.errors.ImageNotFound:
            logger.info(f"Pulling image {image} for {lang}...")
            docker_client.images.pull(image)
    logger.info("All required Docker images are ready.")

ensure_docker_images()

class CodeRequest(BaseModel):
    language: str
    version: str = "latest"
    code: str

@app.post("/execute")
async def execute_code(request: CodeRequest):
    language = request.language.lower()
    code = request.code
    
    execution_id = str(uuid.uuid4())
    temp_dir = tempfile.mkdtemp(prefix=f"code_exec_{execution_id}_")
    
    try:
        if language in ["python", "py"]:
            return execute_in_container("python", code, temp_dir)
        elif language in ["javascript", "js"]:
            return execute_in_container("javascript", code, temp_dir)
        elif language in ["go", "golang"]:
            return execute_in_container("golang", code, temp_dir)
        elif language in ["c++", "cpp"]:
            return execute_in_container("cpp", code, temp_dir)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported language: {language}")
    except Exception as e:
        logger.error(f"Execution error: {str(e)}")
        return {
            "stdout": "",
            "stderr": f"Error: {str(e)}",
            "exit_code": -1,
            "error": f"Execution error: {str(e)}"
        }
    finally:
        try:
            shutil.rmtree(temp_dir, ignore_errors=True)
        except Exception as e:
            logger.error(f"Error cleaning temp directory: {str(e)}")

def execute_in_container(language, code, temp_dir):
    config = {
        "python": ("code.py", "python:3.9-slim", "/code/code.py", ["python", "/code/code.py"]),
        "javascript": ("code.js", "node:16-alpine", "/code/code.js", ["node", "/code/code.js"]),
        "golang": ("code.go", "golang:1.20-alpine", "/code/code.go", 
                  ["sh", "-c", "cd /code && go run code.go"]),
        "cpp": ("code.cpp", "gcc:11", "/code/code.cpp", 
               ["sh", "-c", "cd /code && g++ -o program code.cpp && ./program"])
    }
    
    if language not in config:
        raise HTTPException(status_code=400, detail=f"Unsupported language: {language}")
    
    file_name, image, container_path, command = config[language]
    
    # Write code to temporary file
    file_path = os.path.join(temp_dir, file_name)
    with open(file_path, "w") as f:
        f.write(code)
    
    # Create install script
    dependencies = extract_dependencies(language, code)
    install_script_path = os.path.join(temp_dir, "install_dependencies.sh")
    with open(install_script_path, "w") as f:
        f.write(create_install_script(language, dependencies))
    os.chmod(install_script_path, 0o755)
    
    container = None
    try:
        logger.info(f"Running code in {language} container with dependencies: {dependencies}")
        
        container = docker_client.containers.run(
            image=image,
            command=["sh", "-c", "/code/install_dependencies.sh && " + " ".join(command)],
            volumes={temp_dir: {'bind': '/code', 'mode': 'rw'}},
            working_dir="/code",
            remove=False,
            detach=True,
            mem_limit="512m",
            cpu_period=100000,
            cpu_quota=75000,
            network_mode="bridge",
        )
        
        container_id = container.id
        logger.info(f"Started container {container_id}")
        
        try:
            exit_status = container.wait(timeout=30)
            exit_code = exit_status["StatusCode"]
            
            stdout = container.logs(stdout=True, stderr=False).decode('utf-8', errors='replace')
            stderr = container.logs(stdout=False, stderr=True).decode('utf-8', errors='replace')
            
            return {
                "stdout": stdout,
                "stderr": stderr,
                "exit_code": exit_code
            }
        except Exception as e:
            logger.error(f"Container execution error: {str(e)}")
            
            try:
                # Try to kill the container if it's still running
                container.kill()
                stdout = container.logs(stdout=True, stderr=False).decode('utf-8', errors='replace')
                stderr = container.logs(stdout=False, stderr=True).decode('utf-8', errors='replace')
                
                return {
                    "stdout": stdout,
                    "stderr": stderr,
                    "exit_code": -1,
                    "error": "Execution timed out or was interrupted"
                }
            except Exception as inner_e:
                logger.error(f"Error handling container timeout: {str(inner_e)}")
                return {
                    "stdout": "",
                    "stderr": "Execution timed out",
                    "exit_code": -1,
                    "error": "Execution timed out"
                }
            
    except docker.errors.ContainerError as e:
        logger.error(f"Container error: {str(e)}")
        return {
            "stdout": "",
            "stderr": str(e),
            "exit_code": e.exit_status if hasattr(e, 'exit_status') else -1
        }
    except docker.errors.ImageNotFound as e:
        logger.error(f"Image not found for {language}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Container image for {language} not found")
    except Exception as e:
        logger.error(f"Execution error: {str(e)}")
        return {
            "stdout": "",
            "stderr": str(e),
            "exit_code": -1,
            "error": f"Execution error: {str(e)}"
        }
    finally:
        # Always clean up container if it exists
        if container:
            try:
                logger.info(f"Cleaning up container {container.id}")
                container.remove(force=True)
            except Exception as e:
                logger.error(f"Error removing container: {str(e)}")

def extract_dependencies(language, code):
    """Extract dependencies from code based on language."""
    dependencies = []
    
    if language == "python":
        # Extract imports like 'import numpy' or 'from pandas import DataFrame'
        import_pattern = r'^\s*import\s+([a-zA-Z0-9_\.]+)(?:\s*,\s*([a-zA-Z0-9_\.]+))*'
        from_pattern = r'^\s*from\s+([a-zA-Z0-9_\.]+)\s+import'
        
        standard_libs = ['os', 'sys', 'json', 're', 'math', 'time', 'datetime', 'random', 'io']
        
        for line in code.split('\n'):
            # Check for standard import
            import_match = re.search(import_pattern, line)
            if import_match:
                for group in import_match.groups():
                    if group and group not in standard_libs:
                        # Handle submodules by taking the base package
                        base_package = group.split('.')[0]
                        dependencies.append(base_package)
            
            # Check for from import
            from_match = re.search(from_pattern, line)
            if from_match and from_match.group(1) not in standard_libs:
                # Handle submodules by taking the base package
                base_package = from_match.group(1).split('.')[0]
                dependencies.append(base_package)
    
    elif language == "javascript":
        # Extract imports like 'require("express")' or 'import * from "react"'
        require_pattern = r'require\([\'"]([^\'"]+)[\'"]\)'
        import_pattern = r'import.*?[\'"]([^\'"]+)[\'"]'
        
        for line in code.split('\n'):
            for pattern in [require_pattern, import_pattern]:
                matches = re.findall(pattern, line)
                for match in matches:
                    if not match.startswith('.'):  # Skip relative imports
                        # Extract base package name (before /)
                        if '/' in match:
                            base_package = match.split('/')[0]
                        else:
                            base_package = match
                        dependencies.append(base_package)
    
    elif language == "golang":
        # Extract imports from Go code
        import_pattern = r'import\s*\(\s*(.*?)\s*\)'
        single_import = r'import\s*[\'"]([^\'"]+)[\'"]'
        
        standard_libs = ['fmt', 'os', 'io', 'strings', 'strconv', 'time', 'math', 'net/http']
        
        # For multi-line imports
        import_block = re.search(import_pattern, code, re.DOTALL)
        if import_block:
            for line in import_block.group(1).split('\n'):
                pkg = re.search(r'[\'"]([^\'"]+)[\'"]', line)
                if pkg and not any(pkg.group(1).startswith(std) for std in standard_libs):
                    dependencies.append(pkg.group(1))
        
        # For single imports
        for line in code.split('\n'):
            match = re.search(single_import, line)
            if match and not any(match.group(1).startswith(std) for std in standard_libs):
                dependencies.append(match.group(1))
    
    elif language == "cpp":
        # Extract includes from C++ code, focusing on non-standard libraries
        include_pattern = r'#include\s*<([^>]+)>'
        
        standard_libs = ['iostream', 'vector', 'string', 'map', 'algorithm', 'cmath', 'cstdio', 'cstdlib', 'cstring']
        for line in code.split('\n'):
            match = re.search(include_pattern, line)
            if match and match.group(1) not in standard_libs:
                if "boost" in match.group(1):
                    dependencies.append("boost")
                else:
                    dependencies.append(match.group(1))
    
    logger.info(f"Detected dependencies: {dependencies}")
    return list(set(dependencies))  # Remove duplicates

def create_install_script(language, dependencies):
    """Create a shell script to install the dependencies."""
    
    if language == "python":
        script = "#!/bin/sh\n"
        script += "echo 'Installing Python dependencies...'\n"
        
        if dependencies:
            script += "pip install --no-cache-dir --upgrade pip > /dev/null 2>&1\n"
            
            # Install pandas and numpy with compatible versions
            numpy_needed = "numpy" in dependencies
            pandas_needed = "pandas" in dependencies
            matplotlib_needed = "matplotlib" in dependencies
            
            # Special handling for multiple dependencies
            if "numpy" in dependencies: dependencies.remove("numpy")
            if "pandas" in dependencies: dependencies.remove("pandas")
            if "matplotlib" in dependencies: dependencies.remove("matplotlib")
            
            # Install numpy first as it's a dependency for other packages
            script += "pip install --no-cache-dir numpy==1.23.5 > /dev/null 2>&1 || echo 'Failed to install numpy'\n"
            
            # If pandas needed
            if pandas_needed:
                script += "pip install --no-cache-dir pandas==1.5.3 > /dev/null 2>&1 || echo 'Failed to install pandas'\n"
            
            # If matplotlib needed
            if matplotlib_needed:
                script += "pip install --no-cache-dir matplotlib==3.5.3 > /dev/null 2>&1 || echo 'Failed to install matplotlib'\n"
            
            # Install remaining dependencies
            for dep in dependencies:
                script += f"pip install --no-cache-dir {dep} > /dev/null 2>&1 || echo 'Failed to install {dep}'\n"
        
        script += "echo 'Dependency installation complete.'\n"
        return script
    
    elif language == "javascript":
        script = "#!/bin/sh\n"
        script += "echo 'Installing JavaScript dependencies...'\n"
        script += "mkdir -p /code/node_modules\n"
        
        # Install git for packages that need it
        script += "apk add --no-cache git > /dev/null 2>&1 || echo 'Failed to install git'\n"
        
        if dependencies:
            script += "npm init -y > /dev/null 2>&1\n"
            
            # Handle express differently to avoid package.json issue
            if "express" in dependencies:
                script += "npm install --no-save express@4.18.2 > /dev/null 2>&1 || echo 'Failed to install express'\n"
                dependencies.remove("express")
                
            if "express/package.json" in dependencies:
                dependencies.remove("express/package.json")
                
            # Install remaining dependencies
            for dep in dependencies:
                script += f"npm install --no-save {dep} > /dev/null 2>&1 || echo 'Failed to install {dep}'\n"
        
        script += "echo 'Dependency installation complete.'\n"
        return script
    
    elif language == "golang":
        script = "#!/bin/sh\n"
        script += "echo 'Installing Go dependencies...'\n"
        script += "cd /code\n"
        
        # Initialize go module 
        script += "echo 'module tempcode' > go.mod\n"
        
        if dependencies:
            # Add common modules directly to go.mod for faster installation
            if "github.com/google/uuid" in dependencies:
                script += "go get github.com/google/uuid@v1.3.0 || echo 'Failed to install github.com/google/uuid'\n"
                dependencies.remove("github.com/google/uuid")
            
            # Install remaining dependencies
            for dep in dependencies:
                script += f"go get {dep} || echo 'Failed to install {dep}'\n"
        
        script += "echo 'Dependency installation complete.'\n"
        return script
    
    elif language == "cpp":
        script = "#!/bin/sh\n"
        script += "echo 'Installing C++ dependencies...'\n"
        
        if dependencies:
            script += "apt-get update > /dev/null 2>&1\n"
            
            # Map common libraries to their package names
            cpp_packages = {
                "boost": "libboost-all-dev",  # Install all boost packages
                "boost/algorithm/string.hpp": "libboost-all-dev",
                "opencv": "libopencv-dev",
                "curl": "libcurl4-openssl-dev",
                "mysql": "libmysqlclient-dev",
                "sqlite3": "libsqlite3-dev",
                "jsoncpp": "libjsoncpp-dev"
            }
            
            for dep in dependencies:
                # Try to map the dependency to a package
                pkg = ""
                for key, value in cpp_packages.items():
                    if key in dep.lower():
                        pkg = value
                        break
                
                if not pkg:
                    pkg = f"lib{dep}-dev"
                    
                script += f"apt-get install -y --no-install-recommends {pkg} > /dev/null 2>&1 || echo 'Failed to install {pkg}'\n"
        
        script += "echo 'Dependency installation complete.'\n"
        return script
    
    return "#!/bin/sh\necho 'No dependencies to install.'\n"

@app.get("/")
async def root():
    return {"message": "Code Execution API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)