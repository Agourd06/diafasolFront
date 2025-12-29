import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Card from '../../../components/ui/Card';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { ActionButtons } from '../../../components/ui/ActionButtons';
import GroupDetailsModal from './GroupDetailsModal';
import Loader from '../../../components/Loader';
import { useConfirmModal } from '../../../hooks/useConfirmModal';
import { useToast } from '@/context/ToastContext';
import { Group } from '../types';
import { useDeleteGroup } from '../hooks/useDeleteGroup';

type Props = {
  groups?: Group[];
  isLoading?: boolean;
  error?: unknown;
};

const GroupTable: React.FC<Props> = ({ groups = [], isLoading, error }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const deleteMutation = useDeleteGroup();
  const deleteModal = useConfirmModal();
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const handleDeleteClick = (group: Group) => {
    setSelectedGroup(group);
    deleteModal.openModal();
  };


  const handleDeleteConfirm = async () => {
    if (!selectedGroup) return;
    
    try {
      await deleteModal.handleConfirm(async () => {
        await deleteMutation.mutateAsync(selectedGroup.id);
        setSelectedGroup(null);
      });
      showSuccess(t('groups.deleteSuccess', { defaultValue: 'Group deleted successfully!' }));
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || t('common.error', { defaultValue: 'An error occurred' });
      showError(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <Card title={t('groups.title')}>
        <Loader label={t('groups.table.loading')} />
      </Card>
    );
  }

  if (error) {
    const axiosError = error as any;
    let errorMessage = t('groups.table.error');

    if (axiosError?.response?.data) {
      errorMessage =
        axiosError.response.data.message ||
        axiosError.response.data.error ||
        errorMessage;
    } else if (axiosError?.message) {
      errorMessage = axiosError.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return (
      <Card title={t('groups.title')}>
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
                  {t('groups.table.error')}
                </h3>
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (!groups.length) {
    return (
      <Card title={t('groups.title')}>
        <p className="text-sm text-slate-600">{t('groups.table.empty')}</p>
      </Card>
    );
  }

  return (
    <>
      <Card title={t('groups.title')} subtitle={t('groups.table.subtitle')}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('groups.table.title')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('groups.table.createdAt')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('groups.table.updatedAt')}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">
                  {t('groups.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {groups.map((group) => (
                <tr key={group.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/properties?groupId=${group.id}`)}
                      className="font-medium text-slate-900 hover:text-brand-600 transition-colors text-left"
                    >
                      {group.title}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(group.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(group.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <ActionButtons
                      editPath={`/groups/edit/${group.id}`}
                      onDelete={() => handleDeleteClick(group)}
                      onView={() => navigate(`/properties?groupId=${group.id}`)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteModal.isLoading}
        title={t('modal.delete.title')}
        message={
          selectedGroup
            ? t('modal.delete.messageGroup', { name: selectedGroup.title })
            : t('modal.delete.message')
        }
        confirmText={t('modal.delete.confirm')}
        cancelText={t('modal.delete.cancel')}
        variant="danger"
      />
    </>
  );
};

export default GroupTable;
