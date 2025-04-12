# Assignment Server

This is a separate server for assignment-related routes. It runs independently from the main backend server to avoid modifying the existing code.

## How to Run

To start the assignment server, run:

```bash
cd backend
python assignment_server.py
```

The server will start on port 8081.

## Available Endpoints

- `GET /api/assignment/prefix-sum` - Get the code template for the Prefix Sum problem
- `POST /api/submit-assignment` - Submit a completed assignment

## Integration with Frontend

The frontend is already configured to use this server at `http://localhost:8081` for assignment-related operations. 