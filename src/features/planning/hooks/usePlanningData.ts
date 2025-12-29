/**
 * Hook for fetching planning data
 * 
 * Falls back to using existing endpoints if the unified planning endpoint doesn't exist.
 */

import { useQuery } from '@tanstack/react-query';
import { getPlanningData } from '@/api/planning.api';
import { getRoomTypesByProperty } from '@/api/room-types.api';
import { getRatePlansByProperty } from '@/api/rate-plans.api';
import { getRoomTypeAvailabilityByRoomType } from '@/api/room-type-availability.api';
import { getRatesByRatePlan } from '@/api/rate-plan-rates.api';
import type { PlanningFilters, PlanningResponse } from '../types';
import { format, parseISO, eachDayOfInterval } from 'date-fns';

interface UsePlanningDataParams {
  propertyId: string;
  startDate: string;
  endDate: string;
  filters?: PlanningFilters;
  enabled?: boolean;
}

/**
 * Fallback: Build planning data from existing endpoints
 */
const buildPlanningDataFromExistingEndpoints = async (
  propertyId: string,
  startDate: string,
  endDate: string,
  filters?: PlanningFilters
): Promise<PlanningResponse> => {
  // Generate all dates in range
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const dates = eachDayOfInterval({ start, end });
  const dateStrings = dates.map(d => format(d, 'yyyy-MM-dd'));
  
  // 1. Fetch room types
  const roomTypes = await getRoomTypesByProperty(propertyId);
  let filteredRoomTypes = roomTypes;
  
  if (filters?.roomTypeIds && filters.roomTypeIds.length > 0) {
    filteredRoomTypes = roomTypes.filter(rt => filters.roomTypeIds!.includes(rt.id));
  }
  
  // 2. Fetch rate plans
  const ratePlans = await getRatePlansByProperty(propertyId);
  let filteredRatePlans = ratePlans;
  
  if (filters?.ratePlanIds && filters.ratePlanIds.length > 0) {
    filteredRatePlans = ratePlans.filter(rp => filters.ratePlanIds!.includes(rp.id));
  }
  
  // 3. For each room type, fetch availability and rate plans
  const planningRoomTypes = await Promise.all(
    filteredRoomTypes.map(async (roomType) => {
      // Fetch availability for this room type
      const availabilityData = await getRoomTypeAvailabilityByRoomType(roomType.id, {
        startDate,
        endDate,
        limit: 1000, // Get all for the date range
      });
      
      const availabilityArray = Array.isArray(availabilityData)
        ? availabilityData
        : availabilityData.data || [];
      
      // Create availability map by date
      const availabilityMap = new Map(
        availabilityArray.map(av => [av.date, av])
      );
      
      // Build availability array for all dates (fill missing with 0, not countOfRooms)
      const availability = dateStrings.map(date => {
        const existing = availabilityMap.get(date);
        return {
          id: existing?.id || 0, // 0 means new record
          date,
          // Only use existing availability if record exists; otherwise 0 (not countOfRooms)
          availability: existing ? (existing.availability ?? 0) : 0,
        };
      });
      
      // Get rate plans for this room type
      const roomTypeRatePlans = filteredRatePlans.filter(rp => rp.roomTypeId === roomType.id);
      
      // Fetch rates for each rate plan
      const ratePlansWithRates = await Promise.all(
        roomTypeRatePlans.map(async (ratePlan) => {
          const ratesData = await getRatesByRatePlan(ratePlan.id, {
            startDate,
            endDate,
            limit: 1000, // Get all for the date range
          });
          
          const ratesArray = ratesData.data || [];
          const ratesMap = new Map(ratesArray.map(r => [r.date, r]));
          
          // Build rates array for all dates
          const rates = dateStrings.map(date => {
            const existing = ratesMap.get(date);
            return {
              id: existing?.id || 0, // 0 means new record
              date,
              rate: existing?.rate ?? 0,
            };
          });
          
          return {
            id: ratePlan.id,
            title: ratePlan.title,
            code: (ratePlan as any).code || undefined,
            rates,
          };
        })
      );
      
      return {
        id: roomType.id,
        title: roomType.title,
        countOfRooms: roomType.countOfRooms,
        availability,
        ratePlans: ratePlansWithRates,
      };
    })
  );
  
  return {
    propertyId,
    startDate,
    endDate,
    roomTypes: planningRoomTypes,
  };
};

export const usePlanningData = ({
  propertyId,
  startDate,
  endDate,
  filters,
  enabled = true,
}: UsePlanningDataParams) => {
  return useQuery({
    queryKey: ['planning', propertyId, startDate, endDate, filters],
    queryFn: async () => {
      try {
        // Try the unified endpoint first
        return await getPlanningData(propertyId, startDate, endDate, filters);
      } catch (error: any) {
        // If endpoint doesn't exist (404), fall back to existing endpoints
        if (error?.response?.status === 404) {
          return await buildPlanningDataFromExistingEndpoints(propertyId, startDate, endDate, filters);
        }
        throw error;
      }
    },
    enabled: enabled && !!propertyId && !!startDate && !!endDate,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

