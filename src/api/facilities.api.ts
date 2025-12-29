import axiosClient from "./axiosClient";
import {
  Facility,
  CreateFacilityPayload,
  UpdateFacilityPayload,
  PaginatedFacilitiesResponse,
  FacilityQueryParams,
} from "../features/facilities/types";

/**
 * Get all facilities (paginated)
 */
export const getFacilities = async (params?: FacilityQueryParams): Promise<PaginatedFacilitiesResponse> => {
  const { data } = await axiosClient.get<PaginatedFacilitiesResponse>("/facilities", { params });
  return data;
};

/**
 * Search facilities by name or description
 */
export const searchFacilities = async (searchTerm: string): Promise<Facility[]> => {
  const { data } = await axiosClient.get<Facility[]>("/facilities/search", {
    params: { q: searchTerm },
  });
  return data;
};

/**
 * Get a single facility by ID
 */
export const getFacilityById = async (id: string): Promise<Facility> => {
  const { data } = await axiosClient.get<Facility>(`/facilities/${id}`);
  return data;
};

/**
 * Create a new facility
 * 
 * ⚠️ IMPORTANT: Only send name and description in the payload.
 * DO NOT include companyId - it's automatically extracted from JWT token.
 * Including companyId will result in error: "property companyId should not exist"
 * 
 * @param payload - CreateFacilityPayload with ONLY name and description
 */
export const createFacility = async (payload: CreateFacilityPayload): Promise<Facility> => {
  // Ensure we're only sending allowed fields (name, description)
  // TypeScript prevents companyId from being included via CreateFacilityPayload type
  const { data } = await axiosClient.post<Facility>("/facilities", payload);
  return data;
};

/**
 * Update an existing facility
 */
export const updateFacility = async (id: string, payload: UpdateFacilityPayload): Promise<Facility> => {
  const { data } = await axiosClient.patch<Facility>(`/facilities/${id}`, payload);
  return data;
};

/**
 * Delete a facility
 */
export const deleteFacility = async (id: string): Promise<{ message: string }> => {
  const { data } = await axiosClient.delete<{ message: string }>(`/facilities/${id}`);
  return data;
};

