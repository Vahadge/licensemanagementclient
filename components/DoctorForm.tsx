"use client";

import { useEffect, useState } from "react";
import type { CreateDoctorPayload, Doctor } from "@/types/doctor";

interface DoctorFormProps {
  initialData?: Doctor | null;
  onSubmit: (payload: CreateDoctorPayload) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const EMPTY: CreateDoctorPayload = {
  fullName: "",
  email: "",
  specialization: "",
  licenseNumber: "",
  licenseExpiryDate: "",
};

function toDateInputValue(iso: string | undefined) {
  if (!iso) return "";
  return iso.split("T")[0];
}

export default function DoctorForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: DoctorFormProps) {
  const [form, setForm] = useState<CreateDoctorPayload>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateDoctorPayload, string>>>({});

  useEffect(() => {
    if (initialData) {
      setForm({
        fullName:         initialData.fullName,
        email:            initialData.email,
        specialization:   initialData.specialization,
        licenseNumber:    initialData.licenseNumber,
        licenseExpiryDate: toDateInputValue(initialData.licenseExpiryDate),
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [initialData]);

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.fullName.trim())       next.fullName       = "Full name is required.";
    if (!form.email.trim())          next.email          = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                                     next.email          = "Enter a valid email address.";
    if (!form.specialization.trim()) next.specialization = "Specialization is required.";
    if (!form.licenseNumber.trim())  next.licenseNumber  = "License number is required.";
    if (!form.licenseExpiryDate)     next.licenseExpiryDate = "Expiry date is required.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({
      ...form,
      licenseExpiryDate: new Date(form.licenseExpiryDate).toISOString(),
    });
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

  const isEdit = !!initialData;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Field label="Full Name" error={errors.fullName}>
        <input type="text" {...field("fullName")} className={inputCls(errors.fullName)} placeholder="Dr. Jane Smith" />
      </Field>

      <Field label="Email" error={errors.email}>
        <input type="email" {...field("email")} className={inputCls(errors.email)} placeholder="jane.smith@hospital.com" />
      </Field>

      <Field label="Specialization" error={errors.specialization}>
        <input type="text" {...field("specialization")} className={inputCls(errors.specialization)} placeholder="Cardiology" />
      </Field>

      <Field label="License Number" error={errors.licenseNumber}>
        <input type="text" {...field("licenseNumber")} className={inputCls(errors.licenseNumber)} placeholder="LIC-2024-00001" />
      </Field>

      <Field label="License Expiry Date" error={errors.licenseExpiryDate}>
        <input type="date" {...field("licenseExpiryDate")} className={inputCls(errors.licenseExpiryDate)} />
      </Field>

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
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
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
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
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
