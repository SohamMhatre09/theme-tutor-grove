import requests

# API endpoint
url = "http://localhost:8000/create/assignment"

# Assignment data
data = {
    "assignment_name": "67fd5f1df8907176855b07d7",
    "language": "python",
    "requirements": ["numpy"]
}

# Send POST request to create the assignment
response = requests.post(url, json=data)
print(response.json())