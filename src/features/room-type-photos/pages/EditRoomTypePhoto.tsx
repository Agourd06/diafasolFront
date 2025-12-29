/**
 * Edit Room Type Photo Page
 */

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/ui/Modal';
import Loader from '@/components/Loader';
import Card from '@/components/ui/Card';
import RoomTypePhotoForm from '../components/RoomTypePhotoForm';
import { useRoomTypePhotoById } from '../hooks';

const EditRoomTypePhoto: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: roomTypeId, photoId } = useParams<{ id: string; photoId: string }>();

  const { data: photo, isLoading, error } = useRoomTypePhotoById(
    photoId || '',
    !!photoId
  );

  const handleSuccess = () => {
    // Navigate back to room type detail page with photos tab active
    // Use roomTypeId from URL params first (most reliable)
    if (roomTypeId) {
      navigate(`/room-types/${roomTypeId}/photos`, { replace: true });
    } else if (photo?.roomTypeId) {
      navigate(`/room-types/${photo.roomTypeId}/photos`, { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleClose = () => {
    // Navigate back to room type detail page with photos tab active
    // Use roomTypeId from URL params first (most reliable)
    if (roomTypeId) {
      navigate(`/room-types/${roomTypeId}/photos`, { replace: true });
    } else if (photo?.roomTypeId) {
      navigate(`/room-types/${photo.roomTypeId}/photos`, { replace: true });
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

  if (error || !photo) {
    return (
      <Card>
        <div className="py-12 text-center">
          <p className="text-sm text-red-600">{t('roomTypePhotos.edit.notFound')}</p>
        </div>
      </Card>
    );
  }

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title={t('roomTypePhotos.edit.title')}
      size="2xl"
    >
      <RoomTypePhotoForm
        photo={photo}
        onSuccess={handleSuccess}
        onCancel={handleClose}
      />
    </Modal>
  );
};

export default EditRoomTypePhoto;
