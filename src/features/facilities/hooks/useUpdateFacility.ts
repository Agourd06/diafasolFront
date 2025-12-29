import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateFacility } from "../../../api/facilities.api";
import { UpdateFacilityPayload } from "../types";

export const useUpdateFacility = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateFacilityPayload) => updateFacility(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
      queryClient.invalidateQueries({ queryKey: ["facility", id] });
    },
  });
};

