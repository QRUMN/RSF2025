import { useEffect, useState } from 'react';
import { Plus, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Section } from '../components/ui/Section';
import { Button } from '../components/ui/Button';
import { ProfileSection } from '../components/dashboard/ProfileSection';
import { ProgressGallery } from '../components/dashboard/ProgressGallery';
import { GoalTracker } from '../components/dashboard/GoalTracker';
import { ProgressChart } from '../components/dashboard/ProgressChart';
import { MessageCoachModal } from '../components/dashboard/MessageCoachModal';
import { ChallengeCard } from '../components/dashboard/ChallengeCard';
import { MealPlanSection } from '../components/dashboard/MealPlanSection';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    avatar_url: '',
    fitness_level: '',
    fitness_goals: [],
    bio: '',
    height: null,
    weight: null,
    date_of_birth: null,
    gender: '',
    medical_conditions: [],
    dietary_restrictions: [],
    preferred_workout_times: [],
    preferred_training_style: [],
    measurement_unit: 'metric'
  });

  const [goals, setGoals] = useState([]);
  const [weightData, setWeightData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchGoals();
      fetchWeightData();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to fetch profile data');
        return;
      }

      if (data) {
        setProfile(data);
      } else {
        setProfile({
          first_name: '',
          last_name: '',
          avatar_url: '',
          fitness_level: '',
          fitness_goals: [],
          bio: '',
          height: null,
          weight: null,
          date_of_birth: null,
          gender: '',
          medical_conditions: [],
          dietary_restrictions: [],
          preferred_workout_times: [],
          preferred_training_style: [],
          measurement_unit: 'metric'
        });
        
        navigate('/onboarding');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An unexpected error occurred');
    }
  };

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const fetchWeightData = async () => {
    try {
      const { data, error } = await supabase
        .from('measurements')
        .select('measurement_date, weight')
        .eq('user_id', user?.id)
        .order('measurement_date', { ascending: true })
        .limit(10);

      if (error) throw error;
      
      const formattedData = data?.map(measurement => ({
        date: new Date(measurement.measurement_date).toLocaleDateString(),
        value: measurement.weight
      })) || [];

      setWeightData(formattedData);
    } catch (error) {
      console.error('Error fetching weight data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="pt-16 md:pt-20 pb-12">
      <Section>
        <div className="max-w-7xl mx-auto space-y-4 md:space-y-8 px-4 sm:px-6">
          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              leftIcon={<Plus className="w-5 h-5" />}
              onClick={() => navigate('/log-workout')}
              className="w-full sm:w-auto"
            >
              Log Workout
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsMessageModalOpen(true)}
              className="w-full sm:w-auto"
            >
              Message Coach
            </Button>
          </div>

          {/* Profile Section */}
          <ProfileSection profile={profile} />

          {/* Goals and Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
            <GoalTracker
              goals={goals}
              isPremium={isPremium}
              onRefresh={fetchGoals}
            />
            <ProgressChart
              data={weightData}
              title="Weight Progress"
              metric="Weight (kg)"
              isPremium={isPremium}
            />
          </div>

          {/* Meal Plan Section */}
          <MealPlanSection />

          {/* Progress Gallery */}
          <ProgressGallery />

          {/* Challenges Section */}
          <div className="mt-6 md:mt-12">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-lg md:text-2xl font-display font-bold text-light">
                Active Challenges
              </h2>
              <Button
                variant="outline"
                size="sm"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                View All
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ChallengeCard
                challenge={{
                  id: '1',
                  title: '30-Day Weight Loss',
                  description: 'Join our community weight loss challenge and transform your body in 30 days.',
                  participants: 156,
                  daysLeft: 22,
                  isPremium: true
                }}
              />
              <ChallengeCard
                challenge={{
                  id: '2',
                  title: 'Summer Shred',
                  description: 'Get beach-ready with this comprehensive workout and nutrition program.',
                  participants: 89,
                  daysLeft: 15,
                  isPremium: false
                }}
              />
              <ChallengeCard
                challenge={{
                  id: '3',
                  title: 'Strength Builder',
                  description: 'Build muscle and increase strength with this progressive program.',
                  participants: 203,
                  daysLeft: 30,
                  isPremium: true
                }}
              />
            </div>
          </div>
        </div>
      </Section>

      <MessageCoachModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
      />
    </div>
  );
};

export default DashboardPage;