/**
 * Groups API Client
 * 
 * All endpoints require authentication (JWT token in Authorization header).
 * The companyId is automatically extracted from the token.
 */

import axiosClient from './axiosClient';
import type {
  Group,
  CreateGroupPayload,
  UpdateGroupPayload,
  PaginatedGroupsResponse,
  GroupQueryParams,
} from '@/features/groups/types';

const BASE_URL = '/groups';

/**
 * Get all groups (paginated)
 * GET /api/groups
 */
export const getGroups = async (
  params?: GroupQueryParams
): Promise<PaginatedGroupsResponse> => {
  const response = await axiosClient.get<PaginatedGroupsResponse>(
    BASE_URL,
    { params }
  );
  return response.data;
};

/**
 * Search groups
 * GET /api/groups/search?q=term
 */
export const searchGroups = async (searchTerm: string): Promise<Group[]> => {
  const response = await axiosClient.get<Group[]>(`${BASE_URL}/search`, {
    params: { q: searchTerm },
  });
  return response.data;
};

/**
 * Get a single group by ID
 * GET /api/groups/:id
 */
export const getGroupById = async (id: string): Promise<Group> => {
  const response = await axiosClient.get<Group>(`${BASE_URL}/${id}`);
  return response.data;
};

/**
 * Create a new group
 * POST /api/groups
 */
export const createGroup = async (payload: CreateGroupPayload): Promise<Group> => {
  const response = await axiosClient.post<Group>(BASE_URL, payload);
  return response.data;
};

/**
 * Update an existing group
 * PATCH /api/groups/:id
 */
export const updateGroup = async (
  id: string,
  payload: UpdateGroupPayload
): Promise<Group> => {
  const response = await axiosClient.patch<Group>(`${BASE_URL}/${id}`, payload);
  return response.data;
};

/**
 * Delete a group
 * DELETE /api/groups/:id
 */
export const deleteGroup = async (id: string): Promise<void> => {
  await axiosClient.delete(`${BASE_URL}/${id}`);
};
