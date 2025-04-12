from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from prefix_sum_route import router as prefix_sum_router

# Create a new FastAPI app for assignments
app = FastAPI(title="Assignment API")

# Add CORS middleware to allow requests from any origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the prefix sum routes
app.include_router(prefix_sum_router)

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Assignment API is running"}

if __name__ == "__main__":
    # Run the server on port 8081
    uvicorn.run(app, host="0.0.0.0", port=8081) 