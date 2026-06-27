import React from 'react';

// Provides the shared glass card treatment used across pages.
const Card = ({ children, className = '' }) => (
  <div className={`luxury-panel rounded-2xl ${className}`}>
    {children}
  </div>
);

export default Card;
