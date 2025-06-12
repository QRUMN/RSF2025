export type Workout = {
  id: string;
  title: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  category: string;
  imageUrl: string;
  description: string;
  instructorName: string;
  instructorImageUrl: string;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  location: string;
  imageUrl: string;
  quote: string;
  rating: number;
  stats: {
    weightLoss: string;
    daysActive: string;
    workoutsCompleted: string;
  };
};

export type PlanFeature = {
  included: boolean;
  title: string;
  description?: string;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: PlanFeature[];
  popular?: boolean;
  color: string;
};

export type Benefit = {
  id: string;
  title: string;
  description: string;
  icon: string;
};