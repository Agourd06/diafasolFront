import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SearchSelect, { SearchSelectOption } from './SearchSelect';
import { searchRatePlans, getRatePlans } from '@/api/rate-plans.api';

interface RatePlanSearchSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string | null;
  className?: string;
}

const RatePlanSearchSelect: React.FC<RatePlanSearchSelectProps> = ({
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

  // Load initial rate plans on mount
  useEffect(() => {
    const loadInitialRatePlans = async () => {
      if (hasLoadedInitial) return;
      
      setIsLoading(true);
      try {
        const response = await getRatePlans({ page: 1, limit: 20, sortBy: 'title', sortOrder: 'ASC' });
        const ratePlanOptions: SearchSelectOption[] = response.data.map((plan) => ({
          value: plan.id,
          label: plan.title,
        }));
        setOptions(ratePlanOptions);
        setHasLoadedInitial(true);
      } catch (error) {
        console.error('Error loading initial rate plans:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialRatePlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (query: string) => {
    if (!query || query.length < 2) {
      if (!hasLoadedInitial) {
        return;
      }
      return;
    }

    setIsLoading(true);
    try {
      const ratePlans = await searchRatePlans(query);
      const ratePlanOptions: SearchSelectOption[] = ratePlans.map((plan) => ({
        value: plan.id,
        label: plan.title,
      }));
      setOptions(ratePlanOptions);
    } catch (error) {
      console.error('Error searching rate plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
      label={label || t('ratePlans.title')}
      value={value}
      onChange={(val) => onChange(String(val))}
      options={options}
      placeholder={t('ratePlans.search.placeholder')}
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

export default RatePlanSearchSelect;

