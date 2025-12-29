import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Pagination from '../../../components/ui/Pagination';
import Card from '../../../components/ui/Card';
import Modal from '../../../components/ui/Modal';
import RatePlanAutoRateSettingTable from '../components/RatePlanAutoRateSettingTable';
import RatePlanAutoRateSettingForm from '../components/RatePlanAutoRateSettingForm';
import { useRatePlanAutoRateSettings } from '../hooks/useRatePlanAutoRateSettings';

const RatePlanAutoRateSettingsList: React.FC = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const limit = 10;

  const { data, isLoading, error } = useRatePlanAutoRateSettings({
    page,
    limit,
    search: search || undefined,
    sortBy: 'ruleName',
    sortOrder: 'ASC',
  });

  const handleSuccess = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t('ratePlanAutoRateSettings.title')}</h1>
            <p className="text-sm text-slate-600">
              {t('ratePlanAutoRateSettings.subtitle')} • {data?.meta.total ?? 0}{' '}
              {t('ratePlanAutoRateSettings.stats.settingsCount')}
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>{t('ratePlanAutoRateSettings.addSetting')}</Button>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <Input
              type="search"
              placeholder={t('ratePlanAutoRateSettings.search.placeholder')}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <RatePlanAutoRateSettingTable autoRateSettings={data?.data} isLoading={isLoading} error={error} />

      {data && data.meta.totalPages > 1 && (
        <Card>
          <Pagination
            currentPage={page}
            totalPages={data.meta.totalPages}
            onPageChange={setPage}
            itemsPerPage={limit}
            totalItems={data.meta.total}
            currentItemsCount={data.data.length}
          />
        </Card>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('ratePlanAutoRateSettings.create.title')}
        size="lg"
      >
        <RatePlanAutoRateSettingForm onSuccess={handleSuccess} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default RatePlanAutoRateSettingsList;
