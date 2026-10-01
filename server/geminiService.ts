import { GoogleGenAI } from '@google/genai';
import { UserProfile } from './database.ts';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface UserInputPayload {
  user_id: number;
  username: string;
  age: number;
  weight: number;
  height?: number;
  fitnessLevel?: string;
  gender?: string;
  goal: string;
  intensity: string;
  targetWeight?: number;
  availableEquipment?: string[];
  daysPerWeek?: number;
  workoutDurationMins?: number;
  limitationsOrInjuries?: string;
}

/**
 * 1. AI Fitness Plan Generator & User Profile Analysis
 * Function: generate_workout_gemini()
 * Generates personalized 7-day workout plans matching:
 * - Specific goal (muscle gain, weight loss, endurance, strength, mobility)
 * - Fitness level (beginner, intermediate, advanced)
 * - Equipment available (dumbbells, barbells, bodyweight, machines, bands)
 * - Schedule & Duration
 * - Injuries / limitations consideration
 */
export async function generate_workout_gemini(input: UserInputPayload): Promise<string> {
  const equipmentStr = input.availableEquipment?.length 
    ? input.availableEquipment.join(', ')
    : 'Standard gym equipment or dumbbells';

  const prompt = `You are FitBuddy-AI, an elite certified exercise physiologist and personal trainer.
Create an in-depth, personalized 7-day workout plan for:
- Athlete Name: ${input.username}
- Age: ${input.age} | Weight: ${input.weight}kg | Height: ${input.height || 175}cm | Fitness Level: ${input.fitnessLevel || 'Intermediate'}
- Primary Fitness Goal: ${input.goal}
- Intensity: ${input.intensity}
- Equipment Available: ${equipmentStr}
- Target Schedule: ${input.daysPerWeek || 4} training days/week, ~${input.workoutDurationMins || 45} mins/session
- Physical Limitations / Injuries: ${input.limitationsOrInjuries || 'None'}

CRITICAL FORMATTING INSTRUCTIONS:
Structure each day from Day 1 to Day 7 in the following consistent format:

Day [X]: [Focus / Targeted Muscle Group or Routine Title]
Warm-up: (5–10 mins specific dynamic mobility & activation exercises tailored to available equipment)
Main Workout:
- [Exercise Name]: [Number] sets x [Number] reps (or duration) - [intensity / rest interval / tempo note]
- [Exercise Name]: [Number] sets x [Number] reps - [intensity / rest interval / tempo note]
- [Exercise Name]: [Number] sets x [Number] reps - [intensity / rest interval / tempo note]
- [Exercise Name]: [Number] sets x [Number] reps - [intensity / rest interval / tempo note]
Cooldown: (5–10 mins static stretching, foam rolling, or recovery guidance)

Ensure all 7 days are clearly outputted. For rest or active recovery days, prescribe a structured mobility/cardio recovery routine.
Incorporate exercises strictly suited to the user's available equipment and fitness level.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text?.trim();
    if (text) return text;
  } catch (err: any) {
    console.error('Error calling Gemini for workout plan:', err);
  }

  return generateFallbackWorkout(input);
}

/**
 * 2. AI Nutrition Suggestions & Goal Tailoring
 * Function: generate_nutrition_tip_with_flash()
 */
export async function generate_nutrition_tip_with_flash(goal: string, userProfile?: Partial<UserProfile>): Promise<string> {
  const prompt = `You are FitBuddy-AI nutrition advisor.
Provide a concise, practical, and highly actionable nutrition and recovery guidance for an athlete with:
- Goal: '${goal}'
- Fitness Level: '${userProfile?.fitnessLevel || 'Intermediate'}'
- Weight: ${userProfile?.weight || 70}kg

Provide 2-3 focused, punchy sentences covering:
1. Daily protein/macro target or optimal meal timing.
2. Hydration & electrolyte strategy.
3. Practical food recommendation or supplement advice.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text?.trim();
    if (text) return text;
  } catch (err: any) {
    console.error('Error calling Gemini Flash for nutrition tip:', err);
  }

  const normalizedGoal = goal.toLowerCase();
  if (normalizedGoal.includes('muscle') || normalizedGoal.includes('hypertrophy') || normalizedGoal.includes('strength')) {
    return "Consume 1.8 to 2.2g of protein per kg of bodyweight daily, spaced across 4 balanced meals with 35-45g each. Pair your post-workout meal with fast-digesting complex carbs and maintain 3L of water daily for cellular volumization.";
  } else if (normalizedGoal.includes('weight') || normalizedGoal.includes('fat') || normalizedGoal.includes('loss')) {
    return "Target a modest 300-500 calorie deficit while maintaining 1.6g/kg of protein to preserve lean tissue. Drink 500ml of cold water 20 minutes prior to meals and build plates around high-volume leafy greens.";
  } else if (normalizedGoal.includes('endurance') || normalizedGoal.includes('stamina') || normalizedGoal.includes('cardio')) {
    return "Consume 5–7g of carbohydrates per kg daily on heavy training blocks, and replenish sodium and potassium electrolytes within 30 minutes post-sweat to accelerate glycogen resynthesis.";
  } else {
    return "Prioritize whole, single-ingredient foods with 30g of fiber daily, drink 2.5–3 liters of water, and incorporate magnesium glycinate or herbal chamomile 45 minutes before sleep to optimize muscular repair.";
  }
}

/**
 * Detailed Full Nutrition Plan Generator
 */
export async function generate_full_nutrition_plan(userProfile: UserProfile): Promise<any> {
  const prompt = `You are FitBuddy-AI head of sports nutrition.
Generate a structured daily nutrition plan for:
Name: ${userProfile.name}, Age: ${userProfile.age}, Weight: ${userProfile.weight}kg, Goal: ${userProfile.goal}, Intensity: ${userProfile.intensity}

Return ONLY valid JSON with this exact structure:
{
  "dailyCalories": 2400,
  "proteinGrams": 160,
  "carbGrams": 240,
  "fatGrams": 70,
  "hydrationTarget": "3.0 Liters / day",
  "guidelines": ["Guideline 1", "Guideline 2", "Guideline 3"],
  "mealSuggestions": [
    { "meal": "Breakfast", "description": "3 whole eggs with spinach, 1 cup oats with berries", "macros": "450 kcal | 32g P | 50g C | 14g F" },
    { "meal": "Lunch", "description": "Grilled chicken breast, quinoa, roasted broccoli, olive oil", "macros": "600 kcal | 48g P | 55g C | 18g F" },
    { "meal": "Pre-Workout Snack", "description": "Greek yogurt with a banana and 1 tbsp honey", "macros": "250 kcal | 18g P | 40g C | 2g F" },
    { "meal": "Dinner", "description": "Baked salmon fillet, sweet potato, asparagus", "macros": "650 kcal | 42g P | 50g C | 22g F" }
  ]
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return parsed;
  } catch (err) {
    console.error('Error generating full nutrition plan:', err);
    return {
      dailyCalories: Math.round(userProfile.weight * 32),
      proteinGrams: Math.round(userProfile.weight * 1.8),
      carbGrams: Math.round(userProfile.weight * 3.2),
      fatGrams: Math.round(userProfile.weight * 0.8),
      hydrationTarget: `${(userProfile.weight * 0.035).toFixed(1)} Liters / day`,
      guidelines: [
        "Distribute protein intake evenly across 3-4 meals every 3 to 4 hours.",
        "Include a fist-sized serving of green vegetables with lunch and dinner.",
        "Drink at least 500ml water upon waking and before each training session."
      ],
      mealSuggestions: [
        { meal: "Breakfast", description: "Oatmeal with whey protein, chia seeds, and sliced banana", macros: "420 kcal | 35g P | 55g C | 9g F" },
        { meal: "Lunch", description: "Grilled lean protein (chicken or tofu) with brown rice & steamed greens", macros: "580 kcal | 45g P | 60g C | 14g F" },
        { meal: "Post-Workout Snack", description: "Protein shake with a handful of almonds and rice cakes", macros: "280 kcal | 28g P | 22g C | 8g F" },
        { meal: "Dinner", description: "Wild salmon or lean steak with roasted sweet potato & asparagus", macros: "620 kcal | 44g P | 48g C | 20g F" }
      ]
    };
  }
}

/**
 * 3. Adaptive Workout Plans via Feedback
 * Function: update_workout_plan()
 */
export async function update_workout_plan(originalPlan: string, userFeedback: string): Promise<string> {
  const prompt = `You are FitBuddy-AI adaptive fitness coach.

--- CURRENT 7-DAY WORKOUT PLAN ---
${originalPlan}

--- USER PROGRESS & REVISION FEEDBACK ---
"${userFeedback}"

TASK:
1. Modify the 7-day workout plan to seamlessly integrate the user's feedback (e.g., substitute equipment, add yoga, increase cardio, accommodate soreness/injuries, adjust sets/reps).
2. Keep the exact Day-by-Day format (Warm-up, Main Workout with sets/reps, Cooldown).
3. Keep unaffected days intact.
4. Prepend a summary tag:
[REVISION APPLIED: <Brief 1-2 sentence description of adaptations made>]

Return the complete revised 7-day plan.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text?.trim();
    if (text) return text;
  } catch (err: any) {
    console.error('Error calling Gemini for plan update:', err);
  }

  return `[REVISION APPLIED: Adjusted workout plan incorporating user feedback: "${userFeedback}"]\n\n` +
    originalPlan.replace(
      /Day 7:.*?\nCooldown:.*$/s,
      `Day 7: Active Recovery & Adaptive Revision (${userFeedback})\nWarm-up: 5–10 mins joint mobility and dynamic flow\nMain Workout:\n- Tailored Session: Incorporating "${userFeedback}" for 35–45 mins\n- Core & Mobility Circuit: 3 sets x 15 reps\nCooldown: 10 mins gentle breathing and full-body stretch`
    );
}

/**
 * 4. Gemini AI Chatbot – Fitness Q&A
 */
export async function ask_fitness_chatbot(
  userQuestion: string,
  userProfile?: UserProfile | null,
  recentHistory?: { role: 'user' | 'model'; content: string }[]
): Promise<string> {
  const contextStr = userProfile
    ? `User Profile Context: Name: ${userProfile.name}, Goal: ${userProfile.goal}, Fitness Level: ${userProfile.fitnessLevel}, Weight: ${userProfile.weight}kg, Intensity: ${userProfile.intensity}, Available Equipment: ${userProfile.availableEquipment?.join(', ') || 'General'}.`
    : `User has general fitness questions.`;

  const historyPrompt = (recentHistory || [])
    .slice(-4)
    .map(h => `${h.role === 'user' ? 'User' : 'FitBuddy-AI'}: ${h.content}`)
    .join('\n');

  const prompt = `You are FitBuddy-AI, an empathetic, evidence-based, and highly motivating personal trainer and fitness assistant.
${contextStr}

Previous conversation:
${historyPrompt}

User Question: "${userQuestion}"

Provide a direct, helpful, scientifically grounded, and concise answer (2-4 paragraphs max). Use bullet points where appropriate for readability.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || "I'm here to support your fitness journey. Keep pushing toward your goals!";
  } catch (err: any) {
    console.error('Error in ask_fitness_chatbot:', err);
    return "Great question! Consistency with your training fundamentals—progressive overload, adequate protein (1.6-2.2g/kg), proper hydration, and 7-9 hours of restorative sleep—will deliver 90% of your long-term results.";
  }
}

/**
 * 5. Exercise Alternatives Suggestion
 */
export async function get_exercise_alternatives(
  exerciseName: string,
  reason?: string,
  availableEquipment?: string[]
): Promise<any> {
  const prompt = `Suggest 4 high-quality alternative exercises for "${exerciseName}".
Reason/Limitation: "${reason || 'Equipment unavailable or joint comfort'}"
Available Equipment: "${availableEquipment?.join(', ') || 'Any'}"

Return ONLY valid JSON matching this schema:
{
  "originalExercise": "${exerciseName}",
  "alternatives": [
    {
      "name": "Alternative Exercise Name",
      "targetMuscles": "Chest, Triceps",
      "equipmentNeeded": "Dumbbells or Bands",
      "whyItWorks": "Provides similar muscle recruitment while reducing shoulder impingement risk.",
      "difficulty": "Beginner to Intermediate"
    }
  ]
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (err) {
    console.error('Error getting exercise alternatives:', err);
    return {
      originalExercise: exerciseName,
      alternatives: [
        {
          name: `Dumbbell Variation of ${exerciseName}`,
          targetMuscles: "Primary target muscles",
          equipmentNeeded: "Dumbbells",
          whyItWorks: "Allows a freer range of motion and unilateral balance.",
          difficulty: "Intermediate"
        },
        {
          name: `Bodyweight / Resistance Band ${exerciseName}`,
          targetMuscles: "Stabilizers and primary muscle groups",
          equipmentNeeded: "Resistance Bands / Mat",
          whyItWorks: "Joint-friendly resistance curve with constant tension.",
          difficulty: "Beginner"
        }
      ]
    };
  }
}

function generateFallbackWorkout(input: UserInputPayload): string {
  const g = input.goal.toLowerCase();
  const isMuscle = g.includes('muscle') || g.includes('strength');
  const isWeightLoss = g.includes('loss') || g.includes('fat');

  return `Day 1: ${isMuscle ? 'Upper Body Power & Push Focus' : isWeightLoss ? 'Full Body Metabolic Conditioning' : 'Foundation & Core Strength'}
Warm-up: (5–10 mins) Arm swings, torso twists, inchworms, 20 band pull-aparts
Main Workout:
- ${isMuscle ? 'Barbell Bench Press' : 'Goblet Squats'}: 4 sets x ${isMuscle ? '8' : '12'} reps - 75s rest, focus on controlled eccentric
- ${isMuscle ? 'Incline Dumbbell Press' : 'Dumbbell Push Press'}: 3 sets x 10 reps - 60s rest
- ${isMuscle ? 'Cable Chest Flyes' : 'Kettlebell Swings'}: 3 sets x 12 reps - 45s rest
- Triceps Rope Pushdown / Plank Hold: 3 sets x 15 reps (or 45s hold) - 45s rest
Cooldown: (5–10 mins) Chest doorframe stretches, triceps extension stretch, deep nasal breathing

Day 2: ${isMuscle ? 'Lower Body Compound Strength' : 'High-Cadence Cardio & Core'}
Warm-up: (5–10 mins) Leg swings, bodyweight squats, ankle rotations, hip 90/90s
Main Workout:
- ${isMuscle ? 'Barbell Back Squat' : 'Walking Dumbbell Lunges'}: 4 sets x ${isMuscle ? '8' : '12'} reps - 90s rest
- ${isMuscle ? 'Romanian Deadlifts' : 'Dumbbell Step-ups'}: 3 sets x 10 reps - 75s rest
- Leg Extensions / Bodyweight Jump Squats: 3 sets x 12 reps - 60s rest
- Standing Calf Raises: 4 sets x 15 reps - 45s rest
Cooldown: (5–10 mins) Quad couch stretch, standing hamstring stretch, foam roll glutes

Day 3: Active Rest & Joint Mobility
Warm-up: 5 mins gentle neck rolls, wrist circles, cat-cow
Main Workout:
- 30-40 mins conversational pace outdoor brisk walk or light swimming
- 15 mins dynamic hip and thoracic spine mobility routine
Cooldown: 5 mins diaphragmatic box breathing (4s in, 4s hold, 4s out, 4s hold)

Day 4: ${isMuscle ? 'Back & Biceps Hypertrophy' : 'Upper Body Circuit & HIIT Intervals'}
Warm-up: (5–10 mins) Dead hangs, light resistance band face pulls, shoulder rolls
Main Workout:
- ${isMuscle ? 'Bent-Over Barbell Rows' : 'Lat Pulldowns'}: 4 sets x ${isMuscle ? '8' : '12'} reps - 75s rest
- Dumbbell Single-Arm Rows: 3 sets x 10 reps per side - 60s rest
- Incline Dumbbell Biceps Curls: 3 sets x 12 reps - 45s rest
- Face Pulls with Rope: 3 sets x 15 reps - 45s rest
Cooldown: (5–10 mins) Child's pose, lat hangs, cross-body shoulder stretch

Day 5: ${isMuscle ? 'Shoulders, Arms & Abs' : 'Lower Body Burn & Core Stability'}
Warm-up: (5–10 mins) Prone Y-T-W raises, jumping jacks, hip circles
Main Workout:
- ${isMuscle ? 'Standing Overhead Dumbbell Press' : 'Goblet Squat to Press'}: 4 sets x 10 reps - 75s rest
- Lateral Dumbbell Raises: 4 sets x 12-15 reps - 45s rest
- Hammer Curls: 3 sets x 12 reps - 45s rest
- Hanging Knee Raises / Plank: 3 sets x 15 reps - 45s rest
Cooldown: (5–10 mins) Cobra pose, overhead triceps stretch, foam rolling

Day 6: ${isMuscle ? 'Glutes, Hamstrings & Posterior Chain' : 'Full Body Cardio Blast & Agility'}
Warm-up: (5–10 mins) Glute bridges, high knees, butt kicks, bodyweight hip hinges
Main Workout:
- ${isMuscle ? 'Barbell Hip Thrusts' : 'Kettlebell Deadlifts'}: 4 sets x 10 reps - 90s rest
- Hamstring Leg Curls: 3 sets x 12 reps - 60s rest
- Dumbbell Farmer's Walk: 3 sets x 40 meters - 60s rest
- Mountain Climbers: 3 sets x 30 seconds - 45s rest
Cooldown: (5–10 mins) Pigeon pose, butterfly stretch, deep hydration

Day 7: Full Recovery, Restoration & Preparation
Warm-up: 5 mins gentle breathing and spinal twists
Main Workout:
- Full-body foam rolling session targeting calves, quads, lats, and upper back
- 20 mins restorative yoga flow or gentle stroll
Cooldown: 10 mins peaceful meditation, hydration check, and meal prep review for next week`;
}
