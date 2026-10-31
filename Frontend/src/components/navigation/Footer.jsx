// Frontend/src/components/navigation/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { KuralLogo } from '../common/KuralLogo';

export function Footer() {
  return (
    <footer className="bg-white border-t border-[#E7E5E4] py-8 px-4 sm:px-6 text-xs text-[#737373]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <KuralLogo size="xs" showTagline={false} />
          <span className="font-semibold text-[#171717]">
            &bull; Tamil Nadu Civic Grievance & Ward Issue Resolution System
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link to="/complaints" className="hover:text-[#F97316] transition-colors">
            Public Feed
          </Link>
          <Link to="/departments" className="hover:text-[#F97316] transition-colors">
            Departments
          </Link>
          <Link to="/escalation-directory" className="hover:text-[#F97316] transition-colors">
            Official Directory
          </Link>
          <Link to="/help" className="hover:text-[#F97316] transition-colors">
            Help & Guidelines
          </Link>
          <a
            href="https://cmhelpline.tnega.org"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-[#F97316] transition-colors"
          >
            <span>TN CM Helpline 1100</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="text-[11px]">
          &copy; {new Date().getFullYear()} KuralTN &bull; Transparent, accountable local civic governance.
        </div>
      </div>
    </footer>
  );
}
