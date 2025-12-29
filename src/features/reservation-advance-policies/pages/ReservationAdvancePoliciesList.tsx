import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Pagination from '../../../components/ui/Pagination';
import ReservationAdvancePolicyTable from '../components/ReservationAdvancePolicyTable';
import { useReservationAdvancePolicies } from '../hooks/useReservationAdvancePolicies';

const ReservationAdvancePoliciesList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error } = useReservationAdvancePolicies({
    page,
    limit,
    search: search.trim() || undefined,
  });

  const policies = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {t('reservationAdvancePolicies.title')}
            </h1>
            <p className="text-slate-600 mt-1">
              {t('reservationAdvancePolicies.description')} • {total}{' '}
              {t('reservationAdvancePolicies.policiesCount')}
            </p>
          </div>
          <Button variant="primary" onClick={() => navigate('/reservation-advance-policies/create')}>
            {t('reservationAdvancePolicies.addPolicy')}
          </Button>
        </div>

        {/* Search */}
        <Card>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder={t('reservationAdvancePolicies.searchPlaceholder')}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </Card>

        {/* Table */}
        <ReservationAdvancePolicyTable policies={policies} isLoading={isLoading} error={error} />

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        )}
    </div>
  );
};

export default ReservationAdvancePoliciesList;

