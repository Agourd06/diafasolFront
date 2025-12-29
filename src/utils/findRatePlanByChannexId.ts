/**
 * Utility to find which local rate plan corresponds to a Channex rate plan ID
 * 
 * This helps identify rate plans that exist in Channex but may not have rates synced.
 */

const CHANNEX_RATE_PLAN_MAP_KEY = 'channex_rate_plan_map';

/**
 * Find local rate plan ID by Channex rate plan ID
 * @param channexRatePlanId - The Channex rate plan ID to look up
 * @returns The local rate plan ID if found, null otherwise
 */
export const findLocalRatePlanByChannexId = (channexRatePlanId: string): string | null => {
  try {
    const map = JSON.parse(localStorage.getItem(CHANNEX_RATE_PLAN_MAP_KEY) || '{}');
    // Reverse lookup: find local ID by Channex ID
    for (const [localId, channexId] of Object.entries(map)) {
      if (channexId === channexRatePlanId) {
        return localId;
      }
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Get all rate plan mappings
 * @returns Object mapping local rate plan IDs to Channex rate plan IDs
 */
export const getAllRatePlanMappings = (): Record<string, string> => {
  try {
    return JSON.parse(localStorage.getItem(CHANNEX_RATE_PLAN_MAP_KEY) || '{}');
  } catch {
    return {};
  }
};

/**
 * Log rate plan mappings for debugging
 */
export const logRatePlanMappings = () => {
  const mappings = getAllRatePlanMappings();
  console.log('📋 Rate Plan Mappings (Local → Channex):', mappings);
  
  // Reverse lookup for debugging
  const reverseMappings: Record<string, string> = {};
  for (const [localId, channexId] of Object.entries(mappings)) {
    reverseMappings[channexId as string] = localId;
  }
  console.log('📋 Rate Plan Mappings (Channex → Local):', reverseMappings);
  
  return { mappings, reverseMappings };
};
