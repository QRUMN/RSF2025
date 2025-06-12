import React from 'react';

interface UserNameWithPhotoProps {
  name: string;
  photoUrl?: string;
  size?: number | string;
  className?: string;
}

const UserNameWithPhoto: React.FC<UserNameWithPhotoProps> = ({ name, photoUrl, size = 28, className = '' }) => {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={name + " profile"}
          style={{ width: size, height: size, objectFit: 'cover' }}
          className="rounded-lg bg-dark border border-primary/20"
        />
      ) : (
        <span
          style={{ width: size, height: size }}
          className="rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/20"
        >
          {name.charAt(0)}
        </span>
      )}
      <span className="truncate max-w-[120px] text-light">{name}</span>
    </span>
  );
};

export default UserNameWithPhoto;
