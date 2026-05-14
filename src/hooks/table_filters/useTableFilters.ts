import { useState } from "react";

export interface FilterField {
  key: string;
  label: string;
  placeholder: string;
}

export const useTableFilters = <T extends Record<string, string>>(
  filterFields: readonly FilterField[],
  initialFilters: T
) => {
  const [inputFilters, setInputFilters] = useState<T>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<T>(initialFilters);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const updateFilter = (key: keyof T, value: string) => {
    setInputFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setAppliedFilters(inputFilters);
  };

  const clearFilters = () => {
    setInputFilters(initialFilters);
    setAppliedFilters(initialFilters);
  };

  const hasActiveFilters = Object.values(appliedFilters).some(Boolean);

  return {
    inputFilters,
    appliedFilters,
    updateFilter,
    applyFilters,
    clearFilters,
    isFilterExpanded,
    setIsFilterExpanded,
    hasActiveFilters,
    filterFields,
  };
};
