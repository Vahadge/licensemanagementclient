"use client";

import { useCallback, useState } from "react";
import type { DoctorStatus } from "@/types/doctor";

interface SearchFilterProps {
  search: string;
  status: DoctorStatus | "";
  onSearchChange: (value: string) => void;
  onStatusChange: (value: DoctorStatus | "") => void;
  onClear: () => void;
}

const STATUS_OPTIONS: { value: DoctorStatus | ""; label: string }[] = [
  { value: "",          label: "All Statuses" },
  { value: "Active",    label: "Active"       },
  { value: "Expired",   label: "Expired"      },
  { value: "Suspended", label: "Suspended"    },
];

export default function SearchFilter({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onClear,
}: SearchFilterProps) {
  const [localSearch, setLocalSearch] = useState(search);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") onSearchChange(localSearch);
    },
    [localSearch, onSearchChange]
  );

  const hasFilters = search || status;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search input */}
      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          onBlur={() => onSearchChange(localSearch)}
          placeholder="Search by name or license number…"
          className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Status filter */}
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value as DoctorStatus | "")}
        className="rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Clear button */}
      {hasFilters && (
        <button
          onClick={() => {
            setLocalSearch("");
            onClear();
          }}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 shadow-sm hover:bg-gray-50"
        >
          Clear
        </button>
      )}
    </div>
  );
}
