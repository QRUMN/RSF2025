import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, Search, Calendar, User, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { getMealPlans } from '../../services/mealPlanningService';
import { MealPlan } from '../../types/mealPlanning';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { PageHeader } from '../../components/layout/PageHeader';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

const MealPlanningPage: React.FC = () => {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<MealPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMealPlans = async () => {
      try {
        const plans = await getMealPlans();
        setMealPlans(plans);
        setFilteredPlans(plans);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching meal plans:', error);
        setIsLoading(false);
      }
    };

    fetchMealPlans();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = [...mealPlans];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(plan => 
        plan.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(plan => plan.status === statusFilter);
    }

    setFilteredPlans(filtered);
  }, [searchTerm, statusFilter, mealPlans]);

  const handleCreateMealPlan = () => {
    navigate('/admin/meal-planning/create');
  };

  const handleEditMealPlan = (id: string) => {
    navigate(`/admin/meal-planning/edit/${id}`);
  };

  const handleViewMealPlan = (id: string) => {
    navigate(`/admin/meal-planning/${id}`);
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

  return (
    <div className="container mx-auto px-4">
      <PageHeader 
        title="Meal Planning"
        description="Create and manage meal plans for your clients"
        actions={
          <Button
            variant="primary"
            onClick={handleCreateMealPlan}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Meal Plan
          </Button>
        }
      />

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search meal plans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-dark-surface text-light border border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
          <Button
            variant="secondary"
            leftIcon={<Filter className="w-4 h-4" />}
          >
            More Filters
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="text-center py-16 bg-dark-surface rounded-lg">
          <div className="mb-4">
            <Calendar className="w-12 h-12 mx-auto text-primary" />
          </div>
          <h3 className="text-xl font-medium text-light mb-2">No meal plans found</h3>
          <p className="text-light/70 mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? "Try adjusting your search or filters"
              : "Get started by creating your first meal plan"}
          </p>
          <Button
            variant="primary"
            onClick={handleCreateMealPlan}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Meal Plan
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <Card key={plan.id} className="bg-dark-surface border border-gray-800 overflow-hidden">
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 
                    className="text-lg font-medium text-light hover:text-primary cursor-pointer"
                    onClick={() => handleViewMealPlan(plan.id)}
                  >
                    {plan.title}
                  </h3>
                  <Badge className={`${getStatusBadgeColor(plan.status)} text-white`}>
                    {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="flex items-center text-light/70 mb-3">
                  <User className="w-4 h-4 mr-2" />
                  <span>Client ID: {plan.client_id.substring(0, 8)}...</span>
                </div>
                
                <div className="flex items-center text-light/70 mb-4">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>
                    {format(new Date(plan.start_date), 'MMM d, yyyy')} - {format(new Date(plan.end_date), 'MMM d, yyyy')}
                  </span>
                </div>
                
                {plan.description && (
                  <p className="text-light/70 mb-4 line-clamp-2">{plan.description}</p>
                )}
                
                <div className="flex justify-between items-center mt-4">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditMealPlan(plan.id)}
                      leftIcon={<Edit className="w-4 h-4" />}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:bg-red-500/10"
                      leftIcon={<Trash2 className="w-4 h-4" />}
                    >
                      Delete
                    </Button>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleViewMealPlan(plan.id)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MealPlanningPage;
