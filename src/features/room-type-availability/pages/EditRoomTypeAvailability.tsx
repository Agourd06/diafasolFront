/**
 * Edit Room Type Availability Page
 * 
 * Page for editing an existing availability record.
 */

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/ui/Modal';
import Loader from '@/components/Loader';
import Card from '@/components/ui/Card';
import RoomTypeAvailabilityForm from '../components/RoomTypeAvailabilityForm';
import { useRoomTypeAvailabilityById } from '../hooks';

const EditRoomTypeAvailability: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: roomTypeId, availabilityId } = useParams<{ id: string; availabilityId: string }>();

  const { data: availability, isLoading, error } = useRoomTypeAvailabilityById(
    Number(availabilityId),
    !!availabilityId
  );

  const handleSuccess = () => {
    // Navigate back to room type detail page with availability tab active
    // Use roomTypeId from URL params first (most reliable)
    if (roomTypeId) {
      navigate(`/room-types/${roomTypeId}/availability`, { replace: true });
    } else if (availability?.roomTypeId) {
      navigate(`/room-types/${availability.roomTypeId}/availability`, { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleClose = () => {
    // Navigate back to room type detail page with availability tab active
    // Use roomTypeId from URL params first (most reliable)
    if (roomTypeId) {
      navigate(`/room-types/${roomTypeId}/availability`, { replace: true });
    } else if (availability?.roomTypeId) {
      navigate(`/room-types/${availability.roomTypeId}/availability`, { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (error || !availability) {
    return (
      <Card>
        <div className="py-12 text-center">
          <p className="text-sm text-red-600">{t('roomTypeAvailability.edit.notFound')}</p>
        </div>
      </Card>
    );
  }

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title={t('roomTypeAvailability.edit.title')}
      size="lg"
    >
      <RoomTypeAvailabilityForm
        availability={availability}
        onSuccess={handleSuccess}
        onCancel={handleClose}
      />
    </Modal>
  );
};

export default EditRoomTypeAvailability;
