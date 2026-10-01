import os
from google import genai

# Configure API Client
api_key = os.environ.get("GEMINI_API_KEY", "")
client = genai.Client(api_key=api_key)

def generate_nutrition_tip_with_flash(goal: str) -> str:
    """
    Generates a concise, practical nutrition or recovery tip tailored to the
    user's selected goal (e.g., muscle gain, weight loss, general fitness).
    Utilizes Gemini Flash to deliver a fast, helpful response such as hydration
    advice, protein suggestions, or general recovery best practices.
    """
    prompt = f"""
Give ONE concise, practical, and highly actionable nutrition or recovery tip for an individual whose fitness goal is '{goal}'.
Include guidance on either hydration, macronutrient timing (like protein or complex carbs), or restorative sleep/recovery practice.
Keep it punchy, motivating, and around 2 to 3 sentences maximum.
"""
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text.strip()
    except Exception as e:
        return f"Error generating nutrition tip: {e}"

if __name__ == "__main__":
    print(generate_nutrition_tip_with_flash("muscle gain"))
