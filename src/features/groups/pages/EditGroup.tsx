import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Loader from '../../../components/Loader';
import GroupForm from '../components/GroupForm';
import { useGroup } from '../hooks/useGroup';
import { useUpdateGroup } from '../hooks/useUpdateGroup';
import type { CreateGroupPayload, UpdateGroupPayload } from '../types';

const EditGroup: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: group, isLoading } = useGroup(id!);
  const updateMutation = useUpdateGroup();

  const handleSubmit = async (data: CreateGroupPayload | UpdateGroupPayload) => {
    // In edit mode, data is always UpdateGroupPayload
    await updateMutation.mutateAsync({ id: id!, payload: data as UpdateGroupPayload });
    navigate('/groups');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <Loader label={t('common.loading')} />
        </Card>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="space-y-4">
        <Card>
          <p className="text-sm text-red-600">{t('groups.edit.notFound')}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('groups.edit.title')}</h1>
          <p className="text-sm text-slate-600">{t('groups.edit.subtitle')}</p>
        </div>
        <Link to="/groups">
          <Button variant="outline">{t('common.back')}</Button>
        </Link>
      </div>
      <GroupForm
        group={group}
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
        error={updateMutation.error}
      />
    </div>
  );
};

export default EditGroup;
