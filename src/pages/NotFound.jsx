import React from 'react';
import { SearchX } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PageShell from '../components/ui/PageShell';

// Presents a polished fallback for unknown routes.
const NotFound = () => (
  <PageShell>
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center">
      <Card className="max-w-lg p-8 text-center">
        <SearchX className="mx-auto h-12 w-12 text-[#D4AF37]" />
        <h1 className="mt-5 text-4xl font-extrabold">Page not found</h1>
        <p className="mt-3 text-[#9CA3AF]">This route does not exist in the Mukhiya Chess arena.</p>
        <Button to="/" className="mt-7">Return Home</Button>
      </Card>
    </div>
  </PageShell>
);

export default NotFound;
