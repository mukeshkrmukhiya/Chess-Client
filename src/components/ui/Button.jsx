import React from 'react';
import { Link } from 'react-router-dom';

const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg shadow-black/20 disabled:cursor-not-allowed disabled:opacity-50';

const variants = {
  primary: 'bg-[#D4AF37] text-gray-950 hover:bg-[#B8941F] hover:-translate-y-0.5',
  secondary: 'border border-[rgba(212,175,55,0.18)] bg-white/5 text-[#F9FAFB] hover:border-[#D4AF37] hover:bg-white/10',
  danger: 'bg-[#EF4444] text-white hover:bg-red-500',
  ghost: 'text-[#F9FAFB] hover:bg-white/10'
};

// Renders a consistent premium action as a button or route link.
const Button = ({ children, className = '', variant = 'primary', to, type = 'button', ...props }) => {
  const classes = `${baseClasses} ${variants[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
};

export default Button;
