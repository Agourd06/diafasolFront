import React from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/components/ui/Card';

/**
 * Empty State Card Component
 * Displays when no property is selected
 */
const EmptyStateCard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Card className="border-amber-200 bg-amber-50">
      <div className="p-6">
        <div className="flex items-start gap-3">
          <svg
            className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-amber-900 mb-2">
              {t('dashboard.selectPropertyTitle')}
            </h3>
            <p className="text-sm text-amber-800">{t('dashboard.selectPropertyMessage')}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EmptyStateCard;
