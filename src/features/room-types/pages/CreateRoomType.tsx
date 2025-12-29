/**
 * Create Room Type Page
 * 
 * Page for creating a new room type.
 */

import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/ui/Modal';
import RoomTypeForm from '../components/RoomTypeForm';

const CreateRoomType: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get('propertyId');

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  const handleClose = () => {
    if (propertyId) {
      navigate(`/room-types?propertyId=${propertyId}`);
    } else {
      navigate('/room-types');
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title={t('roomTypes.create.title')}
      size="2xl"
    >
      <RoomTypeForm
        initialPropertyId={propertyId || undefined}
        onSuccess={handleSuccess}
        onCancel={handleClose}
      />
    </Modal>
  );
};

export default CreateRoomType;
