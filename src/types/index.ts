export interface Exercise {
  id: string;
  name: string;
  description: string;
  category: string;
  equipment: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
}

export interface WorkoutDay {
  day: string;
  exercises: {
    exercise: Exercise;
    sets: number;
    reps: number | string;
    restTime: number;
  }[];
}

export interface TemplateExercise {
  exerciseId: string;
  sets: number;
  reps: string | number;
  restTime: number;
}

export interface TemplateDay {
  name: string;
  exercises: TemplateExercise[];
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description?: string;
  days: TemplateDay[] | WorkoutDay[];
  duration: number;
  difficulty: string;
  equipment: string[];
  frequency?: number;
  goal?: string;
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