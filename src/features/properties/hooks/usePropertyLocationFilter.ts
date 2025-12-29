import { useQuery } from '@tanstack/react-query';
import { filterPropertiesByLocation } from '@/api/properties.api';
import type { PropertyLocationFilter } from '../types';

export const usePropertyLocationFilter = (
  filters: PropertyLocationFilter,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['properties', 'filter', filters],
    queryFn: () => filterPropertiesByLocation(filters),
    enabled: enabled && Object.keys(filters).length > 0,
  });
};

