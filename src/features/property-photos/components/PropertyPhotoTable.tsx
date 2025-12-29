import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../../components/ui/Card';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { ActionButtons } from '../../../components/ui/ActionButtons';
import Loader from '../../../components/Loader';
import { useConfirmModal } from '../../../hooks/useConfirmModal';
import { useToast } from '@/context/ToastContext';
import Modal from '../../../components/ui/Modal';
import { PropertyPhoto } from '../types';
import { useDeletePropertyPhoto } from '../hooks/useDeletePropertyPhoto';

type Props = {
  propertyPhotos?: PropertyPhoto[];
  isLoading?: boolean;
  error?: unknown;
};

const PropertyPhotoTable: React.FC<Props> = ({ propertyPhotos = [], isLoading, error }) => {
  const { t } = useTranslation();
  const deleteMutation = useDeletePropertyPhoto();
  const deleteModal = useConfirmModal();
  const [selectedPhoto, setSelectedPhoto] = useState<PropertyPhoto | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [photoToView, setPhotoToView] = useState<PropertyPhoto | null>(null);

  const handleDeleteClick = (photo: PropertyPhoto) => {
    setSelectedPhoto(photo);
    deleteModal.openModal();
  };

  const handleViewClick = (photo: PropertyPhoto) => {
    setPhotoToView(photo);
    setViewModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPhoto) return;
    
    try {
      await deleteModal.handleConfirm(async () => {
        await deleteMutation.mutateAsync(selectedPhoto.id);
        setSelectedPhoto(null);
      });
      showSuccess(t('propertyPhotos.deleteSuccess', { defaultValue: 'Photo deleted successfully!' }));
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || t('common.error', { defaultValue: 'An error occurred' });
      showError(errorMessage);
    }
  };

  // Helper to truncate text
  const truncateText = (text: string | undefined, maxLength: number = 50) => {
    if (!text) return '—';
    const cleaned = text.trim();
    if (cleaned.length <= maxLength) return cleaned;
    return cleaned.substring(0, maxLength).trim() + '...';
  };

  if (isLoading) {
    return (
      <Card title={t('propertyPhotos.title')}>
        <Loader label={t('propertyPhotos.table.loading')} />
      </Card>
    );
  }

  if (error) {
    return (
      <Card title={t('propertyPhotos.title')}>
        <p className="text-sm text-red-600">{t('propertyPhotos.table.error')}</p>
      </Card>
    );
  }

  if (!propertyPhotos.length) {
    return (
      <Card title={t('propertyPhotos.title')}>
        <p className="text-sm text-slate-600">{t('propertyPhotos.table.empty')}</p>
      </Card>
    );
  }

  return (
    <>
      <Card title={t('propertyPhotos.title')} subtitle={t('propertyPhotos.table.subtitle')}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('propertyPhotos.table.photo')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('propertyPhotos.table.property')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('propertyPhotos.table.position')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('propertyPhotos.table.kind')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('propertyPhotos.table.author')}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">
                  {t('propertyPhotos.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {propertyPhotos.map((photo) => (
                <tr key={photo.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={photo.url}
                        alt={photo.description || 'Property photo'}
                        className="h-16 w-16 rounded-lg object-cover border border-slate-200"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect fill="%23e2e8f0" width="64" height="64"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%2394a3b8" font-size="10"%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-500 truncate max-w-xs" title={photo.url}>
                          {truncateText(photo.url, 40)}
                        </div>
                        {photo.description && (
                          <div className="text-xs text-slate-400 mt-1 truncate max-w-xs">
                            {truncateText(photo.description, 30)}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">
                      {photo.property?.title || photo.propertyId}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {photo.position !== undefined ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-800">
                        #{photo.position}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {photo.kind ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 capitalize">
                        {photo.kind}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {photo.author ? (
                      <div className="text-sm">{photo.author}</div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <ActionButtons
                      editPath={`/properties/${photo.propertyId}/photos/edit/${photo.id}`}
                      onDelete={() => handleDeleteClick(photo)}
                      onView={() => handleViewClick(photo)}
                      showView={true}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View Details Modal */}
      {photoToView && (
        <Modal
          isOpen={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false);
            setPhotoToView(null);
          }}
          title={photoToView.property?.title || t('propertyPhotos.details.title')}
          size="2xl"
        >
          <div className="space-y-6">
            {/* Photo */}
            <div className="flex justify-center">
              <img
                src={photoToView.url}
                alt={photoToView.description || 'Property photo'}
                className="max-w-full max-h-96 rounded-lg object-contain border border-slate-200"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e2e8f0" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%2394a3b8"%3EImage not available%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>

            {/* Property Info */}
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {t('propertyPhotos.details.property')}
              </label>
              <p className="mt-1 text-base font-semibold text-slate-900">
                {photoToView.property?.title || photoToView.propertyId}
              </p>
            </div>

            {/* Photo Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              {photoToView.position !== undefined && (
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {t('propertyPhotos.details.position')}
                  </label>
                  <p className="mt-1 text-base text-slate-700">#{photoToView.position}</p>
                </div>
              )}
              {photoToView.kind && (
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {t('propertyPhotos.details.kind')}
                  </label>
                  <p className="mt-1 text-base text-slate-700 capitalize">{photoToView.kind}</p>
                </div>
              )}
              {photoToView.author && (
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {t('propertyPhotos.details.author')}
                  </label>
                  <p className="mt-1 text-base text-slate-700">{photoToView.author}</p>
                </div>
              )}
            </div>

            {/* Description */}
            {photoToView.description && (
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {t('propertyPhotos.details.description')}
                </label>
                <p className="mt-1 text-base text-slate-700">{photoToView.description}</p>
              </div>
            )}

            {/* URL */}
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {t('propertyPhotos.details.url')}
              </label>
              <a
                href={photoToView.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 text-sm text-brand-600 hover:underline break-all"
              >
                {photoToView.url}
              </a>
            </div>

            {/* Metadata */}
            <div className="rounded-lg bg-slate-50 p-4">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                {t('propertyPhotos.details.metadata')}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">{t('propertyPhotos.details.id')}:</span>{' '}
                  <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs text-slate-700">
                    {photoToView.id}
                  </code>
                </div>
                <div>
                  <span className="text-slate-500">{t('propertyPhotos.details.propertyId')}:</span>{' '}
                  <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs text-slate-700">
                    {photoToView.propertyId}
                  </code>
                </div>
                <div>
                  <span className="text-slate-500">{t('propertyPhotos.details.companyId')}:</span>{' '}
                  <span className="font-medium text-slate-700">{photoToView.companyId}</span>
                </div>
                <div>
                  <span className="text-slate-500">{t('propertyPhotos.details.createdAt')}:</span>{' '}
                  <span className="text-slate-700">
                    {new Date(photoToView.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteModal.isLoading}
        title={t('modal.delete.title')}
        message={
          selectedPhoto
            ? t('modal.delete.messagePropertyPhoto', {
                property: selectedPhoto.property?.title || selectedPhoto.propertyId,
              })
            : t('modal.delete.message')
        }
        confirmText={t('modal.delete.confirm')}
        cancelText={t('modal.delete.cancel')}
        variant="danger"
      />
    </>
  );
};

export default PropertyPhotoTable;

