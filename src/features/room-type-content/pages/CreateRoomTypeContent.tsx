/**
 * Create Room Type Content Page
 */

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/ui/Modal';
import RoomTypeContentForm from '../components/RoomTypeContentForm';

const CreateRoomTypeContent: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: roomTypeId } = useParams<{ id: string }>();

  const handleSuccess = () => {
    navigate(`/room-types/${roomTypeId}/content`);
  };

  const handleClose = () => {
    navigate(`/room-types/${roomTypeId}/content`);
  };

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title={t('roomTypeContent.create.title')}
      size="2xl"
    >
      <RoomTypeContentForm
        initialRoomTypeId={roomTypeId}
        onSuccess={handleSuccess}
        onCancel={handleClose}
      />
    </Modal>
  );
};

export default CreateRoomTypeContent;
