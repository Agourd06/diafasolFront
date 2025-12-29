import { useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "../context/AuthContext";
import { Company } from "../features/auth/types";
import { getCompanyById } from "../api/companies.api";

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};

/**
 * Hook to easily access the current user's company data
 * Fetches company from API if not already in user object
 * @returns The company object if available, or null
 */
export const useCompany = (): Company | null => {
  const { user, setUser } = useAuth();
  
  // Fetch company if user has companyId but no company object
  const { data: fetchedCompany } = useQuery({
    queryKey: ['company', user?.companyId],
    queryFn: () => getCompanyById(user!.companyId),
    enabled: !!user?.companyId && !user?.company,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Update user object with fetched company
  useMemo(() => {
    if (fetchedCompany && user && !user.company) {
      setUser({ ...user, company: fetchedCompany });
    }
  }, [fetchedCompany, user, setUser]);

  return useMemo(() => user?.company ?? fetchedCompany ?? null, [user?.company, fetchedCompany]);
};

