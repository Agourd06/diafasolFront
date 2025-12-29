import React, { useState, useEffect } from "react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Label from "../../../components/ui/Label";
import { useCreateCompany } from "../hooks/useCreateCompany";
import type { Company } from "../types";

type CompanyFormProps = {
  company?: Company;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const CompanyForm: React.FC<CompanyFormProps> = ({ company, onSuccess, onCancel }) => {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const mutation = useCreateCompany();

  // Initialize form with company data if editing
  useEffect(() => {
    if (company) {
      setName(company.name || "");
      setCity(company.city || "");
      setCountry(company.country || "");
      setContactEmail(company.contactEmail || "");
    }
  }, [company]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name) return;
    mutation.mutate(
      { name, city, country, contactEmail },
      {
        onSuccess: () => {
          setName("");
          setCity("");
          setCountry("");
          setContactEmail("");
          onSuccess?.();
        }
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-sm font-medium">Nom</Label>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Atlas Voyages"
          required
          className="text-sm"
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="city" className="text-sm font-medium">Ville</Label>
          <Input
            id="city"
            name="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Marrakech"
            className="text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="country" className="text-sm font-medium">Pays</Label>
          <Input
            id="country"
            name="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Maroc"
            className="text-sm"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="contactEmail" className="text-sm font-medium">Email de contact</Label>
        <Input
          id="contactEmail"
          name="contactEmail"
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          placeholder="contact@atlasvoyages.com"
          className="text-sm"
        />
      </div>
      {mutation.isError && (
        <p className="text-sm text-red-600">Échec de la création. Vérifiez l'API.</p>
      )}
      <div className="flex gap-2 pt-2">
        <Button 
          type="submit" 
          className="flex-1" 
          isLoading={mutation.isPending} 
          disabled={!name}
        >
          Enregistrer
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Annuler
          </Button>
        )}
      </div>
    </form>
  );
};

export default CompanyForm;
