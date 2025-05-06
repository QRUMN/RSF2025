import React from 'react';
import { Card, CardBody } from './Card';
import { motion } from 'framer-motion';

interface StatCardProps {
  number: string;
  label: string;
}

export const StatCard: React.FC<StatCardProps> = ({ number, label }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <Card className="text-center p-6 bg-white/5 backdrop-blur-lg border border-white/10 hover:border-primary/50 transition-colors">
        <CardBody>
          <h3 className="text-4xl font-bold text-primary mb-2">{number}</h3>
          <p className="text-gray-300">{label}</p>
        </CardBody>
      </Card>
    </motion.div>
  );
};