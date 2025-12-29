import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../../components/ui/Card';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { ActionButtons } from '../../../components/ui/ActionButtons';
import Loader from '../../../components/Loader';
import { useConfirmModal } from '../../../hooks/useConfirmModal';
import { useToast } from '@/context/ToastContext';
import Modal from '../../../components/ui/Modal';
import { PropertyContent } from '../types';
import { useDeletePropertyContent } from '../hooks/useDeletePropertyContent';

type Props = {
  propertyContents?: PropertyContent[];
  isLoading?: boolean;
  error?: unknown;
};

const PropertyContentTable: React.FC<Props> = ({ propertyContents = [], isLoading, error }) => {
  const { t } = useTranslation();
  const deleteMutation = useDeletePropertyContent();
  const deleteModal = useConfirmModal();
  const [selectedContent, setSelectedContent] = useState<PropertyContent | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [contentToView, setContentToView] = useState<PropertyContent | null>(null);

  const handleDeleteClick = (content: PropertyContent) => {
    setSelectedContent(content);
    deleteModal.openModal();
  };

  const handleViewClick = (content: PropertyContent) => {
    setContentToView(content);
    setViewModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedContent) return;
    
    try {
      await deleteModal.handleConfirm(async () => {
        await deleteMutation.mutateAsync(selectedContent.propertyId);
        setSelectedContent(null);
      });
      showSuccess(t('propertyContent.deleteSuccess', { defaultValue: 'Content deleted successfully!' }));
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || t('common.error', { defaultValue: 'An error occurred' });
      showError(errorMessage);
    }
  };

  // Helper to truncate HTML content and decode HTML entities
  const truncateText = (html: string | undefined, maxLength: number = 100) => {
    if (!html) return '—';
    
    // Create a temporary element to decode HTML entities and extract text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    let text = tempDiv.textContent || tempDiv.innerText || '';
    
    // Normalize whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  if (isLoading) {
    return (
      <Card title={t('propertyContent.title')}>
        <Loader label={t('propertyContent.table.loading')} />
      </Card>
    );
  }

  if (error) {
    return (
      <Card title={t('propertyContent.title')}>
        <p className="text-sm text-red-600">{t('propertyContent.table.error')}</p>
      </Card>
    );
  }

  if (!propertyContents.length) {
    return (
      <Card title={t('propertyContent.title')}>
        <p className="text-sm text-slate-600">{t('propertyContent.table.empty')}</p>
      </Card>
    );
  }

  return (
    <>
      <Card title={t('propertyContent.title')} subtitle={t('propertyContent.table.subtitle')}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('propertyContent.table.property')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('propertyContent.table.description')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('propertyContent.table.importantInfo')}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">
                  {t('propertyContent.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {propertyContents.map((content) => (
                <tr key={content.propertyId} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">
                      {content.property?.title || content.propertyId}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {content.description ? (
                      <button
                        onClick={() => handleViewClick(content)}
                        className="text-left hover:text-brand-600 transition-colors w-full"
                        title={content.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}
                      >
                        <div className="max-w-xs truncate text-sm">
                          {truncateText(content.description, 80)}
                        </div>
                      </button>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {content.importantInformation ? (
                      <button
                        onClick={() => handleViewClick(content)}
                        className="text-left hover:text-brand-600 transition-colors w-full"
                        title={content.importantInformation.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}
                      >
                        <div className="max-w-xs truncate text-sm">
                          {truncateText(content.importantInformation, 80)}
                        </div>
                      </button>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <ActionButtons
                      editPath={`/properties/${content.propertyId}/content/edit`}
                      onDelete={() => handleDeleteClick(content)}
                      onView={() => handleViewClick(content)}
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
      {contentToView && (
        <Modal
          isOpen={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false);
            setContentToView(null);
          }}
          title={contentToView.property?.title || t('propertyContent.details.title')}
          size="2xl"
        >
          <div className="space-y-6">
            {/* Property Info */}
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {t('propertyContent.details.property')}
              </label>
              <p className="mt-1 text-base font-semibold text-slate-900">
                {contentToView.property?.title || contentToView.propertyId}
              </p>
            </div>

            {/* Description */}
            {contentToView.description && (
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {t('propertyContent.details.description')}
                </label>
                <div
                  className="prose prose-slate mt-2 max-w-none rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm"
                  dangerouslySetInnerHTML={{ __html: contentToView.description }}
                />
              </div>
            )}

            {/* Important Information */}
            {contentToView.importantInformation && (
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {t('propertyContent.details.importantInfo')}
                </label>
                <div
                  className="prose prose-slate mt-2 max-w-none rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm"
                  dangerouslySetInnerHTML={{ __html: contentToView.importantInformation }}
                />
              </div>
            )}

            {/* Metadata */}
            <div className="rounded-lg bg-slate-50 p-4">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                {t('propertyContent.details.metadata')}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">{t('propertyContent.details.propertyId')}:</span>{' '}
                  <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs text-slate-700">
                    {contentToView.propertyId}
                  </code>
                </div>
                <div>
                  <span className="text-slate-500">{t('propertyContent.details.companyId')}:</span>{' '}
                  <span className="font-medium text-slate-700">{contentToView.companyId}</span>
                </div>
                <div>
                  <span className="text-slate-500">{t('propertyContent.details.createdAt')}:</span>{' '}
                  <span className="text-slate-700">
                    {new Date(contentToView.createdAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">{t('propertyContent.details.updatedAt')}:</span>{' '}
                  <span className="text-slate-700">
                    {new Date(contentToView.updatedAt).toLocaleString()}
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
          selectedContent
            ? t('modal.delete.messagePropertyContent', {
                name: selectedContent.property?.title || selectedContent.propertyId,
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

export default PropertyContentTable;

