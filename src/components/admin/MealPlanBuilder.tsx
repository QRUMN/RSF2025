import React, { useState } from 'react';
import TemplateSelector from './TemplateSelector';

interface Client {
  id: string;
  name: string;
}

interface MealPlanBuilderProps {
  client: Client;
  onClose: () => void;
}

// Template data (should match TemplateSelector)
const templates = [
  {
    id: 'weight-loss',
    title: 'Weight Loss',
    description: 'Meal plan optimized for fat loss and healthy weight management.',
  },
  {
    id: 'muscle-gain',
    title: 'Muscle Gain',
    description: 'Meal plan designed to help build strength and muscle mass.',
  },
  {
    id: 'endurance',
    title: 'Endurance',
    description: 'Meal plan for improving stamina and cardiovascular health.',
  },
  {
    id: 'flexibility',
    title: 'Flexibility',
    description: 'Meal plan to enhance mobility and reduce injury risk.',
  },
  {
    id: 'balanced',
    title: 'Balanced',
    description: 'A balanced plan for general fitness and well-being.',
  },
];

const MealPlanBuilder: React.FC<MealPlanBuilderProps> = ({ client, onClose }) => {
  const [planName, setPlanName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(undefined);
  // TODO: Replace with real goals and dietary prefs from user profile or props
  const [selectedGoals] = useState<string[]>(['Weight Loss', 'Muscle Gain']);
  const [selectedDietaryPrefs] = useState<string[]>(['No Restrictions', 'Vegetarian']);
  const [days, setDays] = useState([
    { dayNumber: 1, meals: [{ mealType: 'breakfast', foods: [''] }] },
  ]);

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setPlanName(template.title);
      setDescription(template.description);
    }
  };

  // Add Day (for demo, just adds one more day)
  const addDay = () => {
    setDays([
      ...days,
      { dayNumber: days.length + 1, meals: [{ mealType: 'breakfast', foods: [''] }] },
    ]);
  };

  // Add Meal to a Day
  const addMeal = (dayIdx: number) => {
    const newDays = [...days];
    newDays[dayIdx].meals.push({ mealType: '', foods: [''] });
    setDays(newDays);
  };

  // Update meal type
  const updateMealType = (dayIdx: number, mealIdx: number, value: string) => {
    const newDays = [...days];
    newDays[dayIdx].meals[mealIdx].mealType = value;
    setDays(newDays);
  };

  // Update food for a meal
  const updateFood = (dayIdx: number, mealIdx: number, foodIdx: number, value: string) => {
    const newDays = [...days];
    newDays[dayIdx].meals[mealIdx].foods[foodIdx] = value;
    setDays(newDays);
  };

  // Add food to a meal
  const addFood = (dayIdx: number, mealIdx: number) => {
    const newDays = [...days];
    newDays[dayIdx].meals[mealIdx].foods.push('');
    setDays(newDays);
  };

  // Remove food from a meal
  const removeFood = (dayIdx: number, mealIdx: number, foodIdx: number) => {
    const newDays = [...days];
    newDays[dayIdx].meals[mealIdx].foods.splice(foodIdx, 1);
    setDays(newDays);
  };


  // Save Plan (stub)
  const savePlan = () => {
    // TODO: Save to Supabase
    alert(`Meal plan for ${client.name} would be saved!`);
    onClose();
  };

  return (
    <div className="bg-dark text-light rounded-xl shadow-soft max-w-2xl mx-auto p-0 border border-primary/20">
      {/* Modern Header */}
      <div className="flex items-center gap-4 px-8 py-6 bg-gradient-to-r from-primary/90 to-green-400/70 rounded-t-xl border-b border-primary/20 shadow-soft">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white/20">
          <span className="text-2xl font-bold text-white">{client.name.split(' ').map(n => n[0]).join('')}</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">Create Meal Plan</span>
            <span className="ml-2 px-3 py-1 rounded-full bg-white/10 text-xs text-white/80 font-medium">for {client.name}</span>
          </div>
          <div className="text-white/80 text-sm mt-1">Assign a custom 90-day meal plan to your client.</div>
        </div>
      </div>
      <div className="p-8">
        {/* Template Selector Section */}
        <TemplateSelector
          selectedGoals={selectedGoals}
          selectedDietaryPrefs={selectedDietaryPrefs}
          onSelect={handleTemplateSelect}
          selectedTemplateId={selectedTemplateId}
        />
        <div className="mb-4">
          <label className="block mb-1 text-light/80 font-medium">Plan Name:</label>
          <input value={planName} onChange={e => setPlanName(e.target.value)} className="w-full px-4 py-2 rounded-md bg-dark border border-primary/30 text-light focus:ring-2 focus:ring-primary outline-none transition" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-light/80 font-medium">Description:</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 rounded-md bg-dark border border-primary/30 text-light focus:ring-2 focus:ring-primary outline-none transition" />
        </div>
        <h3 className="text-lg font-semibold text-primary mb-2">Days</h3>
        <div className="flex flex-col gap-6 mb-6">
          {days.map((day, dayIdx) => (
            <div key={day.dayNumber} className="relative flex flex-col md:flex-row md:items-start gap-4 bg-dark/70 rounded-xl shadow border border-primary/10 p-6">
              {/* Day Badge */}
              <div className="absolute -left-5 top-6 md:static md:mr-6 flex flex-col items-center">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white text-lg font-bold shadow-lg border-4 border-dark">{day.dayNumber}</span>
                {dayIdx < days.length - 1 && (
                  <span className="hidden md:block w-px h-10 bg-primary/30 mt-1"></span>
                )}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-primary mb-3">Day {day.dayNumber}</div>
                <div className="flex flex-col gap-4">
                  {day.meals.map((meal, mealIdx) => (
                    <div key={mealIdx} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 bg-dark/90 rounded-lg p-3 border border-primary/10">
                      <label className="flex items-center gap-2 text-light/80">
                        <span className="hidden md:inline">Meal Type:</span>
                        <select value={meal.mealType} onChange={e => updateMealType(dayIdx, mealIdx, e.target.value)} className="rounded-md bg-dark border border-primary/30 text-light px-2 py-1 focus:ring-2 focus:ring-primary outline-none">
                          <option value="">Type</option>
                          <option value="breakfast">Breakfast</option>
                          <option value="lunch">Lunch</option>
                          <option value="dinner">Dinner</option>
                          <option value="snack">Snack</option>
                        </select>
                      </label>
                      <span className="text-light/60">Foods:</span>
                      <div className="flex flex-wrap gap-2">
                        {meal.foods.map((food, foodIdx) => (
  <div key={foodIdx} className="flex items-center gap-1">
    <input
      value={food}
      placeholder="Food name"
      onChange={e => updateFood(dayIdx, mealIdx, foodIdx, e.target.value)}
      className="rounded-md bg-dark border border-primary/30 text-light px-2 py-1 focus:ring-2 focus:ring-primary outline-none min-w-[120px]"
    />
    <button
      type="button"
      onClick={() => removeFood(dayIdx, mealIdx, foodIdx)}
      className="text-red-400 hover:text-red-600 px-2 py-1 rounded-full text-lg font-bold"
      aria-label="Remove food"
    >
      -
    </button>
  </div>
))}
                        <button type="button" onClick={() => addFood(dayIdx, mealIdx)} className="text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 ml-1 flex items-center gap-1">
                          <span className="font-bold text-lg leading-none">+</span> <span>Add Food</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => addMeal(dayIdx)} className="text-xs px-3 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 mt-2 w-max flex items-center gap-1">
                    <span className="font-bold text-lg leading-none">+</span> <span>Add Meal</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={addDay} className="mb-6 text-xs px-4 py-2 rounded bg-primary/10 text-primary hover:bg-primary/20">+ Add Day</button>
        <div className="flex gap-4 mt-6">
          <button onClick={savePlan} className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-2 rounded-lg transition">Save Meal Plan</button>
          <button onClick={onClose} className="text-light/60 hover:text-primary underline">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default MealPlanBuilder;
