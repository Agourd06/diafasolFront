import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Breadcrumb, { BreadcrumbItem } from '../../../components/ui/Breadcrumb';
import Tabs, { Tab } from '../../../components/ui/Tabs';
import Loader from '../../../components/Loader';
import PropertyTable from '../../properties/components/PropertyTable';
import { useGroup } from '../hooks/useGroup';
import { useProperties } from '../../properties/hooks/useProperties';

const GroupDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('properties');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 10;

  const { data: group, isLoading: groupLoading } = useGroup(id!);
  
  const { data: propertiesData, isLoading: propertiesLoading } = useProperties({
    page,
    limit,
    search: search || undefined,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
    groupId: id, // Filter properties by this group
  });
  
  // Debug: Log the groupId and results
  useEffect(() => {
    if (id) {
      console.log('🔍 GroupDetail: Filtering properties by groupId:', id);
    }
  }, [id]);
  
  useEffect(() => {
    if (propertiesData) {
      console.log('📊 GroupDetail: Properties data received:', {
        total: propertiesData.meta.total,
        count: propertiesData.data.length,
        properties: propertiesData.data.map(p => ({ id: p.id, title: p.title, groupId: p.groupId }))
      });
    }
  }, [propertiesData]);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: t('groups.title'), path: '/groups' },
    { label: group?.title || t('groups.detail.loading') },
  ];

  const tabs: Tab[] = [
    {
      id: 'properties',
      label: t('groups.detail.tabs.properties'),
      count: propertiesData?.meta.total,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
  ];

  if (groupLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <Loader label={t('common.loading')} />
        </Card>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="space-y-4">
        <Card>
          <p className="text-sm text-red-600">{t('groups.edit.notFound')}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{group.title}</h1>
            <p className="text-sm text-slate-600">
              {t('groups.detail.subtitle')} • {propertiesData?.meta.total ?? 0}{' '}
              {t('properties.stats.propertiesCount')}
            </p>
          </div>
          <div className="flex gap-2">
            <Link to={`/groups/edit/${id}`}>
              <Button variant="outline">{t('common.edit')}</Button>
            </Link>
            <Link to={`/properties/create?groupId=${id}`}>
              <Button>{t('properties.addProperty')}</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Card className="p-0">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        
        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'properties' && (
            <div className="space-y-4">
              {/* Filter Indicator */}
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
                  {t('groups.detail.filteredProperties', { groupName: group.title })}
                </span>
                <span className="text-xs text-brand-700">
                  ({propertiesData?.meta.total ?? 0} {t('properties.stats.propertiesCount')})
                </span>
              </div>

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
                  <input
                    type="search"
                    placeholder={t('groups.detail.searchPropertiesPlaceholder')}
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 pl-10 focus:border-brand-500 focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Properties Table */}
              <PropertyTable
                properties={propertiesData?.data}
                isLoading={propertiesLoading}
                error={undefined}
              />

              {/* Pagination */}
              {propertiesData && propertiesData.meta.totalPages > 1 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('common.previous')}
                    </button>
                    <span className="text-sm text-slate-600">
                      {t('common.page')} {page} {t('common.of')} {propertiesData.meta.totalPages}
                    </span>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page >= propertiesData.meta.totalPages}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('common.next')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default GroupDetail;
