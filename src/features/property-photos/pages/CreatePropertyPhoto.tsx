import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from '../../../components/ui/Modal';
import PropertyPhotoForm from '../components/PropertyPhotoForm';

const CreatePropertyPhoto: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: propertyId } = useParams<{ id: string }>();

  const handleSuccess = () => {
    if (propertyId) {
      navigate(`/properties/${propertyId}/photos`, { replace: true });
    }
  };

  const handleClose = () => {
    if (propertyId) {
      navigate(`/properties/${propertyId}/photos`, { replace: true });
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title={t('propertyPhotos.create.title')}
      size="2xl"
    >
      <PropertyPhotoForm
        initialPropertyId={propertyId}
        onSuccess={handleSuccess}
        onCancel={handleClose}
      />
    </Modal>
  );
};

export default CreatePropertyPhoto;
