import React from 'react';
import { motion } from 'framer-motion';
import { Clock, DollarSign } from 'lucide-react';
import { Service } from '../../types/booking';
import { Card, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';

interface ServiceCardProps {
  service: Service;
  onBook: () => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onBook }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <Card hover className="h-full">
        <CardBody>
          <h3 className="text-xl font-semibold text-light mb-3">
            {service.name}
          </h3>
          <p className="text-light/70 mb-6">
            {service.description}
          </p>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center text-light/70">
              <Clock className="w-4 h-4 mr-2 text-primary" />
              <span>{service.duration} min</span>
            </div>
            <div className="flex items-center text-light/70">
              <DollarSign className="w-4 h-4 mr-1 text-primary" />
              <span>{service.price}</span>
            </div>
          </div>

          <Button
            variant="outline"
            fullWidth
            onClick={onBook}
          >
            Book Now
          </Button>
        </CardBody>
      </Card>
    </motion.div>
  );
};