import React from "react";
import { useTranslation } from "react-i18next";
import Modal from "../../../components/ui/Modal";
import { Facility } from "../types";

type FacilityDetailsModalProps = {
  facility: Facility | null;
  isOpen: boolean;
  onClose: () => void;
};

const FacilityDetailsModal: React.FC<FacilityDetailsModalProps> = ({
  facility,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();

  if (!facility) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={facility.name} size="lg">
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {t("facilities.details.name")}
            </label>
            <p className="mt-1 text-base font-semibold text-slate-900">{facility.name}</p>
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {t("facilities.details.createdAt")}
            </label>
            <p className="mt-1 text-base text-slate-700">
              {new Date(facility.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Description Section */}
        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {t("facilities.details.description")}
          </label>
          {facility.description ? (
            <div
              className="prose prose-slate mt-2 max-w-none rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm"
              dangerouslySetInnerHTML={{ __html: facility.description }}
            />
          ) : (
            <p className="mt-2 italic text-slate-400">{t("facilities.details.noDescription")}</p>
          )}
        </div>

        {/* Metadata */}
        <div className="rounded-lg bg-slate-50 p-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
            {t("facilities.details.metadata")}
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">{t("facilities.details.id")}:</span>{" "}
              <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs text-slate-700">
                {facility.id}
              </code>
            </div>
            <div>
              <span className="text-slate-500">{t("facilities.details.companyId")}:</span>{" "}
              <span className="font-medium text-slate-700">{facility.companyId}</span>
            </div>
            <div>
              <span className="text-slate-500">{t("facilities.details.createdAt")}:</span>{" "}
              <span className="text-slate-700">
                {new Date(facility.createdAt).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-500">{t("facilities.details.updatedAt")}:</span>{" "}
              <span className="text-slate-700">
                {new Date(facility.updatedAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default FacilityDetailsModal;

