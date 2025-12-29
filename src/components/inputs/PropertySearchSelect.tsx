import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SearchSelect, { SearchSelectOption } from './SearchSelect';
import { searchProperties, getProperties } from '@/api/properties.api';

interface PropertySearchSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string | null;
  className?: string;
}

const PropertySearchSelect: React.FC<PropertySearchSelectProps> = ({
  label,
  value,
  onChange,
  disabled,
  error,
  className,
}) => {
  const { t } = useTranslation();
  const [options, setOptions] = useState<SearchSelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);

  // Load initial properties on mount
  useEffect(() => {
    const loadInitialProperties = async () => {
      if (hasLoadedInitial) return;
      
      setIsLoading(true);
      try {
        const response = await getProperties({ page: 1, limit: 20, sortBy: 'title', sortOrder: 'ASC' });
        const propertyOptions: SearchSelectOption[] = response.data.map((property) => ({
          value: property.id,
          label: property.title,
        }));
        setOptions(propertyOptions);
        setHasLoadedInitial(true);
      } catch (error) {
        console.error('Error loading initial properties:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (query: string) => {
    if (!query || query.length < 2) {
      // If no query, keep current options (don't clear them)
      if (!hasLoadedInitial) {
        // If we haven't loaded initial yet, wait for it
        return;
      }
      return;
    }

    setIsLoading(true);
    try {
      const properties = await searchProperties(query);
      const propertyOptions: SearchSelectOption[] = properties.map((property) => ({
        value: property.id,
        label: property.title,
      }));
      setOptions(propertyOptions);
    } catch (error) {
      console.error('Error searching properties:', error);
      // Don't clear options on error, keep what we have
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial value if exists (for edit mode)
  useEffect(() => {
    if (value && options.length > 0) {
      // Check if the value is already in options
      const exists = options.some(opt => String(opt.value) === String(value));
      if (!exists) {
        // If value exists but not in options, try to find it
        handleSearch(value.substring(0, 8)); // Use first 8 chars of UUID as search
      }
    }
  }, [value, options.length]);

  return (
    <SearchSelect
      label={label || t('common.property')}
      value={value}
      onChange={(val) => onChange(String(val))}
      options={options}
      placeholder={t('common.searchProperty')}
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

export default PropertySearchSelect;

