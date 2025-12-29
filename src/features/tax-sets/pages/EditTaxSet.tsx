import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import TaxSetForm from '../components/TaxSetForm';
import { useTaxSet } from '../hooks/useTaxSet';
import Loader from '../../../components/Loader';
import Card from '../../../components/ui/Card';

const EditTaxSet: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: taxSet, isLoading: taxSetLoading } = useTaxSet(id!);

  const handleSuccess = () => {
    navigate(`/tax-sets/${id}`);
  };

  const handleClose = () => {
    navigate(`/tax-sets/${id}`);
  };

  if (taxSetLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <Loader label={t('common.loading')} />
        </Card>
      </div>
    );
  }

  if (!taxSet) {
    return (
      <div className="space-y-4">
        <Card>
          <p className="text-sm text-red-600">{t('taxSets.edit.notFound')}</p>
        </Card>
      </div>
    );
  }

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title={t('taxSets.edit.title')}
      size="2xl"
    >
      <TaxSetForm
        taxSet={taxSet}
        onSuccess={handleSuccess}
        onCancel={handleClose}
      />
    </Modal>
  );
};

export default EditTaxSet;

