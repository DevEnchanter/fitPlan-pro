import { 
  Exercise, 
  WorkoutTemplate, 
  TemplateExercise, 
  TemplateDay, 
  isTemplateDay, 
  isTemplateExercise 
} from "../types";
import { exerciseDatabase } from "./exerciseDatabase";

// Function to validate exercise IDs in templates
const validateTemplateExercises = (templates: WorkoutTemplate[]): void => {
  // Create a set of all valid exercise IDs from the database
  const validExerciseIds = new Set(exerciseDatabase.map(exercise => exercise.id));
  
  // Track missing exercise IDs
  const missingExerciseIds = new Set<string>();
  
  // Check each template
  templates.forEach(template => {
    if (!template.days) return;
    
    template.days.forEach(day => {
      if ('exercises' in day && Array.isArray(day.exercises)) {
        day.exercises.forEach(exercise => {
          // Handle template exercise structure
          if ('exerciseId' in exercise) {
            const exerciseId = exercise.exerciseId;
            if (!validExerciseIds.has(exerciseId)) {
              missingExerciseIds.add(exerciseId);
              console.warn(`Template "${template.name}" references non-existent exercise ID: ${exerciseId}`);
            }
          }
        });
      }
    });
  });
  
  // Log summary of validation
  if (missingExerciseIds.size > 0) {
    console.error(`Found ${missingExerciseIds.size} invalid exercise references in templates: ${Array.from(missingExerciseIds).join(', ')}`);
  } else {
    console.log('All template exercise references are valid!');
  }
};

// Workout routine templates for different fitness goals
export const workoutTemplates: WorkoutTemplate[] = [
  {
    id: "strength-beginner",
    name: "Beginner Strength Routine",
    description: "A simple full-body routine focused on building foundational strength for beginners",
    difficulty: "beginner",
    equipment: ["Dumbbells", "Bench"],
    duration: 45,
    frequency: 3,
    goal: "Strength",
    planDuration: {
      value: 8,
      unit: "weeks"
    },
    days: [
      {
        name: "Day 1 - Full Body",
        exercises: [
          { 
            exerciseId: "db3", // Goblet Squats
            sets: 3, 
            reps: "10-12", 
            restTime: 90 
          },
          { 
            exerciseId: "db1", // Dumbbell Rows
            sets: 3, 
            reps: "10-12", 
            restTime: 90 
          },
          { 
            exerciseId: "db2", // Dumbbell Bench Press
            sets: 3, 
            reps: "10-12", 
            restTime: 90 
          },
          { 
            exerciseId: "bw4", // Plank
            sets: 3, 
            reps: "30 sec", 
            restTime: 60 
          },
          { 
            exerciseId: "bw5", // Mountain Climbers
            sets: 3, 
            reps: "30 sec", 
            restTime: 60 
          }
        ]
      },
      {
        name: "Day 2 - Full Body",
        exercises: [
          { 
            exerciseId: "bw2", // Squats
            sets: 3, 
            reps: "12-15", 
            restTime: 60 
          },
          { 
            exerciseId: "db6", // Dumbbell Bicep Curls
            sets: 3, 
            reps: "10-12", 
            restTime: 60 
          },
          { 
            exerciseId: "db5", // Dumbbell Shoulder Press
            sets: 3, 
            reps: "10-12", 
            restTime: 90 
          },
          { 
            exerciseId: "bw13", // Superman
            sets: 3, 
            reps: "12", 
            restTime: 60 
          },
          { 
            exerciseId: "bw11", // Jump Squats
            sets: 3, 
            reps: "10", 
            restTime: 60 
          }
        ]
      },
      {
        name: "Day 3 - Full Body",
        exercises: [
          { 
            exerciseId: "db7", // Dumbbell Deadlifts
            sets: 3, 
            reps: "10-12", 
            restTime: 90 
          },
          { 
            exerciseId: "bw8", // Dips
            sets: 3, 
            reps: "8-10", 
            restTime: 90 
          },
          { 
            exerciseId: "db12", // Dumbbell Lateral Raises
            sets: 3, 
            reps: "10-12", 
            restTime: 60 
          },
          { 
            exerciseId: "bw10", // Russian Twists
            sets: 3, 
            reps: "12 each side", 
            restTime: 60 
          },
          { 
            exerciseId: "bw5", // Mountain Climbers
            sets: 3, 
            reps: "30 sec", 
            restTime: 60 
          }
        ]
      }
    ]
  },
  {
    id: "hypertrophy-intermediate",
    name: "Muscle Building Split",
    description: "A 4-day split focused on muscle hypertrophy for intermediate lifters",
    difficulty: "intermediate",
    equipment: ["Dumbbells", "Barbell", "Bench", "Cable Machine"],
    duration: 60,
    frequency: 4,
    goal: "Muscle Gain",
    planDuration: {
      value: 12,
      unit: "weeks"
    },
    days: [
      {
        name: "Day 1 - Chest & Triceps",
        exercises: [
          { 
            exerciseId: "db2", // Dumbbell Bench Press
            sets: 4, 
            reps: "8-10", 
            restTime: 90 
          },
          { 
            exerciseId: "db9", // Dumbbell Flyes
            sets: 3, 
            reps: "10-12", 
            restTime: 90 
          },
          { 
            exerciseId: "bw1", // Push-ups
            sets: 3, 
            reps: "12-15", 
            restTime: 60 
          },
          { 
            exerciseId: "bw8", // Dips
            sets: 3, 
            reps: "10-12", 
            restTime: 90 
          }
        ]
      },
      {
        name: "Day 2 - Back & Biceps",
        exercises: [
          { 
            exerciseId: "db1", // Dumbbell Rows
            sets: 4, 
            reps: "8-10", 
            restTime: 90 
          },
          { 
            exerciseId: "db7", // Dumbbell Deadlifts
            sets: 3, 
            reps: "8-10", 
            restTime: 120 
          },
          { 
            exerciseId: "bw7", // Pull-ups (or Assisted Pull-ups)
            sets: 3, 
            reps: "8-10", 
            restTime: 90 
          },
          { 
            exerciseId: "db6", // Dumbbell Bicep Curls
            sets: 3, 
            reps: "10-12", 
            restTime: 60 
          }
        ]
      },
      {
        name: "Day 3 - Legs",
        exercises: [
          { 
            exerciseId: "db3", // Goblet Squats
            sets: 4, 
            reps: "10-12", 
            restTime: 120 
          },
          { 
            exerciseId: "bw3", // Lunges
            sets: 3, 
            reps: "10 each leg", 
            restTime: 90 
          },
          { 
            exerciseId: "db10", // Romanian Deadlift
            sets: 3, 
            reps: "10-12", 
            restTime: 90 
          },
          { 
            exerciseId: "bw9", // Glute Bridges
            sets: 3, 
            reps: "15-20", 
            restTime: 60 
          }
        ]
      },
      {
        name: "Day 4 - Shoulders & Core",
        exercises: [
          { 
            exerciseId: "db5", // Dumbbell Shoulder Press
            sets: 4, 
            reps: "8-10", 
            restTime: 90 
          },
          { 
            exerciseId: "db12", // Dumbbell Lateral Raises
            sets: 3, 
            reps: "12-15", 
            restTime: 60 
          },
          { 
            exerciseId: "db11", // Dumbbell Shrugs
            sets: 3, 
            reps: "12-15", 
            restTime: 60 
          },
          { 
            exerciseId: "bw4", // Plank
            sets: 3, 
            reps: "45-60 sec", 
            restTime: 60 
          },
          { 
            exerciseId: "bw10", // Russian Twists
            sets: 3, 
            reps: "15 each side", 
            restTime: 60 
          }
        ]
      }
    ]
  },
  {
    id: "weight-loss",
    name: "Fat Loss Circuit",
    description: "High-intensity circuit training focused on burning calories and improving conditioning",
    difficulty: "intermediate",
    equipment: ["Dumbbells", "None"],
    duration: 40,
    frequency: 3,
    goal: "Weight Loss",
    planDuration: {
      value: 12,
      unit: "weeks"
    },
    days: [
      {
        name: "Day 1 - Full Body Circuit",
        exercises: [
          { 
            exerciseId: "bw6", // Burpees
            sets: 3, 
            reps: "12", 
            restTime: 30 
          },
          { 
            exerciseId: "db3", // Goblet Squats
            sets: 3, 
            reps: "15", 
            restTime: 30 
          },
          { 
            exerciseId: "bw1", // Push-ups
            sets: 3, 
            reps: "12-15", 
            restTime: 30 
          },
          { 
            exerciseId: "db1", // Dumbbell Rows
            sets: 3, 
            reps: "15", 
            restTime: 30 
          },
          { 
            exerciseId: "bw5", // Mountain Climbers
            sets: 3, 
            reps: "45 sec", 
            restTime: 30 
          }
        ]
      },
      {
        name: "Day 2 - HIIT Training",
        exercises: [
          { 
            exerciseId: "bw11", // Jump Squats
            sets: 4, 
            reps: "20 sec work, 10 sec rest", 
            restTime: 10 
          },
          { 
            exerciseId: "bw5", // Mountain Climbers
            sets: 4, 
            reps: "20 sec work, 10 sec rest", 
            restTime: 10 
          },
          { 
            exerciseId: "bw6", // Burpees
            sets: 4, 
            reps: "20 sec work, 10 sec rest", 
            restTime: 10 
          },
          { 
            exerciseId: "bw3", // Lunges (alternating)
            sets: 4, 
            reps: "20 sec work, 10 sec rest", 
            restTime: 10 
          },
          { 
            exerciseId: "bw1", // Push-ups
            sets: 4, 
            reps: "20 sec work, 10 sec rest", 
            restTime: 10 
          }
        ]
      },
      {
        name: "Day 3 - Metabolic Resistance",
        exercises: [
          { 
            exerciseId: "db7", // Dumbbell Deadlifts
            sets: 3, 
            reps: "15", 
            restTime: 45 
          },
          { 
            exerciseId: "db2", // Dumbbell Bench Press
            sets: 3, 
            reps: "15", 
            restTime: 45 
          },
          { 
            exerciseId: "bw3", // Lunges
            sets: 3, 
            reps: "12 each side", 
            restTime: 45 
          },
          { 
            exerciseId: "db5", // Dumbbell Shoulder Press
            sets: 3, 
            reps: "15", 
            restTime: 45 
          },
          { 
            exerciseId: "bw10", // Russian Twists
            sets: 3, 
            reps: "20 each side", 
            restTime: 45 
          }
        ]
      }
    ]
  },
  {
    id: "home-workout",
    name: "No Equipment Home Workout",
    description: "A bodyweight-only routine perfect for home training with no equipment",
    difficulty: "beginner",
    equipment: ["None"],
    duration: 30,
    frequency: 3,
    goal: "General Fitness",
    planDuration: {
      value: 6,
      unit: "weeks"
    },
    days: [
      {
        name: "Day 1 - Push Focus",
        exercises: [
          { 
            exerciseId: "bw1", // Push-ups
            sets: 3, 
            reps: "8-12", 
            restTime: 60 
          },
          { 
            exerciseId: "bw2", // Squats
            sets: 3, 
            reps: "15", 
            restTime: 60 
          },
          { 
            exerciseId: "bw12", // Pike Push-ups
            sets: 3, 
            reps: "8-10", 
            restTime: 60 
          },
          { 
            exerciseId: "bw4", // Plank
            sets: 3, 
            reps: "30 sec", 
            restTime: 45 
          },
          { 
            exerciseId: "bw6", // Burpees
            sets: 2, 
            reps: "10", 
            restTime: 60 
          }
        ]
      },
      {
        name: "Day 2 - Pull & Core Focus",
        exercises: [
          { 
            exerciseId: "bw15", // Bird Dogs
            sets: 3, 
            reps: "10 each side", 
            restTime: 45 
          },
          { 
            exerciseId: "bw13", // Superman
            sets: 3, 
            reps: "12", 
            restTime: 45 
          },
          { 
            exerciseId: "bw9", // Glute Bridges
            sets: 3, 
            reps: "15", 
            restTime: 45 
          },
          { 
            exerciseId: "bw10", // Russian Twists
            sets: 3, 
            reps: "12 each side", 
            restTime: 45 
          },
          { 
            exerciseId: "bw5", // Mountain Climbers
            sets: 3, 
            reps: "30 sec", 
            restTime: 45 
          }
        ]
      },
      {
        name: "Day 3 - Legs & Cardio",
        exercises: [
          { 
            exerciseId: "bw11", // Jump Squats
            sets: 3, 
            reps: "12", 
            restTime: 60 
          },
          { 
            exerciseId: "bw3", // Lunges
            sets: 3, 
            reps: "10 each leg", 
            restTime: 60 
          },
          { 
            exerciseId: "bw9", // Glute Bridges
            sets: 3, 
            reps: "15", 
            restTime: 45 
          },
          { 
            exerciseId: "bw6", // Burpees
            sets: 3, 
            reps: "8", 
            restTime: 60 
          },
          { 
            exerciseId: "bw4", // Plank
            sets: 3, 
            reps: "30 sec", 
            restTime: 45 
          }
        ]
      }
    ]
  },
  {
    id: "advanced-strength",
    name: "Advanced Strength Program",
    description: "A 5-day strength-focused program for experienced lifters",
    difficulty: "advanced",
    equipment: ["Dumbbells", "Barbell", "Bench", "Pull-up Bar"],
    duration: 75,
    frequency: 5,
    goal: "Strength",
    planDuration: {
      value: 12,
      unit: "weeks"
    },
    days: [
      {
        name: "Day 1 - Heavy Lower Body",
        exercises: [
          { 
            exerciseId: "db3", // Goblet Squats (or Barbell Squats)
            sets: 5, 
            reps: "5", 
            restTime: 180 
          },
          { 
            exerciseId: "db10", // Romanian Deadlift
            sets: 4, 
            reps: "6-8", 
            restTime: 150 
          },
          { 
            exerciseId: "bw3", // Lunges (weighted)
            sets: 3, 
            reps: "8 each leg", 
            restTime: 120 
          },
          { 
            exerciseId: "bw9", // Glute Bridges (weighted)
            sets: 3, 
            reps: "12", 
            restTime: 90 
          }
        ]
      },
      {
        name: "Day 2 - Heavy Upper Push",
        exercises: [
          { 
            exerciseId: "db2", // Dumbbell Bench Press (or Barbell)
            sets: 5, 
            reps: "5", 
            restTime: 180 
          },
          { 
            exerciseId: "db5", // Overhead Press
            sets: 4, 
            reps: "6-8", 
            restTime: 150 
          },
          { 
            exerciseId: "bw8", // Weighted Dips
            sets: 3, 
            reps: "8", 
            restTime: 120 
          },
          { 
            exerciseId: "db12", // Lateral Raises
            sets: 3, 
            reps: "12", 
            restTime: 90 
          }
        ]
      },
      {
        name: "Day 3 - Heavy Upper Pull",
        exercises: [
          { 
            exerciseId: "bw7", // Weighted Pull-ups
            sets: 5, 
            reps: "5", 
            restTime: 180 
          },
          { 
            exerciseId: "db1", // Heavy Dumbbell Rows
            sets: 4, 
            reps: "6-8", 
            restTime: 150 
          },
          { 
            exerciseId: "db6", // Bicep Curls
            sets: 3, 
            reps: "8-10", 
            restTime: 90 
          },
          { 
            exerciseId: "db11", // Shrugs
            sets: 3, 
            reps: "12", 
            restTime: 90 
          }
        ]
      },
      {
        name: "Day 4 - Lower Body Volume",
        exercises: [
          { 
            exerciseId: "db7", // Dumbbell Deadlifts
            sets: 4, 
            reps: "8", 
            restTime: 150 
          },
          { 
            exerciseId: "bw2", // Squats (weighted)
            sets: 4, 
            reps: "10", 
            restTime: 120 
          },
          { 
            exerciseId: "bw14", // Pistol Squats (or progression)
            sets: 3, 
            reps: "5-8 each leg", 
            restTime: 120 
          },
          { 
            exerciseId: "bw11", // Jump Squats (weighted)
            sets: 3, 
            reps: "10", 
            restTime: 90 
          }
        ]
      },
      {
        name: "Day 5 - Upper Body Volume",
        exercises: [
          { 
            exerciseId: "db2", // Dumbbell Bench Press
            sets: 4, 
            reps: "10", 
            restTime: 90 
          },
          { 
            exerciseId: "db1", // Dumbbell Rows
            sets: 4, 
            reps: "10", 
            restTime: 90 
          },
          { 
            exerciseId: "db5", // Shoulder Press
            sets: 3, 
            reps: "10", 
            restTime: 90 
          },
          { 
            exerciseId: "bw4", // Plank
            sets: 3, 
            reps: "60 sec", 
            restTime: 60 
          },
          { 
            exerciseId: "bw10", // Russian Twists
            sets: 3, 
            reps: "15 each side", 
            restTime: 60 
          }
        ]
      }
    ]
  },
  {
    id: "5x5-strength",
    name: "5×5 Strength Program",
    description: "A science-backed strength training method focused on compound movements with 5 sets of 5 reps for maximum strength development. This program emphasizes progressive overload for reliable strength gains.",
    difficulty: "intermediate",
    equipment: ["Barbell", "Bench", "Squat Rack"],
    duration: 60,
    frequency: 3,
    goal: "Strength",
    planDuration: {
      value: 12,
      unit: "weeks"
    },
    days: [
      {
        name: "Workout A",
        exercises: [
          { 
            exerciseId: "bb1", // Barbell Squat
            sets: 5, 
            reps: "5", 
            restTime: 180 
          },
          { 
            exerciseId: "bb2", // Barbell Bench Press
            sets: 5, 
            reps: "5", 
            restTime: 180 
          },
          { 
            exerciseId: "bb3", // Barbell Row
            sets: 5, 
            reps: "5", 
            restTime: 180 
          }
        ]
      },
      {
        name: "Workout B",
        exercises: [
          { 
            exerciseId: "bb1", // Barbell Squat
            sets: 5, 
            reps: "5", 
            restTime: 180 
          },
          { 
            exerciseId: "bb4", // Overhead Press
            sets: 5, 
            reps: "5", 
            restTime: 180 
          },
          { 
            exerciseId: "bb5", // Deadlift
            sets: 1, 
            reps: "5", 
            restTime: 180 
          }
        ]
      }
    ]
  },
  {
    id: "push-pull-legs",
    name: "Push-Pull-Legs Split",
    description: "An evidence-based training split that organizes workouts by movement patterns. Push days work chest, shoulders, and triceps. Pull days target back and biceps. Leg days focus on the lower body. This research-supported approach optimizes recovery between muscle groups.",
    difficulty: "intermediate",
    equipment: ["Barbell", "Dumbbell", "Cable Machine", "Bench"],
    duration: 75,
    frequency: 6,
    goal: "Muscle Gain",
    planDuration: {
      value: 12,
      unit: "weeks"
    },
    days: [
      {
        name: "Push Day (Chest, Shoulders, Triceps)",
        exercises: [
          { 
            exerciseId: "bb2", // Barbell Bench Press
            sets: 4, 
            reps: "8-10", 
            restTime: 120 
          },
          { 
            exerciseId: "db5", // Dumbbell Shoulder Press
            sets: 3, 
            reps: "10-12", 
            restTime: 90 
          },
          { 
            exerciseId: "db9", // Dumbbell Incline Press
            sets: 3, 
            reps: "10-12", 
            restTime: 90 
          },
          { 
            exerciseId: "cb1", // Tricep Pushdown
            sets: 3, 
            reps: "12-15", 
            restTime: 60 
          },
          { 
            exerciseId: "db12", // Lateral Raises
            sets: 3, 
            reps: "12-15", 
            restTime: 60 
          }
        ]
      },
      {
        name: "Pull Day (Back, Biceps)",
        exercises: [
          { 
            exerciseId: "bb5", // Deadlift
            sets: 3, 
            reps: "6-8", 
            restTime: 180 
          },
          { 
            exerciseId: "bb3", // Barbell Row
            sets: 3, 
            reps: "8-10", 
            restTime: 120 
          },
          { 
            exerciseId: "cb3", // Lat Pulldown
            sets: 3, 
            reps: "10-12", 
            restTime: 90 
          },
          { 
            exerciseId: "db13", // Bicep Curls
            sets: 3, 
            reps: "10-12", 
            restTime: 60 
          },
          { 
            exerciseId: "cb4", // Cable Face Pulls
            sets: 3, 
            reps: "12-15", 
            restTime: 60 
          }
        ]
      },
      {
        name: "Legs Day (Quadriceps, Hamstrings, Calves)",
        exercises: [
          { 
            exerciseId: "bb1", // Barbell Squat
            sets: 4, 
            reps: "8-10", 
            restTime: 180 
          },
          { 
            exerciseId: "bb6", // Romanian Deadlift
            sets: 3, 
            reps: "8-10", 
            restTime: 120 
          },
          { 
            exerciseId: "m1", // Leg Press
            sets: 3, 
            reps: "10-12", 
            restTime: 120 
          },
          { 
            exerciseId: "m2", // Leg Extension
            sets: 3, 
            reps: "12-15", 
            restTime: 60 
          },
          { 
            exerciseId: "m3", // Calf Raises
            sets: 4, 
            reps: "15-20", 
            restTime: 60 
          }
        ]
      }
    ]
  },
  {
    id: "upper-lower-split",
    name: "4-Day Upper/Lower Split",
    description: "Training split allowing higher training frequency while providing adequate recovery. Optimized for balanced strength and muscle development.",
    difficulty: "intermediate",
    equipment: ["Barbell", "Dumbbells", "Cable Machine", "Bench"],
    duration: 60,
    frequency: 4,
    goal: "Strength",
    planDuration: {
      value: 10,
      unit: "weeks"
    },
    days: [
      {
        name: "Upper Body A (Strength Focus)",
        exercises: [
          { 
            exerciseId: "bb2", // Bench Press
            sets: 4, 
            reps: "6-8", 
            restTime: 180 
          },
          { 
            exerciseId: "bb7", // Barbell Row
            sets: 4, 
            reps: "6-8", 
            restTime: 180 
          },
          { 
            exerciseId: "bb4", // Overhead Press
            sets: 3, 
            reps: "8-10", 
            restTime: 120 
          },
          { 
            exerciseId: "cb3", // Lat Pulldown
            sets: 3, 
            reps: "8-10", 
            restTime: 120 
          },
          { 
            exerciseId: "db13", // Bicep Curls
            sets: 3, 
            reps: "10-12", 
            restTime: 60 
          },
          { 
            exerciseId: "cb1", // Tricep Pushdowns
            sets: 3, 
            reps: "10-12", 
            restTime: 60 
          }
        ]
      },
      {
        name: "Lower Body A (Strength Focus)",
        exercises: [
          { 
            exerciseId: "bb1", // Barbell Squat
            sets: 4, 
            reps: "6-8", 
            restTime: 180 
          },
          { 
            exerciseId: "bb6", // Romanian Deadlift
            sets: 3, 
            reps: "8-10", 
            restTime: 150 
          },
          { 
            exerciseId: "bw3", // Walking Lunges
            sets: 3, 
            reps: "10 each leg", 
            restTime: 120 
          },
          { 
            exerciseId: "m3", // Calf Raises
            sets: 4, 
            reps: "12-15", 
            restTime: 60 
          },
          { 
            exerciseId: "bw4", // Plank
            sets: 3, 
            reps: "45 sec", 
            restTime: 60 
          }
        ]
      },
      {
        name: "Upper Body B (Hypertrophy Focus)",
        exercises: [
          { 
            exerciseId: "db2", // Incline Dumbbell Press
            sets: 4, 
            reps: "8-12", 
            restTime: 120 
          },
          { 
            exerciseId: "cb5", // Cable Row
            sets: 4, 
            reps: "8-12", 
            restTime: 120 
          },
          { 
            exerciseId: "db12", // Lateral Raises
            sets: 3, 
            reps: "12-15", 
            restTime: 60 
          },
          { 
            exerciseId: "cb4", // Face Pulls
            sets: 3, 
            reps: "12-15", 
            restTime: 60 
          },
          { 
            exerciseId: "db13", // Hammer Curls
            sets: 3, 
            reps: "10-12", 
            restTime: 60 
          },
          { 
            exerciseId: "cb2", // Overhead Tricep Extension
            sets: 3, 
            reps: "10-12", 
            restTime: 60 
          }
        ]
      },
      {
        name: "Lower Body B (Hypertrophy Focus)",
        exercises: [
          { 
            exerciseId: "bb5", // Deadlift
            sets: 4, 
            reps: "6-8", 
            restTime: 180 
          },
          { 
            exerciseId: "m1", // Leg Press
            sets: 3, 
            reps: "10-12", 
            restTime: 120 
          },
          { 
            exerciseId: "m4", // Leg Curl
            sets: 3, 
            reps: "10-12", 
            restTime: 90 
          },
          { 
            exerciseId: "m2", // Leg Extension
            sets: 3, 
            reps: "12-15", 
            restTime: 90 
          },
          { 
            exerciseId: "m3", // Seated Calf Raises
            sets: 4, 
            reps: "15-20", 
            restTime: 60 
          }
        ]
      }
    ]
  },
  {
    id: "full-body-hiit",
    name: "HIIT Full Body Conditioning",
    description: "High-intensity interval training program for improving cardiovascular fitness and fat loss in minimal time.",
    difficulty: "intermediate",
    equipment: ["Kettlebell", "None"],
    duration: 30,
    frequency: 3,
    goal: "Weight Loss",
    planDuration: {
      value: 8,
      unit: "weeks"
    },
    days: [
      {
        name: "Workout A - Tabata Protocol",
        exercises: [
          { 
            exerciseId: "bw6", // Burpees
            sets: 8, 
            reps: "20 sec work, 10 sec rest", 
            restTime: 10
          },
          { 
            exerciseId: "bw3", // Jump Squats
            sets: 8, 
            reps: "20 sec work, 10 sec rest", 
            restTime: 10
          },
          { 
            exerciseId: "bw1", // Push-ups
            sets: 8, 
            reps: "20 sec work, 10 sec rest", 
            restTime: 10
          },
          { 
            exerciseId: "bw5", // Mountain Climbers
            sets: 8, 
            reps: "20 sec work, 10 sec rest", 
            restTime: 10
          }
        ]
      },
      {
        name: "Workout B - EMOM (Every Minute On the Minute)",
        exercises: [
          { 
            exerciseId: "kb1", // Kettlebell Swings
            sets: 10, 
            reps: "15 reps at 0:00 of each minute", 
            restTime: 45
          },
          { 
            exerciseId: "bw2", // Bodyweight Squats
            sets: 10, 
            reps: "15 reps at 0:30 of each minute", 
            restTime: 45
          }
        ]
      },
      {
        name: "Workout C - AMRAP (As Many Rounds As Possible)",
        exercises: [
          { 
            exerciseId: "bw6", // Burpees
            sets: 1, 
            reps: "8 reps per round", 
            restTime: 0
          },
          { 
            exerciseId: "bw3", // Lunges
            sets: 1, 
            reps: "12 reps per round", 
            restTime: 0
          },
          { 
            exerciseId: "bw1", // Push-ups
            sets: 1, 
            reps: "10 reps per round", 
            restTime: 0
          },
          { 
            exerciseId: "bw4", // Plank
            sets: 1, 
            reps: "30 sec per round", 
            restTime: 0
          }
        ]
      }
    ]
  },
  {
    id: "scientific-bodyweight",
    name: "Progressive Calisthenics",
    description: "Bodyweight training progression following principles of progressive overload without equipment. Structured to build strength through increasingly challenging variations.",
    difficulty: "beginner",
    equipment: ["None", "Pull-up Bar"],
    duration: 45,
    frequency: 3,
    goal: "Strength",
    planDuration: {
      value: 16,
      unit: "weeks"
    },
    days: [
      {
        name: "Push Workout (Chest, Shoulders, Triceps)",
        exercises: [
          { 
            exerciseId: "bw1", // Progressive Push-ups
            sets: 3, 
            reps: "8-12", 
            restTime: 90
          },
          { 
            exerciseId: "bw12", // Pike Push-ups
            sets: 3, 
            reps: "8-12", 
            restTime: 90
          },
          { 
            exerciseId: "bw8", // Dips (or bench dips)
            sets: 3, 
            reps: "8-12", 
            restTime: 90
          },
          { 
            exerciseId: "bw13", // Diamond Push-ups
            sets: 3, 
            reps: "8-12", 
            restTime: 90
          }
        ]
      },
      {
        name: "Pull Workout (Back, Biceps)",
        exercises: [
          { 
            exerciseId: "bw10", // Pull-ups or Inverted Rows
            sets: 3, 
            reps: "5-8", 
            restTime: 120
          },
          { 
            exerciseId: "bw14", // Australian Pull-ups
            sets: 3, 
            reps: "8-12", 
            restTime: 90
          },
          { 
            exerciseId: "bw15", // Superman Holds
            sets: 3, 
            reps: "30 sec", 
            restTime: 60
          },
          { 
            exerciseId: "bw16", // Bodyweight Bicep Curls
            sets: 3, 
            reps: "10-15", 
            restTime: 60
          }
        ]
      },
      {
        name: "Legs & Core Workout",
        exercises: [
          { 
            exerciseId: "bw2", // Progressive Squat Variations
            sets: 3, 
            reps: "12-20", 
            restTime: 90
          },
          { 
            exerciseId: "bw3", // Split Squats
            sets: 3, 
            reps: "10-12 per leg", 
            restTime: 90
          },
          { 
            exerciseId: "bw9", // Glute Bridges
            sets: 3, 
            reps: "15-20", 
            restTime: 60
          },
          { 
            exerciseId: "bw4", // Plank Variations
            sets: 3, 
            reps: "30-60 sec", 
            restTime: 60
          },
          { 
            exerciseId: "bw17", // Hanging Leg Raises
            sets: 3, 
            reps: "10-15", 
            restTime: 60
          }
        ]
      }
    ]
  },
  {
    id: "starting-strength",
    name: "Novice Barbell Program",
    description: "Beginner-friendly strength program focusing on barbell compound exercises with linear progression. Ideal for developing foundational strength.",
    difficulty: "beginner",
    equipment: ["Barbell", "Squat Rack", "Bench"],
    duration: 60,
    frequency: 3,
    goal: "Strength",
    planDuration: {
      value: 12,
      unit: "weeks"
    },
    days: [
      {
        name: "Workout A",
        exercises: [
          { 
            exerciseId: "bb1", // Barbell Squat
            sets: 3, 
            reps: "5", 
            restTime: 180
          },
          { 
            exerciseId: "bb2", // Bench Press
            sets: 3, 
            reps: "5", 
            restTime: 180
          },
          { 
            exerciseId: "bb5", // Deadlift
            sets: 1, 
            reps: "5", 
            restTime: 180
          }
        ]
      },
      {
        name: "Workout B",
        exercises: [
          { 
            exerciseId: "bb1", // Barbell Squat
            sets: 3, 
            reps: "5", 
            restTime: 180
          },
          { 
            exerciseId: "bb4", // Overhead Press
            sets: 3, 
            reps: "5", 
            restTime: 180
          },
          { 
            exerciseId: "bb8", // Power Clean
            sets: 5, 
            reps: "3", 
            restTime: 180
          }
        ]
      }
    ]
  }
];

// Run validation in development environment
if (process.env.NODE_ENV !== 'production') {
  validateTemplateExercises(workoutTemplates);
}

// Function to get a workout template by id
export const getWorkoutTemplateById = (id: string): WorkoutTemplate | undefined => {
  return workoutTemplates.find(template => template.id === id);
};

// Function to get workout templates by goal
export const getWorkoutTemplatesByGoal = (goal: string): WorkoutTemplate[] => {
  return workoutTemplates.filter(template => 
    template.goal?.toLowerCase() === goal.toLowerCase()
  );
};

// Function to get workout templates by difficulty
export const getWorkoutTemplatesByDifficulty = (difficulty: string): WorkoutTemplate[] => {
  return workoutTemplates.filter(template => 
    template.difficulty.toLowerCase() === difficulty.toLowerCase()
  );
};

// Function to get workout templates by equipment
export const getWorkoutTemplatesByEquipment = (equipment: string[]): WorkoutTemplate[] => {
  return workoutTemplates.filter(template => 
    template.equipment.every(req => equipment.includes(req))
  );
}; 