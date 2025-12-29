import React from "react";
import Card from "../../../components/ui/Card";
import Loader from "../../../components/Loader";
import { Company } from "../types";

type Props = {
  companies?: Company[];
  isLoading?: boolean;
  error?: unknown;
};

const CompanyTable: React.FC<Props> = ({ companies = [], isLoading, error }) => {
  if (isLoading) {
    return (
      <Card title="Opérateurs">
        <Loader label="Chargement des opérateurs..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Opérateurs">
        <p className="text-sm text-red-600">Impossible de récupérer les opérateurs.</p>
      </Card>
    );
  }

  if (!companies.length) {
    return (
      <Card title="Opérateurs">
        <p className="text-sm text-slate-600">Aucun opérateur pour le moment.</p>
      </Card>
    );
  }

  return (
    <Card
      title="Opérateurs"
      subtitle="Vue simplifiée des agences / sociétés touristiques"
      className="overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Nom</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Ville</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Créé le</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {companies.map((company) => (
              <tr key={company.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{company.name}</td>
                <td className="px-4 py-3 text-slate-600">
                  {company.city ?? "—"}, {company.country ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">{company.contactEmail ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">
                  {company.createdAt ? new Date(company.createdAt).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default CompanyTable;

