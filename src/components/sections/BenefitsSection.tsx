import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, Brain, Shield } from 'lucide-react';
import { Section } from '../ui/Section';
import { benefits } from '../../data/benefits';

const BenefitsSection: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Target': return <Target className="w-6 h-6" />;
      case 'Users': return <Users className="w-6 h-6" />;
      case 'Brain': return <Brain className="w-6 h-6" />;
      case 'Shield': return <Shield className="w-6 h-6" />;
      default: return <Target className="w-6 h-6" />;
    }
  };

  return (
    <Section className="bg-gradient-radial" id="benefits">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div>
          <motion.span 
            className="inline-block py-1 px-3 text-xs font-semibold bg-primary/20 text-primary rounded-full mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            WHY CHOOSE US
          </motion.span>
          <motion.h2
            className="font-display font-bold text-3xl md:text-4xl text-light mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Transform Your Fitness Journey with RSF
          </motion.h2>
          <motion.p
            className="text-light/70 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Ready Set Fit provides a comprehensive approach to fitness that goes beyond just workouts. Our platform combines expert training, personalized nutrition, progress tracking, and community support to help you achieve your goals.
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 bg-dark-surface rounded-lg flex items-center justify-center mb-4">
                  {getIcon(benefit.icon)}
                </div>
                <h3 className="text-xl font-semibold text-light mb-2">{benefit.title}</h3>
                <p className="text-light/70 text-sm mb-3">{benefit.description}</p>
                <p className="text-primary font-semibold text-sm">{benefit.stat}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <img 
            src="https://github.com/QRUMN/RSFIMG/blob/main/heroimag.png?raw=true"
            alt="Fitness transformation" 
            className="w-full h-auto rounded-2xl shadow-soft"
          />
          <div className="absolute -bottom-6 -right-6 w-2/3 h-2/3 bg-primary/20 rounded-2xl -z-10 blur-xl" />
          <div className="absolute -top-6 -left-6 w-1/3 h-1/3 bg-primary/10 rounded-2xl -z-10 blur-xl" />
        </motion.div>
      </div>
    </Section>
  );
};

export default BenefitsSection;