import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Button from "./Button";

type ConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: "danger" | "warning" | "info";
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  isLoading = false,
  variant = "danger",
}) => {
  const { t } = useTranslation();

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: (
        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
      iconBg: "bg-red-100",
      confirmButton: "bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white",
    },
    warning: {
      icon: (
        <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
      iconBg: "bg-yellow-100",
      confirmButton: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500 text-white",
    },
    info: {
      icon: (
        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      iconBg: "bg-blue-100",
      confirmButton: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-200"
        style={{ animation: "modal-fade-in 0.2s ease-out" }}
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal */}
      <div 
        className="relative w-full max-w-md"
        style={{ animation: "modal-slide-up 0.3s ease-out" }}
      >
        <div className="rounded-xl bg-white p-6 shadow-2xl">
          {/* Icon */}
          <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${styles.iconBg}`}>
            {styles.icon}
          </div>

          {/* Content */}
          <div className="mt-4 text-center">
            <h3 className="text-lg font-semibold text-slate-900">
              {title || t("modal.confirm.title")}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {message || t("modal.confirm.message")}
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cancelText || t("modal.confirm.cancel")}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${styles.confirmButton}`}
            >
              {isLoading && (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              {confirmText || t("modal.confirm.confirm")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

