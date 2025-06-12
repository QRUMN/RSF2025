export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  providerId: string;
}

export interface Provider {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  imageUrl: string;
  availability: {
    [key: string]: TimeSlot[];
  };
}

export interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  providerId: string;
  date: string;
  timeSlot: TimeSlot;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}