import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from '../../../components/ui/Modal';
import Loader from '../../../components/Loader';
import Card from '../../../components/ui/Card';
import PropertyContentForm from '../components/PropertyContentForm';
import { usePropertyContentByPropertyId } from '../hooks/usePropertyContentByPropertyId';

const EditPropertyContent: React.FC = () => {
  const { t } = useTranslation();
  const { id: propertyId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: propertyContent, isLoading } = usePropertyContentByPropertyId(propertyId!);

  const handleSuccess = () => {
    if (propertyId) {
      navigate(`/properties/${propertyId}/content`, { replace: true });
    }
  };

  const handleClose = () => {
    if (propertyId) {
      navigate(`/properties/${propertyId}/content`, { replace: true });
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

  if (!propertyContent) {
    return (
      <div className="space-y-4">
        <Card>
          <p className="text-sm text-red-600">{t('propertyContent.edit.notFound')}</p>
        </Card>
      </div>
    );
  }

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title={t('propertyContent.edit.title')}
      size="2xl"
    >
      <PropertyContentForm
        propertyContent={propertyContent}
        onSuccess={handleSuccess}
        onCancel={handleClose}
      />
    </Modal>
  );
};

export default EditPropertyContent;
