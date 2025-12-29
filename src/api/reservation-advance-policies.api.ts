import axiosClient from './axiosClient';
import type { 
  ReservationAdvancePolicy, 
  CreateReservationAdvancePolicyDto, 
  UpdateReservationAdvancePolicyDto 
} from '../features/reservation-advance-policies/types';

const BASE_URL = '/reservation-advance-policies';

export const createReservationAdvancePolicy = async (
  data: CreateReservationAdvancePolicyDto
): Promise<ReservationAdvancePolicy> => {
  const response = await axiosClient.post<ReservationAdvancePolicy>(BASE_URL, data);
  return response.data;
};

export const getReservationAdvancePolicies = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<{ data: ReservationAdvancePolicy[]; total: number }> => {
  const response = await axiosClient.get<{ data: ReservationAdvancePolicy[]; total: number }>(
    BASE_URL,
    { params }
  );
  return response.data;
};

export const getReservationAdvancePolicyById = async (
  id: string
): Promise<ReservationAdvancePolicy> => {
  const response = await axiosClient.get<ReservationAdvancePolicy>(`${BASE_URL}/${id}`);
  return response.data;
};

export const updateReservationAdvancePolicy = async (
  id: string,
  data: UpdateReservationAdvancePolicyDto
): Promise<ReservationAdvancePolicy> => {
  const response = await axiosClient.patch<ReservationAdvancePolicy>(`${BASE_URL}/${id}`, data);
  return response.data;
};

export const deleteReservationAdvancePolicy = async (id: string): Promise<void> => {
  await axiosClient.delete(`${BASE_URL}/${id}`);
};

export const getReservationAdvancePoliciesByProperty = async (
  propertyId: string
): Promise<ReservationAdvancePolicy[]> => {
  const response = await axiosClient.get<ReservationAdvancePolicy[]>(
    `${BASE_URL}/property/${propertyId}`
  );
  return response.data;
};

export const getReservationAdvancePoliciesByRatePlan = async (
  ratePlanId: string
): Promise<ReservationAdvancePolicy[]> => {
  const response = await axiosClient.get<ReservationAdvancePolicy[]>(
    `${BASE_URL}/rate-plan/${ratePlanId}`
  );
  return response.data;
};

export const searchReservationAdvancePolicies = async (
  query: string
): Promise<ReservationAdvancePolicy[]> => {
  const response = await axiosClient.get<{ data: ReservationAdvancePolicy[] }>(BASE_URL, {
    params: { search: query, limit: 20 },
  });
  return response.data.data;
};

