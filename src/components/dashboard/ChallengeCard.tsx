import React from 'react';
import { Trophy, Users, Clock } from 'lucide-react';
import { Card, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';

interface ChallengeCardProps {
  challenge: {
    id: string;
    title: string;
    description: string;
    participants: number;
    daysLeft: number;
    isPremium: boolean;
  };
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge }) => {
  return (
    <Card hover className="h-full">
      <CardBody>
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mr-4">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-light">{challenge.title}</h3>
            {challenge.isPremium && (
              <span className="text-xs text-primary">Premium Challenge</span>
            )}
          </div>
        </div>
        <p className="text-light/70 mb-4">{challenge.description}</p>
        <div className="flex items-center justify-between text-sm text-light/50 mb-4">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            <span>{challenge.participants} participants</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>{challenge.daysLeft} days left</span>
          </div>
        </div>
        <Button
          variant={challenge.isPremium ? 'primary' : 'outline'}
          fullWidth
        >
          {challenge.isPremium ? 'Join Challenge' : 'Upgrade to Join'}
        </Button>
      </CardBody>
    </Card>
  );
};