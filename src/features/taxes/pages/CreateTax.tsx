import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from '../../../components/ui/Modal';
import TaxForm from '../components/TaxForm';

const CreateTax: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const preselectedPropertyId = searchParams.get('propertyId');
  const returnTo = searchParams.get('returnTo');

  const handleSuccess = () => {
    navigate(returnTo || '/taxes');
  };

  const handleClose = () => {
    navigate(returnTo || '/taxes');
  };

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title={t('taxes.create.title')}
      size="2xl"
    >
      <TaxForm
        defaultPropertyId={preselectedPropertyId || undefined}
        onSuccess={handleSuccess}
        onCancel={handleClose}
      />
    </Modal>
  );
};

export default CreateTax;
