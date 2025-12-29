import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from '../../../components/ui/Modal';
import RatePlanOptionForm from '../components/RatePlanOptionForm';

const CreateRatePlanOption: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: ratePlanId } = useParams<{ id: string }>();

  const handleSuccess = () => {
    navigate(ratePlanId ? `/rate-plans/${ratePlanId}/options` : '/rate-plans');
  };

  const handleClose = () => {
    navigate(ratePlanId ? `/rate-plans/${ratePlanId}/options` : '/rate-plans');
  };

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title={t('ratePlanOptions.create.title')}
      size="lg"
    >
      <RatePlanOptionForm
        initialRatePlanId={ratePlanId}
        onSuccess={handleSuccess}
        onCancel={handleClose}
      />
    </Modal>
  );
};

export default CreateRatePlanOption;
