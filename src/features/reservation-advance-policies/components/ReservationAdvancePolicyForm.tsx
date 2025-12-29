import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../../../components/ui/Input';
import Label from '../../../components/ui/Label';
import Button from '../../../components/ui/Button';
import PropertySearchSelect from '../../../components/inputs/PropertySearchSelect';
import RatePlanSearchSelect from '../../../components/inputs/RatePlanSearchSelect';
import type {
  CreateReservationAdvancePolicyDto,
  UpdateReservationAdvancePolicyDto,
  ReservationAdvancePolicy,
  ChargeLogic,
  DueType,
} from '../types';

type Props = {
  initialData?: ReservationAdvancePolicy;
  onSubmit: (data: CreateReservationAdvancePolicyDto | UpdateReservationAdvancePolicyDto) => void;
  isLoading?: boolean;
};

const ReservationAdvancePolicyForm: React.FC<Props> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const { t } = useTranslation();

  const [propertyId, setPropertyId] = useState(initialData?.propertyId || '');
  const [ratePlanId, setRatePlanId] = useState<string | null>(initialData?.ratePlanId || null);
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [chargeLogic, setChargeLogic] = useState<ChargeLogic>(
    initialData?.chargeLogic || 'percent'
  );
  const [chargeValue, setChargeValue] = useState(initialData?.chargeValue?.toString() || '');
  const [dueType, setDueType] = useState<DueType>(initialData?.dueType || 'at_booking');
  const [dueDaysBeforeArrival, setDueDaysBeforeArrival] = useState(
    initialData?.dueDaysBeforeArrival?.toString() || ''
  );
  const [minNights, setMinNights] = useState(initialData?.minNights?.toString() || '');
  const [maxNights, setMaxNights] = useState(initialData?.maxNights?.toString() || '');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setPropertyId(initialData.propertyId);
      setRatePlanId(initialData.ratePlanId);
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setChargeLogic(initialData.chargeLogic);
      setChargeValue(initialData.chargeValue.toString());
      setDueType(initialData.dueType);
      setDueDaysBeforeArrival(initialData.dueDaysBeforeArrival?.toString() || '');
      setMinNights(initialData.minNights?.toString() || '');
      setMaxNights(initialData.maxNights?.toString() || '');
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!propertyId.trim()) {
      newErrors.propertyId = t('reservationAdvancePolicies.form.errors.propertyRequired');
    }

    if (!title.trim()) {
      newErrors.title = t('reservationAdvancePolicies.form.errors.titleRequired');
    }

    if (!chargeValue.trim()) {
      newErrors.chargeValue = t('reservationAdvancePolicies.form.errors.chargeValueRequired');
    } else if (parseFloat(chargeValue) < 0) {
      newErrors.chargeValue = t('reservationAdvancePolicies.form.errors.chargeValueNonNegative');
    }

    if (dueType === 'before_arrival' && dueDaysBeforeArrival.trim()) {
      const days = parseInt(dueDaysBeforeArrival, 10);
      if (isNaN(days) || days < 0) {
        newErrors.dueDaysBeforeArrival = t(
          'reservationAdvancePolicies.form.errors.dueDaysNonNegative'
        );
      }
    }

    if (minNights.trim()) {
      const min = parseInt(minNights, 10);
      if (isNaN(min) || min < 0) {
        newErrors.minNights = t('reservationAdvancePolicies.form.errors.minNightsNonNegative');
      }
    }

    if (maxNights.trim()) {
      const max = parseInt(maxNights, 10);
      if (isNaN(max) || max < 0) {
        newErrors.maxNights = t('reservationAdvancePolicies.form.errors.maxNightsNonNegative');
      }
    }

    if (minNights.trim() && maxNights.trim()) {
      const min = parseInt(minNights, 10);
      const max = parseInt(maxNights, 10);
      if (min > max) {
        newErrors.maxNights = t('reservationAdvancePolicies.form.errors.maxNightsGreaterThanMin');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const data: CreateReservationAdvancePolicyDto | UpdateReservationAdvancePolicyDto = {
      propertyId,
      ratePlanId: ratePlanId || null,
      title,
      description: description.trim() || null,
      chargeLogic,
      chargeValue: parseFloat(chargeValue),
      dueType,
      dueDaysBeforeArrival:
        dueType === 'before_arrival' && dueDaysBeforeArrival.trim()
          ? parseInt(dueDaysBeforeArrival, 10)
          : null,
      minNights: minNights.trim() ? parseInt(minNights, 10) : null,
      maxNights: maxNights.trim() ? parseInt(maxNights, 10) : null,
    };

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Property */}
      <div>
        <Label htmlFor="propertyId" required>
          {t('reservationAdvancePolicies.form.property')}
        </Label>
        <PropertySearchSelect
          value={propertyId}
          onChange={(value) => setPropertyId(value || '')}
          error={errors.propertyId}
        />
        {errors.propertyId && <p className="mt-1 text-sm text-red-600">{errors.propertyId}</p>}
      </div>

      {/* Rate Plan (optional) */}
      <div>
        <Label htmlFor="ratePlanId">{t('reservationAdvancePolicies.form.ratePlan')}</Label>
        <RatePlanSearchSelect
          value={ratePlanId || ''}
          onChange={(value) => setRatePlanId(value || null)}
          propertyId={propertyId}
          disabled={!propertyId}
        />
        <p className="mt-1 text-xs text-slate-500">
          {t('reservationAdvancePolicies.form.ratePlanOptional')}
        </p>
      </div>

      {/* Title */}
      <div>
        <Label htmlFor="title" required>
          {t('reservationAdvancePolicies.form.title')}
        </Label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          placeholder={t('reservationAdvancePolicies.form.titlePlaceholder')}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">{t('reservationAdvancePolicies.form.description')}</Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={t('reservationAdvancePolicies.form.descriptionPlaceholder')}
        />
      </div>

      {/* Charge Logic */}
      <div>
        <Label htmlFor="chargeLogic" required>
          {t('reservationAdvancePolicies.form.chargeLogic')}
        </Label>
        <select
          id="chargeLogic"
          value={chargeLogic}
          onChange={(e) => setChargeLogic(e.target.value as ChargeLogic)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="percent">{t('reservationAdvancePolicies.form.chargeLogicPercent')}</option>
          <option value="amount">{t('reservationAdvancePolicies.form.chargeLogicAmount')}</option>
          <option value="nights">{t('reservationAdvancePolicies.form.chargeLogicNights')}</option>
        </select>
      </div>

      {/* Charge Value */}
      <div>
        <Label htmlFor="chargeValue" required>
          {t('reservationAdvancePolicies.form.chargeValue')}
        </Label>
        <Input
          id="chargeValue"
          type="number"
          step="0.01"
          value={chargeValue}
          onChange={(e) => setChargeValue(e.target.value)}
          error={errors.chargeValue}
          placeholder={t('reservationAdvancePolicies.form.chargeValuePlaceholder')}
        />
        {errors.chargeValue && <p className="mt-1 text-sm text-red-600">{errors.chargeValue}</p>}
      </div>

      {/* Due Type */}
      <div>
        <Label htmlFor="dueType" required>
          {t('reservationAdvancePolicies.form.dueType')}
        </Label>
        <select
          id="dueType"
          value={dueType}
          onChange={(e) => setDueType(e.target.value as DueType)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="at_booking">{t('reservationAdvancePolicies.form.dueTypeAtBooking')}</option>
          <option value="before_arrival">
            {t('reservationAdvancePolicies.form.dueTypeBeforeArrival')}
          </option>
        </select>
      </div>

      {/* Due Days Before Arrival (conditional) */}
      {dueType === 'before_arrival' && (
        <div>
          <Label htmlFor="dueDaysBeforeArrival">
            {t('reservationAdvancePolicies.form.dueDaysBeforeArrival')}
          </Label>
          <Input
            id="dueDaysBeforeArrival"
            type="number"
            value={dueDaysBeforeArrival}
            onChange={(e) => setDueDaysBeforeArrival(e.target.value)}
            error={errors.dueDaysBeforeArrival}
            placeholder={t('reservationAdvancePolicies.form.dueDaysBeforeArrivalPlaceholder')}
          />
          {errors.dueDaysBeforeArrival && (
            <p className="mt-1 text-sm text-red-600">{errors.dueDaysBeforeArrival}</p>
          )}
        </div>
      )}

      {/* Min Nights */}
      <div>
        <Label htmlFor="minNights">{t('reservationAdvancePolicies.form.minNights')}</Label>
        <Input
          id="minNights"
          type="number"
          value={minNights}
          onChange={(e) => setMinNights(e.target.value)}
          error={errors.minNights}
          placeholder={t('reservationAdvancePolicies.form.minNightsPlaceholder')}
        />
        {errors.minNights && <p className="mt-1 text-sm text-red-600">{errors.minNights}</p>}
      </div>

      {/* Max Nights */}
      <div>
        <Label htmlFor="maxNights">{t('reservationAdvancePolicies.form.maxNights')}</Label>
        <Input
          id="maxNights"
          type="number"
          value={maxNights}
          onChange={(e) => setMaxNights(e.target.value)}
          error={errors.maxNights}
          placeholder={t('reservationAdvancePolicies.form.maxNightsPlaceholder')}
        />
        {errors.maxNights && <p className="mt-1 text-sm text-red-600">{errors.maxNights}</p>}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading
            ? t('common.saving')
            : initialData
            ? t('common.update')
            : t('common.create')}
        </Button>
      </div>
    </form>
  );
};

export default ReservationAdvancePolicyForm;

