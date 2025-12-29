import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import SearchSelect, { SearchSelectOption } from './SearchSelect';
import { searchRoomTypes, getRoomTypes, getRoomTypesByProperty } from '@/api/room-types.api';

interface RoomTypeSearchSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string | null;
  className?: string;
  propertyId?: string; // Optional filter by property
}

const RoomTypeSearchSelect: React.FC<RoomTypeSearchSelectProps> = ({
  label,
  value,
  onChange,
  disabled,
  error,
  className,
  propertyId,
}) => {
  const { t } = useTranslation();
  const [options, setOptions] = useState<SearchSelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);

  // Load initial room types
  const loadInitialRoomTypes = useCallback(async () => {
    setIsLoading(true);
    try {
      let roomTypes;
      
      if (propertyId) {
        // Use the dedicated endpoint for property-specific room types
        roomTypes = await getRoomTypesByProperty(propertyId);
      } else {
        // Load general room types
        const params = { page: 1, limit: 20, sortBy: 'title', sortOrder: 'ASC' };
        const response = await getRoomTypes(params);
        roomTypes = response.data;
      }
      
      const roomTypeOptions: SearchSelectOption[] = roomTypes.map((roomType) => ({
        value: roomType.id,
        label: roomType.title,
      }));
      setOptions(roomTypeOptions);
      setHasLoadedInitial(true);
    } catch (error) {
      console.error('Error loading initial room types:', error);
      setOptions([]);
      setHasLoadedInitial(true);
    } finally {
      setIsLoading(false);
    }
  }, [propertyId]);

  // Load initial room types on mount or when propertyId changes
  useEffect(() => {
    setHasLoadedInitial(false);
    setOptions([]);
    loadInitialRoomTypes();
  }, [loadInitialRoomTypes]);

  const handleSearch = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      // If no query and we haven't loaded initial data, load it
      if (!hasLoadedInitial) {
        await loadInitialRoomTypes();
      }
      return;
    }

    setIsLoading(true);
    try {
      const roomTypes = await searchRoomTypes(query);
      // Filter by property if specified
      const filteredRoomTypes = propertyId 
        ? roomTypes.filter(rt => rt.propertyId === propertyId)
        : roomTypes;
      
      const roomTypeOptions: SearchSelectOption[] = filteredRoomTypes.map((roomType) => ({
        value: roomType.id,
        label: roomType.title,
      }));
      setOptions(roomTypeOptions);
    } catch (error) {
      console.error('Error searching room types:', error);
    } finally {
      setIsLoading(false);
    }
  }, [propertyId, hasLoadedInitial, loadInitialRoomTypes]);

  // Load initial value if exists (for edit mode)
  useEffect(() => {
    if (value && !options.some(opt => String(opt.value) === String(value))) {
      // Try to find it in the current options first
      if (hasLoadedInitial && options.length > 0) {
        // Value not in current options, might need to search
        // But only if we have a value that looks like a UUID
        if (value.length > 8) {
          // For edit mode, we might need to fetch the specific room type
          // But for now, just keep the value and let the parent handle it
        }
      }
    }
  }, [value, options, hasLoadedInitial]);

  return (
    <SearchSelect
      label={label || t('roomTypes.title')}
      value={value}
      onChange={(val) => onChange(String(val))}
      options={options}
      placeholder={t('roomTypes.search.placeholder')}
      disabled={disabled}
      error={error}
      isLoading={isLoading}
      onSearchChange={handleSearch}
      noOptionsMessage={(query) => 
        query.length < 2 
          ? t('common.typeToSearch') 
          : t('common.noResultsFound')
      }
      className={className}
    />
  );
};

export default RoomTypeSearchSelect;

