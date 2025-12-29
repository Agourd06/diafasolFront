/**
 * Edit Room Type Content Page
 */

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/ui/Modal';
import Loader from '@/components/Loader';
import Card from '@/components/ui/Card';
import RoomTypeContentForm from '../components/RoomTypeContentForm';
import { useRoomTypeContentByRoomType } from '../hooks';

const EditRoomTypeContent: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: roomTypeId } = useParams<{ id: string }>();

  const { data: content, isLoading, error } = useRoomTypeContentByRoomType(
    roomTypeId || '',
    !!roomTypeId
  );

  const handleSuccess = () => {
    // Navigate back to room type detail page with content tab active
    // Use roomTypeId from URL params (most reliable)
    if (roomTypeId) {
      navigate(`/room-types/${roomTypeId}/content`, { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleClose = () => {
    // Navigate back to room type detail page with content tab active
    // Use roomTypeId from URL params (most reliable)
    if (roomTypeId) {
      navigate(`/room-types/${roomTypeId}/content`, { replace: true });
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

  if (error || !content) {
    return (
      <Card>
        <div className="py-12 text-center">
          <p className="text-sm text-red-600">{t('roomTypeContent.edit.notFound')}</p>
        </div>
      </Card>
    );
  }

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title={t('roomTypeContent.edit.title')}
      size="2xl"
    >
      <RoomTypeContentForm
        content={content}
        onSuccess={handleSuccess}
        onCancel={handleClose}
      />
    </Modal>
  );
};

export default EditRoomTypeContent;
