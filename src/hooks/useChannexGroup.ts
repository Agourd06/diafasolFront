import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  checkGroupExistsInChannex, 
  createChannexGroup, 
  updateChannexGroup,
  getChannexGroupById,
  ChannexGroup,
} from '@/api/channex.api';

interface UseChannexGroupOptions {
  groupId?: string | null;
  groupTitle: string | null | undefined;
  enabled?: boolean;
}

// Storage keys for Channex ID mapping
const CHANNEX_GROUP_MAP_KEY = 'channex_group_map';

// Get stored Channex group ID for a local group
const getStoredChannexGroupId = (localGroupId: string): string | null => {
  try {
    const map = JSON.parse(localStorage.getItem(CHANNEX_GROUP_MAP_KEY) || '{}');
    return map[localGroupId] || null;
  } catch {
    return null;
  }
};

// Store Channex group ID mapping
const storeChannexGroupId = (localGroupId: string, channexGroupId: string) => {
  try {
    const map = JSON.parse(localStorage.getItem(CHANNEX_GROUP_MAP_KEY) || '{}');
    map[localGroupId] = channexGroupId;
    localStorage.setItem(CHANNEX_GROUP_MAP_KEY, JSON.stringify(map));
  } catch {
    // Silent fail
  }
};

export const useChannexGroup = ({ groupId, groupTitle, enabled = true }: UseChannexGroupOptions) => {
  const queryClient = useQueryClient();

  // Check if group exists in Channex
  // First try by stored ID, then fallback to title search
  const {
    data: channexGroup,
    isLoading: isChecking,
    error: checkError,
  } = useQuery({
    queryKey: ['channex-group', groupId || groupTitle],
    queryFn: async (): Promise<ChannexGroup | null> => {
      if (!groupTitle) return null;
      
      // First, check if we have a stored Channex ID for this group
      if (groupId) {
        const storedChannexId = getStoredChannexGroupId(groupId);
        if (storedChannexId) {
          const groupById = await getChannexGroupById(storedChannexId);
          if (groupById) {
            return groupById;
          }
          // If stored ID doesn't work, clear it and try by title
        }
      }
      
      // Fallback: search by title
      const groupByTitle = await checkGroupExistsInChannex(groupTitle);
      if (groupByTitle && groupId) {
        // Store the mapping for future use
        storeChannexGroupId(groupId, groupByTitle.id);
      }
      return groupByTitle;
    },
    enabled: enabled && !!groupTitle,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
  });

  // Mutation to create group in Channex
  const createMutation = useMutation({
    mutationFn: (title: string) => createChannexGroup(title),
    onSuccess: (newGroup) => {
      // Store the mapping between local group ID and Channex group ID
      if (groupId) {
        storeChannexGroupId(groupId, newGroup.id);
      }
      queryClient.setQueryData(['channex-group', groupId || groupTitle], newGroup);
      queryClient.invalidateQueries({ queryKey: ['channex-group', groupId || groupTitle] });
    },
  });

  // Mutation to update group in Channex
  const updateMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => updateChannexGroup(id, title),
    onSuccess: (updatedGroup) => {
      queryClient.setQueryData(['channex-group', groupId || groupTitle], updatedGroup);
      queryClient.invalidateQueries({ queryKey: ['channex-group', groupId || groupTitle] });
    },
  });

  // Check if group exists - either from query or from stored mapping
  const storedChannexId = groupId ? getStoredChannexGroupId(groupId) : null;
  const existsInChannex = !!channexGroup || !!storedChannexId;
  const channexIdToUse = channexGroup?.id || storedChannexId;

  // Create new group in Channex
  const handleCreate = () => {
    if (groupTitle && !createMutation.isPending) {
      createMutation.mutate(groupTitle);
    }
  };

  // Update existing group in Channex with custom title
  const handleUpdate = (newTitle: string) => {
    if (channexIdToUse && !updateMutation.isPending) {
      updateMutation.mutate({ id: channexIdToUse, title: newTitle });
    }
  };

  return {
    channexGroup,
    existsInChannex,
    isChecking,
    isSyncing: createMutation.isPending || updateMutation.isPending,
    isUpdating: updateMutation.isPending,
    checkError,
    syncError: createMutation.error || updateMutation.error,
    syncToChannex: handleCreate,
    updateInChannex: handleUpdate,
  };
};
