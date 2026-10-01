import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import {
  save_user,
  save_plan,
  update_plan,
  get_original_plan,
  get_user,
  get_plan,
  get_all_users,
  get_workout_logs,
  add_workout_log,
  get_measurements,
  add_measurement,
  get_schedules,
  toggle_schedule_item,
  save_schedules,
  get_reminders,
  toggle_reminder,
  add_reminder,
  get_chat_history,
  add_chat_message,
  clear_chat_history,
  reset_database
} from './server/database.ts';
import {
  generate_workout_gemini,
  generate_nutrition_tip_with_flash,
  generate_full_nutrition_plan,
  update_workout_plan,
  ask_fitness_chatbot,
  get_exercise_alternatives
} from './server/geminiService.ts';

dotenv.config();

const PORT = 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper to check if request expects HTML
const prefersHtml = (req: express.Request) => {
  const accept = req.headers['accept'] || '';
  return accept.includes('text/html') && !req.xhr && !req.headers['x-requested-with'];
};

// ==========================================
// 1. POST /generate-workout & /api/generate-workout
// ==========================================
async function handleGenerateWorkout(req: express.Request, res: express.Response) {
  try {
    const rawUserId = req.body.user_id || req.body.userId || Date.now().toString().slice(-4);
    const userId = parseInt(rawUserId, 10) || 1;
    const username = (req.body.username || req.body.name || 'Athlete').trim();
    const age = parseInt(req.body.age || '25', 10);
    const weight = parseFloat(req.body.weight || '70');
    const height = parseFloat(req.body.height || '175');
    const fitnessLevel = req.body.fitnessLevel || 'intermediate';
    const gender = req.body.gender || 'Prefer not to say';
    const goal = (req.body.goal || 'muscle gain').trim();
    const intensity = (req.body.intensity || 'medium').trim();
    const targetWeight = parseFloat(req.body.targetWeight || weight.toString());
    const availableEquipment = Array.isArray(req.body.availableEquipment) 
      ? req.body.availableEquipment 
      : typeof req.body.availableEquipment === 'string' 
        ? req.body.availableEquipment.split(',').map((s: string) => s.trim()) 
        : ['Full Gym'];
    const daysPerWeek = parseInt(req.body.daysPerWeek || '4', 10);
    const workoutDurationMins = parseInt(req.body.workoutDurationMins || '45', 10);
    const limitationsOrInjuries = req.body.limitationsOrInjuries || 'None';

    // 1. Save user profile into database
    save_user(userId, username, age, weight, goal, intensity, {
      height,
      fitnessLevel,
      gender,
      targetWeight,
      availableEquipment,
      daysPerWeek,
      workoutDurationMins,
      limitationsOrInjuries
    });

    const userInput = {
      user_id: userId,
      username,
      age,
      weight,
      height,
      fitnessLevel,
      gender,
      goal,
      intensity,
      targetWeight,
      availableEquipment,
      daysPerWeek,
      workoutDurationMins,
      limitationsOrInjuries
    };

    // 2. Generate 7-day workout plan using Gemini Pro / Flash
    const workout_plan = await generate_workout_gemini(userInput);

    // 3. Generate nutrition/recovery tip using Gemini Flash
    const nutrition_tip = await generate_nutrition_tip_with_flash(goal, userInput);

    // 4. Save original plan in database
    save_plan(userId, workout_plan, nutrition_tip);

    const responsePayload = {
      success: true,
      user_id: userId,
      username,
      age,
      weight,
      height,
      fitnessLevel,
      goal,
      intensity,
      targetWeight,
      availableEquipment,
      daysPerWeek,
      workoutDurationMins,
      limitationsOrInjuries,
      workout_plan,
      nutrition_tip,
      updated_plan: null,
      feedback: null,
    };

    if (prefersHtml(req)) {
      try {
        const templatePath = path.resolve(process.cwd(), 'templates/result.html');
        let html = fs.readFileSync(templatePath, 'utf-8');
        html = html
          .replace(/\{\{\s*username\s*\}\}/g, username)
          .replace(/\{\{\s*user_id\s*\}\}/g, userId.toString())
          .replace(/\{\{\s*age\s*\}\}/g, age.toString())
          .replace(/\{\{\s*weight\s*\}\}/g, weight.toString())
          .replace(/\{\{\s*goal\s*\}\}/g, goal)
          .replace(/\{\{\s*intensity\s*\}\}/g, intensity)
          .replace(/\{\{\s*workout_plan\s*\}\}/g, workout_plan)
          .replace(/\{\{\s*nutrition_tip\s*\}\}/g, nutrition_tip)
          .replace(/\{%\s*if updated_plan\s*%\}.*?\{%\s*endif\s*%\}/gs, '')
          .replace(/\{%\s*if error\s*%\}.*?\{%\s*endif\s*%\}/gs, '');
        return res.status(200).send(html);
      } catch (err) {
        console.error('Error rendering template:', err);
      }
    }

    return res.json(responsePayload);
  } catch (error: any) {
    console.error('Error in handleGenerateWorkout:', error);
    return res.status(500).json({ success: false, error: error.message || 'Generation failed' });
  }
}

app.post('/api/generate-workout', handleGenerateWorkout);
app.post('/generate-workout', handleGenerateWorkout);

// ==========================================
// 2. POST /submit-feedback & /api/submit-feedback
// ==========================================
async function handleSubmitFeedback(req: express.Request, res: express.Response) {
  try {
    const rawUserId = req.body.user_id || req.body.userId;
    const userId = parseInt(rawUserId, 10);
    const feedback = (req.body.feedback || '').trim();
    const nutritionTip = req.body.nutrition_tip || '';

    if (!userId || !feedback) {
      return res.status(400).json({ success: false, error: 'User ID and feedback are required.' });
    }

    const user = get_user(userId);
    const originalPlan = get_original_plan(userId);

    if (!originalPlan) {
      return res.status(404).json({
        success: false,
        error: `Original plan not found for User #${userId}. Please generate a workout plan first.`,
      });
    }

    // 1. Revise workout plan with Gemini based on user feedback
    const updatedPlanText = await update_workout_plan(originalPlan, feedback);

    // 2. Save updated plan in database (preserving original plan)
    update_plan(userId, updatedPlanText, feedback);

    const responsePayload = {
      success: true,
      user_id: userId,
      username: user ? user.name : 'Athlete',
      age: user ? user.age : 25,
      weight: user ? user.weight : 70,
      goal: user ? user.goal : 'General',
      intensity: user ? user.intensity : 'Medium',
      workout_plan: originalPlan,
      nutrition_tip: nutritionTip || (get_plan(userId)?.nutrition_tip || ''),
      updated_plan: updatedPlanText,
      feedback,
    };

    if (prefersHtml(req)) {
      try {
        const templatePath = path.resolve(process.cwd(), 'templates/result.html');
        let html = fs.readFileSync(templatePath, 'utf-8');
        html = html
          .replace(/\{\{\s*username\s*\}\}/g, user ? user.name : 'Athlete')
          .replace(/\{\{\s*user_id\s*\}\}/g, userId.toString())
          .replace(/\{\{\s*age\s*\}\}/g, user ? user.age.toString() : '25')
          .replace(/\{\{\s*weight\s*\}\}/g, user ? user.weight.toString() : '70')
          .replace(/\{\{\s*goal\s*\}\}/g, user ? user.goal : 'Fitness')
          .replace(/\{\{\s*intensity\s*\}\}/g, user ? user.intensity : 'Medium')
          .replace(/\{\{\s*workout_plan\s*\}\}/g, originalPlan)
          .replace(/\{\{\s*nutrition_tip\s*\}\}/g, responsePayload.nutrition_tip)
          .replace(/\{\{\s*updated_plan\s*\}\}/g, updatedPlanText)
          .replace(/\{\{\s*feedback\s*\}\}/g, feedback)
          .replace(/\{%\s*if updated_plan\s*%\}/g, '')
          .replace(/\{%\s*endif\s*%\}/g, '')
          .replace(/\{%\s*if feedback\s*%\}/g, '')
          .replace(/\{%\s*if error\s*%\}.*?\{%\s*endif\s*%\}/gs, '');
        return res.status(200).send(html);
      } catch (err) {
        console.error('Error rendering template for feedback:', err);
      }
    }

    return res.json(responsePayload);
  } catch (error: any) {
    console.error('Error in handleSubmitFeedback:', error);
    return res.status(500).json({ success: false, error: error.message || 'Feedback revision failed' });
  }
}

app.post('/api/submit-feedback', handleSubmitFeedback);
app.post('/submit-feedback', handleSubmitFeedback);

// ==========================================
// 3. GET /view-all-users & /api/view-all-users
// ==========================================
async function handleViewAllUsers(req: express.Request, res: express.Response) {
  try {
    const users = get_all_users();
    return res.json({ success: true, users });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

app.get('/api/view-all-users', handleViewAllUsers);
app.get('/api/users', handleViewAllUsers);

// ==========================================
// 4. GET /api/users/:id
// ==========================================
app.get('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const user = get_user(userId);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  const plan = get_plan(userId);
  return res.json({
    success: true,
    user: {
      ...user,
      original_plan: plan?.original_plan || null,
      updated_plan: plan?.updated_plan || null,
      nutrition_tip: plan?.nutrition_tip || null,
      last_feedback: plan?.last_feedback || null,
      updated_at: plan?.updated_at || null,
    },
  });
});

// ==========================================
// 5. AI Nutrition Suggestions (Detailed Plan)
// ==========================================
app.get('/api/nutrition-plan/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const user = get_user(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const nutritionPlan = await generate_full_nutrition_plan(user);
    return res.json({ success: true, nutritionPlan });
  } catch (err: any) {
    console.error('Error in /api/nutrition-plan:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 6. Gemini AI Chatbot – Fitness Q&A
// ==========================================
app.post('/api/chat', async (req, res) => {
  try {
    const userId = parseInt(req.body.userId || '101', 10);
    const message = (req.body.message || '').trim();
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message cannot be empty.' });
    }

    const user = get_user(userId);
    // Add user message
    add_chat_message(userId, 'user', message);

    const history = get_chat_history(userId);
    const aiResponse = await ask_fitness_chatbot(message, user, history);

    // Save model message
    const botMsg = add_chat_message(userId, 'model', aiResponse);

    return res.json({
      success: true,
      reply: aiResponse,
      message: botMsg
    });
  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/chat/:userId', (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const messages = get_chat_history(userId);
  return res.json({ success: true, messages });
});

app.delete('/api/chat/:userId', (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  clear_chat_history(userId);
  return res.json({ success: true, message: 'Chat history cleared' });
});

// ==========================================
// 7. Exercise Alternatives Generator
// ==========================================
app.post('/api/exercise-alternatives', async (req, res) => {
  try {
    const { exerciseName, reason, availableEquipment } = req.body;
    if (!exerciseName) {
      return res.status(400).json({ success: false, error: 'Exercise name is required.' });
    }
    const alternatives = await get_exercise_alternatives(exerciseName, reason, availableEquipment);
    return res.json({ success: true, data: alternatives });
  } catch (err: any) {
    console.error('Error in /api/exercise-alternatives:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 8. Progress Tracking: Workout Logs & Measurements
// ==========================================
app.get('/api/workout-logs/:userId', (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const logs = get_workout_logs(userId);
  return res.json({ success: true, logs });
});

app.post('/api/workout-logs', (req, res) => {
  try {
    const { userId, title, durationMins, caloriesBurned, notes, completedExercises, perceivedExertion } = req.body;
    const newLog = add_workout_log({
      userId: parseInt(userId, 10),
      date: req.body.date || new Date().toISOString().slice(0, 10),
      title: title || 'Completed Training Session',
      durationMins: parseInt(durationMins || '45', 10),
      caloriesBurned: parseInt(caloriesBurned || '300', 10),
      notes: notes || '',
      completedExercises: Array.isArray(completedExercises) ? completedExercises : [],
      perceivedExertion: parseInt(perceivedExertion || '7', 10)
    });
    return res.json({ success: true, log: newLog });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/measurements/:userId', (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const measurements = get_measurements(userId);
  return res.json({ success: true, measurements });
});

app.post('/api/measurements', (req, res) => {
  try {
    const { userId, weight, bodyFatPercent, chestCm, waistCm, hipsCm, bicepsCm, thighsCm } = req.body;
    const newEntry = add_measurement({
      userId: parseInt(userId, 10),
      date: req.body.date || new Date().toISOString().slice(0, 10),
      weight: parseFloat(weight),
      bodyFatPercent: bodyFatPercent ? parseFloat(bodyFatPercent) : undefined,
      chestCm: chestCm ? parseFloat(chestCm) : undefined,
      waistCm: waistCm ? parseFloat(waistCm) : undefined,
      hipsCm: hipsCm ? parseFloat(hipsCm) : undefined,
      bicepsCm: bicepsCm ? parseFloat(bicepsCm) : undefined,
      thighsCm: thighsCm ? parseFloat(thighsCm) : undefined
    });
    return res.json({ success: true, measurement: newEntry });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 9. Smart Scheduling & Reminders
// ==========================================
app.get('/api/schedules/:userId', (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const schedules = get_schedules(userId);
  return res.json({ success: true, schedules });
});

app.post('/api/schedules/toggle', (req, res) => {
  const { itemId } = req.body;
  const item = toggle_schedule_item(itemId);
  if (!item) return res.status(404).json({ success: false, error: 'Item not found' });
  return res.json({ success: true, item });
});

app.post('/api/schedules/:userId', (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const { items } = req.body;
  if (!Array.isArray(items)) return res.status(400).json({ success: false, error: 'Items array expected' });
  const saved = save_schedules(userId, items);
  return res.json({ success: true, schedules: saved });
});

app.get('/api/reminders/:userId', (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const reminders = get_reminders(userId);
  return res.json({ success: true, reminders });
});

app.post('/api/reminders/toggle', (req, res) => {
  const { reminderId } = req.body;
  const rem = toggle_reminder(reminderId);
  if (!rem) return res.status(404).json({ success: false, error: 'Reminder not found' });
  return res.json({ success: true, reminder: rem });
});

app.post('/api/reminders', (req, res) => {
  try {
    const { userId, dayOfWeek, time, title, message } = req.body;
    const newRem = add_reminder({
      userId: parseInt(userId, 10),
      dayOfWeek: dayOfWeek || 'Daily',
      time: time || '08:00',
      title: title || 'Workout Reminder',
      message: message || 'Time to train!',
      enabled: true
    });
    return res.json({ success: true, reminder: newRem });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 10. Database Reset & Source Code Explorer
// ==========================================
app.post('/api/reset-db', (req, res) => {
  reset_database();
  return res.json({ success: true, message: 'Database reset to sample state successfully.' });
});

const SOURCE_FILES = [
  { name: 'gemini_generator.py', category: 'Gemini Logic', desc: 'Workout Plan Generation (Gemini Pro/Flash)' },
  { name: 'gemini_flash_generator.py', category: 'Gemini Logic', desc: 'Nutrition Tip Generation (Gemini Flash)' },
  { name: 'updated_plan.py', category: 'Gemini Logic', desc: 'Feedback-Based Plan Updating' },
  { name: 'database.py', category: 'Database', desc: 'SQLAlchemy Models & User/Plan Storage' },
  { name: 'routes.py', category: 'Routing', desc: 'FastAPI Routes & Pydantic Validation' },
  { name: 'app.py', category: 'Routing', desc: 'FastAPI / Uvicorn Server Entry' },
  { name: 'templates/index.html', category: 'Frontend Templates', desc: 'HTML Input Form with Form Binding' },
  { name: 'templates/result.html', category: 'Frontend Templates', desc: 'Plan Output with <pre> Blocks & Feedback Form' },
  { name: 'templates/all_users.html', category: 'Frontend Templates', desc: 'Admin View of All Users & Plan Versions' },
  { name: 'requirements.txt', category: 'Config', desc: 'Python Dependencies for the Lab Activity' },
];

app.get('/api/source-files', (req, res) => {
  try {
    const files = SOURCE_FILES.map(item => {
      const fullPath = path.resolve(process.cwd(), item.name);
      let content = '';
      if (fs.existsSync(fullPath)) {
        content = fs.readFileSync(fullPath, 'utf-8');
      }
      return {
        ...item,
        content,
      };
    });
    return res.json({ success: true, files });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 11. Start Server & Mount Vite Middleware
// ==========================================
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.use('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FitBuddy-AI Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
