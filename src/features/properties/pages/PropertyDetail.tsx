import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Breadcrumb, { BreadcrumbItem } from '../../../components/ui/Breadcrumb';
import Tabs, { Tab } from '../../../components/ui/Tabs';
import Loader from '../../../components/Loader';
import { usePropertyById } from '../hooks/usePropertyById';
import { useGroup } from '../../groups/hooks/useGroup';
import PropertyContentTable from '../../property-content/components/PropertyContentTable';
import PropertySettingsTable from '../../property-settings/components/PropertySettingsTable';
import PropertyPhotoTable from '../../property-photos/components/PropertyPhotoTable';
import PropertyFacilitiesTable from '../../property-facilities/components/PropertyFacilitiesTable';
import { usePropertyContentByPropertyId } from '../../property-content/hooks/usePropertyContentByPropertyId';
import { usePropertySettingsByPropertyId } from '../../property-settings/hooks/usePropertySettingsByPropertyId';
import { usePropertyPhotosByPropertyId } from '../../property-photos/hooks/usePropertyPhotosByPropertyId';
import { usePropertyFacilitiesByPropertyId } from '../../property-facilities/hooks/usePropertyFacilitiesByPropertyId';

const PropertyDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine active tab from URL
  const getActiveTabFromUrl = () => {
    const path = location.pathname;
    if (path.includes('/content')) return 'content';
    if (path.includes('/photos')) return 'photos';
    if (path.includes('/facilities')) return 'facilities';
    if (path.includes('/settings')) return 'settings';
    return 'overview';
  };
  
  const [activeTab, setActiveTab] = useState(getActiveTabFromUrl());
  
  // Update active tab when URL changes
  useEffect(() => {
    setActiveTab(getActiveTabFromUrl());
  }, [location.pathname]);

  const { data: property, isLoading: propertyLoading } = usePropertyById(id!);
  const { data: group } = useGroup(property?.groupId || '');
  
  // Fetch related data
  const { data: content, isLoading: contentLoading } = usePropertyContentByPropertyId(id!);
  const { data: settings, isLoading: settingsLoading } = usePropertySettingsByPropertyId(id!);
  const { data: photos, isLoading: photosLoading } = usePropertyPhotosByPropertyId(id!);
  const { data: facilities, isLoading: facilitiesLoading } = usePropertyFacilitiesByPropertyId(id!);
  
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'overview') {
      navigate(`/properties/${id}`);
    } else {
      navigate(`/properties/${id}/${tabId}`);
    }
  };

  if (propertyLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <Loader label={t('common.loading')} />
        </Card>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="space-y-4">
        <Card>
          <p className="text-sm text-red-600">{t('properties.edit.notFound')}</p>
        </Card>
      </div>
    );
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: t('nav.dashboard'), path: '/dashboard' },
    { label: property.title, path: '/dashboard' },
  ];

  const tabs: Tab[] = [
    {
      id: 'overview',
      label: t('properties.tabs.overview'),
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      id: 'content',
      label: t('properties.tabs.content'),
      count: content ? 1 : 0,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: 'photos',
      label: t('properties.tabs.photos'),
      count: photos?.length || 0,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'facilities',
      label: t('properties.tabs.facilities'),
      count: facilities?.length || 0,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
    },
    {
      id: 'settings',
      label: t('properties.tabs.settings'),
      count: settings ? 1 : 0,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const getTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Property Overview Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  {t('properties.overview.basicInfo')}
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      {t('properties.details.title')}
                    </label>
                    <p className="mt-1 text-base font-semibold text-slate-900">{property.title}</p>
                  </div>
                  {property.currency && (
                    <div>
                      <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        {t('properties.details.currency')}
                      </label>
                      <p className="mt-1 text-base font-mono font-semibold text-slate-900">
                        {property.currency}
                      </p>
                    </div>
                  )}
                  {property.propertyType && (
                    <div>
                      <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        {t('properties.details.propertyType')}
                      </label>
                      <p className="mt-1 text-base text-slate-700 capitalize">{property.propertyType}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Contact Information */}
              {(property.email || property.phone || property.website) && (
                <Card>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    {t('properties.details.contactInfo')}
                  </h3>
                  <div className="space-y-2 text-sm">
                    {property.email && (
                      <div>
                        <span className="text-slate-500">{t('properties.details.email')}:</span>{' '}
                        <a
                          href={`mailto:${property.email}`}
                          className="text-brand-600 hover:underline"
                        >
                          {property.email}
                        </a>
                      </div>
                    )}
                    {property.phone && (
                      <div>
                        <span className="text-slate-500">{t('properties.details.phone')}:</span>{' '}
                        <a href={`tel:${property.phone}`} className="text-brand-600 hover:underline">
                          {property.phone}
                        </a>
                      </div>
                    )}
                    {property.website && (
                      <div>
                        <span className="text-slate-500">{t('properties.details.website')}:</span>{' '}
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
                </Card>
              )}

              {/* Location Information */}
              {(property.address || property.city || property.state || property.country) && (
                <Card>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    {t('properties.details.locationInfo')}
                  </h3>
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
                      {property.country && (
                        <div>
                          <span className="text-slate-500">{t('properties.details.country')}:</span>{' '}
                          <span className="font-semibold text-slate-700">{property.country}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Quick Stats */}
              <Card>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  {t('properties.overview.quickStats')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-brand-600">
                      {photos?.length || 0}
                    </div>
                    <div className="text-sm text-slate-600">{t('properties.overview.photos')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-brand-600">
                      {facilities?.length || 0}
                    </div>
                    <div className="text-sm text-slate-600">{t('properties.overview.facilities')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-brand-600">
                      {content ? 1 : 0}
                    </div>
                    <div className="text-sm text-slate-600">{t('properties.overview.content')}</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );
      case 'content':
        return (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Link to={`/properties/${id}/content/create`}>
                <Button size="sm">{t('propertyContent.addContent')}</Button>
              </Link>
            </div>
            {content ? (
              <PropertyContentTable
                propertyContents={[content]}
                isLoading={contentLoading}
                error={undefined}
              />
            ) : (
              <Card>
                <p className="text-sm text-slate-600 text-center py-8">
                  {t('propertyContent.empty')}
                </p>
                <div className="flex justify-center">
                  <Link to={`/properties/${id}/content/create`}>
                    <Button variant="outline">{t('propertyContent.addContent')}</Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Link to={`/properties/${id}/settings/create`}>
                <Button size="sm">{t('propertySettings.addSettings')}</Button>
              </Link>
            </div>
            {settings ? (
              <PropertySettingsTable
                propertySettings={[settings]}
                isLoading={settingsLoading}
                error={undefined}
              />
            ) : (
              <Card>
                <p className="text-sm text-slate-600 text-center py-8">
                  {t('propertySettings.empty')}
                </p>
                <div className="flex justify-center">
                  <Link to={`/properties/${id}/settings/create`}>
                    <Button variant="outline">{t('propertySettings.addSettings')}</Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>
        );
      case 'photos':
        return (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Link to={`/properties/${id}/photos/create`}>
                <Button size="sm">{t('propertyPhotos.addPhoto')}</Button>
              </Link>
            </div>
            {photos && photos.length > 0 ? (
              <PropertyPhotoTable
                propertyPhotos={photos}
                isLoading={photosLoading}
                error={undefined}
              />
            ) : (
              <Card>
                <p className="text-sm text-slate-600 text-center py-8">
                  {t('propertyPhotos.empty')}
                </p>
                <div className="flex justify-center">
                  <Link to={`/properties/${id}/photos/create`}>
                    <Button variant="outline">{t('propertyPhotos.addPhoto')}</Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>
        );
      case 'facilities':
        return (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Link to={`/properties/${id}/facilities/create`}>
                <Button size="sm">{t('propertyFacilities.addLink')}</Button>
              </Link>
            </div>
            {facilities && facilities.length > 0 ? (
              <PropertyFacilitiesTable
                propertyFacilities={facilities}
                isLoading={facilitiesLoading}
                error={undefined}
              />
            ) : (
              <Card>
                <p className="text-sm text-slate-600 text-center py-8">
                  {t('propertyFacilities.empty')}
                </p>
                <div className="flex justify-center">
                  <Link to={`/properties/${id}/facilities/create`}>
                    <Button variant="outline">{t('propertyFacilities.addLink')}</Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{property.title}</h1>
            <p className="text-sm text-slate-600">
              {property.city && property.country
                ? `${property.city}, ${property.country}`
                : property.country || property.city || t('properties.detail.noLocation')}
              {property.currency && ` • ${property.currency}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Link to={`/properties/edit/${id}`}>
              <Button variant="outline">{t('common.edit')}</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Card className="p-0">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />
        
        {/* Tab Content */}
        <div className="p-6">
          {getTabContent()}
        </div>
      </Card>
    </div>
  );
};

export default PropertyDetail;
