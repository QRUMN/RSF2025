import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Apple, Clock, Calendar, MessageCircle, ChevronRight, AlertCircle, Info, ArrowLeft, ArrowRight } from 'lucide-react';
import { Card, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { format, addDays, subDays, parseISO, isToday, isTomorrow } from 'date-fns';

interface MealPlan {
  id: string;
  coach_id: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'archived';
  daily_plans: {
    [date: string]: {
      meals: {
        type: string;
        time: string;
        foods: {
          name: string;
          portion: string;
          calories: number;
          protein: number;
          carbs: number;
          fats: number;
        }[];
        total_calories: number;
        total_protein: number;
        total_carbs: number;
        total_fats: number;
      }[];
      coach_tips: string[];
      total_calories: number;
    };
  };
  coach_notes: string;
  coach: {
    full_name: string;
    title: string;
    avatar_url: string;
  };
}

export const MealPlanSection: React.FC = () => {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    if (user) {
      fetchCurrentMealPlan();
    }
  }, [user]);

  const fetchCurrentMealPlan = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // First check if we have real meal plans in the database
      const { data, error } = await supabase
        .from('meal_plans')
        .select(`
          *,
          coach:coach_id (
            full_name,
            title,
            avatar_url
          )
        `)
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .lte('start_date', today)
        .gte('end_date', today)
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setCurrentPlan(data);
      } else {
        // If no meal plan found, create a sample one for demonstration
        const samplePlan = generateSampleMealPlan(user?.id || '');
        setCurrentPlan(samplePlan);
      }
    } catch (error) {
      console.error('Error fetching meal plan:', error);
      // Create a sample meal plan if there's an error
      const samplePlan = generateSampleMealPlan(user?.id || '');
      setCurrentPlan(samplePlan);
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };
  
  const handlePreviousDay = () => {
    const currentDate = parseISO(selectedDate);
    const newDate = subDays(currentDate, 1);
    const newDateStr = newDate.toISOString().split('T')[0];
    
    // Only allow dates within the meal plan range
    if (currentPlan && newDateStr >= currentPlan.start_date && newDateStr <= currentPlan.end_date) {
      setSelectedDate(newDateStr);
    }
  };
  
  const handleNextDay = () => {
    const currentDate = parseISO(selectedDate);
    const newDate = addDays(currentDate, 1);
    const newDateStr = newDate.toISOString().split('T')[0];
    
    // Only allow dates within the meal plan range
    if (currentPlan && newDateStr >= currentPlan.start_date && newDateStr <= currentPlan.end_date) {
      setSelectedDate(newDateStr);
    }
  };
  
  const formatDateDisplay = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) {
      return 'Today';
    } else if (isTomorrow(date)) {
      return 'Tomorrow';
    } else {
      return format(date, 'EEEE, MMM d');
    }
  };
  
  // Generate a sample meal plan for demonstration purposes
  const generateSampleMealPlan = (userId: string): MealPlan => {
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    
    const endDate = new Date();
    endDate.setDate(today.getDate() + 6); // 7-day meal plan
    
    const dailyPlans: { [key: string]: any } = {};
    
    // Generate 7 days of meal plans
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      dailyPlans[dateStr] = {
        meals: [
          {
            type: 'Breakfast',
            time: '07:30',
            foods: [
              {
                name: 'Greek Yogurt with Berries',
                portion: '1 cup',
                calories: 150,
                protein: 15,
                carbs: 12,
                fats: 5
              },
              {
                name: 'Granola',
                portion: '1/4 cup',
                calories: 120,
                protein: 3,
                carbs: 20,
                fats: 4
              }
            ],
            total_calories: 270,
            total_protein: 18,
            total_carbs: 32,
            total_fats: 9
          },
          {
            type: 'Lunch',
            time: '12:30',
            foods: [
              {
                name: 'Grilled Chicken Salad',
                portion: '1 bowl',
                calories: 350,
                protein: 30,
                carbs: 15,
                fats: 18
              },
              {
                name: 'Whole Grain Bread',
                portion: '1 slice',
                calories: 80,
                protein: 3,
                carbs: 15,
                fats: 1
              }
            ],
            total_calories: 430,
            total_protein: 33,
            total_carbs: 30,
            total_fats: 19
          },
          {
            type: 'Snack',
            time: '15:30',
            foods: [
              {
                name: 'Apple',
                portion: '1 medium',
                calories: 95,
                protein: 0.5,
                carbs: 25,
                fats: 0.3
              },
              {
                name: 'Almonds',
                portion: '1 oz',
                calories: 160,
                protein: 6,
                carbs: 6,
                fats: 14
              }
            ],
            total_calories: 255,
            total_protein: 6.5,
            total_carbs: 31,
            total_fats: 14.3
          },
          {
            type: 'Dinner',
            time: '19:00',
            foods: [
              {
                name: 'Grilled Salmon',
                portion: '5 oz',
                calories: 300,
                protein: 30,
                carbs: 0,
                fats: 19
              },
              {
                name: 'Quinoa',
                portion: '1/2 cup',
                calories: 110,
                protein: 4,
                carbs: 20,
                fats: 2
              },
              {
                name: 'Roasted Vegetables',
                portion: '1 cup',
                calories: 80,
                protein: 2,
                carbs: 16,
                fats: 1
              }
            ],
            total_calories: 490,
            total_protein: 36,
            total_carbs: 36,
            total_fats: 22
          }
        ],
        coach_tips: [
          'Stay hydrated throughout the day',
          'Try to eat your meals at consistent times',
          'Focus on protein with each meal to support muscle recovery'
        ],
        total_calories: 1445
      };
    }
    
    return {
      id: 'sample-1',
      coach_id: 'coach-1',
      start_date: startDate,
      end_date: endDate.toISOString().split('T')[0],
      status: 'active',
      daily_plans: dailyPlans,
      coach_notes: 'This meal plan is designed to support your fitness goals while ensuring you get all the nutrients you need. Focus on eating whole foods and staying hydrated. If you have any questions or need adjustments, please message me directly.',
      coach: {
        full_name: 'Sarah Johnson',
        title: 'Nutrition Coach',
        avatar_url: 'https://randomuser.me/api/portraits/women/44.jpg'
      }
    };
  };

  if (loading) {
    return (
      <Card>
        <CardBody>
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!currentPlan) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-light mb-2">
              No Active Meal Plan
            </h3>
            <p className="text-light/70 mb-6">
              Contact your coach to get a personalized meal plan
            </p>
            <Button
              variant="primary"
              leftIcon={<MessageCircle className="w-5 h-5" />}
            >
              Message Coach
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  const dailyPlan = currentPlan.daily_plans[selectedDate];

  return (
    <div className="space-y-6">
      {/* Coach Notes */}
      <Card>
        <CardBody>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <Info className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-light">Coach Notes</h2>
              <p className="text-light/70 text-sm">
                Important tips from your nutrition coach
              </p>
            </div>
          </div>
          <p className="text-light/80 whitespace-pre-line">
            {currentPlan.coach_notes}
          </p>
        </CardBody>
      </Card>

      {/* Daily Meal Plan */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-light">
              {formatDateDisplay(selectedDate)}'s Meals
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePreviousDay}
                className="flex items-center gap-1"
                disabled={currentPlan && selectedDate <= currentPlan.start_date}
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNextDay}
                className="flex items-center gap-1"
                disabled={currentPlan && selectedDate >= currentPlan.end_date}
              >
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {dailyPlan ? (
            <div className="space-y-6">
              {/* Daily Tips */}
              {dailyPlan.coach_tips?.length > 0 && (
                <div className="bg-dark-surface rounded-lg p-4">
                  <h3 className="font-semibold text-light mb-3">Today's Tips</h3>
                  <div className="space-y-2">
                    {dailyPlan.coach_tips.map((tip, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-primary mt-1" />
                        <p className="text-light/70">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Meals */}
              <div className="space-y-4">
                {dailyPlan.meals.map((meal, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-dark-surface rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mr-3">
                          <Apple className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-light capitalize">{meal.type}</h4>
                          <p className="text-sm text-light/70 flex items-center">
                            <Clock className="w-3.5 h-3.5 mr-1" />
                            {meal.time}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-primary">
                          {meal.total_calories} kcal
                        </p>
                        <div className="text-xs text-light/50 mt-1">
                          P: {meal.total_protein}g • C: {meal.total_carbs}g • F: {meal.total_fats}g
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {meal.foods.map((food, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-light/70">{food.name}</span>
                          <span className="text-light/50">{food.portion}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-dark/20">
                      <div className="flex justify-between text-xs text-light/50">
                        <span>Protein: {meal.total_protein}g</span>
                        <span>Carbs: {meal.total_carbs}g</span>
                        <span>Fat: {meal.total_fats}g</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Daily Summary */}
              <div className="bg-primary/10 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-light">Daily Total</h3>
                  <p className="font-semibold text-primary text-lg">
                    {dailyPlan.total_calories} kcal
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-light/50">
              No meal plan available for this date
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default MealPlanSection;
