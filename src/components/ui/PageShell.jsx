import React from 'react';

// Wraps pages with the platform background and responsive content width.
const PageShell = ({ children, className = '' }) => (
  <main className={`min-h-screen bg-[#111827] px-4 py-8 text-[#F9FAFB] sm:px-6 lg:px-8 ${className}`}>
    <div className="mx-auto w-full max-w-7xl">
      {children}
    </div>
  </main>
);

export default PageShell;
