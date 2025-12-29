import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../../components/ui/Card';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { ActionButtons } from '../../../components/ui/ActionButtons';
import Loader from '../../../components/Loader';
import { useConfirmModal } from '../../../hooks/useConfirmModal';
import { useToast } from '@/context/ToastContext';
import Modal from '../../../components/ui/Modal';
import { PropertySettings } from '../types';
import { useDeletePropertySettings } from '../hooks/useDeletePropertySettings';

type Props = {
  propertySettings?: PropertySettings[];
  isLoading?: boolean;
  error?: unknown;
};

const PropertySettingsTable: React.FC<Props> = ({ propertySettings = [], isLoading, error }) => {
  const { t } = useTranslation();
  const deleteMutation = useDeletePropertySettings();
  const deleteModal = useConfirmModal();
  const [selectedSettings, setSelectedSettings] = useState<PropertySettings | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [settingsToView, setSettingsToView] = useState<PropertySettings | null>(null);

  const handleDeleteClick = (settings: PropertySettings) => {
    setSelectedSettings(settings);
    deleteModal.openModal();
  };

  const handleViewClick = (settings: PropertySettings) => {
    setSettingsToView(settings);
    setViewModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSettings) return;

    try {
      await deleteModal.handleConfirm(async () => {
        await deleteMutation.mutateAsync(selectedSettings.propertyId);
        setSelectedSettings(null);
      });
      showSuccess(t('propertySettings.deleteSuccess', { defaultValue: 'Settings deleted successfully!' }));
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || t('common.error', { defaultValue: 'An error occurred' });
      showError(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <Card title={t('propertySettings.title')}>
        <Loader label={t('propertySettings.table.loading')} />
      </Card>
    );
  }

  if (error) {
    return (
      <Card title={t('propertySettings.title')}>
        <p className="text-sm text-red-600">{t('propertySettings.table.error')}</p>
      </Card>
    );
  }

  if (!propertySettings.length) {
    return (
      <Card title={t('propertySettings.title')}>
        <p className="text-sm text-slate-600">{t('propertySettings.table.empty')}</p>
      </Card>
    );
  }

  return (
    <>
      <Card title={t('propertySettings.title')} subtitle={t('propertySettings.table.subtitle')}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('propertySettings.table.property')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('propertySettings.table.autoUpdate')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('propertySettings.table.pricing')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('propertySettings.table.advanced')}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">
                  {t('propertySettings.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {propertySettings.map((settings) => (
                <tr key={settings.propertyId} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">
                      {settings.property?.title || settings.propertyId}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <div className="flex flex-wrap gap-1">
                      {settings.allowAvailabilityAutoupdateOnConfirmation && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {t('propertySettings.table.onConfirmation')}
                        </span>
                      )}
                      {settings.allowAvailabilityAutoupdateOnModification && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {t('propertySettings.table.onModification')}
                        </span>
                      )}
                      {settings.allowAvailabilityAutoupdateOnCancellation && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {t('propertySettings.table.onCancellation')}
                        </span>
                      )}
                      {!settings.allowAvailabilityAutoupdateOnConfirmation &&
                        !settings.allowAvailabilityAutoupdateOnModification &&
                        !settings.allowAvailabilityAutoupdateOnCancellation && (
                          <span className="text-slate-400">—</span>
                        )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <div className="text-xs space-y-1">
                      {settings.minPrice !== undefined && (
                        <div>
                          {t('propertySettings.table.min')}: {settings.minPrice}
                        </div>
                      )}
                      {settings.maxPrice !== undefined && (
                        <div>
                          {t('propertySettings.table.max')}: {settings.maxPrice}
                        </div>
                      )}
                      {settings.minStayType && (
                        <div className="text-slate-500">
                          {t('propertySettings.table.stayType')}: {settings.minStayType}
                        </div>
                      )}
                      {!settings.minPrice &&
                        !settings.maxPrice &&
                        !settings.minStayType && <span className="text-slate-400">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <div className="text-xs space-y-1">
                      {settings.cutOffTime && (
                        <div>
                          {t('propertySettings.table.cutOff')}: {settings.cutOffTime}
                        </div>
                      )}
                      {settings.cutOffDays !== undefined && (
                        <div>
                          {t('propertySettings.table.cutOffDays')}: {settings.cutOffDays}
                        </div>
                      )}
                      {settings.maxDayAdvance !== undefined && (
                        <div>
                          {t('propertySettings.table.maxAdvance')}: {settings.maxDayAdvance}
                        </div>
                      )}
                      {!settings.cutOffTime &&
                        settings.cutOffDays === undefined &&
                        settings.maxDayAdvance === undefined && (
                          <span className="text-slate-400">—</span>
                        )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <ActionButtons
                      editPath={`/properties/${settings.propertyId}/settings/edit`}
                      onDelete={() => handleDeleteClick(settings)}
                      onView={() => handleViewClick(settings)}
                      showView={true}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View Details Modal */}
      {settingsToView && (
        <Modal
          isOpen={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false);
            setSettingsToView(null);
          }}
          title={settingsToView.property?.title || t('propertySettings.details.title')}
          size="2xl"
        >
          <div className="space-y-6">
            {/* Property Info */}
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {t('propertySettings.details.property')}
              </label>
              <p className="mt-1 text-base font-semibold text-slate-900">
                {settingsToView.property?.title || settingsToView.propertyId}
              </p>
            </div>

            {/* Availability Auto-update */}
            {(settingsToView.allowAvailabilityAutoupdateOnConfirmation ||
              settingsToView.allowAvailabilityAutoupdateOnModification ||
              settingsToView.allowAvailabilityAutoupdateOnCancellation) && (
              <div className="rounded-lg bg-slate-50 p-4">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  {t('propertySettings.details.availabilitySettings')}
                </h4>
                <div className="space-y-2 text-sm">
                  {settingsToView.allowAvailabilityAutoupdateOnConfirmation && (
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>{t('propertySettings.details.allowOnConfirmation')}</span>
                    </div>
                  )}
                  {settingsToView.allowAvailabilityAutoupdateOnModification && (
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">✓</span>
                      <span>{t('propertySettings.details.allowOnModification')}</span>
                    </div>
                  )}
                  {settingsToView.allowAvailabilityAutoupdateOnCancellation && (
                    <div className="flex items-center gap-2">
                      <span className="text-red-600">✓</span>
                      <span>{t('propertySettings.details.allowOnCancellation')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pricing */}
            {(settingsToView.minPrice !== undefined ||
              settingsToView.maxPrice !== undefined ||
              settingsToView.minStayType) && (
              <div className="rounded-lg bg-slate-50 p-4">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  {t('propertySettings.details.pricingSettings')}
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {settingsToView.minStayType && (
                    <div>
                      <span className="text-slate-500">{t('propertySettings.details.minStayType')}:</span>{' '}
                      <span className="text-slate-700 capitalize">{settingsToView.minStayType}</span>
                    </div>
                  )}
                  {settingsToView.minPrice !== undefined && (
                    <div>
                      <span className="text-slate-500">{t('propertySettings.details.minPrice')}:</span>{' '}
                      <span className="text-slate-700 font-semibold">{settingsToView.minPrice}</span>
                    </div>
                  )}
                  {settingsToView.maxPrice !== undefined && (
                    <div>
                      <span className="text-slate-500">{t('propertySettings.details.maxPrice')}:</span>{' '}
                      <span className="text-slate-700 font-semibold">{settingsToView.maxPrice}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Advanced Settings */}
            {(settingsToView.stateLength !== undefined ||
              settingsToView.cutOffTime ||
              settingsToView.cutOffDays !== undefined ||
              settingsToView.maxDayAdvance !== undefined) && (
              <div className="rounded-lg bg-slate-50 p-4">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  {t('propertySettings.details.advancedSettings')}
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {settingsToView.stateLength !== undefined && (
                    <div>
                      <span className="text-slate-500">{t('propertySettings.details.stateLength')}:</span>{' '}
                      <span className="text-slate-700">{settingsToView.stateLength}</span>
                    </div>
                  )}
                  {settingsToView.cutOffTime && (
                    <div>
                      <span className="text-slate-500">{t('propertySettings.details.cutOffTime')}:</span>{' '}
                      <span className="text-slate-700 font-mono">{settingsToView.cutOffTime}</span>
                    </div>
                  )}
                  {settingsToView.cutOffDays !== undefined && (
                    <div>
                      <span className="text-slate-500">{t('propertySettings.details.cutOffDays')}:</span>{' '}
                      <span className="text-slate-700">{settingsToView.cutOffDays}</span>
                    </div>
                  )}
                  {settingsToView.maxDayAdvance !== undefined && (
                    <div>
                      <span className="text-slate-500">{t('propertySettings.details.maxDayAdvance')}:</span>{' '}
                      <span className="text-slate-700">{settingsToView.maxDayAdvance}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="rounded-lg bg-slate-50 p-4">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                {t('propertySettings.details.metadata')}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">{t('propertySettings.details.propertyId')}:</span>{' '}
                  <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs text-slate-700">
                    {settingsToView.propertyId}
                  </code>
                </div>
                <div>
                  <span className="text-slate-500">{t('propertySettings.details.companyId')}:</span>{' '}
                  <span className="font-medium text-slate-700">{settingsToView.companyId}</span>
                </div>
                <div>
                  <span className="text-slate-500">{t('propertySettings.details.createdAt')}:</span>{' '}
                  <span className="text-slate-700">
                    {new Date(settingsToView.createdAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">{t('propertySettings.details.updatedAt')}:</span>{' '}
                  <span className="text-slate-700">
                    {new Date(settingsToView.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteModal.isLoading}
        title={t('modal.delete.title')}
        message={
          selectedSettings
            ? t('modal.delete.messagePropertySettings', {
                name: selectedSettings.property?.title || selectedSettings.propertyId,
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

export default PropertySettingsTable;

