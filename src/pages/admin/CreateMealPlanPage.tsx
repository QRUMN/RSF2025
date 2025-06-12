import React from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import MealPlanForm from '../../components/mealPlanning/MealPlanForm';

const CreateMealPlanPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4">
      <PageHeader 
        title="Create Meal Plan"
        description="Create a new meal plan for your client"
        showBackButton
        backButtonLink="/admin/meal-planning"
      />
      
      <MealPlanForm />
    </div>
  );
};

export default CreateMealPlanPage;
