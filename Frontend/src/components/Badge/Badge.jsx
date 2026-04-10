import React from 'react';
import './Badge.css';

/**
 * Modern Badge Component
 */
const Badge = ({ 
  children, 
  variant = 'primary',
  size = 'md',
  pill = false,
  className = '',
  ...props
}) => {
  const badgeClass = `badge badge-${variant} badge-${size} ${pill ? 'badge-pill' : ''} ${className}`;
  
  return (
    <span className={badgeClass} {...props}>
      {children}
    </span>
  );
};

/**
 * Badge Variants
 */
export const BadgePrimary = (props) => <Badge variant="primary" {...props} />;
export const BadgeSuccess = (props) => <Badge variant="success" {...props} />;
export const BadgeDanger = (props) => <Badge variant="danger" {...props} />;
export const BadgeWarning = (props) => <Badge variant="warning" {...props} />;
export const BadgeInfo = (props) => <Badge variant="info" {...props} />;
export const BadgeMuted = (props) => <Badge variant="muted" {...props} />;

export default Badge;
