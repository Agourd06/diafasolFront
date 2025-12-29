import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCompany } from "../../../api/companies.api";
import { CreateCompanyPayload } from "../types";

export const useCreateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCompanyPayload) => createCompany(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    }
  });
};

