import requests
import json

def test_code_execution_api():
    base_url = "http://localhost:8000"
    
    # Test if server is running
    try:
        response = requests.get(f"{base_url}/")
        print(f"Server status: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
        print("-" * 50)
    except requests.exceptions.ConnectionError:
        print("ERROR: Server is not running. Please start the server first.")
        return
    
    # Test cases for different languages
    test_cases = [
        {
            "name": "Python Hello World",
            "payload": {
                "language": "python",
                "version": "latest",
                "code": "print('Hello, World from Python!')"
            }
        },
        {
            "name": "JavaScript Hello World",
            "payload": {
                "language": "js",
                "version": "latest",
                "code": "console.log('Hello, World from JavaScript!');"
            }
        },
        {
            "name": "Go Hello World",
            "payload": {
                "language": "golang",
                "version": "latest",
                "code": """
package main

import "fmt"

func main() {
    fmt.Println("Hello, World from Go!")
}
"""
            }
        },
        {
            "name": "C++ Hello World",
            "payload": {
                "language": "cpp",
                "version": "latest",
                "code": """
#include <iostream>

int main() {
    std::cout << "Hello, World from C++!" << std::endl;
    return 0;
}
"""
            }
        },
        {
            "name": "Python with Error",
            "payload": {
                "language": "python",
                "version": "latest",
                "code": "print('This will work'); undefined_function()"
            }
        },
        {
            "name": "Infinite Loop Test (should timeout)",
            "payload": {
                "language": "python",
                "version": "latest",
                "code": """
while True:
    pass
"""
            }
        }
    ]
    
    # Library dependency test cases
    library_test_cases = [
        {
            "name": "Python with NumPy",
            "payload": {
                "language": "python",
                "version": "latest",
                "code": """
import numpy as np

# Create a simple array and perform operations
arr = np.array([1, 2, 3, 4, 5])
print(f"Array: {arr}")
print(f"Mean: {np.mean(arr)}")
print(f"Sum: {np.sum(arr)}")
print(f"Standard deviation: {np.std(arr)}")
"""
            }
        },
        {
            "name": "Python with Pandas",
            "payload": {
                "language": "python",
                "version": "latest",
                "code": """
import pandas as pd

# Create a simple dataframe
data = {
    'Name': ['Alice', 'Bob', 'Charlie', 'David'],
    'Age': [25, 30, 35, 40],
    'City': ['New York', 'San Francisco', 'Los Angeles', 'Chicago']
}

df = pd.DataFrame(data)
print("DataFrame:")
print(df)
print("\\nDataFrame info:")
print(df.describe())
"""
            }
        },
        {
            "name": "Python with Matplotlib",
            "payload": {
                "language": "python",
                "version": "latest",
                "code": """
import matplotlib.pyplot as plt
import numpy as np
import io
import sys

# Redirect output to prevent display attempts
plt.switch_backend('Agg')

# Generate plot data
x = np.linspace(0, 10, 100)
y = np.sin(x)

# Create plot
plt.figure(figsize=(8, 4))
plt.plot(x, y)
plt.title('Sine Wave')
plt.grid(True)

# Instead of displaying, just verify it works
print("Plot created successfully!")
print(f"Figure size: {plt.gcf().get_size_inches()}")
print(f"Data points: {len(x)}")
"""
            }
        },
        {
            "name": "JavaScript with Express",
            "payload": {
                "language": "javascript",
                "version": "latest",
                "code": """
// We won't start the server but will verify Express loads correctly
const express = require('express');

// Create an Express application
const app = express();

console.log('Express version:', require('express/package.json').version);
console.log('Express app successfully created');
console.log('Available HTTP methods:', 
  Object.keys(app).filter(key => typeof app[key] === 'function' && 
    ['get', 'post', 'put', 'delete'].includes(key)));
"""
            }
        },
        {
            "name": "JavaScript with Lodash",
            "payload": {
                "language": "javascript",
                "version": "latest",
                "code": """
// Load lodash library
const _ = require('lodash');

// Test some lodash functions
const numbers = [1, 2, 3, 4, 5];
console.log('Original array:', numbers);
console.log('Sum:', _.sum(numbers));
console.log('Average:', _.mean(numbers));

const users = [
  { 'user': 'fred',   'age': 48 },
  { 'user': 'barney', 'age': 36 },
  { 'user': 'fred',   'age': 40 }
];

console.log('Sorted by age:', JSON.stringify(_.sortBy(users, ['age'])));
console.log('Grouped by user:', JSON.stringify(_.groupBy(users, 'user')));
"""
            }
        },
        {
            "name": "Go with External Package",
            "payload": {
                "language": "golang",
                "version": "latest",
                "code": """
package main

import (
    "fmt"
    "github.com/google/uuid"
)

func main() {
    // Generate a UUID
    id := uuid.New()
    fmt.Printf("Generated UUID: %s\\n", id.String())
    fmt.Printf("UUID version: %d\\n", id.Version())
    
    // Generate a few more UUIDs to show they're unique
    fmt.Println("\\nGenerating 3 more UUIDs:")
    for i := 0; i < 3; i++ {
        fmt.Printf("UUID %d: %s\\n", i+1, uuid.New().String())
    }
}
"""
            }
        },
        {
            "name": "C++ with Boost",
            "payload": {
                "language": "cpp",
                "version": "latest",
                "code": """
#include <iostream>
#include <boost/algorithm/string.hpp>
#include <vector>

int main() {
    // Test boost string functions
    std::string hello = "Hello, World from Boost!";
    std::cout << "Original: " << hello << std::endl;
    
    // Convert to upper case
    boost::to_upper(hello);
    std::cout << "Upper case: " << hello << std::endl;
    
    // Split string
    std::vector<std::string> tokens;
    boost::split(tokens, hello, boost::is_any_of(" "));
    
    std::cout << "Split into tokens:" << std::endl;
    for (size_t i = 0; i < tokens.size(); ++i) {
        std::cout << i+1 << ": " << tokens[i] << std::endl;
    }
    
    return 0;
}
"""
            }
        },
        {
            "name": "Python with Multiple Dependencies",
            "payload": {
                "language": "python",
                "version": "latest",
                "code": """
import numpy as np
import pandas as pd
import requests
from datetime import datetime

# Print versions to verify installation
print(f"NumPy version: {np.__version__}")
print(f"Pandas version: {pd.__version__}")
print(f"Requests version: {requests.__version__}")
print(f"Current time: {datetime.now()}")

# Create a pandas DataFrame with numpy data
data = np.random.randn(5, 3)
df = pd.DataFrame(data, columns=['A', 'B', 'C'])
print("\\nGenerated DataFrame:")
print(df)

# Make a simple HTTP request
response = requests.get("https://httpbin.org/get")
print("\\nHTTP Response Status:", response.status_code)
print("Response Headers:", dict(response.headers))
"""
            }
        }
    ]
    
    # Run all test cases combined (original and library tests)
    all_tests = test_cases + library_test_cases
    
    for test in all_tests:
        print(f"Testing: {test['name']}")
        try:
            response = requests.post(f"{base_url}/execute", json=test['payload'])
            print(f"Status code: {response.status_code}")
            result = response.json()
            print("Response:")
            print(json.dumps(result, indent=2))
        except Exception as e:
            print(f"Error occurred: {str(e)}")
        print("-" * 50)

if __name__ == "__main__":
    test_code_execution_api()