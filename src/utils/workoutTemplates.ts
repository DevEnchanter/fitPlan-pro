import { WorkoutPlan } from "../types";
import { exerciseDatabase } from "./exerciseDatabase";

// Function to validate exercise IDs in templates
const validateTemplateExercises = (templates: WorkoutPlan[]): void => {
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
export const workoutTemplates: WorkoutPlan[] = [
  {
    id: "strength-beginner",
    name: "Beginner Strength Routine",
    description: "A simple full-body routine focused on building foundational strength for beginners",
    difficulty: "beginner",
    equipment: ["Dumbbells", "Bench"],
    duration: 45,
    frequency: 3,
    goal: "Strength",
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
  }
];

// Run validation in development environment
if (process.env.NODE_ENV !== 'production') {
  validateTemplateExercises(workoutTemplates);
}

// Function to get a workout template by id
export const getWorkoutTemplateById = (id: string): WorkoutPlan | undefined => {
  return workoutTemplates.find(template => template.id === id);
};

// Function to get workout templates by goal
export const getWorkoutTemplatesByGoal = (goal: string): WorkoutPlan[] => {
  return workoutTemplates.filter(template => 
    template.goal?.toLowerCase() === goal.toLowerCase()
  );
};

// Function to get workout templates by difficulty
export const getWorkoutTemplatesByDifficulty = (difficulty: string): WorkoutPlan[] => {
  return workoutTemplates.filter(template => 
    template.difficulty.toLowerCase() === difficulty.toLowerCase()
  );
};

// Function to get workout templates by equipment
export const getWorkoutTemplatesByEquipment = (equipment: string[]): WorkoutPlan[] => {
  return workoutTemplates.filter(template => 
    equipment.every(item => template.equipment.includes(item))
  );
}; 