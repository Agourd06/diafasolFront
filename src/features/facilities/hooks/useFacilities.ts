import { useQuery } from "@tanstack/react-query";
import { getFacilities } from "../../../api/facilities.api";
import { FacilityQueryParams } from "../types";

export const useFacilities = (params?: FacilityQueryParams) => {
  return useQuery({
    queryKey: ["facilities", params],
    queryFn: () => getFacilities(params),
  });
};

