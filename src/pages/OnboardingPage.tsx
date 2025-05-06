import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Dumbbell, 
  Calendar, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  User,
  Scale,
  Heart,
  Apple,
  Sun,
  Moon,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  Building2,
  Globe2
} from 'lucide-react';
import { Section } from '../components/ui/Section';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { UserProfile } from '../types/onboarding';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { AuthModal } from '../components/auth/AuthModal';

const OnboardingPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [error, setError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    city: '',
    state: '',
    date_of_birth: '',
    gender: ''
  });

  const stateAbbreviations: { [key: string]: string } = {
    'alabama': 'AL',
    'alaska': 'AK',
    'arizona': 'AZ',
    'arkansas': 'AR',
    'california': 'CA',
    'colorado': 'CO',
    'connecticut': 'CT',
    'delaware': 'DE',
    'florida': 'FL',
    'georgia': 'GA',
    'hawaii': 'HI',
    'idaho': 'ID',
    'illinois': 'IL',
    'indiana': 'IN',
    'iowa': 'IA',
    'kansas': 'KS',
    'kentucky': 'KY',
    'louisiana': 'LA',
    'maine': 'ME',
    'maryland': 'MD',
    'massachusetts': 'MA',
    'michigan': 'MI',
    'minnesota': 'MN',
    'mississippi': 'MS',
    'missouri': 'MO',
    'montana': 'MT',
    'nebraska': 'NE',
    'nevada': 'NV',
    'new hampshire': 'NH',
    'new jersey': 'NJ',
    'new mexico': 'NM',
    'new york': 'NY',
    'north carolina': 'NC',
    'north dakota': 'ND',
    'ohio': 'OH',
    'oklahoma': 'OK',
    'oregon': 'OR',
    'pennsylvania': 'PA',
    'rhode island': 'RI',
    'south carolina': 'SC',
    'south dakota': 'SD',
    'tennessee': 'TN',
    'texas': 'TX',
    'utah': 'UT',
    'vermont': 'VT',
    'virginia': 'VA',
    'washington': 'WA',
    'west virginia': 'WV',
    'wisconsin': 'WI',
    'wyoming': 'WY'
  };

  useEffect(() => {
    // If user is already logged in and has a profile, redirect to dashboard
    if (user) {
      checkExistingProfile();
    }
  }, [user]);

  const checkExistingProfile = async () => {
    try {
      const { data: profile, error: queryError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (queryError) {
        throw queryError;
      }

      // Only redirect if a profile exists
      if (profile) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error checking profile:', error);
      setError('Failed to check existing profile. Please try again.');
    }
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    } else {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      const formattedPhone = formatPhoneNumber(value);
      setFormData(prev => ({
        ...prev,
        [name]: formattedPhone
      }));
    } else if (name === 'first_name' || name === 'last_name') {
      const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1);
      setFormData(prev => ({
        ...prev,
        [name]: capitalizedValue
      }));
    } else if (name === 'city') {
      const capitalizedCity = value.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
      setFormData(prev => ({
        ...prev,
        [name]: capitalizedCity
      }));
    } else if (name === 'state') {
      const lowercaseValue = value.toLowerCase();
      const stateAbbr = stateAbbreviations[lowercaseValue] || value.toUpperCase();
      setFormData(prev => ({
        ...prev,
        [name]: stateAbbr
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const fitnessGoals = [
    {
      id: 'weight-loss',
      title: 'Weight Loss',
      description: 'Burn fat and achieve a healthier weight',
      icon: <Scale className="w-6 h-6" />
    },
    {
      id: 'muscle-gain',
      title: 'Muscle Gain',
      description: 'Build strength and increase muscle mass',
      icon: <Dumbbell className="w-6 h-6" />
    },
    {
      id: 'endurance',
      title: 'Endurance',
      description: 'Improve stamina and cardiovascular health',
      icon: <Heart className="w-6 h-6" />
    },
    {
      id: 'flexibility',
      title: 'Flexibility',
      description: 'Enhance mobility and reduce injury risk',
      icon: <User className="w-6 h-6" />
    }
  ];

  const fitnessLevels = [
    {
      id: 'beginner',
      title: 'Beginner',
      description: 'New to fitness or returning after a long break',
      icon: <Target className="w-6 h-6" />
    },
    {
      id: 'intermediate',
      title: 'Intermediate',
      description: 'Regular exercise with basic form knowledge',
      icon: <Dumbbell className="w-6 h-6" />
    },
    {
      id: 'advanced',
      title: 'Advanced',
      description: 'Experienced with complex exercises',
      icon: <Target className="w-6 h-6" />
    }
  ];

  const dietaryPreferences = [
    {
      id: 'none',
      title: 'No Restrictions',
      description: 'I eat everything',
      icon: <Apple className="w-6 h-6" />
    },
    {
      id: 'vegetarian',
      title: 'Vegetarian',
      description: 'Plant-based diet with dairy and eggs',
      icon: <Apple className="w-6 h-6" />
    },
    {
      id: 'vegan',
      title: 'Vegan',
      description: 'Strictly plant-based diet',
      icon: <Apple className="w-6 h-6" />
    },
    {
      id: 'keto',
      title: 'Keto',
      description: 'Low-carb, high-fat diet',
      icon: <Apple className="w-6 h-6" />
    }
  ];

  const workoutTimes = [
    {
      id: 'morning',
      title: 'Morning',
      description: '6 AM - 10 AM',
      icon: <Sun className="w-6 h-6" />
    },
    {
      id: 'afternoon',
      title: 'Afternoon',
      description: '11 AM - 4 PM',
      icon: <Sun className="w-6 h-6" />
    },
    {
      id: 'evening',
      title: 'Evening',
      description: '5 PM - 9 PM',
      icon: <Moon className="w-6 h-6" />
    }
  ];

  const handleNext = () => {
    if (step === 1 && !isPersonalInfoComplete()) {
      return;
    }
    setStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isPersonalInfoComplete = () => {
    const requiredFields = ['first_name', 'last_name', 'phone', 'city', 'state', 'date_of_birth', 'gender'];
    return requiredFields.every(field => formData[field as keyof typeof formData]);
  };

  const handleSubmit = async () => {
    setError(null);

    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const { error: supabaseError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: formData.first_name,
          last_name: formData.last_name,
          city: formData.city,
          state: formData.state,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          fitness_goals: profile.fitnessGoals,
          fitness_level: profile.fitnessLevel,
          dietary_restrictions: profile.dietaryRestrictions,
          preferred_workout_times: profile.preferredWorkoutTimes
        });

      if (supabaseError) {
        throw supabaseError;
      }
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save your profile. Please try again.');
    }
  };

  return (
    <Section className="pt-32 min-h-screen bg-gradient-radial">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-light/70">
              Step {step} of 5
            </div>
            <div className="text-sm text-primary font-medium">
              {Math.round((step / 5) * 100)}% Complete
            </div>
          </div>
          <div className="h-1 bg-dark-surface rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 5) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        <div className="overflow-y-auto max-h-[calc(100vh-300px)] pr-4 -mr-4">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-3xl font-display font-bold text-light mb-6">
                  Tell us about yourself
                </h2>
                <p className="text-light/70 mb-8">
                  Let's start with some basic information to personalize your experience.
                </p>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-light/70 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className="w-full bg-dark-surface border border-primary/20 rounded-lg py-2 px-4 text-light placeholder-light/30 focus:outline-none focus:border-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-light/70 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className="w-full bg-dark-surface border border-primary/20 rounded-lg py-2 px-4 text-light placeholder-light/30 focus:outline-none focus:border-primary"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-light/70 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light/50" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        maxLength={14}
                        className="w-full bg-dark-surface border border-primary/20 rounded-lg py-2 pl-10 pr-4 text-light placeholder-light/30 focus:outline-none focus:border-primary"
                        placeholder="(333) 333-3333"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-light/70 mb-2">
                        City *
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light/50" />
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full bg-dark-surface border border-primary/20 rounded-lg py-2 pl-10 pr-4 text-light placeholder-light/30 focus:outline-none focus:border-primary"
                          placeholder="Enter your city"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-light/70 mb-2">
                        State *
                      </label>
                      <div className="relative">
                        <Globe2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light/50" />
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full bg-dark-surface border border-primary/20 rounded-lg py-2 pl-10 pr-4 text-light placeholder-light/30 focus:outline-none focus:border-primary"
                          placeholder="Enter your state"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-light/70 mb-2">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleInputChange}
                        className="w-full bg-dark-surface border border-primary/20 rounded-lg py-2 px-4 text-light placeholder-light/30 focus:outline-none focus:border-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-light/70 mb-2">
                        Gender *
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full bg-dark-surface border border-primary/20 rounded-lg py-2 px-4 text-light placeholder-light/30 focus:outline-none focus:border-primary"
                        required
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-3xl font-display font-bold text-light mb-6">
                  What are your fitness goals?
                </h2>
                <p className="text-light/70 mb-8">
                  Select all that apply to help us personalize your experience.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {fitnessGoals.map(goal => (
                    <Card
                      key={goal.id}
                      className={`cursor-pointer transition-all duration-300 ${
                        profile.fitnessGoals?.includes(goal.id)
                          ? 'border-primary shadow-glow'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => setProfile(prev => ({
                        ...prev,
                        fitnessGoals: prev.fitnessGoals?.includes(goal.id)
                          ? prev.fitnessGoals.filter(id => id !== goal.id)
                          : [...(prev.fitnessGoals || []), goal.id]
                      }))}
                    >
                      <CardBody className="flex items-center p-6">
                        <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mr-4">
                          {goal.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-light mb-1">{goal.title}</h3>
                          <p className="text-sm text-light/70">{goal.description}</p>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-3xl font-display font-bold text-light mb-6">
                  What's your fitness level?
                </h2>
                <p className="text-light/70 mb-8">
                  This helps us recommend the right exercises for you.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {fitnessLevels.map(level => (
                    <Card
                      key={level.id}
                      className={`cursor-pointer transition-all duration-300 ${
                        profile.fitnessLevel === level.id
                          ? 'border-primary shadow-glow'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => setProfile(prev => ({
                        ...prev,
                        fitnessLevel: level.id
                      }))}
                    >
                      <CardBody className="text-center p-6">
                        <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                          {level.icon}
                        </div>
                        <h3 className="font-semibold text-light mb-2">{level.title}</h3>
                        <p className="text-sm text-light/70">{level.description}</p>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-3xl font-display font-bold text-light mb-6">
                  Any dietary preferences?
                </h2>
                <p className="text-light/70 mb-8">
                  Help us customize your nutrition recommendations.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {dietaryPreferences.map(diet => (
                    <Card
                      key={diet.id}
                      className={`cursor-pointer transition-all duration-300 ${
                        profile.dietaryRestrictions?.includes(diet.id)
                          ? 'border-primary shadow-glow'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => setProfile(prev => ({
                        ...prev,
                        dietaryRestrictions: prev.dietaryRestrictions?.includes(diet.id)
                          ? prev.dietaryRestrictions.filter(id => id !== diet.id)
                          : [...(prev.dietaryRestrictions || []), diet.id]
                      }))}
                    >
                      <CardBody className="flex items-center p-6">
                        <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mr-4">
                          {diet.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-light mb-1">{diet.title}</h3>
                          <p className="text-sm text-light/70">{diet.description}</p>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-3xl font-display font-bold text-light mb-6">
                  When do you prefer to work out?
                </h2>
                <p className="text-light/70 mb-8">
                  This helps us schedule your sessions at the best times for you.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {workoutTimes.map(time => (
                    <Card
                      key={time.id}
                      className={`cursor-pointer transition-all duration-300 ${
                        profile.preferredWorkoutTimes?.includes(time.id)
                          ? 'border-primary shadow-glow'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => setProfile(prev => ({
                        ...prev,
                        preferredWorkoutTimes: prev.preferredWorkoutTimes?.includes(time.id)
                          ? prev.preferredWorkoutTimes.filter(id => id !== time.id)
                          : [...(prev.preferredWorkoutTimes || []), time.id]
                      }))}
                    >
                      <CardBody className="text-center p-6">
                        <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                          {time.icon}
                        </div>
                        <h3 className="font-semibold text-light mb-2">{time.title}</h3>
                        <p className="text-sm text-light/70">{time.description}</p>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-between mt-8">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              leftIcon={<ChevronLeft className="w-5 h-5" />}
            >
              Back
            </Button>
          )}
          <div className="ml-auto">
            <Button
              variant="primary"
              onClick={step < 5 ? handleNext : handleSubmit}
              rightIcon={<ChevronRight className="w-5 h-5" />}
              disabled={step === 1 && !isPersonalInfoComplete()}
            >
              {step < 5 ? 'Next' : 'Complete'}
            </Button>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode="sign-up"
      />
    </Section>
  );
};

export default OnboardingPage;