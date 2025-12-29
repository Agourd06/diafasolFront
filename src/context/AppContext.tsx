import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Group } from "@/features/groups/types";
import type { Property } from "@/features/properties/types";
import type { TaxSet } from "@/features/tax-sets/types";
import type { RoomType } from "@/features/room-types/types";
import type { RatePlan } from "@/features/rate-plans/types";
import { useCompany, useAuth } from "@/hooks/useAuth";
import { getStoredAppContext, setStoredAppContext, removeStoredAppContext } from "@/utils/storage";
import { getGroupById } from "@/api/groups.api";
import { getPropertyById } from "@/api/properties.api";
import { getTaxSetById } from "@/api/tax-sets.api";
import { getRoomTypeById } from "@/api/room-types.api";
import { getRatePlanById } from "@/api/rate-plans.api";

export interface AppContextValue {
  companyId: number | null;
  groupId: string | null;
  propertyId: string | null;
  taxSetId: string | null;
  roomTypeId: string | null;
  ratePlanId: string | null;
  selectedGroup: Group | null;
  selectedProperty: Property | null;
  selectedTaxSet: TaxSet | null;
  selectedRoomType: RoomType | null;
  selectedRatePlan: RatePlan | null;
  setGroupId: (groupId: string | null) => void;
  setPropertyId: (propertyId: string | null) => void;
  setTaxSetId: (taxSetId: string | null) => void;
  setRoomTypeId: (roomTypeId: string | null) => void;
  setRatePlanId: (ratePlanId: string | null) => void;
  clearContext: () => void;
  showPropertyDetails: boolean;
  setShowPropertyDetails: (show: boolean) => void;
}

export const AppContext = createContext<AppContextValue | undefined>(undefined);

type Props = {
  children: React.ReactNode;
};

export const AppProvider: React.FC<Props> = ({ children }) => {
  const company = useCompany();
  const { user } = useAuth();
  // Use company.id if available, otherwise fall back to user.companyId
  const companyId = company?.id ?? user?.companyId ?? null;

  // Load from storage on mount
  const storedContext = getStoredAppContext();
  const [groupId, setGroupIdState] = useState<string | null>(storedContext?.groupId ?? null);
  const [propertyId, setPropertyIdState] = useState<string | null>(storedContext?.propertyId ?? null);
  const [taxSetId, setTaxSetIdState] = useState<string | null>(storedContext?.taxSetId ?? null);
  const [roomTypeId, setRoomTypeIdState] = useState<string | null>(storedContext?.roomTypeId ?? null);
  const [ratePlanId, setRatePlanIdState] = useState<string | null>(storedContext?.ratePlanId ?? null);
  const [showPropertyDetails, setShowPropertyDetails] = useState<boolean>(true);

  // Fetch groups to verify stored groupId or auto-select first one
  const { data: allGroupsData, isLoading: isLoadingGroups } = useQuery({
    queryKey: ['groups', 'all', companyId],
    queryFn: async () => {
      const { getGroups } = await import('@/api/groups.api');
      return await getGroups({ limit: 100, sortBy: 'title', sortOrder: 'ASC' });
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  // Auto-select first group if none is selected, or verify stored groupId exists
  useEffect(() => {
    if (!companyId || isLoadingGroups || !allGroupsData?.data) return;

    const groups = allGroupsData.data;

    // If we have a stored groupId, verify it still exists
    if (groupId) {
      const groupExists = groups.some(g => g.id === groupId);
      if (!groupExists) {
        setGroupIdState(null);
        setPropertyIdState(null);
        if (groups.length > 0) {
          setGroupIdState(groups[0].id);
        }
        return;
      }
    }

    // If no group is selected and we have groups, auto-select the first one
    if (!groupId && groups.length > 0 && groups[0]?.id) {
      setGroupIdState(groups[0].id);
    }
  }, [companyId, groupId, allGroupsData, isLoadingGroups]);

  // Fetch selected group and property
  const { data: groupData } = useQuery({
    queryKey: ['groups', groupId],
    queryFn: () => getGroupById(groupId!),
    enabled: !!groupId,
  });

  const { data: propertyData } = useQuery({
    queryKey: ['properties', propertyId],
    queryFn: () => getPropertyById(propertyId!),
    enabled: !!propertyId,
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: 'always',
  });

  const { data: taxSetData } = useQuery({
    queryKey: ['taxSets', taxSetId],
    queryFn: () => getTaxSetById(taxSetId!),
    enabled: !!taxSetId,
  });

  const { data: roomTypeData } = useQuery({
    queryKey: ['roomTypes', roomTypeId],
    queryFn: () => getRoomTypeById(roomTypeId!),
    enabled: !!roomTypeId,
  });

  const { data: ratePlanData } = useQuery({
    queryKey: ['ratePlans', ratePlanId],
    queryFn: () => getRatePlanById(ratePlanId!),
    enabled: !!ratePlanId,
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: 'always',
  });

  const selectedGroup = groupData || null;
  const selectedProperty = propertyData || null;
  const selectedTaxSet = taxSetData || null;
  const selectedRoomType = roomTypeData || null;
  const selectedRatePlan = ratePlanData || null;

  // Save to storage when context changes
  useEffect(() => {
    if (companyId) {
      setStoredAppContext({
        companyId,
        groupId,
        propertyId,
        taxSetId,
        roomTypeId,
        ratePlanId,
      });
    } else {
      removeStoredAppContext();
    }
  }, [companyId, groupId, propertyId, taxSetId, roomTypeId, ratePlanId]);

  // Group is read-only, but we keep this for internal use
  const setGroupId = useCallback((newGroupId: string | null) => {
    setGroupIdState(newGroupId);
    setPropertyIdState(null); // Reset property when group changes
    setTaxSetIdState(null); // Reset tax set when group changes
    setRoomTypeIdState(null); // Reset room type when group changes
  }, []);

  const setPropertyId = useCallback((newPropertyId: string | null) => {
    setPropertyIdState(newPropertyId);
    setTaxSetIdState(null); // Reset tax set when property changes
    setRoomTypeIdState(null); // Reset room type when property changes
    setShowPropertyDetails(true); // Show details panel when property changes
  }, []);

  const setTaxSetId = useCallback((newTaxSetId: string | null) => {
    setTaxSetIdState(newTaxSetId);
    // Clear room type and rate plan when tax set is selected
    if (newTaxSetId) {
      setRoomTypeIdState(null);
      setRatePlanIdState(null);
    }
  }, []);

  const setRoomTypeId = useCallback((newRoomTypeId: string | null) => {
    setRoomTypeIdState(newRoomTypeId);
    // Clear tax set when room type is selected
    if (newRoomTypeId) {
      setTaxSetIdState(null);
    }
    // Reset rate plan when room type changes
    setRatePlanIdState(null);
  }, []);

  const setRatePlanId = useCallback((newRatePlanId: string | null) => {
    setRatePlanIdState(newRatePlanId);
    // Clear tax set when rate plan is selected
    if (newRatePlanId) {
      setTaxSetIdState(null);
    }
  }, []);

  const clearContext = useCallback(() => {
    setGroupIdState(null);
    setPropertyIdState(null);
    setTaxSetIdState(null);
    setRoomTypeIdState(null);
    setRatePlanIdState(null);
    removeStoredAppContext();
  }, []);

  // Clear context if company changes
  useEffect(() => {
    if (storedContext?.companyId && storedContext.companyId !== companyId) {
      clearContext();
    }
  }, [companyId, storedContext?.companyId, clearContext]);

  const value = useMemo<AppContextValue>(
    () => ({
      companyId,
      groupId,
      propertyId,
      taxSetId,
      roomTypeId,
      ratePlanId,
      selectedGroup,
      selectedProperty,
      selectedTaxSet,
      selectedRoomType,
      selectedRatePlan,
      setGroupId,
      setPropertyId,
      setTaxSetId,
      setRoomTypeId,
      setRatePlanId,
      clearContext,
      showPropertyDetails,
      setShowPropertyDetails,
    }),
    [companyId, groupId, propertyId, taxSetId, roomTypeId, ratePlanId, selectedGroup, selectedProperty, selectedTaxSet, selectedRoomType, selectedRatePlan, setGroupId, setPropertyId, setTaxSetId, setRoomTypeId, setRatePlanId, clearContext, showPropertyDetails]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

