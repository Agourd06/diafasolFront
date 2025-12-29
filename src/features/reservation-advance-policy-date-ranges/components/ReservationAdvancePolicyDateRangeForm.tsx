import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../../../components/ui/Input';
import Label from '../../../components/ui/Label';
import Button from '../../../components/ui/Button';
import type {
  CreateReservationAdvancePolicyDateRangeDto,
  UpdateReservationAdvancePolicyDateRangeDto,
  ReservationAdvancePolicyDateRange,
} from '../types';

type Props = {
  policyId: string;
  initialData?: ReservationAdvancePolicyDateRange;
  onSubmit: (
    data: CreateReservationAdvancePolicyDateRangeDto | UpdateReservationAdvancePolicyDateRangeDto
  ) => void;
  isLoading?: boolean;
};

const ReservationAdvancePolicyDateRangeForm: React.FC<Props> = ({
  policyId,
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const { t } = useTranslation();

  const [dateAfter, setDateAfter] = useState(initialData?.dateAfter || '');
  const [dateBefore, setDateBefore] = useState(initialData?.dateBefore || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setDateAfter(initialData.dateAfter);
      setDateBefore(initialData.dateBefore);
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!dateAfter.trim()) {
      newErrors.dateAfter = t('reservationAdvancePolicyDateRanges.form.errors.dateAfterRequired');
    }

    if (!dateBefore.trim()) {
      newErrors.dateBefore = t('reservationAdvancePolicyDateRanges.form.errors.dateBeforeRequired');
    }

    if (dateAfter && dateBefore && new Date(dateAfter) > new Date(dateBefore)) {
      newErrors.dateBefore = t('reservationAdvancePolicyDateRanges.form.errors.dateBeforeAfter');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const data: CreateReservationAdvancePolicyDateRangeDto | UpdateReservationAdvancePolicyDateRangeDto =
      {
        policyId,
        dateAfter,
        dateBefore,
      };

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date After */}
      <div>
        <Label htmlFor="dateAfter" required>
          {t('reservationAdvancePolicyDateRanges.form.dateAfter')}
        </Label>
        <Input
          id="dateAfter"
          type="date"
          value={dateAfter}
          onChange={(e) => setDateAfter(e.target.value)}
          error={errors.dateAfter}
        />
        {errors.dateAfter && <p className="mt-1 text-sm text-red-600">{errors.dateAfter}</p>}
      </div>

      {/* Date Before */}
      <div>
        <Label htmlFor="dateBefore" required>
          {t('reservationAdvancePolicyDateRanges.form.dateBefore')}
        </Label>
        <Input
          id="dateBefore"
          type="date"
          value={dateBefore}
          onChange={(e) => setDateBefore(e.target.value)}
          error={errors.dateBefore}
        />
        {errors.dateBefore && <p className="mt-1 text-sm text-red-600">{errors.dateBefore}</p>}
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

export default ReservationAdvancePolicyDateRangeForm;

