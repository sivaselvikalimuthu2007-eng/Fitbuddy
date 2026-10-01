export interface ExerciseData {
  id: string;
  name: string;
  category: 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Cardio';
  primaryMuscles: string[];
  equipment: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  durationOrReps: string;
  description: string;
  formInstructions: string[];
  safetyTips: string[];
  commonMistakes: string[];
  alternatives: {
    name: string;
    equipment: string;
    benefit: string;
  }[];
}

export const EXERCISE_LIBRARY: ExerciseData[] = [
  {
    id: 'barbell-bench-press',
    name: 'Barbell Bench Press',
    category: 'Chest',
    primaryMuscles: ['Pectoralis Major', 'Anterior Deltoids', 'Triceps Brachii'],
    equipment: 'Barbell & Flat Bench',
    difficulty: 'Intermediate',
    durationOrReps: '3–4 sets of 6–10 reps',
    description: 'The foundational compound horizontal push movement for upper body hypertrophy, pressing strength, and chest development.',
    formInstructions: [
      'Lie flat on the bench with eyes directly under the racked bar. Plant feet flat on the floor.',
      'Grip the bar slightly wider than shoulder-width with wrists stacked straight.',
      'Squeeze shoulder blades back and down into the bench to form a stable base with a slight natural lower back arch.',
      'Unrack and lower the bar under control toward the lower sternum (nipple line), tucking elbows at roughly 45–70 degrees.',
      'Press upward explosively through mid-foot and palms until elbows are locked without flaring shoulders.'
    ],
    safetyTips: [
      'Always use a spotter or set safety pins at chest height when testing heavy weights.',
      'Avoid bouncing the barbell off your ribcage.',
      'Keep your head and buttocks firmly anchored to the bench at all times.'
    ],
    commonMistakes: [
      'Over-flaring elbows to 90 degrees which causes anterior shoulder impingement.',
      'Lifting feet off the floor and losing lower body leg drive.',
      'Hyperextending wrists backwards under heavy loads.'
    ],
    alternatives: [
      { name: 'Dumbbell Flat Press', equipment: 'Dumbbells', benefit: 'Allows natural wrist rotation and independent arm balance.' },
      { name: 'Push-Ups (Deficit or Weighted)', equipment: 'Bodyweight / Plates', benefit: 'Allows the scapulae to freely protract, saving shoulders.' },
      { name: 'Chest Press Machine', equipment: 'Machine', benefit: 'Fixed movement path eliminates stability demands for beginners or fatigued athletes.' }
    ]
  },
  {
    id: 'barbell-back-squat',
    name: 'Barbell Back Squat',
    category: 'Legs',
    primaryMuscles: ['Quadriceps', 'Gluteus Maximus', 'Hamstrings', 'Erector Spinae'],
    equipment: 'Barbell & Squat Rack',
    difficulty: 'Intermediate',
    durationOrReps: '3–4 sets of 6–8 reps',
    description: 'The king of lower body compound exercises, targeting quadriceps, hips, core rigidity, and systemic hormonal response.',
    formInstructions: [
      'Set bar on rack at mid-chest height. Step under and position bar across upper traps (high bar) or rear delts (low bar).',
      'Step out with feet shoulder-width apart, toes flared slightly out (15–30 degrees).',
      'Inhale deep into the belly (Valsalva maneuver) to brace your 360-degree core cylinder.',
      'Break simultaneously at the hips and knees, sitting down and back between your knees while maintaining an upright chest.',
      'Descend until thighs are at least parallel to the floor, then drive through mid-foot to stand up tall.'
    ],
    safetyTips: [
      'Ensure safety spotter arms are adjusted right below your lowest squat depth.',
      'Never round your lumbar spine under axial compression.',
      'Push your knees outwards in the direction of your toes throughout the ascent.'
    ],
    commonMistakes: [
      'Knee valgus (knees caving inward during the ascent).',
      'Rising onto toes due to tight ankle dorsiflexion.',
      'Butt wink / pelvic tilt rounding at the bottom of the rep.'
    ],
    alternatives: [
      { name: 'Goblet Squat (Kettlebell/Dumbbell)', equipment: 'Dumbbell / Kettlebell', benefit: 'Front counterweight makes it easier to stay upright and hits depth without spinal compression.' },
      { name: 'Bulgarian Split Squat', equipment: 'Dumbbells & Bench', benefit: 'Isolates each leg, eliminating left/right strength imbalances and saves lower back.' },
      { name: 'Leg Press Machine', equipment: 'Leg Press Machine', benefit: 'High quad overload with zero spine compressive load.' }
    ]
  },
  {
    id: 'conventional-deadlift',
    name: 'Conventional Barbell Deadlift',
    category: 'Back',
    primaryMuscles: ['Hamstrings', 'Glutes', 'Erector Spinae', 'Latissimus Dorsi', 'Forearms'],
    equipment: 'Barbell & Bumper Plates',
    difficulty: 'Advanced',
    durationOrReps: '3 sets of 5 reps',
    description: 'The ultimate test of posterior chain raw power, hip hinge mechanics, and grip strength.',
    formInstructions: [
      'Stand with feet hip-width apart, barbell cutting your feet directly in half over the mid-foot.',
      'Hinge at hips to grip the bar just outside your shins without moving the bar.',
      'Pull your chest forward, engage your lats (imagine squeezing oranges in your armpits), and take the slack out of the bar.',
      'Drive your feet through the floor, extending knees and hips simultaneously.',
      'Lock out at the top by squeezing your glutes without leaning backwards.'
    ],
    safetyTips: [
      'Do not jerk the bar off the floor; pull tension before initiating the leg drive.',
      'Keep the bar in contact with your shins and thighs throughout the entire path.'
    ],
    commonMistakes: [
      'Rounding the lower back like a scared cat.',
      'Hyperextending the lumbar spine at lockout.',
      'Dropping hips too low turning the deadlift into a squat.'
    ],
    alternatives: [
      { name: 'Trap Bar (Hex Bar) Deadlift', equipment: 'Trap Bar', benefit: 'More upright torso position, center of gravity sits inside the body, reducing lumbar shear.' },
      { name: 'Romanian Deadlift (RDL)', equipment: 'Dumbbells / Barbell', benefit: 'Focuses entirely on hamstring and glute eccentric stretch with lighter loads.' },
      { name: 'Kettlebell Deadlift', equipment: 'Kettlebell', benefit: 'Great beginner-friendly hip hinge progression with minimal setup.' }
    ]
  },
  {
    id: 'overhead-shoulder-press',
    name: 'Overhead Standing Press (OHP)',
    category: 'Shoulders',
    primaryMuscles: ['Anterior Deltoids', 'Lateral Deltoids', 'Triceps', 'Upper Trapezius', 'Core'],
    equipment: 'Barbell or Dumbbells',
    difficulty: 'Intermediate',
    durationOrReps: '3–4 sets of 8–10 reps',
    description: 'Vertical pressing movement building wide shoulders, strong rotator cuff stability, and strict overhead power.',
    formInstructions: [
      'Grip the bar slightly outside shoulders. Rest bar on front clavicles / anterior deltoids.',
      'Squeeze glutes and brace abs tight to prevent lower back arching.',
      'Tilt chin back slightly to clear the bar path and press vertically upward.',
      'Once bar passes forehead, push head forward through the window and lock out overhead with active traps.'
    ],
    safetyTips: [
      'Avoid hyperextending your lower back to fake range of motion.',
      'Keep wrists straight directly over elbows.'
    ],
    commonMistakes: [
      'Turning the standing press into an incline bench press by leaning backward excessively.',
      'Flaring ribs and losing pelvic neutral posture.'
    ],
    alternatives: [
      { name: 'Seated Dumbbell Shoulder Press', equipment: 'Dumbbells & Incline Bench', benefit: 'Back support removes core balance limitation, allowing maximum shoulder overload.' },
      { name: 'Landmine Shoulder Press', equipment: 'Landmine / Barbell in corner', benefit: 'Angled pressing arc is very gentle on stiff shoulder joints and impingements.' },
      { name: 'Pike Push-Ups', equipment: 'Bodyweight', benefit: 'Bodyweight vertical push without needing any weights.' }
    ]
  },
  {
    id: 'pull-ups',
    name: 'Strict Pull-Ups / Chin-Ups',
    category: 'Back',
    primaryMuscles: ['Latissimus Dorsi', 'Teres Major', 'Biceps Brachii', 'Lower Traps'],
    equipment: 'Pull-up Bar',
    difficulty: 'Intermediate',
    durationOrReps: '3–4 sets of 6–12 reps',
    description: 'The golden standard of upper body vertical pulling, creating back width, V-taper, and arm strength.',
    formInstructions: [
      'Hang from bar with hands slightly wider than shoulder-width, palms facing away (overhand) or facing you (chin-up).',
      'Begin from a dead hang with arms fully extended and core braced.',
      'Depress and retract scapulae, then pull elbows down into your back pockets.',
      'Pull until chin clears the bar cleanly with no kicking or swinging.',
      'Lower yourself under 2-3 seconds of controlled eccentric descent.'
    ],
    safetyTips: [
      'Do not crane your neck forward to reach over the bar.',
      'Avoid sudden uncontrolled drops at the bottom that strain shoulder capsules.'
    ],
    commonMistakes: [
      'Kipping or swinging legs to generate momentum.',
      'Only doing half reps and avoiding the bottom full stretch.'
    ],
    alternatives: [
      { name: 'Lat Pulldown (Cable Machine)', equipment: 'Cable Machine', benefit: 'Allows precise weight adjustment below bodyweight for progression.' },
      { name: 'Resistance Band-Assisted Pull-ups', equipment: 'Resistance Loop Band', benefit: 'Mimics the exact pull-up motor pattern with progressive unloading.' },
      { name: 'Inverted Rows (Australian Pull-up)', equipment: 'Smith Machine / TRX / Rings', benefit: 'Horizontal body angle reduces effective load while reinforcing scapular retraction.' }
    ]
  },
  {
    id: 'hiit-kettlebell-swings',
    name: 'Kettlebell Swings (Hardstyle)',
    category: 'Cardio',
    primaryMuscles: ['Glutes', 'Hamstrings', 'Core', 'Cardiovascular System', 'Lats'],
    equipment: 'Kettlebell',
    difficulty: 'Beginner',
    durationOrReps: '4–5 sets of 40s work / 20s rest',
    description: 'Ballistic hip hinge explosive conditioning that incinerates body fat while building athletic posterior chain power.',
    formInstructions: [
      'Stand with feet slightly wider than shoulders, kettlebell 1 foot in front of you.',
      'Hinge hips back with knees soft, grab handle with both hands, and tilt bell towards you.',
      'Hike kettlebell high between legs like a football center hike.',
      'Drive hips forward explosively, snapping glutes and quads to float the bell to chest height.',
      'Let gravity guide the bell down, hinging at the last second to catch it in the hip crease.'
    ],
    safetyTips: [
      'Do not lift the kettlebell with your arms or shoulders; the hip snap provides 100% of momentum.',
      'Maintain a neutral spine throughout the hinge.'
    ],
    commonMistakes: [
      'Squatting the bell instead of hinging hips back.',
      'Letting the bell drop below knees on the backswing.'
    ],
    alternatives: [
      { name: 'Dumbbell Romanian Deadlift to Jump', equipment: 'Dumbbells', benefit: 'Builds explosive triple extension without kettlebell grip fatigue.' },
      { name: 'Rowing Machine Sprints', equipment: 'Rower', benefit: 'Low-impact full body cardiovascular interval with zero joint shock.' },
      { name: 'Medicine Ball Slams', equipment: 'Slam Ball', benefit: 'High explosive metabolic power and abdominal contraction.' }
    ]
  },
  {
    id: 'plank-to-pike',
    name: 'Plank Holds & Dynamic Pike',
    category: 'Core',
    primaryMuscles: ['Rectus Abdominis', 'Transverse Abdominis', 'Obliques', 'Shoulder Stabilizers'],
    equipment: 'Yoga Mat',
    difficulty: 'Beginner',
    durationOrReps: '3 sets of 45–60 seconds hold',
    description: 'Isometric anti-extension core stabilization that protects the spine, improves posture, and creates abdominal definition.',
    formInstructions: [
      'Place forearms on the floor with elbows directly under shoulders.',
      'Extend legs back, balancing on toes. Squeeze glutes and tuck pelvis slightly posterior.',
      'Draw navel in toward spine and maintain a straight line from crown of head to heels.',
      'Breathe steadily through your nose while resisting any sag in the hips.'
    ],
    safetyTips: [
      'Immediately rest if your lower back starts to sag or ache.',
      'Keep head in line with spine; do not look up or let head droop.'
    ],
    commonMistakes: [
      'Piking hips too high in the air.',
      'Holding breath instead of diaphragmatic breathing.'
    ],
    alternatives: [
      { name: 'Deadbug Core Protocol', equipment: 'Mat', benefit: 'Presses lumbar flat into floor, teaching anti-extension safely.' },
      { name: 'Ab Wheel Rollouts', equipment: 'Ab Wheel', benefit: 'Advanced progression offering immense abdominal eccentric tension.' },
      { name: 'Bird-Dog Hold', equipment: 'Mat', benefit: 'Unilateral spinal stabilizer recommended by McGill Big 3.' }
    ]
  }
];
