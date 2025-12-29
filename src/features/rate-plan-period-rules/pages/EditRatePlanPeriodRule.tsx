import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from '../../../components/ui/Modal';
import Loader from '../../../components/Loader';
import Card from '../../../components/ui/Card';
import RatePlanPeriodRuleForm from '../components/RatePlanPeriodRuleForm';
import { useRatePlanPeriodRule } from '../hooks/useRatePlanPeriodRule';

const EditRatePlanPeriodRule: React.FC = () => {
  const { t } = useTranslation();
  const { id: ratePlanId, ruleId } = useParams<{ id: string; ruleId: string }>();
  const navigate = useNavigate();

  if (!ratePlanId || !ruleId) {
    return null; // Don't render if required params are missing
  }

  const { data: periodRule, isLoading } = useRatePlanPeriodRule(parseInt(ruleId));

  const handleSuccess = () => {
    navigate(`/rate-plans/${ratePlanId}/period-rules`);
  };

  const handleClose = () => {
    navigate(`/rate-plans/${ratePlanId}/period-rules`);
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

  if (!periodRule) {
    return (
      <div className="space-y-4">
        <Card>
          <p className="text-sm text-red-600">{t('ratePlanPeriodRules.edit.notFound')}</p>
        </Card>
      </div>
    );
  }

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title={t('ratePlanPeriodRules.edit.title')}
      size="lg"
    >
      <RatePlanPeriodRuleForm
        periodRule={periodRule}
        onSuccess={handleSuccess}
        onCancel={handleClose}
      />
    </Modal>
  );
};

export default EditRatePlanPeriodRule;
