import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import SearchSelect, { SearchSelectOption } from './SearchSelect';
import { searchTaxSets, getTaxSets, getTaxSetsByProperty } from '@/api/tax-sets.api';

interface TaxSetSearchSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string | null;
  className?: string;
  propertyId?: string;
}

const TaxSetSearchSelect: React.FC<TaxSetSearchSelectProps> = ({
  label,
  value,
  onChange,
  disabled,
  error,
  className,
  propertyId,
}) => {
  const { t } = useTranslation();
  const [options, setOptions] = useState<SearchSelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);

  // Load initial tax sets
  const loadInitialTaxSets = useCallback(async () => {
    setIsLoading(true);
    try {
      let taxSets;
      if (propertyId) {
        taxSets = await getTaxSetsByProperty(propertyId);
      } else {
        const response = await getTaxSets({ page: 1, limit: 20, sortBy: 'title', sortOrder: 'ASC' });
        taxSets = response.data;
      }

      const taxSetOptions: SearchSelectOption[] = taxSets.map((taxSet) => ({
        value: taxSet.id,
        label: taxSet.title,
      }));
      setOptions(taxSetOptions);
      setHasLoadedInitial(true);
    } catch (error) {
      console.error('Error loading initial tax sets:', error);
      setOptions([]);
      setHasLoadedInitial(true);
    } finally {
      setIsLoading(false);
    }
  }, [propertyId]);

  // Load initial tax sets on mount or when property changes
  useEffect(() => {
    setHasLoadedInitial(false);
    setOptions([]);
    loadInitialTaxSets();
  }, [loadInitialTaxSets]);

  const handleSearch = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      // If no query and we haven't loaded initial data, load it
      if (!hasLoadedInitial) {
        await loadInitialTaxSets();
      }
      return;
    }

    setIsLoading(true);
    try {
      let taxSets = await searchTaxSets(query);
      if (propertyId) {
        taxSets = taxSets.filter((taxSet) => taxSet.propertyId === propertyId);
      }
      const taxSetOptions: SearchSelectOption[] = taxSets.map((taxSet) => ({
        value: taxSet.id,
        label: taxSet.title,
      }));
      setOptions(taxSetOptions);
    } catch (error) {
      console.error('Error searching tax sets:', error);
    } finally {
      setIsLoading(false);
    }
  }, [propertyId, hasLoadedInitial, loadInitialTaxSets]);

  // Load initial value if exists (for edit mode)
  useEffect(() => {
    if (value && !options.some(opt => String(opt.value) === String(value))) {
      // Value not in current options, might need to fetch it
      if (hasLoadedInitial && options.length > 0) {
        // For edit mode, we might need to fetch the specific tax set
        // But for now, just keep the value and let the parent handle it
      }
    }
  }, [value, options, hasLoadedInitial]);

  return (
    <SearchSelect
      label={label || t('taxSets.title')}
      value={value}
      onChange={(val) => onChange(String(val))}
      options={options}
      placeholder={t('taxSets.form.selectTaxSet')}
      disabled={disabled}
      error={error}
      isLoading={isLoading}
      onSearchChange={handleSearch}
      noOptionsMessage={(query) => 
        query.length < 2 
          ? t('common.typeToSearch') 
          : t('common.noResultsFound')
      }
      className={className}
    />
  );
};

export default TaxSetSearchSelect;

