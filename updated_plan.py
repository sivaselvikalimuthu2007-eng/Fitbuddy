import os
from google import genai

# Configure API Client
api_key = os.environ.get("GEMINI_API_KEY", "")
client = genai.Client(api_key=api_key)

def update_workout_plan(original_plan: str, user_feedback: str) -> str:
    """
    Enables the user to revise their original plan by submitting feedback
    (e.g., 'Add yoga', 'Include more cardio', 'Replace dumbbell shoulder press').
    Passes original plan and feedback to Gemini, returning a modified plan
    with the suggested updates while preserving the original 7-day structure.
    """
    prompt = f"""
You are a professional fitness coach updating a client's workout plan based on their specific feedback.

--- ORIGINAL 7-DAY WORKOUT PLAN ---
{original_plan}

--- CLIENT FEEDBACK / REVISION REQUEST ---
"{user_feedback}"

TASK:
Modify the workout plan to integrate the client's requested changes seamlessly.
- Preserve the exact Day-by-Day format (Warm-up, Main Workout with sets/reps, Cooldown).
- Only modify the days/exercises impacted by the feedback, or adjust intensity accordingly.
- Keep unchanged days intact.
- Add a brief note at the very top summarizing the exact updates applied.

Return the complete revised 7-day plan.
"""
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text.strip()
    except Exception as e:
        return f"Error updating workout plan: {e}"

if __name__ == "__main__":
    test_plan = "Day 1: Chest\nWarm-up: 5 mins\nMain Workout: Bench 3x10\nCooldown: Stretch"
    print(update_workout_plan(test_plan, "Add 15 minutes of yoga on Day 1"))
