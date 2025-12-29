import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from '../../../components/ui/Modal';
import RatePlanAutoRateSettingForm from '../components/RatePlanAutoRateSettingForm';

const CreateRatePlanAutoRateSetting: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: ratePlanId } = useParams<{ id: string }>();

  if (!ratePlanId) {
    return null; // Don't render if ratePlanId is missing
  }

  const handleSuccess = () => {
    navigate(`/rate-plans/${ratePlanId}/auto-rate-settings`);
  };

  const handleClose = () => {
    navigate(`/rate-plans/${ratePlanId}/auto-rate-settings`);
  };

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title={t('ratePlanAutoRateSettings.create.title')}
      size="lg"
    >
      <RatePlanAutoRateSettingForm 
        initialRatePlanId={ratePlanId} 
        onSuccess={handleSuccess} 
        onCancel={handleClose} 
      />
    </Modal>
  );
};

export default CreateRatePlanAutoRateSetting;
