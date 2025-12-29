import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from '@/hooks/useAppContext';
import Card from './ui/Card';
import Button from './ui/Button';
import { useTranslation } from 'react-i18next';

type Props = {
  children: React.ReactNode;
};

const PropertyScopedRoute: React.FC<Props> = ({ children }) => {
  const { t } = useTranslation();
  const { propertyId } = useAppContext();
  const location = useLocation();

  if (!propertyId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <div className="text-center space-y-4 py-8">
            <div className="flex justify-center">
              <svg
                className="h-16 w-16 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                {t('context.propertyRequired')}
              </h2>
              <p className="text-sm text-slate-600 mb-4">
                {t('context.propertyRequiredMessage')}
              </p>
            </div>
            <Button onClick={() => window.history.back()}>
              {t('common.back')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default PropertyScopedRoute;

