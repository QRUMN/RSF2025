import React from 'react';
import { motion } from 'framer-motion';
import { Clock, BarChart2, ArrowRight } from 'lucide-react';
import { Section } from '../ui/Section';
import { Card, CardHeader, CardBody, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { featuredWorkouts } from '../../data/workouts';

const FeaturedWorkoutsSection: React.FC = () => {
  return (
    <Section className="bg-gradient-radial" id="programs">
      <div className="mb-12 text-center">
        <motion.span 
          className="inline-block py-1 px-3 text-xs font-semibold bg-primary/20 text-primary rounded-full mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          OUR SERVICES
        </motion.span>
        <motion.h2
          className="font-display font-bold text-3xl md:text-4xl text-light mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
        >
          Comprehensive Fitness Solutions
        </motion.h2>
        <motion.p
          className="max-w-2xl mx-auto text-light/70"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Discover our holistic approach to fitness with expert-led services designed to transform your body and mind.
        </motion.p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {featuredWorkouts.map((workout, index) => (
          <WorkoutCard 
            key={workout.id} 
            workout={workout} 
            index={index}
          />
        ))}
      </div>
      
      <motion.div 
        className="mt-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        viewport={{ once: true }}
      >
        <Button 
          variant="outline" 
          size="lg"
          rightIcon={<ArrowRight className="w-5 h-5" />}
        >
          Explore All Services
        </Button>
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute top-1/3 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
    </Section>
  );
};

interface WorkoutCardProps {
  workout: {
    id: string;
    title: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    duration: number;
    category: string;
    imageUrl: string;
    description: string;
    instructorName: string;
    instructorImageUrl: string;
  };
  index: number;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, index }) => {
  const levelColors = {
    beginner: 'bg-primary/20 text-primary',
    intermediate: 'bg-primary/30 text-primary',
    advanced: 'bg-primary/40 text-primary',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <Card hover className="h-full flex flex-col group">
        <div className="relative">
          <img 
            src={workout.imageUrl} 
            alt={workout.title} 
            className="w-full h-48 object-cover rounded-t-2xl brightness-75 group-hover:brightness-100 transition-all duration-300"
          />
          <span className={`absolute top-3 left-3 py-1 px-3 text-xs font-semibold rounded-full ${levelColors[workout.level]}`}>
            {workout.level.charAt(0).toUpperCase() + workout.level.slice(1)}
          </span>
          <span className="absolute top-3 right-3 py-1 px-3 text-xs font-semibold bg-dark/75 text-light rounded-full">
            {workout.category}
          </span>
        </div>
        
        <CardBody className="flex-grow">
          <h3 className="font-display font-bold text-xl mb-2 text-light group-hover:text-primary transition-colors duration-300">
            {workout.title}
          </h3>
          <p className="text-light/70 text-sm mb-4">
            {workout.description}
          </p>
          
          <div className="flex items-center justify-between text-sm text-light/70">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1 text-primary" />
              <span>{workout.duration} min</span>
            </div>
            <div className="flex items-center">
              <BarChart2 className="w-4 h-4 mr-1 text-primary" />
              <span>{workout.level}</span>
            </div>
          </div>
        </CardBody>
        
        <CardFooter className="border-t border-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src={workout.instructorImageUrl} 
                alt={workout.instructorName} 
                className="w-8 h-8 rounded-full mr-2 object-cover border border-primary/20"
              />
              <span className="text-sm font-medium text-light/90">{workout.instructorName}</span>
            </div>
            <Button variant="ghost" size="sm">
              Learn More
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default FeaturedWorkoutsSection;