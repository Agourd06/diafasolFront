import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { 
  checkRoomTypeExistsInChannex, 
  createChannexRoomType as createChannexRoomTypeApi,
  updateChannexRoomType as updateChannexRoomTypeApi,
  getChannexRoomTypeById,
  CreateChannexRoomTypePayload,
  ChannexRoomType,
} from '@/api/channex.api';
import { RoomType } from '@/features/room-types/types';

interface UseChannexRoomTypeOptions {
  roomType: RoomType | null | undefined;
  channexPropertyId?: string | null;
  enabled?: boolean;
}

// Storage keys for Channex ID mapping
export const CHANNEX_ROOM_TYPE_MAP_KEY = 'channex_room_type_map';

// Get stored Channex room type ID for a local room type
export const getStoredChannexRoomTypeId = (localRoomTypeId: string): string | null => {
  try {
    const map = JSON.parse(localStorage.getItem(CHANNEX_ROOM_TYPE_MAP_KEY) || '{}');
    return map[localRoomTypeId] || null;
  } catch {
    return null;
  }
};

// Store Channex room type ID mapping
export const storeChannexRoomTypeId = (localRoomTypeId: string, channexRoomTypeId: string) => {
  try {
    const map = JSON.parse(localStorage.getItem(CHANNEX_ROOM_TYPE_MAP_KEY) || '{}');
    map[localRoomTypeId] = channexRoomTypeId;
    localStorage.setItem(CHANNEX_ROOM_TYPE_MAP_KEY, JSON.stringify(map));
  } catch {
    // Silent fail - localStorage might not be available
  }
};

// Clear stored Channex room type ID for a local room type
export const clearStoredChannexRoomTypeId = (localRoomTypeId: string) => {
  try {
    const map = JSON.parse(localStorage.getItem(CHANNEX_ROOM_TYPE_MAP_KEY) || '{}');
    delete map[localRoomTypeId];
    localStorage.setItem(CHANNEX_ROOM_TYPE_MAP_KEY, JSON.stringify(map));
  } catch {
    // Silent fail
  }
};

/**
 * Map our room type to Channex room type payload for CREATE
 */
export const mapRoomTypeToChannexCreatePayload = (
  roomType: RoomType, 
  channexPropertyId: string
): CreateChannexRoomTypePayload => {
  const payload: CreateChannexRoomTypePayload = {
    property_id: channexPropertyId,
    title: roomType.title,
    count_of_rooms: roomType.countOfRooms,
    occ_adults: roomType.occAdults,
    occ_children: roomType.occChildren,
    occ_infants: roomType.occInfants,
    default_occupancy: roomType.defaultOccupancy,
    facilities: [], // Empty array - can be populated from separate table
    content: {
      description: '', // Empty string - can be populated from content table
      photos: [], // Empty array - can be populated from photos table
    },
  };

  // Add optional fields
  if (roomType.roomKind) payload.room_kind = roomType.roomKind;
  if (roomType.capacity) payload.capacity = roomType.capacity;

  return payload;
};

/**
 * Map our room type to Channex room type payload for UPDATE (PUT)
 */
export const mapRoomTypeToChannexUpdatePayload = (
  roomType: RoomType
): Partial<CreateChannexRoomTypePayload> => {
  const payload: Partial<CreateChannexRoomTypePayload> = {
    title: roomType.title,
    count_of_rooms: roomType.countOfRooms,
    occ_adults: roomType.occAdults,
    occ_children: roomType.occChildren,
    occ_infants: roomType.occInfants,
    default_occupancy: roomType.defaultOccupancy,
    facilities: [], // Empty array - can be populated from separate table
    content: {
      description: '', // Empty string - can be populated from content table
      photos: [], // Empty array - can be populated from photos table
    },
  };

  // Add optional fields
  if (roomType.roomKind) payload.room_kind = roomType.roomKind;
  if (roomType.capacity) payload.capacity = roomType.capacity;

  return payload;
};

export const useChannexRoomType = ({ roomType, channexPropertyId, enabled = true }: UseChannexRoomTypeOptions) => {
  const queryClient = useQueryClient();
  const roomTypeId = roomType?.id;
  const roomTypeTitle = roomType?.title;

  // Check if room type exists in Channex
  // First try by stored ID, then fallback to title search
  const {
    data: channexRoomType,
    isLoading: isChecking,
    error: checkError,
    refetch: refetchRoomType,
  } = useQuery({
    queryKey: ['channex-room-type', roomTypeId],
    queryFn: async (): Promise<ChannexRoomType | null> => {
      if (!roomTypeId || !roomTypeTitle || !channexPropertyId) return null;
      
      // First, check if we have a stored Channex ID for this room type
      const storedChannexId = getStoredChannexRoomTypeId(roomTypeId);
      if (storedChannexId) {
        const roomTypeById = await getChannexRoomTypeById(storedChannexId);
        if (roomTypeById) {
          return roomTypeById;
        }
      }
      
      // Fallback: search by title
      const roomTypeByTitle = await checkRoomTypeExistsInChannex(roomTypeTitle, channexPropertyId);
      if (roomTypeByTitle) {
        // Store the mapping for future use
        storeChannexRoomTypeId(roomTypeId, roomTypeByTitle.id);
        return roomTypeByTitle;
      }
      
      return null;
    },
    enabled: enabled && !!roomTypeId && !!roomTypeTitle && !!channexPropertyId,
    staleTime: 1 * 60 * 1000, // Cache for 1 minute
    retry: 1,
  });

  // Mutation to create room type in Channex
  const createMutation = useMutation({
    mutationFn: (payload: CreateChannexRoomTypePayload) => createChannexRoomTypeApi(payload),
    onSuccess: (newRoomType) => {
      if (roomTypeId) {
        storeChannexRoomTypeId(roomTypeId, newRoomType.id);
      }
      queryClient.setQueryData(['channex-room-type', roomTypeId], newRoomType);
      refetchRoomType();
    },
  });

  // Mutation to update room type in Channex
  const updateMutation = useMutation({
    mutationFn: ({ id, payload, force }: { id: string; payload: Partial<CreateChannexRoomTypePayload>; force?: boolean }) => 
      updateChannexRoomTypeApi(id, payload, force),
    onSuccess: (updatedRoomType) => {
      queryClient.setQueryData(['channex-room-type', roomTypeId], updatedRoomType);
      refetchRoomType();
    },
    onError: (error: unknown) => {
      // If 404, the room type doesn't exist in Channex anymore - clear the mapping
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 404 && roomTypeId) {
        clearStoredChannexRoomTypeId(roomTypeId);
        // Invalidate query to force re-check
        queryClient.invalidateQueries({ queryKey: ['channex-room-type', roomTypeId] });
      }
    },
  });

  // Check if room type exists - either from query or from stored mapping
  const storedChannexId = roomTypeId ? getStoredChannexRoomTypeId(roomTypeId) : null;
  const existsInChannex = !!channexRoomType || !!storedChannexId;
  const channexIdToUse = channexRoomType?.id || storedChannexId;

  // Track previous room type data to detect changes
  const previousRoomTypeRef = useRef<string | null>(null);
  
  // Create a hash of the room type data to detect changes
  const getRoomTypeHash = (rt: RoomType | null | undefined): string => {
    if (!rt) return '';
    return JSON.stringify({
      title: rt.title,
      countOfRooms: rt.countOfRooms,
      occAdults: rt.occAdults,
      occChildren: rt.occChildren,
      occInfants: rt.occInfants,
      defaultOccupancy: rt.defaultOccupancy,
      roomKind: rt.roomKind,
      capacity: rt.capacity,
    });
  };

  // Auto-sync when room type data changes and it exists in Channex
  useEffect(() => {
    if (!roomType || !roomTypeId || !channexPropertyId || !channexIdToUse) {
      return;
    }

    const currentHash = getRoomTypeHash(roomType);
    const previousHash = previousRoomTypeRef.current;

    // Only auto-sync if:
    // 1. The data has actually changed (not first render)
    // 2. We're not already syncing
    if (
      previousHash !== null &&
      previousHash !== currentHash &&
      !createMutation.isPending &&
      !updateMutation.isPending
    ) {
      // Auto-update in Channex
      const updatePayload = mapRoomTypeToChannexUpdatePayload(roomType);
      updateMutation.mutate({ id: channexIdToUse, payload: updatePayload });
    }

    // Update the ref with current hash
    previousRoomTypeRef.current = currentHash;
  }, [
    roomType,
    roomTypeId,
    channexPropertyId,
    channexIdToUse,
    createMutation.isPending,
    updateMutation.isPending,
    updateMutation,
  ]);

  const handleSync = () => {
    if (roomType && roomTypeId && channexPropertyId && !createMutation.isPending && !updateMutation.isPending) {
      if (channexIdToUse) {
        // Update existing room type - use update payload
        const updatePayload = mapRoomTypeToChannexUpdatePayload(roomType);
        updateMutation.mutate({ id: channexIdToUse, payload: updatePayload });
      } else {
        // Create new room type - use full create payload
        const createPayload = mapRoomTypeToChannexCreatePayload(roomType, channexPropertyId);
        createMutation.mutate(createPayload);
      }
    }
  };

  return {
    channexRoomType,
    existsInChannex,
    isChecking,
    isSyncing: createMutation.isPending || updateMutation.isPending,
    isUpdating: updateMutation.isPending,
    checkError,
    syncError: createMutation.error || updateMutation.error,
    syncToChannex: handleSync,
  };
};
