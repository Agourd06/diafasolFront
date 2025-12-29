import axiosClient from './axiosClient';
import type {
  ReservationCancellationPolicy,
  CreateReservationCancellationPolicyDto,
  UpdateReservationCancellationPolicyDto,
} from '../features/reservation-cancellation-policies/types';

const BASE_URL = '/reservation-cancellation-policies';

export const createReservationCancellationPolicy = async (
  data: CreateReservationCancellationPolicyDto
): Promise<ReservationCancellationPolicy> => {
  const response = await axiosClient.post<ReservationCancellationPolicy>(BASE_URL, data);
  return response.data;
};

export const getReservationCancellationPolicies = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<{ data: ReservationCancellationPolicy[]; total: number }> => {
  const response = await axiosClient.get<{ data: ReservationCancellationPolicy[]; total: number }>(
    BASE_URL,
    { params }
  );
  return response.data;
};

export const getReservationCancellationPolicyById = async (
  id: string
): Promise<ReservationCancellationPolicy> => {
  const response = await axiosClient.get<ReservationCancellationPolicy>(`${BASE_URL}/${id}`);
  return response.data;
};

export const updateReservationCancellationPolicy = async (
  id: string,
  data: UpdateReservationCancellationPolicyDto
): Promise<ReservationCancellationPolicy> => {
  const response = await axiosClient.patch<ReservationCancellationPolicy>(
    `${BASE_URL}/${id}`,
    data
  );
  return response.data;
};

export const deleteReservationCancellationPolicy = async (id: string): Promise<void> => {
  await axiosClient.delete(`${BASE_URL}/${id}`);
};

export const getReservationCancellationPoliciesByProperty = async (
  propertyId: string
): Promise<ReservationCancellationPolicy[]> => {
  const response = await axiosClient.get<ReservationCancellationPolicy[]>(
    `${BASE_URL}/property/${propertyId}`
  );
  return response.data;
};

export const getReservationCancellationPoliciesByRatePlan = async (
  ratePlanId: string
): Promise<ReservationCancellationPolicy[]> => {
  const response = await axiosClient.get<ReservationCancellationPolicy[]>(
    `${BASE_URL}/rate-plan/${ratePlanId}`
  );
  return response.data;
};

export const searchReservationCancellationPolicies = async (
  query: string
): Promise<ReservationCancellationPolicy[]> => {
  const response = await axiosClient.get<{ data: ReservationCancellationPolicy[] }>(BASE_URL, {
    params: { search: query, limit: 20 },
  });
  return response.data.data;
};

