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
  duration: number; // Duration of each session in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment: string[];
  frequency?: number;
  goal?: string;
  planDuration?: {
    value: number;
    unit: 'weeks' | 'months';
  };
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

export function isTemplateExercise(exercise: object | null): exercise is TemplateExercise {
  return !!exercise && 'exerciseId' in exercise;
}

export function isWorkoutExercise(exercise: object | null): exercise is WorkoutExercise {
  return !!exercise && 'exercise' in exercise;
}

// Use specific literal types
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type WorkoutEnvironment = 'home' | 'gym' | 'outdoors';

export interface UserPreferences {
  fitnessLevel: FitnessLevel;
  goals: string[];
  workoutEnvironment: WorkoutEnvironment;
  availableEquipment: string[];
  timePerSession: number;
  workoutDays: string[];
  planDuration: {
    value: number;
    unit: 'weeks' | 'months';
  };
}

// Type for a single exercise within a user-created custom workout
export type CustomExercise = {
  exercise: Exercise; // Reference to the base Exercise details
  sets: number;
  reps: string; // Reps can be a range like '8-12' or a specific number
  restTime: number; // Rest time in seconds
};

// Type for a user-created custom workout routine
export type CustomWorkout = {
  id: string; // Unique identifier (UUID)
  name: string;
  description: string;
  exercises: CustomExercise[]; // Array of exercises in the workout
  createdAt: string; // ISO date string of creation time
};

export interface WorkoutCalendarEvent {
  id: string;
  date: string;
  title: string;
  type: 'scheduled' | 'template';
  templateId?: string;
} 