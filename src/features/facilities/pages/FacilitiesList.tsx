import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Pagination from "../../../components/ui/Pagination";
import Card from "../../../components/ui/Card";
import Modal from "../../../components/ui/Modal";
import FacilityTable from "../components/FacilityTable";
import FacilityForm from "../components/FacilityForm";
import { useFacilities } from "../hooks/useFacilities";

const FacilitiesList: React.FC = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const limit = 10;

  const { data, isLoading, error } = useFacilities({
    page,
    limit,
    search: search || undefined,
    sortBy: "createdAt",
    sortOrder: "DESC",
  });

  const handleSuccess = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t("facilities.title")}</h1>
            <p className="text-sm text-slate-600">
              {t("facilities.subtitle")} • {data?.meta.total ?? 0} {t("facilities.stats.facilitiesCount")}
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>{t("facilities.addFacility")}</Button>
        </div>

        {/* Search Bar */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <Input
              type="search"
              placeholder={t("facilities.search.placeholder")}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // Reset to page 1 on search
              }}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <FacilityTable facilities={data?.data} isLoading={isLoading} error={error} />

      {/* Pagination */}
      {data && data.meta.totalPages > 1 && (
        <Card>
          <Pagination
            currentPage={page}
            totalPages={data.meta.totalPages}
            onPageChange={setPage}
            itemsPerPage={limit}
            totalItems={data.meta.total}
            currentItemsCount={data.data.length}
          />
        </Card>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t("facilities.create.title")}
        size="2xl"
      >
        <FacilityForm onSuccess={handleSuccess} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default FacilitiesList;
