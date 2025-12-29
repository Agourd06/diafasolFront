import axiosClient from "./axiosClient";
import { Company, CreateCompanyPayload } from "../features/companies/types";

export const getCompanies = async () => {
  const { data } = await axiosClient.get<Company[]>("/companies");
  return data;
};

export const createCompany = async (payload: CreateCompanyPayload) => {
  const { data } = await axiosClient.post<Company>("/companies", payload);
  return data;
};

/**
 * Get the current authenticated user's company
 */
export const getMyCompany = async () => {
  const { data } = await axiosClient.get<Company>("/companies/me");
  return data;
};

/**
 * Get a company by ID
 */
export const getCompanyById = async (id: number) => {
  const { data } = await axiosClient.get<Company>(`/companies/${id}`);
  return data;
};

