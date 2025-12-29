import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../../../components/ui/Input';
import Label from '../../../components/ui/Label';
import Button from '../../../components/ui/Button';
import PropertySearchSelect from '../../../components/inputs/PropertySearchSelect';
import RatePlanSearchSelect from '../../../components/inputs/RatePlanSearchSelect';
import type {
  CreateReservationCancellationPolicyDto,
  UpdateReservationCancellationPolicyDto,
  ReservationCancellationPolicy,
  PenaltyLogic,
  NoShowPenaltyLogic,
} from '../types';

type Props = {
  initialData?: ReservationCancellationPolicy;
  onSubmit: (
    data: CreateReservationCancellationPolicyDto | UpdateReservationCancellationPolicyDto
  ) => void;
  isLoading?: boolean;
};

const ReservationCancellationPolicyForm: React.FC<Props> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const { t } = useTranslation();

  const [propertyId, setPropertyId] = useState(initialData?.propertyId || '');
  const [ratePlanId, setRatePlanId] = useState<string | null>(initialData?.ratePlanId || null);
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [isRefundable, setIsRefundable] = useState(initialData?.isRefundable ?? true);
  const [freeCancellationDays, setFreeCancellationDays] = useState(
    initialData?.freeCancellationDays?.toString() || ''
  );
  const [penaltyLogic, setPenaltyLogic] = useState<PenaltyLogic>(
    initialData?.penaltyLogic || 'percent'
  );
  const [penaltyValue, setPenaltyValue] = useState(initialData?.penaltyValue?.toString() || '');
  const [noShowPenaltyLogic, setNoShowPenaltyLogic] = useState<NoShowPenaltyLogic | null>(
    initialData?.noShowPenaltyLogic || null
  );
  const [noShowPenaltyValue, setNoShowPenaltyValue] = useState(
    initialData?.noShowPenaltyValue?.toString() || ''
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
      setIsRefundable(initialData.isRefundable);
      setFreeCancellationDays(initialData.freeCancellationDays?.toString() || '');
      setPenaltyLogic(initialData.penaltyLogic);
      setPenaltyValue(initialData.penaltyValue.toString());
      setNoShowPenaltyLogic(initialData.noShowPenaltyLogic);
      setNoShowPenaltyValue(initialData.noShowPenaltyValue?.toString() || '');
      setMinNights(initialData.minNights?.toString() || '');
      setMaxNights(initialData.maxNights?.toString() || '');
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!propertyId.trim()) {
      newErrors.propertyId = t('reservationCancellationPolicies.form.errors.propertyRequired');
    }

    if (!title.trim()) {
      newErrors.title = t('reservationCancellationPolicies.form.errors.titleRequired');
    }

    if (!penaltyValue.trim()) {
      newErrors.penaltyValue = t('reservationCancellationPolicies.form.errors.penaltyValueRequired');
    } else if (parseFloat(penaltyValue) < 0) {
      newErrors.penaltyValue = t(
        'reservationCancellationPolicies.form.errors.penaltyValueNonNegative'
      );
    }

    if (freeCancellationDays.trim()) {
      const days = parseInt(freeCancellationDays, 10);
      if (isNaN(days) || days < 0) {
        newErrors.freeCancellationDays = t(
          'reservationCancellationPolicies.form.errors.freeCancellationDaysNonNegative'
        );
      }
    }

    if (noShowPenaltyValue.trim()) {
      const value = parseFloat(noShowPenaltyValue);
      if (isNaN(value) || value < 0) {
        newErrors.noShowPenaltyValue = t(
          'reservationCancellationPolicies.form.errors.noShowPenaltyValueNonNegative'
        );
      }
    }

    if (minNights.trim()) {
      const min = parseInt(minNights, 10);
      if (isNaN(min) || min < 0) {
        newErrors.minNights = t('reservationCancellationPolicies.form.errors.minNightsNonNegative');
      }
    }

    if (maxNights.trim()) {
      const max = parseInt(maxNights, 10);
      if (isNaN(max) || max < 0) {
        newErrors.maxNights = t('reservationCancellationPolicies.form.errors.maxNightsNonNegative');
      }
    }

    if (minNights.trim() && maxNights.trim()) {
      const min = parseInt(minNights, 10);
      const max = parseInt(maxNights, 10);
      if (min > max) {
        newErrors.maxNights = t(
          'reservationCancellationPolicies.form.errors.maxNightsGreaterThanMin'
        );
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

    const data: CreateReservationCancellationPolicyDto | UpdateReservationCancellationPolicyDto = {
      propertyId,
      ratePlanId: ratePlanId || null,
      title,
      description: description.trim() || null,
      isRefundable,
      freeCancellationDays: freeCancellationDays.trim()
        ? parseInt(freeCancellationDays, 10)
        : null,
      penaltyLogic,
      penaltyValue: parseFloat(penaltyValue),
      noShowPenaltyLogic: noShowPenaltyLogic || null,
      noShowPenaltyValue: noShowPenaltyValue.trim() ? parseFloat(noShowPenaltyValue) : null,
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
          {t('reservationCancellationPolicies.form.property')}
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
        <Label htmlFor="ratePlanId">{t('reservationCancellationPolicies.form.ratePlan')}</Label>
        <RatePlanSearchSelect
          value={ratePlanId || ''}
          onChange={(value) => setRatePlanId(value || null)}
          propertyId={propertyId}
          disabled={!propertyId}
        />
        <p className="mt-1 text-xs text-slate-500">
          {t('reservationCancellationPolicies.form.ratePlanOptional')}
        </p>
      </div>

      {/* Title */}
      <div>
        <Label htmlFor="title" required>
          {t('reservationCancellationPolicies.form.title')}
        </Label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          placeholder={t('reservationCancellationPolicies.form.titlePlaceholder')}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">{t('reservationCancellationPolicies.form.description')}</Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={t('reservationCancellationPolicies.form.descriptionPlaceholder')}
        />
      </div>

      {/* Is Refundable */}
      <div className="flex items-center gap-3">
        <input
          id="isRefundable"
          type="checkbox"
          checked={isRefundable}
          onChange={(e) => setIsRefundable(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
        />
        <Label htmlFor="isRefundable">
          {t('reservationCancellationPolicies.form.isRefundable')}
        </Label>
      </div>

      {/* Free Cancellation Days */}
      {isRefundable && (
        <div>
          <Label htmlFor="freeCancellationDays">
            {t('reservationCancellationPolicies.form.freeCancellationDays')}
          </Label>
          <Input
            id="freeCancellationDays"
            type="number"
            value={freeCancellationDays}
            onChange={(e) => setFreeCancellationDays(e.target.value)}
            error={errors.freeCancellationDays}
            placeholder={t('reservationCancellationPolicies.form.freeCancellationDaysPlaceholder')}
          />
          {errors.freeCancellationDays && (
            <p className="mt-1 text-sm text-red-600">{errors.freeCancellationDays}</p>
          )}
        </div>
      )}

      {/* Penalty Logic */}
      <div>
        <Label htmlFor="penaltyLogic" required>
          {t('reservationCancellationPolicies.form.penaltyLogic')}
        </Label>
        <select
          id="penaltyLogic"
          value={penaltyLogic}
          onChange={(e) => setPenaltyLogic(e.target.value as PenaltyLogic)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="percent">
            {t('reservationCancellationPolicies.form.penaltyLogicPercent')}
          </option>
          <option value="amount">
            {t('reservationCancellationPolicies.form.penaltyLogicAmount')}
          </option>
          <option value="nights">
            {t('reservationCancellationPolicies.form.penaltyLogicNights')}
          </option>
        </select>
      </div>

      {/* Penalty Value */}
      <div>
        <Label htmlFor="penaltyValue" required>
          {t('reservationCancellationPolicies.form.penaltyValue')}
        </Label>
        <Input
          id="penaltyValue"
          type="number"
          step="0.01"
          value={penaltyValue}
          onChange={(e) => setPenaltyValue(e.target.value)}
          error={errors.penaltyValue}
          placeholder={t('reservationCancellationPolicies.form.penaltyValuePlaceholder')}
        />
        {errors.penaltyValue && <p className="mt-1 text-sm text-red-600">{errors.penaltyValue}</p>}
      </div>

      {/* No-Show Penalty Logic */}
      <div>
        <Label htmlFor="noShowPenaltyLogic">
          {t('reservationCancellationPolicies.form.noShowPenaltyLogic')}
        </Label>
        <select
          id="noShowPenaltyLogic"
          value={noShowPenaltyLogic || ''}
          onChange={(e) =>
            setNoShowPenaltyLogic((e.target.value as NoShowPenaltyLogic) || null)
          }
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">{t('common.none')}</option>
          <option value="percent">
            {t('reservationCancellationPolicies.form.penaltyLogicPercent')}
          </option>
          <option value="amount">
            {t('reservationCancellationPolicies.form.penaltyLogicAmount')}
          </option>
          <option value="nights">
            {t('reservationCancellationPolicies.form.penaltyLogicNights')}
          </option>
        </select>
      </div>

      {/* No-Show Penalty Value */}
      {noShowPenaltyLogic && (
        <div>
          <Label htmlFor="noShowPenaltyValue">
            {t('reservationCancellationPolicies.form.noShowPenaltyValue')}
          </Label>
          <Input
            id="noShowPenaltyValue"
            type="number"
            step="0.01"
            value={noShowPenaltyValue}
            onChange={(e) => setNoShowPenaltyValue(e.target.value)}
            error={errors.noShowPenaltyValue}
            placeholder={t('reservationCancellationPolicies.form.noShowPenaltyValuePlaceholder')}
          />
          {errors.noShowPenaltyValue && (
            <p className="mt-1 text-sm text-red-600">{errors.noShowPenaltyValue}</p>
          )}
        </div>
      )}

      {/* Min Nights */}
      <div>
        <Label htmlFor="minNights">{t('reservationCancellationPolicies.form.minNights')}</Label>
        <Input
          id="minNights"
          type="number"
          value={minNights}
          onChange={(e) => setMinNights(e.target.value)}
          error={errors.minNights}
          placeholder={t('reservationCancellationPolicies.form.minNightsPlaceholder')}
        />
        {errors.minNights && <p className="mt-1 text-sm text-red-600">{errors.minNights}</p>}
      </div>

      {/* Max Nights */}
      <div>
        <Label htmlFor="maxNights">{t('reservationCancellationPolicies.form.maxNights')}</Label>
        <Input
          id="maxNights"
          type="number"
          value={maxNights}
          onChange={(e) => setMaxNights(e.target.value)}
          error={errors.maxNights}
          placeholder={t('reservationCancellationPolicies.form.maxNightsPlaceholder')}
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

export default ReservationCancellationPolicyForm;

