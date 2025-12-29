import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFacility } from "../../../api/facilities.api";

export const useDeleteFacility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFacility(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
    },
  });
};

