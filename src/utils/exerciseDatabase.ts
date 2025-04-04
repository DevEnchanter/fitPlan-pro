import { Exercise } from '../types';

// Full exercise database with comprehensive options
export const exerciseDatabase: Exercise[] = [
  // Bodyweight exercises
  {
    id: 'bw1',
    name: 'Push-ups',
    description: 'Classic bodyweight exercise for chest, shoulders, and triceps',
    category: 'Strength',
    equipment: ['None'],
    difficulty: 'beginner',
    instructions: ['Start in plank position with hands shoulder-width apart', 'Lower chest to ground while keeping elbows close to body', 'Push back up to starting position', 'For easier version, do from knees instead of toes']
  },
  {
    id: 'bw2',
    name: 'Squats',
    description: 'Lower body exercise targeting quads, hamstrings and glutes',
    category: 'Strength',
    equipment: ['None'],
    difficulty: 'beginner',
    instructions: ['Stand with feet shoulder-width apart', 'Lower hips down and back as if sitting in a chair', 'Keep chest up and back straight', 'Return to standing position']
  },
  {
    id: 'bw3',
    name: 'Lunges',
    description: 'Unilateral lower body exercise for balance and strength',
    category: 'Strength',
    equipment: ['None'],
    difficulty: 'beginner',
    instructions: ['Step forward with one leg', 'Lower body until both knees form 90-degree angles', 'Push back to standing', 'Repeat with other leg']
  },
  {
    id: 'bw4',
    name: 'Plank',
    description: 'Core stability exercise that works the entire body',
    category: 'Core',
    equipment: ['None'],
    difficulty: 'beginner',
    instructions: ['Support your weight on forearms and toes', 'Keep body in a straight line from head to heels', 'Engage core and hold position for 30-60 seconds', 'For easier version, do from knees instead of toes']
  },
  {
    id: 'bw5',
    name: 'Mountain Climbers',
    description: 'Dynamic exercise for cardio and core',
    category: 'Cardio',
    equipment: ['None'],
    difficulty: 'intermediate',
    instructions: ['Start in a plank position', 'Rapidly bring one knee toward chest, then switch legs', 'Continue alternating legs at a quick pace for 30-60 seconds']
  },
  {
    id: 'bw6',
    name: 'Burpees',
    description: 'Full-body exercise for strength and cardio',
    category: 'Cardio',
    equipment: ['None'],
    difficulty: 'intermediate',
    instructions: ['Start standing, then squat down and place hands on floor', 'Jump feet back into plank position', 'Do a push-up (optional)', 'Jump feet forward to hands', 'Jump up with arms overhead', 'Repeat in a fluid motion']
  },
  {
    id: 'bw7',
    name: 'Pull-ups',
    description: 'Upper body pulling exercise for back and biceps',
    category: 'Strength',
    equipment: ['Pull-up Bar'],
    difficulty: 'advanced',
    instructions: ['Hang from bar with hands shoulder-width apart', 'Pull body up until chin is over the bar', 'Lower body back to starting position with control', 'For easier version, use resistance band for assistance']
  },
  {
    id: 'bw8',
    name: 'Dips',
    description: 'Upper body exercise for chest, shoulders, and triceps',
    category: 'Strength',
    equipment: ['None', 'Bench'],
    difficulty: 'intermediate',
    instructions: ['Support body on parallel bars or bench with arms extended', 'Lower body by bending elbows until upper arms are parallel to ground', 'Push back up to starting position']
  },
  {
    id: 'bw9',
    name: 'Glute Bridges',
    description: 'Lower body exercise targeting glutes and hamstrings',
    category: 'Strength',
    equipment: ['None'],
    difficulty: 'beginner',
    instructions: ['Lie on back with knees bent and feet flat on floor', 'Push hips up toward ceiling while squeezing glutes', 'Lower hips back to starting position']
  },
  {
    id: 'bw10',
    name: 'Russian Twists',
    description: 'Core exercise focusing on obliques',
    category: 'Core',
    equipment: ['None'],
    difficulty: 'intermediate',
    instructions: ['Sit on floor with knees bent and feet slightly elevated', 'Lean back slightly to engage core', 'Twist torso from side to side, touching floor beside hips']
  },
  {
    id: 'bw11',
    name: 'Jump Squats',
    description: 'Explosive lower body exercise for power and cardio',
    category: 'Cardio',
    equipment: ['None'],
    difficulty: 'intermediate',
    instructions: ['Stand with feet shoulder-width apart', 'Perform a squat, then explode upward into a jump', 'Land softly and immediately lower into next squat']
  },
  {
    id: 'bw12',
    name: 'Pike Push-ups',
    description: 'Advanced push-up variation targeting shoulders',
    category: 'Strength',
    equipment: ['None'],
    difficulty: 'advanced',
    instructions: ['Start in a downward dog position with hips high', 'Bend elbows to lower head toward floor', 'Push back up to starting position']
  },
  {
    id: 'bw13',
    name: 'Superman',
    description: 'Back strengthening exercise for lower back and core',
    category: 'Core',
    equipment: ['None'],
    difficulty: 'beginner',
    instructions: ['Lie face down with arms extended overhead', 'Simultaneously lift arms, chest, and legs off floor', 'Hold for 2-3 seconds, then lower back down']
  },
  {
    id: 'bw14',
    name: 'Pistol Squats',
    description: 'Single-leg squat requiring strength and balance',
    category: 'Strength',
    equipment: ['None'],
    difficulty: 'advanced',
    instructions: ['Stand on one leg with other leg extended in front', 'Lower into squat on standing leg', 'Return to standing position without putting other foot down']
  },
  {
    id: 'bw15',
    name: 'Bird Dogs',
    description: 'Core stability exercise for back health',
    category: 'Core',
    equipment: ['None'],
    difficulty: 'beginner',
    instructions: ['Start on hands and knees', 'Simultaneously extend opposite arm and leg', 'Return to starting position and repeat on other side']
  },
  
  // Dumbbell exercises
  {
    id: 'db1',
    name: 'Dumbbell Rows',
    description: 'Upper body pulling exercise for back and biceps',
    category: 'Strength',
    equipment: ['Dumbbells'],
    difficulty: 'intermediate',
    instructions: ['Hinge at hips with dumbbell in hand', 'Keep back flat and core engaged', 'Pull dumbbell to hip', 'Lower and repeat']
  },
  {
    id: 'db2',
    name: 'Dumbbell Bench Press',
    description: 'Upper body pushing exercise for chest, shoulders, and triceps',
    category: 'Strength',
    equipment: ['Dumbbells', 'Bench'],
    difficulty: 'intermediate',
    instructions: ['Lie on bench with dumbbells at chest level', 'Press dumbbells upward until arms are extended', 'Lower dumbbells back to chest']
  },
  {
    id: 'db3',
    name: 'Goblet Squats',
    description: 'Weighted squat variation that targets quads and core',
    category: 'Strength',
    equipment: ['Dumbbells', 'Kettlebells'],
    difficulty: 'intermediate',
    instructions: ['Hold dumbbell or kettlebell close to chest with both hands', 'Perform squat while keeping weight close to body', 'Push through heels to return to standing']
  },
  {
    id: 'db4',
    name: 'Dumbbell Lunges',
    description: 'Lower body exercise with added resistance',
    category: 'Strength',
    equipment: ['Dumbbells'],
    difficulty: 'intermediate',
    instructions: ['Hold dumbbells at sides', 'Step forward with one leg and lower until both knees are at 90 degrees', 'Push back to standing and repeat with other leg']
  },
  {
    id: 'db5',
    name: 'Dumbbell Shoulder Press',
    description: 'Upper body exercise targeting shoulders and triceps',
    category: 'Strength',
    equipment: ['Dumbbells'],
    difficulty: 'intermediate',
    instructions: ['Sit or stand with dumbbells at shoulder height', 'Press dumbbells overhead until arms are extended', 'Lower dumbbells back to shoulders']
  },
  {
    id: 'db6',
    name: 'Dumbbell Bicep Curls',
    description: 'Isolation exercise for biceps',
    category: 'Strength',
    equipment: ['Dumbbells'],
    difficulty: 'beginner',
    instructions: ['Stand with dumbbells at sides', 'Curl dumbbells toward shoulders while keeping elbows close to body', 'Lower dumbbells back to sides']
  },
  {
    id: 'db7',
    name: 'Dumbbell Deadlifts',
    description: 'Full-body exercise focusing on posterior chain',
    category: 'Strength',
    equipment: ['Dumbbells'],
    difficulty: 'intermediate',
    instructions: ['Stand with dumbbells in front of thighs', 'Hinge at hips and lower dumbbells while keeping back straight', 'Push through heels to return to standing']
  },
  {
    id: 'db8',
    name: 'Dumbbell Russian Twists',
    description: 'Weighted core exercise for obliques',
    category: 'Core',
    equipment: ['Dumbbells'],
    difficulty: 'intermediate',
    instructions: ['Sit on floor with knees bent and feet slightly elevated', 'Hold dumbbell with both hands', 'Twist torso from side to side, moving dumbbell across body']
  },
  {
    id: 'db9',
    name: 'Dumbbell Flyes',
    description: 'Chest isolation exercise',
    category: 'Strength',
    equipment: ['Dumbbells', 'Bench'],
    difficulty: 'intermediate',
    instructions: ['Lie on bench with dumbbells extended above chest', 'Lower dumbbells outward in arc motion', 'Return to starting position by bringing dumbbells back together']
  },
  {
    id: 'db10',
    name: 'Dumbbell Romanian Deadlift',
    description: 'Hamstring and lower back exercise',
    category: 'Strength',
    equipment: ['Dumbbells'],
    difficulty: 'intermediate',
    instructions: ['Stand with dumbbells in front of thighs', 'Hinge at hips while keeping legs mostly straight', 'Lower dumbbells toward ground', 'Return to starting position']
  },
  {
    id: 'db11',
    name: 'Dumbbell Shrugs',
    description: 'Upper trap isolation exercise',
    category: 'Strength',
    equipment: ['Dumbbells'],
    difficulty: 'beginner',
    instructions: ['Stand holding dumbbells at sides', 'Elevate shoulders toward ears', 'Hold briefly at top', 'Lower shoulders back down']
  },
  {
    id: 'db12',
    name: 'Dumbbell Lateral Raises',
    description: 'Shoulder exercise targeting medial deltoid',
    category: 'Strength',
    equipment: ['Dumbbells'],
    difficulty: 'intermediate',
    instructions: ['Stand with dumbbells at sides', 'Raise dumbbells out to sides until arms are parallel to floor', 'Lower back to starting position with control']
  },
  {
    id: 'db13',
    name: 'Dumbbell Step-ups',
    description: 'Lower body exercise for legs and glutes',
    category: 'Strength',
    equipment: ['Dumbbells', 'Bench'],
    difficulty: 'intermediate',
    instructions: ['Hold dumbbells at sides', 'Step up onto bench with one foot', 'Bring other foot up onto bench', 'Step back down and repeat']
  },
  {
    id: 'db14',
    name: 'Dumbbell Pullovers',
    description: 'Exercise for lats, chest, and serratus',
    category: 'Strength',
    equipment: ['Dumbbells', 'Bench'],
    difficulty: 'intermediate',
    instructions: ['Lie on bench with single dumbbell held over chest', 'Lower dumbbell behind head in arc motion', 'Return to starting position']
  },
  {
    id: 'db15',
    name: 'Dumbbell Walking Lunges',
    description: 'Dynamic lower body exercise',
    category: 'Strength',
    equipment: ['Dumbbells'],
    difficulty: 'intermediate',
    instructions: ['Hold dumbbells at sides', 'Step forward into lunge position', 'Push off front foot to bring back foot forward into next lunge', 'Continue moving forward']
  },
  
  // Resistance band exercises
  {
    id: 'rb1',
    name: 'Band Pull-Aparts',
    description: 'Upper back and shoulder exercise for posture',
    category: 'Strength',
    equipment: ['Resistance Bands'],
    difficulty: 'beginner',
    instructions: ['Hold band with both hands at chest level', 'Pull band apart until arms are extended to sides', 'Control the return to starting position']
  },
  {
    id: 'rb2',
    name: 'Banded Squats',
    description: 'Resistance squat for glute and leg activation',
    category: 'Strength',
    equipment: ['Resistance Bands'],
    difficulty: 'beginner',
    instructions: ['Place band just above knees', 'Perform squat while pushing knees outward against band', 'Return to standing while maintaining tension']
  },
  {
    id: 'rb3',
    name: 'Banded Rows',
    description: 'Back exercise using resistance bands',
    category: 'Strength',
    equipment: ['Resistance Bands'],
    difficulty: 'beginner',
    instructions: ['Secure band around sturdy object at chest height', 'Step back to create tension in band', 'Pull band toward chest while squeezing shoulder blades together', 'Return to starting position with control']
  },
  {
    id: 'rb4',
    name: 'Banded Chest Press',
    description: 'Chest and triceps exercise with bands',
    category: 'Strength',
    equipment: ['Resistance Bands'],
    difficulty: 'beginner',
    instructions: ['Secure band around back and hold ends in hands', 'Press hands forward until arms are extended', 'Return to starting position with control']
  },
  {
    id: 'rb5',
    name: 'Banded Glute Bridges',
    description: 'Glute exercise with added resistance',
    category: 'Strength',
    equipment: ['Resistance Bands'],
    difficulty: 'beginner',
    instructions: ['Place band just above knees', 'Lie on back with knees bent and feet flat on floor', 'Push hips up while keeping knees pushed outward', 'Lower hips with control']
  },
  {
    id: 'rb6',
    name: 'Banded Lateral Walks',
    description: 'Hip abductor exercise for glute medius',
    category: 'Strength',
    equipment: ['Resistance Bands'],
    difficulty: 'beginner',
    instructions: ['Place band just above ankles', 'Bend knees slightly and maintain tension in band', 'Step sideways while keeping tension in band', 'Continue stepping in one direction, then reverse']
  },
  {
    id: 'rb7',
    name: 'Banded Face Pulls',
    description: 'Rear deltoid and upper back exercise',
    category: 'Strength',
    equipment: ['Resistance Bands'],
    difficulty: 'intermediate',
    instructions: ['Secure band at head height', 'Grasp band with both hands and step back to create tension', 'Pull band toward face with elbows high', 'Return to starting position with control']
  },
  {
    id: 'rb8',
    name: 'Banded Tricep Pushdowns',
    description: 'Isolation exercise for triceps',
    category: 'Strength',
    equipment: ['Resistance Bands'],
    difficulty: 'beginner',
    instructions: ['Secure band overhead', 'Hold band with hands at chest level', 'Push band downward by extending elbows', 'Return to starting position with control']
  },
  {
    id: 'rb9',
    name: 'Banded Bicep Curls',
    description: 'Isolation exercise for biceps using bands',
    category: 'Strength',
    equipment: ['Resistance Bands'],
    difficulty: 'beginner',
    instructions: ['Stand on band with feet shoulder-width apart', 'Grasp ends of band with palms facing forward', 'Curl hands toward shoulders', 'Lower with control']
  },
  {
    id: 'rb10',
    name: 'Banded Shoulder Press',
    description: 'Shoulder exercise with resistance bands',
    category: 'Strength',
    equipment: ['Resistance Bands'],
    difficulty: 'intermediate',
    instructions: ['Stand on band with feet shoulder-width apart', 'Start with band at shoulder height', 'Press hands overhead', 'Return to shoulder level with control']
  },
  
  // Gym equipment exercises
  {
    id: 'gym1',
    name: 'Barbell Squat',
    description: 'Fundamental compound exercise for lower body strength',
    category: 'Strength',
    equipment: ['Barbell'],
    difficulty: 'advanced',
    instructions: ['Position barbell on upper back', 'Squat down with weight on heels', 'Drive through heels to return to standing']
  },
  {
    id: 'gym2',
    name: 'Lat Pulldown',
    description: 'Machine exercise targeting back and biceps',
    category: 'Strength',
    equipment: ['Cable Machine'],
    difficulty: 'intermediate',
    instructions: ['Sit at machine and grip bar wider than shoulder width', 'Pull bar down to chest while keeping torso upright', 'Slowly return bar to starting position']
  },
  {
    id: 'gym3',
    name: 'Leg Press',
    description: 'Machine-based lower body exercise',
    category: 'Strength',
    equipment: ['Leg Press Machine'],
    difficulty: 'intermediate',
    instructions: ['Sit in machine with feet shoulder-width on platform', 'Lower weight by bending knees', 'Push through heels to straighten legs']
  },
  {
    id: 'gym4',
    name: 'Bench Press',
    description: 'Classic chest, shoulder and tricep exercise',
    category: 'Strength',
    equipment: ['Barbell', 'Bench'],
    difficulty: 'advanced',
    instructions: ['Lie on bench with feet flat on floor', 'Grip barbell slightly wider than shoulder width', 'Lower bar to mid-chest', 'Press bar back up to starting position']
  },
  {
    id: 'gym5',
    name: 'Deadlift',
    description: 'Compound exercise for total body strength',
    category: 'Strength',
    equipment: ['Barbell'],
    difficulty: 'advanced',
    instructions: ['Stand with feet hip-width apart and barbell over mid-foot', 'Bend at hips and knees to grip bar', 'Lift bar by driving hips forward', 'Return bar to floor with controlled movement']
  },
  {
    id: 'gym6',
    name: 'Seated Row',
    description: 'Machine exercise for back and biceps',
    category: 'Strength',
    equipment: ['Cable Machine'],
    difficulty: 'intermediate',
    instructions: ['Sit at machine with feet on platform and knees slightly bent', 'Grab handles and pull toward torso', 'Slowly return to starting position']
  },
  {
    id: 'gym7',
    name: 'Leg Curl',
    description: 'Isolation exercise for hamstrings',
    category: 'Strength',
    equipment: ['Resistance Machines'],
    difficulty: 'beginner',
    instructions: ['Lie face down on machine with pad against back of ankles', 'Curl legs toward buttocks', 'Return to starting position with control']
  },
  {
    id: 'gym8',
    name: 'Chest Fly Machine',
    description: 'Isolation exercise for chest',
    category: 'Strength',
    equipment: ['Resistance Machines'],
    difficulty: 'beginner',
    instructions: ['Sit on machine with back against pad', 'Push handles together in front of chest', 'Return to starting position with control']
  },
  {
    id: 'gym9',
    name: 'Barbell Row',
    description: 'Compound exercise for back and biceps',
    category: 'Strength',
    equipment: ['Barbell'],
    difficulty: 'advanced',
    instructions: ['Hinge at hips with slight knee bend', 'Grasp barbell with hands wider than shoulder width', 'Pull barbell to lower ribs', 'Lower bar with control']
  },
  {
    id: 'gym10',
    name: 'Leg Extension',
    description: 'Isolation exercise for quadriceps',
    category: 'Strength',
    equipment: ['Resistance Machines'],
    difficulty: 'beginner',
    instructions: ['Sit on machine with pads on front of ankles', 'Extend legs until straight', 'Return to starting position with control']
  },
  {
    id: 'gym11',
    name: 'Tricep Pushdown',
    description: 'Cable exercise for triceps',
    category: 'Strength',
    equipment: ['Cable Machine'],
    difficulty: 'beginner',
    instructions: ['Stand facing cable machine with rope attachment at head height', 'Grasp rope with both hands', 'Push rope down by extending elbows', 'Return to starting position with control']
  },
  {
    id: 'gym12',
    name: 'Preacher Curl',
    description: 'Bicep isolation exercise with support',
    category: 'Strength',
    equipment: ['Resistance Machines', 'Barbell'],
    difficulty: 'intermediate',
    instructions: ['Sit at preacher bench with arms extended over pad', 'Curl weight toward shoulders', 'Lower with control back to starting position']
  },
  {
    id: 'gym13',
    name: 'Smith Machine Squat',
    description: 'Guided barbell squat variation',
    category: 'Strength',
    equipment: ['Smith Machine'],
    difficulty: 'intermediate',
    instructions: ['Position bar on upper back', 'Unrack weight and squat down', 'Push through heels to return to standing', 'Rack weight at end of set']
  },
  {
    id: 'gym14',
    name: 'Cable Crossover',
    description: 'Cable exercise for chest',
    category: 'Strength',
    equipment: ['Cable Machine'],
    difficulty: 'intermediate',
    instructions: ['Stand between cable stations with pulleys set high', 'Grasp handles and step forward', 'Pull handles together in front of body', 'Return to starting position with control']
  },
  {
    id: 'gym15',
    name: 'Hack Squat',
    description: 'Machine squat variation targeting quads',
    category: 'Strength',
    equipment: ['Resistance Machines'],
    difficulty: 'intermediate',
    instructions: ['Position shoulders under pads and feet on platform', 'Unrack weight and lower body by bending knees', 'Push through heels to return to starting position']
  },
  
  // Cardio exercises
  {
    id: 'cardio1',
    name: 'Jumping Jacks',
    description: 'Full body cardio exercise',
    category: 'Cardio',
    equipment: ['None'],
    difficulty: 'beginner',
    instructions: ['Start with feet together and arms at sides', 'Jump while spreading legs and raising arms overhead', 'Return to starting position and repeat for 1-2 minutes']
  },
  {
    id: 'cardio2',
    name: 'Treadmill Intervals',
    description: 'High-intensity cardio workout',
    category: 'Cardio',
    equipment: ['Treadmill'],
    difficulty: 'intermediate',
    instructions: ['Warm up for 5 minutes at moderate pace', 'Alternate between 30 seconds of fast running and 90 seconds of walking', 'Repeat for 15-20 minutes', 'Cool down for 5 minutes']
  },
  {
    id: 'cardio3',
    name: 'Jump Rope',
    description: 'High-intensity cardio for coordination and endurance',
    category: 'Cardio',
    equipment: ['None'],
    difficulty: 'intermediate',
    instructions: ['Hold rope handles with rope behind you', 'Swing rope overhead and jump over it as it passes under feet', 'Maintain a steady rhythm for 1-3 minutes']
  },
  {
    id: 'cardio4',
    name: 'Rowing Machine',
    description: 'Full-body cardio with minimal impact',
    category: 'Cardio',
    equipment: ['Rowing Machine'],
    difficulty: 'intermediate',
    instructions: ['Sit on machine with feet secured on footplates', 'Grab handle with both hands', 'Push with legs, then pull with back and arms', 'Return to starting position by extending arms, then bending knees']
  },
  {
    id: 'cardio5',
    name: 'High Knees',
    description: 'Cardio exercise for lower body and core',
    category: 'Cardio',
    equipment: ['None'],
    difficulty: 'beginner',
    instructions: ['Stand with feet hip-width apart', 'Run in place while bringing knees toward chest', 'Pump arms in rhythm with legs', 'Continue for 30-60 seconds']
  },
  {
    id: 'cardio6',
    name: 'Elliptical Trainer',
    description: 'Low-impact cardio machine',
    category: 'Cardio',
    equipment: ['Elliptical Machine'],
    difficulty: 'beginner',
    instructions: ['Step onto machine and grasp handles', 'Start pedaling in forward motion', 'Maintain upright posture', 'Adjust resistance as needed']
  },
  {
    id: 'cardio7',
    name: 'Stationary Bike',
    description: 'Low-impact cardio for legs',
    category: 'Cardio',
    equipment: ['Exercise Bike'],
    difficulty: 'beginner',
    instructions: ['Adjust seat height', 'Begin pedaling at comfortable pace', 'Increase resistance for higher intensity', 'Maintain for 15-30 minutes']
  },
  {
    id: 'cardio8',
    name: 'Stair Climber',
    description: 'Lower body cardio machine',
    category: 'Cardio',
    equipment: ['Stair Climber'],
    difficulty: 'intermediate',
    instructions: ['Step onto machine and grasp handrails lightly', 'Begin stepping at comfortable pace', 'Maintain upright posture', 'Continue for 10-20 minutes']
  },
  {
    id: 'cardio9',
    name: 'Kettlebell Swings',
    description: 'Dynamic exercise for cardio and posterior chain',
    category: 'Cardio',
    equipment: ['Kettlebells'],
    difficulty: 'intermediate',
    instructions: ['Stand with feet wider than shoulder-width', 'Hold kettlebell with both hands', 'Hinge at hips and swing kettlebell between legs', 'Thrust hips forward to swing kettlebell to chest height']
  },
  {
    id: 'cardio10',
    name: 'Battle Ropes',
    description: 'Upper body cardio exercise',
    category: 'Cardio',
    equipment: ['Battle Ropes'],
    difficulty: 'intermediate',
    instructions: ['Hold one end of rope in each hand', 'Create alternating waves by rapidly raising and lowering arms', 'Maintain athletic stance with knees slightly bent', 'Continue for 30-60 seconds']
  },
  
  // Core-specific exercises
  {
    id: 'core1',
    name: 'Bicycle Crunches',
    description: 'Core exercise targeting abs and obliques',
    category: 'Core',
    equipment: ['None'],
    difficulty: 'intermediate',
    instructions: ['Lie on back with hands behind head', 'Lift shoulders off ground and bring one knee toward chest', 'Twist to touch elbow to opposite knee', 'Extend leg while bringing other knee in', 'Continue alternating sides']
  },
  {
    id: 'core2',
    name: 'Dead Bug',
    description: 'Core stabilization exercise',
    category: 'Core',
    equipment: ['None'],
    difficulty: 'beginner',
    instructions: ['Lie on back with arms extended toward ceiling', 'Lift legs with knees bent at 90 degrees', 'Lower opposite arm and leg toward floor', 'Return to starting position and repeat on other side']
  },
  {
    id: 'core3',
    name: 'Side Plank',
    description: 'Core exercise for obliques and hip stability',
    category: 'Core',
    equipment: ['None'],
    difficulty: 'intermediate',
    instructions: ['Lie on side with forearm on ground and elbow under shoulder', 'Lift hips to create straight line from head to feet', 'Hold position for 20-30 seconds', 'Repeat on other side']
  },
  {
    id: 'core4',
    name: 'Flutter Kicks',
    description: 'Core exercise targeting lower abs',
    category: 'Core',
    equipment: ['None'],
    difficulty: 'intermediate',
    instructions: ['Lie on back with hands under glutes', 'Lift legs a few inches off ground', 'Rapidly kick legs up and down in small motions', 'Continue for 20-30 seconds']
  },
  {
    id: 'core5',
    name: 'Ab Rollout',
    description: 'Advanced core stability exercise',
    category: 'Core',
    equipment: ['Ab Wheel'],
    difficulty: 'advanced',
    instructions: ['Kneel on floor holding ab wheel in front of knees', 'Roll wheel forward while extending body', 'Use core to pull wheel back to starting position']
  },
  {
    id: 'core6',
    name: 'Hanging Leg Raises',
    description: 'Advanced core exercise for lower abs',
    category: 'Core',
    equipment: ['Pull-up Bar'],
    difficulty: 'advanced',
    instructions: ['Hang from pull-up bar with arms fully extended', 'Engage core and raise legs to 90 degrees', 'Lower legs with control']
  },
  {
    id: 'core7',
    name: 'Reverse Crunch',
    description: 'Core exercise focusing on lower abdominals',
    category: 'Core',
    equipment: ['None'],
    difficulty: 'intermediate',
    instructions: ['Lie on back with knees bent and feet off floor', 'Use abs to lift hips off floor and bring knees toward chest', 'Lower with control to starting position']
  },
  {
    id: 'core8',
    name: 'Pallof Press',
    description: 'Anti-rotation core exercise',
    category: 'Core',
    equipment: ['Cable Machine', 'Resistance Bands'],
    difficulty: 'intermediate',
    instructions: ['Stand perpendicular to cable or band anchor', 'Hold handle at chest level', 'Press hands straight out and resist rotation', 'Return to chest and repeat']
  },
  {
    id: 'core9',
    name: 'Medicine Ball Slams',
    description: 'Dynamic core exercise',
    category: 'Core',
    equipment: ['Medicine Ball'],
    difficulty: 'intermediate',
    instructions: ['Hold medicine ball overhead', 'Forcefully throw ball toward ground using core', 'Catch ball on bounce or pick up and repeat']
  },
  {
    id: 'core10',
    name: 'Windshield Wipers',
    description: 'Advanced rotational core exercise',
    category: 'Core',
    equipment: ['None'],
    difficulty: 'advanced',
    instructions: ['Lie on back with legs extended straight up', 'Lower legs to one side while keeping shoulders on ground', 'Return to center and lower to opposite side']
  },

  // Add kettlebell exercises
  {
    id: 'kb1',
    name: 'Kettlebell Swings',
    description: 'Dynamic exercise for posterior chain and cardio',
    category: 'Strength',
    equipment: ['Kettlebells'],
    difficulty: 'beginner',
    instructions: ['Stand with feet wider than shoulder-width', 'Hold kettlebell with both hands', 'Hinge at hips and swing kettlebell between legs', 'Thrust hips forward to swing kettlebell to chest height']
  },
  {
    id: 'kb2',
    name: 'Kettlebell Goblet Squats',
    description: 'Lower body exercise with kettlebell',
    category: 'Strength',
    equipment: ['Kettlebells'],
    difficulty: 'beginner',
    instructions: ['Hold kettlebell close to chest with both hands', 'Perform squat while keeping weight close to body', 'Push through heels to return to standing']
  },
  {
    id: 'kb3',
    name: 'Kettlebell Clean and Press',
    description: 'Compound exercise for full body strength',
    category: 'Strength',
    equipment: ['Kettlebells'],
    difficulty: 'intermediate',
    instructions: ['Start with kettlebell on ground between feet', 'Pull kettlebell up with one arm in fluid motion to shoulder', 'Press kettlebell overhead', 'Lower back to shoulder then to ground']
  },
  {
    id: 'kb4',
    name: 'Kettlebell Russian Twists',
    description: 'Core exercise using kettlebell',
    category: 'Core',
    equipment: ['Kettlebells'],
    difficulty: 'intermediate',
    instructions: ['Sit on floor with knees bent', 'Hold kettlebell with both hands', 'Lift feet slightly off ground for more challenge', 'Rotate torso side to side, moving kettlebell across body']
  },
  {
    id: 'kb5',
    name: 'Kettlebell Turkish Get-Up',
    description: 'Complex full-body exercise for stability and mobility',
    category: 'Strength',
    equipment: ['Kettlebells'],
    difficulty: 'advanced',
    instructions: ['Lie on back with kettlebell held in one hand above chest', 'Rise to standing position while keeping kettlebell overhead', 'Reverse movement to return to starting position', 'Repeat on other side']
  },
  {
    id: 'kb6',
    name: 'Kettlebell Rows',
    description: 'Back exercise using kettlebell',
    category: 'Pull',
    equipment: ['Kettlebells'],
    difficulty: 'beginner',
    instructions: ['Hinge at hips with kettlebell in one hand', 'Keep back flat and core engaged', 'Pull kettlebell to hip', 'Lower and repeat']
  },
  {
    id: 'kb7',
    name: 'Kettlebell Lunges',
    description: 'Lower body exercise with kettlebell',
    category: 'Legs',
    equipment: ['Kettlebells'],
    difficulty: 'intermediate',
    instructions: ['Hold kettlebell in one or both hands', 'Step forward with one leg and lower until both knees are at 90 degrees', 'Push back to standing and repeat with other leg']
  },
  {
    id: 'kb8',
    name: 'Kettlebell Halos',
    description: 'Shoulder mobility exercise with kettlebell',
    category: 'Push',
    equipment: ['Kettlebells'],
    difficulty: 'beginner',
    instructions: ['Hold kettlebell by the horns (sides of handle) at chest level', 'Rotate kettlebell around head in circular motion', 'Keep core tight and shoulders down', 'Complete circles in both directions']
  },
  {
    id: 'kb9',
    name: 'Kettlebell Deadlifts',
    description: 'Lower body and back exercise with kettlebell',
    category: 'Pull',
    equipment: ['Kettlebells'],
    difficulty: 'beginner',
    instructions: ['Stand with kettlebell between feet', 'Hinge at hips and grab kettlebell with both hands', 'Drive through heels and extend hips to stand', 'Lower kettlebell back to ground with control']
  },
  {
    id: 'kb10',
    name: 'Kettlebell Farmers Carry',
    description: 'Functional exercise for grip and core strength',
    category: 'Strength',
    equipment: ['Kettlebells'],
    difficulty: 'beginner',
    instructions: ['Hold kettlebells at sides', 'Walk forward with shoulders back and core engaged', 'Focus on keeping torso upright', 'Continue for specified distance or time']
  }
];

export default exerciseDatabase; 