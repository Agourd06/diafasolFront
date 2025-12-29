import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../../../components/ui/Modal';
import { RatePlan } from '../types';

type RatePlanDetailsModalProps = {
  ratePlan: RatePlan | null;
  isOpen: boolean;
  onClose: () => void;
};

const RatePlanDetailsModal: React.FC<RatePlanDetailsModalProps> = ({
  ratePlan,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();

  if (!ratePlan) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={ratePlan.title} size="2xl">
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {t('ratePlans.details.title')}
            </label>
            <p className="mt-1 text-base font-semibold text-slate-900">{ratePlan.title}</p>
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {t('ratePlans.details.currency')}
            </label>
            <p className="mt-1 text-base font-mono font-semibold text-slate-900">
              {ratePlan.currency}
            </p>
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {t('ratePlans.details.sellMode')}
            </label>
            <p className="mt-1 text-base text-slate-700">{ratePlan.sellMode}</p>
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {t('ratePlans.details.rateMode')}
            </label>
            <p className="mt-1 text-base text-slate-700">{ratePlan.rateMode}</p>
          </div>
        </div>

        {/* IDs Section */}
        <div className="rounded-lg bg-slate-50 p-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
            {t('ratePlans.details.references')}
          </h4>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div>
              <span className="text-slate-500">{t('ratePlans.details.propertyId')}:</span>{' '}
              <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs text-slate-700">
                {ratePlan.propertyId}
              </code>
            </div>
            <div>
              <span className="text-slate-500">{t('ratePlans.details.roomTypeId')}:</span>{' '}
              <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs text-slate-700">
                {ratePlan.roomTypeId}
              </code>
            </div>
            <div>
              <span className="text-slate-500">{t('ratePlans.details.taxId')}:</span>{' '}
              <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs text-slate-700">
                {ratePlan.taxSetId}
              </code>
            </div>
            {ratePlan.parentRatePlanId && (
              <div>
                <span className="text-slate-500">{t('ratePlans.details.parentRatePlanId')}:</span>{' '}
                <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs text-slate-700">
                  {ratePlan.parentRatePlanId}
                </code>
              </div>
            )}
          </div>
        </div>

        {/* Fees */}
        <div className="rounded-lg bg-slate-50 p-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
            {t('ratePlans.details.fees')}
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">{t('ratePlans.details.childrenFee')}:</span>{' '}
              <span className="font-semibold text-slate-700">
                {ratePlan.childrenFee} {ratePlan.currency}
              </span>
            </div>
            <div>
              <span className="text-slate-500">{t('ratePlans.details.infantFee')}:</span>{' '}
              <span className="font-semibold text-slate-700">
                {ratePlan.infantFee} {ratePlan.currency}
              </span>
            </div>
          </div>
        </div>

        {/* Inheritance Flags */}
        {ratePlan.parentRatePlanId && (
          <div className="rounded-lg bg-slate-50 p-4">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
              {t('ratePlans.details.inheritance')}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                { key: 'inheritRate', label: 'Rate' },
                { key: 'inheritClosedToArrival', label: 'Closed to Arrival' },
                { key: 'inheritClosedToDeparture', label: 'Closed to Departure' },
                { key: 'inheritStopSell', label: 'Stop Sell' },
                { key: 'inheritMinStayArrival', label: 'Min Stay Arrival' },
                { key: 'inheritMinStayThrough', label: 'Min Stay Through' },
                { key: 'inheritMaxStay', label: 'Max Stay' },
                { key: 'inheritMaxSell', label: 'Max Sell' },
                { key: 'inheritMaxAvailability', label: 'Max Availability' },
                { key: 'inheritAvailabilityOffset', label: 'Availability Offset' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-2">
                  <span className={`inline-block h-2 w-2 rounded-full ${
                    ratePlan[key as keyof RatePlan] ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  <span className="text-slate-700">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* JSON Fields */}
        {(ratePlan.maxStay || ratePlan.minStayArrival || ratePlan.minStayThrough) && (
          <div className="rounded-lg bg-slate-50 p-4">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
              {t('ratePlans.details.stayRestrictions')}
            </h4>
            <div className="space-y-2 text-sm">
              {ratePlan.maxStay && (
                <div>
                  <span className="text-slate-500">{t('ratePlans.details.maxStay')}:</span>{' '}
                  <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs text-slate-700">
                    {JSON.stringify(ratePlan.maxStay)}
                  </code>
                </div>
              )}
              {ratePlan.minStayArrival && (
                <div>
                  <span className="text-slate-500">{t('ratePlans.details.minStayArrival')}:</span>{' '}
                  <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs text-slate-700">
                    {JSON.stringify(ratePlan.minStayArrival)}
                  </code>
                </div>
              )}
              {ratePlan.minStayThrough && (
                <div>
                  <span className="text-slate-500">{t('ratePlans.details.minStayThrough')}:</span>{' '}
                  <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs text-slate-700">
                    {JSON.stringify(ratePlan.minStayThrough)}
                  </code>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Availability Restrictions */}
        {(ratePlan.closedToArrival || ratePlan.closedToDeparture || ratePlan.stopSell) && (
          <div className="rounded-lg bg-slate-50 p-4">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
              {t('ratePlans.details.availabilityRestrictions')}
            </h4>
            <div className="space-y-2 text-sm">
              {ratePlan.closedToArrival && (
                <div>
                  <span className="text-slate-500">{t('ratePlans.details.closedToArrival')}:</span>{' '}
                  <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs text-slate-700">
                    {JSON.stringify(ratePlan.closedToArrival)}
                  </code>
                </div>
              )}
              {ratePlan.closedToDeparture && (
                <div>
                  <span className="text-slate-500">{t('ratePlans.details.closedToDeparture')}:</span>{' '}
                  <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs text-slate-700">
                    {JSON.stringify(ratePlan.closedToDeparture)}
                  </code>
                </div>
              )}
              {ratePlan.stopSell && (
                <div>
                  <span className="text-slate-500">{t('ratePlans.details.stopSell')}:</span>{' '}
                  <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs text-slate-700">
                    {JSON.stringify(ratePlan.stopSell)}
                  </code>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Auto Rate Settings */}
        {ratePlan.autoRateSettings && (
          <div className="rounded-lg bg-slate-50 p-4">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
              {t('ratePlans.details.autoRateSettings')}
            </h4>
            <pre className="text-xs bg-slate-200 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(ratePlan.autoRateSettings, null, 2)}
            </pre>
          </div>
        )}

        {/* Metadata */}
        <div className="rounded-lg bg-slate-50 p-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
            {t('ratePlans.details.metadata')}
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">{t('ratePlans.details.id')}:</span>{' '}
              <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs text-slate-700">
                {ratePlan.id}
              </code>
            </div>
            <div>
              <span className="text-slate-500">{t('ratePlans.details.companyId')}:</span>{' '}
              <span className="font-medium text-slate-700">{ratePlan.companyId}</span>
            </div>
            <div>
              <span className="text-slate-500">{t('ratePlans.details.createdAt')}:</span>{' '}
              <span className="text-slate-700">
                {new Date(ratePlan.createdAt).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-500">{t('ratePlans.details.updatedAt')}:</span>{' '}
              <span className="text-slate-700">
                {new Date(ratePlan.updatedAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default RatePlanDetailsModal;

