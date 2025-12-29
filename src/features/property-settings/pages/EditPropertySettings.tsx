import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from '../../../components/ui/Modal';
import Loader from '../../../components/Loader';
import Card from '../../../components/ui/Card';
import PropertySettingsForm from '../components/PropertySettingsForm';
import { usePropertySettingsByPropertyId } from '../hooks/usePropertySettingsByPropertyId';

const EditPropertySettings: React.FC = () => {
  const { t } = useTranslation();
  const { id: propertyId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: propertySettings, isLoading } = usePropertySettingsByPropertyId(propertyId!);

  const handleSuccess = () => {
    if (propertyId) {
      navigate(`/properties/${propertyId}/settings`, { replace: true });
    }
  };

  const handleClose = () => {
    if (propertyId) {
      navigate(`/properties/${propertyId}/settings`, { replace: true });
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

  if (!propertySettings) {
    return (
      <div className="space-y-4">
        <Card>
          <p className="text-sm text-red-600">{t('propertySettings.edit.notFound')}</p>
        </Card>
      </div>
    );
  }

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title={t('propertySettings.edit.title')}
      size="2xl"
    >
      <PropertySettingsForm
        propertySettings={propertySettings}
        onSuccess={handleSuccess}
        onCancel={handleClose}
      />
    </Modal>
  );
};

export default EditPropertySettings;
