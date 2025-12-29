/**
 * Create Room Type Facility Link Page
 */

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/ui/Modal';
import RoomTypeFacilityLinkForm from '../components/RoomTypeFacilityLinkForm';

const CreateRoomTypeFacilityLink: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: roomTypeId } = useParams<{ id: string }>();

  const handleSuccess = () => {
    navigate(`/room-types/${roomTypeId}/facilities`);
  };

  const handleClose = () => {
    navigate(`/room-types/${roomTypeId}/facilities`);
  };

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title={t('roomTypeFacilities.create.title')}
      size="lg"
    >
      <RoomTypeFacilityLinkForm
        initialRoomTypeId={roomTypeId}
        onSuccess={handleSuccess}
        onCancel={handleClose}
      />
    </Modal>
  );
};

export default CreateRoomTypeFacilityLink;
