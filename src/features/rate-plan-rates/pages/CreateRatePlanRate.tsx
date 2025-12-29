import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from '../../../components/ui/Modal';
import RatePlanRateForm from '../components/RatePlanRateForm';

const CreateRatePlanRate: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: ratePlanId } = useParams<{ id: string }>();

  const handleSuccess = () => {
    navigate(ratePlanId ? `/rate-plans/${ratePlanId}/rates` : '/rate-plans');
  };

  const handleClose = () => {
    navigate(ratePlanId ? `/rate-plans/${ratePlanId}/rates` : '/rate-plans');
  };

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title={t('ratePlanRates.create.title')}
      size="lg"
    >
      <RatePlanRateForm
        initialRatePlanId={ratePlanId}
        onSuccess={handleSuccess}
        onCancel={handleClose}
      />
    </Modal>
  );
};

export default CreateRatePlanRate;
