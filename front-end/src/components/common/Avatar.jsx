import React from 'react';
import HumanAvatar from './HumanAvatar';
import { cn } from '../../utils/cn';

export function Avatar({
  name,
  role,
  src,
  alt,
  fallback,
  size = 'md',
  className = '',
  showDetails = false,
  ...props
}) {
  const displayName = name || fallback || alt || 'User';
  const avatarSize = size === 'xl' ? '2xl' : size;

  return (
    <div className={cn('inline-flex items-center gap-2.5', className)} {...props}>
      {src ? (
        <img
          src={src}
          alt={displayName}
          className={cn(
            'rounded-full object-cover shrink-0',
            size === 'xs' && 'w-6 h-6',
            size === 'sm' && 'w-8 h-8',
            size === 'md' && 'w-10 h-10',
            size === 'lg' && 'w-12 h-12',
            (size === 'xl' || size === '2xl') && 'w-16 h-16'
          )}
        />
      ) : (
        <HumanAvatar name={displayName} size={avatarSize} />
      )}

      {(showDetails || role) && size !== 'xs' && size !== 'sm' && (
        <div className="flex flex-col text-left">
          <span className="font-semibold text-slate-800 text-sm leading-tight">{displayName}</span>
          {role && <span className="text-xs text-slate-500 font-medium leading-tight">{role}</span>}
        </div>
      )}
    </div>
  );
}

export const UserAvatar = ({ name, role, src, size = 'md' }) => {
  return <Avatar name={name} role={role} src={src} size={size} showDetails={true} />;
};

export default Avatar;
