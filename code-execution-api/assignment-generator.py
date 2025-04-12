import os
import json
import argparse
import requests
from typing import Dict, List, Any, Optional

class AssignmentGeneratorAgent:
    def __init__(self, gemini_api_key: str):
        self.api_key = "AIzaSyAydz2ujm-2rlytilLL6CAylPqujxWbOwU"
        self.gemini_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    
    def generate_assignment(self, description: str) -> Dict[str, Any]:
        """
        Generate a complete assignment from a simple description.
        
        Args:
            description: A simple description like "Make assignment for A* algorithm"
            
        Returns:
            A dictionary containing the complete assignment structure
        """
        # Generate the detailed assignment structure using Gemini API
        prompt = self._create_prompt(description)
        response = self._call_gemini_api(prompt)
        
        # Parse and validate the generated assignment
        assignment = self._parse_response(response)
        
        return assignment
    
    def _create_prompt(self, description: str) -> str:
        """Create a detailed prompt for the Gemini API based on the teacher's description."""
        prompt = f"""
You are an expert computer science educator. Create a detailed coding assignment based on this simple description: "{description}"

The assignment should be structured like a Codecademy-style interactive tutorial with progressive modules.

For each module:
1. Create clear learning text explaining the concept
2. Provide code templates with <EDITABLE> tags around sections students should complete
3. Include helpful hints for students
4. Specify the expected output

Return your response as a valid JSON object with this structure:
{{
  "assignment": {{
    "title": "Assignment title",
    "description": "Overall description of the assignment",
    "modules": [
      {{
        "id": 1,
        "title": "Module title",
        "learningText": "Explanatory text for this module",
        "codeTemplate": "Full code with <EDITABLE>student code here</EDITABLE> tags",
        "hints": ["Hint 1", "Hint 2", "Hint 3"],
        "expectedOutput": "Description of expected output"
      }},
      // Additional modules...
    ]
  }}
}}

Make sure:
- Code in the codeTemplate should be valid, executable code when the <EDITABLE> sections are completed
- Each module should build progressively on previous modules
- There should be 4-6 modules that break down the assignment into logical learning steps
- Include appropriate imports and setup code in the first module
- The final module should include test code to demonstrate the solution works

Ensure the JSON is well-formed without any formatting errors.
"""
        return prompt
    
    def _call_gemini_api(self, prompt: str) -> Dict[str, Any]:
        """Call the Gemini API with the given prompt."""
        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": self.api_key
        }
        
        data = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "topP": 0.8,
                "topK": 40,
                "maxOutputTokens": 8192
            }
        }
        
        try:
            response = requests.post(self.gemini_url, headers=headers, json=data)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"API call failed: {e}")
            return {"error": str(e)}
    
    def _parse_response(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """Extract and parse the JSON assignment from the Gemini API response."""
        try:
            # Extract the text from the response
            text = response.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            
            # Find JSON object in the text (it might be surrounded by markdown code blocks)
            json_start = text.find("{")
            json_end = text.rfind("}") + 1
            
            if json_start >= 0 and json_end > json_start:
                json_str = text[json_start:json_end]
                assignment = json.loads(json_str)
                return self._validate_assignment(assignment)
            else:
                print("No valid JSON found in response")
                return {"error": "No valid JSON found in response", "raw_response": text}
        except (json.JSONDecodeError, KeyError, IndexError) as e:
            print(f"Error parsing response: {e}")
            return {"error": str(e), "raw_response": response}
    
    def _validate_assignment(self, assignment: Dict[str, Any]) -> Dict[str, Any]:
        """Validate the structure of the generated assignment and fix any issues."""
        # Check if the assignment has the expected structure
        if "assignment" not in assignment:
            print("Warning: 'assignment' key missing, restructuring response")
            return {"assignment": assignment}
        
        # Ensure all modules have the required fields
        for i, module in enumerate(assignment["assignment"].get("modules", [])):
            if "id" not in module:
                module["id"] = i + 1
            if "hints" not in module or not isinstance(module["hints"], list):
                module["hints"] = []
            if "codeTemplate" in module:
                # Ensure code template has <EDITABLE> tags
                if "<EDITABLE>" not in module["codeTemplate"]:
                    lines = module["codeTemplate"].split("\n")
                    module["codeTemplate"] = "\n".join([
                        lines[0],
                        "<EDITABLE>",
                        *lines[1:],
                        "</EDITABLE>"
                    ])
        
        return assignment
    
    def save_assignment(self, assignment: Dict[str, Any], output_file: str) -> None:
        """Save the generated assignment to a JSON file."""
        with open(output_file, 'w') as f:
            json.dump(assignment, f, indent=2)
        print(f"Assignment saved to {output_file}")
    
    def generate_modules_json(self, assignment: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Extract just the modules from the assignment in a format suitable for the learning platform.
        This separates the code into chunks for the frontend to display.
        """
        if "assignment" not in assignment:
            return []
        
        modules = []
        for module in assignment["assignment"].get("modules", []):
            # Process the code template to extract editable and non-editable parts
            code_parts = self._split_code_template(module.get("codeTemplate", ""))
            
            modules.append({
                "id": module.get("id", 0),
                "title": module.get("title", ""),
                "learningText": module.get("learningText", ""),
                "codeParts": code_parts,
                "hints": module.get("hints", []),
                "expectedOutput": module.get("expectedOutput", "")
            })
        
        return modules
    
    def _split_code_template(self, code_template: str) -> List[Dict[str, Any]]:
        """
        Split the code template into editable and non-editable parts.
        
        Returns:
            A list of code parts, each with "code" and "editable" fields
        """
        parts = []
        remaining = code_template
        
        while remaining:
            # Find the next editable section
            editable_start = remaining.find("<EDITABLE>")
            
            if editable_start < 0:
                # No more editable sections, add the rest as non-editable
                if remaining.strip():
                    parts.append({"code": remaining, "editable": False})
                break
            
            # Add non-editable part before the editable section
            if editable_start > 0:
                parts.append({"code": remaining[:editable_start], "editable": False})
            
            # Extract the editable part
            editable_end = remaining.find("</EDITABLE>", editable_start)
            if editable_end < 0:
                # Missing closing tag, treat the rest as editable
                editable_content = remaining[editable_start + 10:]  # 10 is len("<EDITABLE>")
                parts.append({"code": editable_content, "editable": True})
                break
            
            editable_content = remaining[editable_start + 10:editable_end]
            parts.append({"code": editable_content, "editable": True})
            
            # Continue with the rest of the code
            remaining = remaining[editable_end + 11:]  # 11 is len("</EDITABLE>")
        
        return parts


def main():
    parser = argparse.ArgumentParser(description="Generate coding assignments from simple descriptions")
    parser.add_argument("description", help="Simple description of the assignment (e.g., 'Make assignment for A* algorithm')")
    parser.add_argument("--api-key", help="Gemini API key", default=os.environ.get("GEMINI_API_KEY"))
    parser.add_argument("--output", "-o", help="Output JSON file", default="assignment.json")
    parser.add_argument("--modules-output", help="Output file for modules JSON", default="modules.json")
    
    args = parser.parse_args()
    
    if not args.api_key:
        print("Error: Gemini API key is required. Provide it with --api-key or set GEMINI_API_KEY environment variable.")
        return
    
    agent = AssignmentGeneratorAgent(args.api_key)
    assignment = agent.generate_assignment(args.description)
    
    if "error" in assignment:
        print(f"Error generating assignment: {assignment['error']}")
        if "raw_response" in assignment:
            print("\nRaw response:")
            print(assignment["raw_response"])
        return
    
    agent.save_assignment(assignment, args.output)
    
    # Generate and save modules JSON for the learning platform
    modules = agent.generate_modules_json(assignment)
    with open(args.modules_output, 'w') as f:
        json.dump(modules, f, indent=2)
    print(f"Modules saved to {args.modules_output}")


if __name__ == "__main__":
    main()