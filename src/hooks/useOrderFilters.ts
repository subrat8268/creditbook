import BottomSheet from "@gorhom/bottom-sheet";
import { useCallback, useMemo, useRef, useState } from "react";

export function useOrderFilters() {
  // ✅ Filter state
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const filters = useMemo(
    () => ["All", "Paid", "Pending", "Partially Paid"],
    []
  );

  // ✅ Sort state
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "high" | "low">(
    "newest"
  );
  const sortOptions = useMemo(
    () => [
      { label: "Newest", value: "newest" },
      { label: "Oldest", value: "oldest" },
      { label: "High Amount", value: "high" },
      { label: "Low Amount", value: "low" },
    ],
    []
  );

  // ✅ BottomSheet refs
  const bottomSheetRef = useRef<BottomSheet | null>(null); // sort sheet
  const filterSheetRef = useRef<BottomSheet | null>(null); // filter sheet

  // ✅ Snap points
  const snapPoints = useMemo(() => ["250"], []);

  // ✅ Open/Close handlers for sort
  const openSortSheet = useCallback(() => bottomSheetRef.current?.expand(), []);
  const closeSortSheet = useCallback(() => bottomSheetRef.current?.close(), []);

  // ✅ Open/Close handlers for filter
  const openFilterSheet = useCallback(
    () => filterSheetRef.current?.expand(),
    []
  );
  const closeFilterSheet = useCallback(
    () => filterSheetRef.current?.close(),
    []
  );

  return {
    filters,
    selectedFilter,
    setSelectedFilter,
    sortBy,
    setSortBy,
    sortOptions,
    bottomSheetRef,
    filterSheetRef,
    snapPoints,
    openSortSheet,
    closeSortSheet,
    openFilterSheet,
    closeFilterSheet,
  };
}
