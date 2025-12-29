import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from '../../../components/ui/Modal';
import Loader from '../../../components/Loader';
import Card from '../../../components/ui/Card';
import PropertyPhotoForm from '../components/PropertyPhotoForm';
import { usePropertyPhotoById } from '../hooks/usePropertyPhotoById';

const EditPropertyPhoto: React.FC = () => {
  const { t } = useTranslation();
  const { id: propertyId, photoId } = useParams<{ id: string; photoId: string }>();
  const navigate = useNavigate();

  const { data: propertyPhoto, isLoading } = usePropertyPhotoById(Number(photoId));

  const handleSuccess = () => {
    const targetPropertyId = propertyPhoto?.propertyId || propertyId;
    if (targetPropertyId) {
      navigate(`/properties/${targetPropertyId}/photos`, { replace: true });
    }
  };

  const handleClose = () => {
    const targetPropertyId = propertyPhoto?.propertyId || propertyId;
    if (targetPropertyId) {
      navigate(`/properties/${targetPropertyId}/photos`, { replace: true });
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

  if (!propertyPhoto) {
    return (
      <div className="space-y-4">
        <Card>
          <p className="text-sm text-red-600">{t('propertyPhotos.edit.notFound')}</p>
        </Card>
      </div>
    );
  }

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title={t('propertyPhotos.edit.title')}
      size="2xl"
    >
      <PropertyPhotoForm
        propertyPhoto={propertyPhoto}
        onSuccess={handleSuccess}
        onCancel={handleClose}
      />
    </Modal>
  );
};

export default EditPropertyPhoto;
