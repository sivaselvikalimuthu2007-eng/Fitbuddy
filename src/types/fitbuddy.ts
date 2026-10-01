export interface UserProfile {
  id: number;
  name: string;
  age: number;
  weight: number;
  height?: number;
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

export interface CurrentPlanResult {
  user_id: number;
  username: string;
  age: number;
  weight: number;
  goal: string;
  intensity: string;
  workout_plan: string;
  nutrition_tip: string;
  updated_plan: string | null;
  feedback: string | null;
}

export interface UserRecord extends UserProfile {
  original_plan: string | null;
  updated_plan: string | null;
  nutrition_tip: string | null;
  last_feedback: string | null;
  updated_at: string | null;
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
  perceivedExertion: number;
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
  dayOfWeek: string;
  time: string;
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

export interface NutritionPlan {
  dailyCalories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  hydrationTarget: string;
  guidelines: string[];
  mealSuggestions: {
    meal: string;
    description: string;
    macros: string;
  }[];
}
