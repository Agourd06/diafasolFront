/**
 * Create Room Type Photo Page
 */

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/ui/Modal';
import RoomTypePhotoForm from '../components/RoomTypePhotoForm';

const CreateRoomTypePhoto: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: roomTypeId } = useParams<{ id: string }>();

  const handleSuccess = () => {
    navigate(`/room-types/${roomTypeId}/photos`);
  };

  const handleClose = () => {
    navigate(`/room-types/${roomTypeId}/photos`);
  };

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title={t('roomTypePhotos.create.title')}
      size="2xl"
    >
      <RoomTypePhotoForm
        initialRoomTypeId={roomTypeId}
        onSuccess={handleSuccess}
        onCancel={handleClose}
      />
    </Modal>
  );
};

export default CreateRoomTypePhoto;
