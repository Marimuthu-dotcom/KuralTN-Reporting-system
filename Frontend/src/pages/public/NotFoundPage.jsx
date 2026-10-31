// Frontend/src/pages/public/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="py-20 text-center max-w-md mx-auto space-y-4">
      <div className="text-6xl font-black text-[#F97316]">404</div>
      <h1 className="text-xl font-bold text-[#171717]">Page Not Found</h1>
      <p className="text-xs text-[#737373]">
        The civic page or ticket reference you are searching for does not exist in the administrative records.
      </p>
      <Link to="/" className="inline-block pt-2">
        <Button variant="primary" size="md" icon={Home}>
          Return to Home
        </Button>
      </Link>
    </div>
  );
}
