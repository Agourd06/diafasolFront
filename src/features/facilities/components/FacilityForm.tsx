import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Label from "../../../components/ui/Label";
import RichTextEditor from "../../../components/ui/RichTextEditor";
import { useCreateFacility } from "../hooks/useCreateFacility";
import { getErrorMessage } from "../../../utils/validation";
import type { Facility } from "../types";

type FacilityFormProps = {
  facility?: Facility;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const FacilityForm: React.FC<FacilityFormProps> = ({ facility, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const createMutation = useCreateFacility();

  // Initialize form with facility data if editing
  useEffect(() => {
    if (facility) {
      setName(facility.name || "");
      setDescription(facility.description || "");
    }
  }, [facility]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Strip HTML tags to check actual text length
    const textLength = description.replace(/<[^>]*>/g, "").trim().length;

    // ✅ Only send name and description
    // companyId is automatically extracted from JWT token by backend
    createMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
    }, {
      onSuccess: () => {
        setName("");
        setDescription("");
        onSuccess?.();
      }
    });
  };

  // Strip HTML for length validation
  const textLength = description.replace(/<[^>]*>/g, "").trim().length;
  const isDisabled = !name.trim() || name.length > 100 || textLength > 1000;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-sm font-medium">
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
          className="text-sm"
        />
        <p className="text-xs text-slate-500">
          {name.length}/100 {t("facilities.form.characters")}
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-sm font-medium">
          {t("facilities.form.descriptionLabel")}
        </Label>
        <RichTextEditor
          value={description}
          onChange={setDescription}
          placeholder={t("facilities.form.descriptionPlaceholder")}
          rows={4}
        />
        <p className="text-xs text-slate-500">
          {textLength}/1000 {t("facilities.form.characters")}
        </p>
      </div>

      {createMutation.isError && (
        <div className="rounded-lg bg-red-50 p-2 text-sm text-red-600">
          {getErrorMessage(createMutation.error)}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button
          type="submit"
          disabled={isDisabled}
          isLoading={createMutation.isPending}
          className="flex-1"
        >
          {t("facilities.form.submitButton")}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            {t("common.cancel")}
          </Button>
        )}
      </div>
    </form>
  );
};

export default FacilityForm;
