/**
 * Groups Type Definitions
 * 
 * Groups are used to organize and categorize properties.
 * Each group belongs to a company and uses UUID as primary key.
 */

export interface Group {
  id: string; // UUID (36 characters)
  companyId: number; // Automatically set from token
  title: string; // Required
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
}

/**
 * ⚠️ CRITICAL: When creating a group, DO NOT include:
 * - companyId (automatically set from JWT token)
 * - id (auto-generated UUID)
 * - createdAt (auto-generated)
 * - updatedAt (auto-generated)
 * 
 * If you send companyId, you'll get: "group companyId should not exist"
 */
export interface CreateGroupPayload {
  title: string; // Required
}

/**
 * ⚠️ CRITICAL: When updating a group, DO NOT include:
 * - companyId (cannot be changed)
 * - id (cannot be changed)
 * - createdAt (cannot be changed)
 * - updatedAt (auto-updated)
 */
export interface UpdateGroupPayload {
  title?: string;
}

export interface PaginatedGroupsResponse {
  data: Group[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GroupQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
