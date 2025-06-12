import React from 'react';
import { motion } from 'framer-motion';
import { Section } from '../ui/Section';

const images = [
  {
    url: 'https://raw.githubusercontent.com/QRUMN/RSFIMG/main/Coreshot.png',
    category: 'Strength',
    title: 'Core & Strength Training'
  },
  {
    url: 'https://images.pexels.com/photos/6187290/pexels-photo-6187290.jpeg',
    category: 'Mobility',
    title: 'Flexibility & Recovery'
  },
  {
    url: 'https://raw.githubusercontent.com/QRUMN/RSFIMG/main/Nutrition%20Plans.png',
    category: 'Nutrition',
    title: 'Healthy Meal Planning'
  },
  {
    url: 'https://raw.githubusercontent.com/QRUMN/RSFIMG/main/heroimag.png',
    category: 'Fitness',
    title: 'Full Body Workout'
  },
  {
    url: 'https://images.pexels.com/photos/6740754/pexels-photo-6740754.jpeg',
    category: 'Wellness',
    title: 'Mind-Body Balance'
  },
  {
    url: 'https://raw.githubusercontent.com/QRUMN/RSFIMG/main/pexels-ella-olsson-572949-1640768.jpg',
    category: 'Nutrition',
    title: 'Meal Preparation'
  }
];

const GallerySection: React.FC = () => {
  return (
    <Section className="bg-gradient-radial">
      <div className="mb-12 text-center">
        <motion.span 
          className="inline-block py-1 px-3 text-xs font-semibold bg-primary/20 text-primary rounded-full mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          INSPIRATION
        </motion.span>
        <motion.h2 
          className="font-display font-bold text-3xl md:text-4xl text-light mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
        >
          Your Journey to Wellness
        </motion.h2>
        <motion.p 
          className="max-w-2xl mx-auto text-light/70"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Explore our holistic approach to fitness, combining expert-led workouts, mindful practices, and nutritious meal planning.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image, index) => (
          <motion.div
            key={index}
            className="relative group overflow-hidden rounded-2xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <div className="aspect-w-16 aspect-h-9">
              <img 
                src={image.url} 
                alt={image.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="text-primary text-sm font-semibold mb-2 block">
                  {image.category}
                </span>
                <h3 className="text-light text-xl font-display font-bold">
                  {image.title}
                </h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
    </Section>
  );
};

export default GallerySection;