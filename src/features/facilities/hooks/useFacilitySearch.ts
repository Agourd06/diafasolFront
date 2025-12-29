import { useState, useEffect } from "react";
import { searchFacilities } from "../../../api/facilities.api";
import { Facility } from "../types";

export const useFacilitySearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!searchTerm || searchTerm.trim().length === 0) {
      setResults([]);
      setError(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await searchFacilities(searchTerm);
        setResults(data);
      } catch (err) {
        setError("Search failed");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  return { searchTerm, setSearchTerm, results, loading, error };
};

