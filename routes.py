from fastapi import APIRouter, Request, Form, Depends, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field
from typing import Optional

from gemini_generator import generate_workout_gemini
from gemini_flash_generator import generate_nutrition_tip_with_flash
from updated_plan import update_workout_plan
import database as db

router = APIRouter()
templates = Jinja2Templates(directory="templates")

# Pydantic Schemas for structure validation
class UserInput(BaseModel):
    user_id: int = Field(..., description="Unique User ID", ge=1)
    username: str = Field(..., min_length=1, max_length=100)
    age: int = Field(..., ge=10, le=120)
    weight: float = Field(..., gt=20, lt=400)
    goal: str = Field(..., min_length=2)
    intensity: str = Field(..., regex="^(low|medium|high|Low|Medium|High)$")

class FeedbackRequest(BaseModel):
    user_id: int
    feedback: str = Field(..., min_length=3)

# 1. GET / - Index page with Form
@router.get("/", response_class=HTMLResponse)
async def index_page(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# 2. POST /generate-workout - Process Form, Call Gemini, Save & Render result.html
@router.post("/generate-workout", response_class=HTMLResponse)
async def generate_workout_route(
    request: Request,
    user_id: int = Form(...),
    username: str = Form(...),
    age: int = Form(...),
    weight: float = Form(...),
    goal: str = Form(...),
    intensity: str = Form(...)
):
    try:
        # Validate through Pydantic
        user_input_model = UserInput(
            user_id=user_id,
            username=username,
            age=age,
            weight=weight,
            goal=goal,
            intensity=intensity
        )

        # 1. Save user profile to database
        db.save_user(
            user_id=user_input_model.user_id,
            name=user_input_model.username,
            age=user_input_model.age,
            weight=user_input_model.weight,
            goal=user_input_model.goal,
            intensity=user_input_model.intensity
        )

        user_dict = {
            "user_id": user_input_model.user_id,
            "username": user_input_model.username,
            "age": user_input_model.age,
            "weight": user_input_model.weight,
            "goal": user_input_model.goal,
            "intensity": user_input_model.intensity
        }

        # 2. Call Gemini 1.5 Pro to generate 7-day workout plan
        workout_plan = generate_workout_gemini(user_dict)

        # 3. Call Gemini Flash to generate concise nutrition / recovery tip
        nutrition_tip = generate_nutrition_tip_with_flash(user_input_model.goal)

        # 4. Save original plan in SQLite database
        db.save_plan(
            user_id=user_input_model.user_id,
            original_plan=workout_plan,
            nutrition_tip=nutrition_tip
        )

        # 5. Render result.html with <pre> formatting
        return templates.TemplateResponse("result.html", {
            "request": request,
            "user_id": user_input_model.user_id,
            "username": user_input_model.username,
            "age": user_input_model.age,
            "weight": user_input_model.weight,
            "goal": user_input_model.goal,
            "intensity": user_input_model.intensity,
            "workout_plan": workout_plan,
            "nutrition_tip": nutrition_tip,
            "updated_plan": None,
            "feedback": None
        })

    except Exception as e:
        return templates.TemplateResponse("result.html", {
            "request": request,
            "error": str(e),
            "user_id": user_id,
            "username": username
        })

# 3. POST /submit-feedback - Update workout plan using Gemini Pro
@router.post("/submit-feedback", response_class=HTMLResponse)
async def submit_feedback_route(
    request: Request,
    user_id: int = Form(...),
    feedback: str = Form(...),
    nutrition_tip: Optional[str] = Form("")
):
    try:
        feedback_model = FeedbackRequest(user_id=user_id, feedback=feedback)

        # Retrieve user and original plan
        user = db.get_user(feedback_model.user_id)
        original_plan = db.get_original_plan(feedback_model.user_id)

        if not original_plan:
            raise HTTPException(status_code=404, detail="Original plan not found. Please generate a plan first.")

        # Call Gemini Pro to revise workout plan based on user feedback
        updated_workout = update_workout_plan(original_plan, feedback_model.feedback)

        # Save updated plan in SQLite without overwriting the original plan
        db.update_plan(
            user_id=feedback_model.user_id,
            updated_plan=updated_workout,
            feedback=feedback_model.feedback
        )

        return templates.TemplateResponse("result.html", {
            "request": request,
            "user_id": user.id if user else user_id,
            "username": user.name if user else "Athlete",
            "age": user.age if user else 25,
            "weight": user.weight if user else 70.0,
            "goal": user.goal if user else "Fitness",
            "intensity": user.intensity if user else "Medium",
            "workout_plan": original_plan,
            "nutrition_tip": nutrition_tip or (user.plans[0].nutrition_tip if user and user.plans else ""),
            "updated_plan": updated_workout,
            "feedback": feedback_model.feedback
        })

    except Exception as e:
        return templates.TemplateResponse("result.html", {
            "request": request,
            "error": str(e),
            "user_id": user_id
        })

# 4. GET /view-all-users - Admin view with Jinja2 loop
@router.get("/view-all-users", response_class=HTMLResponse)
async def view_all_users_route(request: Request):
    users = db.get_all_users()
    return templates.TemplateResponse("all_users.html", {
        "request": request,
        "users": users
    })
