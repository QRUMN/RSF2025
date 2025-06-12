import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMealPlanById } from '../../services/mealPlanningService';
import { MealPlan } from '../../types/mealPlanning';
import { PageHeader } from '../../components/layout/PageHeader';
import MealPlanForm from '../../components/mealPlanning/MealPlanForm';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

const EditMealPlanPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMealPlan = async () => {
      if (!id) {
        setError('No meal plan ID provided');
        setIsLoading(false);
        return;
      }

      try {
        const planData = await getMealPlanById(id);
        if (!planData) {
          setError('Meal plan not found');
          setIsLoading(false);
          return;
        }
        
        setMealPlan(planData);
      } catch (err) {
        console.error('Error fetching meal plan:', err);
        setError('Failed to load meal plan');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMealPlan();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !mealPlan) {
    return (
      <div className="container mx-auto px-4">
        <PageHeader 
          title="Error"
          description={error || 'Failed to load meal plan'}
          showBackButton
          backButtonLink="/admin/meal-planning"
        />
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-light">
          <p>{error || 'An error occurred while loading the meal plan. Please try again.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <PageHeader 
        title={`Edit: ${mealPlan.title}`}
        description="Update meal plan details"
        showBackButton
        backButtonLink={`/admin/meal-planning/${mealPlan.id}`}
      />
      
      <MealPlanForm mealPlan={mealPlan} isEdit={true} />
    </div>
  );
};

export default EditMealPlanPage;
