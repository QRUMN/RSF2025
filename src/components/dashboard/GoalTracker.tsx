import React, { useState } from 'react';
import { Target, Plus } from 'lucide-react';
import { Card, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { AddGoalModal } from './AddGoalModal';

interface Goal {
  id: string;
  title: string;
  progress: number;
  target: number;
  unit: string;
}

interface GoalTrackerProps {
  goals: Goal[];
  isPremium: boolean;
  onRefresh: () => void;
}

export const GoalTracker: React.FC<GoalTrackerProps> = ({ goals, isPremium, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Card>
        <CardBody>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-light">Goals</h3>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsModalOpen(true)}
            >
              Add Goal
            </Button>
          </div>

          <div className="space-y-4">
            {goals.map(goal => (
              <div key={goal.id} className="bg-dark-surface p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Target className="w-5 h-5 text-primary mr-2" />
                    <h4 className="font-medium text-light">{goal.title}</h4>
                  </div>
                  <span className="text-sm text-primary">
                    {goal.progress} / {goal.target} {goal.unit}
                  </span>
                </div>
                <div className="w-full h-2 bg-dark rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${(goal.progress / goal.target) * 100}%` }}
                  />
                </div>
              </div>
            ))}

            {!isPremium && (
              <div className="text-center p-4">
                <p className="text-light/70 text-sm">
                  Upgrade to premium to set unlimited goals and access advanced tracking features.
                </p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      <AddGoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={onRefresh}
      />
    </>
  );
};