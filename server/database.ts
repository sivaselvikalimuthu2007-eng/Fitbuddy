import fs from 'fs';
import path from 'path';

export interface UserProfile {
  id: number;
  name: string;
  age: number;
  weight: number;
  height?: number; // cm
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  gender?: string;
  goal: string;
  intensity: string;
  targetWeight?: number;
  availableEquipment?: string[];
  daysPerWeek?: number;
  workoutDurationMins?: number;
  limitationsOrInjuries?: string;
  created_at: string;
}

export interface PlanRecord {
  id: number;
  user_id: number;
  original_plan: string;
  updated_plan: string | null;
  nutrition_tip: string | null;
  last_feedback: string | null;
  created_at: string;
  updated_at: string;
}

export interface NutritionPlan {
  dailyCalories?: number;
  proteinGrams?: number;
  carbGrams?: number;
  fatGrams?: number;
  mealSuggestions?: {
    meal: string;
    description: string;
    macros?: string;
  }[];
  guidelines?: string[];
  hydrationTarget?: string;
}

export interface ExerciseGuide {
  id: string;
  name: string;
  category: 'strength' | 'cardio' | 'mobility' | 'core';
  targetMuscles: string[];
  equipment: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  instructions: string[];
  formTips: string[];
  mistakesToAvoid: string[];
  alternatives: string[]; // Exercise Alternatives feature
}

export interface WorkoutLogEntry {
  id: string;
  userId: number;
  date: string;
  title: string;
  durationMins: number;
  caloriesBurned: number;
  notes?: string;
  completedExercises: string[];
  perceivedExertion: number; // 1-10
}

export interface MeasurementEntry {
  id: string;
  userId: number;
  date: string;
  weight: number;
  bodyFatPercent?: number;
  chestCm?: number;
  waistCm?: number;
  hipsCm?: number;
  bicepsCm?: number;
  thighsCm?: number;
}

export interface ScheduleItem {
  id: string;
  userId: number;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  time: string; // e.g., "07:30"
  activity: string;
  durationMins: number;
  completed?: boolean;
}

export interface ReminderSetting {
  id: string;
  userId: number;
  dayOfWeek: string;
  time: string;
  title: string;
  message: string;
  enabled: boolean;
}

export interface ChatMessage {
  id: string;
  userId: number;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface UserWithPlan extends UserProfile {
  original_plan: string | null;
  updated_plan: string | null;
  nutrition_tip: string | null;
  last_feedback: string | null;
  updated_at: string | null;
}

interface DatabaseState {
  users: UserProfile[];
  plans: PlanRecord[];
  workoutLogs: WorkoutLogEntry[];
  measurements: MeasurementEntry[];
  schedules: ScheduleItem[];
  reminders: ReminderSetting[];
  chatHistory: ChatMessage[];
}

const DB_FILE = path.resolve(process.cwd(), 'fitness_app.json');

const INITIAL_STATE: DatabaseState = {
  users: [
    {
      id: 101,
      name: "Marcus Vance",
      age: 28,
      weight: 78.5,
      height: 180,
      gender: "Male",
      fitnessLevel: "advanced",
      goal: "muscle gain",
      intensity: "high",
      targetWeight: 82.0,
      availableEquipment: ["Full Gym", "Barbells", "Dumbbells", "Cables"],
      daysPerWeek: 5,
      workoutDurationMins: 60,
      limitationsOrInjuries: "None",
      created_at: new Date(Date.now() - 86400000 * 30).toISOString()
    },
    {
      id: 102,
      name: "Sophia Chen",
      age: 32,
      weight: 62.0,
      height: 165,
      gender: "Female",
      fitnessLevel: "intermediate",
      goal: "weight loss",
      intensity: "medium",
      targetWeight: 58.0,
      availableEquipment: ["Dumbbells", "Resistance Bands", "Yoga Mat", "Treadmill"],
      daysPerWeek: 4,
      workoutDurationMins: 45,
      limitationsOrInjuries: "Mild lower back stiffness",
      created_at: new Date(Date.now() - 86400000 * 20).toISOString()
    },
    {
      id: 103,
      name: "Jordan Hayes",
      age: 24,
      weight: 70.0,
      height: 175,
      gender: "Non-binary",
      fitnessLevel: "beginner",
      goal: "general fitness",
      intensity: "medium",
      targetWeight: 72.0,
      availableEquipment: ["Bodyweight Only", "Pull-up Bar"],
      daysPerWeek: 3,
      workoutDurationMins: 35,
      limitationsOrInjuries: "None",
      created_at: new Date(Date.now() - 86400000 * 5).toISOString()
    }
  ],
  plans: [
    {
      id: 1,
      user_id: 101,
      original_plan: `Day 1: Chest & Triceps Hypertrophy
Warm-up: 5–10 mins arm circles, band pull-aparts, push-up walkouts
Main Workout:
- Barbell Bench Press: 4 sets x 8 reps - 90s rest, explosive concentric
- Incline Dumbbell Press: 3 sets x 10 reps - 75s rest, deep pec stretch
- Dips (Weighted if possible): 3 sets x 10 reps - 60s rest
- Cable Triceps Pushdowns: 3 sets x 12-15 reps - 45s rest
Cooldown: 5 mins chest door-frame stretches, triceps overhead stretches

Day 2: Back & Biceps Hypertrophy
Warm-up: 5–10 mins foam rolling upper back, cat-cow, dead hangs
Main Workout:
- Conventional Deadlifts: 3 sets x 6 reps - 2 mins rest
- Lat Pulldowns or Pull-ups: 4 sets x 8 reps - 75s rest
- Chest-Supported Rows: 3 sets x 10 reps - 60s rest
- Incline Dumbbell Curls: 3 sets x 12 reps - 45s rest
Cooldown: 5 mins child's pose, lat hangs, deep breathing

Day 3: Quad & Calves Focus
Warm-up: 5–10 mins bodyweight squats, ankle mobility, hip openers
Main Workout:
- Barbell Back Squats: 4 sets x 8 reps - 2 mins rest
- Romanian Deadlifts: 3 sets x 10 reps - 90s rest
- Leg Extensions: 3 sets x 15 reps - 45s rest
- Standing Calf Raises: 4 sets x 15 reps - 30s rest
Cooldown: 5 mins quad couch stretch, hamstring stretch, foam roll IT band

Day 4: Rest & Active Recovery
Warm-up: 10 mins easy walk or light cycling
Main Workout:
- Light 20 min walk outdoors
- Mobility routine: 90/90 hip switches, thoracic spine openers
Cooldown: 10 mins diaphragmatic box breathing

Day 5: Shoulders & Abs
Warm-up: 5–10 mins shoulder dislocates with PVC pipe, prone Y-T-W
Main Workout:
- Standing Overhead Press: 4 sets x 8 reps - 90s rest
- Dumbbell Lateral Raises: 4 sets x 12-15 reps - 45s rest
- Face Pulls with Rope: 3 sets x 15 reps - 45s rest
- Hanging Leg Raises: 3 sets x 12 reps - 45s rest
Cooldown: 5 mins cross-body shoulder stretch, cobra pose

Day 6: Hamstrings, Glutes & Arms
Warm-up: 5–10 mins glute bridges, high knees, light kettlebell swings
Main Workout:
- Barbell Hip Thrusts: 4 sets x 10 reps - 90s rest
- Seated Hamstring Curls: 3 sets x 12 reps - 60s rest
- EZ-Bar Skull Crushers: 3 sets x 12 reps - 45s rest
- Hammer Curls: 3 sets x 12 reps - 45s rest
Cooldown: 5 mins pigeon pose, figure-4 glute stretch

Day 7: Full Body Conditioning & Recovery
Warm-up: 10 mins joint circles and dynamic mobility
Main Workout:
- Moderate 30 min recovery swim or brisk trail walk
Cooldown: 10 mins full-body foam rolling and hydration focus`,
      updated_plan: `[REVISION SUMMARY: Added 15 minutes of dedicated restorative yoga and thoracic mobility work on Day 4 & Day 7 as requested by client feedback.]

Day 1: Chest & Triceps Hypertrophy
Warm-up: 5–10 mins arm circles, band pull-aparts, push-up walkouts
Main Workout:
- Barbell Bench Press: 4 sets x 8 reps - 90s rest, explosive concentric
- Incline Dumbbell Press: 3 sets x 10 reps - 75s rest, deep pec stretch
- Dips (Weighted if possible): 3 sets x 10 reps - 60s rest
- Cable Triceps Pushdowns: 3 sets x 12-15 reps - 45s rest
Cooldown: 5 mins chest door-frame stretches, triceps overhead stretches

Day 2: Back & Biceps Hypertrophy
Warm-up: 5–10 mins foam rolling upper back, cat-cow, dead hangs
Main Workout:
- Conventional Deadlifts: 3 sets x 6 reps - 2 mins rest
- Lat Pulldowns or Pull-ups: 4 sets x 8 reps - 75s rest
- Chest-Supported Rows: 3 sets x 10 reps - 60s rest
- Incline Dumbbell Curls: 3 sets x 12 reps - 45s rest
Cooldown: 5 mins child's pose, lat hangs, deep breathing

Day 3: Quad & Calves Focus
Warm-up: 5–10 mins bodyweight squats, ankle mobility, hip openers
Main Workout:
- Barbell Back Squats: 4 sets x 8 reps - 2 mins rest
- Romanian Deadlifts: 3 sets x 10 reps - 90s rest
- Leg Extensions: 3 sets x 15 reps - 45s rest
- Standing Calf Raises: 4 sets x 15 reps - 30s rest
Cooldown: 5 mins quad couch stretch, hamstring stretch, foam roll IT band

Day 4: Rest & Dedicated Restorative Yoga (Updated)
Warm-up: 5 mins gentle diaphragmatic breathing
Main Workout:
- 15 mins Restorative Yoga Flow (Downward Dog, Warrior I/II, Lizard Pose)
- Light 20 min walk outdoors
Cooldown: 10 mins Savasana and gentle spinal twists

Day 5: Shoulders & Abs
Warm-up: 5–10 mins shoulder dislocates with PVC pipe, prone Y-T-W
Main Workout:
- Standing Overhead Press: 4 sets x 8 reps - 90s rest
- Dumbbell Lateral Raises: 4 sets x 12-15 reps - 45s rest
- Face Pulls with Rope: 3 sets x 15 reps - 45s rest
- Hanging Leg Raises: 3 sets x 12 reps - 45s rest
Cooldown: 5 mins cross-body shoulder stretch, cobra pose

Day 6: Hamstrings, Glutes & Arms
Warm-up: 5–10 mins glute bridges, high knees, light kettlebell swings
Main Workout:
- Barbell Hip Thrusts: 4 sets x 10 reps - 90s rest
- Seated Hamstring Curls: 3 sets x 12 reps - 60s rest
- EZ-Bar Skull Crushers: 3 sets x 12 reps - 45s rest
- Hammer Curls: 3 sets x 12 reps - 45s rest
Cooldown: 5 mins pigeon pose, figure-4 glute stretch

Day 7: Full Body Recovery & Vinyasa Flow (Updated)
Warm-up: 5 mins Cat-Cow and Child's Pose
Main Workout:
- 15 mins Hip Opening Yoga Flow (Pigeon, Low Lunge, Happy Baby)
- 20 mins light recovery swim or low-impact cycling
Cooldown: 10 mins full-body foam rolling and hydration focus`,
      nutrition_tip: "For optimal muscle protein synthesis, aim for 1.8 to 2.2 grams of protein per kilogram of bodyweight daily, spaced across 4 balanced meals with 35-45g each.",
      last_feedback: "Add 15 minutes of recovery yoga on rest days",
      created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 15).toISOString()
    },
    {
      id: 2,
      user_id: 102,
      original_plan: `Day 1: Full-Body Fat-Burn Circuit
Warm-up: 5–10 mins jumping jacks, arm swings, high knees
Main Workout:
- Goblet Squats: 3 sets x 12 reps - 45s rest
- Dumbbell Overhead Press: 3 sets x 12 reps - 45s rest
- Kettlebell Swings: 3 sets x 15 reps - 45s rest
- Mountain Climbers: 3 sets x 30 seconds - 30s rest
Cooldown: 5 mins hamstring stretches and gentle quad pulls

Day 2: Steady-State Cardio & Core
Warm-up: 5 mins brisk treadmill walk
Main Workout:
- Incline Treadmill Walk (12% incline, 4.5 km/h): 30 mins
- Plank Holds: 3 sets x 45 seconds - 30s rest
- Bicycle Crunches: 3 sets x 20 reps total - 30s rest
Cooldown: 5 mins cobra stretch and child's pose

Day 3: Lower Body Sculpt
Warm-up: 5–10 mins dynamic lunges and glute bridges
Main Workout:
- Dumbbell Romanian Deadlifts: 3 sets x 12 reps - 60s rest
- Walking Lunges: 3 sets x 10 reps/leg - 60s rest
- Glute Kickbacks (Cable or Band): 3 sets x 15 reps - 30s rest
- Calf Raises: 3 sets x 20 reps - 30s rest
Cooldown: 5 mins figure-4 stretch and butterfly stretch

Day 4: Active Recovery Walk
Warm-up: 5 mins light arm circles
Main Workout:
- 40 mins outdoor brisk walk at steady conversational pace
Cooldown: 5 mins deep belly breathing and calf stretch

Day 5: Upper Body & HIIT Finish
Warm-up: 5–10 mins shoulder dislocates and band pull-aparts
Main Workout:
- Lat Pulldowns: 3 sets x 12 reps - 45s rest
- Dumbbell Chest Press: 3 sets x 12 reps - 45s rest
- Dumbbell Rows: 3 sets x 12 reps - 45s rest
- Tabata Jump Rope or Step-ups: 4 mins (20s on / 10s off)
Cooldown: 5 mins chest opener against wall, triceps stretch

Day 6: Moderate Aerobic Circuit
Warm-up: 5 mins rowing machine easy pace
Main Workout:
- Row / Stationary Bike Intervals: 25 mins alternating 2 min easy / 1 min moderate
- Bird-Dog and Deadbug Core combo: 3 sets x 10 reps per side
Cooldown: 5 mins full body spinal twist

Day 7: Complete Rest & Mobility
Warm-up: 5 mins neck and wrist rolls
Main Workout:
- 20 mins light full-body foam rolling and gentle stretching
Cooldown: 10 mins hydration and relaxation breathing`,
      updated_plan: null,
      nutrition_tip: "Prioritize nutrient-dense whole foods and drink 500ml of cold water 20 minutes before each meal to naturally manage appetite and support fat oxidation.",
      last_feedback: null,
      created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 20).toISOString()
    }
  ],
  workoutLogs: [
    {
      id: "log-1",
      userId: 101,
      date: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
      title: "Chest & Triceps Heavy Day",
      durationMins: 55,
      caloriesBurned: 420,
      notes: "Felt strong on bench press; hit 90kg for sets of 8 cleanly.",
      completedExercises: ["Barbell Bench Press", "Incline Dumbbell Press", "Dips", "Cable Pushdowns"],
      perceivedExertion: 8
    },
    {
      id: "log-2",
      userId: 101,
      date: new Date(Date.now() - 86400000 * 1).toISOString().slice(0, 10),
      title: "Back & Pull-up Focus",
      durationMins: 50,
      caloriesBurned: 390,
      notes: "Strict form on deadlifts, felt good lower back engagement.",
      completedExercises: ["Deadlifts", "Pull-ups", "Chest-Supported Rows", "Incline Curls"],
      perceivedExertion: 7
    },
    {
      id: "log-3",
      userId: 102,
      date: new Date(Date.now() - 86400000 * 3).toISOString().slice(0, 10),
      title: "Full-Body Metabolic Circuit",
      durationMins: 45,
      caloriesBurned: 340,
      notes: "Heart rate was in target zone 3/4 throughout intervals.",
      completedExercises: ["Goblet Squats", "Dumbbell Press", "Kettlebell Swings", "Plank"],
      perceivedExertion: 7
    },
    {
      id: "log-4",
      userId: 102,
      date: new Date(Date.now() - 86400000 * 1).toISOString().slice(0, 10),
      title: "Incline Treadmill Walk & Core",
      durationMins: 40,
      caloriesBurned: 290,
      notes: "Kept 12% incline steady at 4.6 km/h. Feeling energized.",
      completedExercises: ["Incline Treadmill Walk", "Plank Holds", "Bicycle Crunches"],
      perceivedExertion: 6
    }
  ],
  measurements: [
    {
      id: "m-1",
      userId: 101,
      date: new Date(Date.now() - 86400000 * 28).toISOString().slice(0, 10),
      weight: 76.8,
      bodyFatPercent: 14.5,
      chestCm: 102,
      waistCm: 82,
      bicepsCm: 37,
      thighsCm: 58
    },
    {
      id: "m-2",
      userId: 101,
      date: new Date(Date.now() - 86400000 * 14).toISOString().slice(0, 10),
      weight: 77.6,
      bodyFatPercent: 14.0,
      chestCm: 103.5,
      waistCm: 81.5,
      bicepsCm: 37.8,
      thighsCm: 58.5
    },
    {
      id: "m-3",
      userId: 101,
      date: new Date().toISOString().slice(0, 10),
      weight: 78.5,
      bodyFatPercent: 13.8,
      chestCm: 105,
      waistCm: 81,
      bicepsCm: 38.5,
      thighsCm: 59.2
    },
    {
      id: "m-4",
      userId: 102,
      date: new Date(Date.now() - 86400000 * 21).toISOString().slice(0, 10),
      weight: 64.2,
      bodyFatPercent: 26.5,
      waistCm: 74,
      hipsCm: 99
    },
    {
      id: "m-5",
      userId: 102,
      date: new Date().toISOString().slice(0, 10),
      weight: 62.0,
      bodyFatPercent: 24.8,
      waistCm: 71,
      hipsCm: 96.5
    }
  ],
  schedules: [
    { id: "s-1", userId: 101, dayOfWeek: "Monday", time: "07:00", activity: "Chest & Triceps Hypertrophy", durationMins: 60, completed: true },
    { id: "s-2", userId: 101, dayOfWeek: "Tuesday", time: "07:00", activity: "Back & Biceps Hypertrophy", durationMins: 60, completed: true },
    { id: "s-3", userId: 101, dayOfWeek: "Wednesday", time: "07:00", activity: "Quad & Calves Focus", durationMins: 60, completed: false },
    { id: "s-4", userId: 101, dayOfWeek: "Thursday", time: "18:00", activity: "Restorative Yoga & Mobility", durationMins: 35, completed: false },
    { id: "s-5", userId: 101, dayOfWeek: "Friday", time: "07:00", activity: "Shoulders & Abs Blast", durationMins: 55, completed: false },
    { id: "s-6", userId: 101, dayOfWeek: "Saturday", time: "09:00", activity: "Hamstrings, Glutes & Arms", durationMins: 60, completed: false },
    { id: "s-7", userId: 101, dayOfWeek: "Sunday", time: "10:00", activity: "Active Recovery Swim / Walk", durationMins: 45, completed: false }
  ],
  reminders: [
    { id: "r-1", userId: 101, dayOfWeek: "Mon, Wed, Fri", time: "06:30", title: "Morning Workout Reminder", message: "Hydrate and get ready for your strength session!", enabled: true },
    { id: "r-2", userId: 101, dayOfWeek: "Daily", time: "14:00", title: "Hydration & Protein Check", message: "Time for a 500ml water top-up and your afternoon protein intake.", enabled: true },
    { id: "r-3", userId: 102, dayOfWeek: "Tue, Thu, Sat", time: "08:00", title: "Fat-Burn Session Alert", message: "Lace up your trainers for your scheduled HIIT circuit.", enabled: true }
  ],
  chatHistory: [
    {
      id: "c-1",
      userId: 101,
      role: "user",
      content: "What can I substitute for barbell back squats if my knees feel irritated?",
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
      id: "c-2",
      userId: 101,
      role: "model",
      content: "Great question! When knees are sensitive to heavy axial compression, you have several excellent alternatives that spare the patellofemoral joint:\n\n1. **Box Squats or Goblet Squats with a vertical shin angle**: Sitting back onto a bench shifts the torque from the knees onto your hips and glutes.\n2. **Bulgarian Split Squats (Foot Elevated)**: Allows you to place your front foot further out with a vertical shin, cutting down anterior shear stress.\n3. **Leg Press with high foot placement**: Shifts the focus onto hamstrings and glutes while keeping spinal and patellar load under tight control.\n4. **Romanian Deadlifts (RDLs)**: Focuses entirely on the posterior chain without knee flexion beyond 20°.\n\nWould you like me to adapt your Day 3 leg session to incorporate these joint-friendly substitutes?",
      timestamp: new Date(Date.now() - 3600000 * 5 + 2000).toISOString()
    }
  ]
};

function readDb(): DatabaseState {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      return {
        users: parsed.users || INITIAL_STATE.users,
        plans: parsed.plans || INITIAL_STATE.plans,
        workoutLogs: parsed.workoutLogs || INITIAL_STATE.workoutLogs,
        measurements: parsed.measurements || INITIAL_STATE.measurements,
        schedules: parsed.schedules || INITIAL_STATE.schedules,
        reminders: parsed.reminders || INITIAL_STATE.reminders,
        chatHistory: parsed.chatHistory || INITIAL_STATE.chatHistory,
      };
    }
  } catch (err) {
    console.error('Error reading DB, using initial state:', err);
  }
  saveDb(INITIAL_STATE);
  return INITIAL_STATE;
}

function saveDb(data: DatabaseState): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing DB file:', err);
  }
}

// User CRUD
export function save_user(
  userId: number,
  name: string,
  age: number,
  weight: number,
  goal: string,
  intensity: string,
  additional?: Partial<UserProfile>
): UserProfile {
  const db = readDb();
  const existingIndex = db.users.findIndex(u => u.id === Number(userId));
  const now = new Date().toISOString();

  let user: UserProfile;
  if (existingIndex >= 0) {
    user = {
      ...db.users[existingIndex],
      name,
      age: Number(age),
      weight: Number(weight),
      goal,
      intensity,
      ...(additional || {})
    };
    db.users[existingIndex] = user;
  } else {
    user = {
      id: Number(userId),
      name,
      age: Number(age),
      weight: Number(weight),
      goal,
      intensity,
      fitnessLevel: additional?.fitnessLevel || 'intermediate',
      gender: additional?.gender || 'Prefer not to say',
      height: additional?.height || 175,
      targetWeight: additional?.targetWeight || Number(weight),
      availableEquipment: additional?.availableEquipment || ["Full Gym"],
      daysPerWeek: additional?.daysPerWeek || 4,
      workoutDurationMins: additional?.workoutDurationMins || 45,
      limitationsOrInjuries: additional?.limitationsOrInjuries || "None",
      created_at: now,
      ...(additional || {})
    };
    db.users.push(user);
  }

  saveDb(db);
  return user;
}

export function save_plan(
  userId: number,
  originalPlan: string,
  nutritionTip?: string | null
): PlanRecord {
  const db = readDb();
  const existingIndex = db.plans.findIndex(p => p.user_id === Number(userId));
  const now = new Date().toISOString();

  let plan: PlanRecord;
  if (existingIndex >= 0) {
    plan = {
      ...db.plans[existingIndex],
      original_plan: originalPlan,
      updated_plan: null,
      nutrition_tip: nutritionTip !== undefined ? nutritionTip : db.plans[existingIndex].nutrition_tip,
      last_feedback: null,
      updated_at: now
    };
    db.plans[existingIndex] = plan;
  } else {
    plan = {
      id: db.plans.length > 0 ? Math.max(...db.plans.map(p => p.id)) + 1 : 1,
      user_id: Number(userId),
      original_plan: originalPlan,
      updated_plan: null,
      nutrition_tip: nutritionTip || null,
      last_feedback: null,
      created_at: now,
      updated_at: now
    };
    db.plans.push(plan);
  }

  saveDb(db);
  return plan;
}

export function update_plan(
  userId: number,
  updatedPlan: string,
  feedback?: string | null
): PlanRecord | null {
  const db = readDb();
  const existingIndex = db.plans.findIndex(p => p.user_id === Number(userId));
  if (existingIndex === -1) return null;

  const now = new Date().toISOString();
  db.plans[existingIndex] = {
    ...db.plans[existingIndex],
    updated_plan: updatedPlan,
    last_feedback: feedback || db.plans[existingIndex].last_feedback,
    updated_at: now
  };

  saveDb(db);
  return db.plans[existingIndex];
}

export function get_original_plan(userId: number): string | null {
  const db = readDb();
  const plan = db.plans.find(p => p.user_id === Number(userId));
  return plan ? plan.original_plan : null;
}

export function get_user(userId: number): UserProfile | null {
  const db = readDb();
  return db.users.find(u => u.id === Number(userId)) || null;
}

export function get_plan(userId: number): PlanRecord | null {
  const db = readDb();
  return db.plans.find(p => p.user_id === Number(userId)) || null;
}

export function get_all_users(): UserWithPlan[] {
  const db = readDb();
  return db.users.map(u => {
    const plan = db.plans.find(p => p.user_id === u.id);
    return {
      ...u,
      original_plan: plan ? plan.original_plan : null,
      updated_plan: plan ? plan.updated_plan : null,
      nutrition_tip: plan ? plan.nutrition_tip : null,
      last_feedback: plan ? plan.last_feedback : null,
      updated_at: plan ? plan.updated_at : null
    };
  });
}

// Workout Logs CRUD
export function get_workout_logs(userId: number): WorkoutLogEntry[] {
  const db = readDb();
  return db.workoutLogs.filter(w => w.userId === Number(userId));
}

export function add_workout_log(log: Omit<WorkoutLogEntry, 'id'>): WorkoutLogEntry {
  const db = readDb();
  const newEntry: WorkoutLogEntry = {
    ...log,
    id: `log-${Date.now()}`
  };
  db.workoutLogs.unshift(newEntry);
  saveDb(db);
  return newEntry;
}

// Measurements CRUD
export function get_measurements(userId: number): MeasurementEntry[] {
  const db = readDb();
  return db.measurements.filter(m => m.userId === Number(userId));
}

export function add_measurement(entry: Omit<MeasurementEntry, 'id'>): MeasurementEntry {
  const db = readDb();
  const newEntry: MeasurementEntry = {
    ...entry,
    id: `m-${Date.now()}`
  };
  db.measurements.push(newEntry);
  saveDb(db);
  return newEntry;
}

// Schedules CRUD
export function get_schedules(userId: number): ScheduleItem[] {
  const db = readDb();
  return db.schedules.filter(s => s.userId === Number(userId));
}

export function toggle_schedule_item(itemId: string): ScheduleItem | null {
  const db = readDb();
  const item = db.schedules.find(s => s.id === itemId);
  if (item) {
    item.completed = !item.completed;
    saveDb(db);
    return item;
  }
  return null;
}

export function save_schedules(userId: number, items: ScheduleItem[]): ScheduleItem[] {
  const db = readDb();
  db.schedules = db.schedules.filter(s => s.userId !== Number(userId)).concat(items);
  saveDb(db);
  return items;
}

// Reminders CRUD
export function get_reminders(userId: number): ReminderSetting[] {
  const db = readDb();
  return db.reminders.filter(r => r.userId === Number(userId));
}

export function toggle_reminder(reminderId: string): ReminderSetting | null {
  const db = readDb();
  const rem = db.reminders.find(r => r.id === reminderId);
  if (rem) {
    rem.enabled = !rem.enabled;
    saveDb(db);
    return rem;
  }
  return null;
}

export function add_reminder(reminder: Omit<ReminderSetting, 'id'>): ReminderSetting {
  const db = readDb();
  const newRem: ReminderSetting = {
    ...reminder,
    id: `r-${Date.now()}`
  };
  db.reminders.push(newRem);
  saveDb(db);
  return newRem;
}

// Chat Messages CRUD
export function get_chat_history(userId: number): ChatMessage[] {
  const db = readDb();
  return db.chatHistory.filter(c => c.userId === Number(userId));
}

export function add_chat_message(userId: number, role: 'user' | 'model', content: string): ChatMessage {
  const db = readDb();
  const newMsg: ChatMessage = {
    id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId: Number(userId),
    role,
    content,
    timestamp: new Date().toISOString()
  };
  db.chatHistory.push(newMsg);
  saveDb(db);
  return newMsg;
}

export function clear_chat_history(userId: number): void {
  const db = readDb();
  db.chatHistory = db.chatHistory.filter(c => c.userId !== Number(userId));
  saveDb(db);
}

// Reset database
export function reset_database(): void {
  saveDb(INITIAL_STATE);
}
