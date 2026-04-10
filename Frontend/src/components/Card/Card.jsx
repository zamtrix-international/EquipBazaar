import React from 'react';
import './Card.css';

/**
 * Modern Card Component
 */
const Card = ({ 
  children, 
  className = '', 
  elevation = 'md',
  hover = true,
  onClick = null,
  ...props 
}) => {
  const cardClass = `card card-elevation-${elevation} ${hover ? 'card-hover' : ''} ${onClick ? 'card-clickable' : ''} ${className}`;
  
  return (
    <div className={cardClass} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => {
  return <div className={`card-header ${className}`}>{children}</div>;
};

export const CardBody = ({ children, className = '' }) => {
  return <div className={`card-body ${className}`}>{children}</div>;
};

export const CardFooter = ({ children, className = '' }) => {
  return <div className={`card-footer ${className}`}>{children}</div>;
};

export const CardImage = ({ src, alt = 'Card image', className = '' }) => {
  return <img src={src} alt={alt} className={`card-image ${className}`} />;
};

export const CardTitle = ({ children, className = '' }) => {
  return <h3 className={`card-title ${className}`}>{children}</h3>;
};

export const CardSubtitle = ({ children, className = '' }) => {
  return <p className={`card-subtitle ${className}`}>{children}</p>;
};

export const CardText = ({ children, className = '' }) => {
  return <p className={`card-text ${className}`}>{children}</p>;
};

export default Card;
