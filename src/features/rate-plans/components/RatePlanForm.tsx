import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '@/utils/validation';
import { CURRENCY_CODES, isValidISO4217Currency } from '@/utils/constants/currencies';
import { RATE_MODES } from '@/utils/constants/rate-modes';
import PropertySearchSelect from '@/components/inputs/PropertySearchSelect';
import RoomTypeSearchSelect from '@/components/inputs/RoomTypeSearchSelect';
import RatePlanSearchSelect from '@/components/inputs/RatePlanSearchSelect';
import TaxSetSearchSelect from '@/components/inputs/TaxSetSearchSelect';
import { usePropertyById } from '@/features/properties/hooks/usePropertyById';
import { useRoomTypeById } from '@/features/room-types/hooks/useRoomTypeById';
import { useTaxSet } from '@/features/tax-sets/hooks/useTaxSet';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Label from '../../../components/ui/Label';
import { useCreateRatePlan } from '../hooks/useCreateRatePlan';
import { useUpdateRatePlan } from '../hooks/useUpdateRatePlan';
import { useToast } from '@/context/ToastContext';
import type { RatePlan } from '../types';

interface RatePlanFormProps {
  ratePlan?: RatePlan;
  initialPropertyId?: string;
  initialRoomTypeId?: string;
  initialTaxSetId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const RatePlanForm: React.FC<RatePlanFormProps> = ({
  ratePlan,
  initialPropertyId,
  initialRoomTypeId,
  initialTaxSetId,
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslation();
  const isEditMode = !!ratePlan;
  const createMutation = useCreateRatePlan();
  const updateMutation = useUpdateRatePlan();

  // Basic Information
  const [title, setTitle] = useState(ratePlan?.title || '');
  const [propertyId, setPropertyId] = useState(ratePlan?.propertyId || initialPropertyId || '');
  const [roomTypeId, setRoomTypeId] = useState(ratePlan?.roomTypeId || initialRoomTypeId || '');
  const [taxSetId, setTaxSetId] = useState(ratePlan?.taxSetId || initialTaxSetId || '');
  const [parentRatePlanId, setParentRatePlanId] = useState(ratePlan?.parentRatePlanId || '');
  const [currency, setCurrency] = useState(ratePlan?.currency || '');
  const [sellMode, setSellMode] = useState(ratePlan?.sellMode || '');
  const [rateMode, setRateMode] = useState(ratePlan?.rateMode || '');

  // Fees
  const [childrenFee, setChildrenFee] = useState(ratePlan?.childrenFee?.toString() || '0');
  const [infantFee, setInfantFee] = useState(ratePlan?.infantFee?.toString() || '0');

  // Inheritance Flags
  const [inheritRate, setInheritRate] = useState(ratePlan?.inheritRate || false);
  const [inheritClosedToArrival, setInheritClosedToArrival] = useState(ratePlan?.inheritClosedToArrival || false);
  const [inheritClosedToDeparture, setInheritClosedToDeparture] = useState(ratePlan?.inheritClosedToDeparture || false);
  const [inheritStopSell, setInheritStopSell] = useState(ratePlan?.inheritStopSell || false);
  const [inheritMinStayArrival, setInheritMinStayArrival] = useState(ratePlan?.inheritMinStayArrival || false);
  const [inheritMinStayThrough, setInheritMinStayThrough] = useState(ratePlan?.inheritMinStayThrough || false);
  const [inheritMaxStay, setInheritMaxStay] = useState(ratePlan?.inheritMaxStay || false);
  const [inheritMaxSell, setInheritMaxSell] = useState(ratePlan?.inheritMaxSell || false);
  const [inheritMaxAvailability, setInheritMaxAvailability] = useState(ratePlan?.inheritMaxAvailability || false);
  const [inheritAvailabilityOffset, setInheritAvailabilityOffset] = useState(ratePlan?.inheritAvailabilityOffset || false);

  // Fetch entity information for display
  const currentPropertyId = ratePlan?.propertyId || initialPropertyId || '';
  const currentRoomTypeId = ratePlan?.roomTypeId || initialRoomTypeId || '';
  const currentTaxSetId = ratePlan?.taxSetId || initialTaxSetId || '';
  const { data: propertyData } = usePropertyById(currentPropertyId);
  const { data: roomTypeData } = useRoomTypeById(currentRoomTypeId, !!currentRoomTypeId);
  const { data: taxSetData } = useTaxSet(currentTaxSetId);

  // Validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Clear roomTypeId and taxSetId when propertyId changes
  useEffect(() => {
    if (propertyId && !ratePlan) {
      setRoomTypeId('');
      if (!initialTaxSetId) {
        setTaxSetId('');
      }
    }
  }, [propertyId, ratePlan, initialTaxSetId]);

  useEffect(() => {
    if (ratePlan) {
      setTitle(ratePlan.title || '');
      setPropertyId(ratePlan.propertyId || '');
      setRoomTypeId(ratePlan.roomTypeId || '');
      setTaxSetId(ratePlan.taxSetId || '');
      setParentRatePlanId(ratePlan.parentRatePlanId || '');
      setCurrency(ratePlan.currency || '');
      setSellMode(ratePlan.sellMode || '');
      setRateMode(ratePlan.rateMode || '');
      setChildrenFee(ratePlan.childrenFee?.toString() || '0');
      setInfantFee(ratePlan.infantFee?.toString() || '0');
      setInheritRate(ratePlan.inheritRate || false);
      setInheritClosedToArrival(ratePlan.inheritClosedToArrival || false);
      setInheritClosedToDeparture(ratePlan.inheritClosedToDeparture || false);
      setInheritStopSell(ratePlan.inheritStopSell || false);
      setInheritMinStayArrival(ratePlan.inheritMinStayArrival || false);
      setInheritMinStayThrough(ratePlan.inheritMinStayThrough || false);
      setInheritMaxStay(ratePlan.inheritMaxStay || false);
      setInheritMaxSell(ratePlan.inheritMaxSell || false);
      setInheritMaxAvailability(ratePlan.inheritMaxAvailability || false);
      setInheritAvailabilityOffset(ratePlan.inheritAvailabilityOffset || false);
    } else {
      if (initialPropertyId) {
        setPropertyId(initialPropertyId);
      }
      if (initialRoomTypeId) {
        setRoomTypeId(initialRoomTypeId);
      }
      if (initialTaxSetId) {
        setTaxSetId(initialTaxSetId);
      }
    }
  }, [ratePlan, initialPropertyId, initialRoomTypeId, initialTaxSetId]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = t('ratePlans.validation.titleRequired');
    }

    if (!propertyId.trim()) {
      errors.propertyId = t('ratePlans.validation.propertyRequired');
    }

    if (!roomTypeId.trim()) {
      errors.roomTypeId = t('ratePlans.validation.roomTypeRequired');
    }

    if (!taxSetId.trim()) {
      errors.taxSetId = t('ratePlans.validation.taxSetRequired');
    }

    if (!currency.trim()) {
      errors.currency = t('ratePlans.validation.currencyRequired');
    } else if (!isValidISO4217Currency(currency.trim())) {
      errors.currency = t('ratePlans.validation.currencyInvalid');
    }

    if (!sellMode.trim()) {
      errors.sellMode = t('ratePlans.validation.sellModeRequired');
    }

    if (!rateMode.trim()) {
      errors.rateMode = t('ratePlans.validation.rateModeRequired');
    }

    const childrenFeeNum = parseFloat(childrenFee);
    if (isNaN(childrenFeeNum) || childrenFeeNum < 0) {
      errors.childrenFee = t('ratePlans.validation.childrenFeeInvalid');
    }

    const infantFeeNum = parseFloat(infantFee);
    if (isNaN(infantFeeNum) || infantFeeNum < 0) {
      errors.infantFee = t('ratePlans.validation.infantFeeInvalid');
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
      propertyId: propertyId.trim(),
      roomTypeId: roomTypeId.trim(),
      taxSetId: taxSetId.trim(),
      currency: currency.trim().toUpperCase(),
      sellMode: sellMode.trim(),
      rateMode: rateMode.trim(),
      childrenFee: parseFloat(childrenFee),
      infantFee: parseFloat(infantFee),
      ...(parentRatePlanId && { parentRatePlanId: parentRatePlanId.trim() }),
      inheritRate,
      inheritClosedToArrival,
      inheritClosedToDeparture,
      inheritStopSell,
      inheritMinStayArrival,
      inheritMinStayThrough,
      inheritMaxStay,
      inheritMaxSell,
      inheritMaxAvailability,
      inheritAvailabilityOffset,
    };

    try {
      if (isEditMode && ratePlan) {
        await updateMutation.mutateAsync({ id: ratePlan.id, payload: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      // Reset form
      setTitle('');
      setPropertyId(initialPropertyId || '');
      setRoomTypeId(initialRoomTypeId || '');
      setTaxSetId(initialTaxSetId || '');
      setParentRatePlanId('');
      setCurrency('');
      setSellMode('');
      setRateMode('');
      setChildrenFee('0');
      setInfantFee('0');
      setInheritRate(false);
      setInheritClosedToArrival(false);
      setInheritClosedToDeparture(false);
      setInheritStopSell(false);
      setInheritMinStayArrival(false);
      setInheritMinStayThrough(false);
      setInheritMaxStay(false);
      setInheritMaxSell(false);
      setInheritMaxAvailability(false);
      setInheritAvailabilityOffset(false);
      setValidationErrors({});
      onSuccess?.();
      if (isEditMode) {
        showSuccess(t('ratePlans.updateSuccess', { defaultValue: 'Rate plan updated successfully!' }));
      } else {
        showSuccess(t('ratePlans.createSuccess', { defaultValue: 'Rate plan created successfully!' }));
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
      {/* Property, Room Type, and Tax Set Information Banners */}
      {(propertyData || roomTypeData || taxSetData) && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {propertyData && (
            <div className="bg-brand-50 border border-brand-200 rounded-lg p-3">
              <p className="text-sm font-semibold text-brand-900">
                {t('ratePlans.form.propertyOfRatePlan')}: <span className="font-bold text-brand-700">{propertyData.title}</span>
              </p>
            </div>
          )}
          {roomTypeData && (
            <div className="bg-brand-50 border border-brand-200 rounded-lg p-3">
              <p className="text-sm font-semibold text-brand-900">
                {t('ratePlans.form.roomTypeOfRatePlan')}: <span className="font-bold text-brand-700">{roomTypeData.title}</span>
              </p>
            </div>
          )}
          {taxSetData && (
            <div className="bg-brand-50 border border-brand-200 rounded-lg p-3">
              <p className="text-sm font-semibold text-brand-900">
                {t('ratePlans.form.taxSetOfRatePlan')}: <span className="font-bold text-brand-700">{taxSetData.title}</span>
              </p>
            </div>
          )}
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
        <h4 className="text-sm font-semibold text-slate-900">{t('ratePlans.form.basicInfo')}</h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-3 space-y-1.5">
            <Label htmlFor="title" className="text-sm font-medium">
              {t('ratePlans.form.title')} <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('ratePlans.form.titlePlaceholder')}
              error={validationErrors.title}
              disabled={isLoading}
              className="text-sm"
            />
          </div>

          {/* Property Selector (only if not preselected and not in edit mode with existing value) */}
          {!initialPropertyId && !(isEditMode && ratePlan?.propertyId) && (
            <div className="space-y-1.5">
              <PropertySearchSelect
                label={`${t('ratePlans.form.property')} *`}
                value={propertyId}
                onChange={setPropertyId}
                error={validationErrors.propertyId}
                disabled={isLoading}
              />
            </div>
          )}

          {/* Room Type Selector (only if not preselected and not in edit mode with existing value) */}
          {!initialRoomTypeId && !(isEditMode && ratePlan?.roomTypeId) && (
            <div className="space-y-1.5">
              <RoomTypeSearchSelect
                label={`${t('ratePlans.form.roomType')} *`}
                value={roomTypeId}
                onChange={setRoomTypeId}
                propertyId={propertyId}
                disabled={!propertyId || isLoading}
                error={validationErrors.roomTypeId}
              />
            </div>
          )}

          {/* Tax Set Selector (only if not preselected and not in edit mode with existing value) */}
          {!initialTaxSetId && !(isEditMode && ratePlan?.taxSetId) && (
            <div className="space-y-1.5">
              <TaxSetSearchSelect
                label={`${t('ratePlans.form.taxSet')} *`}
                value={taxSetId}
                onChange={setTaxSetId}
                propertyId={propertyId}
                disabled={!propertyId || isLoading}
                error={validationErrors.taxSetId}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="currency" className="text-sm font-medium">
              {t('ratePlans.form.currency')} <span className="text-red-500">*</span>
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
              <option value="">{t('ratePlans.form.selectCurrency')}</option>
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
            <Label htmlFor="sellMode" className="text-sm font-medium">
              {t('ratePlans.form.sellMode')} <span className="text-red-500">*</span>
            </Label>
            <select
              id="sellMode"
              value={sellMode}
              onChange={(e) => setSellMode(e.target.value)}
              disabled={isLoading}
              className={`w-full rounded-lg border text-sm px-3 py-2 ${
                validationErrors.sellMode
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-slate-300 focus:border-brand-500 focus:ring-brand-500'
              } focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-500`}
            >
              <option value="">{t('ratePlans.form.selectSellMode')}</option>
              <option value="per_room">{t('ratePlans.form.perRoom')}</option>
              <option value="per_person">{t('ratePlans.form.perPerson')}</option>
            </select>
            {validationErrors.sellMode && (
              <p className="text-xs text-red-600">{validationErrors.sellMode}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rateMode" className="text-sm font-medium">
              {t('ratePlans.form.rateMode')} <span className="text-red-500">*</span>
            </Label>
            <select
              id="rateMode"
              value={rateMode}
              onChange={(e) => setRateMode(e.target.value)}
              disabled={isLoading}
              className={`w-full rounded-lg border text-sm px-3 py-2 ${
                validationErrors.rateMode
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-slate-300 focus:border-brand-500 focus:ring-brand-500'
              } focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-500`}
            >
              <option value="">{t('ratePlans.form.selectRateMode')}</option>
              {RATE_MODES.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
            {validationErrors.rateMode && (
              <p className="text-xs text-red-600">{validationErrors.rateMode}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="childrenFee" className="text-sm font-medium">
              {t('ratePlans.form.childrenFee')} <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              id="childrenFee"
              value={childrenFee}
              onChange={(e) => setChildrenFee(e.target.value)}
              min="0"
              step="0.01"
              error={validationErrors.childrenFee}
              disabled={isLoading}
              className="text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="infantFee" className="text-sm font-medium">
              {t('ratePlans.form.infantFee')} <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              id="infantFee"
              value={infantFee}
              onChange={(e) => setInfantFee(e.target.value)}
              min="0"
              step="0.01"
              error={validationErrors.infantFee}
              disabled={isLoading}
              className="text-sm"
            />
          </div>
        </div>
      </div>

      {/* Inheritance Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-900">{t('ratePlans.form.inheritance')}</h4>
        <div className="space-y-1.5">
          <RatePlanSearchSelect
            label={t('ratePlans.form.parentRatePlan')}
            value={parentRatePlanId}
            onChange={setParentRatePlanId}
            disabled={isLoading}
          />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { key: 'inheritRate', value: inheritRate, setter: setInheritRate, label: 'Rate' },
            { key: 'inheritClosedToArrival', value: inheritClosedToArrival, setter: setInheritClosedToArrival, label: 'Closed to Arrival' },
            { key: 'inheritClosedToDeparture', value: inheritClosedToDeparture, setter: setInheritClosedToDeparture, label: 'Closed to Departure' },
            { key: 'inheritStopSell', value: inheritStopSell, setter: setInheritStopSell, label: 'Stop Sell' },
            { key: 'inheritMinStayArrival', value: inheritMinStayArrival, setter: setInheritMinStayArrival, label: 'Min Stay Arrival' },
            { key: 'inheritMinStayThrough', value: inheritMinStayThrough, setter: setInheritMinStayThrough, label: 'Min Stay Through' },
            { key: 'inheritMaxStay', value: inheritMaxStay, setter: setInheritMaxStay, label: 'Max Stay' },
            { key: 'inheritMaxSell', value: inheritMaxSell, setter: setInheritMaxSell, label: 'Max Sell' },
            { key: 'inheritMaxAvailability', value: inheritMaxAvailability, setter: setInheritMaxAvailability, label: 'Max Availability' },
            { key: 'inheritAvailabilityOffset', value: inheritAvailabilityOffset, setter: setInheritAvailabilityOffset, label: 'Availability Offset' },
          ].map(({ key, value, setter, label }) => (
            <label key={key} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setter(e.target.checked)}
                disabled={isLoading}
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-slate-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

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

export default RatePlanForm;
