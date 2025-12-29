import axiosClient from './axiosClient';
import type {
  ReservationAdvancePolicyDateRange,
  CreateReservationAdvancePolicyDateRangeDto,
  UpdateReservationAdvancePolicyDateRangeDto,
} from '../features/reservation-advance-policy-date-ranges/types';

const BASE_URL = '/reservation-advance-policy-date-ranges';

export const createReservationAdvancePolicyDateRange = async (
  data: CreateReservationAdvancePolicyDateRangeDto
): Promise<ReservationAdvancePolicyDateRange> => {
  const response = await axiosClient.post<ReservationAdvancePolicyDateRange>(BASE_URL, data);
  return response.data;
};

export const getReservationAdvancePolicyDateRangesByPolicy = async (
  policyId: string
): Promise<ReservationAdvancePolicyDateRange[]> => {
  const response = await axiosClient.get<ReservationAdvancePolicyDateRange[]>(
    `${BASE_URL}/policy/${policyId}`
  );
  return response.data;
};

export const getReservationAdvancePolicyDateRangeById = async (
  id: number
): Promise<ReservationAdvancePolicyDateRange> => {
  const response = await axiosClient.get<ReservationAdvancePolicyDateRange>(`${BASE_URL}/${id}`);
  return response.data;
};

export const updateReservationAdvancePolicyDateRange = async (
  id: number,
  data: UpdateReservationAdvancePolicyDateRangeDto
): Promise<ReservationAdvancePolicyDateRange> => {
  const response = await axiosClient.patch<ReservationAdvancePolicyDateRange>(
    `${BASE_URL}/${id}`,
    data
  );
  return response.data;
};

export const deleteReservationAdvancePolicyDateRange = async (id: number): Promise<void> => {
  await axiosClient.delete(`${BASE_URL}/${id}`);
};

export const searchReservationAdvancePolicyDateRanges = async (
  query: string
): Promise<ReservationAdvancePolicyDateRange[]> => {
  const response = await axiosClient.get<ReservationAdvancePolicyDateRange[]>(BASE_URL, {
    params: { search: query, limit: 20 },
  });
  return response.data;
};

