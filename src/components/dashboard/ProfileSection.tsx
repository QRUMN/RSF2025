import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Settings, MapPin, Calendar, User2 } from 'lucide-react';
import { Card, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { ImageUploader } from '../ui/ImageUploader';

interface ProfileSectionProps {
  profile: {
    first_name: string;
    last_name: string;
    avatar_url: string;
    fitness_level: string;
    fitness_goals: string[];
    city?: string;
    state?: string;
    date_of_birth?: string | null;
    gender?: string;
  };
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ profile }) => {
  const navigate = useNavigate();
  const [showUploader, setShowUploader] = useState(false);

  const handleAvatarClick = () => {
    setShowUploader(true);
  };

  const handleUploadComplete = (url: string) => {
    // TODO: Update profile with new avatar URL
    console.log('New avatar URL:', url);
    setShowUploader(false);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatGender = (gender: string | undefined) => {
    if (!gender) return '';
    return gender.charAt(0).toUpperCase() + gender.slice(1);
  };

  return (
    <Card className="overflow-hidden">
      <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5" />
      <CardBody className="-mt-16 relative">
        <div className="flex flex-col items-center gap-6 mb-8">
          <div className="flex-shrink-0">
            {showUploader ? (
              <div className="w-32 h-32">
                <ImageUploader
                  bucket="avatars"
                  onUpload={handleUploadComplete}
                  aspectRatio={1}
                  maxSize={2}
                />
              </div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative group"
              >
                <img
                  src={profile.avatar_url || 'https://via.placeholder.com/128'}
                  alt={`${profile.first_name} ${profile.last_name}`}
                  className="w-32 h-32 rounded-xl object-cover border-4 border-dark-surface shadow-lg"
                />
                <button
                  onClick={handleAvatarClick}
                  className="absolute inset-0 flex items-center justify-center bg-dark/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                >
                  <Edit2 className="w-6 h-6 text-light" />
                </button>
              </motion.div>
            )}
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-display font-bold text-light">
              {profile.first_name} {profile.last_name}
            </h2>
            <p className="text-primary font-medium">
              {profile.fitness_level?.charAt(0).toUpperCase() + profile.fitness_level?.slice(1)} Level Athlete
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              leftIcon={<Settings className="w-4 h-4" />}
              onClick={() => navigate('/settings')}
            >
              Settings
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate('/onboarding')}
            >
              Edit Profile
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {(profile.city || profile.state) && (
              <div className="flex items-center gap-2 text-light/70">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{[profile.city, profile.state].filter(Boolean).join(', ')}</span>
              </div>
            )}
            {profile.date_of_birth && (
              <div className="flex items-center gap-2 text-light/70">
                <Calendar className="w-4 h-4 text-primary" />
                <span>{formatDate(profile.date_of_birth)}</span>
              </div>
            )}
            {profile.gender && (
              <div className="flex items-center gap-2 text-light/70">
                <User2 className="w-4 h-4 text-primary" />
                <span>{formatGender(profile.gender)}</span>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-light/70 mb-3">Fitness Goals</h3>
            <div className="flex flex-wrap gap-2">
              {profile.fitness_goals?.map((goal, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {goal}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};