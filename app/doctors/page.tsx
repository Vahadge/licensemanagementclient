"use client";

import { useCallback, useEffect, useState } from "react";
import { doctorApi } from "@/lib/api";
import type { CreateDoctorPayload, Doctor, DoctorStatus, PagedResult } from "@/types/doctor";
import DoctorTable from "@/components/DoctorTable";
import SearchFilter from "@/components/SearchFilter";
import Pagination from "@/components/Pagination";
import LoadingSpinner from "@/components/LoadingSpinner";
import DoctorModal from "@/components/DoctorModal";
import DoctorForm from "@/components/DoctorForm";
import DoctorDetailModal from "@/components/DoctorDetailModal";

const PAGE_SIZE = 10;

export default function DoctorsPage() {
  // ─── Data state ────────────────────────────────────────────────────────────
  const [result, setResult] = useState<PagedResult<Doctor> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Filter / pagination state ─────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<DoctorStatus | "">("");
  const [page, setPage] = useState(1);

  // ─── Modal state ───────────────────────────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [viewingDoctor, setViewingDoctor] = useState<Doctor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // ─── Fetch doctors ─────────────────────────────────────────────────────────
  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await doctorApi.getAll({
        search: search || undefined,
        status: status || undefined,
        pageNumber: page,
        pageSize: PAGE_SIZE,
      });
      setResult(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load doctors.");
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  // ─── Toast helper ──────────────────────────────────────────────────────────
  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  // ─── Handlers ──────────────────────────────────────────────────────────────
  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusChange(value: DoctorStatus | "") {
    setStatus(value);
    setPage(1);
  }

  function handleClearFilters() {
    setSearch("");
    setStatus("");
    setPage(1);
  }

  function openAddModal() {
    setEditingDoctor(null);
    setFormOpen(true);
  }

  function openEditModal(doctor: Doctor) {
    setEditingDoctor(doctor);
    setFormOpen(true);
  }

  function closeFormModal() {
    setFormOpen(false);
    setEditingDoctor(null);
  }

  async function handleFormSubmit(payload: CreateDoctorPayload) {
    setIsSubmitting(true);
    try {
      if (editingDoctor) {
        await doctorApi.update(editingDoctor.id, payload);
        showToast("Doctor updated successfully.", "success");
      } else {
        await doctorApi.create(payload);
        showToast("Doctor added successfully.", "success");
      }
      closeFormModal();
      fetchDoctors();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Operation failed.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(doctor: Doctor) {
    if (!confirm(`Delete Dr. ${doctor.fullName}? This cannot be undone.`)) return;
    try {
      await doctorApi.delete(doctor.id);
      showToast("Doctor deleted.", "success");
      fetchDoctors();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Delete failed.", "error");
    }
  }

  async function handleStatusChange2(doctor: Doctor, newStatus: DoctorStatus) {
    if (newStatus === doctor.status) return;
    try {
      await doctorApi.updateStatus(doctor.id, { status: newStatus });
      showToast(`Status changed to ${newStatus}.`, "success");
      fetchDoctors();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Status update failed.", "error");
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Doctors</h2>
          {result && (
            <p className="mt-0.5 text-sm text-gray-500">
              {result.totalCount} doctor{result.totalCount !== 1 ? "s" : ""} registered
            </p>
          )}
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Doctor
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <SearchFilter
          search={search}
          status={status}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
          onClear={handleClearFilters}
        />
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <svg className="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm font-medium text-gray-700">{error}</p>
            <button
              onClick={fetchDoctors}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <DoctorTable
              doctors={result?.data ?? []}
              onEdit={openEditModal}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange2}
              onView={setViewingDoctor}
            />
            {result && (
              <Pagination
                currentPage={result.pageNumber}
                totalPages={result.totalPages}
                totalCount={result.totalCount}
                pageSize={result.pageSize}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>

      {/* Add / Edit modal */}
      <DoctorModal
        title={editingDoctor ? "Edit Doctor" : "Add New Doctor"}
        isOpen={formOpen}
        onClose={closeFormModal}
      >
        <DoctorForm
          initialData={editingDoctor}
          onSubmit={handleFormSubmit}
          onCancel={closeFormModal}
          isSubmitting={isSubmitting}
        />
      </DoctorModal>

      {/* View detail modal */}
      <DoctorDetailModal
        doctor={viewingDoctor}
        onClose={() => setViewingDoctor(null)}
      />

      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-white shadow-lg transition-all ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.type === "success" ? (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
}
