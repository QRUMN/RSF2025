import React from 'react';
import { cn } from '../../utils/cn';
import { Container } from './Container';

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
  variant?: 'default' | 'gradient' | 'dark';
}

const Section: React.FC<SectionProps> = ({
  className,
  containerSize = 'lg',
  variant = 'default',
  children,
  ...props
}) => {
  const variantClasses = {
    default: 'bg-base',
    gradient: 'bg-gradient-radial',
    dark: 'bg-dark-surface',
  };

  return (
    <section
      className={cn(
        'py-16 md:py-24',
        'relative overflow-hidden',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      <Container size={containerSize}>
        <div className="relative z-10">{children}</div>
      </Container>
    </section>
  );
};

export { Section };