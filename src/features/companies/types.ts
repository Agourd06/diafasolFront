export type Company = {
  id: string;
  name: string;
  country?: string;
  city?: string;
  contactEmail?: string;
  createdAt?: string;
};

export type CreateCompanyPayload = Pick<Company, "name" | "country" | "city" | "contactEmail">;

