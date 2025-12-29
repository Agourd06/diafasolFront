import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from '../../../components/ui/Modal';
import TaxSetForm from '../components/TaxSetForm';

const CreateTaxSet: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const propertyIdFromQuery = searchParams.get('propertyId');

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  const handleClose = () => {
    if (propertyIdFromQuery) {
      navigate(`/tax-sets?propertyId=${propertyIdFromQuery}`);
    } else {
      navigate('/tax-sets');
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title={t('taxSets.create.title')}
      size="2xl"
    >
      <TaxSetForm
        initialPropertyId={propertyIdFromQuery || undefined}
        onSuccess={handleSuccess}
        onCancel={handleClose}
      />
    </Modal>
  );
};

export default CreateTaxSet;
