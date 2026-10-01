import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from routes import router

app = FastAPI(
    title="AI Workout & Nutrition Plan Generator",
    description="Personalized 7-day workout plans, Gemini Flash recovery tips, feedback refinement, and user storage."
)

app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
