import { useQuery } from "@tanstack/react-query";
import { getCompanies } from "../../../api/companies.api";

export const useCompanies = () => {
  return useQuery({
    queryKey: ["companies"],
    queryFn: getCompanies,
    retry: 1
  });
};

