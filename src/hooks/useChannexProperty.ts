import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { 
  checkPropertyExistsInChannex, 
  createChannexProperty as createChannexPropertyApi,
  updateChannexProperty as updateChannexPropertyApi,
  getChannexPropertyById,
  CreateChannexPropertyPayload,
  ChannexProperty,
  createChannexWebhook,
  updateChannexWebhook,
  getChannexWebhooksByProperty,
  CreateChannexWebhookPayload,
  UpdateChannexWebhookPayload,
} from '@/api/channex.api';
import { Property } from '@/features/properties/types';
import { getPropertyForChannexSync, getPropertyForChannexUpdateSync, updateProperty, getPropertyById } from '@/api/properties.api';
import { getPropertySettingsByPropertyId } from '@/api/property-settings.api';

// Webhook callback URL - should be configured via environment variable
// Default to a placeholder that should be replaced with actual URL
const WEBHOOK_CALLBACK_URL = import.meta.env.VITE_WEBHOOK_CALLBACK_URL || 'https://YOUR-WEBSITE.COM/api/push_message';

interface UseChannexPropertyOptions {
  property: Property | null | undefined;
  channexGroupId?: string | null;
  enabled?: boolean;
}

// Storage keys for Channex ID mapping
export const CHANNEX_PROPERTY_MAP_KEY = 'channex_property_map';
export const CHANNEX_WEBHOOK_MAP_KEY = 'channex_webhook_map';

// Get stored Channex property ID for a local property
export const getStoredChannexPropertyId = (localPropertyId: string): string | null => {
  try {
    const map = JSON.parse(localStorage.getItem(CHANNEX_PROPERTY_MAP_KEY) || '{}');
    return map[localPropertyId] || null;
  } catch {
    return null;
  }
};

// Store Channex property ID mapping
export const storeChannexPropertyId = (localPropertyId: string, channexPropertyId: string) => {
  try {
    const map = JSON.parse(localStorage.getItem(CHANNEX_PROPERTY_MAP_KEY) || '{}');
    map[localPropertyId] = channexPropertyId;
    localStorage.setItem(CHANNEX_PROPERTY_MAP_KEY, JSON.stringify(map));
  } catch {
    // Silent fail - localStorage might not be available
  }
};

// Clear stored Channex property ID for a local property
export const clearStoredChannexPropertyId = (localPropertyId: string) => {
  try {
    const map = JSON.parse(localStorage.getItem(CHANNEX_PROPERTY_MAP_KEY) || '{}');
    delete map[localPropertyId];
    localStorage.setItem(CHANNEX_PROPERTY_MAP_KEY, JSON.stringify(map));
  } catch {
    // Silent fail
  }
};

// Clear ALL Channex property mappings (useful for debugging)
export const clearAllChannexPropertyMappings = () => {
  localStorage.removeItem(CHANNEX_PROPERTY_MAP_KEY);
};

// Get stored Channex webhook ID for a Channex property ID
export const getStoredChannexWebhookId = (channexPropertyId: string): string | null => {
  try {
    const map = JSON.parse(localStorage.getItem(CHANNEX_WEBHOOK_MAP_KEY) || '{}');
    return map[channexPropertyId] || null;
  } catch {
    return null;
  }
};

// Store Channex webhook ID mapping
export const storeChannexWebhookId = (channexPropertyId: string, webhookId: string) => {
  try {
    const map = JSON.parse(localStorage.getItem(CHANNEX_WEBHOOK_MAP_KEY) || '{}');
    map[channexPropertyId] = webhookId;
    localStorage.setItem(CHANNEX_WEBHOOK_MAP_KEY, JSON.stringify(map));
  } catch {
    // Silent fail - localStorage might not be available
  }
};

// Clear stored Channex webhook ID for a Channex property
export const clearStoredChannexWebhookId = (channexPropertyId: string) => {
  try {
    const map = JSON.parse(localStorage.getItem(CHANNEX_WEBHOOK_MAP_KEY) || '{}');
    delete map[channexPropertyId];
    localStorage.setItem(CHANNEX_WEBHOOK_MAP_KEY, JSON.stringify(map));
  } catch {
    // Silent fail
  }
};


/**
 * Map our property to Channex property payload for CREATE
 * Uses backend endpoint: GET /api/properties/:id/channex-sync
 * This endpoint includes settings, group_id, logo_url, website, important_information
 */
export const mapPropertyToChannexCreatePayload = async (
  property: Property, 
  channexGroupId?: string | null
): Promise<CreateChannexPropertyPayload> => {
  // Use CREATE endpoint - GET /api/properties/:id/channex-sync
  console.log('📡 Calling backend endpoint: GET /api/properties/:id/channex-sync (CREATE)', { propertyId: property.id });
  const response = await getPropertyForChannexSync(property.id);
  console.log('📦 Full endpoint response:', JSON.stringify(response, null, 2));
  const { property: channexPayload } = response;
  
  // Transform settings boolean values from 1/0 to true/false and convert prices to strings
  // Settings are REQUIRED for CREATE operations and are included in this endpoint
  if (channexPayload.settings) {
    channexPayload.settings = transformSettingsForCreate(channexPayload.settings);
  } else {
    throw new Error('Property settings are required for Channex sync. Please create settings first.');
  }
  
  // Transform content for CREATE (omit empty description and empty photos array)
  const transformedContent = transformContentForCreate(channexPayload.content);
  
  // Only include content if it has at least one field (Channex may reject empty content object)
  if (Object.keys(transformedContent).length > 0) {
    channexPayload.content = transformedContent;
  } else {
    // Omit content entirely if it's empty
    delete channexPayload.content;
  }
  
  // Validate and remove invalid logo_url and website
  // Channex has strict URL validation, so we remove them if they don't pass our validation
  // or if they look suspicious (to avoid Channex rejection)
  if (channexPayload.logo_url) {
    if (!isValidUrl(channexPayload.logo_url)) {
      console.warn('⚠️ Invalid logo_url detected, removing from payload:', channexPayload.logo_url);
      delete channexPayload.logo_url;
    } else {
      // Even if URL passes basic validation, Channex might reject it
      // Log it so we can see if Channex rejects it later
      console.log('📝 logo_url included in payload:', channexPayload.logo_url);
    }
  }
  
  if (channexPayload.website) {
    if (!isValidUrl(channexPayload.website)) {
      console.warn('⚠️ Invalid website detected, removing from payload:', channexPayload.website);
      delete channexPayload.website;
    } else {
      // Even if URL passes basic validation, Channex might reject it
      // Log it so we can see if Channex rejects it later
      console.log('📝 website included in payload:', channexPayload.website);
    }
  }
  
  console.log('📦 Property payload after transformation (CREATE):', JSON.stringify(channexPayload, null, 2));
  console.log('📦 Property payload summary:', {
    title: channexPayload.title,
    currency: channexPayload.currency,
    hasSettings: !!channexPayload.settings,
    settings: channexPayload.settings,
    hasContent: !!channexPayload.content,
    content: channexPayload.content,
    photosCount: channexPayload.content?.photos?.length || 0,
    hasGroupId: !!channexPayload.group_id,
    hasLogoUrl: !!channexPayload.logo_url,
    hasWebsite: !!channexPayload.website,
  });
  
  // Override group_id if provided (takes precedence over backend value)
  if (channexGroupId) {
    channexPayload.group_id = channexGroupId;
    console.log('📦 Override group_id in payload:', channexGroupId);
  }

  return channexPayload;
};

/**
 * Transform settings for Channex CREATE payload
 * - Booleans: 1/0 -> true/false
 * - Prices: Must be strings with 2 decimal places (e.g., "10.00")
 * - Integers: Ensure they're numbers
 */
const transformSettingsForCreate = (settings: any): any => {
  if (!settings) return settings;
  
  const transformed = {
    ...settings,
    // Convert booleans
    allow_availability_autoupdate_on_confirmation: settings.allow_availability_autoupdate_on_confirmation === 1 || settings.allow_availability_autoupdate_on_confirmation === true,
    allow_availability_autoupdate_on_modification: settings.allow_availability_autoupdate_on_modification === 1 || settings.allow_availability_autoupdate_on_modification === true,
    allow_availability_autoupdate_on_cancellation: settings.allow_availability_autoupdate_on_cancellation === 1 || settings.allow_availability_autoupdate_on_cancellation === true,
  };
  
  // Convert prices to strings with 2 decimal places (required for CREATE)
  if (settings.min_price !== null && settings.min_price !== undefined) {
    const price = typeof settings.min_price === 'string' ? parseFloat(settings.min_price) : settings.min_price;
    transformed.min_price = price.toFixed(2);
  }
  if (settings.max_price !== null && settings.max_price !== undefined) {
    const price = typeof settings.max_price === 'string' ? parseFloat(settings.max_price) : settings.max_price;
    transformed.max_price = price.toFixed(2);
  }
  
  return transformed;
};

/**
 * Transform content for Channex CREATE payload
 * - description: Preserve HTML format (Channex stores HTML like "<p>HELLOO&nbsp;&nbsp;&nbsp;&nbsp;</p>")
 * - photos: Omit if empty array (Channex may reject empty arrays on CREATE)
 */
const transformContentForCreate = (content: any): any => {
  if (!content) return {};
  
  const transformed: any = {};
  
  // Only include description if it has a value (preserve HTML format for Channex)
  // Channex expects and stores HTML, so we keep it as-is
  if (content.description && content.description.trim()) {
    // Preserve the HTML format - Channex stores it as HTML
    transformed.description = content.description.trim();
  }
  
  // Only include important_information if it has a value (preserve HTML format)
  if (content.important_information && content.important_information.trim()) {
    // Preserve the HTML format - Channex stores it as HTML
    transformed.important_information = content.important_information.trim();
  }
  
  // Only include photos if there are actual photos (omit empty array)
  if (content.photos && Array.isArray(content.photos) && content.photos.length > 0) {
    transformed.photos = content.photos;
  }
  
  return transformed;
};

/**
 * Transform content for Channex UPDATE payload
 * - description: empty string if null (UPDATE accepts empty strings)
 */
const transformContentForUpdate = (content: any): any => {
  if (!content) return { description: '' };
  
  return {
    description: content.description || '',
    important_information: content.important_information || undefined,
    photos: content.photos || [],
  };
};

/**
 * Validate URL - returns true if valid, false otherwise
 * More strict validation to match Channex requirements
 */
const isValidUrl = (urlString: string): boolean => {
  if (!urlString || typeof urlString !== 'string') return false;
  
  try {
    const url = new URL(urlString);
    
    // Must be http or https
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false;
    }
    
    // Hostname must have at least one dot and valid TLD (at least 2 chars)
    const hostname = url.hostname;
    if (!hostname.includes('.')) {
      return false;
    }
    
    const parts = hostname.split('.');
    const tld = parts[parts.length - 1];
    if (!tld || tld.length < 2) {
      return false;
    }
    
    // Reject common invalid patterns
    // Reject if hostname contains spaces or special invalid chars
    if (/[\s<>{}|\\^`]/.test(hostname)) {
      return false;
    }
    
    // Reject if it looks like a test/invalid domain
    const invalidPatterns = [
      /^test/i,
      /^example/i,
      /^invalid/i,
      /^localhost/i,
      /^127\.0\.0\.1/i,
    ];
    
    if (invalidPatterns.some(pattern => pattern.test(hostname))) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
};

/**
 * Map our property to Channex property payload for UPDATE (PUT)
 * Uses backend endpoint: GET /api/properties/:id/channex-sync-update
 * This endpoint excludes settings, group_id, logo_url, website, important_information
 */
export const mapPropertyToChannexUpdatePayload = async (
  property: Property
): Promise<Partial<CreateChannexPropertyPayload>> => {
  // Use UPDATE endpoint - GET /api/properties/:id/channex-sync-update
  console.log('📡 Calling backend endpoint: GET /api/properties/:id/channex-sync-update (UPDATE)', { propertyId: property.id });
  const response = await getPropertyForChannexUpdateSync(property.id);
  console.log('📦 Full endpoint response:', JSON.stringify(response, null, 2));
  const { property: channexPayload } = response;
  
  // Transform content for UPDATE (empty string for description, include empty photos array)
  if (channexPayload.content) {
    channexPayload.content = transformContentForUpdate(channexPayload.content);
  } else {
    channexPayload.content = { description: '', photos: [] };
  }
  
  // Backend already excludes settings, group_id, logo_url, website, important_information
  // But we still validate URLs if they somehow exist
  if (channexPayload.logo_url && !isValidUrl(channexPayload.logo_url)) {
    console.warn('⚠️ Invalid logo_url detected, removing from payload:', channexPayload.logo_url);
    delete channexPayload.logo_url;
  }
  
  if (channexPayload.website && !isValidUrl(channexPayload.website)) {
    console.warn('⚠️ Invalid website detected, removing from payload:', channexPayload.website);
    delete channexPayload.website;
  }
  
  console.log('📦 Property payload after transformation (UPDATE):', JSON.stringify(channexPayload, null, 2));
  console.log('📦 Property payload summary:', {
    title: channexPayload.title,
    currency: channexPayload.currency,
    hasContent: !!channexPayload.content,
    content: channexPayload.content,
    photosCount: channexPayload.content?.photos?.length || 0,
    hasSettings: !!channexPayload.settings,
    hasGroupId: !!channexPayload.group_id,
    hasLogoUrl: !!channexPayload.logo_url,
    hasWebsite: !!channexPayload.website,
  });
  
  // Return as partial (all fields optional for update)
  return channexPayload;
};

export const useChannexProperty = ({ property, channexGroupId, enabled = true }: UseChannexPropertyOptions) => {
  const queryClient = useQueryClient();
  const propertyId = property?.id;
  const propertyTitle = property?.title;

  // Check if property settings exist (required for Channex sync)
  const {
    data: propertySettings,
    isLoading: isLoadingSettings,
  } = useQuery({
    queryKey: ['property-settings', propertyId],
    queryFn: async () => {
      if (!propertyId) return null;
      try {
        return await getPropertySettingsByPropertyId(propertyId);
      } catch (error) {
        // If settings don't exist, return null
        return null;
      }
    },
    enabled: enabled && !!propertyId,
    staleTime: 1 * 60 * 1000,
    retry: false, // Don't retry if settings don't exist
  });

  const hasSettings = !!propertySettings;
  const isMissingSettings = propertyId && !isLoadingSettings && !hasSettings;

  // Check if property exists in Channex
  // First try by stored ID, then fallback to title search
  const {
    data: channexProperty,
    isLoading: isChecking,
    error: checkError,
    refetch: refetchProperty,
  } = useQuery({
    queryKey: ['channex-property', propertyId],
    queryFn: async (): Promise<ChannexProperty | null> => {
      if (!propertyId || !propertyTitle) return null;
      
      // First, check if we have a stored Channex ID for this property
      const storedChannexId = getStoredChannexPropertyId(propertyId);
      if (storedChannexId) {
        const propertyById = await getChannexPropertyById(storedChannexId);
        if (propertyById) {
          return propertyById;
        }
      }
      
      // Fallback: search by title
      const propertyByTitle = await checkPropertyExistsInChannex(propertyTitle);
      if (propertyByTitle) {
        // Store the mapping for future use
        storeChannexPropertyId(propertyId, propertyByTitle.id);
        return propertyByTitle;
      }
      
      return null;
    },
    enabled: enabled && !!propertyId && !!propertyTitle,
    staleTime: 1 * 60 * 1000, // Cache for 1 minute (reduced from 5)
    retry: 1,
  });

  // Track retry attempts to avoid infinite loops
  const retryAttemptRef = useRef<{ payload: CreateChannexPropertyPayload; attempt: number } | null>(null);

  /**
   * Create or update webhook for a Channex property
   * Uses property.channexWebhookId from database as primary source, with localStorage as fallback
   * Uses property's current isActive and sendData values for webhook configuration
   */
  const handleWebhookSync = async (channexPropertyId: string) => {
    try {
      // Fetch fresh property data to ensure we have the latest isActive, sendData, and channexWebhookId values
      let currentProperty = property;
      if (propertyId) {
        try {
          currentProperty = await getPropertyById(propertyId);
          console.log('📥 Fetched fresh property for webhook sync:', {
            propertyId,
            channexWebhookId: currentProperty?.channexWebhookId || (currentProperty as any)?.channex_webhook_id,
            isActive: (currentProperty as any).isActive ?? (currentProperty as any).is_active,
            sendData: (currentProperty as any).sendData ?? (currentProperty as any).send_data,
          });
        } catch (error) {
          console.warn('⚠️ Could not fetch fresh property data for webhook sync, using cached property:', error);
          // Fall back to the property object passed to the hook
        }
      }

      // Priority 1: Check property.channexWebhookId from database (most reliable)
      // This is the primary source - webhook ID should be stored in the property after creation
      const dbWebhookId = currentProperty?.channexWebhookId || (currentProperty as any)?.channex_webhook_id;
      
      // Priority 2: Check localStorage (fallback for older data)
      const storedWebhookId = getStoredChannexWebhookId(channexPropertyId);
      
      // Priority 3: Query Channex API to find existing webhook (last resort)
      // Only query if we don't have a webhook ID from property or localStorage
      let existingWebhook = null;
      if (!dbWebhookId && !storedWebhookId) {
        try {
          const webhooksResponse = await getChannexWebhooksByProperty(channexPropertyId);
          existingWebhook = webhooksResponse.data?.[0];
          if (existingWebhook) {
            console.log('🔍 Found existing webhook via Channex API query:', existingWebhook.id);
          }
        } catch (error) {
          console.warn('⚠️ Could not query Channex for existing webhooks:', error);
        }
      }

      // Determine which webhook ID to use (database > localStorage > Channex query)
      const webhookIdToUse = dbWebhookId || storedWebhookId || existingWebhook?.id;

      console.log('🔑 Webhook ID resolution:', {
        dbWebhookId,
        storedWebhookId,
        existingWebhookId: existingWebhook?.id,
        webhookIdToUse,
        channexPropertyId
      });

      // Get current property values for isActive and sendData (handle both naming conventions)
      // Convert to actual boolean (true/false) - Channex requires boolean, not 0/1
      const getPropertyBooleanValue = (prop: Property | null | undefined, camelKey: string, snakeKey: string): boolean => {
        if (!prop) return false;
        const camelValue = (prop as any)[camelKey];
        const snakeValue = (prop as any)[snakeKey];
        const value = camelValue !== undefined ? camelValue : snakeValue;
        // Convert to actual boolean - Channex requires true/false, not 0/1
        return value === true || value === 1 || value === '1' || value === 'true';
      };

      // Ensure we get actual boolean values (true/false), not numbers (0/1)
      const isActiveValue: boolean = Boolean(getPropertyBooleanValue(currentProperty, 'isActive', 'is_active'));
      const sendDataValue: boolean = Boolean(getPropertyBooleanValue(currentProperty, 'sendData', 'send_data'));

      console.log('📋 Webhook sync using property values:', {
        isActive: isActiveValue,
        sendData: sendDataValue,
        isActiveType: typeof isActiveValue,
        sendDataType: typeof sendDataValue,
        isActiveIsBoolean: typeof isActiveValue === 'boolean',
        sendDataIsBoolean: typeof sendDataValue === 'boolean',
        propertyId: propertyId,
        channexPropertyId
      });

      // Create webhook payload with explicit boolean values (true/false, not 0/1)
      // Channex API requires actual boolean values, not numbers
      const webhookPayload: CreateChannexWebhookPayload | UpdateChannexWebhookPayload = {
        property_id: channexPropertyId,
        callback_url: WEBHOOK_CALLBACK_URL,
        event_mask: '*',
        request_params: {},
        headers: {},
        // Explicitly ensure boolean values - Channex requires true/false, not 0/1
        is_active: Boolean(isActiveValue) === true,
        send_data: Boolean(sendDataValue) === true,
      };

      // Log the actual payload being sent to verify it has boolean values
      console.log('📤 Webhook payload being sent to Channex:', JSON.stringify(webhookPayload, null, 2));

      let finalWebhookId: string;

      if (webhookIdToUse) {
        // Update existing webhook
        console.log('🔄 Updating webhook in Channex:', { 
          webhookId: webhookIdToUse, 
          channexPropertyId,
          is_active: isActiveValue,
          send_data: sendDataValue
        });
        const updatedWebhook = await updateChannexWebhook(webhookIdToUse, webhookPayload);
        finalWebhookId = updatedWebhook.id;
        console.log('✅ Webhook updated successfully:', finalWebhookId);
      } else {
        // Create new webhook
        console.log('🔄 Creating webhook in Channex:', { channexPropertyId });
        const newWebhook = await createChannexWebhook(webhookPayload as CreateChannexWebhookPayload);
        finalWebhookId = newWebhook.id;
        console.log('✅ Webhook created successfully:', finalWebhookId);
      }

      // Store webhook ID in both database and localStorage
      if (propertyId && finalWebhookId) {
        // Update property in database with webhook ID (CRITICAL: This ensures we can find it next time)
        try {
          await updateProperty(propertyId, { channexWebhookId: finalWebhookId });
          // Invalidate property queries to refresh data everywhere
          queryClient.invalidateQueries({ queryKey: ['properties', propertyId] });
          queryClient.invalidateQueries({ queryKey: ['properties'] });
          queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
          console.log('✅ Webhook ID saved to property in database:', finalWebhookId);
          
          // Also store in localStorage as backup
          storeChannexWebhookId(channexPropertyId, finalWebhookId);
          console.log('✅ Webhook ID also stored in localStorage as backup');
        } catch (error) {
          console.error('⚠️ Failed to save webhook ID to database, but webhook was created/updated:', error);
          // Still store in localStorage even if database update fails
          storeChannexWebhookId(channexPropertyId, finalWebhookId);
        }
      } else {
        console.warn('⚠️ Cannot store webhook ID: missing propertyId or finalWebhookId', {
          propertyId,
          finalWebhookId
        });
      }
    } catch (error) {
      console.error('❌ Error syncing webhook with Channex:', error);
      // Don't throw - webhook errors shouldn't block property sync
    }
  };

  // Mutation to create property in Channex
  const createMutation = useMutation({
    mutationFn: async (payload: CreateChannexPropertyPayload) => {
      // Store payload for potential retry
      retryAttemptRef.current = { payload, attempt: (retryAttemptRef.current?.attempt || 0) + 1 };
      return createChannexPropertyApi(payload);
    },
    onSuccess: async (newProperty) => {
      if (propertyId) {
        storeChannexPropertyId(propertyId, newProperty.id);
      }
      queryClient.setQueryData(['channex-property', propertyId], newProperty);
      refetchProperty();
      retryAttemptRef.current = null; // Clear retry on success
      
      // Create webhook after successful property creation
      if (newProperty.id) {
        await handleWebhookSync(newProperty.id);
      }
    },
    onError: async (error: any) => {
      // If error is due to invalid logo_url or website, retry without them (only once)
      if (error?.response?.status === 422 && retryAttemptRef.current && retryAttemptRef.current.attempt === 1) {
        const errorData = error.response.data;
        const urlErrors = errorData?.errors?.details;
        
        if (urlErrors && (urlErrors.logo_url || urlErrors.website)) {
          console.warn('⚠️ Channex rejected logo_url or website, retrying without them...');
          
          const originalPayload = retryAttemptRef.current.payload;
          const retryPayload = { ...originalPayload };
          
          if (urlErrors.logo_url) {
            delete retryPayload.logo_url;
            console.warn('⚠️ Removed logo_url from payload:', originalPayload.logo_url);
          }
          if (urlErrors.website) {
            delete retryPayload.website;
            console.warn('⚠️ Removed website from payload:', originalPayload.website);
          }
          
          // Retry the mutation
          setTimeout(() => {
            createMutation.mutate(retryPayload);
          }, 100);
          return;
        }
      }
      
      // If not a URL error or already retried, let the error propagate
      retryAttemptRef.current = null;
    },
  });

  // Mutation to update property in Channex
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateChannexPropertyPayload> }) => 
      updateChannexPropertyApi(id, payload),
    onSuccess: async (updatedProperty) => {
      queryClient.setQueryData(['channex-property', propertyId], updatedProperty);
      refetchProperty();
      
      // Update webhook after successful property update
      if (updatedProperty.id) {
        await handleWebhookSync(updatedProperty.id);
      }
    },
    onError: (error: unknown) => {
      // Log error details
      const err = error as { response?: { status?: number; data?: any } };
      if (err.response) {
        console.error('❌ Channex Property Update Error in hook:', {
          status: err.response.status,
          data: err.response.data,
          propertyId,
        });
      }
      
      // If 404, the property doesn't exist in Channex anymore - clear the mapping
      if (err.response?.status === 404 && propertyId) {
        clearStoredChannexPropertyId(propertyId);
        // Invalidate query to force re-check
        queryClient.invalidateQueries({ queryKey: ['channex-property', propertyId] });
      }
    },
  });

  // Check if property exists - either from query or from stored mapping
  const storedChannexId = propertyId ? getStoredChannexPropertyId(propertyId) : null;
  const existsInChannex = !!channexProperty || !!storedChannexId;
  const channexIdToUse = channexProperty?.id || storedChannexId;

  // Track previous property data to detect changes
  const previousPropertyRef = useRef<string | null>(null);
  
  // Create a hash of the property data to detect changes
  const getPropertyHash = (prop: Property | null | undefined): string => {
    if (!prop) return '';
    return JSON.stringify({
      title: prop.title,
      currency: prop.currency,
      timezone: prop.timezone,
      propertyType: prop.propertyType,
      email: prop.email,
      phone: prop.phone,
      zipCode: prop.zipCode,
      country: prop.country,
      state: prop.state,
      city: prop.city,
      address: prop.address,
      longitude: prop.longitude,
      latitude: prop.latitude,
      website: prop.website,
    });
  };

  // Auto-sync when property data changes and it exists in Channex
  useEffect(() => {
    if (!property || !propertyId || !channexIdToUse) {
      return;
    }

    const currentHash = getPropertyHash(property);
    const previousHash = previousPropertyRef.current;

    // Only auto-sync if:
    // 1. The data has actually changed (not first render)
    // 2. We're not already syncing
    if (
      previousHash !== null &&
      previousHash !== currentHash &&
      !createMutation.isPending &&
      !updateMutation.isPending
    ) {
      // Auto-update in Channex (async payload mapping)
      mapPropertyToChannexUpdatePayload(property).then(updatePayload => {
        updateMutation.mutate({ id: channexIdToUse, payload: updatePayload });
      });
    }

    // Update the ref with current hash
    previousPropertyRef.current = currentHash;
  }, [
    property,
    propertyId,
    channexIdToUse,
    createMutation.isPending,
    updateMutation.isPending,
    updateMutation,
  ]);

  const handleSync = async () => {
    // Fetch the latest property data to ensure we have the most up-to-date values
    // This is important because the property object might be stale after an update
    let currentProperty = property;
    if (propertyId) {
      try {
        const freshProperty = await getPropertyById(propertyId);
        currentProperty = freshProperty;
        console.log('📥 Fetched fresh property data for sync:', {
          isActive: (freshProperty as any).isActive ?? (freshProperty as any).is_active,
          sendData: (freshProperty as any).sendData ?? (freshProperty as any).send_data,
        });
      } catch (error) {
        console.warn('⚠️ Could not fetch fresh property data, using cached property:', error);
        // Fall back to the property object passed to the hook
      }
    }

    // Note: is_active and send_data are default values, not requirements
    // Property can be synced regardless of these values
    // They are only used to configure the webhook, not to block property sync

    // Prevent sync if settings are missing (only for CREATE, not UPDATE)
    if (!channexIdToUse && isMissingSettings) {
      console.warn('⚠️ Cannot sync property to Channex: Settings are required');
      return;
    }

    if (property && propertyId && !createMutation.isPending && !updateMutation.isPending) {
      try {
        if (channexIdToUse) {
          // Update existing property - fetch latest data from backend endpoint
          console.log('🔄 Syncing property to Channex (UPDATE):', { propertyId, channexId: channexIdToUse });
          const updatePayload = await mapPropertyToChannexUpdatePayload(property);
          console.log('✅ Property data fetched from backend endpoint:', updatePayload);
          updateMutation.mutate({ id: channexIdToUse, payload: updatePayload });
        } else {
          // Create new property - requires settings
          if (isMissingSettings) {
            console.error('❌ Cannot create property in Channex: Settings are required');
            return;
          }
          console.log('🔄 Syncing property to Channex (CREATE):', { propertyId });
          const createPayload = await mapPropertyToChannexCreatePayload(property, channexGroupId);
          console.log('✅ Property data fetched from backend endpoint:', createPayload);
          createMutation.mutate(createPayload);
        }
      } catch (error) {
        console.error('❌ Error fetching property data for Channex sync:', error);
        throw error;
      }
    }
  };

  return {
    channexProperty,
    existsInChannex,
    isChecking,
    isSyncing: createMutation.isPending || updateMutation.isPending,
    isUpdating: updateMutation.isPending,
    checkError,
    syncError: createMutation.error || updateMutation.error,
    syncToChannex: handleSync,
    isMissingSettings,
    hasSettings,
  };
};
