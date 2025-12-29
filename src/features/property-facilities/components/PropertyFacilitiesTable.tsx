import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../../components/ui/Card';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { ActionButtons } from '../../../components/ui/ActionButtons';
import Loader from '../../../components/Loader';
import { useConfirmModal } from '../../../hooks/useConfirmModal';
import { PropertyFacilityLink } from '../types';
import { useDeletePropertyFacilityLink } from '../hooks/useDeletePropertyFacilityLink';

type Props = {
  propertyFacilities?: PropertyFacilityLink[];
  isLoading?: boolean;
  error?: unknown;
};

const PropertyFacilitiesTable: React.FC<Props> = ({
  propertyFacilities = [],
  isLoading,
  error,
}) => {
  const { t } = useTranslation();
  const deleteMutation = useDeletePropertyFacilityLink();
  const deleteModal = useConfirmModal();
  const [selectedLink, setSelectedLink] = useState<PropertyFacilityLink | null>(null);

  const handleDeleteClick = (link: PropertyFacilityLink) => {
    setSelectedLink(link);
    deleteModal.openModal();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedLink) return;

    await deleteModal.handleConfirm(async () => {
      await deleteMutation.mutateAsync({
        propertyId: selectedLink.propertyId,
        facilityId: selectedLink.facilityId,
      });
      setSelectedLink(null);
    });
  };

  if (isLoading) {
    return (
      <Card title={t('propertyFacilities.title')}>
        <Loader label={t('propertyFacilities.table.loading')} />
      </Card>
    );
  }

  if (error) {
    return (
      <Card title={t('propertyFacilities.title')}>
        <p className="text-sm text-red-600">{t('propertyFacilities.table.error')}</p>
      </Card>
    );
  }

  if (!propertyFacilities.length) {
    return (
      <Card title={t('propertyFacilities.title')}>
        <p className="text-sm text-slate-600">{t('propertyFacilities.table.empty')}</p>
      </Card>
    );
  }

  return (
    <>
      <Card title={t('propertyFacilities.title')} subtitle={t('propertyFacilities.table.subtitle')}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('propertyFacilities.table.property')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('propertyFacilities.table.facility')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('propertyFacilities.table.facilityDescription')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('propertyFacilities.table.createdAt')}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">
                  {t('propertyFacilities.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {propertyFacilities.map((link) => (
                <tr key={`${link.propertyId}-${link.facilityId}`} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">
                      {link.property?.title || link.propertyId}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">
                      {link.facility?.name || link.facilityId}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {link.facility?.description ? (
                      <div className="max-w-md truncate text-sm">
                        {link.facility.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 80)}
                        {link.facility.description.replace(/<[^>]*>/g, '').trim().length > 80 && '...'}
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(link.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <ActionButtons
                      onDelete={() => handleDeleteClick(link)}
                      showEdit={false}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteModal.isLoading}
        title={t('modal.delete.title')}
        message={
          selectedLink
            ? t('modal.delete.messagePropertyFacility', {
                property: selectedLink.property?.title || selectedLink.propertyId,
                facility: selectedLink.facility?.name || selectedLink.facilityId,
              })
            : t('modal.delete.message')
        }
        confirmText={t('modal.delete.confirm')}
        cancelText={t('modal.delete.cancel')}
        variant="danger"
      />
    </>
  );
};

export default PropertyFacilitiesTable;

