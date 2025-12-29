/**
 * Create Room Type Availability Page
 * 
 * Page for creating a new availability record.
 */

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/ui/Modal';
import RoomTypeAvailabilityForm from '../components/RoomTypeAvailabilityForm';

const CreateRoomTypeAvailability: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: roomTypeId } = useParams<{ id: string }>();

  const handleSuccess = () => {
    navigate(`/room-types/${roomTypeId}/availability`);
  };

  const handleClose = () => {
    navigate(`/room-types/${roomTypeId}/availability`);
  };

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title={t('roomTypeAvailability.create.title')}
      size="lg"
    >
      <RoomTypeAvailabilityForm
        initialRoomTypeId={roomTypeId}
        onSuccess={handleSuccess}
        onCancel={handleClose}
      />
    </Modal>
  );
};

export default CreateRoomTypeAvailability;
