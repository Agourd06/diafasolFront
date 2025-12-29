import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from '../../../components/ui/Modal';
import RatePlanDailyRuleForm from '../components/RatePlanDailyRuleForm';

const CreateRatePlanDailyRule: React.FC = () => {
  const { t } = useTranslation();
  const { id: ratePlanId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleSuccess = () => {
    if (ratePlanId) {
      navigate(`/rate-plans/${ratePlanId}/daily-rules`);
    } else {
      navigate('/rate-plan-daily-rules');
    }
  };

  const handleClose = () => {
    if (ratePlanId) {
      navigate(`/rate-plans/${ratePlanId}/daily-rules`);
    } else {
      navigate('/rate-plan-daily-rules');
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title={t('ratePlanDailyRules.create.title')}
      size="lg"
    >
      <RatePlanDailyRuleForm
        initialRatePlanId={ratePlanId}
        onSuccess={handleSuccess}
        onCancel={handleClose}
      />
    </Modal>
  );
};

export default CreateRatePlanDailyRule;
