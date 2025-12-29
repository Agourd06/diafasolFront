import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Card from "../../../components/ui/Card";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { ActionButtons } from "../../../components/ui/ActionButtons";
import FacilityDetailsModal from "./FacilityDetailsModal";
import Loader from "../../../components/Loader";
import { useConfirmModal } from "../../../hooks/useConfirmModal";
import { Facility } from "../types";
import { useDeleteFacility } from "../hooks/useDeleteFacility";

type Props = {
  facilities?: Facility[];
  isLoading?: boolean;
  error?: unknown;
};

const FacilityTable: React.FC<Props> = ({ facilities = [], isLoading, error }) => {
  const { t } = useTranslation();
  const deleteMutation = useDeleteFacility();
  const deleteModal = useConfirmModal();
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [facilityToView, setFacilityToView] = useState<Facility | null>(null);

  const handleDeleteClick = (facility: Facility) => {
    setSelectedFacility(facility);
    deleteModal.openModal();
  };

  const handleViewClick = (facility: Facility) => {
    setFacilityToView(facility);
    setViewModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedFacility) return;
    
    await deleteModal.handleConfirm(async () => {
      await deleteMutation.mutateAsync(selectedFacility.id);
      setSelectedFacility(null);
    });
  };

  if (isLoading) {
    return (
      <Card title={t("facilities.title")}>
        <Loader label={t("facilities.table.loading")} />
      </Card>
    );
  }

  if (error) {
    return (
      <Card title={t("facilities.title")}>
        <p className="text-sm text-red-600">{t("facilities.table.error")}</p>
      </Card>
    );
  }

  if (!facilities.length) {
    return (
      <Card title={t("facilities.title")}>
        <p className="text-sm text-slate-600">{t("facilities.table.empty")}</p>
      </Card>
    );
  }

  return (
    <>
      <Card title={t("facilities.title")} subtitle={t("facilities.table.subtitle")}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">{t("facilities.table.name")}</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">{t("facilities.table.description")}</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">{t("facilities.table.createdAt")}</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">{t("facilities.table.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {facilities.map((facility) => (
                <tr key={facility.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{facility.name}</td>
                <td className="pl-10 py-3  text-slate-600">
                  {facility.description ? (
                    <button
                      onClick={() => handleViewClick(facility)}
                      className="   transition-colors hover:text-brand-600"
                    >
                      
                      <svg
                        className="h-4 w-4 flex-shrink-0 text-slate-400 transition-colors group-hover:text-brand-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
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
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {new Date(facility.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <ActionButtons
                    editPath={`/facilities/edit/${facility.id}`}
                    onDelete={() => handleDeleteClick(facility)}
                  />
                </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View Details Modal */}
      <FacilityDetailsModal
        facility={facilityToView}
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setFacilityToView(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteModal.isLoading}
        title={t("modal.delete.title")}
        message={
          selectedFacility
            ? t("modal.delete.messageFacility", { name: selectedFacility.name })
            : t("modal.delete.message")
        }
        confirmText={t("modal.delete.confirm")}
        cancelText={t("modal.delete.cancel")}
        variant="danger"
      />
    </>
  );
};

export default FacilityTable;

