import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/hooks/useAppContext';
import { useProperties } from '@/features/properties/hooks/useProperties';
import DropdownMenu from '../ui/DropdownMenu';
import Card from '../ui/Card';

const PropertySelector: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    groupId,
    propertyId,
    selectedProperty,
    setPropertyId,
  } = useAppContext();

  // Fetch properties filtered by group
  const { data: propertiesData } = useProperties({
    limit: 100,
    sortBy: 'title',
    sortOrder: 'ASC',
    groupId: groupId || undefined,
  });
  const properties = propertiesData?.data || [];

  const handlePropertySelect = (selectedPropertyId: string) => {
    setPropertyId(selectedPropertyId);
  };

  const handleAddProperty = () => {
    navigate(`/properties/create${groupId ? `?groupId=${groupId}` : ''}`);
  };

  const handleEditProperty = () => {
    if (propertyId) {
      navigate(`/properties/edit/${propertyId}`);
    }
  };

  // Show message if no group is selected
  if (!groupId) {
    return (
      <Card className="mb-6 border-amber-200 bg-amber-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-amber-800">
              {t('context.noGroupSelected')}
            </h3>
            <p className="mt-1 text-sm text-amber-700">
              {t('context.noGroupSelectedMessage')}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">
              {t('context.selectProperty')}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              {t('context.propertySelectorDescription')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu
            trigger={
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700 shadow-sm">
                <span>{selectedProperty?.title || t('context.selectProperty')}</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            }
            items={[
              ...properties.map((p) => ({
                label: p.title,
                onClick: () => handlePropertySelect(p.id),
              })),
              { divider: true } as const,
              {
                label: t('context.addProperty'),
                icon: (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                ),
                onClick: handleAddProperty,
              },
              ...(propertyId
                ? [
                    {
                      label: t('context.editProperty'),
                      icon: (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      ),
                      onClick: handleEditProperty,
                    } as const,
                  ]
                : []),
            ]}
            align="right"
          />
        </div>
      </div>
    </Card>
  );
};

export default PropertySelector;

