import React from 'react';

const templates = [
  {
    id: 'weight-loss',
    title: 'Weight Loss',
    description: 'Meal plan optimized for fat loss and healthy weight management.',
    goals: ['Weight Loss'],
    dietaryPrefs: ['No Restrictions', 'Vegetarian', 'Vegan', 'Keto'],
  },
  {
    id: 'muscle-gain',
    title: 'Muscle Gain',
    description: 'Meal plan designed to help build strength and muscle mass.',
    goals: ['Muscle Gain'],
    dietaryPrefs: ['No Restrictions', 'Vegetarian', 'Vegan', 'Keto'],
  },
  {
    id: 'endurance',
    title: 'Endurance',
    description: 'Meal plan for improving stamina and cardiovascular health.',
    goals: ['Endurance'],
    dietaryPrefs: ['No Restrictions', 'Vegetarian', 'Vegan'],
  },
  {
    id: 'flexibility',
    title: 'Flexibility',
    description: 'Meal plan to enhance mobility and reduce injury risk.',
    goals: ['Flexibility'],
    dietaryPrefs: ['No Restrictions', 'Vegetarian', 'Vegan'],
  },
  {
    id: 'balanced',
    title: 'Balanced',
    description: 'A balanced plan for general fitness and well-being.',
    goals: ['Weight Loss', 'Muscle Gain', 'Endurance', 'Flexibility'],
    dietaryPrefs: ['No Restrictions', 'Vegetarian', 'Vegan', 'Keto'],
  },
];

interface TemplateSelectorProps {
  selectedGoals: string[];
  selectedDietaryPrefs: string[];
  onSelect: (templateId: string) => void;
  selectedTemplateId?: string;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ selectedGoals, selectedDietaryPrefs, onSelect, selectedTemplateId }) => {
  // Filter templates based on at least one matching goal AND dietary preference
  const filteredTemplates = templates.filter(template =>
    template.goals.some(goal => selectedGoals.includes(goal)) &&
    (selectedDietaryPrefs.length === 0 || template.dietaryPrefs.some(pref => selectedDietaryPrefs.includes(pref)))
  );

  // Auto-suggestion logic
  let suggestedTemplate: typeof templates[0] | null = null;
  if (filteredTemplates.length === 1) {
    suggestedTemplate = filteredTemplates[0];
  } else if (filteredTemplates.length > 1) {
    // Score templates by number of matching goals + dietaryPrefs
    const scored = filteredTemplates.map(template => {
      const goalMatches = template.goals.filter(goal => selectedGoals.includes(goal)).length;
      const dietaryMatches = template.dietaryPrefs.filter(pref => selectedDietaryPrefs.includes(pref)).length;
      return { ...template, score: goalMatches + dietaryMatches };
    });
    const maxScore = Math.max(...scored.map(t => t.score));
    const top = scored.filter(t => t.score === maxScore);
    if (top.length === 1) suggestedTemplate = top[0];
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-2 text-primary">Choose a Pre-Made Template</h2>
      <p className="mb-4 text-light/70">Select a meal plan template that matches your fitness goals.</p>
      {suggestedTemplate && (
        <div className="mb-4 p-4 rounded border-l-4 border-green-400 bg-green-700/10 text-green-200">
          <strong>Suggested Template:</strong> <span className="font-semibold">{suggestedTemplate.title}</span> — {suggestedTemplate.description}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map(template => (
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            className={`text-left rounded-lg border px-6 py-4 transition shadow
              ${selectedTemplateId === template.id ? 'bg-primary/20 border-primary text-primary font-semibold' :
                suggestedTemplate && suggestedTemplate.id === template.id ? 'border-green-400 bg-green-700/10 text-green-200 font-semibold ring-2 ring-green-400' :
                'bg-dark border-primary/10 text-light hover:bg-primary/10'}`}
          >
            {suggestedTemplate && suggestedTemplate.id === template.id && (
              <div className="mb-1 text-xs uppercase tracking-wide font-bold text-green-400">Suggested</div>
            )}
            <div className="text-lg font-semibold mb-1">{template.title}</div>
            <div className="text-light/70 text-sm">{template.description}</div>
          </button>
        ))}
        {filteredTemplates.length === 0 && (
          <div className="col-span-2 text-light/50 text-center py-6">No templates match your selected goals.</div>
        )}
      </div>
    </div>
  );
};

export default TemplateSelector;
