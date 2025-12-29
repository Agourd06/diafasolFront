import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useChannexRoomType } from '@/hooks/useChannexRoomType';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ChannexSyncIcon from './ChannexSyncIcon';
import type { RoomType } from '@/features/room-types/types';
import type { ChannexProperty } from '@/api/channex.api';

interface RoomTypeDetailsCardProps {
  roomType: RoomType;
  roomTypeId: string;
  channexProperty: ChannexProperty | null | undefined;
  propertyExistsInChannex: boolean;
}

/**
 * Room Type Details Card Component
 * Displays room type information with Channex sync functionality
 */
const RoomTypeDetailsCard: React.FC<RoomTypeDetailsCardProps> = ({
  roomType,
  roomTypeId,
  channexProperty,
  propertyExistsInChannex,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Check if room type exists in Channex
  const {
    existsInChannex: roomTypeExistsInChannex,
    isChecking: isCheckingRoomType,
    isSyncing: isSyncingRoomType,
    syncToChannex: syncRoomTypeToChannex,
  } = useChannexRoomType({
    roomType,
    channexPropertyId: channexProperty?.id,
    enabled: !!roomType && !!channexProperty,
  });

  const handleEdit = () => {
    navigate(`/room-types/edit/${roomTypeId}`);
  };

  const handleViewDetails = () => {
    navigate(`/room-types/${roomTypeId}`);
  };

  return (
    <Card className="h-full flex flex-col bg-purple-100/60 border-purple-300">
      <div className="flex flex-col flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <h3 className="text-lg font-semibold text-slate-900">
              {t('context.roomTypeDetails')}
            </h3>
            {propertyExistsInChannex && (
              <ChannexSyncIcon
                isChecking={isCheckingRoomType}
                isSyncing={isSyncingRoomType}
                existsInChannex={roomTypeExistsInChannex}
                onSync={syncRoomTypeToChannex}
                syncedTitle={t('context.roomTypeSyncedWithChannex')}
                notSyncedTitle={t('context.roomTypeNotSyncedWithChannex')}
                clickToSyncTitle={t('context.clickToSyncRoomTypeChannex')}
              />
            )}
          </div>
          <button
            onClick={handleEdit}
            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition-colors"
            aria-label={t('context.editRoomType')}
            title={t('context.editRoomType')}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-3 flex-1">
            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {t('roomTypes.form.title')}
              </span>
              <p className="mt-1 font-semibold text-slate-900">{roomType.title}</p>
            </div>

            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {t('roomTypes.form.countOfRooms')}
              </span>
              <p className="mt-1 font-semibold text-slate-900">{roomType.countOfRooms}</p>
            </div>

            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {t('roomTypes.table.occupancy')}
              </span>
              <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1">
                <p className="text-sm text-slate-700">
                  {t('roomTypes.table.adults')}: {roomType.occAdults}
                </p>
                <p className="text-sm text-slate-700">
                  {t('roomTypes.table.children')}: {roomType.occChildren}
                </p>
                <p className="text-sm text-slate-700">
                  {t('roomTypes.table.infants')}: {roomType.occInfants}
                </p>
                <p className="text-sm font-medium text-slate-900">
                  {t('roomTypes.table.default')}: {roomType.defaultOccupancy}
                </p>
              </div>
            </div>

            {roomType.roomKind && (
              <div>
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {t('roomTypes.form.roomKind')}
                </span>
                <p className="mt-1 text-slate-700 capitalize">{roomType.roomKind}</p>
              </div>
            )}

            {roomType.capacity && (
              <div>
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {t('roomTypes.form.capacity')}
                </span>
                <p className="mt-1 text-slate-700">{roomType.capacity}</p>
              </div>
            )}
          </div>

        <Button variant="outline" onClick={handleViewDetails} className="w-full mt-auto">
          {t('context.viewRoomTypeDetails')}
        </Button>
      </div>
    </Card>
  );
};

export default RoomTypeDetailsCard;
