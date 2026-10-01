import os
from google import genai

# Configure API Client
api_key = os.environ.get("GEMINI_API_KEY", "")
client = genai.Client(api_key=api_key)

def generate_workout_gemini(user_input: dict) -> str:
    """
    Implements the core logic to generate a personalized 7-day workout plan
    using user inputs such as goal (e.g., muscle gain, weight loss) and
    intensity (low, medium, high).

    Returns a structured, day-wise plan including:
    - Warm-up (5–10 mins)
    - Main workout (exercise details, sets, reps)
    - Cooldown or recovery tip
    """
    goal = user_input.get("goal", "general fitness")
    intensity = user_input.get("intensity", "medium")
    name = user_input.get("name") or user_input.get("username", "Athlete")
    age = user_input.get("age", 25)
    weight = user_input.get("weight", 70.0)

    prompt = f"""
You are an elite certified personal fitness trainer.
Create a personalized, structured 7-day workout plan for {name} (Age: {age}, Weight: {weight}kg).
Goal: {goal}
Preferred Intensity: {intensity}

For EACH DAY from Day 1 to Day 7, you MUST follow this exact format:

Day [X]: [Focus / Target Muscle Groups or Cardio Type]
Warm-up: (5–10 mins specific dynamic mobility & activation exercises)
Main Workout:
- [Exercise Name]: [Number] sets x [Number] reps (or duration) - [intensity / rest note]
- [Exercise Name]: [Number] sets x [Number] reps - [intensity / rest note]
- [Exercise Name]: [Number] sets x [Number] reps - [intensity / rest note]
- [Exercise Name]: [Number] sets x [Number] reps - [intensity / rest note]
Cooldown: (5–10 mins static stretching, foam rolling, or recovery tip)

Ensure all 7 days are fully detailed. Maintain high professional standards and clear structure.
"""
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text.strip()
    except Exception as e:
        return f"Error generating workout plan: {e}"

if __name__ == "__main__":
    sample_user = {
        "user_id": 1,
        "name": "Alex",
        "age": 28,
        "weight": 75.0,
        "goal": "muscle gain",
        "intensity": "high"
    }
    print(generate_workout_gemini(sample_user))
