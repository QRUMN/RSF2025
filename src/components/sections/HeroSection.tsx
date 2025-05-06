import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';
import { useNavigate } from 'react-router-dom';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  const handleJoinClick = () => {
    navigate('/onboarding');
  };

  return (
    <section className="relative min-h-screen flex items-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-dark z-10" />
        <img 
          src="https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg"
          alt="Fitness background" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <Container className="relative z-20 pt-32 md:pt-40 lg:pt-48">
        <div className="max-w-4xl">
          <motion.span 
            className="inline-block py-1 px-3 text-xs font-semibold bg-primary/20 text-primary rounded-full mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            WELCOME TO RSF
          </motion.span>
          
          <motion.h1 
            className="font-display font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Transform Your Body, <br />
            <span className="text-gradient">Transform Your Life</span>
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-light/90 mb-8 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Join our community of fitness enthusiasts and transform your life with expert-led workouts, personalized nutrition plans, and a supportive environment.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button 
              variant="primary" 
              size="lg" 
              rightIcon={<ArrowRight className="w-5 h-5" />}
              onClick={handleJoinClick}
            >
              Join Today
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/services')}
            >
              Explore Programs
            </Button>
          </motion.div>
          
          <motion.div 
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <StatsItem value="100+" label="Active Members" />
            <StatsItem value="5" label="Expert Trainers" />
            <StatsItem value="87%" label="Success Rate" />
            <StatsItem value="24/7" label="Support" />
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <ChevronDown className="w-8 h-8 text-primary animate-bounce" />
        </motion.div>
      </Container>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-dark to-transparent" />
      <div className="absolute top-1/4 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
    </section>
  );
};

interface StatsItemProps {
  value: string;
  label: string;
}

const StatsItem: React.FC<StatsItemProps> = ({ value, label }) => {
  return (
    <div className="text-center group">
      <p className="font-display font-bold text-3xl md:text-4xl text-primary mb-2 group-hover:shadow-glow transition-all duration-300">
        {value}
      </p>
      <p className="text-light/70 text-sm md:text-base">
        {label}
      </p>
    </div>
  );
};

export default HeroSection;