import requests

# API endpoint
url = "http://localhost:8000/create/assignment"

# Assignment data
data = {
    "assignment_name": "67fea48ee34de3ba8fe4ba42",
    "language": "python",
    "requirements": ["numpy"]
}

# Send POST request to create the assignment
response = requests.post(url, json=data)
print(response.json())