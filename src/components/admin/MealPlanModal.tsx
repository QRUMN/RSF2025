import React from 'react';

import UserNameWithPhoto from '../ui/UserNameWithPhoto';

interface MealPlanModalProps {
  open: boolean;
  onClose: () => void;
  clientName: string;
  profilePhotoUrl?: string;
  // Optionally, pass meal plan data here in the future
}

const MealPlanModal: React.FC<MealPlanModalProps> = ({ open, onClose, clientName, profilePhotoUrl }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-dark rounded-lg shadow-2xl max-w-lg w-full p-8 relative animate-fade-in">
        <button
          className="absolute top-3 right-3 text-light/70 hover:text-red-400 text-2xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="flex flex-col items-center mb-6">
          <UserNameWithPhoto name={clientName} photoUrl={profilePhotoUrl} size={40} className="mb-2" />
          <h2 className="text-2xl font-bold text-primary text-center">Meal Plan</h2>
        </div>
        <div className="text-light/80 text-center">
          {/* Replace with real meal plan content */}
          <p>Meal plan details will appear here.</p>
        </div>
      </div>
    </div>
  );
};

export default MealPlanModal;
