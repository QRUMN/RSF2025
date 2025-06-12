import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Section } from '../ui/Section';
import { Card, CardHeader, CardBody, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { subscriptionPlans } from '../../data/subscriptions';

const PricingSection: React.FC = () => {
  return (
    <Section className="bg-gradient-radial" id="pricing">
      <div className="mb-12 text-center">
        <motion.span 
          className="inline-block py-1 px-3 text-xs font-semibold bg-primary/20 text-primary rounded-full mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          MEMBERSHIP
        </motion.span>
        <motion.h2 
          className="font-display font-bold text-3xl md:text-4xl text-light mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
        >
          Choose Your Path to Fitness
        </motion.h2>
        <motion.p 
          className="max-w-2xl mx-auto text-light/70"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Select a membership plan that fits your fitness goals. All plans include access to our supportive community and expert guidance.
        </motion.p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {subscriptionPlans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <Card 
              className={`h-full flex flex-col ${
                plan.popular ? 'border-2 border-primary shadow-glow' : ''
              }`}
              hover={!plan.popular}
            >
              {plan.popular && (
                <div className="text-center bg-primary text-dark py-2 font-medium text-sm">
                  MOST POPULAR
                </div>
              )}
              
              <CardHeader className="text-center">
                <h3 className="font-display font-bold text-2xl mb-2 text-light">
                  {plan.name}
                </h3>
                <p className="text-light/70 text-sm mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline justify-center mb-4">
                  <span className="font-display font-bold text-4xl text-primary">
                    ${plan.price}
                  </span>
                  <span className="text-light/70 ml-1">/{plan.period}</span>
                </div>
              </CardHeader>
              
              <CardBody className="flex-grow">
                <ul className="space-y-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-light/30 mt-0.5 mr-3 flex-shrink-0" />
                      )}
                      <span className={feature.included ? 'text-light/90' : 'text-light/50'}>
                        {feature.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardBody>
              
              <CardFooter>
                <Button 
                  variant={plan.popular ? 'primary' : 'outline'} 
                  fullWidth
                >
                  Start {plan.name} Plan
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
    </Section>
  );
};

export default PricingSection;