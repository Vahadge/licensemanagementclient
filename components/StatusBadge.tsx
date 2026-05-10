import type { DoctorStatus } from "@/types/doctor";

const styles: Record<DoctorStatus, string> = {
  Active:    "bg-green-100  text-green-800  ring-green-200",
  Expired:   "bg-red-100    text-red-800    ring-red-200",
  Suspended: "bg-yellow-100 text-yellow-800 ring-yellow-200",
};

export default function StatusBadge({ status }: { status: DoctorStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${styles[status]}`}
    >
      {status}
    </span>
  );
}
