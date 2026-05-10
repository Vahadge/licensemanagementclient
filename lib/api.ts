import type {
  ApiResponse,
  CreateDoctorPayload,
  Doctor,
  DoctorListParams,
  PagedResult,
  UpdateDoctorPayload,
  UpdateStatusPayload,
} from "@/types/doctor";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5126/api";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const json: ApiResponse<T> = await res.json();

  if (!res.ok) {
    throw new Error(json.message || `Request failed with status ${res.status}`);
  }

  return json;
}

export const doctorApi = {
  getAll(params: DoctorListParams = {}): Promise<ApiResponse<PagedResult<Doctor>>> {
    const query = new URLSearchParams();
    if (params.search)     query.set("search",     params.search);
    if (params.status)     query.set("status",     params.status);
    if (params.pageNumber) query.set("pageNumber", String(params.pageNumber));
    if (params.pageSize)   query.set("pageSize",   String(params.pageSize));

    const qs = query.toString();
    return request<PagedResult<Doctor>>(`/doctors${qs ? `?${qs}` : ""}`);
  },

  getById(id: number): Promise<ApiResponse<Doctor>> {
    return request<Doctor>(`/doctors/${id}`);
  },

  getExpired(): Promise<ApiResponse<Doctor[]>> {
    return request<Doctor[]>("/doctors/expired");
  },

  create(payload: CreateDoctorPayload): Promise<ApiResponse<Doctor>> {
    return request<Doctor>("/doctors", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update(id: number, payload: UpdateDoctorPayload): Promise<ApiResponse<Doctor>> {
    return request<Doctor>(`/doctors/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  updateStatus(id: number, payload: UpdateStatusPayload): Promise<ApiResponse<null>> {
    return request<null>(`/doctors/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  delete(id: number): Promise<ApiResponse<null>> {
    return request<null>(`/doctors/${id}`, { method: "DELETE" });
  },
};
