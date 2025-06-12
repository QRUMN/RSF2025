// Meal Planning Type Definitions

export interface MealPlan {
  id: string;
  title: string;
  description: string | null;
  created_by: string;
  client_id: string;
  start_date: string; // YYYY-MM-DD format
  end_date: string; // YYYY-MM-DD format
  calories_target: number | null;
  protein_target: number | null;
  carbs_target: number | null;
  fat_target: number | null;
  status: 'draft' | 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface MealPlanDay {
  id: string;
  meal_plan_id: string;
  day_number: number;
  day_date: string; // YYYY-MM-DD format
  notes: string | null;
  total_calories: number | null;
  total_protein: number | null;
  total_carbs: number | null;
  total_fat: number | null;
}

export interface Meal {
  id: string;
  meal_plan_day_id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  time_of_day: string | null; // HH:MM format
  notes: string | null;
  total_calories: number | null;
  total_protein: number | null;
  total_carbs: number | null;
  total_fat: number | null;
}

export interface FoodItem {
  id: string;
  name: string;
  category: string | null;
  calories_per_100g: number | null;
  protein_per_100g: number | null;
  carbs_per_100g: number | null;
  fat_per_100g: number | null;
  serving_size: number | null;
  serving_unit: string | null;
  created_by: string;
  is_public: boolean;
  created_at: string;
}

export interface MealItem {
  id: string;
  meal_id: string;
  food_item_id: string | null;
  custom_food_name: string | null;
  quantity: number;
  unit: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  notes: string | null;
}

export interface MealPlanComment {
  id: string;
  meal_plan_id: string;
  user_id: string;
  comment: string;
  created_at: string;
}

export interface MealPlanCompletion {
  id: string;
  meal_id: string;
  user_id: string;
  completed: boolean;
  completion_date: string | null;
  notes: string | null;
  photo_url: string | null;
}

// Extended types with additional information
export interface MealPlanWithClientInfo extends MealPlan {
  client_name: string;
  client_email: string;
}

export interface MealWithItems extends Meal {
  items: MealItem[];
}

export interface MealPlanDayWithMeals extends MealPlanDay {
  meals: MealWithItems[];
}

export interface MealPlanWithDays extends MealPlan {
  days: MealPlanDayWithMeals[];
}

// Form input types
export interface MealPlanFormInput {
  title: string;
  description: string;
  client_id: string;
  start_date: Date;
  end_date: Date;
  calories_target?: number;
  protein_target?: number;
  carbs_target?: number;
  fat_target?: number;
}

export interface MealFormInput {
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  time_of_day?: string;
  notes?: string;
  items: {
    food_item_id?: string;
    custom_food_name?: string;
    quantity: number;
    unit: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    notes?: string;
  }[];
}
