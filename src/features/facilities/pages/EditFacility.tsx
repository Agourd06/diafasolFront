import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Label from "../../../components/ui/Label";
import RichTextEditor from "../../../components/ui/RichTextEditor";
import Loader from "../../../components/Loader";
import { useUpdateFacility } from "../hooks/useUpdateFacility";
import { getFacilityById } from "../../../api/facilities.api";
import { getErrorMessage } from "../../../utils/validation";

const EditFacility: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Fetch facility data
  const { data: facility, isLoading } = useQuery({
    queryKey: ["facility", id],
    queryFn: () => getFacilityById(id!),
    enabled: !!id,
  });

  // Update mutation
  const updateMutation = useUpdateFacility(id!);

  // Populate form when data is loaded
  useEffect(() => {
    if (facility) {
      setName(facility.name);
      setDescription(facility.description || "");
    }
  }, [facility]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateMutation.mutate(
      {
        name: name.trim(),
        description: description.trim() || undefined,
      },
      {
        onSuccess: () => {
          navigate("/facilities");
        },
      }
    );
  };

  // Strip HTML for length validation
  const textLength = description.replace(/<[^>]*>/g, "").trim().length;
  const isDisabled = !name.trim() || name.length > 100 || textLength > 1000;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <Loader label={t("common.loading")} />
        </Card>
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="space-y-4">
        <Card>
          <p className="text-sm text-red-600">{t("facilities.edit.notFound")}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("facilities.edit.title")}</h1>
          <p className="text-sm text-slate-600">{t("facilities.edit.subtitle")}</p>
        </div>
        <Link to="/facilities">
          <Button variant="outline">{t("common.back")}</Button>
        </Link>
      </div>

      <Card title={t("facilities.form.title")} subtitle={t("facilities.form.subtitle")}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              {t("facilities.form.nameLabel")} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder={t("facilities.form.namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              required
            />
            <p className="text-xs text-slate-500">
              {name.length}/100 {t("facilities.form.characters")}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("facilities.form.descriptionLabel")}</Label>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder={t("facilities.form.descriptionPlaceholder")}
              rows={6}
            />
            <p className="text-xs text-slate-500">
              {textLength}/1000 {t("facilities.form.characters")}
            </p>
          </div>

          {updateMutation.isError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {getErrorMessage(updateMutation.error)}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isDisabled}
              isLoading={updateMutation.isPending}
              className="flex-1"
            >
              {t("facilities.edit.submitButton")}
            </Button>
            <Link to="/facilities" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                {t("common.cancel")}
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditFacility;

