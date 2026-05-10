export type DoctorStatus = "Active" | "Expired" | "Suspended";

export interface Doctor {
  id: number;
  fullName: string;
  email: string;
  specialization: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  status: DoctorStatus;
  createdDate: string;
}

export interface PagedResult<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T | null;
  errors?: string[];
}

export interface DoctorListParams {
  search?: string;
  status?: DoctorStatus | "";
  pageNumber?: number;
  pageSize?: number;
}

export interface CreateDoctorPayload {
  fullName: string;
  email: string;
  specialization: string;
  licenseNumber: string;
  licenseExpiryDate: string;
}

export type UpdateDoctorPayload = CreateDoctorPayload;

export interface UpdateStatusPayload {
  status: DoctorStatus;
}
