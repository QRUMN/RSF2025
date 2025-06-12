import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { Section } from '../ui/Section';

const testimonials = [
  {
    name: 'Sarah Johnson',
    achievement: 'Lost 30 lbs in 6 months',
    result: '30 lbs',
    duration: '6 months',
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
    quote: 'RSF\'s structured programs and supportive community made my transformation possible. The expert guidance and accountability were game-changers.'
  },
  {
    name: 'Mike Chen',
    achievement: 'Gained 15 lbs muscle mass',
    result: '15 lbs',
    duration: '4 months',
    image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg',
    quote: 'The personalized strength programs helped me achieve my muscle gain goals faster than I thought possible.'
  },
  {
    name: 'Emma Davis',
    achievement: 'Completed first marathon',
    result: '26.2 miles',
    duration: '8 months',
    image: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg',
    quote: 'From barely running a mile to completing a marathon – RSF\'s endurance program made it happen!'
  }
];

const TestimonialsSection: React.FC = () => {
  return (
    <Section className="bg-gradient-radial">
      <motion.h2 
        className="text-4xl md:text-5xl font-display font-bold text-center text-light mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        Real Results, Real People
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="bg-dark-surface rounded-2xl p-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <img 
                src={testimonial.image} 
                alt={testimonial.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="text-xl font-semibold text-light">
                  {testimonial.name}
                </h3>
                <p className="text-primary text-sm flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  {testimonial.achievement}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-dark rounded-lg p-4 flex flex-col items-center justify-center">
                <div className="text-2xl font-bold text-primary">
                  {testimonial.result}
                </div>
                <div className="text-sm text-light/50">
                  Result
                </div>
              </div>
              <div className="bg-dark rounded-lg p-4 flex flex-col items-center justify-center">
                <div className="text-2xl font-bold text-primary">
                  {testimonial.duration}
                </div>
                <div className="text-sm text-light/50">
                  Duration
                </div>
              </div>
            </div>

            <p className="text-light/80">
              {testimonial.quote}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
    </Section>
  );
};

export default TestimonialsSection;