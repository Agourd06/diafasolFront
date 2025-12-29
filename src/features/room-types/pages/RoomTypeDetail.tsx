import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Breadcrumb, { BreadcrumbItem } from '../../../components/ui/Breadcrumb';
import Tabs, { Tab } from '../../../components/ui/Tabs';
import Loader from '../../../components/Loader';
import { useRoomTypeById } from '../hooks/useRoomTypeById';
import { usePropertyById } from '../../properties/hooks/usePropertyById';
import RoomTypeContentTable from '../../room-type-content/components/RoomTypeContentTable';
import RoomTypePhotosTable from '../../room-type-photos/components/RoomTypePhotosTable';
import RoomTypeFacilitiesTable from '../../room-type-facilities/components/RoomTypeFacilitiesTable';
import RoomTypeAvailabilityTable from '../../room-type-availability/components/RoomTypeAvailabilityTable';
import { useRoomTypeContentByRoomType } from '../../room-type-content/hooks';
import { useRoomTypePhotosByRoomType } from '../../room-type-photos/hooks';
import { useRoomTypeFacilitiesByRoomType } from '../../room-type-facilities/hooks';
import { useGenerateYearlyAvailability } from '../../room-type-availability/hooks';
import { useQuery } from '@tanstack/react-query';
import { useChannexAvailabilitySync } from '@/hooks/useChannexAvailabilitySync';
import { useChannexProperty } from '@/hooks/useChannexProperty';
import { useChannexRoomType } from '@/hooks/useChannexRoomType';
import ChannexSyncIcon from '@/features/dashboard/components/ChannexSyncIcon';
import { useToast } from '@/context/ToastContext';
import Input from '../../../components/ui/Input';
import Label from '../../../components/ui/Label';
import Pagination from '../../../components/ui/Pagination';
import { getRoomTypeAvailabilityByRoomType, getRoomTypeAvailabilityByDateRange } from '@/api/room-type-availability.api';
import type { PaginatedRoomTypeAvailabilityResponse } from '@/features/room-type-availability/types';

const RoomTypeDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useToast();
  
  // Determine active tab from URL
  const getActiveTabFromUrl = () => {
    const path = location.pathname;
    if (path.includes('/content')) return 'content';
    if (path.includes('/photos')) return 'photos';
    if (path.includes('/facilities')) return 'facilities';
    if (path.includes('/availability')) return 'availability';
    return 'overview';
  };
  
  const [activeTab, setActiveTab] = useState(getActiveTabFromUrl());
  
  // Update active tab when URL changes
  useEffect(() => {
    setActiveTab(getActiveTabFromUrl());
  }, [location.pathname]);

  const { data: roomType, isLoading: roomTypeLoading } = useRoomTypeById(id!);
  const { data: property } = usePropertyById(roomType?.propertyId || '');

  // Get Channex IDs for property and room type
  const { channexProperty } = useChannexProperty({
    property,
    enabled: !!property,
  });

  const { channexRoomType } = useChannexRoomType({
    roomType,
    channexPropertyId: channexProperty?.id,
    enabled: !!roomType && !!channexProperty,
  });
  
  // Fetch related data
  const { data: content, isLoading: contentLoading } = useRoomTypeContentByRoomType(id!);
  const { data: photos, isLoading: photosLoading } = useRoomTypePhotosByRoomType(id!);
  const { data: facilities, isLoading: facilitiesLoading } = useRoomTypeFacilitiesByRoomType(id!);
  
  // Availability pagination and filtering state
  const [availabilityPage, setAvailabilityPage] = useState(1);
  const [availabilityLimit] = useState(10);
  const [availabilityStartDate, setAvailabilityStartDate] = useState('');
  const [availabilityEndDate, setAvailabilityEndDate] = useState('');
  const [availabilitySortBy, setAvailabilitySortBy] = useState<'date' | 'availability' | 'id'>('date');
  const [availabilitySortOrder, setAvailabilitySortOrder] = useState<'ASC' | 'DESC'>('ASC');
  
  // Fetch availability - filter by date range if provided, otherwise use pagination
  const { data: availabilityData, isLoading: availabilityLoading, error: availabilityError } = useQuery({
    queryKey: ['roomTypeAvailability', 'roomType', id, availabilityPage, availabilityLimit, availabilityStartDate, availabilityEndDate, availabilitySortBy, availabilitySortOrder],
    queryFn: async () => {
      try {
        if (availabilityStartDate && availabilityEndDate) {
          // Use date range query if filters are set, then filter by room type
          const allResults = await getRoomTypeAvailabilityByDateRange({
            startDate: availabilityStartDate,
            endDate: availabilityEndDate,
          });
          
          // Ensure we have an array
          if (!Array.isArray(allResults)) {
            throw new Error('Invalid response: expected array from date range query');
          }
          
          const filtered = allResults.filter(av => av.roomTypeId === id);
          return filtered;
        } else {
          // Use paginated query for room type
          const result = await getRoomTypeAvailabilityByRoomType(id!, {
            page: availabilityPage,
            limit: availabilityLimit,
            startDate: availabilityStartDate || undefined,
            endDate: availabilityEndDate || undefined,
            sortBy: availabilitySortBy,
            sortOrder: availabilitySortOrder,
          });
          
          // Check if it's a paginated response
          if (result && typeof result === 'object' && 'data' in result && 'meta' in result) {
            return result as PaginatedRoomTypeAvailabilityResponse;
          }
          
          // Otherwise, it's an array (backward compatibility)
          if (Array.isArray(result)) {
            return result;
          }
          
          throw new Error('Invalid response format');
        }
      } catch (error: any) {
        throw error;
      }
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  // Extract availability array and pagination meta
  const availability = Array.isArray(availabilityData) 
    ? availabilityData 
    : (availabilityData as PaginatedRoomTypeAvailabilityResponse)?.data || [];
  const availabilityPagination = availabilityData && typeof availabilityData === 'object' && 'meta' in availabilityData
    ? (availabilityData as PaginatedRoomTypeAvailabilityResponse).meta
    : undefined;

  // Generate yearly availability mutation
  const generateAvailabilityMutation = useGenerateYearlyAvailability();

  // Track availability changes
  useEffect(() => {
  }, [availability, availabilityLoading, availabilityError]);

  // Channex availability sync
  const {
    rangesCount,
    hasAvailability,
    isLoadingGroupedAvailability,
    isSyncing: isSyncingAvailability,
    syncError: availabilitySyncError,
    syncToChannex: syncAvailabilityToChannex,
    canSync: canSyncAvailability,
    syncSuccess: availabilitySyncSuccess,
    hasChannexIds: hasAvailabilityChannexIds,
    channexPropertyId: syncChannexPropertyId,
    channexRoomTypeId: syncChannexRoomTypeId,
  } = useChannexAvailabilitySync({
    roomTypeId: id!,
    channexPropertyId: channexProperty?.id,
    channexRoomTypeId: channexRoomType?.id,
    enabled: !!id && activeTab === 'availability',
    dateRange: availabilityStartDate || availabilityEndDate ? {
      startDate: availabilityStartDate || undefined,
      endDate: availabilityEndDate || undefined,
    } : undefined,
  });

  // Determine why sync is disabled for better error message
  const getAvailabilitySyncDisabledReason = () => {
    if (!hasAvailability) {
      return t('roomTypeAvailability.sync.noAvailability', { defaultValue: 'No availability to sync. Please generate availability first.' });
    }
    if (rangesCount === 0) {
      return t('roomTypeAvailability.sync.noRanges', { defaultValue: 'No availability ranges to sync. Please generate availability first.' });
    }
    if (!hasAvailabilityChannexIds) {
      if (!syncChannexPropertyId) {
        return t('roomTypeAvailability.sync.propertyNotSynced', { defaultValue: 'Property must be synced to Channex first.' });
      }
      if (!syncChannexRoomTypeId) {
        return t('roomTypeAvailability.sync.roomTypeNotSynced', { defaultValue: 'Room Type must be synced to Channex first.' });
      }
      return t('roomTypeAvailability.sync.missingChannexIds', { defaultValue: 'Property and Room Type must be synced to Channex first.' });
    }
    if (isLoadingGroupedAvailability) {
      return t('roomTypeAvailability.sync.loading', { defaultValue: 'Loading availability...' });
    }
    return '';
  };
  
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'overview') {
      navigate(`/room-types/${id}`);
    } else {
      navigate(`/room-types/${id}/${tabId}`);
    }
  };

  if (roomTypeLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <Loader label={t('common.loading')} />
        </Card>
      </div>
    );
  }

  if (!roomType) {
    return (
      <div className="space-y-4">
        <Card>
          <p className="text-sm text-red-600">{t('roomTypes.edit.notFound')}</p>
        </Card>
      </div>
    );
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: t('nav.dashboard'), path: '/dashboard' },
    { label: roomType.title },
  ];

  const tabs: Tab[] = [
    {
      id: 'overview',
      label: t('roomTypes.tabs.overview'),
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      id: 'content',
      label: t('roomTypes.tabs.content'),
      count: content ? 1 : 0,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: 'photos',
      label: t('roomTypes.tabs.photos'),
      count: photos?.length || 0,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'facilities',
      label: t('roomTypes.tabs.facilities'),
      count: facilities?.length || 0,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
    },
    {
      id: 'availability',
      label: t('roomTypes.tabs.availability'),
      count: availability?.length || 0,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  const getTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Room Type Overview Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  {t('roomTypes.overview.basicInfo')}
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      {t('roomTypes.table.title')}
                    </label>
                    <p className="mt-1 text-base font-semibold text-slate-900">{roomType.title}</p>
                  </div>
                  {property && (
                    <div>
                      <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        {t('roomTypes.table.property')}
                      </label>
                      <p className="mt-1 text-base text-slate-700">{property.title}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      {t('roomTypes.table.countOfRooms')}
                    </label>
                    <p className="mt-1 text-base font-semibold text-slate-900">{roomType.countOfRooms}</p>
                  </div>
                  {roomType.roomKind && (
                    <div>
                      <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        {t('roomTypes.table.roomKind')}
                      </label>
                      <p className="mt-1 text-base text-slate-700 capitalize">{roomType.roomKind}</p>
                    </div>
                  )}
                  {roomType.capacity && (
                    <div>
                      <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        {t('roomTypes.table.capacity')}
                      </label>
                      <p className="mt-1 text-base font-semibold text-slate-900">{roomType.capacity}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Occupancy Information */}
              <Card>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  {t('roomTypes.overview.occupancyInfo')}
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-slate-500">{t('roomTypes.table.adults')}:</span>{' '}
                    <span className="font-semibold text-slate-700">{roomType.occAdults}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">{t('roomTypes.table.children')}:</span>{' '}
                    <span className="font-semibold text-slate-700">{roomType.occChildren}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">{t('roomTypes.table.infants')}:</span>{' '}
                    <span className="font-semibold text-slate-700">{roomType.occInfants}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">{t('roomTypes.table.default')}:</span>{' '}
                    <span className="font-semibold text-brand-600">{roomType.defaultOccupancy}</span>
                  </div>
                </div>
              </Card>

              {/* Quick Stats */}
              <Card>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  {t('roomTypes.overview.quickStats')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-brand-600">
                      {photos?.length || 0}
                    </div>
                    <div className="text-sm text-slate-600">{t('roomTypes.overview.photos')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-brand-600">
                      {facilities?.length || 0}
                    </div>
                    <div className="text-sm text-slate-600">{t('roomTypes.overview.facilities')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-brand-600">
                      {availability?.length || 0}
                    </div>
                    <div className="text-sm text-slate-600">{t('roomTypes.overview.availability')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-brand-600">
                      {content ? 1 : 0}
                    </div>
                    <div className="text-sm text-slate-600">{t('roomTypes.overview.content')}</div>
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
              <Link to={`/room-types/${id}/content/create`}>
                <Button size="sm">{t('roomTypeContent.addContent')}</Button>
              </Link>
            </div>
            {content ? (
              <RoomTypeContentTable
                content={[content]}
                isLoading={contentLoading}
                error={undefined}
                roomTypeId={id}
              />
            ) : (
              <Card>
                <p className="text-sm text-slate-600 text-center py-8">
                  {t('roomTypeContent.empty')}
                </p>
                <div className="flex justify-center">
                  <Link to={`/room-types/${id}/content/create`}>
                    <Button variant="outline">{t('roomTypeContent.addContent')}</Button>
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
              <Link to={`/room-types/${id}/photos/create`}>
                <Button size="sm">{t('roomTypePhotos.addPhoto')}</Button>
              </Link>
            </div>
            {photos && photos.length > 0 ? (
              <RoomTypePhotosTable
                photos={photos}
                isLoading={photosLoading}
                error={undefined}
                roomTypeId={id}
              />
            ) : (
              <Card>
                <p className="text-sm text-slate-600 text-center py-8">
                  {t('roomTypePhotos.empty')}
                </p>
                <div className="flex justify-center">
                  <Link to={`/room-types/${id}/photos/create`}>
                    <Button variant="outline">{t('roomTypePhotos.addPhoto')}</Button>
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
              <Link to={`/room-types/${id}/facilities/create`}>
                <Button size="sm">{t('roomTypeFacilities.addLink')}</Button>
              </Link>
            </div>
            {facilities && facilities.length > 0 ? (
              <RoomTypeFacilitiesTable
                links={facilities}
                isLoading={facilitiesLoading}
                error={undefined}
              />
            ) : (
              <Card>
                <p className="text-sm text-slate-600 text-center py-8">
                  {t('roomTypeFacilities.empty')}
                </p>
                <div className="flex justify-center">
                  <Link to={`/room-types/${id}/facilities/create`}>
                    <Button variant="outline">{t('roomTypeFacilities.addLink')}</Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>
        );
      case 'availability':
        const handleGenerateYearlyAvailability = async () => {
          if (!id) return;
          
          const confirmed = window.confirm(
            t('roomTypeAvailability.generateYearly.confirm', {
              defaultValue: 'This will generate 365 days of availability starting from today. Existing availability for these dates will be updated. Continue?'
            })
          );

          if (!confirmed) return;

          try {
            const result = await generateAvailabilityMutation.mutateAsync(id);
            // Ensure baseAvailability is a number before calling toFixed
            const baseAvailabilityValue = typeof result.baseAvailability === 'number' 
              ? result.baseAvailability 
              : parseFloat(String(result.baseAvailability || 0));
            const formattedBaseAvailability = isNaN(baseAvailabilityValue) ? '0' : baseAvailabilityValue.toFixed(0);
            
            showSuccess(
              t('roomTypeAvailability.generateYearly.success', {
                count: result.count,
                baseAvailability: formattedBaseAvailability,
                defaultValue: `Successfully generated ${result.count} availability records with base availability ${formattedBaseAvailability}`
              })
            );
          } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || t('roomTypeAvailability.generateYearly.error');
            showError(errorMessage);
          }
        };

        const handleSyncAvailability = async () => {
          try {
            const result = await syncAvailabilityToChannex();
            showSuccess(
              t('roomTypeAvailability.sync.success', {
                ranges: result.rangesSent || rangesCount,
                defaultValue: `Successfully synced ${result.rangesSent || rangesCount} availability ranges to Channex`
              })
            );
          } catch (error: any) {
            // Error is already handled by the hook and displayed in the error section
            // Sync error handled silently
          }
        };

        const handleFilterAvailability = () => {
          // Reset to first page when filtering
          setAvailabilityPage(1);
        };

        const handleClearAvailabilityFilters = () => {
          setAvailabilityStartDate('');
          setAvailabilityEndDate('');
          setAvailabilityPage(1);
        };

        return (
          <div className="space-y-4">
            {/* Date Filters */}
            <div className="flex flex-wrap items-end gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="availabilityStartDate" className="text-xs">
                  {t('roomTypeAvailability.filters.startDate', { defaultValue: 'Start Date' })}
                </Label>
                <Input
                  id="availabilityStartDate"
                  type="date"
                  value={availabilityStartDate}
                  onChange={(e) => {
                    setAvailabilityStartDate(e.target.value);
                    setAvailabilityPage(1); // Reset to first page when filter changes
                  }}
                  className="mt-1"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="availabilityEndDate" className="text-xs">
                  {t('roomTypeAvailability.filters.endDate', { defaultValue: 'End Date' })}
                </Label>
                <Input
                  id="availabilityEndDate"
                  type="date"
                  value={availabilityEndDate}
                  onChange={(e) => {
                    setAvailabilityEndDate(e.target.value);
                    setAvailabilityPage(1); // Reset to first page when filter changes
                  }}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleFilterAvailability} variant="outline" size="sm">
                  {t('roomTypeAvailability.filters.filter', { defaultValue: 'Filter' })}
                </Button>
                {(availabilityStartDate || availabilityEndDate) && (
                  <Button onClick={handleClearAvailabilityFilters} variant="outline" size="sm">
                    {t('roomTypeAvailability.filters.clear', { defaultValue: 'Clear' })}
                  </Button>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 items-center">
              <ChannexSyncIcon
                isChecking={isLoadingGroupedAvailability}
                isSyncing={isSyncingAvailability}
                existsInChannex={availabilitySyncSuccess || false}
                onSync={handleSyncAvailability}
                syncedTitle={t('roomTypeAvailability.sync.synced', { 
                  ranges: rangesCount,
                  defaultValue: `Synced ${rangesCount} availability ranges to Channex` 
                })}
                notSyncedTitle={t('roomTypeAvailability.sync.notSynced', { 
                  defaultValue: 'Not synced to Channex. Click to sync.' 
                })}
                clickToSyncTitle={t('roomTypeAvailability.sync.clickToSync', { 
                  ranges: rangesCount,
                  defaultValue: `Click to sync ${rangesCount} availability ranges to Channex` 
                })}
                disabled={!canSyncAvailability}
                disabledTitle={getAvailabilitySyncDisabledReason()}
              />
              <Button
                onClick={handleGenerateYearlyAvailability}
                disabled={generateAvailabilityMutation.isPending}
                variant="outline"
              >
                {generateAvailabilityMutation.isPending
                  ? t('roomTypeAvailability.generateYearly.generating', { defaultValue: 'Generating...' })
                  : t('roomTypeAvailability.generateYearly.button', { defaultValue: 'Generate 365 Days of Availability' })}
              </Button>
              <Link to={`/room-types/${id}/availability/create`}>
                <Button size="sm">{t('roomTypeAvailability.addAvailability')}</Button>
              </Link>
            </div>

            {/* Error Display */}
            {(generateAvailabilityMutation.isError || availabilitySyncError || availabilityError) && (
              <Card>
                <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                  <div className="flex items-start gap-3">
                    <svg
                      className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-red-900 mb-1">
                        {availabilityError
                          ? t('roomTypeAvailability.fetch.errorTitle', { defaultValue: 'Error fetching availability' })
                          : generateAvailabilityMutation.isError
                          ? t('roomTypeAvailability.generateYearly.errorTitle', { defaultValue: 'Error generating availability' })
                          : t('roomTypeAvailability.sync.errorTitle', { defaultValue: 'Error syncing availability to Channex' })}
                      </h3>
                      <p className="text-sm text-red-700">
                        {(() => {
                          const error = availabilityError 
                            ? availabilityError as any
                            : (generateAvailabilityMutation.isError ? generateAvailabilityMutation.error : availabilitySyncError) as any;
                          return error?.response?.data?.message || error?.message || 
                            (availabilityError
                              ? t('roomTypeAvailability.fetch.error', { defaultValue: 'Failed to load availability records. Please check the console for details.' })
                              : generateAvailabilityMutation.isError 
                              ? t('roomTypeAvailability.generateYearly.error')
                              : t('roomTypeAvailability.sync.error'));
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {availabilityLoading ? (
              <Card>
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-600"></div>
                  <span className="ml-3 text-sm text-slate-600">{t('common.loading')}</span>
                </div>
              </Card>
            ) : (() => {
              // Check if we have data - handle both arrays and array-like objects
              const hasData = availability && (
                (Array.isArray(availability) && availability.length > 0) ||
                (typeof (availability as any)?.length === 'number' && (availability as any).length > 0)
              );
              
              if (hasData) {
                // Convert to array if needed
                const availabilityArray = Array.isArray(availability) 
                  ? availability 
                  : Array.from(availability as any);
                
                return (
                  <>
                    <RoomTypeAvailabilityTable
                      availability={availabilityArray}
                      isLoading={availabilityLoading}
                      error={availabilityError as Error || undefined}
                      roomTypeId={id}
                    />
                    {availabilityPagination && availabilityPagination.totalPages > 1 && (
                      <Card>
                        <Pagination
                          currentPage={availabilityPagination.page || 1}
                          totalPages={availabilityPagination.totalPages || 1}
                          onPageChange={setAvailabilityPage}
                          itemsPerPage={availabilityPagination.limit || availabilityLimit}
                          totalItems={availabilityPagination.total || 0}
                          currentItemsCount={availabilityArray.length}
                        />
                      </Card>
                    )}
                  </>
                );
              }
              
              return null;
            })() || (
              <Card>
                <p className="text-sm text-slate-600 text-center py-8">
                  {t('roomTypeAvailability.empty')}
                </p>
                {availabilityError && (
                  <p className="text-sm text-red-600 text-center mb-4">
                    Error: {String(availabilityError)}
                  </p>
                )}
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-slate-500 text-center mt-2">
                    Debug: availability = {availability ? JSON.stringify(availability).substring(0, 200) : 'null/undefined'}
                  </div>
                )}
                <div className="flex justify-center">
                  <Link to={`/room-types/${id}/availability/create`}>
                    <Button variant="outline">{t('roomTypeAvailability.addAvailability')}</Button>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{roomType.title}</h1>
          <p className="text-sm text-slate-600">
            {t('roomTypes.detail.subtitle')}
          </p>
        </div>
        <Link to="/dashboard">
          <Button variant="outline">{t('common.back')}</Button>
        </Link>
      </div>

      {/* Tabs */}
      <Card className="p-0">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />
        <div className="p-6">
          {getTabContent()}
        </div>
      </Card>
    </div>
  );
};

export default RoomTypeDetail;
