import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

type EditButtonProps = {
  to: string;
  title?: string;
};

export const EditButton: React.FC<EditButtonProps> = ({ to, title }) => {
  const { t } = useTranslation();

  return (
    <Link to={to}>
      <button
        className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
        title={title || t("common.edit")}
        type="button"
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
    </Link>
  );
};

type DeleteButtonProps = {
  onClick: () => void;
  title?: string;
  disabled?: boolean;
};

export const DeleteButton: React.FC<DeleteButtonProps> = ({ onClick, title, disabled = false }) => {
  const { t } = useTranslation();

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
      title={title || t("common.delete")}
      type="button"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    </button>
  );
};

type ViewButtonProps = {
  to?: string;
  onClick?: () => void;
  title?: string;
};

export const ViewButton: React.FC<ViewButtonProps> = ({ to, onClick, title }) => {
  const { t } = useTranslation();

  const button = (
    <button
      onClick={onClick}
      className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
      title={title || t("common.view")}
      type="button"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
    </button>
  );

  if (to) {
    return <Link to={to}>{button}</Link>;
  }

  return button;
};

type ActionButtonsProps = {
  editPath?: string;
  viewPath?: string;
  onView?: () => void;
  onDelete?: () => void;
  deleteDisabled?: boolean;
  showEdit?: boolean;
  showView?: boolean;
  showDelete?: boolean;
};

/**
 * Combined action buttons component for tables
 * Displays edit, view, and delete buttons in a consistent layout
 * 
 * @example
 * <ActionButtons
 *   editPath={`/facilities/edit/${facility.id}`}
 *   onDelete={() => handleDelete(facility)}
 *   onView={() => handleView(facility)}
 * />
 */
export const ActionButtons: React.FC<ActionButtonsProps> = ({
  editPath,
  viewPath,
  onView,
  onDelete,
  deleteDisabled = false,
  showEdit = true,
  showView = false,
  showDelete = true,
}) => {
  return (
    <div className="flex items-center justify-center gap-2">
      {showView && (viewPath || onView) && <ViewButton to={viewPath} onClick={onView} />}
      {showEdit && editPath && <EditButton to={editPath} />}
      {showDelete && onDelete && <DeleteButton onClick={onDelete} disabled={deleteDisabled} />}
    </div>
  );
};

