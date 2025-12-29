import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import Card from '../../../components/ui/Card';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import DropdownMenu from '../../../components/ui/DropdownMenu';
import RatePlanDetailsModal from './RatePlanDetailsModal';
import Loader from '../../../components/Loader';
import { useConfirmModal } from '../../../hooks/useConfirmModal';
import { useToast } from '@/context/ToastContext';
import { RatePlan } from '../types';
import { useDeleteRatePlan } from '../hooks/useDeleteRatePlan';
import { getPropertyById } from '@/api/properties.api';
import { getRoomTypeById } from '@/api/room-types.api';

type Props = {
  ratePlans?: RatePlan[];
  isLoading?: boolean;
  error?: unknown;
};

const RatePlanTable: React.FC<Props> = ({ ratePlans = [], isLoading, error }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const deleteMutation = useDeleteRatePlan();
  const deleteModal = useConfirmModal();
  const [selectedRatePlan, setSelectedRatePlan] = useState<RatePlan | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [ratePlanToView, setRatePlanToView] = useState<RatePlan | null>(null);

  const uniquePropertyIds = useMemo(
    () => Array.from(new Set(ratePlans.map((rp) => rp.propertyId).filter(Boolean))),
    [ratePlans]
  );
  const uniqueRoomTypeIds = useMemo(
    () => Array.from(new Set(ratePlans.map((rp) => rp.roomTypeId).filter(Boolean))),
    [ratePlans]
  );

  const propertyQueries = useQueries({
    queries: uniquePropertyIds.map((id) => ({
      queryKey: ['property', id],
      queryFn: () => getPropertyById(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const roomTypeQueries = useQueries({
    queries: uniqueRoomTypeIds.map((id) => ({
      queryKey: ['roomType', id],
      queryFn: () => getRoomTypeById(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const propertyMap = useMemo(() => {
    const map = new Map<string, string>();
    propertyQueries.forEach((q, idx) => {
      if (q.data && uniquePropertyIds[idx]) {
        map.set(uniquePropertyIds[idx], q.data.title);
      }
    });
    return map;
  }, [propertyQueries, uniquePropertyIds]);

  const roomTypeMap = useMemo(() => {
    const map = new Map<string, string>();
    roomTypeQueries.forEach((q, idx) => {
      if (q.data && uniqueRoomTypeIds[idx]) {
        map.set(uniqueRoomTypeIds[idx], q.data.title);
      }
    });
    return map;
  }, [roomTypeQueries, uniqueRoomTypeIds]);

  const handleDeleteClick = (ratePlan: RatePlan) => {
    setSelectedRatePlan(ratePlan);
    deleteModal.openModal();
  };

  const handleViewClick = (ratePlan: RatePlan) => {
    setRatePlanToView(ratePlan);
    setViewModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRatePlan) return;
    
    try {
      await deleteModal.handleConfirm(async () => {
        await deleteMutation.mutateAsync(selectedRatePlan.id);
        setSelectedRatePlan(null);
      });
      showSuccess(t('ratePlans.deleteSuccess', { defaultValue: 'Rate plan deleted successfully!' }));
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || t('common.error', { defaultValue: 'An error occurred' });
      showError(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <Card title={t('ratePlans.title')}>
        <Loader label={t('ratePlans.table.loading')} />
      </Card>
    );
  }

  if (error) {
    const axiosError = error as any;
    let errorMessage = t('ratePlans.table.error');
    let backendError = null;

    if (axiosError?.response?.data) {
      backendError = axiosError.response.data;
      errorMessage =
        axiosError.response.data.message ||
        axiosError.response.data.error ||
        axiosError.response.data.statusCode ||
        errorMessage;
    } else if (axiosError?.message) {
      errorMessage = axiosError.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return (
      <Card title={t('ratePlans.title')}>
        <div className="space-y-3">
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <div className="flex items-start gap-3">
              <svg
                className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-900 mb-1">
                  {t('ratePlans.table.error')}
                </h3>
                <p className="text-sm text-red-700">{errorMessage}</p>
                {axiosError?.response?.status && (
                  <p className="text-xs text-red-600 mt-1">
                    Status: {axiosError.response.status} {axiosError.response.statusText || ''}
                  </p>
                )}
              </div>
            </div>
          </div>

          {process.env.NODE_ENV === 'development' && backendError && (
            <details className="mt-2">
              <summary className="text-xs text-slate-600 cursor-pointer hover:text-slate-900 font-medium">
                🔍 Debug Information (Development Only)
              </summary>
              <div className="mt-2">
                <pre className="text-xs bg-slate-100 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(backendError, null, 2)}
                </pre>
              </div>
            </details>
          )}
        </div>
      </Card>
    );
  }

  if (!ratePlans.length) {
    return (
      <Card title={t('ratePlans.title')}>
        <p className="text-sm text-slate-600">{t('ratePlans.table.empty')}</p>
      </Card>
    );
  }

  return (
    <>
      <Card title={t('ratePlans.title')} subtitle={t('ratePlans.table.subtitle')}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('ratePlans.table.title')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('ratePlans.table.property')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('ratePlans.table.roomType')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('ratePlans.table.currency')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('ratePlans.table.sellMode')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('ratePlans.table.rateMode')}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">
                  {t('ratePlans.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ratePlans.map((ratePlan) => (
                <tr key={ratePlan.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div>
                      <button
                        onClick={() => navigate(`/rate-plans/${ratePlan.id}`)}
                        className="font-medium text-slate-900 hover:text-brand-600 transition-colors text-left"
                      >
                        {ratePlan.title}
                      </button>
                      {ratePlan.parentRatePlanId && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                          {t('ratePlans.table.childPlan')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <div className="font-medium text-slate-900">
                      {propertyMap.get(ratePlan.propertyId) || (
                        <span className="text-xs text-slate-500 font-mono">
                          {ratePlan.propertyId.substring(0, 8)}...
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <div className="font-medium text-slate-900">
                      {roomTypeMap.get(ratePlan.roomTypeId) || (
                        <span className="text-xs text-slate-500 font-mono">
                          {ratePlan.roomTypeId.substring(0, 8)}...
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <span className="font-mono font-semibold">{ratePlan.currency}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {ratePlan.sellMode}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {ratePlan.rateMode}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <DropdownMenu
                        trigger={
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                            />
                          </svg>
                        }
                        items={[
                          {
                            label: t('ratePlans.actions.overview'),
                            icon: (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            ),
                            onClick: () => navigate(`/rate-plans/${ratePlan.id}`),
                          },
                          { divider: true },
                          {
                            label: t('ratePlans.actions.options'),
                            icon: (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                            ),
                            onClick: () => navigate(`/rate-plans/${ratePlan.id}/options`),
                          },
                          {
                            label: t('ratePlans.actions.rates'),
                            icon: (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ),
                            onClick: () => navigate(`/rate-plans/${ratePlan.id}/rates`),
                          },
                          {
                            label: t('ratePlans.actions.dailyRules'),
                            icon: (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            ),
                            onClick: () => navigate(`/rate-plans/${ratePlan.id}/daily-rules`),
                          },
                          {
                            label: t('ratePlans.actions.periodRules'),
                            icon: (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            ),
                            onClick: () => navigate(`/rate-plans/${ratePlan.id}/period-rules`),
                          },
                          {
                            label: t('ratePlans.actions.autoRateSettings'),
                            icon: (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            ),
                            onClick: () => navigate(`/rate-plans/${ratePlan.id}/auto-rate-settings`),
                          },
                          { divider: true } as const,
                          {
                            label: t('common.edit'),
                            icon: (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            ),
                            onClick: () => navigate(`/rate-plans/edit/${ratePlan.id}`),
                          },
                          {
                            label: t('common.delete'),
                            icon: (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            ),
                            onClick: () => handleDeleteClick(ratePlan),
                          },
                        ]}
                        align="right"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View Details Modal */}
      <RatePlanDetailsModal
        ratePlan={ratePlanToView}
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setRatePlanToView(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteModal.isLoading}
        title={t('modal.delete.title')}
        message={
          selectedRatePlan
            ? t('modal.delete.messageRatePlan', { name: selectedRatePlan.title })
            : t('modal.delete.message')
        }
        confirmText={t('modal.delete.confirm')}
        cancelText={t('modal.delete.cancel')}
        variant="danger"
      />
    </>
  );
};

export default RatePlanTable;

