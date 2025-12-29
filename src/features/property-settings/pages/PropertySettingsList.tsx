import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/ui/Button';
import Pagination from '../../../components/ui/Pagination';
import Card from '../../../components/ui/Card';
import Modal from '../../../components/ui/Modal';
import PropertySettingsTable from '../components/PropertySettingsTable';
import PropertySettingsForm from '../components/PropertySettingsForm';
import { usePropertySettings } from '../hooks/usePropertySettings';

const PropertySettingsList: React.FC = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const limit = 10;

  const { data, isLoading, error } = usePropertySettings({
    page,
    limit,
    sortBy: 'propertyId',
    sortOrder: 'DESC',
  });

  const handleSuccess = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t('propertySettings.title')}</h1>
            <p className="text-sm text-slate-600">
              {t('propertySettings.subtitle')} • {data?.meta.total ?? 0}{' '}
              {t('propertySettings.stats.settingsCount')}
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>{t('propertySettings.addSettings')}</Button>
        </div>
      </div>

      {/* Table */}
      <PropertySettingsTable propertySettings={data?.data} isLoading={isLoading} error={error} />

      {/* Pagination */}
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
        title={t('propertySettings.create.title')}
        size="2xl"
      >
        <PropertySettingsForm onSuccess={handleSuccess} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default PropertySettingsList;
