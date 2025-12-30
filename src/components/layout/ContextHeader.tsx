import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCompany } from '@/hooks/useAuth';
import { useAppContext } from '@/hooks/useAppContext';
import { useProperties } from '@/features/properties/hooks/useProperties';
import { useTaxSetsByProperty } from '@/features/tax-sets/hooks/useTaxSetsByProperty';
import { useRoomTypesByProperty } from '@/features/room-types/hooks/useRoomTypesByProperty';
import { useRatePlansByRoomType } from '@/features/rate-plans/hooks/useRatePlansByRoomType';
import { useChannexGroup } from '@/hooks/useChannexGroup';
import { useUpdateGroup } from '@/features/groups/hooks/useUpdateGroup';
import DropdownMenu from '../ui/DropdownMenu';

const ContextHeader: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const company = useCompany();
  const { selectedGroup, groupId, companyId, selectedProperty, setPropertyId, propertyId, selectedTaxSet, setTaxSetId, taxSetId, selectedRoomType, setRoomTypeId, roomTypeId, selectedRatePlan, setRatePlanId } = useAppContext();

  // Modal state for updating group in Channex
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupTitleInput, setGroupTitleInput] = useState('');

  // Check if group exists in Channex
  const { existsInChannex, isChecking, isSyncing, syncToChannex, updateInChannex, channexGroup } = useChannexGroup({
    groupId: selectedGroup?.id,
    groupTitle: selectedGroup?.title,
    enabled: !!selectedGroup,
  });

  // Hook for updating local group
  const updateGroupMutation = useUpdateGroup();
  const isUpdatingLocal = updateGroupMutation.isPending;

  // Set initial value when opening modal
  useEffect(() => {
    if (showGroupModal) {
      setGroupTitleInput(channexGroup?.attributes?.title || selectedGroup?.title || '');
    }
  }, [showGroupModal, channexGroup, selectedGroup]);

  const handleOpenGroupModal = () => {
    setShowGroupModal(true);
  };

  const handleCloseGroupModal = () => {
    setShowGroupModal(false);
    setGroupTitleInput('');
  };

  const handleUpdateGroup = async () => {
    if (groupTitleInput.trim() && selectedGroup?.id) {
      // Update local database first
      await updateGroupMutation.mutateAsync({
        id: selectedGroup.id,
        payload: { title: groupTitleInput.trim() }
      });
      // Then update Channex
      updateInChannex(groupTitleInput.trim());
      handleCloseGroupModal();
    }
  };

  // Fetch properties filtered by group
  const { data: propertiesData } = useProperties({
    limit: 100,
    sortBy: 'title',
    sortOrder: 'ASC',
    groupId: groupId || undefined,
  });
  const properties = propertiesData?.data || [];

  // Fetch tax sets for the selected property
  const { data: taxSetsData, isLoading: isLoadingTaxSets } = useTaxSetsByProperty(propertyId || '');
  const taxSets = taxSetsData || [];

  // Fetch room types for the selected property
  const { data: roomTypesData, isLoading: isLoadingRoomTypes } = useRoomTypesByProperty(propertyId || '', !!propertyId);
  const roomTypes = roomTypesData || [];

  // Fetch rate plans for the selected room type
  const { data: ratePlansData, isLoading: isLoadingRatePlans } = useRatePlansByRoomType(roomTypeId || '', !!roomTypeId);
  const ratePlans = ratePlansData || [];

  const handlePropertySelect = (selectedPropertyId: string) => {
    setPropertyId(selectedPropertyId);
  };

  const handleAddProperty = () => {
    navigate(`/properties/create${groupId ? `?groupId=${groupId}` : ''}`);
  };

  const handleTaxSetSelect = (selectedTaxSetId: string) => {
    setTaxSetId(selectedTaxSetId);
  };

  const handleAddTaxSet = () => {
    navigate(`/tax-sets/create?propertyId=${propertyId}`);
  };

  const handleRoomTypeSelect = (selectedRoomTypeId: string) => {
    setRoomTypeId(selectedRoomTypeId);
  };

  const handleAddRoomType = () => {
    navigate(`/room-types/create?propertyId=${propertyId}`);
  };

  const handleRatePlanSelect = (selectedRatePlanId: string) => {
    setRatePlanId(selectedRatePlanId);
  };

  const handleAddRatePlan = () => {
    const params = new URLSearchParams();
    if (roomTypeId) params.set('roomTypeId', roomTypeId);
    if (taxSetId) params.set('taxSetId', taxSetId);
    navigate(`/rate-plans/create?${params.toString()}`);
  };

  // Don't show if we don't have company info at all
  if (!companyId && !company) {
    return null;
  }

  const companyName = company?.name || `Company ${companyId}`;

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200 min-h-[48px] w-full">
      <div className="flex items-center gap-2">
        {/* Company (Read-only) */}
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-slate-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="font-semibold text-slate-900">{companyName}</span>
        </div>

        {/* Separator */}
        {(selectedGroup || groupId) && <span className="text-slate-400">/</span>}

        {/* Group (Read-only) */}
        {selectedGroup ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">{selectedGroup.title}</span>
            {isChecking ? (
              // Loading state
              <div className="h-5 w-5 rounded-sm bg-slate-200 animate-pulse" />
            ) : isSyncing ? (
              // Syncing state
              <div className="h-5 w-5 flex items-center justify-center">
                <svg className="h-4 w-4 animate-spin text-brand-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            ) : existsInChannex ? (
              // Exists in Channex - clickable to open update modal
              <button
                onClick={handleOpenGroupModal}
                className="h-5 w-5 rounded-sm overflow-hidden hover:ring-2 hover:ring-brand-300 transition-all"
                title={t('context.syncedWithChannex') + ' - ' + t('common.update')}
              >
                <img 
                  src="/group-icon.png" 
                  alt={t('context.syncedWithChannex')}
                  className="h-full w-full object-cover"
                />
              </button>
            ) : (
              // Not in Channex - show grayed icon, clickable to sync
              <button
                onClick={syncToChannex}
                className="h-5 w-5 rounded-sm overflow-hidden hover:ring-2 hover:ring-brand-300 transition-all"
                title={t('context.clickToSyncChannex')}
              >
                <img 
                  src="/group-icon.png" 
                  alt={t('context.notSyncedWithChannex')}
                  className="h-full w-full object-cover grayscale opacity-50 hover:opacity-75 transition-opacity"
                />
              </button>
            )}
          </div>
        ) : groupId ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500">Loading group...</span>
            <div className="h-5 w-5 rounded-sm bg-slate-200 animate-pulse" />
          </div>
        ) : null}

        {/* Property Selector Dropdown - next to group */}
        {groupId && (
          <>
            <span className="text-slate-400">/</span>
            <DropdownMenu
              trigger={
                <button type="button" className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg transition-colors text-sm font-medium shadow-sm focus:outline-none focus:ring-2 ${
                  selectedProperty 
                    ? 'bg-blue-100 border-blue-300 text-slate-900 hover:bg-blue-200 focus:ring-blue-500' 
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-blue-500'
                }`}>
                  <svg className={`h-4 w-4 ${selectedProperty ? 'text-blue-600' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>{selectedProperty?.title || t('context.selectProperty')}</span>
                  <svg className={`h-4 w-4 ${selectedProperty ? 'text-blue-600' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              ]}
              align="left"
            />
          </>
        )}

        {/* Tax Set Selector Dropdown - next to property */}
        {propertyId && (
          <>
            <span className="text-slate-400">/</span>
            {isLoadingTaxSets ? (
              <div className="h-8 w-32 bg-slate-200 rounded-lg animate-pulse" />
            ) : (
              <DropdownMenu
                trigger={
                  <button type="button" className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg transition-colors text-sm font-medium shadow-sm focus:outline-none focus:ring-2 ${
                    selectedTaxSet 
                      ? 'bg-green-100 border-green-300 text-slate-900 hover:bg-green-200 focus:ring-green-500' 
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-green-500'
                  }`}>
                    <svg className={`h-4 w-4 ${selectedTaxSet ? 'text-green-600' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                    </svg>
                    <span>{selectedTaxSet?.title || t('context.selectTaxSet')}</span>
                    <svg className={`h-4 w-4 ${selectedTaxSet ? 'text-green-600' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                }
                items={[
                  ...taxSets.map((ts) => ({
                    label: `${ts.title} (${ts.currency})`,
                    onClick: () => handleTaxSetSelect(ts.id),
                  })),
                  { divider: true } as const,
                  {
                    label: t('context.addTaxSet'),
                    icon: (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    ),
                    onClick: handleAddTaxSet,
                  },
                ]}
                align="left"
              />
            )}
          </>
        )}

        {/* Room Type Selector Dropdown - next to tax sets */}
        {propertyId && (
          <>
            <span className="text-slate-400">/</span>
            {isLoadingRoomTypes ? (
              <div className="h-8 w-32 bg-slate-200 rounded-lg animate-pulse" />
            ) : (
              <DropdownMenu
                trigger={
                  <button type="button" className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg transition-colors text-sm font-medium shadow-sm focus:outline-none focus:ring-2 ${
                    selectedRoomType 
                      ? 'bg-purple-100 border-purple-300 text-slate-900 hover:bg-purple-200 focus:ring-purple-500' 
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-purple-500'
                  }`}>
                    <svg className={`h-4 w-4 ${selectedRoomType ? 'text-purple-600' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>{selectedRoomType?.title || t('context.selectRoomType')}</span>
                    <svg className={`h-4 w-4 ${selectedRoomType ? 'text-purple-600' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                }
                items={[
                  ...roomTypes.map((rt) => ({
                    label: rt.title,
                    onClick: () => handleRoomTypeSelect(rt.id),
                  })),
                  { divider: true } as const,
                  {
                    label: t('context.addRoomType'),
                    icon: (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    ),
                    onClick: handleAddRoomType,
                  },
                ]}
                align="left"
              />
            )}
          </>
        )}

        {/* Rate Plan Selector Dropdown - next to room types */}
        {roomTypeId && (
          <>
            <span className="text-slate-400">/</span>
            {isLoadingRatePlans ? (
              <div className="h-8 w-32 bg-slate-200 rounded-lg animate-pulse" />
            ) : (
              <DropdownMenu
                trigger={
                  <button type="button" className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg transition-colors text-sm font-medium shadow-sm focus:outline-none focus:ring-2 ${
                    selectedRatePlan 
                      ? 'bg-yellow-100 border-yellow-300 text-slate-900 hover:bg-yellow-200 focus:ring-yellow-500' 
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-yellow-500'
                  }`}>
                    <svg className={`h-4 w-4 ${selectedRatePlan ? 'text-yellow-600' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{selectedRatePlan?.title || t('context.selectRatePlan')}</span>
                    <svg className={`h-4 w-4 ${selectedRatePlan ? 'text-yellow-600' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                }
                items={[
                  ...ratePlans.map((rp) => ({
                    label: rp.title,
                    onClick: () => handleRatePlanSelect(rp.id),
                  })),
                  { divider: true } as const,
                  {
                    label: t('context.addRatePlan'),
                    icon: (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    ),
                    onClick: handleAddRatePlan,
                  },
                ]}
                align="left"
              />
            )}
          </>
        )}

        {/* Planning and Events Buttons - shown when property is selected, centered and sophisticated */}
        {propertyId && (
          <div className="flex items-center ml-auto gap-2">
       
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate('/planning');
              }}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-lg hover:from-slate-700 hover:to-slate-800 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
              title={t('planning.title', { defaultValue: 'Planning' })}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span className="tracking-wide">{t('planning.title', { defaultValue: 'Planning' })}</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate('/events');
              }}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-500 hover:to-indigo-600 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
              title={t('events.title', { defaultValue: 'Events' })}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="tracking-wide">{t('events.title', { defaultValue: 'Events' })}</span>
            </button>
          </div>
        )}
      </div>

      {/* Group Update Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={handleCloseGroupModal}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {t('context.updateGroupInChannex')}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('groups.fields.title')}
              </label>
              <input
                type="text"
                value={groupTitleInput}
                onChange={(e) => setGroupTitleInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                placeholder={t('groups.fields.titlePlaceholder')}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUpdateGroup();
                  if (e.key === 'Escape') handleCloseGroupModal();
                }}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCloseGroupModal}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleUpdateGroup}
                disabled={!groupTitleInput.trim() || isSyncing || isUpdatingLocal}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(isSyncing || isUpdatingLocal) ? t('common.updating') : t('common.update')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContextHeader;
