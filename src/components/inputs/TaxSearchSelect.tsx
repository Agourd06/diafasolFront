import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import SearchSelect, { SearchSelectOption } from './SearchSelect';
import { searchTaxes, getTaxes, getTaxesByProperty } from '@/api/taxes.api';

interface TaxSearchSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string | null;
  className?: string;
  propertyId?: string;
}

const TaxSearchSelect: React.FC<TaxSearchSelectProps> = ({
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

  // Load initial taxes
  const loadInitialTaxes = useCallback(async () => {
    setIsLoading(true);
    try {
      let taxes;
      if (propertyId) {
        taxes = await getTaxesByProperty(propertyId);
      } else {
        const response = await getTaxes({ page: 1, limit: 20, sortBy: 'title', sortOrder: 'ASC' });
        taxes = response.data;
      }

      const taxOptions: SearchSelectOption[] = taxes.map((tax) => ({
        value: tax.id,
        label: tax.title,
      }));
      setOptions(taxOptions);
      setHasLoadedInitial(true);
    } catch (error) {
      console.error('Error loading initial taxes:', error);
      setOptions([]);
      setHasLoadedInitial(true);
    } finally {
      setIsLoading(false);
    }
  }, [propertyId]);

  // Load initial taxes on mount or when property changes
  useEffect(() => {
    setHasLoadedInitial(false);
    setOptions([]);
    loadInitialTaxes();
  }, [loadInitialTaxes]);

  const handleSearch = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      if (!hasLoadedInitial) {
        await loadInitialTaxes();
        return;
      }
      return;
    }

    setIsLoading(true);
    try {
      let taxes = await searchTaxes(query);
      if (propertyId) {
        taxes = taxes.filter((tax) => tax.propertyId === propertyId);
      }
      const taxOptions: SearchSelectOption[] = taxes.map((tax) => ({
        value: tax.id,
        label: tax.title,
      }));
      setOptions(taxOptions);
    } catch (error) {
      console.error('Error searching taxes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [propertyId, hasLoadedInitial, loadInitialTaxes]);

  // Load initial value if exists (for edit mode)
  useEffect(() => {
    if (value && options.length > 0) {
      const exists = options.some(opt => String(opt.value) === String(value));
      if (!exists) {
        handleSearch(value.substring(0, 8));
      }
    }
  }, [value, options.length]);

  return (
    <SearchSelect
      label={label || t('taxes.title')}
      value={value}
      onChange={(val) => onChange(String(val))}
      options={options}
      placeholder={t('taxes.search.placeholder')}
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

export default TaxSearchSelect;

