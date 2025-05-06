import React from 'react';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { Container } from '../ui/Container';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer className={`bg-dark-surface text-light pt-12 pb-8 ${className}`}>
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8">
          <div>
            <div className="flex items-center space-x-2 mb-5">
              <img 
                src="https://github.com/QRUMN/RSFIMG/blob/main/RSF_IconOnly_FullColor%20(1).png?raw=true"
                alt="RSF Logo"
                className="w-12 h-12 object-contain"
              />
              <span className="font-display font-bold text-2xl text-light">RSF</span>
            </div>
            <p className="text-light/70 mb-6">
              Transform your life through expert-led workouts, personalized nutrition plans, and a supportive community environment.
            </p>
            <div className="flex space-x-4">
              <SocialIcon icon={<Facebook className="w-5 h-5" />} />
              <SocialIcon icon={<Instagram className="w-5 h-5" />} />
              <SocialIcon icon={<Twitter className="w-5 h-5" />} />
              <SocialIcon icon={<Youtube className="w-5 h-5" />} />
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg text-light mb-5">Company</h3>
            <ul className="space-y-3">
              <FooterLink href="#">About Us</FooterLink>
              <FooterLink href="#">Our Team</FooterLink>
              <FooterLink href="#">Careers</FooterLink>
              <FooterLink href="#">Press</FooterLink>
              <FooterLink href="#">Contact</FooterLink>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg text-light mb-5">Resources</h3>
            <ul className="space-y-3">
              <FooterLink href="#">Blog</FooterLink>
              <FooterLink href="#">Workout Tips</FooterLink>
              <FooterLink href="#">Nutrition Guides</FooterLink>
              <FooterLink href="#">FAQ</FooterLink>
              <FooterLink href="#">Community</FooterLink>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg text-light mb-5">Legal</h3>
            <ul className="space-y-3">
              <FooterLink href="#">Terms of Service</FooterLink>
              <FooterLink href="#">Privacy Policy</FooterLink>
              <FooterLink href="#">Cookie Policy</FooterLink>
              <FooterLink href="#">Accessibility</FooterLink>
              <FooterLink href="#">GDPR Compliance</FooterLink>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-light/10 pt-8 mt-4 text-center sm:text-left sm:flex sm:justify-between sm:items-center">
          <p className="text-light/50 text-sm">
            &copy; {new Date().getFullYear()} Ready Set Fit. All rights reserved.
          </p>
          <div className="mt-4 sm:mt-0">
            <p className="text-light/50 text-sm">
              Designed and built with passion for fitness
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
};

interface SocialIconProps {
  icon: React.ReactNode;
}

const SocialIcon: React.FC<SocialIconProps> = ({ icon }) => {
  return (
    <a 
      href="#" 
      className="w-10 h-10 rounded-full bg-dark flex items-center justify-center text-light/70 hover:bg-primary hover:text-dark transition-colors duration-300"
    >
      {icon}
    </a>
  );
};

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
}

const FooterLink: React.FC<FooterLinkProps> = ({ href, children }) => {
  return (
    <li>
      <a 
        href={href} 
        className="text-light/70 hover:text-primary transition-colors duration-300"
      >
        {children}
      </a>
    </li>
  );
};

export { Footer };