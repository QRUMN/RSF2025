import React from 'react';
import HeroSection from '../components/sections/HeroSection';
import BenefitsSection from '../components/sections/BenefitsSection';
import FeaturedWorkoutsSection from '../components/sections/FeaturedWorkoutsSection';
import GallerySection from '../components/sections/GallerySection';
import TestimonialsSection from '../components/sections/TestimonialsSection';
import PricingSection from '../components/sections/PricingSection';
import CtaSection from '../components/sections/CtaSection';

const HomePage: React.FC = () => {
  return (
    <>
      <HeroSection />
      <BenefitsSection />
      <FeaturedWorkoutsSection />
      <GallerySection />
      <TestimonialsSection />
      <PricingSection />
      <CtaSection />
    </>
  );
};

export default HomePage;