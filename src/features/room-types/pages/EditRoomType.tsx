/**
 * Edit Room Type Page
 * 
 * Page for editing an existing room type.
 */

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/ui/Modal';
import Loader from '@/components/Loader';
import Card from '@/components/ui/Card';
import RoomTypeForm from '../components/RoomTypeForm';
import { useRoomTypeById } from '../hooks';

const EditRoomType: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: roomType, isLoading, error } = useRoomTypeById(id || '', !!id);

  const handleSuccess = () => {
    navigate('/room-types');
  };

  const handleClose = () => {
    navigate('/room-types');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (error || !roomType) {
    return (
      <Card>
        <div className="py-12 text-center">
          <p className="text-sm text-red-600">{t('roomTypes.edit.notFound')}</p>
        </div>
      </Card>
    );
  }

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title={t('roomTypes.edit.title')}
      size="2xl"
    >
      <RoomTypeForm
        roomType={roomType}
        onSuccess={handleSuccess}
        onCancel={handleClose}
      />
    </Modal>
  );
};

export default EditRoomType;
