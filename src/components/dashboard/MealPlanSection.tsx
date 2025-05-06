import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Apple, Clock, Calendar, MessageCircle, ChevronRight, AlertCircle, Info } from 'lucide-react';
import { Card, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

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
}

export const MealPlanSection: React.FC = () => {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  // Reminders state
  const [reminders, setReminders] = useState<{ id: string; date: string; message: string }[]>([]);
  const [remindersLoading, setRemindersLoading] = useState(false);

  // Fetch reminders when current plan changes
  useEffect(() => {
    const fetchReminders = async () => {
      if (!user || !currentPlan) return;
      setRemindersLoading(true);
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .eq('meal_plan_id', currentPlan.id)
        .order('remind_at', { ascending: true });
      if (!error && data) {
        setReminders(
          data.map((rem: any) => ({
            id: rem.id,
            date: rem.remind_at,
            message: rem.message,
          }))
        );
      } else {
        setReminders([]);
      }
      setRemindersLoading(false);
    };
    fetchReminders();
  }, [user, currentPlan]);

  useEffect(() => {
    if (user) {
      fetchCurrentMealPlan();
    }
  }, [user]);

  const fetchCurrentMealPlan = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('meal_plans')
        .select(`
          *,
          coach:coach_id (
            name,
            title,
            image_url
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

      setCurrentPlan(data);
    } catch (error) {
      console.error('Error fetching meal plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
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

      {/* Reminders Section */}
      <Card>
        <CardBody>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-cyan-700/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-cyan-500" />
            </div>
            <h2 className="text-lg font-semibold text-cyan-300">Reminders</h2>
          </div>
          {remindersLoading ? (
            <div className="text-light/50">Loading reminders...</div>
          ) : reminders.length > 0 ? (
            <ul className="list-disc ml-6 space-y-1">
              {reminders.map(rem => (
                <li key={rem.id} className="text-light/90">
                  <span className="font-semibold text-cyan-200">{new Date(rem.date).toLocaleString()}:</span> {rem.message}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-light/60">No reminders set for this plan.</div>
          )}
        </CardBody>
      </Card>

      {/* Daily Meal Plan */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-light">Today's Meals</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {/* TODO: Previous day */}}
              >
                Previous
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {/* TODO: Next day */}}
              >
                Next
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
                          <h4 className="font-medium text-light">{meal.type}</h4>
                          <p className="text-sm text-light/70">{meal.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-primary">
                          {meal.total_calories} kcal
                        </p>
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

                    <div className="grid grid-cols-4 gap-2 pt-4 border-t border-primary/10">
                      <div className="text-center">
                        <p className="text-xs text-light/50">Calories</p>
                        <p className="font-medium text-light">
                          {meal.total_calories}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-light/50">Protein</p>
                        <p className="font-medium text-light">
                          {meal.total_protein}g
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-light/50">Carbs</p>
                        <p className="font-medium text-light">
                          {meal.total_carbs}g
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-light/50">Fats</p>
                        <p className="font-medium text-light">
                          {meal.total_fats}g
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Daily Summary */}
              <div className="bg-dark rounded-lg p-4">
                <h3 className="font-semibold text-light mb-3">Daily Summary</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-light/50">Total Calories</p>
                    <p className="text-xl font-semibold text-primary">
                      {dailyPlan.total_calories}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-light/50">Meals</p>
                    <p className="text-xl font-semibold text-primary">
                      {dailyPlan.meals.length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-light/50">Water Goal</p>
                    <p className="text-xl font-semibold text-primary">2.5L</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-light/50">Completion</p>
                    <p className="text-xl font-semibold text-primary">0%</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-light/70">No meals planned for this day</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};