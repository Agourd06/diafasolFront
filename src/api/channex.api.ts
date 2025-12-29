import axios from 'axios';

const CHANNEX_API_URL = 'https://staging.channex.io/api/v1';
const CHANNEX_API_KEY = 'u0RQnHb0UAVpY7wV4HPVhBi9y+dwhpX+1BtBtor7+JMVirhrh8oC33JQ1WbUpPAF';

// Create a separate axios instance for Channex API
const channexClient = axios.create({
  baseURL: CHANNEX_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'user-api-key': CHANNEX_API_KEY,
  },
});

export interface ChannexGroup {
  id: string;
  type: string;
  attributes: {
    id: string;
    title: string;
  };
  relationships?: {
    users?: {
      data: Array<{
        id: string;
        type: string;
        attributes: {
          id: string;
          name: string;
          email: string;
        };
      }>;
    };
    properties?: {
      data: Array<unknown>;
    };
  };
}

export interface ChannexGroupsResponse {
  data: ChannexGroup[];
  meta: {
    order_by: string | null;
    order_direction: string | null;
  };
}

/**
 * Get all groups from Channex
 */
export const getChannexGroups = async (): Promise<ChannexGroupsResponse> => {
  const { data } = await channexClient.get<ChannexGroupsResponse>('/groups');
  return data;
};

/**
 * Check if a group exists in Channex by title
 */
export const checkGroupExistsInChannex = async (groupTitle: string): Promise<ChannexGroup | null> => {
  const response = await getChannexGroups();
  const found = response.data.find(
    (g) => g.attributes.title.toLowerCase() === groupTitle.toLowerCase()
  );
  return found || null;
};

/**
 * Create a group in Channex
 */
export const createChannexGroup = async (title: string): Promise<ChannexGroup> => {
  const { data } = await channexClient.post<{ data: ChannexGroup }>('/groups', {
    group: {
      title,
    },
  });
  return data.data;
};

/**
 * Update a group in Channex (PUT)
 */
export const updateChannexGroup = async (id: string, title: string): Promise<ChannexGroup> => {
  const { data } = await channexClient.put<{ data: ChannexGroup }>(`/groups/${id}`, {
    group: {
      title,
    },
  });
  return data.data;
};

/**
 * Get a specific group from Channex by ID
 */
export const getChannexGroupById = async (channexGroupId: string): Promise<ChannexGroup | null> => {
  try {
    const { data } = await channexClient.get<{ data: ChannexGroup }>(`/groups/${channexGroupId}`);
    return data.data;
  } catch (error) {
    // Group not found or error
    return null;
  }
};

// ============================================
// PROPERTY API
// ============================================

export interface ChannexPropertySettings {
  allow_availability_autoupdate_on_confirmation?: boolean;
  allow_availability_autoupdate_on_modification?: boolean;
  allow_availability_autoupdate_on_cancellation?: boolean;
  min_stay_type?: string;
  min_price?: number | null;
  max_price?: number | null;
  state_length?: number;
  cut_off_time?: string;
  cut_off_days?: number;
  max_day_advance?: number | null;
}

export interface ChannexPropertyContent {
  description?: string;
  photos?: Array<{
    url: string;
    position: number;
    author?: string;
    kind?: string;
    description?: string;
  }>;
  important_information?: string;
}

export interface ChannexPropertyAttributes {
  id: string;
  title: string;
  currency: string;
  email?: string;
  phone?: string;
  zip_code?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  longitude?: string;
  latitude?: string;
  timezone?: string;
  facilities?: string[];
  property_type?: string;
  group_id?: string;
  settings?: ChannexPropertySettings;
  content?: ChannexPropertyContent;
  logo_url?: string;
  website?: string;
}

export interface ChannexProperty {
  id: string;
  type: string;
  attributes: ChannexPropertyAttributes;
  relationships?: {
    group?: {
      data: {
        id: string;
        type: string;
      } | null;
    };
  };
}

export interface ChannexPropertiesResponse {
  data: ChannexProperty[];
  meta: {
    order_by: string | null;
    order_direction: string | null;
    total?: number;
    limit?: number;
    page?: number;
  };
}

export interface CreateChannexPropertyPayload {
  title: string;
  currency: string;
  email?: string;
  phone?: string;
  zip_code?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  longitude?: string;
  latitude?: string;
  timezone?: string;
  facilities?: string[];
  property_type?: string;
  group_id?: string;
  settings?: ChannexPropertySettings;
  content?: ChannexPropertyContent;
  logo_url?: string;
  website?: string;
}

/**
 * Get all properties from Channex
 */
export const getChannexProperties = async (): Promise<ChannexPropertiesResponse> => {
  const { data } = await channexClient.get<ChannexPropertiesResponse>('/properties');
  return data;
};

/**
 * Check if a property exists in Channex by title
 */
export const checkPropertyExistsInChannex = async (propertyTitle: string): Promise<ChannexProperty | null> => {
  const response = await getChannexProperties();
  const found = response.data.find(
    (p) => p.attributes.title.toLowerCase() === propertyTitle.toLowerCase()
  );
  return found || null;
};

/**
 * Get a specific property from Channex by ID
 */
export const getChannexPropertyById = async (channexPropertyId: string): Promise<ChannexProperty | null> => {
  try {
    const { data } = await channexClient.get<{ data: ChannexProperty }>(`/properties/${channexPropertyId}`);
    return data.data;
  } catch (error) {
    // Property not found or error
    return null;
  }
};

/**
 * Create a property in Channex
 */
export const createChannexProperty = async (payload: CreateChannexPropertyPayload): Promise<ChannexProperty> => {
  try {
    const { data } = await channexClient.post<{ data: ChannexProperty }>('/properties', {
      property: payload,
    });
    return data.data;
  } catch (error: any) {
    // Log detailed error for debugging
    if (error.response) {
      console.error('❌ Channex Property Create Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: JSON.stringify(error.response.data, null, 2),
        payload: JSON.stringify(payload, null, 2),
      });
      // Also log the error details separately for easier reading
      if (error.response.data) {
        console.error('❌ Channex Error Details:', error.response.data);
        if (error.response.data.errors) {
          console.error('❌ Validation Errors:', error.response.data.errors);
          // Log specific field errors
          if (error.response.data.errors.details) {
            console.error('❌ Field Validation Errors:', error.response.data.errors.details);
            Object.keys(error.response.data.errors.details).forEach(field => {
              console.error(`  - ${field}:`, error.response.data.errors.details[field]);
            });
          }
        }
        if (error.response.data.details) {
          console.error('❌ Error Details:', error.response.data.details);
        }
      }
    }
    throw error;
  }
};

/**
 * Update a property in Channex (PUT)
 */
export const updateChannexProperty = async (
  id: string,
  payload: Partial<CreateChannexPropertyPayload>
): Promise<ChannexProperty> => {
  try {
    const { data } = await channexClient.put<{ data: ChannexProperty }>(`/properties/${id}`, {
      property: payload,
    });
    return data.data;
  } catch (error: any) {
    // Log detailed error for debugging
    if (error.response) {
      console.error('❌ Channex Property Update Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        propertyId: id,
        payload: payload,
      });
    }
    throw error;
  }
};

// ============================================
// TAX SET API
// ============================================

export interface ChannexTaxReference {
  id: string;
  level: number;
}

export interface ChannexTaxSetAttributes {
  id: string;
  title: string;
  property_id: string;
  currency: string;
  taxes: ChannexTaxReference[];
  associated_rate_plan_ids?: string[];
}

export interface ChannexTaxSet {
  id: string;
  type: string;
  attributes: ChannexTaxSetAttributes;
}

export interface ChannexTaxSetsResponse {
  data: ChannexTaxSet[];
  meta?: {
    total?: number;
    limit?: number;
    page?: number;
  };
}

export interface CreateChannexTaxSetPayload {
  title: string;
  property_id: string;
  currency: string;
  taxes?: ChannexTaxReference[];
  associated_rate_plan_ids?: string[];
}

/**
 * Get all tax sets from Channex
 */
export const getChannexTaxSets = async (): Promise<ChannexTaxSetsResponse> => {
  const { data } = await channexClient.get<ChannexTaxSetsResponse>('/tax_sets');
  return data;
};

/**
 * Get tax sets by property ID from Channex
 */
export const getChannexTaxSetsByProperty = async (propertyId: string): Promise<ChannexTaxSetsResponse> => {
  const { data } = await channexClient.get<ChannexTaxSetsResponse>('/tax_sets', {
    params: { filter: { property_id: propertyId } },
  });
  return data;
};

/**
 * Check if a tax set exists in Channex by title and property
 */
export const checkTaxSetExistsInChannex = async (
  title: string,
  propertyId: string
): Promise<ChannexTaxSet | null> => {
  try {
    const response = await getChannexTaxSetsByProperty(propertyId);
    const found = response.data.find(
      (ts) => ts.attributes.title.toLowerCase() === title.toLowerCase()
    );
    return found || null;
  } catch {
    return null;
  }
};

/**
 * Create a tax set in Channex
 */
export const createChannexTaxSet = async (payload: CreateChannexTaxSetPayload): Promise<ChannexTaxSet> => {
  const { data } = await channexClient.post<{ data: ChannexTaxSet }>('/tax_sets', {
    tax_set: payload,
  });
  return data.data;
};

/**
 * Update a tax set in Channex (PUT)
 * Note: API uses plural "tax_sets" endpoint and "tax_set" key in payload
 */
export const updateChannexTaxSet = async (
  id: string,
  payload: Partial<CreateChannexTaxSetPayload>
): Promise<ChannexTaxSet> => {
  try {
    const { data } = await channexClient.put<{ data: ChannexTaxSet }>(`/tax_sets/${id}`, {
      tax_set: payload,
    });
    return data.data;
  } catch (error: any) {
    // Log detailed error for debugging
    if (error.response) {
      console.error('❌ Channex Tax Set Update Error:', {
        status: error.response.status,
        data: error.response.data,
        taxSetId: id,
        payload: payload,
      });
    }
    throw error;
  }
};

/**
 * Get a specific tax set from Channex by ID
 */
export const getChannexTaxSetById = async (channexTaxSetId: string): Promise<ChannexTaxSet | null> => {
  try {
    const { data } = await channexClient.get<{ data: ChannexTaxSet }>(`/tax_sets/${channexTaxSetId}`);
    return data.data;
  } catch (error) {
    // Tax set not found or error
    return null;
  }
};

// ============================================
// TAXES API (Individual taxes for Channex)
// ============================================

export interface ChannexTaxAttributes {
  id: string;
  title: string;
  property_id: string;
  type: string; // 'tax', 'fee', 'city_tax'
  logic: string; // 'percent', 'per_room', 'per_room_per_night', 'per_person', 'per_person_per_night', 'per_night', 'per_booking'
  rate: string; // Decimal as string
  is_inclusive: boolean;
  skip_nights?: number | null;
  max_nights?: number | null;
}

export interface ChannexTax {
  id: string;
  type: string;
  attributes: ChannexTaxAttributes;
}

export interface ChannexTaxesResponse {
  data: ChannexTax[];
  meta?: {
    total?: number;
    limit?: number;
    page?: number;
  };
}

export interface CreateChannexTaxPayload {
  title: string;
  property_id: string;
  type: string;
  logic: string;
  rate: string;
  is_inclusive: boolean;
  currency?: string; // Required when logic is not 'percent'
  skip_nights?: number;
  max_nights?: number;
  applicable_date_ranges?: Array<{
    after: string;
    before: string;
  }>;
}

/**
 * Get all taxes from Channex
 */
export const getChannexTaxes = async (): Promise<ChannexTaxesResponse> => {
  const { data } = await channexClient.get<ChannexTaxesResponse>('/taxes');
  return data;
};

/**
 * Get taxes by property ID from Channex
 */
export const getChannexTaxesByProperty = async (propertyId: string): Promise<ChannexTaxesResponse> => {
  const { data } = await channexClient.get<ChannexTaxesResponse>('/taxes', {
    params: { filter: { property_id: propertyId } },
  });
  return data;
};

/**
 * Check if a tax exists in Channex by title and property
 */
export const checkTaxExistsInChannex = async (
  title: string,
  propertyId: string
): Promise<ChannexTax | null> => {
  try {
    const response = await getChannexTaxesByProperty(propertyId);
    const found = response.data.find(
      (t) => t.attributes.title.toLowerCase() === title.toLowerCase()
    );
    return found || null;
  } catch {
    return null;
  }
};

/**
 * Create a tax in Channex
 */
export const createChannexTax = async (payload: CreateChannexTaxPayload): Promise<ChannexTax> => {
  try {
    const { data } = await channexClient.post<{ data: ChannexTax }>('/taxes', {
      tax: payload,
    });
    return data.data;
  } catch (error: any) {
    // Log detailed error for debugging
    if (error.response) {
      console.error('❌ Channex API Error (422):', {
        status: error.response.status,
        data: error.response.data,
        payload: payload,
      });
    }
    throw error;
  }
};

// ============================================
// ROOM TYPES API
// ============================================

export interface ChannexRoomTypeContent {
  description?: string;
  photos?: Array<{
    url: string;
    position: number;
    author?: string;
    kind?: string;
    description?: string;
  }>;
}

export interface ChannexRoomTypeAttributes {
  id: string;
  property_id: string;
  title: string;
  count_of_rooms: number;
  occ_adults: number;
  occ_children: number;
  occ_infants: number;
  default_occupancy: number;
  facilities?: string[];
  room_kind?: string;
  capacity?: number | null;
  content?: ChannexRoomTypeContent;
}

export interface ChannexRoomType {
  id: string;
  type: string;
  attributes: ChannexRoomTypeAttributes;
}

export interface ChannexRoomTypesResponse {
  data: ChannexRoomType[];
  meta?: {
    total?: number;
    limit?: number;
    page?: number;
  };
}

export interface CreateChannexRoomTypePayload {
  property_id: string;
  title: string;
  count_of_rooms: number;
  occ_adults: number;
  occ_children: number;
  occ_infants: number;
  default_occupancy: number;
  facilities?: string[];
  room_kind?: string;
  capacity?: number | null;
  content?: ChannexRoomTypeContent;
}

/**
 * Get all room types from Channex
 */
export const getChannexRoomTypes = async (): Promise<ChannexRoomTypesResponse> => {
  const { data } = await channexClient.get<ChannexRoomTypesResponse>('/room_types');
  return data;
};

/**
 * Get room types by property ID from Channex
 */
export const getChannexRoomTypesByProperty = async (propertyId: string): Promise<ChannexRoomTypesResponse> => {
  const { data } = await channexClient.get<ChannexRoomTypesResponse>('/room_types', {
    params: { filter: { property_id: propertyId } },
  });
  return data;
};

/**
 * Check if a room type exists in Channex by title and property
 */
export const checkRoomTypeExistsInChannex = async (
  title: string,
  propertyId: string
): Promise<ChannexRoomType | null> => {
  try {
    const response = await getChannexRoomTypesByProperty(propertyId);
    const found = response.data.find(
      (rt) => rt.attributes.title.toLowerCase() === title.toLowerCase()
    );
    return found || null;
  } catch {
    return null;
  }
};

/**
 * Get a specific room type from Channex by ID
 */
export const getChannexRoomTypeById = async (channexRoomTypeId: string): Promise<ChannexRoomType | null> => {
  try {
    const { data } = await channexClient.get<{ data: ChannexRoomType }>(`/room_types/${channexRoomTypeId}`);
    return data.data;
  } catch (error) {
    // Room type not found or error
    return null;
  }
};

/**
 * Create a room type in Channex
 */
export const createChannexRoomType = async (payload: CreateChannexRoomTypePayload): Promise<ChannexRoomType> => {
  const { data } = await channexClient.post<{ data: ChannexRoomType }>('/room_types', {
    room_type: payload,
  });
  return data.data;
};

/**
 * Update a room type in Channex (PUT)
 */
export const updateChannexRoomType = async (
  id: string,
  payload: Partial<CreateChannexRoomTypePayload>,
  force?: boolean
): Promise<ChannexRoomType> => {
  const url = force ? `/room_types/${id}?force=true` : `/room_types/${id}`;
  const { data } = await channexClient.put<{ data: ChannexRoomType }>(url, {
    room_type: payload,
  });
  return data.data;
};

// ============================================
// RATE PLANS API
// ============================================

export interface ChannexRatePlanOccupancyOption {
  occupancy: number;
  is_primary: boolean;
  rate?: number;
  derived_option?: {
    rate?: string[][];
  };
}

export interface ChannexRatePlanAttributes {
  id: string;
  title: string;
  property_id: string;
  room_type_id: string;
  tax_set_id?: string | null;
  parent_rate_plan_id?: string | null;
  children_fee: string;
  infant_fee: string;
  currency: string;
  sell_mode: string;
  rate_mode: string;
  meal_type?: string;
  inherit_rate: boolean;
  inherit_closed_to_arrival: boolean;
  inherit_closed_to_departure: boolean;
  inherit_stop_sell: boolean;
  inherit_min_stay_arrival: boolean;
  inherit_min_stay_through: boolean;
  inherit_max_stay: boolean;
  inherit_max_sell: boolean;
  inherit_max_availability: boolean;
  inherit_availability_offset: boolean;
  max_stay: number[] | number;
  min_stay_arrival: number[] | number;
  min_stay_through: number[] | number;
  closed_to_arrival: boolean[] | boolean;
  closed_to_departure: boolean[] | boolean;
  stop_sell: boolean[] | boolean;
  options: ChannexRatePlanOccupancyOption[];
  auto_rate_settings?: unknown | null;
}

export interface ChannexRatePlan {
  id: string;
  type: string;
  attributes: ChannexRatePlanAttributes;
}

export interface ChannexRatePlansResponse {
  data: ChannexRatePlan[];
  meta?: {
    total?: number;
    limit?: number;
    page?: number;
  };
}

export interface CreateChannexRatePlanPayload {
  title: string;
  property_id: string;
  room_type_id: string;
  tax_set_id?: string | null;
  parent_rate_plan_id?: string | null;
  children_fee: string;
  infant_fee: string;
  currency?: string;
  sell_mode?: string;
  rate_mode?: string;
  meal_type?: string;
  inherit_rate?: boolean;
  inherit_closed_to_arrival?: boolean;
  inherit_closed_to_departure?: boolean;
  inherit_stop_sell?: boolean;
  inherit_min_stay_arrival?: boolean;
  inherit_min_stay_through?: boolean;
  inherit_max_stay?: boolean;
  inherit_max_sell?: boolean;
  inherit_max_availability?: boolean;
  inherit_availability_offset?: boolean;
  max_stay?: number[] | number;
  min_stay_arrival?: number[] | number;
  min_stay_through?: number[] | number;
  closed_to_arrival?: boolean[] | boolean;
  closed_to_departure?: boolean[] | boolean;
  stop_sell?: boolean[] | boolean;
  options: ChannexRatePlanOccupancyOption[];
  auto_rate_settings?: unknown | null;
}

/**
 * Update payload for Channex rate plan
 * Excludes property_id, room_type_id, and tax_set_id as these cannot be changed
 */
export type UpdateChannexRatePlanPayload = Omit<CreateChannexRatePlanPayload, 'property_id' | 'room_type_id' | 'tax_set_id'>;

/**
 * Get all rate plans from Channex
 */
export const getChannexRatePlans = async (): Promise<ChannexRatePlansResponse> => {
  const { data } = await channexClient.get<ChannexRatePlansResponse>('/rate_plans');
  return data;
};

/**
 * Get rate plans by property ID from Channex
 */
export const getChannexRatePlansByProperty = async (propertyId: string): Promise<ChannexRatePlansResponse> => {
  const { data } = await channexClient.get<ChannexRatePlansResponse>('/rate_plans', {
    params: { filter: { property_id: propertyId } },
  });
  return data;
};

/**
 * Get rate plans by room type ID from Channex
 */
export const getChannexRatePlansByRoomType = async (roomTypeId: string): Promise<ChannexRatePlansResponse> => {
  const { data } = await channexClient.get<ChannexRatePlansResponse>('/rate_plans', {
    params: { filter: { room_type_id: roomTypeId } },
  });
  return data;
};

/**
 * Check if a rate plan exists in Channex by title and room type
 */
export const checkRatePlanExistsInChannex = async (
  title: string,
  roomTypeId: string
): Promise<ChannexRatePlan | null> => {
  try {
    const response = await getChannexRatePlansByRoomType(roomTypeId);
    const found = response.data.find(
      (rp) => rp.attributes.title.toLowerCase() === title.toLowerCase()
    );
    return found || null;
  } catch {
    return null;
  }
};

/**
 * Get a specific rate plan from Channex by ID
 */
export const getChannexRatePlanById = async (channexRatePlanId: string): Promise<ChannexRatePlan | null> => {
  try {
    const { data } = await channexClient.get<{ data: ChannexRatePlan }>(`/rate_plans/${channexRatePlanId}`);
    return data.data;
  } catch (error) {
    // Rate plan not found or error
    return null;
  }
};

/**
 * Create a rate plan in Channex
 */
export const createChannexRatePlan = async (payload: CreateChannexRatePlanPayload): Promise<ChannexRatePlan> => {
  console.log('🚀 Sending CREATE to Channex API:', {
    closed_to_arrival: payload.closed_to_arrival,
    closed_to_departure: payload.closed_to_departure,
    stop_sell: payload.stop_sell,
    inherit_closed_to_arrival: payload.inherit_closed_to_arrival,
    inherit_closed_to_departure: payload.inherit_closed_to_departure,
    inherit_stop_sell: payload.inherit_stop_sell,
    parent_rate_plan_id: payload.parent_rate_plan_id,
  });
  const { data } = await channexClient.post<{ data: ChannexRatePlan }>('/rate_plans', {
    rate_plan: payload,
  });
  console.log('✅ Channex CREATE response:', {
    closed_to_arrival: data.data.attributes.closed_to_arrival,
    closed_to_departure: data.data.attributes.closed_to_departure,
    stop_sell: data.data.attributes.stop_sell,
  });
  return data.data;
};

/**
 * Update a rate plan in Channex (PUT)
 * Note: property_id, room_type_id, and tax_set_id cannot be changed and are excluded from update payload
 */
export const updateChannexRatePlan = async (
  id: string,
  payload: UpdateChannexRatePlanPayload
): Promise<ChannexRatePlan> => {
  try {
    console.log('🚀 Sending UPDATE to Channex API:', {
      id,
      closed_to_arrival: payload.closed_to_arrival,
      closed_to_departure: payload.closed_to_departure,
      stop_sell: payload.stop_sell,
      inherit_closed_to_arrival: payload.inherit_closed_to_arrival,
      inherit_closed_to_departure: payload.inherit_closed_to_departure,
      inherit_stop_sell: payload.inherit_stop_sell,
      parent_rate_plan_id: payload.parent_rate_plan_id,
    });
    const { data } = await channexClient.put<{ data: ChannexRatePlan }>(`/rate_plans/${id}`, {
      rate_plan: payload,
    });
    console.log('✅ Channex UPDATE response:', {
      closed_to_arrival: data.data.attributes.closed_to_arrival,
      closed_to_departure: data.data.attributes.closed_to_departure,
      stop_sell: data.data.attributes.stop_sell,
    });
    return data.data;
  } catch (error: any) {
    // Temporary logging to debug 422 errors
    const requestBody = { rate_plan: payload };
    console.error('❌ Error updating Channex rate plan');
    console.error('Request URL:', `PUT https://staging.channex.io/api/v1/rate_plans/${id}`);
    console.error('Request Body:', JSON.stringify(requestBody, null, 2));
    if (error.response?.data) {
      console.error('Channex Error Response:', JSON.stringify(error.response.data, null, 2));
    }
    if (error.response?.status) {
      console.error(`HTTP Status: ${error.response.status}`);
    }
    throw error;
  }
};

/**
 * Sync rates to Channex restrictions endpoint
 * POST /restrictions
 * 
 * Sends grouped rate ranges to Channex to update rates for a rate plan.
 */
export interface ChannexRateRange {
  property_id: string;
  rate_plan_id: string;
  date_from: string;
  date_to: string;
  rate: number;
  // Optional restriction fields
  closed_to_arrival?: boolean;
  closed_to_departure?: boolean;
  min_stay_arrival?: number;
  min_stay_through?: number;
  max_stay?: number;
  stop_sell?: boolean;
}

export interface ChannexRestrictionsPayload {
  values: ChannexRateRange[];
}

export interface ChannexRestrictionsResponse {
  data?: any;
  message?: string;
}

export const syncRatesToChannex = async (
  payload: ChannexRestrictionsPayload
): Promise<ChannexRestrictionsResponse> => {
  try {
    console.log('📤 Sending rates to Channex:', {
      rangesCount: payload.values?.length || 0,
      sampleRange: payload.values?.[0],
      fullPayload: JSON.stringify(payload, null, 2),
    });

    const { data } = await channexClient.post<ChannexRestrictionsResponse>('/restrictions', payload);
    
    console.log('✅ Channex Rates Sync Response:', {
      response: JSON.stringify(data, null, 2),
    });

    return data;
  } catch (error: any) {
    if (error.response) {
      console.error('❌ Channex Rates Sync Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: JSON.stringify(error.response.data, null, 2),
        payload: JSON.stringify(payload, null, 2),
      });
      if (error.response.data) {
        console.error('❌ Channex Error Details:', error.response.data);
        if (error.response.data.errors) {
          console.error('❌ Validation Errors:', error.response.data.errors);
        }
      }
    }
    throw error;
  }
};

/**
 * Get restrictions from Channex
 * GET /restrictions
 * 
 * Retrieves existing restrictions from Channex to verify sync status.
 */
export interface GetChannexRestrictionsParams {
  'filter[property_id]'?: string;
  'filter[rate_plan_id]'?: string;
  'filter[restrictions]'?: string;
  'filter[rate]'?: string | number;
  'filter[date][gte]'?: string;
  'filter[date][lte]'?: string;
}

export interface ChannexRestrictionsData {
  data: any;
  meta?: any;
}

export const getChannexRestrictions = async (
  params?: GetChannexRestrictionsParams
): Promise<ChannexRestrictionsData> => {
  try {
    const { data } = await channexClient.get<ChannexRestrictionsData>('/restrictions', { params });
    return data;
  } catch (error: any) {
    if (error.response) {
      console.error('❌ Channex Get Restrictions Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: JSON.stringify(error.response.data, null, 2),
        params: JSON.stringify(params, null, 2),
      });
    }
    throw error;
  }
};

/**
 * Sync availability to Channex availability endpoint
 * POST /availability
 * 
 * Sends grouped availability ranges to Channex to update availability for a room type.
 */
export interface ChannexAvailabilityRange {
  property_id: string;
  room_type_id: string;
  date_from: string;
  date_to: string;
  availability: number;
}

export interface ChannexAvailabilityPayload {
  values: ChannexAvailabilityRange[];
}

export interface ChannexAvailabilityResponse {
  data?: any;
  message?: string;
}

export const syncAvailabilityToChannex = async (
  payload: ChannexAvailabilityPayload
): Promise<ChannexAvailabilityResponse> => {
  try {
    console.log('📤 Sending availability to Channex:', {
      rangesCount: payload.values?.length || 0,
      sampleRange: payload.values?.[0],
      fullPayload: JSON.stringify(payload, null, 2),
    });

    const { data } = await channexClient.post<ChannexAvailabilityResponse>('/availability', payload);
    
    console.log('✅ Channex Availability Sync Response:', {
      response: JSON.stringify(data, null, 2),
    });

    return data;
  } catch (error: any) {
    if (error.response) {
      console.error('❌ Channex Availability Sync Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: JSON.stringify(error.response.data, null, 2),
        payload: JSON.stringify(payload, null, 2),
      });
      if (error.response.data) {
        console.error('❌ Channex Error Details:', error.response.data);
        if (error.response.data.errors) {
          console.error('❌ Validation Errors:', error.response.data.errors);
        }
      }
    }
    throw error;
  }
};

// ============================================
// WEBHOOKS API
// ============================================

export interface ChannexWebhookAttributes {
  id: string;
  property_id: string;
  callback_url: string;
  event_mask: string;
  request_params: Record<string, any>;
  headers: Record<string, any>;
  is_active: boolean;
  send_data: boolean;
}

export interface ChannexWebhook {
  id: string;
  type: string;
  attributes: ChannexWebhookAttributes;
}

export interface ChannexWebhooksResponse {
  data: ChannexWebhook[];
  meta?: {
    total?: number;
    limit?: number;
    page?: number;
  };
}

export interface CreateChannexWebhookPayload {
  property_id: string;
  callback_url: string;
  event_mask: string;
  request_params?: Record<string, any>;
  headers?: Record<string, any>;
  is_active: boolean;
  send_data: boolean;
}

export interface UpdateChannexWebhookPayload {
  property_id?: string;
  callback_url?: string;
  event_mask?: string;
  request_params?: Record<string, any>;
  headers?: Record<string, any>;
  is_active?: boolean;
  send_data?: boolean;
}

/**
 * Get all webhooks from Channex
 */
export const getChannexWebhooks = async (): Promise<ChannexWebhooksResponse> => {
  const { data } = await channexClient.get<ChannexWebhooksResponse>('/webhooks');
  return data;
};

/**
 * Get webhooks by property ID from Channex
 */
export const getChannexWebhooksByProperty = async (propertyId: string): Promise<ChannexWebhooksResponse> => {
  const { data } = await channexClient.get<ChannexWebhooksResponse>('/webhooks', {
    params: { filter: { property_id: propertyId } },
  });
  return data;
};

/**
 * Get a specific webhook from Channex by ID
 */
export const getChannexWebhookById = async (webhookId: string): Promise<ChannexWebhook | null> => {
  try {
    const { data } = await channexClient.get<{ data: ChannexWebhook }>(`/webhooks/${webhookId}`);
    return data.data;
  } catch (error) {
    // Webhook not found or error
    return null;
  }
};

/**
 * Create a webhook in Channex
 */
export const createChannexWebhook = async (payload: CreateChannexWebhookPayload): Promise<ChannexWebhook> => {
  try {
    const { data } = await channexClient.post<{ data: ChannexWebhook }>('/webhooks', {
      webhook: payload,
    });
    return data.data;
  } catch (error: any) {
    // Log detailed error for debugging
    if (error.response) {
      console.error('❌ Channex Webhook Create Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: JSON.stringify(error.response.data, null, 2),
        payload: JSON.stringify(payload, null, 2),
      });
    }
    throw error;
  }
};

/**
 * Update a webhook in Channex (PUT)
 */
export const updateChannexWebhook = async (
  id: string,
  payload: UpdateChannexWebhookPayload
): Promise<ChannexWebhook> => {
  try {
    // Log the request being sent
    console.log('📤 Sending PUT request to Channex:', {
      url: `PUT /webhooks/${id}`,
      payload: JSON.stringify({ webhook: payload }, null, 2),
      is_active_type: typeof payload.is_active,
      send_data_type: typeof payload.send_data,
      is_active_value: payload.is_active,
      send_data_value: payload.send_data,
    });

    const { data } = await channexClient.put<{ data: ChannexWebhook }>(`/webhooks/${id}`, {
      webhook: payload,
    });

    // Log the response
    console.log('✅ Channex Webhook Update Response:', {
      webhookId: data.data.id,
      is_active: data.data.attributes.is_active,
      send_data: data.data.attributes.send_data,
      fullResponse: JSON.stringify(data, null, 2),
    });

    return data.data;
  } catch (error: any) {
    // Log detailed error for debugging
    console.error('❌ Channex Webhook Update Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      requestData: error.config?.data ? JSON.parse(error.config.data) : null,
      responseData: error.response?.data ? JSON.stringify(error.response.data, null, 2) : null,
      webhookId: id,
      payload: JSON.stringify(payload, null, 2),
    });
    throw error;
  }
};
