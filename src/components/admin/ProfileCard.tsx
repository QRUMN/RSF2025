import React, { useState } from 'react';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ImageUploader } from '../../components/ui/ImageUploader';

interface ProfileCardProps {
  profile: any;
  onSave: (updated: any) => Promise<void>;
  loading: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onSave, loading }) => {
  // Minimal dashboard variant only: pfp, greeting, first name, positions, quick edit
  const [isEditing, setIsEditing] = useState(false);
  const [editProfile, setEditProfile] = useState<any>(profile);
  const [photoUploading, setPhotoUploading] = useState(false);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return "You're up early!";
    if (hour < 12) return "Let's have a great day";
    if (hour < 18) return "Hope your day is going well";
    return "Good evening";
  };

  React.useEffect(() => {
    setEditProfile(profile);
  }, [profile]);

  const handlePhotoUpload = async (url: string) => {
    setPhotoUploading(true);
    setEditProfile((prev: any) => ({ ...prev, profile_photo_url: url }));
    setPhotoUploading(false);
  };

  const handleSave = async () => {
    await onSave(editProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditProfile(profile);
    setIsEditing(false);
  };

  return (
    <Card>
      <CardBody>
        <div className="flex flex-col items-center gap-4 py-6">
          {/* Avatar with photo or initials */}
          <div className="relative flex flex-col items-center justify-center">
            {((isEditing ? editProfile.profile_photo_url : profile.profile_photo_url)) ? (
              <img
                src={isEditing ? editProfile.profile_photo_url : profile.profile_photo_url}
                alt="Profile"
                className="w-20 h-20 rounded-xl object-cover border-2 border-primary shadow-md bg-dark"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary border-2 border-primary shadow-md">
                {(profile.first_name?.[0] || '') + (profile.last_name?.[0] || '')}
              </div>
            )}
            {isEditing && (
              <div className="absolute bottom-0 right-0">
                <ImageUploader
                  onUpload={handlePhotoUpload}
                  bucket="profile-photos"
                  path={`admin_${profile.id}_`}
                  maxSize={3}
                  className=""
                />
                {photoUploading && <span className="text-xs text-primary">Uploading...</span>}
              </div>
            )}
          </div>
          {/* Greeting and name */}
          <div className="flex flex-col items-center">
            <span className="text-light/70 text-sm mb-1">{getGreeting()},</span>
            <h2 className="text-2xl font-bold text-light mb-1">{profile.first_name}</h2>
            {Array.isArray(profile.positions) && profile.positions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1 justify-center">
                {profile.positions.map((pos: string) => (
                  <span key={pos} className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-xs font-medium">
                    {pos}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div>
            {!isEditing && <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>Quick Edit</Button>}
          </div>
        </div>
        {/* Minimal edit mode: only allow pfp and first name change */}
        {isEditing && (
          <div className="flex flex-col items-center gap-3 mt-4 w-full">
            <input
              type="text"
              name="first_name"
              value={editProfile.first_name}
              onChange={e => setEditProfile({ ...editProfile, first_name: e.target.value })}
              className="w-48 bg-dark border border-primary/20 rounded-lg py-2 px-4 text-light text-center focus:outline-none focus:border-primary"
              placeholder="First Name"
            />
            <div className="flex gap-2 mt-2">
              <Button variant="primary" size="sm" onClick={handleSave} disabled={loading}>Save</Button>
              <Button variant="outline" size="sm" onClick={handleCancel}>Cancel</Button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
