import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Camera } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { AddProgressPhotoModal } from './AddProgressPhotoModal';

interface ProgressPhoto {
  id: string;
  photo_url: string;
  photo_date: string;
  category: string;
  notes: string;
}

export const ProgressGallery: React.FC = () => {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPhotos();
    }
  }, [user]);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('progress_photos')
        .select('*')
        .eq('user_id', user?.id)
        .order('photo_date', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'front':
        return 'Front View';
      case 'back':
        return 'Back View';
      case 'side':
        return 'Side View';
      default:
        return category;
    }
  };

  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-light">Progress Photos</h3>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Add Photo
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : photos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative"
              >
                <img
                  src={photo.photo_url}
                  alt={`Progress photo - ${getCategoryLabel(photo.category)}`}
                  className="w-full aspect-square object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-primary text-sm font-medium mb-1">
                      {getCategoryLabel(photo.category)}
                    </p>
                    <p className="text-light/70 text-sm">
                      {format(new Date(photo.photo_date), 'MMM d, yyyy')}
                    </p>
                    {photo.notes && (
                      <p className="text-light text-sm mt-2 line-clamp-2">
                        {photo.notes}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Camera className="w-12 h-12 text-primary/50 mx-auto mb-4" />
            <p className="text-light/70 mb-4">No progress photos yet</p>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(true)}
            >
              Add Your First Photo
            </Button>
          </div>
        )}
      </CardBody>

      <AddProgressPhotoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchPhotos}
      />
    </Card>
  );
};