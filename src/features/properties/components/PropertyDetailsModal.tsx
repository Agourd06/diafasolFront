import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../../../components/ui/Modal';
import { Property } from '../types';

type PropertyDetailsModalProps = {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
};

const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({
  property,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();

  if (!property) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={property.title} size="2xl">
      <div className="space-y-6">
        {/* Header with Logo */}
        {property.logoUrl && (
          <div className="flex justify-center">
            <img
              src={property.logoUrl}
              alt={property.title}
              className="h-24 w-24 rounded-lg object-cover shadow-md"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Basic Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {t('properties.details.title')}
            </label>
            <p className="mt-1 text-base font-semibold text-slate-900">{property.title}</p>
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {t('properties.details.currency')}
            </label>
            <p className="mt-1 text-base font-mono font-semibold text-slate-900">
              {property.currency}
            </p>
          </div>
          {property.propertyType && (
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {t('properties.details.propertyType')}
              </label>
              <p className="mt-1 text-base text-slate-700 capitalize">{property.propertyType}</p>
            </div>
          )}
          {property.timezone && (
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {t('properties.details.timezone')}
              </label>
              <p className="mt-1 text-base text-slate-700">{property.timezone}</p>
            </div>
          )}
        </div>

        {/* Contact Information */}
        {(property.email || property.phone || property.website) && (
          <div className="rounded-lg bg-slate-50 p-4">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
              {t('properties.details.contactInfo')}
            </h4>
            <div className="grid grid-cols-1 gap-3 text-sm">
              {property.email && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">{t('properties.details.email')}:</span>
                  <a
                    href={`mailto:${property.email}`}
                    className="text-brand-600 hover:underline"
                  >
                    {property.email}
                  </a>
                </div>
              )}
              {property.phone && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">{t('properties.details.phone')}:</span>
                  <a href={`tel:${property.phone}`} className="text-brand-600 hover:underline">
                    {property.phone}
                  </a>
                </div>
              )}
              {property.website && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">{t('properties.details.website')}:</span>
                  <a
                    href={property.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 hover:underline"
                  >
                    {property.website}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Location Information */}
        {(property.address ||
          property.city ||
          property.state ||
          property.country ||
          property.zipCode) && (
          <div className="rounded-lg bg-slate-50 p-4">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
              {t('properties.details.locationInfo')}
            </h4>
            <div className="space-y-2 text-sm">
              {property.address && (
                <div>
                  <span className="text-slate-500">{t('properties.details.address')}:</span>{' '}
                  <span className="text-slate-700">{property.address}</span>
                </div>
              )}
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {property.city && (
                  <div>
                    <span className="text-slate-500">{t('properties.details.city')}:</span>{' '}
                    <span className="text-slate-700">{property.city}</span>
                  </div>
                )}
                {property.state && (
                  <div>
                    <span className="text-slate-500">{t('properties.details.state')}:</span>{' '}
                    <span className="text-slate-700">{property.state}</span>
                  </div>
                )}
                {property.zipCode && (
                  <div>
                    <span className="text-slate-500">{t('properties.details.zipCode')}:</span>{' '}
                    <span className="text-slate-700">{property.zipCode}</span>
                  </div>
                )}
                {property.country && (
                  <div>
                    <span className="text-slate-500">{t('properties.details.country')}:</span>{' '}
                    <span className="font-semibold text-slate-700">{property.country}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Coordinates */}
        {(property.longitude || property.latitude) && (
          <div className="rounded-lg bg-slate-50 p-4">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
              {t('properties.details.coordinates')}
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {property.longitude && (
                <div>
                  <span className="text-slate-500">{t('properties.details.longitude')}:</span>{' '}
                  <span className="font-mono text-slate-700">{property.longitude}</span>
                </div>
              )}
              {property.latitude && (
                <div>
                  <span className="text-slate-500">{t('properties.details.latitude')}:</span>{' '}
                  <span className="font-mono text-slate-700">{property.latitude}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Group ID */}
        {property.groupId && (
          <div className="rounded-lg bg-slate-50 p-4">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
              {t('properties.details.groupInfo')}
            </h4>
            <div className="text-sm">
              <span className="text-slate-500">{t('properties.details.groupId')}:</span>{' '}
              <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs text-slate-700">
                {property.groupId}
              </code>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="rounded-lg bg-slate-50 p-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
            {t('properties.details.metadata')}
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">{t('properties.details.id')}:</span>{' '}
              <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs text-slate-700">
                {property.id}
              </code>
            </div>
            <div>
              <span className="text-slate-500">{t('properties.details.companyId')}:</span>{' '}
              <span className="font-medium text-slate-700">{property.companyId}</span>
            </div>
            <div>
              <span className="text-slate-500">{t('properties.details.createdAt')}:</span>{' '}
              <span className="text-slate-700">
                {new Date(property.createdAt).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-500">{t('properties.details.updatedAt')}:</span>{' '}
              <span className="text-slate-700">
                {new Date(property.updatedAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PropertyDetailsModal;

