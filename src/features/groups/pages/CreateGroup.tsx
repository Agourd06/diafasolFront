import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/ui/Button';
import GroupForm from '../components/GroupForm';
import { useCreateGroup } from '../hooks/useCreateGroup';
import type { CreateGroupPayload, UpdateGroupPayload } from '../types';

const CreateGroup: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createMutation = useCreateGroup();

  const handleSubmit = async (data: CreateGroupPayload | UpdateGroupPayload) => {
    // In create mode, data is always CreateGroupPayload
    await createMutation.mutateAsync(data as CreateGroupPayload);
    navigate('/groups');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('groups.create.title')}</h1>
          <p className="text-sm text-slate-600">{t('groups.create.subtitle')}</p>
        </div>
        <Link to="/groups">
          <Button variant="outline">{t('common.back')}</Button>
        </Link>
      </div>
      <GroupForm
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
        error={createMutation.error}
      />
    </div>
  );
};

export default CreateGroup;
