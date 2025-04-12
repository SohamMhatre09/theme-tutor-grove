from fastapi import FastAPI
from prefix_sum_route import router as prefix_sum_router

def register_routes(app: FastAPI):
    """
    Register additional routes to the FastAPI app.
    This function can be imported and called from app.py without modifying it directly.
    
    Example usage in app.py:
    ```
    # At the end of app.py
    try:
        from routes_connector import register_routes
        register_routes(app)
    except ImportError:
        pass
    ```
    """
    app.include_router(prefix_sum_router) 