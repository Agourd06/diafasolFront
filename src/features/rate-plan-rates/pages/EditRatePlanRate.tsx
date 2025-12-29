import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from '../../../components/ui/Modal';
import Loader from '../../../components/Loader';
import Card from '../../../components/ui/Card';
import RatePlanRateForm from '../components/RatePlanRateForm';
import { useRatePlanRate } from '../hooks/useRatePlanRate';

const EditRatePlanRate: React.FC = () => {
  const { t } = useTranslation();
  const { id: ratePlanId, rateId } = useParams<{ id: string; rateId: string }>();
  const navigate = useNavigate();

  const { data: ratePlanRate, isLoading } = useRatePlanRate(Number(rateId));

  const handleSuccess = () => {
    // Navigate back to rate plan detail page with rates tab active
    if (ratePlanId) {
      navigate(`/rate-plans/${ratePlanId}/rates`, { replace: true });
    } else if (ratePlanRate?.ratePlanId) {
      navigate(`/rate-plans/${ratePlanRate.ratePlanId}/rates`, { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleClose = () => {
    // Navigate back to rate plan detail page with rates tab active
    if (ratePlanId) {
      navigate(`/rate-plans/${ratePlanId}/rates`, { replace: true });
    } else if (ratePlanRate?.ratePlanId) {
      navigate(`/rate-plans/${ratePlanRate.ratePlanId}/rates`, { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
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

  if (!ratePlanRate) {
    return (
      <div className="space-y-4">
        <Card>
          <p className="text-sm text-red-600">{t('ratePlanRates.edit.notFound')}</p>
        </Card>
      </div>
    );
  }

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title={t('ratePlanRates.edit.title')}
      size="lg"
    >
      <RatePlanRateForm
        ratePlanRate={ratePlanRate}
        onSuccess={handleSuccess}
        onCancel={handleClose}
      />
    </Modal>
  );
};

export default EditRatePlanRate;
