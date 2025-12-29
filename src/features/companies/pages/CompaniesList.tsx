import React, { useState } from "react";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Modal from "../../../components/ui/Modal";
import CompanyTable from "../components/CompanyTable";
import CompanyForm from "../components/CompanyForm";
import { useCompanies } from "../hooks/useCompanies";

const CompaniesList: React.FC = () => {
  const { data, isLoading, error } = useCompanies();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Opérateurs</h1>
          <p className="text-sm text-slate-600">
            Suivi des agences, hôtels, riads et partenaires de destination.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>Ajouter un opérateur</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card title="Actifs" subtitle={`${data?.length ?? 0} opérateurs`} />
        <Card title="Taux de complétion" subtitle="En attente de connexion aux APIs" />
        <Card title="Dernière synchro" subtitle="Dès que l'API NestJS répondra" />
      </div>

      <CompanyTable companies={data} isLoading={isLoading} error={error} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nouvel opérateur"
        size="lg"
      >
        <CompanyForm onSuccess={handleSuccess} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default CompaniesList;
