import React from "react";
import { Link } from "react-router-dom";
import Button from "../../../components/ui/Button";
import CompanyForm from "../components/CompanyForm";

const CreateCompany: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nouvel opérateur</h1>
          <p className="text-sm text-slate-600">Enregistrez une société ou agence partenaire.</p>
        </div>
        <Link to="/companies">
          <Button variant="outline">Retour à la liste</Button>
        </Link>
      </div>
      <CompanyForm />
    </div>
  );
};

export default CreateCompany;

