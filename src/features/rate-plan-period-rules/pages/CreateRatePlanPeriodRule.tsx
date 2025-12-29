import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from '../../../components/ui/Modal';
import RatePlanPeriodRuleForm from '../components/RatePlanPeriodRuleForm';

const CreateRatePlanPeriodRule: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: ratePlanId } = useParams<{ id: string }>();

  if (!ratePlanId) {
    return null; // Don't render if ratePlanId is missing
  }

  const handleSuccess = () => {
    navigate(`/rate-plans/${ratePlanId}/period-rules`);
  };

  const handleClose = () => {
    navigate(`/rate-plans/${ratePlanId}/period-rules`);
  };

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title={t('ratePlanPeriodRules.create.title')}
      size="lg"
    >
      <RatePlanPeriodRuleForm 
        initialRatePlanId={ratePlanId} 
        onSuccess={handleSuccess} 
        onCancel={handleClose} 
      />
    </Modal>
  );
};

export default CreateRatePlanPeriodRule;
