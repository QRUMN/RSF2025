import { Workout } from '../types';

export const featuredWorkouts: Workout[] = [
  {
    id: '1',
    title: 'Flex, Mobility & Recovery',
    level: 'beginner',
    duration: 45,
    category: 'Mobility',
    imageUrl: 'https://images.pexels.com/photos/6187290/pexels-photo-6187290.jpeg',
    description: 'Enhance flexibility, improve mobility, and accelerate recovery with guided stretching and mobility work.',
    instructorName: 'Maya Johnson',
    instructorImageUrl: 'https://images.pexels.com/photos/3812743/pexels-photo-3812743.jpeg'
  },
  {
    id: '2',
    title: 'Strength & Core Building',
    level: 'intermediate',
    duration: 50,
    category: 'Strength',
    imageUrl: 'https://raw.githubusercontent.com/QRUMN/RSFIMG/main/Coreshot.png',
    description: 'Build functional strength and core stability with compound movements and targeted exercises.',
    instructorName: 'Zara Williams',
    instructorImageUrl: 'https://images.pexels.com/photos/7991662/pexels-photo-7991662.jpeg'
  },
  {
    id: '3',
    title: 'Nutrition Plans',
    level: 'beginner',
    duration: 30,
    category: 'Nutrition',
    imageUrl: 'https://raw.githubusercontent.com/QRUMN/RSFIMG/main/Nutrition%20Plans.png',
    description: 'Personalized nutrition guidance with meal plans, recipes, and expert dietary advice.',
    instructorName: 'Sofia Rodriguez',
    instructorImageUrl: 'https://images.pexels.com/photos/7433885/pexels-photo-7433885.jpeg'
  }
];