import React from 'react';
import { UserPreferences } from '../../types';

interface WorkoutPlanProps {
  workoutEnvironment: 'home' | 'gym' | 'outdoors';
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  equipment: string[];
  workoutDays: string[];
  onClose: () => void;
}

declare const WorkoutPlan: React.FC<WorkoutPlanProps>;

export default WorkoutPlan; 