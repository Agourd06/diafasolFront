/**
 * Room Type Availability Table Component
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import { ActionButtons } from '@/components/ui/ActionButtons';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useConfirmModal } from '@/hooks/useConfirmModal';
import { useDeleteRoomTypeAvailability } from '../hooks';
import { useToast } from '@/context/ToastContext';
import type { RoomTypeAvailability } from '../types';

interface RoomTypeAvailabilityTableProps {
  availability: RoomTypeAvailability[];
  isLoading: boolean;
  error: Error | null;
  roomTypeId?: string; // Optional roomTypeId for building correct edit paths
}

const RoomTypeAvailabilityTable: React.FC<RoomTypeAvailabilityTableProps> = ({
  availability,
  isLoading,
  error,
  roomTypeId,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const deleteAvailabilityMutation = useDeleteRoomTypeAvailability();
  const deleteModal = useConfirmModal();
  const [selectedAvailability, setSelectedAvailability] = useState<RoomTypeAvailability | null>(null);

  const handleDeleteClick = (avail: RoomTypeAvailability) => {
    setSelectedAvailability(avail);
    deleteModal.openModal();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAvailability) return;
    
    try {
      await deleteModal.handleConfirm(async () => {
        await deleteAvailabilityMutation.mutateAsync(selectedAvailability.id);
        setSelectedAvailability(null);
      });
      showSuccess(t('roomTypeAvailability.deleteSuccess', { defaultValue: 'Availability deleted successfully!' }));
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || t('common.error', { defaultValue: 'An error occurred' });
      showError(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <Card title={t('roomTypeAvailability.title')}>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-600"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title={t('roomTypeAvailability.title')}>
        <p className="text-sm text-red-600">{t('roomTypeAvailability.table.error')}</p>
      </Card>
    );
  }

  if (!availability || availability.length === 0) {
    return (
      <Card title={t('roomTypeAvailability.title')}>
        <div className="py-12 text-center">
          <h3 className="mt-2 text-sm font-semibold text-slate-900">
            {t('roomTypeAvailability.table.noData')}
          </h3>
          <div className="mt-6">
            <button
              onClick={() => navigate('/room-types/availability/create')}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              {t('roomTypeAvailability.create.title')}
            </button>
          </div>
        </div>
      </Card>
    );
  }

  console.log('✅ [RoomTypeAvailabilityTable] Rendering table with', availability.length, 'items');

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                {t('roomTypeAvailability.table.date')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                {t('roomTypeAvailability.table.property')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                {t('roomTypeAvailability.table.roomType')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                {t('roomTypeAvailability.table.availability')}
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-700">
                {t('common.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {availability.map((avail, index) => {
              return (
                <tr key={avail.id || index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">{avail.date}</td>
                  <td className="px-4 py-3 text-slate-600">{avail.property?.title || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{avail.roomType?.title || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{avail.availability}</td>
                  <td className="px-4 py-3">
                    <ActionButtons
                      editPath={
                        roomTypeId
                          ? `/room-types/${roomTypeId}/availability/edit/${avail.id}`
                          : avail.roomTypeId
                          ? `/room-types/${avail.roomTypeId}/availability/edit/${avail.id}`
                          : `/room-types/availability/edit/${avail.id}`
                      }
                      onDelete={() => handleDeleteClick(avail)}
                      deleteDisabled={deleteAvailabilityMutation.isPending}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteModal.isLoading}
        title={t('roomTypeAvailability.delete.title')}
        message={
          selectedAvailability
            ? t('roomTypeAvailability.delete.message', { date: selectedAvailability.date })
            : t('roomTypeAvailability.delete.message', { date: '' })
        }
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
      />
    </>
  );
};

export default RoomTypeAvailabilityTable;

