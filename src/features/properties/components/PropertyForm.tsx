import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage, isValidUrl } from '@/utils/validation';
import { CURRENCY_CODES, isValidISO4217Currency } from '@/utils/constants/currencies';
import { COUNTRY_CODES, isValidISO31661Country } from '@/utils/constants/countries';
import { COMMON_TIMEZONES, PROPERTY_TYPES } from '@/utils/constants/timezones';
import { useAppContext } from '@/hooks/useAppContext';
import { useGroup } from '@/features/groups/hooks/useGroup';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Label from '../../../components/ui/Label';
import { useCreateProperty } from '../hooks/useCreateProperty';
import { useUpdateProperty } from '../hooks/useUpdateProperty';
import { useToast } from '@/context/ToastContext';
import type { Property } from '../types';

interface PropertyFormProps {
  property?: Property;
  initialGroupId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PropertyForm: React.FC<PropertyFormProps> = ({
  property,
  initialGroupId,
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const { groupId: contextGroupId, selectedGroup } = useAppContext();
  const isEditMode = !!property;
  const createMutation = useCreateProperty();
  const updateMutation = useUpdateProperty();
  
  // Use context groupId if available, otherwise use initialGroupId prop
  const effectiveGroupId = contextGroupId || initialGroupId;
  
  // Fetch group information for display
  const currentGroupId = property?.groupId || effectiveGroupId || '';
  const { data: groupData } = useGroup(currentGroupId, { enabled: !!currentGroupId });
  const displayGroup = groupData || selectedGroup;

  // Basic Information
  const [title, setTitle] = useState(property?.title || '');
  const [currency, setCurrency] = useState(property?.currency || '');
  const [email, setEmail] = useState(property?.email || '');
  const [phone, setPhone] = useState(property?.phone || '');
  const [propertyType, setPropertyType] = useState(property?.propertyType || '');

  // Location Information
  const [country, setCountry] = useState(property?.country || '');
  const [state, setState] = useState(property?.state || '');
  const [city, setCity] = useState(property?.city || '');
  const [address, setAddress] = useState(property?.address || '');
  const [zipCode, setZipCode] = useState(property?.zipCode || '');

  // Coordinates & Timezone
  const [longitude, setLongitude] = useState(property?.longitude?.toString() || '');
  const [latitude, setLatitude] = useState(property?.latitude?.toString() || '');

  // Handle numeric input for coordinates
  const handleCoordinateChange = (
    value: string,
    setter: (value: string) => void
  ) => {
    let cleaned = value.replace(/[^\d.-]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
    if (cleaned.includes('-')) {
      cleaned = cleaned.replace(/-/g, '');
      if (value.trim().startsWith('-')) {
        cleaned = '-' + cleaned;
      }
    }
    setter(cleaned);
  };
  const [timezone, setTimezone] = useState(property?.timezone || '');

  // Additional Information
  const [logoUrl, setLogoUrl] = useState(property?.logoUrl || '');
  const [website, setWebsite] = useState(property?.website || '');
  const [groupId, setGroupId] = useState(property?.groupId || effectiveGroupId || '');
  
  // Helper function to get boolean value from property (handles both camelCase and snake_case)
  const getPropertyBooleanValue = (prop: Property | undefined, camelKey: string, snakeKey: string): boolean => {
    if (!prop) return false;
    const camelValue = (prop as any)[camelKey];
    const snakeValue = (prop as any)[snakeKey];
    const value = camelValue !== undefined ? camelValue : snakeValue;
    return value === true || value === 1 || value === '1' || value === 'true';
  };
  
  // Channex Settings - Handle both camelCase and snake_case from backend
  const [isActive, setIsActive] = useState(
    getPropertyBooleanValue(property, 'isActive', 'is_active')
  );
  const [sendData, setSendData] = useState(
    getPropertyBooleanValue(property, 'sendData', 'send_data')
  );
  
  // Update groupId when context changes (for create mode)
  useEffect(() => {
    if (!isEditMode && effectiveGroupId && !property) {
      setGroupId(effectiveGroupId);
    }
  }, [effectiveGroupId, isEditMode, property]);

  // Validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (property) {
      setTitle(property.title || '');
      setCurrency(property.currency || '');
      setEmail(property.email || '');
      setPhone(property.phone || '');
      setPropertyType(property.propertyType || '');
      setCountry(property.country || '');
      setState(property.state || '');
      setCity(property.city || '');
      setAddress(property.address || '');
      setZipCode(property.zipCode || '');
      setLongitude(property.longitude?.toString() || '');
      setLatitude(property.latitude?.toString() || '');
      setTimezone(property.timezone || '');
      setLogoUrl(property.logoUrl || '');
      setWebsite(property.website || '');
      setGroupId(property.groupId || '');
      setIsActive(getPropertyBooleanValue(property, 'isActive', 'is_active'));
      setSendData(getPropertyBooleanValue(property, 'sendData', 'send_data'));
    }
  }, [property]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = t('properties.validation.titleRequired');
    } else if (title.length > 255) {
      errors.title = t('properties.validation.titleTooLong');
    }

    if (!currency.trim()) {
      errors.currency = t('properties.validation.currencyRequired');
    } else if (!isValidISO4217Currency(currency.trim())) {
      errors.currency = t('properties.validation.currencyInvalid');
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = t('properties.validation.emailInvalid');
    }

    if (phone && phone.length > 50) {
      errors.phone = t('properties.validation.phoneTooLong');
    }

    if (country && !isValidISO31661Country(country.trim())) {
      errors.country = t('properties.validation.countryInvalid');
    }

    if (state && state.length > 100) {
      errors.state = t('properties.validation.stateTooLong');
    }

    if (city && city.length > 100) {
      errors.city = t('properties.validation.cityTooLong');
    }

    if (address && address.length > 255) {
      errors.address = t('properties.validation.addressTooLong');
    }

    if (zipCode && zipCode.length > 20) {
      errors.zipCode = t('properties.validation.zipCodeTooLong');
    }

    if (longitude) {
      const longValue = parseFloat(longitude);
      if (isNaN(longValue) || longValue < -180 || longValue > 180) {
        errors.longitude = t('properties.validation.longitudeInvalid');
      }
    }

    if (latitude) {
      const latValue = parseFloat(latitude);
      if (isNaN(latValue) || latValue < -90 || latValue > 90) {
        errors.latitude = t('properties.validation.latitudeInvalid');
      }
    }

    if (timezone && timezone.length > 64) {
      errors.timezone = t('properties.validation.timezoneTooLong');
    }

    if (propertyType && propertyType.length > 50) {
      errors.propertyType = t('properties.validation.propertyTypeTooLong');
    }

    if (logoUrl && (!isValidUrl(logoUrl) || logoUrl.length > 255)) {
      errors.logoUrl = t('properties.validation.logoUrlInvalid');
    }

    if (website && (!isValidUrl(website) || website.length > 255)) {
      errors.website = t('properties.validation.websiteInvalid');
    }

    if (groupId) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(groupId)) {
        errors.groupId = t('properties.validation.groupIdInvalid');
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formData: any = {
      title: title.trim(),
      currency: currency.trim().toUpperCase(),
      ...(email && { email: email.trim() }),
      ...(phone && { phone: phone.trim() }),
      ...(propertyType && { propertyType: propertyType.trim() }),
      ...(country && { country: country.trim().toUpperCase() }),
      ...(state && { state: state.trim() }),
      ...(city && { city: city.trim() }),
      ...(address && { address: address.trim() }),
      ...(zipCode && { zipCode: zipCode.trim() }),
      ...(longitude && { longitude: parseFloat(longitude) }),
      ...(latitude && { latitude: parseFloat(latitude) }),
      ...(timezone && { timezone: timezone.trim() }),
      ...(logoUrl && { logoUrl: logoUrl.trim() }),
      ...(website && { website: website.trim() }),
      ...(groupId && { groupId: groupId.trim() }),
      // Always include isActive and sendData (even if false) so backend can update them
      isActive: isActive,
      sendData: sendData,
    };

    console.log('📤 Submitting property form data:', {
      isEditMode,
      propertyId: property?.id,
      isActive,
      sendData,
      formDataKeys: Object.keys(formData)
    });

    try {
      if (isEditMode && property) {
        const updatedProperty = await updateMutation.mutateAsync({ id: property.id, payload: formData });
        // In edit mode, update form fields with the returned property data (don't reset to empty)
        // This ensures checkboxes reflect the saved values
        if (updatedProperty) {
          setIsActive(getPropertyBooleanValue(updatedProperty, 'isActive', 'is_active'));
          setSendData(getPropertyBooleanValue(updatedProperty, 'sendData', 'send_data'));
        }
        setValidationErrors({});
        onSuccess?.();
      } else {
        await createMutation.mutateAsync(formData);
        // Reset form only in create mode
      setTitle('');
      setCurrency('');
      setEmail('');
      setPhone('');
      setPropertyType('');
      setCountry('');
      setState('');
      setCity('');
      setAddress('');
      setZipCode('');
      setLongitude('');
      setLatitude('');
      setTimezone('');
      setLogoUrl('');
      setWebsite('');
      setGroupId(effectiveGroupId || '');
        setIsActive(false);
        setSendData(false);
      setValidationErrors({});
      onSuccess?.();
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || t('common.error', { defaultValue: 'An error occurred' });
      showError(errorMessage);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Group Information Banner */}
      {displayGroup && (
        <div className="bg-brand-50 border border-brand-200 rounded-lg p-3 mb-2">
          <p className="text-sm font-semibold text-brand-900">
            {t('properties.form.groupOfProperty')}: <span className="font-bold text-brand-700">{displayGroup.title}</span>
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
          <p className="font-medium">{t('common.error')}</p>
          <p className="text-xs mt-1">{getErrorMessage(error)}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-900">{t('properties.form.basicInfo')}</h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="title" className="text-sm font-medium">
              {t('properties.form.title')} <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('properties.form.titlePlaceholder')}
              error={validationErrors.title}
              disabled={isLoading}
              className="text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="currency" className="text-sm font-medium">
              {t('properties.form.currency')} <span className="text-red-500">*</span>
            </Label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              disabled={isLoading}
              className={`w-full rounded-lg border text-sm px-3 py-2 ${
                validationErrors.currency
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-slate-300 focus:border-brand-500 focus:ring-brand-500'
              } focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-500`}
            >
              <option value="">{t('properties.form.selectCurrency')}</option>
              {CURRENCY_CODES.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.code} - {curr.name}
                </option>
              ))}
            </select>
            {validationErrors.currency && (
              <p className="text-xs text-red-600">{validationErrors.currency}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="propertyType" className="text-sm font-medium">
              {t('properties.form.propertyType')}
            </Label>
            <select
              id="propertyType"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-lg border border-slate-300 focus:border-brand-500 focus:ring-brand-500 px-3 py-2 text-sm focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-500"
            >
              <option value="">{t('properties.form.selectPropertyType')}</option>
              {PROPERTY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">
              {t('properties.form.email')}
            </Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('properties.form.emailPlaceholder')}
              error={validationErrors.email}
              disabled={isLoading}
              className="text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm font-medium">
              {t('properties.form.phone')}
            </Label>
            <Input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('properties.form.phonePlaceholder')}
              maxLength={50}
              error={validationErrors.phone}
              disabled={isLoading}
              className="text-sm"
            />
          </div>
        </div>
      </div>

      {/* Location Information */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-900">{t('properties.form.locationInfo')}</h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="country" className="text-sm font-medium">
              {t('properties.form.country')}
            </Label>
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              disabled={isLoading}
              className={`w-full rounded-lg border text-sm px-3 py-2 ${
                validationErrors.country
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-slate-300 focus:border-brand-500 focus:ring-brand-500'
              } focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-500`}
            >
              <option value="">{t('properties.form.selectCountry')}</option>
              {COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
            {validationErrors.country && (
              <p className="text-xs text-red-600">{validationErrors.country}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="state" className="text-sm font-medium">
              {t('properties.form.state')}
            </Label>
            <Input
              type="text"
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder={t('properties.form.statePlaceholder')}
              maxLength={100}
              error={validationErrors.state}
              disabled={isLoading}
              className="text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="city" className="text-sm font-medium">
              {t('properties.form.city')}
            </Label>
            <Input
              type="text"
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={t('properties.form.cityPlaceholder')}
              maxLength={100}
              error={validationErrors.city}
              disabled={isLoading}
              className="text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="zipCode" className="text-sm font-medium">
              {t('properties.form.zipCode')}
            </Label>
            <Input
              type="text"
              id="zipCode"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder={t('properties.form.zipCodePlaceholder')}
              maxLength={20}
              error={validationErrors.zipCode}
              disabled={isLoading}
              className="text-sm"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="address" className="text-sm font-medium">
              {t('properties.form.address')}
            </Label>
            <Input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t('properties.form.addressPlaceholder')}
              maxLength={255}
              error={validationErrors.address}
              disabled={isLoading}
              className="text-sm"
            />
          </div>
        </div>
      </div>

      {/* Coordinates & Timezone */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-900">{t('properties.form.coordinatesInfo')}</h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="longitude" className="text-sm font-medium">
              {t('properties.form.longitude')}
            </Label>
            <Input
              type="text"
              id="longitude"
              inputMode="decimal"
              value={longitude}
              onChange={(e) => handleCoordinateChange(e.target.value, setLongitude)}
              placeholder="-118.2437"
              error={validationErrors.longitude}
              disabled={isLoading}
              className="text-sm"
            />
            <p className="text-xs text-slate-500">{t('properties.form.longitudeRange')}</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="latitude" className="text-sm font-medium">
              {t('properties.form.latitude')}
            </Label>
            <Input
              type="text"
              id="latitude"
              inputMode="decimal"
              value={latitude}
              onChange={(e) => handleCoordinateChange(e.target.value, setLatitude)}
              placeholder="34.0522"
              error={validationErrors.latitude}
              disabled={isLoading}
              className="text-sm"
            />
            <p className="text-xs text-slate-500">{t('properties.form.latitudeRange')}</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="timezone" className="text-sm font-medium">
              {t('properties.form.timezone')}
            </Label>
            <select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              disabled={isLoading}
              className={`w-full rounded-lg border text-sm px-3 py-2 ${
                validationErrors.timezone
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-slate-300 focus:border-brand-500 focus:ring-brand-500'
              } focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-500`}
            >
              <option value="">{t('properties.form.selectTimezone')}</option>
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
            {validationErrors.timezone && (
              <p className="text-xs text-red-600">{validationErrors.timezone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-900">{t('properties.form.additionalInfo')}</h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="logoUrl" className="text-sm font-medium">
              {t('properties.form.logoUrl')}
            </Label>
            <Input
              type="url"
              id="logoUrl"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              maxLength={255}
              error={validationErrors.logoUrl}
              disabled={isLoading}
              className="text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="website" className="text-sm font-medium">
              {t('properties.form.website')}
            </Label>
            <Input
              type="url"
              id="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
              maxLength={255}
              error={validationErrors.website}
              disabled={isLoading}
              className="text-sm"
            />
          </div>

          {/* Hidden groupId field - kept for form submission but not visible to user */}
          <input type="hidden" id="groupId" value={groupId} />
        </div>
      </div>

      {/* Channex Settings */}
      {isEditMode && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-900">{t('properties.form.channexSettings', { defaultValue: 'Channex Settings' })}</h4>
          <div className="space-y-2 bg-slate-50 p-3 rounded-lg">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                disabled={isLoading}
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-slate-700">
                {t('properties.form.isActive', { defaultValue: 'Property is active' })}
                <span className="text-xs text-slate-500 ml-1">
                  ({t('properties.form.isActiveHelp', { defaultValue: 'Required for Channex sync' })})
                </span>
              </span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sendData}
                onChange={(e) => setSendData(e.target.checked)}
                disabled={isLoading}
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-slate-700">
                {t('properties.form.sendData', { defaultValue: 'Send data to Channex' })}
                <span className="text-xs text-slate-500 ml-1">
                  ({t('properties.form.sendDataHelp', { defaultValue: 'Required for Channex sync' })})
                </span>
              </span>
            </label>
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button
          type="submit"
          disabled={isLoading}
          isLoading={isLoading}
          className="flex-1"
        >
          {isEditMode ? t('common.update') : t('common.create')}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={isLoading}
          >
            {t('common.cancel')}
          </Button>
        )}
      </div>
    </form>
  );
};

export default PropertyForm;
