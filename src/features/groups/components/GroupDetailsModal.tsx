import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../../../components/ui/Modal';
import { Group } from '../types';

type GroupDetailsModalProps = {
  group: Group | null;
  isOpen: boolean;
  onClose: () => void;
};

const GroupDetailsModal: React.FC<GroupDetailsModalProps> = ({
  group,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();

  if (!group) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={group.title} size="2xl">
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {t('groups.details.title')}
            </label>
            <p className="mt-1 text-base font-semibold text-slate-900">{group.title}</p>
          </div>
        </div>

        {/* Metadata */}
        <div className="rounded-lg bg-slate-50 p-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
            {t('groups.details.metadata')}
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">{t('groups.details.id')}:</span>{' '}
              <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs text-slate-700">
                {group.id}
              </code>
            </div>
            <div>
              <span className="text-slate-500">{t('groups.details.companyId')}:</span>{' '}
              <span className="font-medium text-slate-700">{group.companyId}</span>
            </div>
            <div>
              <span className="text-slate-500">{t('groups.details.createdAt')}:</span>{' '}
              <span className="text-slate-700">
                {new Date(group.createdAt).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-500">{t('groups.details.updatedAt')}:</span>{' '}
              <span className="text-slate-700">
                {new Date(group.updatedAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default GroupDetailsModal;
