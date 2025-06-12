import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { 
  Calendar, 
  User, 
  Edit, 
  Trash2, 
  MessageSquare, 
  Plus, 
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { getMealPlanById, getMealPlanComments, addMealPlanComment } from '../../services/mealPlanningService';
import { MealPlanWithDays, MealPlanComment } from '../../types/mealPlanning';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Textarea } from '../../components/ui/Textarea';
import { PageHeader } from '../../components/layout/PageHeader';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { supabase } from '../../utils/supabaseClient';

const MealPlanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mealPlan, setMealPlan] = useState<MealPlanWithDays | null>(null);
  const [clientInfo, setClientInfo] = useState<{ name: string; email: string } | null>(null);
  const [comments, setComments] = useState<MealPlanComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCommentsLoading, setIsCommentsLoading] = useState(true);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'plan' | 'comments'>('plan');

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
        
        // Fetch client info
        const { data: clientData, error: clientError } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', planData.client_id)
          .single();
          
        if (clientError) {
          console.error('Error fetching client info:', clientError);
        } else if (clientData) {
          setClientInfo({
            name: clientData.full_name,
            email: clientData.email
          });
        }
      } catch (err) {
        console.error('Error fetching meal plan:', err);
        setError('Failed to load meal plan');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchComments = async () => {
      if (!id) return;
      
      setIsCommentsLoading(true);
      try {
        const commentsData = await getMealPlanComments(id);
        setComments(commentsData);
      } catch (err) {
        console.error('Error fetching comments:', err);
      } finally {
        setIsCommentsLoading(false);
      }
    };

    fetchMealPlan();
    fetchComments();
  }, [id]);

  const handleEditMealPlan = () => {
    if (id) {
      navigate(`/admin/meal-planning/edit/${id}`);
    }
  };

  const handleDeleteMealPlan = () => {
    // Implement delete confirmation modal
    if (window.confirm('Are you sure you want to delete this meal plan? This action cannot be undone.')) {
      // Implement delete logic
      console.log('Delete meal plan:', id);
    }
  };

  const handleAddComment = async () => {
    if (!id || !newComment.trim()) return;
    
    setIsAddingComment(true);
    try {
      const comment = await addMealPlanComment(id, newComment.trim());
      setComments(prev => [comment, ...prev]);
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Failed to add comment. Please try again.');
    } finally {
      setIsAddingComment(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'archived': return 'bg-gray-400';
      default: return 'bg-gray-500';
    }
  };

  const handleAddMeal = (dayId: string) => {
    // Navigate to add meal page or open modal
    console.log('Add meal to day:', dayId);
  };

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
        title={mealPlan.title}
        description={mealPlan.description || 'Meal plan details'}
        showBackButton
        backButtonLink="/admin/meal-planning"
        actions={
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              onClick={handleEditMealPlan}
              leftIcon={<Edit className="w-4 h-4" />}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteMealPlan}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Delete
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card className="bg-dark-surface border border-gray-800 p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-medium text-light">Plan Details</h2>
              <Badge className={`${getStatusBadgeColor(mealPlan.status)} text-white`}>
                {mealPlan.status.charAt(0).toUpperCase() + mealPlan.status.slice(1)}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <p className="text-light/70 text-sm">Client</p>
                  <div className="flex items-center text-light">
                    <User className="w-4 h-4 mr-2 text-primary" />
                    {clientInfo ? (
                      <span>{clientInfo.name} ({clientInfo.email})</span>
                    ) : (
                      <span>{mealPlan.client_id}</span>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-light/70 text-sm">Date Range</p>
                  <div className="flex items-center text-light">
                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                    <span>
                      {format(new Date(mealPlan.start_date), 'MMM d, yyyy')} - {format(new Date(mealPlan.end_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-light/70 text-sm mb-2">Nutritional Targets</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-dark-card p-3 rounded-md">
                    <p className="text-light/70 text-xs">Calories</p>
                    <p className="text-light text-lg font-medium">
                      {mealPlan.calories_target || 'Not set'}
                    </p>
                  </div>
                  <div className="bg-dark-card p-3 rounded-md">
                    <p className="text-light/70 text-xs">Protein</p>
                    <p className="text-light text-lg font-medium">
                      {mealPlan.protein_target ? `${mealPlan.protein_target}g` : 'Not set'}
                    </p>
                  </div>
                  <div className="bg-dark-card p-3 rounded-md">
                    <p className="text-light/70 text-xs">Carbs</p>
                    <p className="text-light text-lg font-medium">
                      {mealPlan.carbs_target ? `${mealPlan.carbs_target}g` : 'Not set'}
                    </p>
                  </div>
                  <div className="bg-dark-card p-3 rounded-md">
                    <p className="text-light/70 text-xs">Fat</p>
                    <p className="text-light text-lg font-medium">
                      {mealPlan.fat_target ? `${mealPlan.fat_target}g` : 'Not set'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="mb-6">
            <div className="flex border-b border-gray-800 mb-4">
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'plan' 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-light/70 hover:text-light'
                }`}
                onClick={() => setActiveTab('plan')}
              >
                Meal Plan
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'comments' 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-light/70 hover:text-light'
                }`}
                onClick={() => setActiveTab('comments')}
              >
                Comments
              </button>
            </div>

            {activeTab === 'plan' ? (
              <div>
                {mealPlan.days && mealPlan.days.length > 0 ? (
                  mealPlan.days.map((day) => (
                    <Card key={day.id} className="bg-dark-surface border border-gray-800 p-5 mb-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-light">
                          Day {day.day_number}: {format(new Date(day.day_date), 'EEEE, MMMM d, yyyy')}
                        </h3>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleAddMeal(day.id)}
                          leftIcon={<Plus className="w-4 h-4" />}
                        >
                          Add Meal
                        </Button>
                      </div>

                      {day.meals && day.meals.length > 0 ? (
                        <div className="space-y-3">
                          {day.meals.map((meal) => (
                            <div 
                              key={meal.id} 
                              className="bg-dark-card rounded-lg p-4 border border-gray-800 hover:border-primary/30 transition-colors"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center mb-2">
                                    <span className="text-primary font-medium capitalize">
                                      {meal.meal_type}
                                    </span>
                                    {meal.time_of_day && (
                                      <span className="text-light/50 text-sm ml-2 flex items-center">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {meal.time_of_day}
                                      </span>
                                    )}
                                  </div>
                                  
                                  {meal.items && meal.items.length > 0 ? (
                                    <ul className="space-y-1">
                                      {meal.items.map((item) => (
                                        <li key={item.id} className="text-light/80">
                                          {item.quantity} {item.unit} {item.custom_food_name || item.food_item_id}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-light/50 italic">No food items added yet</p>
                                  )}
                                </div>
                                
                                <div className="flex flex-col items-end">
                                  <div className="text-xs text-light/50 mb-1">Calories</div>
                                  <div className="text-light font-medium">
                                    {meal.total_calories || 0}
                                  </div>
                                </div>
                              </div>
                              
                              {meal.notes && (
                                <div className="mt-3 text-light/70 text-sm border-t border-gray-800 pt-2">
                                  {meal.notes}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-dark-card rounded-lg border border-dashed border-gray-700">
                          <p className="text-light/50 mb-4">No meals added for this day yet</p>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleAddMeal(day.id)}
                            leftIcon={<Plus className="w-4 h-4" />}
                          >
                            Add First Meal
                          </Button>
                        </div>
                      )}
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-16 bg-dark-surface rounded-lg border border-dashed border-gray-700">
                    <div className="mb-4">
                      <Calendar className="w-12 h-12 mx-auto text-primary/50" />
                    </div>
                    <h3 className="text-xl font-medium text-light mb-2">No days in this meal plan</h3>
                    <p className="text-light/70 mb-6">
                      Start by adding days to your meal plan
                    </p>
                    <Button
                      variant="primary"
                      leftIcon={<Plus className="w-4 h-4" />}
                    >
                      Add Days to Plan
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <Card className="bg-dark-surface border border-gray-800 p-6 mb-4">
                  <h3 className="text-lg font-medium text-light mb-4">Add Comment</h3>
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment or note about this meal plan..."
                    rows={3}
                    className="mb-4"
                  />
                  <div className="flex justify-end">
                    <Button
                      variant="primary"
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || isAddingComment}
                    >
                      {isAddingComment ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Post Comment
                        </>
                      )}
                    </Button>
                  </div>
                </Card>

                {isCommentsLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <LoadingSpinner size="md" />
                  </div>
                ) : comments.length > 0 ? (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <Card key={comment.id} className="bg-dark-surface border border-gray-800 p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                              {comment.user_id.substring(0, 1).toUpperCase()}
                            </div>
                            <span className="ml-2 font-medium text-light">
                              {comment.user_id}
                            </span>
                          </div>
                          <span className="text-light/50 text-sm">
                            {format(new Date(comment.created_at), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                        <p className="text-light/80 whitespace-pre-wrap">{comment.comment}</p>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-dark-surface rounded-lg border border-dashed border-gray-700">
                    <MessageSquare className="w-12 h-12 mx-auto text-primary/50 mb-4" />
                    <p className="text-light/70">No comments yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <Card className="bg-dark-surface border border-gray-800 p-6 mb-6 sticky top-24">
            <h3 className="text-lg font-medium text-light mb-4">Plan Summary</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-light/70 text-sm">Status</p>
                <div className="flex items-center">
                  <Badge className={`${getStatusBadgeColor(mealPlan.status)} text-white`}>
                    {mealPlan.status.charAt(0).toUpperCase() + mealPlan.status.slice(1)}
                  </Badge>
                </div>
              </div>
              
              <div>
                <p className="text-light/70 text-sm">Duration</p>
                <p className="text-light">
                  {mealPlan.days?.length || 0} days
                </p>
              </div>
              
              <div>
                <p className="text-light/70 text-sm">Total Meals</p>
                <p className="text-light">
                  {mealPlan.days?.reduce((total, day) => total + (day.meals?.length || 0), 0) || 0} meals
                </p>
              </div>
              
              <div className="pt-4 border-t border-gray-800">
                <Button
                  variant="secondary"
                  className="w-full mb-2"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message Client
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark as Active
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MealPlanDetailPage;
