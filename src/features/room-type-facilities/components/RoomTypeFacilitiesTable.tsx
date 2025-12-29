/**
 * Room Type Facilities Table Component
 * 
 * Displays room type-facility links with delete action.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import { DeleteButton } from '@/components/ui/ActionButtons';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useConfirmModal } from '@/hooks/useConfirmModal';
import { useDeleteRoomTypeFacilityLink } from '../hooks';
import type { RoomTypeFacilityLink } from '../types';

interface RoomTypeFacilitiesTableProps {
  links: RoomTypeFacilityLink[];
  isLoading: boolean;
  error: Error | null;
}

const RoomTypeFacilitiesTable: React.FC<RoomTypeFacilitiesTableProps> = ({
  links,
  isLoading,
  error,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteLinkMutation = useDeleteRoomTypeFacilityLink();
  const deleteModal = useConfirmModal();
  const [selectedLink, setSelectedLink] = useState<RoomTypeFacilityLink | null>(null);

  const handleDeleteClick = (link: RoomTypeFacilityLink) => {
    setSelectedLink(link);
    deleteModal.openModal();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedLink) return;
    
    await deleteModal.handleConfirm(async () => {
      await deleteLinkMutation.mutateAsync({
        roomTypeId: selectedLink.roomTypeId,
        facilityId: selectedLink.facilityId,
      });
      setSelectedLink(null);
    });
  };

  if (isLoading) {
    return (
      <Card title={t('roomTypeFacilities.title')}>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-600"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title={t('roomTypeFacilities.title')}>
        <p className="text-sm text-red-600">{t('roomTypeFacilities.table.error')}</p>
      </Card>
    );
  }

  if (!links || links.length === 0) {
    return (
      <Card title={t('roomTypeFacilities.title')}>
        <div className="py-12 text-center">
          <h3 className="mt-2 text-sm font-semibold text-slate-900">
            {t('roomTypeFacilities.table.noData')}
          </h3>
          <div className="mt-6">
            <button
              onClick={() => navigate('/room-types/facilities-link/create')}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              {t('roomTypeFacilities.create.title')}
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
                {t('roomTypeFacilities.table.roomType')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                {t('roomTypeFacilities.table.facility')}
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-700">
                {t('common.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {links.map((link) => (
              <tr key={`${link.roomTypeId}-${link.facilityId}`} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {link.roomType?.title || '—'}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {link.facility?.name || '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center">
                    <DeleteButton
                      onClick={() => handleDeleteClick(link)}
                      disabled={deleteLinkMutation.isPending}
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
        title={t('roomTypeFacilities.delete.title')}
        message={
          selectedLink
            ? t('roomTypeFacilities.delete.message', {
                roomType: selectedLink.roomType?.title || '',
                facility: selectedLink.facility?.name || '',
              })
            : ''
        }
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
      />
    </>
  );
};

export default RoomTypeFacilitiesTable;

