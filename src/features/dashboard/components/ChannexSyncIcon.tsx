import React from 'react';
import { useTranslation } from 'react-i18next';

interface ChannexSyncIconProps {
  isChecking: boolean;
  isSyncing: boolean;
  existsInChannex: boolean;
  onSync: () => void;
  syncedTitle?: string;
  notSyncedTitle?: string;
  clickToSyncTitle?: string;
  disabled?: boolean;
  disabledTitle?: string;
}

/**
 * Reusable Channex sync icon component
 * Shows loading, syncing, synced, or not synced states
 */
const ChannexSyncIcon: React.FC<ChannexSyncIconProps> = ({
  isChecking,
  isSyncing,
  existsInChannex,
  onSync,
  syncedTitle,
  notSyncedTitle,
  clickToSyncTitle,
  disabled = false,
  disabledTitle,
}) => {
  const { t } = useTranslation();

  if (isChecking) {
    return <div className="h-5 w-5 rounded-sm bg-slate-200 animate-pulse" />;
  }

  if (isSyncing) {
    return (
      <div className="h-5 w-5 flex items-center justify-center">
        <svg className="h-4 w-4 animate-spin text-brand-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  }

  // Disabled state (e.g., missing options)
  if (disabled) {
    return (
      <div
        className="h-5 w-5 rounded-sm overflow-hidden cursor-not-allowed relative"
        title={disabledTitle || t('context.cannotSyncMissingOptions')}
      >
        <img
          src="/group-icon.png"
          alt={disabledTitle || t('context.cannotSyncMissingOptions')}
          className="h-full w-full object-cover grayscale opacity-30"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="h-3 w-3 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    );
  }

  if (existsInChannex) {
    return (
      <button
        onClick={onSync}
        className="h-5 w-5 rounded-sm overflow-hidden hover:ring-2 hover:ring-brand-300 transition-all"
        title={syncedTitle || t('context.syncedWithChannex')}
      >
        <img
          src="/group-icon.png"
          alt={syncedTitle || t('context.syncedWithChannex')}
          className="h-full w-full object-cover"
        />
      </button>
    );
  }

  return (
    <button
      onClick={onSync}
      className="h-5 w-5 rounded-sm overflow-hidden hover:ring-2 hover:ring-brand-300 transition-all"
      title={clickToSyncTitle || t('context.clickToSyncChannex')}
    >
      <img
        src="/group-icon.png"
        alt={notSyncedTitle || t('context.notSyncedWithChannex')}
        className="h-full w-full object-cover grayscale opacity-50 hover:opacity-75 transition-opacity"
      />
    </button>
  );
};

export default ChannexSyncIcon;
