import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Card from '../../../components/ui/Card';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { ActionButtons } from '../../../components/ui/ActionButtons';
import DropdownMenu, { DropdownMenuItem } from '../../../components/ui/DropdownMenu';
import Loader from '../../../components/Loader';
import { useConfirmModal } from '../../../hooks/useConfirmModal';
import { useToast } from '@/context/ToastContext';
import { Property } from '../types';
import { useDeleteProperty } from '../hooks/useDeleteProperty';

type Props = {
  properties?: Property[];
  isLoading?: boolean;
  error?: unknown;
};

const PropertyTable: React.FC<Props> = ({ properties = [], isLoading, error }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const deleteMutation = useDeleteProperty();
  const deleteModal = useConfirmModal();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const handleDeleteClick = (property: Property) => {
    setSelectedProperty(property);
    deleteModal.openModal();
  };


  const handleDeleteConfirm = async () => {
    if (!selectedProperty) return;
    
    try {
      await deleteModal.handleConfirm(async () => {
        await deleteMutation.mutateAsync(selectedProperty.id);
        setSelectedProperty(null);
      });
      showSuccess(t('properties.deleteSuccess', { defaultValue: 'Property deleted successfully!' }));
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || t('common.error', { defaultValue: 'An error occurred' });
      showError(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <Card title={t('properties.title')}>
        <Loader label={t('properties.table.loading')} />
      </Card>
    );
  }

  if (error) {
    // Extract error message from various possible locations
    const axiosError = error as any;
    let errorMessage = t('properties.table.error');
    let backendError = null;

    if (axiosError?.response?.data) {
      // Backend returned error data
      backendError = axiosError.response.data;
      errorMessage =
        axiosError.response.data.message ||
        axiosError.response.data.error ||
        axiosError.response.data.statusCode ||
        errorMessage;
    } else if (axiosError?.message) {
      errorMessage = axiosError.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return (
      <Card title={t('properties.title')}>
        <div className="space-y-3">
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <div className="flex items-start gap-3">
              <svg
                className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-900 mb-1">
                  {t('properties.table.error')}
                </h3>
                <p className="text-sm text-red-700">{errorMessage}</p>
                {axiosError?.response?.status && (
                  <p className="text-xs text-red-600 mt-1">
                    Status: {axiosError.response.status} {axiosError.response.statusText || ''}
                  </p>
                )}
              </div>
            </div>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-2">
              <summary className="text-xs text-slate-600 cursor-pointer hover:text-slate-900 font-medium">
                🔍 Debug Information (Development Only)
              </summary>
              <div className="mt-2 space-y-2">
                {backendError && (
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-1">Backend Error Response:</p>
                    <pre className="text-xs bg-slate-100 p-2 rounded overflow-auto max-h-40">
                      {JSON.stringify(backendError, null, 2)}
                    </pre>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-1">Full Error Object:</p>
                  <pre className="text-xs bg-slate-100 p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(
                      {
                        message: axiosError?.message,
                        status: axiosError?.response?.status,
                        statusText: axiosError?.response?.statusText,
                        url: axiosError?.config?.url,
                        method: axiosError?.config?.method,
                        params: axiosError?.config?.params,
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            </details>
          )}
        </div>
      </Card>
    );
  }

  if (!properties.length) {
    return (
      <Card title={t('properties.title')}>
        <p className="text-sm text-slate-600">{t('properties.table.empty')}</p>
      </Card>
    );
  }

  return (
    <>
      <Card title={t('properties.title')} subtitle={t('properties.table.subtitle')}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('properties.table.title')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('properties.table.currency')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('properties.table.propertyType')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('properties.table.location')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  {t('properties.table.contact')}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">
                  {t('properties.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {properties.map((property) => (
                <tr key={property.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {property.logoUrl && (
                        <img
                          src={property.logoUrl}
                          alt={property.title}
                          className="h-8 w-8 rounded object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <div>
                        <button
                          onClick={() => navigate(`/room-types?propertyId=${property.id}`)}
                          className="font-medium text-slate-900 hover:text-brand-600 transition-colors text-left"
                        >
                          {property.title}
                        </button>
                        {property.website && (
                          <a
                            href={property.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-brand-600 hover:underline"
                          >
                            {t('properties.table.website')}
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <span className="font-mono font-semibold">{property.currency}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {property.propertyType ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-800">
                        {property.propertyType}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {property.city || property.state || property.country ? (
                      <div className="text-xs">
                        {property.city && <div>{property.city}</div>}
                        {property.state && <div>{property.state}</div>}
                        {property.country && (
                          <div className="font-semibold">{property.country}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {property.email || property.phone ? (
                      <div className="text-xs">
                        {property.email && <div>{property.email}</div>}
                        {property.phone && <div>{property.phone}</div>}
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <DropdownMenu
                        trigger={
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                            />
                          </svg>
                        }
                        items={[
                          {
                            label: t('properties.actions.overview'),
                            icon: (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            ),
                            onClick: () => navigate(`/properties/${property.id}`),
                          },
                          {
                            label: t('properties.actions.roomTypes'),
                            icon: (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                              </svg>
                            ),
                            onClick: () => navigate(`/room-types?propertyId=${property.id}`),
                          },
                          { divider: true },
                          {
                            label: t('properties.actions.content'),
                            icon: (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            ),
                            onClick: () => navigate(`/properties/${property.id}/content`),
                          },
                          {
                            label: t('properties.actions.photos'),
                            icon: (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            ),
                            onClick: () => navigate(`/properties/${property.id}/photos`),
                          },
                          {
                            label: t('properties.actions.facilities'),
                            icon: (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                            ),
                            onClick: () => navigate(`/properties/${property.id}/facilities`),
                          },
                          {
                            label: t('properties.actions.settings'),
                            icon: (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            ),
                            onClick: () => navigate(`/properties/${property.id}/settings`),
                          },
                          { divider: true },
                          {
                            label: t('common.edit'),
                            icon: (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            ),
                            onClick: () => navigate(`/properties/edit/${property.id}`),
                          },
                          {
                            label: t('common.delete'),
                            icon: (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            ),
                            onClick: () => handleDeleteClick(property),
                          },
                        ]}
                        align="right"
                      />
                    </div>
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
          selectedProperty
            ? t('modal.delete.messageProperty', { name: selectedProperty.title })
            : t('modal.delete.message')
        }
        confirmText={t('modal.delete.confirm')}
        cancelText={t('modal.delete.cancel')}
        variant="danger"
      />
    </>
  );
};

export default PropertyTable;

