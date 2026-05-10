"use client";

import type { Doctor, DoctorStatus } from "@/types/doctor";
import StatusBadge from "@/components/StatusBadge";

interface DoctorTableProps {
  doctors: Doctor[];
  isAuthenticated: boolean;
  onEdit: (doctor: Doctor) => void;
  onDelete: (doctor: Doctor) => void;
  onStatusChange: (doctor: Doctor, status: DoctorStatus) => void;
  onView: (doctor: Doctor) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const STATUS_OPTIONS: DoctorStatus[] = ["Active", "Expired", "Suspended"];

export default function DoctorTable({
  doctors,
  isAuthenticated,
  onEdit,
  onDelete,
  onStatusChange,
  onView,
}: DoctorTableProps) {
  if (doctors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-2">
        <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm font-medium">No doctors found</p>
        <p className="text-xs">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {["Full Name", "Email", "Specialization", "License Number", "Expiry Date", "Status", "Actions"].map(
              (h) => (
                <th
                  key={h}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {doctors.map((doctor) => {
            const isExpired = doctor.status === "Expired";
            return (
              <tr
                key={doctor.id}
                className={isExpired ? "bg-red-50 hover:bg-red-100" : "hover:bg-gray-50"}
              >
                <td className="whitespace-nowrap px-4 py-3">
                  <button
                    onClick={() => onView(doctor)}
                    className="text-sm font-medium text-blue-600 hover:underline text-left"
                  >
                    {doctor.fullName}
                  </button>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{doctor.email}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{doctor.specialization}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm font-mono text-gray-700">{doctor.licenseNumber}</td>
                <td className={`whitespace-nowrap px-4 py-3 text-sm ${isExpired ? "text-red-700 font-medium" : "text-gray-600"}`}>
                  {formatDate(doctor.licenseExpiryDate)}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <StatusBadge status={doctor.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => isAuthenticated && onEdit(doctor)}
                      disabled={!isAuthenticated}
                      title={!isAuthenticated ? "Log in as admin to edit" : undefined}
                      className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                        isAuthenticated
                          ? "text-blue-700 hover:bg-blue-50 cursor-pointer"
                          : "text-gray-300 cursor-not-allowed"
                      }`}
                    >
                      Edit
                    </button>

                    {/* Quick status change dropdown */}
                    <select
                      value={doctor.status}
                      disabled={!isAuthenticated}
                      onChange={(e) => onStatusChange(doctor, e.target.value as DoctorStatus)}
                      title={!isAuthenticated ? "Log in as admin to change status" : "Change status"}
                      className={`rounded border px-1 py-1 text-xs focus:outline-none ${
                        isAuthenticated
                          ? "border-gray-300 text-gray-700 focus:border-blue-500 cursor-pointer"
                          : "border-gray-200 text-gray-300 cursor-not-allowed bg-transparent"
                      }`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s} disabled={s === "Expired"} style={s === "Expired" ? { cursor: "not-allowed" } : undefined}>{s}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => isAuthenticated && onDelete(doctor)}
                      disabled={!isAuthenticated}
                      title={!isAuthenticated ? "Log in as admin to delete" : undefined}
                      className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                        isAuthenticated
                          ? "text-red-700 hover:bg-red-50 cursor-pointer"
                          : "text-gray-300 cursor-not-allowed"
                      }`}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
