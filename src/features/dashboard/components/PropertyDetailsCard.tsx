import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useChannexProperty } from '@/hooks/useChannexProperty';
import { useChannexGroup } from '@/hooks/useChannexGroup';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ChannexSyncIcon from './ChannexSyncIcon';
import type { Property } from '@/features/properties/types';
import type { Group } from '@/features/groups/types';

interface PropertyDetailsCardProps {
  property: Property;
  propertyId: string;
  group: Group | null;
}

/**
 * Property Details Card Component
 * Displays property information with Channex sync functionality
 */
const PropertyDetailsCard: React.FC<PropertyDetailsCardProps> = ({
  property,
  propertyId,
  group,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Get the Channex group ID (needed when creating property in Channex)
  const { channexGroup } = useChannexGroup({
    groupId: group?.id,
    groupTitle: group?.title,
    enabled: !!group,
  });

  // Check if property exists in Channex
  const {
    existsInChannex: propertyExistsInChannex,
    isChecking: isCheckingProperty,
    isSyncing: isSyncingProperty,
    syncToChannex: syncPropertyToChannex,
    isMissingSettings,
  } = useChannexProperty({
    property,
    channexGroupId: channexGroup?.id,
    enabled: !!property,
  });

  const handleViewDetails = () => {
    navigate(`/properties/${propertyId}`);
  };

  const handleEdit = () => {
    navigate(`/properties/edit/${propertyId}`);
  };

  return (
    <Card className="h-full flex flex-col bg-blue-100/60 border-blue-300">
      <div className="flex flex-col flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-900">
              {t('context.propertyDetails')}
            </h3>
            <ChannexSyncIcon
              isChecking={isCheckingProperty}
              isSyncing={isSyncingProperty}
              existsInChannex={propertyExistsInChannex}
              onSync={syncPropertyToChannex}
              syncedTitle={t('context.propertySyncedWithChannex')}
              notSyncedTitle={t('context.propertyNotSyncedWithChannex')}
              clickToSyncTitle={t('context.clickToSyncPropertyChannex')}
              disabled={isMissingSettings}
              disabledTitle={t('context.propertyMissingSettingsWarning')}
            />
          </div>
          <button
            onClick={handleEdit}
            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition-colors"
            aria-label={t('context.editProperty')}
            title={t('context.editProperty')}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-3 flex-1">
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {t('context.propertyName')}
            </span>
            <p className="mt-1 font-semibold text-slate-900">{property.title}</p>
          </div>

          {property.propertyType && (
            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {t('context.propertyType')}
              </span>
              <p className="mt-1 text-slate-700 capitalize">{property.propertyType}</p>
            </div>
          )}

          {property.city && (
            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {t('context.city')}
              </span>
              <p className="mt-1 text-slate-700">{property.city}</p>
            </div>
          )}

          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {t('context.currency')}
            </span>
            <p className="mt-1 font-mono font-semibold text-slate-900">{property.currency}</p>
          </div>
        </div>

        {isMissingSettings && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-2">
              <svg
                className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900">
                  {t('context.propertyMissingSettingsTitle')}
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  {t('context.propertyMissingSettingsMessage')}
                </p>
              </div>
            </div>
          </div>
        )}

        <Button variant="outline" onClick={handleViewDetails} className="w-full mt-auto">
          {t('context.viewFullDetails')}
        </Button>
      </div>
    </Card>
  );
};

export default PropertyDetailsCard;
