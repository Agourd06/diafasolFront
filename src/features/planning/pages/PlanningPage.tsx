/**
 * Planning Page
 * 
 * Main page for the planning/inventory grid view.
 */

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { useQuery } from '@tanstack/react-query';
import { useAppContext } from '@/hooks/useAppContext';
import { format, addDays, subDays, startOfWeek, endOfWeek } from 'date-fns';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Label from '../../../components/ui/Label';
import Loader from '../../../components/Loader';
import PlanningGrid from '../components/PlanningGrid';
import { usePlanningData } from '../hooks/usePlanningData';
import { useQueryClient } from '@tanstack/react-query';
import { createRoomTypeAvailability, updateRoomTypeAvailability } from '@/api/room-type-availability.api';
import { createRatePlanRate, updateRatePlanRate } from '@/api/rate-plan-rates.api';
import { getRatePlansByProperty } from '@/api/rate-plans.api';
import { getRoomTypesByProperty } from '@/api/room-types.api';
import { useChannexProperty, getStoredChannexPropertyId } from '@/hooks/useChannexProperty';
import { useToast } from '@/context/ToastContext';
import type { PlanningCellValue } from '../types';

const PlanningPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { propertyId, selectedProperty } = useAppContext();
  
  // Get Channex property ID
  const { channexProperty } = useChannexProperty({
    property: selectedProperty,
    enabled: !!selectedProperty,
  });
  const channexPropertyId = channexProperty?.id || getStoredChannexPropertyId(propertyId || '') || null;
  
  // Date range state (default to current week)
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Sunday
  
  const [startDate, setStartDate] = useState(format(weekStart, 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(weekEnd, 'yyyy-MM-dd'));
  
  // Edited cells tracking
  const [editedCells, setEditedCells] = useState<Map<string, PlanningCellValue>>(new Map());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Track which rows have been saved but not synced yet
  // Set of room type IDs and rate plan IDs that need syncing
  const [rowsNeedingSync, setRowsNeedingSync] = useState<Set<string>>(new Set());
  
  // Filters
  const [selectedRoomTypeIds, setSelectedRoomTypeIds] = useState<string[]>([]);
  const [selectedRatePlanIds, setSelectedRatePlanIds] = useState<string[]>([]);
  
  // Fetch planning data
  const { data: planningData, isLoading, error } = usePlanningData({
    propertyId: propertyId || '',
    startDate,
    endDate,
    filters: {
      roomTypeIds: selectedRoomTypeIds.length > 0 ? selectedRoomTypeIds : undefined,
      ratePlanIds: selectedRatePlanIds.length > 0 ? selectedRatePlanIds : undefined,
    },
    enabled: !!propertyId,
  });
  
  // Note: We're using individual update endpoints directly instead of batch endpoints
  // This ensures reliable updates even if batch endpoints don't exist
  
  // Handle cell changes
  const handleCellChange = (cell: PlanningCellValue) => {
    const cellKey = cell.type === 'availability'
      ? `availability-${cell.roomTypeId}-${cell.date}`
      : `rate-${cell.ratePlanId}-${cell.date}`;
    
    setEditedCells((prev) => {
      const newMap = new Map(prev);
      newMap.set(cellKey, cell);
      return newMap;
    });
    
    setHasUnsavedChanges(true);
  };
  
  // Navigate dates
  const navigateDateRange = (direction: 'prev' | 'next') => {
    const currentStart = new Date(startDate);
    const currentEnd = new Date(endDate);
    const rangeDays = Math.ceil((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24));
    
    if (direction === 'prev') {
      const newStart = subDays(currentStart, rangeDays);
      const newEnd = subDays(currentEnd, rangeDays);
      setStartDate(format(newStart, 'yyyy-MM-dd'));
      setEndDate(format(newEnd, 'yyyy-MM-dd'));
    } else {
      const newStart = addDays(currentStart, rangeDays);
      const newEnd = addDays(currentEnd, rangeDays);
      setStartDate(format(newStart, 'yyyy-MM-dd'));
      setEndDate(format(newEnd, 'yyyy-MM-dd'));
    }
  };
  
  // Save changes
  const handleSaveChanges = async () => {
    if (!planningData || !propertyId) return;
    
    try {
      // Validate availability values before saving
      const invalidAvailabilityCells: Array<{ date: string; value: number }> = [];
      
      editedCells.forEach((cell) => {
        if (cell.type === 'availability') {
          // Validate: availability must be an integer between 1-12
          const intValue = Math.floor(cell.value);
          if (cell.value !== intValue || cell.value < 1 || cell.value > 12) {
            invalidAvailabilityCells.push({ date: cell.date, value: cell.value });
          }
        }
      });
      
      // Show error if invalid availability values found
      if (invalidAvailabilityCells.length > 0) {
        const invalidDates = invalidAvailabilityCells.map(c => c.date).join(', ');
        showError(
          t('planning.validation.invalidAvailability', {
            defaultValue: 'Invalid availability values. Availability must be a whole number between 1 and 12. Invalid dates: {{dates}}',
            dates: invalidDates
          })
        );
        return;
      }
      
      // Get rate plans to find propertyId for new rate records
      const ratePlans = await getRatePlansByProperty(propertyId);
      
      // Separate creates and updates for availability
      const availabilityCreates: Array<{ propertyId: string; roomTypeId: string; date: string; availability: number }> = [];
      const availabilityUpdates: Array<{ id: number; availability: number }> = [];
      
      // Separate creates and updates for rates
      const rateCreates: Array<{ propertyId: string; ratePlanId: string; date: string; rate: number }> = [];
      const rateUpdates: Array<{ id: number; rate: number }> = [];
      
      editedCells.forEach((cell) => {
        if (cell.type === 'availability') {
          const roomType = planningData.roomTypes.find((rt) => rt.id === cell.roomTypeId);
          const avail = roomType?.availability.find((a) => a.date === cell.date);
          
          // Ensure value is an integer between 1-12 (double-check)
          const validValue = Math.max(1, Math.min(12, Math.floor(cell.value)));
          
          if (avail && avail.id > 0) {
            // Update existing
            availabilityUpdates.push({
              id: avail.id,
              availability: validValue,
            });
          } else {
            // Create new
            availabilityCreates.push({
              propertyId: propertyId,
              roomTypeId: cell.roomTypeId,
              date: cell.date,
              availability: validValue,
            });
          }
        } else {
          const roomType = planningData.roomTypes.find((rt) => rt.id === cell.roomTypeId);
          const ratePlan = roomType?.ratePlans.find((rp) => rp.id === cell.ratePlanId);
          const rate = ratePlan?.rates.find((r) => r.date === cell.date);
          const rp = ratePlans.find(rp => rp.id === cell.ratePlanId);
          
          if (rate && rate.id > 0) {
            // Update existing
            rateUpdates.push({
              id: rate.id,
              rate: cell.value,
            });
          } else {
            // Create new - need propertyId from rate plan
            if (rp) {
              rateCreates.push({
                propertyId: rp.propertyId,
                ratePlanId: cell.ratePlanId!,
                date: cell.date,
                rate: cell.value,
              });
            }
          }
        }
      });
      
      // Use individual update endpoints directly (they definitely exist)
      // Process all operations in batches to avoid overwhelming the server
      const batchSize = 10;
      
      // Update existing availability records using individual endpoint
      for (let i = 0; i < availabilityUpdates.length; i += batchSize) {
        const batch = availabilityUpdates.slice(i, i + batchSize);
        await Promise.all(
          batch.map(update =>
            updateRoomTypeAvailability(update.id, { availability: update.availability })
          )
        );
      }
      
      // Update existing rate records using individual endpoint
      for (let i = 0; i < rateUpdates.length; i += batchSize) {
        const batch = rateUpdates.slice(i, i + batchSize);
        await Promise.all(
          batch.map(update =>
            updateRatePlanRate(update.id, { rate: update.rate })
          )
        );
      }
      
      // Create new availability records
      for (let i = 0; i < availabilityCreates.length; i += batchSize) {
        const batch = availabilityCreates.slice(i, i + batchSize);
        await Promise.all(
          batch.map(create => createRoomTypeAvailability(create))
        );
      }
      
      // Create new rate records
      for (let i = 0; i < rateCreates.length; i += batchSize) {
        const batch = rateCreates.slice(i, i + batchSize);
        await Promise.all(
          batch.map(create => createRatePlanRate(create))
        );
      }
      
      // Track which rows need syncing (before clearing edited cells)
      const newRowsNeedingSync = new Set<string>();
      
      editedCells.forEach((cell) => {
        if (cell.type === 'availability') {
          newRowsNeedingSync.add(`availability-${cell.roomTypeId}`);
        } else if (cell.type === 'rate' && cell.ratePlanId) {
          newRowsNeedingSync.add(`rate-${cell.ratePlanId}`);
        }
      });
      
      // Add to existing set of rows needing sync
      setRowsNeedingSync((prev) => {
        const updated = new Set(prev);
        newRowsNeedingSync.forEach((id) => updated.add(id));
        return updated;
      });
      
      // Clear edited cells
      setEditedCells(new Map());
      setHasUnsavedChanges(false);
      
      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['planning', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['roomTypeAvailability'] });
      queryClient.invalidateQueries({ queryKey: ['ratePlanRates'] });
      
      // CRITICAL: Invalidate grouped queries for Channex sync to get fresh data
      // This ensures that when syncing, we use the newly saved values, not cached old values
      const affectedRoomTypeIds = new Set<string>();
      const affectedRatePlanIds = new Set<string>();
      
      editedCells.forEach((cell) => {
        if (cell.type === 'availability') {
          affectedRoomTypeIds.add(cell.roomTypeId);
        } else if (cell.type === 'rate' && cell.ratePlanId) {
          affectedRatePlanIds.add(cell.ratePlanId);
        }
      });
      
      // Invalidate grouped availability queries for affected room types
      affectedRoomTypeIds.forEach((roomTypeId) => {
        queryClient.invalidateQueries({ 
          queryKey: ['channex-grouped-availability', roomTypeId] 
        });
      });
      
      // Invalidate grouped rates queries for affected rate plans
      affectedRatePlanIds.forEach((ratePlanId) => {
        queryClient.invalidateQueries({ 
          queryKey: ['channex-grouped-rates', ratePlanId] 
        });
      });
      
      showSuccess(t('planning.saveSuccess', { defaultValue: 'Changes saved successfully!' }));
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error';
      showError(
        t('planning.saveError', {
          defaultValue: 'Error saving changes: ',
        }) + errorMessage
      );
    }
  };
  
  // Reset changes
  const handleResetChanges = () => {
    setEditedCells(new Map());
    setHasUnsavedChanges(false);
    // Note: Don't clear rowsNeedingSync here - those are for saved changes that need syncing
  };
  
  // Callback to mark a row as synced (called after successful sync)
  const handleRowSynced = (type: 'availability' | 'rate', id: string) => {
    setRowsNeedingSync((prev) => {
      const updated = new Set(prev);
      const key = type === 'availability' ? `availability-${id}` : `rate-${id}`;
      updated.delete(key);
      return updated;
    });
  };
  
  // Fetch ALL room types and rate plans for filter options (unfiltered)
  // This ensures filter options don't disappear when filters are applied
  const { data: allRoomTypes } = useQuery({
    queryKey: ['roomTypes', propertyId, 'all'],
    queryFn: () => getRoomTypesByProperty(propertyId || ''),
    enabled: !!propertyId,
  });
  
  const { data: allRatePlans } = useQuery({
    queryKey: ['ratePlans', propertyId, 'all'],
    queryFn: () => getRatePlansByProperty(propertyId || ''),
    enabled: !!propertyId,
  });
  
  // Prepare filter options from ALL available data (not filtered planningData)
  const roomTypeOptions = useMemo(() => {
    return (allRoomTypes || []).map(rt => ({
      value: rt.id,
      label: rt.title,
    }));
  }, [allRoomTypes]);
  
  const ratePlanOptions = useMemo(() => {
    return (allRatePlans || []).map(rp => ({
      value: rp.id,
      label: rp.title,
    }));
  }, [allRatePlans]);
  
  // Handle filter changes
  const handleRoomTypeFilterChange = (selectedOptions: any) => {
    const ids = selectedOptions ? selectedOptions.map((opt: any) => opt.value) : [];
    setSelectedRoomTypeIds(ids);
  };
  
  const handleRatePlanFilterChange = (selectedOptions: any) => {
    const ids = selectedOptions ? selectedOptions.map((opt: any) => opt.value) : [];
    setSelectedRatePlanIds(ids);
  };
  
  const handleClearFilters = () => {
    setSelectedRoomTypeIds([]);
    setSelectedRatePlanIds([]);
  };
  
  const hasActiveFilters = selectedRoomTypeIds.length > 0 || selectedRatePlanIds.length > 0;
  
  if (!propertyId) {
    return (
      <div className="space-y-4">
        <Card>
          <p className="text-sm text-slate-600">
            {t('planning.noPropertySelected', { defaultValue: 'Please select a property to view planning.' })}
          </p>
        </Card>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <Loader label={t('common.loading')} />
        </Card>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="space-y-4">
        <Card>
          <p className="text-sm text-red-600">
            {t('planning.error', { defaultValue: 'Error loading planning data.' })}
          </p>
        </Card>
      </div>
    );
  }
  
  if (!planningData) {
    return (
      <div className="space-y-4">
        <Card>
          <p className="text-sm text-slate-600">
            {t('planning.noData', { defaultValue: 'No planning data available.' })}
          </p>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-[calc(100vh-200px)] -m-6 p-6 space-y-2">
      {/* Compact Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            title={t('common.backToDashboard', { defaultValue: 'Back to Dashboard' })}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline">{t('common.backToDashboard', { defaultValue: 'Back to Dashboard' })}</span>
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {t('planning.title', { defaultValue: 'Planning' })}
            </h1>
            <p className="text-xs text-slate-600">
              {selectedProperty?.title || propertyId}
            </p>
          </div>
        </div>
      </div>
      
      {/* Compact Controls - All in one row */}
      <Card className="flex-shrink-0 py-2 px-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Date Navigation and Filters - All in one row */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() => navigateDateRange('prev')}
              className="px-2 py-1.5"
            >
              ←
            </Button>
            
            <div className="flex items-center gap-1.5">
              <Label htmlFor="startDate" className="text-xs whitespace-nowrap">
                {t('planning.startDate', { defaultValue: 'Start' })}
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-36 py-1.5 text-sm"
              />
            </div>
            
            <span className="text-slate-400 text-xs">to</span>
            
            <div className="flex items-center gap-1.5">
              <Label htmlFor="endDate" className="text-xs whitespace-nowrap">
                {t('planning.endDate', { defaultValue: 'End' })}
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-36 py-1.5 text-sm"
              />
            </div>
            
            <Button
              variant="outline"
              onClick={() => navigateDateRange('next')}
              className="px-2 py-1.5"
            >
              →
            </Button>
            
            {/* Divider */}
            <span className="text-slate-300 text-xs mx-1">|</span>
            
            {/* Room Type Filter - Compact */}
            <div className="flex items-center gap-1.5">
              <Label className="text-xs whitespace-nowrap text-slate-600">
                {t('planning.filters.roomTypes', { defaultValue: 'Rooms' })}
              </Label>
              <div className="w-56">
                <Select
                  isMulti
                  options={roomTypeOptions}
                  value={roomTypeOptions.filter(opt => selectedRoomTypeIds.includes(opt.value))}
                  onChange={handleRoomTypeFilterChange}
                  placeholder={t('planning.filters.allRoomTypes', { defaultValue: 'All room types' })}
                  className="text-sm"
                  styles={{
                    control: (base: any, state: any) => ({
                      ...base,
                      minHeight: '32px',
                      fontSize: '0.875rem',
                      borderColor: state.isFocused ? '#3b82f6' : '#cbd5e1',
                      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
                      '&:hover': {
                        borderColor: state.isFocused ? '#3b82f6' : '#94a3b8',
                      },
                    }),
                    multiValue: (base: any) => ({
                      ...base,
                      fontSize: '0.75rem',
                      backgroundColor: '#3b82f6',
                      borderRadius: '4px',
                      margin: '2px',
                    }),
                    multiValueLabel: (base: any) => ({
                      ...base,
                      color: '#ffffff',
                      padding: '2px 6px',
                      fontWeight: '500',
                    }),
                    multiValueRemove: (base: any) => ({
                      ...base,
                      color: '#ffffff',
                      padding: '0 4px',
                      borderRadius: '0 4px 4px 0',
                      '&:hover': {
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                      },
                    }),
                    placeholder: (base: any) => ({
                      ...base,
                      fontSize: '0.875rem',
                      color: '#94a3b8',
                    }),
                    menu: (base: any) => ({
                      ...base,
                      zIndex: 50,
                    }),
                    option: (base: any, state: any) => ({
                      ...base,
                      backgroundColor: state.isSelected
                        ? '#3b82f6'
                        : state.isFocused
                        ? '#eff6ff'
                        : '#ffffff',
                      color: state.isSelected ? '#ffffff' : '#1e293b',
                      '&:active': {
                        backgroundColor: '#3b82f6',
                        color: '#ffffff',
                      },
                    }),
                    indicatorsContainer: (base: any) => ({
                      ...base,
                      padding: '4px',
                    }),
                  }}
                />
              </div>
            </div>
            
            {/* Rate Plan Filter - Compact */}
            <div className="flex items-center gap-1.5">
              <Label className="text-xs whitespace-nowrap text-slate-600">
                {t('planning.filters.ratePlans', { defaultValue: 'Rates' })}
              </Label>
              <div className="w-56">
                <Select
                  isMulti
                  options={ratePlanOptions}
                  value={ratePlanOptions.filter(opt => selectedRatePlanIds.includes(opt.value))}
                  onChange={handleRatePlanFilterChange}
                  placeholder={t('planning.filters.allRatePlans', { defaultValue: 'All rate plans' })}
                  className="text-sm"
                  styles={{
                    control: (base: any, state: any) => ({
                      ...base,
                      minHeight: '32px',
                      fontSize: '0.875rem',
                      borderColor: state.isFocused ? '#3b82f6' : '#cbd5e1',
                      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
                      '&:hover': {
                        borderColor: state.isFocused ? '#3b82f6' : '#94a3b8',
                      },
                    }),
                    multiValue: (base: any) => ({
                      ...base,
                      fontSize: '0.75rem',
                      backgroundColor: '#3b82f6',
                      borderRadius: '4px',
                      margin: '2px',
                    }),
                    multiValueLabel: (base: any) => ({
                      ...base,
                      color: '#ffffff',
                      padding: '2px 6px',
                      fontWeight: '500',
                    }),
                    multiValueRemove: (base: any) => ({
                      ...base,
                      color: '#ffffff',
                      padding: '0 4px',
                      borderRadius: '0 4px 4px 0',
                      '&:hover': {
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                      },
                    }),
                    placeholder: (base: any) => ({
                      ...base,
                      fontSize: '0.875rem',
                      color: '#94a3b8',
                    }),
                    menu: (base: any) => ({
                      ...base,
                      zIndex: 50,
                    }),
                    option: (base: any, state: any) => ({
                      ...base,
                      backgroundColor: state.isSelected
                        ? '#3b82f6'
                        : state.isFocused
                        ? '#eff6ff'
                        : '#ffffff',
                      color: state.isSelected ? '#ffffff' : '#1e293b',
                      '&:active': {
                        backgroundColor: '#3b82f6',
                        color: '#ffffff',
                      },
                    }),
                    indicatorsContainer: (base: any) => ({
                      ...base,
                      padding: '4px',
                    }),
                  }}
                />
              </div>
            </div>
            
            {/* Clear Filters Button - Compact */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="px-2 py-1 text-xs"
                title={t('planning.filters.clear', { defaultValue: 'Clear filters' })}
              >
                ✕
              </Button>
            )}
          </div>
          
          {/* Action Buttons - Compact */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleResetChanges}
              disabled={!hasUnsavedChanges}
              className="px-3 py-1.5 text-sm"
            >
              {t('planning.resetChanges', { defaultValue: 'Reset' })}
            </Button>
            <Button
              onClick={handleSaveChanges}
              disabled={!hasUnsavedChanges}
              className="px-3 py-1.5 text-sm"
            >
              {t('planning.saveChanges', { defaultValue: 'Save' })}
            </Button>
            {rowsNeedingSync.size > 0 && (
              <div className="ml-2 px-2 py-1 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
                {t('planning.syncReminder', { defaultValue: "Don't forget to sync with Channex" })}
              </div>
            )}
          </div>
        </div>
      </Card>
      
      {/* Planning Grid - Takes most of the space */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {planningData && (
          <PlanningGrid
            data={planningData}
            onCellChange={handleCellChange}
            editedCells={editedCells}
            channexPropertyId={channexPropertyId}
            startDate={startDate}
            endDate={endDate}
            rowsNeedingSync={rowsNeedingSync}
            onRowSynced={handleRowSynced}
          />
        )}
      </div>
    </div>
  );
};

export default PlanningPage;

