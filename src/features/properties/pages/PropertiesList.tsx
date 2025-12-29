import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Pagination from '../../../components/ui/Pagination';
import Card from '../../../components/ui/Card';
import Modal from '../../../components/ui/Modal';
import Breadcrumb, { BreadcrumbItem } from '../../../components/ui/Breadcrumb';
import PropertyTable from '../components/PropertyTable';
import PropertyForm from '../components/PropertyForm';
import { useProperties } from '../hooks/useProperties';
import { useGroup } from '../../groups/hooks/useGroup';

const PropertiesList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('groupId');
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const limit = 10;

  // Fetch group details if filtering by group
  const { data: group } = useGroup(groupId || '', { enabled: !!groupId });

  const { data, isLoading, error } = useProperties({
    page,
    limit,
    search: search || undefined,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
    groupId: groupId || undefined,
  });

  // Reset to page 1 when groupId changes
  useEffect(() => {
    setPage(1);
  }, [groupId]);

  const breadcrumbItems: BreadcrumbItem[] = groupId && group
    ? [
        { label: t('groups.title'), path: '/groups' },
        { label: group.title, path: `/groups/${groupId}` },
        { label: t('properties.title') },
      ]
    : [];

  const clearGroupFilter = () => {
    navigate('/properties');
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      {breadcrumbItems.length > 0 && <Breadcrumb items={breadcrumbItems} />}

      {/* Header with Search and Add Button */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t('properties.title')}</h1>
            <p className="text-sm text-slate-600">
              {groupId && group
                ? t('properties.filteredByGroup', { groupName: group.title })
                : t('properties.subtitle')}{' '}
              • {data?.meta.total ?? 0} {t('properties.stats.propertiesCount')}
            </p>
          </div>
          <div className="flex gap-2">
            {groupId && (
              <Button variant="outline" onClick={clearGroupFilter}>
                {t('properties.clearFilter')}
              </Button>
            )}
            <Button onClick={() => setIsModalOpen(true)}>{t('properties.addProperty')}</Button>
          </div>
        </div>

        {/* Group Filter Indicator */}
        {groupId && group && (
          <div className="flex items-center gap-2 rounded-lg bg-brand-50 border border-brand-200 px-4 py-2">
            <svg
              className="h-5 w-5 text-brand-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span className="text-sm font-medium text-brand-900">
              {t('properties.filteredByGroup', { groupName: group.title })}
            </span>
            <button
              onClick={clearGroupFilter}
              className="ml-auto text-brand-600 hover:text-brand-700 text-sm font-medium"
            >
              {t('common.clear')}
            </button>
          </div>
        )}

        {/* Search Bar */}
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
              placeholder={t('properties.search.placeholder')}
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

      {/* Table */}
      <PropertyTable properties={data?.data} isLoading={isLoading} error={error} />

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
        title={t('properties.create.title')}
        size="2xl"
      >
        <PropertyForm
          initialGroupId={groupId || undefined}
          onSuccess={handleSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default PropertiesList;
