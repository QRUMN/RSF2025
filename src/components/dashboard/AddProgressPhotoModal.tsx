import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ImageUploader } from '../ui/ImageUploader';

interface AddProgressPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddProgressPhotoModal: React.FC<AddProgressPhotoModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [category, setCategory] = useState('front');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !photoUrl) return;

    setLoading(true);
    setError(null);

    try {
      const { error: dbError } = await supabase
        .from('progress_photos')
        .insert({
          user_id: user.id,
          photo_url: photoUrl,
          category,
          notes
        });

      if (dbError) throw dbError;

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save photo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-dark/80"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md bg-dark-surface rounded-2xl shadow-xl p-6"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-light/50 hover:text-light transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-display font-bold text-light mb-6">
              Add Progress Photo
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-light/70 mb-2">
                  Photo Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-dark border border-primary/20 rounded-lg py-2 px-4 text-light focus:outline-none focus:border-primary"
                  required
                >
                  <option value="front">Front View</option>
                  <option value="back">Back View</option>
                  <option value="side">Side View</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-light/70 mb-2">
                  Photo
                </label>
                <ImageUploader
                  bucket="progress-photos"
                  path={`${user?.id}/`}
                  onUpload={(url) => setPhotoUrl(url)}
                  aspectRatio={1}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-light/70 mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-dark border border-primary/20 rounded-lg py-2 px-4 text-light placeholder-light/30 focus:outline-none focus:border-primary min-h-[100px]"
                  placeholder="Add any notes about this photo..."
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading || !photoUrl}
                >
                  {loading ? 'Saving...' : 'Save Photo'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};