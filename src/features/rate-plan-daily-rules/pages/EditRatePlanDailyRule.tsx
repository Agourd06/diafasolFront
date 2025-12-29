import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from '../../../components/ui/Modal';
import Loader from '../../../components/Loader';
import Card from '../../../components/ui/Card';
import RatePlanDailyRuleForm from '../components/RatePlanDailyRuleForm';
import { useRatePlanDailyRule } from '../hooks/useRatePlanDailyRule';

const EditRatePlanDailyRule: React.FC = () => {
  const { t } = useTranslation();
  const { id: ratePlanId, ruleId } = useParams<{ id: string; ruleId: string }>();
  const navigate = useNavigate();

  const { data: dailyRule, isLoading } = useRatePlanDailyRule(parseInt(ruleId!));

  const handleSuccess = () => {
    navigate(`/rate-plans/${ratePlanId}/daily-rules`);
  };

  const handleClose = () => {
    navigate(`/rate-plans/${ratePlanId}/daily-rules`);
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

  if (!dailyRule) {
    return (
      <div className="space-y-4">
        <Card>
          <p className="text-sm text-red-600">{t('ratePlanDailyRules.edit.notFound')}</p>
        </Card>
      </div>
    );
  }

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title={t('ratePlanDailyRules.edit.title')}
      size="lg"
    >
      <RatePlanDailyRuleForm
        dailyRule={dailyRule}
        onSuccess={handleSuccess}
        onCancel={handleClose}
      />
    </Modal>
  );
};

export default EditRatePlanDailyRule;
