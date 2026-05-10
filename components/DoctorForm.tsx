"use client";

import { useEffect, useMemo, useState } from "react";
import type { CreateDoctorPayload, Doctor, UpdateDoctorPayload } from "@/types/doctor";

interface DoctorFormProps {
  initialData?: Doctor | null;
  onSubmit: (payload: CreateDoctorPayload | UpdateDoctorPayload) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

interface FormState extends CreateDoctorPayload {
  status: "Active" | "Suspended";
}

const EMPTY: FormState = {
  fullName: "",
  email: "",
  specialization: "",
  licenseNumber: "",
  licenseExpiryDate: "",
  status: "Active",
};

function toDateInputValue(iso: string | undefined) {
  if (!iso) return "";
  return iso.split("T")[0];
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function getExpiryHint(dateStr: string): { label: string; cls: string } | null {
  if (!dateStr) return null;

  const [y, m, d] = dateStr.split("-").map(Number);
  const selected = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.round((selected.getTime() - today.getTime()) / 86_400_000);

  if (diffDays < 0)
    return {
      label: `Expired ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? "s" : ""} ago — doctor will be marked Expired`,
      cls: "text-red-600",
    };
  if (diffDays === 0)
    return { label: "Expires today — doctor will be marked Expired", cls: "text-orange-500" };
  if (diffDays <= 30)
    return { label: `Expires in ${diffDays} day${diffDays !== 1 ? "s" : ""} — renew soon`, cls: "text-yellow-600" };
  if (diffDays <= 90)
    return { label: `Expires in ${diffDays} days`, cls: "text-blue-600" };
  return { label: `Expires in ${diffDays} days`, cls: "text-green-600" };
}

export default function DoctorForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: DoctorFormProps) {
  const isEdit = !!initialData;
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  useEffect(() => {
    if (initialData) {
      setForm({
        fullName: initialData.fullName,
        email: initialData.email,
        specialization: initialData.specialization,
        licenseNumber: initialData.licenseNumber,
        licenseExpiryDate: toDateInputValue(initialData.licenseExpiryDate),
        // Expired is not a manual option — default to Active when doctor was expired
        status: initialData.status === "Suspended" ? "Suspended" : "Active",
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [initialData]);

  const expiryHint = useMemo(() => getExpiryHint(form.licenseExpiryDate), [form.licenseExpiryDate]);

  function validate(): boolean {
    const next: typeof errors = {};

    if (!form.fullName.trim()) next.fullName = "Full name is required.";

    if (!form.email.trim()) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "Enter a valid email address.";

    if (!form.specialization.trim()) next.specialization = "Specialization is required.";
    if (!form.licenseNumber.trim()) next.licenseNumber = "License number is required.";

    if (!form.licenseExpiryDate) {
      next.licenseExpiryDate = "Expiry date is required.";
    } else if (!isEdit) {
      const [y, m, d] = form.licenseExpiryDate.split("-").map(Number);
      const selected = new Date(y, m - 1, d);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        next.licenseExpiryDate = "Expiry date must be today or in the future.";
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const base = { ...form, licenseExpiryDate: new Date(form.licenseExpiryDate).toISOString() };

    if (isEdit) {
      await onSubmit({ ...base, status: form.status } satisfies UpdateDoctorPayload);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { status: _s, ...createPayload } = base;
      await onSubmit(createPayload satisfies CreateDoctorPayload);
    }
  }

  function field(key: keyof CreateDoctorPayload) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((f) => ({ ...f, [key]: e.target.value }));
        setErrors((err) => ({ ...err, [key]: undefined }));
      },
    };
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Field label="Full Name" error={errors.fullName}>
        <input
          type="text"
          {...field("fullName")}
          className={inputCls(errors.fullName)}
          placeholder="Dr. Jane Smith"
          autoComplete="name"
        />
      </Field>

      <Field label="Email" error={errors.email}>
        <input
          type="email"
          {...field("email")}
          className={inputCls(errors.email)}
          placeholder="jane.smith@hospital.com"
          autoComplete="email"
        />
      </Field>

      <Field label="Specialization" error={errors.specialization}>
        <input
          type="text"
          {...field("specialization")}
          className={inputCls(errors.specialization)}
          placeholder="e.g. Cardiology, Neurology"
        />
      </Field>

      <Field label="License Number" error={errors.licenseNumber}>
        <input
          type="text"
          {...field("licenseNumber")}
          className={inputCls(errors.licenseNumber)}
          placeholder="e.g. LIC-2024-00001"
          autoComplete="off"
        />
      </Field>

      {/* ── Date field ── */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          License Expiry Date
          {!isEdit && (
            <span className="ml-1 text-xs font-normal text-gray-400">(must be today or later)</span>
          )}
        </label>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <input
            type="date"
            {...field("licenseExpiryDate")}
            min={!isEdit ? todayStr() : undefined}
            className={[inputCls(errors.licenseExpiryDate), "pl-9 cursor-pointer"].join(" ")}
          />
        </div>

        {errors.licenseExpiryDate && (
          <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
            <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.licenseExpiryDate}
          </p>
        )}

        {!errors.licenseExpiryDate && expiryHint && (
          <p className={`mt-1 flex items-center gap-1 text-xs ${expiryHint.cls}`}>
            <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {expiryHint.label}
          </p>
        )}

        {isEdit && form.licenseExpiryDate && expiryHint?.cls === "text-red-600" && (
          <div className="mt-2 flex items-start gap-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700 ring-1 ring-amber-200">
            <svg className="mt-0.5 h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Saving with a past date will mark this doctor as <strong className="mx-0.5">Expired</strong>.
          </div>
        )}
      </div>

      {/* ── Status dropdown — edit mode only ── */}
      {isEdit && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as "Active" | "Suspended" }))}
            className={inputCls()}
          >
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Expired" disabled>Expired (system-managed)</option>
          </select>
          <p className="mt-1 text-xs text-gray-400">
            Expired status is set automatically based on the license date.
          </p>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting && (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {isEdit ? "Save Changes" : "Add Doctor"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
          <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

function inputCls(error?: string) {
  return [
    "block w-full rounded-md border px-3 py-2 text-sm shadow-sm",
    "focus:outline-none focus:ring-1",
    error
      ? "border-red-400 focus:border-red-500 focus:ring-red-500"
      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
  ].join(" ");
}
