import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, ArrowRight } from 'lucide-react';
import { Section } from '../components/ui/Section';
import { Card, CardHeader, CardBody, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { subscriptionPlans } from '../data/subscriptions';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '../components/ui/BackButton';

const PricingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/onboarding');
  };

  return (
    <>
      <Section className="pt-32 bg-gradient-radial">
        <div className="max-w-6xl mx-auto">
          <BackButton className="mb-6" />
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.span 
              className="inline-block py-1 px-3 text-xs font-semibold bg-primary/20 text-primary rounded-full mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              PRICING PLANS
            </motion.span>
            <motion.h1 
              className="text-4xl md:text-5xl font-display font-bold text-light mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Choose Your Path to Fitness
            </motion.h1>
            <motion.p 
              className="text-xl text-light/70"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Select a plan that fits your goals. All plans include access to our supportive community and expert guidance.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {subscriptionPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
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
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                      onClick={handleGetStarted}
                    >
                      Get Started
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-1/4 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>
      </Section>

      <Section className="bg-gradient-radial">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            className="text-3xl md:text-4xl font-display font-bold text-light mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Frequently Asked Questions
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-left bg-dark-surface/50 backdrop-blur-sm rounded-2xl p-6"
              >
                <h3 className="text-xl font-semibold text-light mb-3">{faq.question}</h3>
                <p className="text-light/70">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
};

const faqs = [
  {
    question: "What's included in the membership?",
    answer: "All memberships include access to our facility, basic equipment, and community features. Higher tiers add personal training, nutrition planning, and premium services."
  },
  {
    question: "Can I cancel my subscription?",
    answer: "Yes, you can cancel your subscription at any time. We offer a hassle-free cancellation process with no hidden fees."
  },
  {
    question: "Are there any contracts?",
    answer: "No long-term contracts required. Our memberships are month-to-month, giving you the flexibility to adjust your plan as needed."
  },
  {
    question: "Do you offer a trial period?",
    answer: "Yes! We offer a 7-day free trial for new members to experience our facilities and services before committing."
  }
];

export default PricingPage;