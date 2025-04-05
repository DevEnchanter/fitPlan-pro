export interface Exercise {
  id: string;
  name: string;
  description: string;
  category: string;
  equipment: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
}

// Exercise instance in a workout
export interface WorkoutExercise {
  exercise: Exercise;
  sets: number;
  reps: number | string;
  restTime: number;
}

// Day in a specific workout
export interface WorkoutDay {
  day: string;
  exercises: WorkoutExercise[];
}

// Exercise reference in a template
export interface TemplateExercise {
  exerciseId: string;
  sets: number;
  reps: string | number;
  restTime: number;
}

// Day in a workout template
export interface TemplateDay {
  name: string;
  exercises: TemplateExercise[];
}

// Common type for either template data or workout data
export type PlanDay = TemplateDay | WorkoutDay;

// Base fields for workout plans
export interface BasePlan {
  id: string;
  name: string;
  description?: string;
  duration: number;
  difficulty: string;
  equipment: string[];
  frequency?: number;
  goal?: string;
}

// Workout template plan
export interface WorkoutTemplate extends BasePlan {
  days: TemplateDay[];
}

// User's workout plan
export interface UserWorkout extends BasePlan {
  days: WorkoutDay[];
}

// Generic workout plan type that can be either a template or a user workout
export type WorkoutPlan = BasePlan & {
  days: PlanDay[];
};

// Helper type guard functions
export function isTemplateDay(day: PlanDay): day is TemplateDay {
  return 'name' in day && !('day' in day);
}

export function isWorkoutDay(day: PlanDay): day is WorkoutDay {
  return 'day' in day;
}

export function isTemplateExercise(exercise: any): exercise is TemplateExercise {
  return 'exerciseId' in exercise;
}

export function isWorkoutExercise(exercise: any): exercise is WorkoutExercise {
  return 'exercise' in exercise;
}

export interface UserPreferences {
  fitnessLevel: string;
  goals: string[];
  workoutEnvironment: string;
  availableEquipment: string[];
  timePerSession: number;
  workoutDays: string[];
  planDuration: {
    value: number;
    unit: 'weeks' | 'months';
  };
} 