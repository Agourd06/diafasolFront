import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from '../../../components/ui/Modal';
import Loader from '../../../components/Loader';
import Card from '../../../components/ui/Card';
import TaxForm from '../components/TaxForm';
import { useTax } from '../hooks/useTax';

const EditTax: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: tax, isLoading } = useTax(id!);

  const handleSuccess = () => {
    navigate('/taxes');
  };

  const handleClose = () => {
    navigate('/taxes');
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

  if (!tax) {
    return (
      <div className="space-y-4">
        <Card>
          <p className="text-sm text-red-600">{t('taxes.edit.notFound')}</p>
        </Card>
      </div>
    );
  }

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title={t('taxes.edit.title')}
      size="2xl"
    >
      <TaxForm
        tax={tax}
        onSuccess={handleSuccess}
        onCancel={handleClose}
      />
    </Modal>
  );
};

export default EditTax;
