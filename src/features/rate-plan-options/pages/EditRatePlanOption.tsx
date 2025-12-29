import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from '../../../components/ui/Modal';
import Loader from '../../../components/Loader';
import Card from '../../../components/ui/Card';
import RatePlanOptionForm from '../components/RatePlanOptionForm';
import { useRatePlanOption } from '../hooks/useRatePlanOption';

const EditRatePlanOption: React.FC = () => {
  const { t } = useTranslation();
  const { id: ratePlanId, optionId } = useParams<{ id: string; optionId: string }>();
  const navigate = useNavigate();

  // Support both nested route (optionId) and standalone route (id)
  const actualOptionId = optionId || id;
  const actualRatePlanId = ratePlanId;

  const { data: ratePlanOption, isLoading } = useRatePlanOption(parseInt(actualOptionId!));

  const handleSuccess = () => {
    // Navigate back to rate plan detail page with options tab active if we have ratePlanId
    if (actualRatePlanId) {
      navigate(`/rate-plans/${actualRatePlanId}/options`, { replace: true });
    } else if (ratePlanOption?.ratePlanId) {
      navigate(`/rate-plans/${ratePlanOption.ratePlanId}/options`, { replace: true });
    } else {
      navigate('/rate-plan-options', { replace: true });
    }
  };

  const handleClose = () => {
    // Navigate back to rate plan detail page with options tab active if we have ratePlanId
    if (actualRatePlanId) {
      navigate(`/rate-plans/${actualRatePlanId}/options`, { replace: true });
    } else if (ratePlanOption?.ratePlanId) {
      navigate(`/rate-plans/${ratePlanOption.ratePlanId}/options`, { replace: true });
    } else {
      navigate('/rate-plan-options', { replace: true });
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

  if (!ratePlanOption) {
    return (
      <div className="space-y-4">
        <Card>
          <p className="text-sm text-red-600">{t('ratePlanOptions.edit.notFound')}</p>
        </Card>
      </div>
    );
  }

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title={t('ratePlanOptions.edit.title')}
      size="lg"
    >
      <RatePlanOptionForm
        ratePlanOption={ratePlanOption}
        initialRatePlanId={actualRatePlanId || ratePlanOption?.ratePlanId}
        onSuccess={handleSuccess}
        onCancel={handleClose}
      />
    </Modal>
  );
};

export default EditRatePlanOption;
