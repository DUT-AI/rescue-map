from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import rescue_request_router, needs_router, disaster_type_router, region_router, geocode_router
from app.db.database import Base, engine
import uvicorn
import logging

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React default
        "http://localhost:5175",  # Vite default
        "http://localhost:8080",  # Vue default
        "http://app-cuu-ho.dutai.site",
        "https://app-cuu-ho.dutai.site",
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

Base.metadata.create_all(bind=engine)
app.include_router(rescue_request_router.router)
app.include_router(needs_router.router)
app.include_router(disaster_type_router.router)
app.include_router(region_router.router)
app.include_router(geocode_router.router)
@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI app!"}

@app.get("/health")
def health_check():
    """Health check endpoint for monitoring"""
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8099)