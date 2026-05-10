"use client";

import type { Doctor } from "@/types/doctor";
import StatusBadge from "@/components/StatusBadge";
import DoctorModal from "@/components/DoctorModal";

interface DoctorDetailModalProps {
  doctor: Doctor | null;
  onClose: () => void;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 sm:flex-row sm:gap-4">
      <dt className="w-40 shrink-0 text-sm font-medium text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900">{value}</dd>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function DoctorDetailModal({ doctor, onClose }: DoctorDetailModalProps) {
  return (
    <DoctorModal title="Doctor Details" isOpen={!!doctor} onClose={onClose}>
      {doctor && (
        <dl className="divide-y divide-gray-100">
          <Row label="Full Name"      value={doctor.fullName} />
          <Row label="Email"          value={<a href={`mailto:${doctor.email}`} className="text-blue-600 hover:underline">{doctor.email}</a>} />
          <Row label="Specialization" value={doctor.specialization} />
          <Row label="License Number" value={<span className="font-mono">{doctor.licenseNumber}</span>} />
          <Row label="Expiry Date"    value={formatDate(doctor.licenseExpiryDate)} />
          <Row label="Status"         value={<StatusBadge status={doctor.status} />} />
          <Row label="Created"        value={formatDate(doctor.createdDate)} />
        </dl>
      )}
    </DoctorModal>
  );
}
