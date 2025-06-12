import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, differenceInDays } from 'date-fns';
import { Calendar, User, AlertCircle, Plus, Trash2, Info } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { createMealPlan, updateMealPlan } from '../../services/mealPlanningService';
import { MealPlan, MealPlanFormInput } from '../../types/mealPlanning';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Card } from '../ui/Card';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { supabase } from '../../utils/supabaseClient';

interface MealPlanFormProps {
  mealPlan?: MealPlan;
  isEdit?: boolean;
}

interface Client {
  id: string;
  full_name: string;
  email: string;
}

const MealPlanForm: React.FC<MealPlanFormProps> = ({ mealPlan, isEdit = false }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Form state
  const [formData, setFormData] = useState<MealPlanFormInput>({
    title: mealPlan?.title || '',
    description: mealPlan?.description || '',
    client_id: mealPlan?.client_id || '',
    start_date: mealPlan ? new Date(mealPlan.start_date) : new Date(),
    end_date: mealPlan ? new Date(mealPlan.end_date) : addDays(new Date(), 7),
    calories_target: mealPlan?.calories_target || undefined,
    protein_target: mealPlan?.protein_target || undefined,
    carbs_target: mealPlan?.carbs_target || undefined,
    fat_target: mealPlan?.fat_target || undefined
  });

  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      try {
        // Fetch clients from profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .order('full_name', { ascending: true });
        
        if (error) throw error;
        setClients(data || []);
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? undefined : Number(value)
    }));
  };

  const handleDateChange = (field: 'start_date' | 'end_date', date: Date | null) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        [field]: date
      }));
      
      // If start date is after end date, update end date
      if (field === 'start_date' && date > formData.end_date) {
        setFormData(prev => ({
          ...prev,
          end_date: addDays(date, 7)
        }));
      }
      
      // Clear error when field is edited
      if (formErrors[field]) {
        setFormErrors(prev => {
          const updated = { ...prev };
          delete updated[field];
          return updated;
        });
      }
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.client_id) {
      errors.client_id = 'Client is required';
    }
    
    if (!formData.start_date) {
      errors.start_date = 'Start date is required';
    }
    
    if (!formData.end_date) {
      errors.end_date = 'End date is required';
    }
    
    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      errors.end_date = 'End date must be after start date';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSaving(true);
    
    try {
      if (isEdit && mealPlan) {
        // Update existing meal plan
        await updateMealPlan(mealPlan.id, {
          title: formData.title,
          description: formData.description || null,
          client_id: formData.client_id,
          start_date: format(formData.start_date, 'yyyy-MM-dd'),
          end_date: format(formData.end_date, 'yyyy-MM-dd'),
          calories_target: formData.calories_target || null,
          protein_target: formData.protein_target || null,
          carbs_target: formData.carbs_target || null,
          fat_target: formData.fat_target || null
        });
        
        navigate(`/admin/meal-planning/${mealPlan.id}`);
      } else {
        // Create new meal plan
        const newMealPlan = await createMealPlan(formData);
        navigate(`/admin/meal-planning/${newMealPlan.id}`);
      }
    } catch (error) {
      console.error('Error saving meal plan:', error);
      alert('Failed to save meal plan. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const planDuration = differenceInDays(formData.end_date, formData.start_date) + 1;

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit}>
        <Card className="bg-dark-surface border border-gray-800 p-6 mb-6">
          <h2 className="text-xl font-medium text-light mb-4">
            {isEdit ? 'Edit Meal Plan' : 'Create New Meal Plan'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="title" className="block text-light mb-2">
                Plan Title*
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="E.g., Weight Loss Plan, Muscle Building Plan"
                className={formErrors.title ? 'border-red-500' : ''}
              />
              {formErrors.title && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" /> {formErrors.title}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="client_id" className="block text-light mb-2">
                Client*
              </label>
              <select
                id="client_id"
                name="client_id"
                value={formData.client_id}
                onChange={handleInputChange}
                className={`w-full bg-dark-surface text-light border ${
                  formErrors.client_id ? 'border-red-500' : 'border-gray-700'
                } rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50`}
              >
                <option value="">Select a client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.full_name} ({client.email})
                  </option>
                ))}
              </select>
              {formErrors.client_id && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" /> {formErrors.client_id}
                </p>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="description" className="block text-light mb-2">
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the goals and purpose of this meal plan..."
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="start_date" className="block text-light mb-2">
                Start Date*
              </label>
              <div className="relative">
                <DatePicker
                  selected={formData.start_date}
                  onChange={(date) => handleDateChange('start_date', date)}
                  dateFormat="yyyy-MM-dd"
                  className={`w-full bg-dark-surface text-light border ${
                    formErrors.start_date ? 'border-red-500' : 'border-gray-700'
                  } rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50`}
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
              {formErrors.start_date && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" /> {formErrors.start_date}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="end_date" className="block text-light mb-2">
                End Date*
              </label>
              <div className="relative">
                <DatePicker
                  selected={formData.end_date}
                  onChange={(date) => handleDateChange('end_date', date)}
                  dateFormat="yyyy-MM-dd"
                  minDate={formData.start_date}
                  className={`w-full bg-dark-surface text-light border ${
                    formErrors.end_date ? 'border-red-500' : 'border-gray-700'
                  } rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50`}
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
              {formErrors.end_date && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" /> {formErrors.end_date}
                </p>
              )}
              <p className="text-light/70 text-sm mt-1">
                Plan duration: {planDuration} day{planDuration !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-light font-medium mb-3">Nutritional Targets (Optional)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="calories_target" className="block text-light mb-2">
                  Daily Calories
                </label>
                <Input
                  id="calories_target"
                  name="calories_target"
                  type="number"
                  min="0"
                  value={formData.calories_target || ''}
                  onChange={handleNumberInputChange}
                  placeholder="e.g., 2000"
                />
              </div>
              
              <div>
                <label htmlFor="protein_target" className="block text-light mb-2">
                  Protein (g)
                </label>
                <Input
                  id="protein_target"
                  name="protein_target"
                  type="number"
                  min="0"
                  value={formData.protein_target || ''}
                  onChange={handleNumberInputChange}
                  placeholder="e.g., 150"
                />
              </div>
              
              <div>
                <label htmlFor="carbs_target" className="block text-light mb-2">
                  Carbs (g)
                </label>
                <Input
                  id="carbs_target"
                  name="carbs_target"
                  type="number"
                  min="0"
                  value={formData.carbs_target || ''}
                  onChange={handleNumberInputChange}
                  placeholder="e.g., 200"
                />
              </div>
              
              <div>
                <label htmlFor="fat_target" className="block text-light mb-2">
                  Fat (g)
                </label>
                <Input
                  id="fat_target"
                  name="fat_target"
                  type="number"
                  min="0"
                  value={formData.fat_target || ''}
                  onChange={handleNumberInputChange}
                  placeholder="e.g., 65"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-8">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/admin/meal-planning')}
              disabled={isSaving}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {isEdit ? 'Saving...' : 'Creating...'}
                </>
              ) : (
                isEdit ? 'Save Changes' : 'Create Meal Plan'
              )}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default MealPlanForm;
