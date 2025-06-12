import React, { useState, useRef } from 'react';
import { Upload, X, Camera } from 'lucide-react';
import { Button } from './Button';
import { supabase } from '../../lib/supabase';

interface ImageUploaderProps {
  onUpload: (url: string) => void;
  bucket: string;
  path?: string;
  maxSize?: number; // in MB
  aspectRatio?: number;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUpload,
  bucket,
  path = '',
  maxSize = 5,
  aspectRatio,
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset error state
    setError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `${path}${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onUpload(publicUrl);
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        ref={fileInputRef}
        id="image-upload"
      />

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className={`w-full object-cover rounded-lg ${
              aspectRatio ? `aspect-[${aspectRatio}]` : 'aspect-square'
            }`}
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 bg-dark/50 hover:bg-dark/70"
            onClick={clearPreview}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <label
          htmlFor="image-upload"
          className={`block w-full border-2 border-dashed border-primary/20 rounded-lg hover:border-primary/40 transition-colors cursor-pointer ${
            aspectRatio ? `aspect-[${aspectRatio}]` : 'aspect-square'
          }`}
        >
          <div className="h-full flex flex-col items-center justify-center text-light/50">
            {uploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            ) : (
              <>
                <Camera className="w-8 h-8 mb-2" />
                <span>Click to upload photo</span>
                <span className="text-sm">Max size: {maxSize}MB</span>
              </>
            )}
          </div>
        </label>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};