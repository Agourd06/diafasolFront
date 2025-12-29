import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from '../../../components/ui/Modal';
import PropertyContentForm from '../components/PropertyContentForm';

const CreatePropertyContent: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: propertyId } = useParams<{ id: string }>();

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

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title={t('propertyContent.create.title')}
      size="2xl"
    >
      <PropertyContentForm
        initialPropertyId={propertyId}
        onSuccess={handleSuccess}
        onCancel={handleClose}
      />
    </Modal>
  );
};

export default CreatePropertyContent;
