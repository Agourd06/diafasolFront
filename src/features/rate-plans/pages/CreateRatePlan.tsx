import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from '../../../components/ui/Modal';
import RatePlanForm from '../components/RatePlanForm';
import { useRoomTypeById } from '@/features/room-types/hooks/useRoomTypeById';

const CreateRatePlan: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: propertyId } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const propertyIdFromQuery = searchParams.get('propertyId');
  const roomTypeIdFromQuery = searchParams.get('roomTypeId');
  const taxSetIdFromQuery = searchParams.get('taxSetId');
  const finalPropertyId = propertyId || propertyIdFromQuery;
  
  // Fetch room type if creating from room type context
  const { data: roomType } = useRoomTypeById(roomTypeIdFromQuery || '');
  
  // Use room type's property ID if available, otherwise use the property ID from params/query
  const initialPropertyId = roomType?.propertyId || finalPropertyId;

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  const handleClose = () => {
    if (roomTypeIdFromQuery) {
      navigate(`/room-types/${roomTypeIdFromQuery}/rate-plans`);
    } else if (finalPropertyId) {
      navigate(`/properties/${finalPropertyId}/rate-plans`);
    } else {
      navigate('/rate-plans');
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title={t('ratePlans.create.title')}
      size="2xl"
    >
      <RatePlanForm
        initialPropertyId={initialPropertyId || undefined}
        initialRoomTypeId={roomTypeIdFromQuery || undefined}
        initialTaxSetId={taxSetIdFromQuery || undefined}
        onSuccess={handleSuccess}
        onCancel={handleClose}
      />
    </Modal>
  );
};

export default CreateRatePlan;
