import React from 'react';
import { Loader2 } from 'lucide-react';

// Shows a branded loading state for lazy routes and data fetches.
const LoadingScreen = ({ label = 'Loading Mukhiya Chess' }) => (
  <div className="flex min-h-[60vh] items-center justify-center bg-[#111827] text-[#F9FAFB]">
    <div className="luxury-panel flex items-center gap-3 rounded-2xl px-6 py-4">
      <Loader2 className="h-5 w-5 animate-spin text-[#D4AF37]" />
      <span className="text-sm font-semibold text-[#9CA3AF]">{label}</span>
    </div>
  </div>
);

export default LoadingScreen;
