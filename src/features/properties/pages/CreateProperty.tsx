import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from '../../../components/ui/Modal';
import PropertyForm from '../components/PropertyForm';
import { useAppContext } from '@/hooks/useAppContext';

const CreateProperty: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { groupId: contextGroupId } = useAppContext();
  // Prefer context groupId, fallback to URL param
  const groupId = contextGroupId || searchParams.get('groupId');

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  const handleClose = () => {
    if (groupId) {
      navigate(`/groups/${groupId}`);
    } else {
      navigate('/properties');
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title={t('properties.create.title')}
      size="2xl"
    >
      <PropertyForm
        initialGroupId={groupId || undefined}
        onSuccess={handleSuccess}
        onCancel={handleClose}
      />
    </Modal>
  );
};

export default CreateProperty;
