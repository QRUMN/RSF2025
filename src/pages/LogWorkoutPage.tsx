import React, { useState } from 'react';
import { Section } from '../components/ui/Section';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { BackButton } from '../components/ui/BackButton';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Dumbbell, Clock, Flame } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

const LogWorkoutPage: React.FC = () => {
  const { user } = useAuth();
  const [workoutType, setWorkoutType] = useState('');
  const [duration, setDuration] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState('');
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const workoutTypes = [
    'Strength Training',
    'Cardio',
    'HIIT',
    'Yoga',
    'Pilates',
    'Swimming',
    'Running',
    'Cycling',
    'Other'
  ];

  const addExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: '',
      sets: 0,
      reps: 0,
      weight: 0
    };
    setExercises([...exercises, newExercise]);
  };

  const updateExercise = (id: string, field: keyof Exercise, value: string | number) => {
    setExercises(exercises.map(exercise => 
      exercise.id === id ? { ...exercise, [field]: value } : exercise
    ));
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(exercise => exercise.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { error: dbError } = await supabase
        .from('workout_logs')
        .insert({
          user_id: user.id,
          workout_type: workoutType,
          duration: `${duration} minutes`,
          calories_burned: parseInt(caloriesBurned),
          notes,
          exercises: exercises.length > 0 ? exercises : null
        });

      if (dbError) throw dbError;
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section className="pt-32 min-h-screen bg-gradient-radial">
      <div className="max-w-3xl mx-auto">
        <BackButton to="/dashboard" className="mb-6" />
        
        <Card>
          <CardBody>
            <h2 className="text-2xl font-display font-bold text-light mb-6">
              Log Workout
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-light/70 mb-2">
                  Workout Type *
                </label>
                <select
                  value={workoutType}
                  onChange={(e) => setWorkoutType(e.target.value)}
                  className="w-full bg-dark border border-primary/20 rounded-lg py-2 px-4 text-light focus:outline-none focus:border-primary"
                  required
                >
                  <option value="">Select workout type</option>
                  {workoutTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-light/70 mb-2">
                    Duration (minutes) *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light/50" />
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-dark border border-primary/20 rounded-lg py-2 pl-10 pr-4 text-light placeholder-light/30 focus:outline-none focus:border-primary"
                      placeholder="e.g., 45"
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-light/70 mb-2">
                    Calories Burned
                  </label>
                  <div className="relative">
                    <Flame className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light/50" />
                    <input
                      type="number"
                      value={caloriesBurned}
                      onChange={(e) => setCaloriesBurned(e.target.value)}
                      className="w-full bg-dark border border-primary/20 rounded-lg py-2 pl-10 pr-4 text-light placeholder-light/30 focus:outline-none focus:border-primary"
                      placeholder="e.g., 300"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-light/70">
                    Exercises
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addExercise}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add Exercise
                  </Button>
                </div>

                <div className="space-y-4">
                  {exercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="bg-dark-surface p-4 rounded-lg space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Dumbbell className="w-5 h-5 text-primary mr-2" />
                          <input
                            type="text"
                            value={exercise.name}
                            onChange={(e) => updateExercise(exercise.id, 'name', e.target.value)}
                            className="bg-transparent border-b border-primary/20 text-light focus:outline-none focus:border-primary"
                            placeholder="Exercise name"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExercise(exercise.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-light/50 mb-1">Sets</label>
                          <input
                            type="number"
                            value={exercise.sets || ''}
                            onChange={(e) => updateExercise(exercise.id, 'sets', parseInt(e.target.value))}
                            className="w-full bg-dark border border-primary/20 rounded-lg py-1 px-2 text-light text-sm focus:outline-none focus:border-primary"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-light/50 mb-1">Reps</label>
                          <input
                            type="number"
                            value={exercise.reps || ''}
                            onChange={(e) => updateExercise(exercise.id, 'reps', parseInt(e.target.value))}
                            className="w-full bg-dark border border-primary/20 rounded-lg py-1 px-2 text-light text-sm focus:outline-none focus:border-primary"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-light/50 mb-1">Weight (kg)</label>
                          <input
                            type="number"
                            value={exercise.weight || ''}
                            onChange={(e) => updateExercise(exercise.id, 'weight', parseFloat(e.target.value))}
                            className="w-full bg-dark border border-primary/20 rounded-lg py-1 px-2 text-light text-sm focus:outline-none focus:border-primary"
                            min="0"
                            step="0.5"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-light/70 mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-dark border border-primary/20 rounded-lg py-2 px-4 text-light placeholder-light/30 focus:outline-none focus:border-primary min-h-[100px]"
                  placeholder="Add any notes about your workout..."
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Workout'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </Section>
  );
};

export default LogWorkoutPage;