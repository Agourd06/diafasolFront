import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from '../../../components/ui/Modal';
import Loader from '../../../components/Loader';
import Card from '../../../components/ui/Card';
import RatePlanAutoRateSettingForm from '../components/RatePlanAutoRateSettingForm';
import { useRatePlanAutoRateSetting } from '../hooks/useRatePlanAutoRateSetting';

const EditRatePlanAutoRateSetting: React.FC = () => {
  const { t } = useTranslation();
  const { id: ratePlanId, settingId } = useParams<{ id: string; settingId: string }>();
  const navigate = useNavigate();

  if (!ratePlanId || !settingId) {
    return null; // Don't render if required params are missing
  }

  const { data: autoRateSetting, isLoading } = useRatePlanAutoRateSetting(parseInt(settingId));

  const handleSuccess = () => {
    navigate(`/rate-plans/${ratePlanId}/auto-rate-settings`);
  };

  const handleClose = () => {
    navigate(`/rate-plans/${ratePlanId}/auto-rate-settings`);
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

  if (!autoRateSetting) {
    return (
      <div className="space-y-4">
        <Card>
          <p className="text-sm text-red-600">{t('ratePlanAutoRateSettings.edit.notFound')}</p>
        </Card>
      </div>
    );
  }

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title={t('ratePlanAutoRateSettings.edit.title')}
      size="lg"
    >
      <RatePlanAutoRateSettingForm
        autoRateSetting={autoRateSetting}
        onSuccess={handleSuccess}
        onCancel={handleClose}
      />
    </Modal>
  );
};

export default EditRatePlanAutoRateSetting;
