/**
 * Room Search Page
 * 
 * Allows clients to search for available rooms based on:
 * - Start date
 * - End date
 * - Number of rooms
 * - Number of companions (Adults, Children, Infants)
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';
import Button from '@/components/ui/Button';
import { getRoomTypesByProperty } from '@/api/room-types.api';
import { getRoomTypePhotosByRoomType } from '@/api/room-type-photos.api';
import { getRoomTypeAvailabilityByDateRange } from '@/api/room-type-availability.api';
import { createBooking } from '@/features/bookings/api';
import { useToast } from '@/context/ToastContext';
import { useAppContext } from '@/hooks/useAppContext';
import type { RoomType } from '@/features/room-types/types';
import type { CreateBookingPayload } from '@/features/bookings/types';

interface SearchFormData {
  startDate: string;
  endDate: string;
  numberOfRooms: number;
  adults: number;
  children: number;
  infants: number;
}

interface SelectedRoom {
  roomTypeId: string;
  numberOfRooms: number;
  roomType: RoomType;
}

const RoomSearchPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { propertyId: contextPropertyId, selectedProperty } = useAppContext();
  const [searchParams, setSearchParams] = useState<SearchFormData>({
    startDate: '',
    endDate: '',
    numberOfRooms: 1,
    adults: 1,
    children: 1,
    infants: 1,
  });

  // Room selection state: Map<roomTypeId, numberOfRooms>
  const [selectedRooms, setSelectedRooms] = useState<Map<string, number>>(new Map());

  // Clear selected rooms when property changes
  useEffect(() => {
    setSelectedRooms(new Map());
  }, [contextPropertyId]);

  // Fetch room types for the selected property only
  const { data: roomTypesData, isLoading: roomTypesLoading, error: roomTypesError } = useQuery({
    queryKey: ['roomTypes', 'property', contextPropertyId, 'search'],
    queryFn: () => getRoomTypesByProperty(contextPropertyId!),
    enabled: !!contextPropertyId,
  });

  // Fetch availability for the selected date range
  const { data: availabilityData, isLoading: availabilityLoading } = useQuery({
    queryKey: ['roomTypeAvailability', 'dateRange', searchParams.startDate, searchParams.endDate],
    queryFn: () => getRoomTypeAvailabilityByDateRange({
      startDate: searchParams.startDate,
      endDate: searchParams.endDate,
    }),
    enabled: !!searchParams.startDate && !!searchParams.endDate && searchParams.startDate < searchParams.endDate,
  });

  const isLoading = roomTypesLoading || availabilityLoading;
  const error = roomTypesError;

  // Filter rooms based on search criteria and availability
  const availableRooms = useMemo(() => {
    // If no property is selected, return empty array
    if (!contextPropertyId) {
      return [];
    }

    // roomTypesData is already filtered by property from the API (returns RoomType[])
    if (!roomTypesData || roomTypesData.length === 0) return [];

    // Only filter if dates are provided
    if (!searchParams.startDate || !searchParams.endDate) {
      return [];
    }

    // Start with room types from the API (already filtered by property)
    // getRoomTypesByProperty returns RoomType[], not PaginatedRoomTypesResponse
    let filtered = [...roomTypesData];

    // Filter by occupancy capacity
    filtered = filtered.filter((room) => {
      const totalGuests = searchParams.adults + searchParams.children + searchParams.infants;
      const roomCapacity = room.occAdults + room.occChildren + room.occInfants;
      // Check if room can accommodate the guests
      return (
        searchParams.adults <= room.occAdults &&
        searchParams.children <= room.occChildren &&
        searchParams.infants <= room.occInfants &&
        totalGuests <= roomCapacity
      );
    });

    // Filter by actual availability if availability data exists
    if (availabilityData && availabilityData.length > 0) {
      // Generate all dates in the range
      const dates: string[] = [];
      const start = new Date(searchParams.startDate);
      const end = new Date(searchParams.endDate);
      
      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        dates.push(d.toISOString().split('T')[0]);
      }

      // Group availability by roomTypeId
      const availabilityByRoomType = new Map<string, Map<string, number>>();
      availabilityData.forEach((av) => {
        if (!availabilityByRoomType.has(av.roomTypeId)) {
          availabilityByRoomType.set(av.roomTypeId, new Map());
        }
        availabilityByRoomType.get(av.roomTypeId)!.set(av.date, av.availability);
      });

      // Filter room types that have enough availability for ALL dates
      filtered = filtered.filter((room) => {
        const roomAvailability = availabilityByRoomType.get(room.id);
        
        // If no availability data for this room type, check if it has countOfRooms
        if (!roomAvailability) {
          // If no availability records exist, assume default availability (countOfRooms)
          return room.countOfRooms >= searchParams.numberOfRooms;
        }

        // Check if room has enough availability for ALL dates in the range
        const hasEnoughAvailability = dates.every((date) => {
          const availability = roomAvailability.get(date);
          // If no record for this date, use countOfRooms as default
          const availableRooms = availability !== undefined ? availability : room.countOfRooms;
          return availableRooms >= searchParams.numberOfRooms;
        });

        return hasEnoughAvailability;
      });
    } else if (availabilityData && availabilityData.length === 0) {
      // No availability data found - filter by countOfRooms as fallback
      filtered = filtered.filter((room) => room.countOfRooms >= searchParams.numberOfRooms);
    }

    // Return all matching room types (don't limit to numberOfRooms)
    return filtered;
  }, [roomTypesData, availabilityData, searchParams, contextPropertyId]);

  // Clean up selected rooms when available rooms change (remove stale room type IDs)
  useEffect(() => {
    if (availableRooms.length > 0 && selectedRooms.size > 0) {
      setSelectedRooms((prev) => {
        const newMap = new Map();
        const availableRoomIds = new Set(availableRooms.map((room) => room.id));
        
        // Only keep selected rooms that are still in availableRooms
        prev.forEach((count, roomTypeId) => {
          if (availableRoomIds.has(roomTypeId)) {
            newMap.set(roomTypeId, count);
          }
        });
        
        // If we removed any stale selections, notify the user
        if (newMap.size < prev.size) {
          const removedCount = prev.size - newMap.size;
          console.warn(`Removed ${removedCount} stale room type selection(s) that are no longer available`);
          showError(
            t('roomSearch.booking.invalidRoomTypes', {
              defaultValue: 'Some selected room types are no longer available. Please refresh and try again.',
            })
          );
        }
        
        return newMap;
      });
    }
  }, [availableRooms, selectedRooms.size, showError, t]);

  const handleInputChange = (field: keyof SearchFormData, value: string | number) => {
    setSearchParams((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearch = () => {
    // Search is automatically triggered by state changes
    // This function can be used for additional validation or API calls later
    console.log('Search triggered with params:', searchParams);
    // Clear selections when new search is performed
    setSelectedRooms(new Map());
  };

  // Calculate total selected rooms
  const totalSelectedRooms = useMemo(() => {
    let total = 0;
    selectedRooms.forEach((count) => {
      total += count;
    });
    return total;
  }, [selectedRooms]);

  // Get selected rooms as array
  const selectedRoomsArray = useMemo(() => {
    const rooms: SelectedRoom[] = [];
    availableRooms.forEach((room) => {
      const count = selectedRooms.get(room.id);
      if (count && count > 0) {
        rooms.push({
          roomTypeId: room.id,
          numberOfRooms: count,
          roomType: room,
        });
      }
    });
    return rooms;
  }, [selectedRooms, availableRooms]);

  // Use propertyId from context (all rooms must be from the same property)
  const propertyId = contextPropertyId;

  // Handle room selection with property validation
  const handleRoomSelection = (roomTypeId: string, count: number, roomPropertyId: string | null) => {
    // Validate that the room is from the same property
    if (count > 0 && roomPropertyId !== contextPropertyId) {
      showError(
        t('roomSearch.booking.differentProperty', {
          defaultValue: 'All rooms must be from the same property. Please select rooms from {{property}}.',
          property: selectedProperty?.title || 'the selected property',
        })
      );
      return;
    }

    setSelectedRooms((prev) => {
      const newMap = new Map(prev);
      if (count > 0) {
        newMap.set(roomTypeId, count);
      } else {
        newMap.delete(roomTypeId);
      }
      return newMap;
    });
  };

  // Get max available rooms for a room type
  const getMaxRoomsForType = (room: RoomType): number => {
    if (!searchParams.startDate || !searchParams.endDate) return 0;
    
    if (availabilityData && availabilityData.length > 0) {
      const dates: string[] = [];
      const start = new Date(searchParams.startDate);
      const end = new Date(searchParams.endDate);
      
      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        dates.push(d.toISOString().split('T')[0]);
      }

      const roomAvailability = new Map<string, number>();
      availabilityData
        .filter((av) => av.roomTypeId === room.id)
        .forEach((av) => {
          roomAvailability.set(av.date, av.availability);
        });

      // Find minimum availability across all dates
      let minAvailability = Infinity;
      dates.forEach((date) => {
        const availability = roomAvailability.get(date);
        const available = availability !== undefined ? availability : room.countOfRooms;
        minAvailability = Math.min(minAvailability, available);
      });

      return minAvailability === Infinity ? room.countOfRooms : minAvailability;
    }

    return room.countOfRooms;
  };

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: (payload: CreateBookingPayload & { rooms?: any[] }) => createBooking(payload),
    onSuccess: (data) => {
      showSuccess(
        t('roomSearch.booking.created', {
          defaultValue: 'Booking created successfully!',
        })
      );
      // Navigate to booking details
      navigate(`/bookings/${data.id}`);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        t('roomSearch.booking.error', { defaultValue: 'Failed to create booking' });
      showError(errorMessage);
    },
  });

  // Handle booking creation
  const handleCreateBooking = async () => {
    if (selectedRoomsArray.length === 0) {
      showError(
        t('roomSearch.booking.noRoomsSelected', {
          defaultValue: 'Please select at least one room',
        })
      );
      return;
    }

    if (totalSelectedRooms !== searchParams.numberOfRooms) {
      showError(
        t('roomSearch.booking.roomCountMismatch', {
          defaultValue: `Please select exactly ${searchParams.numberOfRooms} room(s)`,
          count: searchParams.numberOfRooms,
        })
      );
      return;
    }

    if (!propertyId) {
      showError(
        t('roomSearch.booking.noProperty', {
          defaultValue: 'Please select a property first to create a booking.',
        })
      );
      return;
    }

    try {
      // Validate that all selected room types still exist in availableRooms
      const availableRoomIds = new Set(availableRooms.map((room) => room.id));
      const invalidRooms = selectedRoomsArray.filter(
        (selected) => !availableRoomIds.has(selected.roomTypeId)
      );

      if (invalidRooms.length > 0) {
        console.error('Invalid room type IDs detected:', invalidRooms);
        showError(
          t('roomSearch.booking.invalidRoomTypes', {
            defaultValue: 'Some selected room types are no longer available. Please refresh and try again.',
          })
        );
        // Clear invalid selections
        setSelectedRooms((prev) => {
          const newMap = new Map(prev);
          invalidRooms.forEach((invalid) => {
            newMap.delete(invalid.roomTypeId);
          });
          return newMap;
        });
        return;
      }

      // Build rooms array for API - only include valid room types
      const roomsPayload = selectedRoomsArray.map((selected) => {
        // Double-check the room type exists
        const roomType = availableRooms.find((r) => r.id === selected.roomTypeId);
        if (!roomType) {
          throw new Error(`Room type ${selected.roomTypeId} not found in available rooms`);
        }

        return {
          roomTypeId: selected.roomTypeId,
          numberOfRooms: selected.numberOfRooms,
          checkinDate: searchParams.startDate,
          checkoutDate: searchParams.endDate,
          adults: searchParams.adults,
          children: searchParams.children,
          infants: searchParams.infants,
        };
      });

      // Log the payload for debugging
      console.log('Creating booking with payload:', {
        propertyId,
        roomsCount: roomsPayload.length,
        roomTypeIds: roomsPayload.map((r) => r.roomTypeId),
        roomsPayload,
      });

      // Build booking payload
      const bookingPayload: CreateBookingPayload & { rooms?: any[] } = {
        propertyId,
        status: 'pending',
        arrivalDate: searchParams.startDate,
        departureDate: searchParams.endDate,
        amount: '0.00',
        currency: 'EUR', // Default, can be enhanced later
        bookingType: 'internal', // Mark as internal/direct booking (not OTA)
        occupancy: {
          adults: searchParams.adults,
          children: searchParams.children,
          infants: searchParams.infants,
        },
        rooms: roomsPayload, // Include rooms array
      };

      await createBookingMutation.mutateAsync(bookingPayload);
    } catch (error) {
      // Error handled by mutation onError
      console.error('Error creating booking:', error);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {t('roomSearch.title', { defaultValue: 'Search for Available Rooms' })}
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          {t('roomSearch.subtitle', { defaultValue: 'Find the perfect room for your stay' })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - Search Form */}
        <Card title={t('roomSearch.form.title', { defaultValue: 'Search Criteria' })}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="space-y-6"
          >
            {/* Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="startDate" className="text-xs">
                  {t('roomSearch.form.startDate', { defaultValue: 'Start Date' })} *
                </Label>
                <Input
                  type="date"
                  id="startDate"
                  value={searchParams.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  min={today}
                  required
                  className="py-1.5 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="endDate" className="text-xs">
                  {t('roomSearch.form.endDate', { defaultValue: 'End Date' })} *
                </Label>
                <Input
                  type="date"
                  id="endDate"
                  value={searchParams.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  min={searchParams.startDate || today}
                  required
                  className="py-1.5 text-sm"
                />
              </div>
            </div>

            {/* Number of Rooms and Companions - Compact Layout */}
            <div className="space-y-4">
              {/* Number of Rooms */}
              <div className="space-y-1.5">
                <Label htmlFor="numberOfRooms" className="text-xs">
                  {t('roomSearch.form.numberOfRooms', { defaultValue: 'Number of Rooms' })} *
                </Label>
                <Input
                  type="number"
                  id="numberOfRooms"
                  value={searchParams.numberOfRooms}
                  onChange={(e) => handleInputChange('numberOfRooms', parseInt(e.target.value) || 1)}
                  min={1}
                  required
                  className="py-1.5 text-sm"
                />
              </div>

              {/* Companions Section - Side by Side */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-900">
                  {t('roomSearch.form.companions', { defaultValue: 'Companions' })}
                </Label>
                
                <div className="grid grid-cols-3 gap-2">
                  {/* Adults */}
                  <div className="space-y-1">
                    <Label htmlFor="adults" className="text-xs">
                      {t('roomSearch.form.adults', { defaultValue: 'Adults' })} *
                    </Label>
                    <Input
                      type="number"
                      id="adults"
                      value={searchParams.adults}
                      onChange={(e) => handleInputChange('adults', parseInt(e.target.value) || 0)}
                      min={1}
                      required
                      className="py-1.5 text-sm text-center"
                    />
                    <p className="text-[10px] text-slate-500 leading-tight">
                      {t('roomSearch.form.adultsDescription', {
                        defaultValue: '18+ years',
                      })}
                    </p>
                  </div>

                  {/* Children */}
                  <div className="space-y-1">
                    <Label htmlFor="children" className="text-xs">
                      {t('roomSearch.form.children', { defaultValue: 'Children' })}
                    </Label>
                    <Input
                      type="number"
                      id="children"
                      value={searchParams.children}
                      onChange={(e) => handleInputChange('children', parseInt(e.target.value) || 0)}
                      min={0}
                      className="py-1.5 text-sm text-center"
                    />
                    <p className="text-[10px] text-slate-500 leading-tight">
                      {t('roomSearch.form.childrenDescription', {
                        defaultValue: '2-17 years',
                      })}
                    </p>
                  </div>

                  {/* Infants */}
                  <div className="space-y-1">
                    <Label htmlFor="infants" className="text-xs">
                      {t('roomSearch.form.infants', { defaultValue: 'Infants' })}
                    </Label>
                    <Input
                      type="number"
                      id="infants"
                      value={searchParams.infants}
                      onChange={(e) => handleInputChange('infants', parseInt(e.target.value) || 0)}
                      min={0}
                      className="py-1.5 text-sm text-center"
                    />
                    <p className="text-[10px] text-slate-500 leading-tight">
                      {t('roomSearch.form.infantsDescription', {
                        defaultValue: 'Under 2',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={
                !searchParams.startDate ||
                !searchParams.endDate ||
                searchParams.startDate >= searchParams.endDate
              }
            >
              {t('roomSearch.form.searchButton', { defaultValue: 'Search Rooms' })}
            </Button>
          </form>
        </Card>

        {/* Right Side - Available Rooms */}
        <Card title={t('roomSearch.results.title', { defaultValue: 'Available Rooms' })}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-600"></div>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-sm font-medium text-red-600">
                {t('roomSearch.results.error', { defaultValue: 'Error loading rooms' })}
              </p>
              <p className="text-xs text-red-500 mt-1">
                {error instanceof Error ? error.message : 'Unknown error occurred'}
              </p>
            </div>
          ) : !searchParams.startDate || !searchParams.endDate ? (
            <div className="py-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-semibold text-slate-900">
                {t('roomSearch.results.noSearch', { defaultValue: 'Enter search criteria' })}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {t('roomSearch.results.noSearchDescription', {
                  defaultValue: 'Please fill in the search form to find available rooms.',
                })}
              </p>
            </div>
          ) : !contextPropertyId ? (
            <div className="py-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-slate-400"
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
              <h3 className="mt-2 text-sm font-semibold text-slate-900">
                {t('roomSearch.results.noProperty', { defaultValue: 'No property selected' })}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {t('roomSearch.results.noPropertyDescription', {
                  defaultValue: 'Please select a property first to search for available rooms.',
                })}
              </p>
            </div>
          ) : availableRooms.length === 0 ? (
            <div className="py-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 className="mt-2 text-sm font-semibold text-slate-900">
                {t('roomSearch.results.noRooms', { defaultValue: 'No rooms available' })}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {t('roomSearch.results.noRoomsDescription', {
                  defaultValue: 'Please adjust your search criteria or try different dates.',
                })}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">
                  {t('roomSearch.results.count', {
                    defaultValue: 'Found {{count}} room(s)',
                    count: availableRooms.length,
                  })}
                </p>
                {totalSelectedRooms > 0 && (
                  <div className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                    {totalSelectedRooms} / {searchParams.numberOfRooms}{' '}
                    {t('roomSearch.results.selected', { defaultValue: 'selected' })}
                  </div>
                )}
              </div>

              <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
                {availableRooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    selectedCount={selectedRooms.get(room.id) || 0}
                    maxRooms={getMaxRoomsForType(room)}
                    onSelect={(count) => handleRoomSelection(room.id, count, room.propertyId)}
                    searchParams={searchParams}
                  />
                ))}
              </div>

              {/* Selected Rooms Summary & Create Booking Button */}
              {totalSelectedRooms > 0 && (
                <div className="sticky bottom-0 mt-4 rounded-lg border border-brand-200 bg-brand-50 p-4 shadow-lg">
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-slate-900">
                      {t('roomSearch.booking.summary', { defaultValue: 'Selected Rooms' })}
                    </h4>
                    <div className="mt-2 space-y-1 text-xs text-slate-600">
                      {selectedRoomsArray.map((selected) => (
                        <div key={selected.roomTypeId} className="flex justify-between">
                          <span>{selected.roomType.title}</span>
                          <span className="font-medium">
                            {selected.numberOfRooms} {selected.numberOfRooms === 1 ? t('roomSearch.booking.room', { defaultValue: 'room' }) : t('roomSearch.booking.rooms', { defaultValue: 'rooms' })}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center justify-between border-t border-brand-200 pt-2 text-sm font-semibold text-slate-900">
                      <span>
                        {t('roomSearch.booking.total', { defaultValue: 'Total' })}:
                      </span>
                      <span>
                        {totalSelectedRooms} / {searchParams.numberOfRooms}{' '}
                        {t('roomSearch.booking.rooms', { defaultValue: 'rooms' })}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={handleCreateBooking}
                    className="w-full"
                    isLoading={createBookingMutation.isPending}
                    disabled={
                      totalSelectedRooms !== searchParams.numberOfRooms ||
                      createBookingMutation.isPending
                    }
                  >
                    {createBookingMutation.isPending
                      ? t('roomSearch.booking.creating', { defaultValue: 'Creating Booking...' })
                      : t('roomSearch.booking.createButton', { defaultValue: 'Create Booking' })}
                  </Button>
                  {totalSelectedRooms !== searchParams.numberOfRooms && (
                    <p className="mt-2 text-center text-xs text-amber-600">
                      {t('roomSearch.booking.selectAllRooms', {
                        defaultValue: `Please select ${searchParams.numberOfRooms} room(s) to continue`,
                        count: searchParams.numberOfRooms,
                      })}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

// Room Card Component
interface RoomCardProps {
  room: RoomType;
  selectedCount: number;
  maxRooms: number;
  onSelect: (count: number) => void;
  searchParams: SearchFormData;
}

const RoomCard: React.FC<RoomCardProps> = ({
  room,
  selectedCount,
  maxRooms,
  onSelect,
  searchParams,
}) => {
  const { t } = useTranslation();

  // Fetch photos for this room type
  const { data: photos, isLoading: photosLoading } = useQuery({
    queryKey: ['roomTypePhotos', room.id],
    queryFn: () => getRoomTypePhotosByRoomType(room.id),
    enabled: !!room.id,
  });

  const mainPhoto =
    photos && photos.length > 0
      ? photos.sort((a, b) => (a.position || 0) - (b.position || 0))[0]?.url
      : null;

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    const clampedValue = Math.max(0, Math.min(value, maxRooms));
    onSelect(clampedValue);
  };

  const handleIncrement = () => {
    if (selectedCount < maxRooms) {
      onSelect(selectedCount + 1);
    }
  };

  const handleDecrement = () => {
    if (selectedCount > 0) {
      onSelect(selectedCount - 1);
    }
  };

  return (
    <div className="group cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-lg">
      {/* Image Section */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        {photosLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent"></div>
          </div>
        ) : mainPhoto ? (
          <img
            src={mainPhoto}
            alt={room.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e2e8f0" width="400" height="300"/%3E%3Ctext fill="%2394a3b8" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <svg
              className="h-12 w-12 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        {/* Photo count badge */}
        {photos && photos.length > 1 && (
          <div className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {photos.length} {t('roomSearch.room.photos', { defaultValue: 'photos' })}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Title and Property */}
        <div className="mb-2">
          <h4 className="text-lg font-semibold text-slate-900 line-clamp-1">{room.title}</h4>
          {room.property && (
            <p className="text-sm text-slate-500 mt-0.5">{room.property.title}</p>
          )}
        </div>

        {/* Occupancy Info - Compact */}
        <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>
              {room.occAdults} {t('roomSearch.room.adults', { defaultValue: 'Adults' })}
            </span>
          </div>
          {room.occChildren > 0 && (
            <div className="flex items-center gap-1">
              <span>•</span>
              <span>
                {room.occChildren} {t('roomSearch.room.children', { defaultValue: 'Children' })}
              </span>
            </div>
          )}
          {room.occInfants > 0 && (
            <div className="flex items-center gap-1">
              <span>•</span>
              <span>
                {room.occInfants} {t('roomSearch.room.infants', { defaultValue: 'Infants' })}
              </span>
            </div>
          )}
        </div>

        {/* Additional Info - Compact Grid */}
        <div className="mb-3 flex flex-wrap gap-3 text-xs text-slate-500">
          {room.capacity && (
            <div className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>{room.capacity} {t('roomSearch.room.capacity', { defaultValue: 'Capacity' })}</span>
            </div>
          )}
          {room.countOfRooms && (
            <div className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>
                {maxRooms} {t('roomSearch.room.availableRooms', { defaultValue: 'Available' })}
              </span>
            </div>
          )}
          {room.roomKind && (
            <div className="flex items-center gap-1">
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium">
                {room.roomKind}
              </span>
            </div>
          )}
        </div>

        {/* Room Selection Controls */}
        <div className="border-t border-slate-200 pt-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-slate-700">
              {t('roomSearch.booking.selectRooms', { defaultValue: 'Select Rooms' })}:
            </Label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={selectedCount === 0}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <Input
                type="number"
                value={selectedCount}
                onChange={handleQuantityChange}
                min={0}
                max={maxRooms}
                className="w-16 py-1 text-center text-sm"
              />
              <button
                type="button"
                onClick={handleIncrement}
                disabled={selectedCount >= maxRooms}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
          {selectedCount > 0 && (
            <p className="mt-1 text-xs text-brand-600">
              {selectedCount} {selectedCount === 1 ? t('roomSearch.booking.room', { defaultValue: 'room' }) : t('roomSearch.booking.rooms', { defaultValue: 'rooms' })} {t('roomSearch.booking.selected', { defaultValue: 'selected' })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomSearchPage;
