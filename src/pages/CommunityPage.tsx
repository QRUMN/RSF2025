import React from 'react';
// ... rest of the imports
import { BackButton } from '../components/ui/BackButton';

const CommunityPage = () => {
  return (
    <>
      <Section className="pt-40 md:pt-48 bg-gradient-radial">
        <div className="max-w-6xl mx-auto">
          <BackButton className="mb-6" />
          <motion.h2 
            className="text-4xl md:text-5xl font-display font-bold text-center text-light mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Real People Getting Real Results
          </motion.h2>
          {/* Rest of the existing JSX */}
        </div>
      </Section>
    </>
  );
};

export default CommunityPage;