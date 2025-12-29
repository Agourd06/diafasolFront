import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from '../../../components/ui/Modal';
import Loader from '../../../components/Loader';
import Card from '../../../components/ui/Card';
import RatePlanForm from '../components/RatePlanForm';
import { useRatePlan } from '../hooks/useRatePlan';

const EditRatePlan: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch rate plan data
  const { data: ratePlan, isLoading } = useRatePlan(id!);

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  const handleClose = () => {
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <Loader label={t('common.loading')} />
        </Card>
      </div>
    );
  }

  if (!ratePlan) {
    return (
      <div className="space-y-4">
        <Card>
          <p className="text-sm text-red-600">{t('ratePlans.edit.notFound')}</p>
        </Card>
      </div>
    );
  }

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title={t('ratePlans.edit.title')}
      size="2xl"
    >
      <RatePlanForm
        ratePlan={ratePlan}
        onSuccess={handleSuccess}
        onCancel={handleClose}
      />
    </Modal>
  );
};

export default EditRatePlan;
