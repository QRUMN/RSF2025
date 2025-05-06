import { Testimonial } from '../types';

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Jasmine Williams',
    role: 'Pro Member',
    location: 'New York, USA',
    imageUrl: 'https://images.pexels.com/photos/3812743/pexels-photo-3812743.jpeg',
    quote: 'RSF completely transformed my approach to fitness. The personalized plans and supportive community kept me motivated to reach my goals. I\'ve lost 30 pounds and gained so much confidence!',
    rating: 5,
    stats: {
      weightLoss: '30 lbs',
      daysActive: '180+',
      workoutsCompleted: '120'
    }
  },
  {
    id: '2',
    name: 'Aisha Patel',
    role: 'Elite Member',
    location: 'London, UK',
    imageUrl: 'https://images.pexels.com/photos/7991662/pexels-photo-7991662.jpeg',
    quote: 'The personal coaching through RSF Elite helped me achieve my fitness goals. The trainers are incredibly knowledgeable and supportive. I\'ve never felt stronger or more confident!',
    rating: 5,
    stats: {
      weightLoss: '25 lbs',
      daysActive: '240+',
      workoutsCompleted: '160'
    }
  },
  {
    id: '3',
    name: 'Carmen Rodriguez',
    role: 'Basic Member',
    location: 'Miami, USA',
    imageUrl: 'https://images.pexels.com/photos/7433885/pexels-photo-7433885.jpeg',
    quote: 'Even the Basic plan provides tremendous value. The community challenges keep me motivated and I\'ve seen consistent progress week after week. The nutrition guidance has been a game-changer!',
    rating: 5,
    stats: {
      weightLoss: '20 lbs',
      daysActive: '150+',
      workoutsCompleted: '90'
    }
  }
];