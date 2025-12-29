/**
 * Room Type Table Component
 * 
 * Displays a table of room types with action buttons and confirmation modal.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import DropdownMenu from '@/components/ui/DropdownMenu';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useConfirmModal } from '@/hooks/useConfirmModal';
import { useToast } from '@/context/ToastContext';
import { useDeleteRoomType } from '../hooks';
import type { RoomType } from '../types';

interface RoomTypeTableProps {
  roomTypes: RoomType[];
  isLoading: boolean;
  error: Error | null;
}

const RoomTypeTable: React.FC<RoomTypeTableProps> = ({ roomTypes, isLoading, error }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const deleteRoomTypeMutation = useDeleteRoomType();
  const deleteModal = useConfirmModal();
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null);

  const handleDeleteClick = (roomType: RoomType) => {
    setSelectedRoomType(roomType);
    deleteModal.openModal();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRoomType) return;
    
    try {
      await deleteModal.handleConfirm(async () => {
        await deleteRoomTypeMutation.mutateAsync(selectedRoomType.id);
        setSelectedRoomType(null);
      });
      showSuccess(t('roomTypes.deleteSuccess', { defaultValue: 'Room type deleted successfully!' }));
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || t('common.error', { defaultValue: 'An error occurred' });
      showError(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <Card title={t('roomTypes.title')}>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-600"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : (error as any)?.response?.data?.message || t('roomTypes.table.error');

    return (
      <Card title={t('roomTypes.title')}>
        <div className="space-y-2">
          <p className="text-sm font-medium text-red-600">{t('roomTypes.table.error')}</p>
          <p className="text-xs text-red-500">{errorMessage}</p>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-2">
              <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700">
                Debug Details
              </summary>
              <pre className="mt-2 text-xs bg-slate-100 p-2 rounded overflow-auto">
                {JSON.stringify(error, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </Card>
    );
  }

  if (!roomTypes || roomTypes.length === 0) {
    return (
      <Card title={t('roomTypes.title')}>
        <div className="py-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-slate-900">
            {t('roomTypes.table.noData')}
          </h3>
          <p className="mt-1 text-sm text-slate-500">{t('roomTypes.table.noDataDescription')}</p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/room-types/create')}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('roomTypes.create.title')}
            </button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                {t('roomTypes.table.title')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                {t('roomTypes.table.property')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                {t('roomTypes.table.countOfRooms')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                {t('roomTypes.table.occupancy')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                {t('roomTypes.table.roomKind')}
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-700">
                {t('common.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {roomTypes.map((roomType) => (
              <tr key={roomType.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <button
                      onClick={() => navigate(`/rate-plans?roomTypeId=${roomType.id}`)}
                      className="font-medium text-slate-900 hover:text-brand-600 transition-colors text-left"
                    >
                      {roomType.title}
                    </button>
                    {roomType.capacity && (
                      <span className="text-xs text-slate-500">
                        {t('roomTypes.table.capacity')}: {roomType.capacity}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {roomType.property?.title || '—'}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {roomType.countOfRooms}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  <div className="flex flex-col text-xs">
                    <span>{t('roomTypes.table.adults')}: {roomType.occAdults}</span>
                    <span>{t('roomTypes.table.children')}: {roomType.occChildren}</span>
                    <span>{t('roomTypes.table.infants')}: {roomType.occInfants}</span>
                    <span className="font-medium text-slate-700">
                      {t('roomTypes.table.default')}: {roomType.defaultOccupancy}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {roomType.roomKind || '—'}
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
                          label: t('roomTypes.actions.overview'),
                          icon: (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ),
                          onClick: () => navigate(`/room-types/${roomType.id}`),
                        },
                        { divider: true },
                        {
                          label: t('roomTypes.actions.content'),
                          icon: (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          ),
                          onClick: () => navigate(`/room-types/${roomType.id}/content`),
                        },
                        {
                          label: t('roomTypes.actions.photos'),
                          icon: (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          ),
                          onClick: () => navigate(`/room-types/${roomType.id}/photos`),
                        },
                        {
                          label: t('roomTypes.actions.facilities'),
                          icon: (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                          ),
                          onClick: () => navigate(`/room-types/${roomType.id}/facilities`),
                        },
                        {
                          label: t('roomTypes.actions.availability'),
                          icon: (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          ),
                          onClick: () => navigate(`/room-types/${roomType.id}/availability`),
                        },
                        { divider: true } as const,
                        {
                          label: t('common.edit'),
                          icon: (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          ),
                          onClick: () => navigate(`/room-types/edit/${roomType.id}`),
                        },
                        {
                          label: t('common.delete'),
                          icon: (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          ),
                          onClick: () => handleDeleteClick(roomType),
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

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteModal.isLoading}
        title={t('roomTypes.delete.title')}
        message={
          selectedRoomType
            ? t('roomTypes.delete.message', { name: selectedRoomType.title })
            : t('roomTypes.delete.message', { name: '' })
        }
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
      />
    </>
  );
};

export default RoomTypeTable;

