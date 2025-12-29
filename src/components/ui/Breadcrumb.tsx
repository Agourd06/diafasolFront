import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const { t } = useTranslation();

  return (
    <nav className="flex items-center space-x-2 text-sm text-slate-600" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <svg
                  className="h-4 w-4 text-slate-400 mx-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
              {isLast ? (
                <span className="font-medium text-slate-900">{item.label}</span>
              ) : item.path ? (
                <Link
                  to={item.path}
                  className="hover:text-brand-600 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
