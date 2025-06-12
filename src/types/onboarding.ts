export interface FitnessGoal {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface FitnessLevel {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  fitnessGoals: string[];
  fitnessLevel: string;
  height: number;
  weight: number;
  medicalConditions: string[];
  dietaryRestrictions: string[];
  preferredWorkoutTimes: string[];
  preferredTrainingStyle: string[];
}