import { supabase } from '../utils/supabaseClient';
import {
  MealPlan,
  MealPlanDay,
  Meal,
  FoodItem,
  MealItem,
  MealPlanComment,
  MealPlanCompletion,
  MealPlanWithDays,
  MealPlanFormInput
} from '../types/mealPlanning';

// Meal Plan CRUD operations
export const getMealPlans = async (): Promise<MealPlan[]> => {
  const { data, error } = await supabase
    .from('meal_plans')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching meal plans:', error);
    throw error;
  }

  return data || [];
};

export const getMealPlansByClient = async (clientId: string): Promise<MealPlan[]> => {
  const { data, error } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('client_id', clientId)
    .order('start_date', { ascending: false });

  if (error) {
    console.error('Error fetching client meal plans:', error);
    throw error;
  }

  return data || [];
};

export const getMealPlanById = async (id: string): Promise<MealPlanWithDays | null> => {
  // First get the meal plan
  const { data: mealPlan, error: mealPlanError } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('id', id)
    .single();

  if (mealPlanError) {
    console.error('Error fetching meal plan:', mealPlanError);
    throw mealPlanError;
  }

  if (!mealPlan) return null;

  // Then get all days for this meal plan
  const { data: days, error: daysError } = await supabase
    .from('meal_plan_days')
    .select('*')
    .eq('meal_plan_id', id)
    .order('day_number', { ascending: true });

  if (daysError) {
    console.error('Error fetching meal plan days:', daysError);
    throw daysError;
  }

  // For each day, get all meals
  const daysWithMeals = await Promise.all((days || []).map(async (day) => {
    const { data: meals, error: mealsError } = await supabase
      .from('meals')
      .select('*')
      .eq('meal_plan_day_id', day.id)
      .order('time_of_day', { ascending: true });

    if (mealsError) {
      console.error('Error fetching meals:', mealsError);
      throw mealsError;
    }

    // For each meal, get all meal items
    const mealsWithItems = await Promise.all((meals || []).map(async (meal) => {
      const { data: items, error: itemsError } = await supabase
        .from('meal_items')
        .select('*, food_items(*)')
        .eq('meal_id', meal.id);

      if (itemsError) {
        console.error('Error fetching meal items:', itemsError);
        throw itemsError;
      }

      return {
        ...meal,
        items: items || []
      };
    }));

    return {
      ...day,
      meals: mealsWithItems
    };
  }));

  return {
    ...mealPlan,
    days: daysWithMeals
  };
};

export const createMealPlan = async (mealPlanData: MealPlanFormInput): Promise<MealPlan> => {
  const { data, error } = await supabase
    .from('meal_plans')
    .insert([{
      title: mealPlanData.title,
      description: mealPlanData.description,
      client_id: mealPlanData.client_id,
      created_by: (await supabase.auth.getUser()).data.user?.id,
      start_date: mealPlanData.start_date.toISOString().split('T')[0],
      end_date: mealPlanData.end_date.toISOString().split('T')[0],
      calories_target: mealPlanData.calories_target,
      protein_target: mealPlanData.protein_target,
      carbs_target: mealPlanData.carbs_target,
      fat_target: mealPlanData.fat_target,
      status: 'draft'
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating meal plan:', error);
    throw error;
  }

  return data;
};

export const updateMealPlan = async (id: string, mealPlanData: Partial<MealPlan>): Promise<MealPlan> => {
  const { data, error } = await supabase
    .from('meal_plans')
    .update({
      ...mealPlanData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating meal plan:', error);
    throw error;
  }

  return data;
};

export const deleteMealPlan = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('meal_plans')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting meal plan:', error);
    throw error;
  }
};

// Food Items CRUD operations
export const getFoodItems = async (search: string = '', limit: number = 50): Promise<FoodItem[]> => {
  let query = supabase
    .from('food_items')
    .select('*')
    .order('name', { ascending: true })
    .limit(limit);
  
  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching food items:', error);
    throw error;
  }

  return data || [];
};

export const createFoodItem = async (foodItemData: Partial<FoodItem>): Promise<FoodItem> => {
  const { data, error } = await supabase
    .from('food_items')
    .insert([{
      ...foodItemData,
      created_by: (await supabase.auth.getUser()).data.user?.id
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating food item:', error);
    throw error;
  }

  return data;
};

// Meal Plan Day operations
export const createMealPlanDay = async (
  mealPlanId: string, 
  dayNumber: number, 
  dayDate: Date
): Promise<MealPlanDay> => {
  const { data, error } = await supabase
    .from('meal_plan_days')
    .insert([{
      meal_plan_id: mealPlanId,
      day_number: dayNumber,
      day_date: dayDate.toISOString().split('T')[0]
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating meal plan day:', error);
    throw error;
  }

  return data;
};

// Meal operations
export const createMeal = async (
  mealPlanDayId: string,
  mealData: {
    meal_type: string;
    time_of_day?: string;
    notes?: string;
  }
): Promise<Meal> => {
  const { data, error } = await supabase
    .from('meals')
    .insert([{
      meal_plan_day_id: mealPlanDayId,
      meal_type: mealData.meal_type,
      time_of_day: mealData.time_of_day,
      notes: mealData.notes
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating meal:', error);
    throw error;
  }

  return data;
};

// Meal Item operations
export const createMealItem = async (
  mealId: string,
  mealItemData: {
    food_item_id?: string;
    custom_food_name?: string;
    quantity: number;
    unit: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    notes?: string;
  }
): Promise<MealItem> => {
  const { data, error } = await supabase
    .from('meal_items')
    .insert([{
      meal_id: mealId,
      food_item_id: mealItemData.food_item_id,
      custom_food_name: mealItemData.custom_food_name,
      quantity: mealItemData.quantity,
      unit: mealItemData.unit,
      calories: mealItemData.calories,
      protein: mealItemData.protein,
      carbs: mealItemData.carbs,
      fat: mealItemData.fat,
      notes: mealItemData.notes
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating meal item:', error);
    throw error;
  }

  return data;
};

// Comments operations
export const addMealPlanComment = async (
  mealPlanId: string,
  comment: string
): Promise<MealPlanComment> => {
  const { data, error } = await supabase
    .from('meal_plan_comments')
    .insert([{
      meal_plan_id: mealPlanId,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      comment
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding comment:', error);
    throw error;
  }

  return data;
};

export const getMealPlanComments = async (mealPlanId: string): Promise<MealPlanComment[]> => {
  const { data, error } = await supabase
    .from('meal_plan_comments')
    .select('*, profiles:user_id(*)')
    .eq('meal_plan_id', mealPlanId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }

  return data || [];
};

// Meal completion tracking
export const trackMealCompletion = async (
  mealId: string,
  completed: boolean,
  notes?: string,
  photoUrl?: string
): Promise<MealPlanCompletion> => {
  const { data, error } = await supabase
    .from('meal_plan_completions')
    .insert([{
      meal_id: mealId,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      completed,
      completion_date: completed ? new Date().toISOString() : null,
      notes,
      photo_url: photoUrl
    }])
    .select()
    .single();

  if (error) {
    console.error('Error tracking meal completion:', error);
    throw error;
  }

  return data;
};

// Helper function to calculate nutritional totals
export const calculateMealTotals = async (mealId: string): Promise<void> => {
  // Get all meal items for this meal
  const { data: items, error: itemsError } = await supabase
    .from('meal_items')
    .select('*')
    .eq('meal_id', mealId);

  if (itemsError) {
    console.error('Error fetching meal items:', itemsError);
    throw itemsError;
  }

  // Calculate totals
  const totals = (items || []).reduce((acc, item) => {
    return {
      total_calories: (acc.total_calories || 0) + (item.calories || 0),
      total_protein: (acc.total_protein || 0) + (item.protein || 0),
      total_carbs: (acc.total_carbs || 0) + (item.carbs || 0),
      total_fat: (acc.total_fat || 0) + (item.fat || 0)
    };
  }, {
    total_calories: 0,
    total_protein: 0,
    total_carbs: 0,
    total_fat: 0
  });

  // Update the meal with calculated totals
  const { error: updateError } = await supabase
    .from('meals')
    .update(totals)
    .eq('id', mealId);

  if (updateError) {
    console.error('Error updating meal totals:', updateError);
    throw updateError;
  }
};
