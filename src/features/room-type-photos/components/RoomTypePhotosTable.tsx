/**
 * Room Type Photos Table Component
 * 
 * Displays room type photos with image thumbnails and action buttons.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import { ActionButtons } from '@/components/ui/ActionButtons';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useConfirmModal } from '@/hooks/useConfirmModal';
import { useToast } from '@/context/ToastContext';
import { useDeleteRoomTypePhoto } from '../hooks';
import type { RoomTypePhoto } from '../types';

interface RoomTypePhotosTableProps {
  photos: RoomTypePhoto[];
  isLoading: boolean;
  error: Error | null;
  roomTypeId?: string; // Optional roomTypeId for building correct edit paths
}

const RoomTypePhotosTable: React.FC<RoomTypePhotosTableProps> = ({
  photos,
  isLoading,
  error,
  roomTypeId,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deletePhotoMutation = useDeleteRoomTypePhoto();
  const deleteModal = useConfirmModal();
  const [selectedPhoto, setSelectedPhoto] = useState<RoomTypePhoto | null>(null);

  const handleDeleteClick = (photo: RoomTypePhoto) => {
    setSelectedPhoto(photo);
    deleteModal.openModal();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPhoto) return;
    
    try {
      await deleteModal.handleConfirm(async () => {
        await deletePhotoMutation.mutateAsync(selectedPhoto.id);
        setSelectedPhoto(null);
      });
      showSuccess(t('roomTypePhotos.deleteSuccess', { defaultValue: 'Photo deleted successfully!' }));
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || t('common.error', { defaultValue: 'An error occurred' });
      showError(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <Card title={t('roomTypePhotos.title')}>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-600"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title={t('roomTypePhotos.title')}>
        <p className="text-sm text-red-600">{t('roomTypePhotos.table.error')}</p>
      </Card>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <Card title={t('roomTypePhotos.title')}>
        <div className="py-12 text-center">
          <h3 className="mt-2 text-sm font-semibold text-slate-900">
            {t('roomTypePhotos.table.noData')}
          </h3>
          <div className="mt-6">
            <button
              onClick={() => navigate('/room-types/photos/create')}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              {t('roomTypePhotos.create.title')}
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
                {t('roomTypePhotos.table.photo')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                {t('roomTypePhotos.table.roomType')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                {t('roomTypePhotos.table.kind')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                {t('roomTypePhotos.table.position')}
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-700">
                {t('common.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {photos.map((photo) => (
              <tr key={photo.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={photo.url}
                      alt={photo.description || 'Room photo'}
                      className="h-12 w-12 rounded object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=No+Image';
                      }}
                    />
                    <div className="flex flex-col">
                      {photo.description && (
                        <span className="text-xs text-slate-600 truncate max-w-[200px]">
                          {photo.description}
                        </span>
                      )}
                      {photo.author && (
                        <span className="text-xs text-slate-400">by {photo.author}</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {photo.roomType?.title || '—'}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {photo.kind || '—'}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {photo.position ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <ActionButtons
                    editPath={
                      roomTypeId
                        ? `/room-types/${roomTypeId}/photos/edit/${photo.id}`
                        : photo.roomTypeId
                        ? `/room-types/${photo.roomTypeId}/photos/edit/${photo.id}`
                        : `/room-types/photos/edit/${photo.id}`
                    }
                    onDelete={() => handleDeleteClick(photo)}
                    deleteDisabled={deletePhotoMutation.isPending}
                  />
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
        title={t('roomTypePhotos.delete.title')}
        message={
          selectedPhoto
            ? t('roomTypePhotos.delete.message', {
                roomType: selectedPhoto.roomType?.title || '',
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

export default RoomTypePhotosTable;

