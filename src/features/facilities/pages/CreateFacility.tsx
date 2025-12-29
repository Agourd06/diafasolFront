import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Button from "../../../components/ui/Button";
import FacilityForm from "../components/FacilityForm";

const CreateFacility: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("facilities.create.title")}</h1>
          <p className="text-sm text-slate-600">{t("facilities.create.subtitle")}</p>
        </div>
        <Link to="/facilities">
          <Button variant="outline">{t("common.back")}</Button>
        </Link>
      </div>
      <FacilityForm />
    </div>
  );
};

export default CreateFacility;

