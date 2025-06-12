import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';

interface BackButtonProps {
  to?: string;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ to, className }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleBack}
      leftIcon={<ChevronLeft className="w-5 h-5" />}
      className={className}
    >
      Back
    </Button>
  );
};