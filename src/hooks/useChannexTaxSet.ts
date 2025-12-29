import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  checkTaxSetExistsInChannex,
  createChannexTaxSet,
  updateChannexTaxSet,
  getChannexTaxSetById,
  checkTaxExistsInChannex,
  createChannexTax,
  type ChannexTaxSet,
  type ChannexTax,
  type CreateChannexTaxPayload,
  type ChannexTaxReference,
} from '@/api/channex.api';
import type { TaxSet } from '@/features/tax-sets/types';
import type { Tax } from '@/features/taxes/types';

// Storage keys for Channex ID mapping
const CHANNEX_TAX_SET_MAP_KEY = 'channex_tax_set_map';

// Get stored Channex tax set ID for a local tax set
export const getStoredChannexTaxSetId = (localTaxSetId: string): string | null => {
  try {
    const map = JSON.parse(localStorage.getItem(CHANNEX_TAX_SET_MAP_KEY) || '{}');
    return map[localTaxSetId] || null;
  } catch {
    return null;
  }
};

// Store Channex tax set ID mapping
const storeChannexTaxSetId = (localTaxSetId: string, channexTaxSetId: string) => {
  try {
    const map = JSON.parse(localStorage.getItem(CHANNEX_TAX_SET_MAP_KEY) || '{}');
    map[localTaxSetId] = channexTaxSetId;
    localStorage.setItem(CHANNEX_TAX_SET_MAP_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to store Channex tax set mapping:', e);
  }
};

interface UseChannexTaxSetOptions {
  taxSet: TaxSet | null;
  channexPropertyId?: string | null;
  enabled?: boolean;
}

interface UseChannexTaxSetReturn {
  existsInChannex: boolean;
  channexTaxSet: ChannexTaxSet | null;
  isChecking: boolean;
  isSyncing: boolean;
  isUpdating: boolean;
  syncToChannex: () => Promise<void>;
  syncError: Error | null;
  // For managing individual taxes
  channexTaxes: Map<string, ChannexTax>;
  isSyncingTax: boolean;
  syncingTaxId: string | null;
  syncTaxToChannex: (tax: Tax) => Promise<ChannexTax | null>;
}

/**
 * Hook to manage tax set synchronization with Channex
 * 
 * Flow:
 * 1. Check if tax set exists in Channex
 * 2. Check if individual taxes exist in Channex
 * 3. Create missing taxes first
 * 4. Create/update tax set with Channex tax IDs
 */
export const useChannexTaxSet = ({
  taxSet,
  channexPropertyId,
  enabled = true,
}: UseChannexTaxSetOptions): UseChannexTaxSetReturn => {
  const queryClient = useQueryClient();
  const [channexTaxes, setChannexTaxes] = useState<Map<string, ChannexTax>>(new Map());
  const [syncingTaxId, setSyncingTaxId] = useState<string | null>(null);

  // Check if tax set exists in Channex
  // First try by stored ID, then fallback to title search
  const {
    data: channexTaxSet,
    isLoading: isChecking,
    refetch: refetchTaxSet,
  } = useQuery({
    queryKey: ['channex', 'taxSet', taxSet?.id, channexPropertyId],
    queryFn: async (): Promise<ChannexTaxSet | null> => {
      if (!taxSet || !channexPropertyId) return null;
      
      // First, check if we have a stored Channex ID for this tax set
      const storedChannexId = getStoredChannexTaxSetId(taxSet.id);
      if (storedChannexId) {
        const taxSetById = await getChannexTaxSetById(storedChannexId);
        if (taxSetById) {
          return taxSetById;
        }
        // If stored ID doesn't work, try by title
      }
      
      // Fallback: search by title
      const taxSetByTitle = await checkTaxSetExistsInChannex(taxSet.title, channexPropertyId);
      if (taxSetByTitle) {
        // Store the mapping for future use
        storeChannexTaxSetId(taxSet.id, taxSetByTitle.id);
      }
      return taxSetByTitle;
    },
    enabled: enabled && !!taxSet && !!channexPropertyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Check for existing Channex taxes when tax set taxes change
  useEffect(() => {
    const checkTaxes = async () => {
      if (!taxSet?.taxSetTaxes || !channexPropertyId) return;

      const newMap = new Map<string, ChannexTax>();
      
      for (const taxSetTax of taxSet.taxSetTaxes) {
        const tax = taxSetTax.tax;
        if (tax) {
          const channexTax = await checkTaxExistsInChannex(tax.title, channexPropertyId);
          if (channexTax) {
            newMap.set(tax.id, channexTax);
          }
        }
      }
      
      setChannexTaxes(newMap);
    };

    if (enabled && taxSet?.taxSetTaxes && channexPropertyId) {
      checkTaxes();
    }
  }, [taxSet?.taxSetTaxes, channexPropertyId, enabled]);


  // Mutation for syncing a single tax to Channex
  const syncTaxMutation = useMutation({
    mutationFn: async ({ tax, propertyId }: { tax: Tax; propertyId: string }) => {
      setSyncingTaxId(tax.id);
      // Check if already exists
      const existing = await checkTaxExistsInChannex(tax.title, propertyId);
      let channexTax = existing;

      if (!existing) {
        // Map our tax logic to Channex format
        const logicMap: Record<string, string> = {
          percent: 'percent',
          per_room: 'per_room',
          per_room_per_night: 'per_room_per_night',
          per_person: 'per_person',
          per_person_per_night: 'per_person_per_night',
          per_night: 'per_night',
          per_booking: 'per_booking',
        };

        const typeMap: Record<string, string> = {
          tax: 'tax',
          fee: 'fee',
          city_tax: 'city_tax',
        };

        // Build payload with only defined values
        const mappedLogic = logicMap[tax.logic] || 'percent';
        
        // Convert isInclusive to boolean (handle both boolean and 1/0 from backend)
        // Explicitly convert to true/false boolean, not just truthy/falsy
        const isInclusiveBool = tax.isInclusive === true || tax.isInclusive === 1 || tax.isInclusive === '1' ? true : false;
        
        const payload: CreateChannexTaxPayload = {
          title: tax.title,
          property_id: propertyId,
          type: typeMap[tax.type] || 'tax',
          logic: mappedLogic,
          rate: String(tax.rate), // Ensure it's a string
          is_inclusive: isInclusiveBool, // Explicit boolean true/false
        };

        // Currency is required when logic is not 'percent'
        if (mappedLogic !== 'percent') {
          if (taxSet?.currency) {
            payload.currency = taxSet.currency;
          } else {
            throw new Error('Currency is required when tax logic is not "percent". Please ensure the tax set has a currency.');
          }
        }

        // Only add optional fields if they have valid values
        if (tax.skipNights && tax.skipNights > 0) {
          payload.skip_nights = tax.skipNights;
        }
        if (tax.maxNights && tax.maxNights > 0) {
          payload.max_nights = tax.maxNights;
        }

        // Debug: Log payload to verify boolean conversion
        console.log('🔍 Creating Channex tax payload:', {
          ...payload,
          is_inclusive: payload.is_inclusive,
          is_inclusive_type: typeof payload.is_inclusive,
        });

        channexTax = await createChannexTax(payload);
      }

      // Update tax set in Channex to include this tax (only if tax set exists in Channex)
      if (channexTax && taxSet) {
        const storedChannexId = getStoredChannexTaxSetId(taxSet.id);
        const channexTaxSetId = channexTaxSet?.id || storedChannexId;

        if (channexTaxSetId) {
          // Verify tax set exists before updating
          const verifyTaxSet = await getChannexTaxSetById(channexTaxSetId);
          if (!verifyTaxSet) {
            console.warn(`⚠️ Tax set ${channexTaxSetId} not found in Channex. Skipping update.`);
            // Clear stored ID if it's invalid
            if (storedChannexId === channexTaxSetId) {
              localStorage.removeItem(`channex_tax_set_${taxSet.id}`);
            }
          } else {
            // Build taxes array with all synced taxes (including the newly synced one)
            const updatedTaxesMap = new Map(channexTaxes);
            updatedTaxesMap.set(tax.id, channexTax);

            const taxesArray = taxSet.taxSetTaxes
              .map((taxSetTax) => {
                const channexTaxForRef = taxSetTax.taxId === tax.id 
                  ? channexTax 
                  : updatedTaxesMap.get(taxSetTax.taxId);
                
                // Only include taxes that are synced to Channex
                if (!channexTaxForRef) return null;

                return {
                  id: channexTaxForRef.id,
                  level: taxSetTax.level || 0,
                };
              })
              .filter((ref): ref is ChannexTaxReference => ref !== null);

            // Update the tax set in Channex with all synced taxes
            try {
              await updateChannexTaxSet(channexTaxSetId, {
                taxes: taxesArray,
              });
            } catch (error) {
              console.error('⚠️ Failed to update tax set in Channex after syncing tax:', error);
              // Don't throw - tax sync was successful, tax set update can be retried later
            }
          }
        }
        // If tax set doesn't exist in Channex yet, just sync the tax
        // The user can sync the tax set later to include all taxes
      }

      return channexTax;
    },
    onSuccess: (channexTax, { tax }) => {
      if (channexTax) {
        setChannexTaxes((prev) => new Map(prev).set(tax.id, channexTax));
        // Invalidate tax set query to refresh
        queryClient.invalidateQueries({ queryKey: ['channex', 'taxSet'] });
        refetchTaxSet();
      }
      setSyncingTaxId(null);
    },
    onError: () => {
      setSyncingTaxId(null);
    },
  });

  // Main sync mutation for tax set (create)
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!taxSet || !channexPropertyId) {
        throw new Error('Tax set or Channex property ID not available');
      }

      // Build taxes array from synced taxes
      const taxesArray: ChannexTaxReference[] = taxSet.taxSetTaxes
        ?.map((taxSetTax) => {
          const channexTax = channexTaxes.get(taxSetTax.taxId);
          if (!channexTax) return null;

          return {
            id: channexTax.id,
            level: taxSetTax.level || 0,
          };
        })
        .filter((ref): ref is ChannexTaxReference => ref !== null) || [];

      // Create the tax set in Channex with taxes array
      const payload = {
        title: taxSet.title,
        currency: taxSet.currency,
        taxes: taxesArray,
        associated_rate_plan_ids: [], // Empty for now
        property_id: channexPropertyId,
      };

      const newTaxSet = await createChannexTaxSet(payload);
      return { newTaxSet, localTaxSetId: taxSet.id };
    },
    onSuccess: ({ newTaxSet, localTaxSetId }) => {
      // Store the mapping between local tax set ID and Channex tax set ID
      storeChannexTaxSetId(localTaxSetId, newTaxSet.id);
      queryClient.invalidateQueries({ queryKey: ['channex', 'taxSet'] });
      refetchTaxSet();
    },
  });

  // Update mutation for tax set
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!taxSet || !channexPropertyId) {
        throw new Error('Tax set or Channex property ID not available');
      }

      // Get Channex ID from query result or localStorage
      const idToUpdate = channexTaxSet?.id || getStoredChannexTaxSetId(taxSet.id);
      if (!idToUpdate) {
        throw new Error('No Channex tax set ID found');
      }

      // Build taxes array from synced taxes
      const taxesArray: ChannexTaxReference[] = taxSet.taxSetTaxes
        ?.map((taxSetTax) => {
          const channexTax = channexTaxes.get(taxSetTax.taxId);
          if (!channexTax) return null;

          return {
            id: channexTax.id,
            level: taxSetTax.level || 0,
          };
        })
        .filter((ref): ref is ChannexTaxReference => ref !== null) || [];

      // Update the tax set in Channex
      const payload = {
        title: taxSet.title,
        currency: taxSet.currency,
        taxes: taxesArray,
        associated_rate_plan_ids: [], // Empty for now
        property_id: channexPropertyId,
      };

      const updatedTaxSet = await updateChannexTaxSet(idToUpdate, payload);
      return updatedTaxSet;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channex', 'taxSet'] });
      refetchTaxSet();
    },
  });

  // Check if tax set exists - either from query or from stored mapping
  const storedChannexId = taxSet ? getStoredChannexTaxSetId(taxSet.id) : null;
  const channexIdToUse = channexTaxSet?.id || storedChannexId;
  const existsInChannex = !!channexTaxSet || !!storedChannexId;

  const syncToChannex = useCallback(async () => {
    if (channexIdToUse) {
      // Update existing tax set
      await updateMutation.mutateAsync();
    } else {
      // Create new tax set
      await createMutation.mutateAsync();
    }
  }, [channexIdToUse, createMutation, updateMutation]);

  const syncTaxToChannex = useCallback(async (tax: Tax): Promise<ChannexTax | null> => {
    if (!channexPropertyId) return null;
    return syncTaxMutation.mutateAsync({ tax, propertyId: channexPropertyId });
  }, [syncTaxMutation, channexPropertyId]);

  return {
    existsInChannex,
    channexTaxSet: channexTaxSet || null,
    isChecking,
    isSyncing: createMutation.isPending || updateMutation.isPending,
    isUpdating: updateMutation.isPending,
    syncToChannex,
    syncError: (createMutation.error || updateMutation.error) as Error | null,
    channexTaxes,
    isSyncingTax: syncTaxMutation.isPending,
    syncingTaxId,
    syncTaxToChannex,
  };
};
