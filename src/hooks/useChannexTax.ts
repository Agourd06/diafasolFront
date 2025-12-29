import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  checkTaxExistsInChannex,
  createChannexTax,
  type ChannexTax,
  type CreateChannexTaxPayload,
} from '@/api/channex.api';
import type { Tax } from '@/features/taxes/types';

interface UseChannexTaxOptions {
  tax: Tax | null | undefined;
  channexPropertyId?: string | null;
  enabled?: boolean;
}

/**
 * Map our tax logic to Channex format
 */
const mapLogicToChannex = (logic: string): string => {
  const logicMap: Record<string, string> = {
    percent: 'percent',
    per_room: 'per_room',
    per_room_per_night: 'per_room_per_night',
    per_person: 'per_person',
    per_person_per_night: 'per_person_per_night',
    per_night: 'per_night',
    per_booking: 'per_booking',
  };
  return logicMap[logic] || logic;
};

/**
 * Map our tax type to Channex format
 */
const mapTypeToChannex = (type: string): string => {
  const typeMap: Record<string, string> = {
    tax: 'tax',
    fee: 'fee',
    city_tax: 'city_tax',
  };
  return typeMap[type] || type;
};

/**
 * Map our tax to Channex payload
 * Only includes optional fields if they have valid values
 */
const mapTaxToChannexPayload = (
  tax: Tax,
  channexPropertyId: string,
  currency?: string // Optional currency from tax set
): CreateChannexTaxPayload => {
  const mappedLogic = mapLogicToChannex(tax.logic);
  const payload: CreateChannexTaxPayload = {
    title: tax.title,
    property_id: channexPropertyId,
    type: mapTypeToChannex(tax.type),
    logic: mappedLogic,
    rate: String(tax.rate), // Ensure it's a string
    is_inclusive: Boolean(tax.isInclusive), // Ensure it's a boolean, not 1/0
  };

  // Currency is required when logic is not 'percent'
  if (mappedLogic !== 'percent' && currency) {
    payload.currency = currency;
  }

  // Only add optional fields if they have valid values
  if (tax.skipNights && tax.skipNights > 0) {
    payload.skip_nights = tax.skipNights;
  }
  if (tax.maxNights && tax.maxNights > 0) {
    payload.max_nights = tax.maxNights;
  }

  return payload;
};

export const useChannexTax = ({
  tax,
  channexPropertyId,
  enabled = true,
}: UseChannexTaxOptions) => {
  const queryClient = useQueryClient();
  const taxTitle = tax?.title;

  // Check if tax exists in Channex
  const {
    data: channexTax,
    isLoading: isChecking,
    error: checkError,
  } = useQuery({
    queryKey: ['channex-tax', taxTitle, channexPropertyId],
    queryFn: () => checkTaxExistsInChannex(taxTitle!, channexPropertyId!),
    enabled: enabled && !!taxTitle && !!channexPropertyId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
  });

  // Mutation to create tax in Channex
  const {
    mutate: syncToChannex,
    mutateAsync: syncToChannexAsync,
    isPending: isSyncing,
    error: syncError,
  } = useMutation({
    mutationFn: (payload: CreateChannexTaxPayload) => createChannexTax(payload),
    onSuccess: (newTax) => {
      // Update the cache with the new tax
      queryClient.setQueryData(['channex-tax', taxTitle, channexPropertyId], newTax);
      // Invalidate to refetch
      queryClient.invalidateQueries({ queryKey: ['channex-tax', taxTitle, channexPropertyId] });
    },
  });

  const existsInChannex = !!channexTax;

  const handleSync = () => {
    if (tax && channexPropertyId && !existsInChannex && !isSyncing) {
      const payload = mapTaxToChannexPayload(tax, channexPropertyId);
      syncToChannex(payload);
    }
  };

  const handleSyncAsync = async (): Promise<ChannexTax | null> => {
    if (tax && channexPropertyId && !existsInChannex && !isSyncing) {
      const payload = mapTaxToChannexPayload(tax, channexPropertyId);
      return syncToChannexAsync(payload);
    }
    return channexTax || null;
  };

  return {
    channexTax,
    existsInChannex,
    isChecking,
    isSyncing,
    checkError,
    syncError,
    syncToChannex: handleSync,
    syncToChannexAsync: handleSyncAsync,
  };
};

/**
 * Hook to manage multiple taxes' Channex sync status
 */
export const useChannexTaxes = (
  taxes: Tax[],
  channexPropertyId: string | null | undefined,
  enabled: boolean = true
) => {
  const queryClient = useQueryClient();

  // Query to check all taxes
  const {
    data: channexTaxesMap,
    isLoading: isChecking,
  } = useQuery({
    queryKey: ['channex-taxes', channexPropertyId, taxes.map(t => t.id).join(',')],
    queryFn: async () => {
      if (!channexPropertyId || taxes.length === 0) return new Map<string, ChannexTax>();

      const map = new Map<string, ChannexTax>();
      
      // Check each tax in parallel
      const results = await Promise.all(
        taxes.map(async (tax) => {
          const channexTax = await checkTaxExistsInChannex(tax.title, channexPropertyId);
          return { taxId: tax.id, channexTax };
        })
      );

      results.forEach(({ taxId, channexTax }) => {
        if (channexTax) {
          map.set(taxId, channexTax);
        }
      });

      return map;
    },
    enabled: enabled && !!channexPropertyId && taxes.length > 0,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Mutation to sync a single tax
  const syncTaxMutation = useMutation({
    mutationFn: async ({ tax, propertyId }: { tax: Tax; propertyId: string }) => {
      const payload = mapTaxToChannexPayload(tax, propertyId);
      return createChannexTax(payload);
    },
    onSuccess: (channexTax, { tax }) => {
      // Update the map in cache
      queryClient.setQueryData(
        ['channex-taxes', channexPropertyId, taxes.map(t => t.id).join(',')],
        (oldMap: Map<string, ChannexTax> | undefined) => {
          const newMap = new Map(oldMap || []);
          newMap.set(tax.id, channexTax);
          return newMap;
        }
      );
    },
  });

  const syncTax = async (tax: Tax): Promise<ChannexTax | null> => {
    if (!channexPropertyId) return null;
    
    // Check if already synced
    if (channexTaxesMap?.has(tax.id)) {
      return channexTaxesMap.get(tax.id) || null;
    }

    return syncTaxMutation.mutateAsync({ tax, propertyId: channexPropertyId });
  };

  const isTaxSynced = (taxId: string): boolean => {
    return channexTaxesMap?.has(taxId) || false;
  };

  const getChannexTax = (taxId: string): ChannexTax | undefined => {
    return channexTaxesMap?.get(taxId);
  };

  return {
    channexTaxesMap: channexTaxesMap || new Map<string, ChannexTax>(),
    isChecking,
    isSyncing: syncTaxMutation.isPending,
    syncingTaxId: syncTaxMutation.variables?.tax.id || null,
    syncTax,
    isTaxSynced,
    getChannexTax,
  };
};
