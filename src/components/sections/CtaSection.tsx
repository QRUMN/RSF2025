import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Section } from '../ui/Section';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

const CtaSection: React.FC = () => {
  const navigate = useNavigate();

  const handleJoinNow = () => {
    navigate('/onboarding');
  };

  return (
    <Section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
      <div className="text-center max-w-3xl mx-auto">
        <motion.h2 
          className="font-display font-bold text-3xl md:text-4xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          Ready to Transform Your Fitness Journey?
        </motion.h2>
        
        <motion.p 
          className="text-primary-100 mb-8 text-lg"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
        >
          Join thousands who have already changed their lives with Ready Set Fit. Start your 7-day free trial today and experience the difference.
        </motion.p>
        
        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Button 
            variant="secondary" 
            size="lg" 
            rightIcon={<ArrowRight className="w-5 h-5" />}
            onClick={handleJoinNow}
          >
            Start Free Trial
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="border-white text-white hover:bg-white/10"
            onClick={() => navigate('/pricing')}
          >
            View All Plans
          </Button>
        </motion.div>
      </div>
    </Section>
  );
};

export default CtaSection;