/**
 * Room Type Content Table Component
 * 
 * Displays room type content with action buttons and view modal.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import { ActionButtons } from '@/components/ui/ActionButtons';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Modal from '@/components/ui/Modal';
import { useConfirmModal } from '@/hooks/useConfirmModal';
import { useToast } from '@/context/ToastContext';
import { useDeleteRoomTypeContent } from '../hooks';
import type { RoomTypeContent } from '../types';

interface RoomTypeContentTableProps {
  content: RoomTypeContent[];
  isLoading: boolean;
  error: Error | null;
  roomTypeId?: string; // Optional roomTypeId for building correct edit paths
}

// Helper function to truncate HTML text
const truncateText = (html: string | undefined, maxLength: number = 100) => {
  if (!html) return '—';
  // Remove HTML tags and normalize whitespace
  let text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

const RoomTypeContentTable: React.FC<RoomTypeContentTableProps> = ({
  content,
  isLoading,
  error,
  roomTypeId,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const deleteContentMutation = useDeleteRoomTypeContent();
  const deleteModal = useConfirmModal();
  const [selectedContent, setSelectedContent] = useState<RoomTypeContent | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [contentToView, setContentToView] = useState<RoomTypeContent | null>(null);

  const handleDeleteClick = (item: RoomTypeContent) => {
    setSelectedContent(item);
    deleteModal.openModal();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedContent) return;
    
    try {
      await deleteModal.handleConfirm(async () => {
        await deleteContentMutation.mutateAsync(selectedContent.roomTypeId);
        setSelectedContent(null);
      });
      showSuccess(t('roomTypeContent.deleteSuccess', { defaultValue: 'Content deleted successfully!' }));
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || t('common.error', { defaultValue: 'An error occurred' });
      showError(errorMessage);
    }
  };

  const handleViewClick = (item: RoomTypeContent) => {
    setContentToView(item);
    setViewModalOpen(true);
  };

  if (isLoading) {
    return (
      <Card title={t('roomTypeContent.title')}>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-600"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title={t('roomTypeContent.title')}>
        <p className="text-sm text-red-600">{t('roomTypeContent.table.error')}</p>
      </Card>
    );
  }

  if (!content || content.length === 0) {
    return (
      <Card title={t('roomTypeContent.title')}>
        <div className="py-12 text-center">
          <h3 className="mt-2 text-sm font-semibold text-slate-900">
            {t('roomTypeContent.table.noData')}
          </h3>
          <div className="mt-6">
            <button
              onClick={() => navigate('/room-types/content/create')}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              {t('roomTypeContent.create.title')}
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
                {t('roomTypeContent.table.roomType')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                {t('roomTypeContent.table.description')}
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-700">
                {t('common.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {content.map((item) => (
              <tr key={item.roomTypeId} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {item.roomType?.title || '—'}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {item.description ? (
                    <button
                      onClick={() => handleViewClick(item)}
                      className="text-left hover:text-brand-600 transition-colors"
                      title={item.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}
                    >
                      <div className="max-w-xs truncate">
                        {truncateText(item.description, 80)}
                      </div>
                    </button>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <ActionButtons
                    editPath={
                      roomTypeId
                        ? `/room-types/${roomTypeId}/content/edit`
                        : item.roomTypeId
                        ? `/room-types/${item.roomTypeId}/content/edit`
                        : `/room-types/content/edit/${item.roomTypeId}`
                    }
                    onView={() => handleViewClick(item)}
                    onDelete={() => handleDeleteClick(item)}
                    deleteDisabled={deleteContentMutation.isPending}
                    showView={!!item.description}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setContentToView(null);
        }}
        title={contentToView?.roomType?.title || t('roomTypeContent.title')}
      >
        {contentToView && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-2">
                {t('roomTypeContent.details.description')}
              </h4>
              {contentToView.description ? (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: contentToView.description }}
                />
              ) : (
                <p className="text-sm text-slate-500">{t('roomTypeContent.details.noDescription')}</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteModal.isLoading}
        title={t('roomTypeContent.delete.title')}
        message={
          selectedContent
            ? t('roomTypeContent.delete.message', { name: selectedContent.roomType?.title || '' })
            : t('roomTypeContent.delete.message', { name: '' })
        }
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
      />
    </>
  );
};

export default RoomTypeContentTable;

