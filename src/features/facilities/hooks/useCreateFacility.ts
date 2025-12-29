import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFacility } from "../../../api/facilities.api";
import { CreateFacilityPayload } from "../types";

export const useCreateFacility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateFacilityPayload) => createFacility(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
    },
  });
};

