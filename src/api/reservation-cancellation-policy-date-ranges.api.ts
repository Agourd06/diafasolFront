import axiosClient from './axiosClient';
import type {
  ReservationCancellationPolicyDateRange,
  CreateReservationCancellationPolicyDateRangeDto,
  UpdateReservationCancellationPolicyDateRangeDto,
} from '../features/reservation-cancellation-policy-date-ranges/types';

const BASE_URL = '/reservation-cancellation-policy-date-ranges';

export const createReservationCancellationPolicyDateRange = async (
  data: CreateReservationCancellationPolicyDateRangeDto
): Promise<ReservationCancellationPolicyDateRange> => {
  const response = await axiosClient.post<ReservationCancellationPolicyDateRange>(BASE_URL, data);
  return response.data;
};

export const getReservationCancellationPolicyDateRangesByPolicy = async (
  policyId: string
): Promise<ReservationCancellationPolicyDateRange[]> => {
  const response = await axiosClient.get<ReservationCancellationPolicyDateRange[]>(
    `${BASE_URL}/policy/${policyId}`
  );
  return response.data;
};

export const getReservationCancellationPolicyDateRangeById = async (
  id: number
): Promise<ReservationCancellationPolicyDateRange> => {
  const response = await axiosClient.get<ReservationCancellationPolicyDateRange>(
    `${BASE_URL}/${id}`
  );
  return response.data;
};

export const updateReservationCancellationPolicyDateRange = async (
  id: number,
  data: UpdateReservationCancellationPolicyDateRangeDto
): Promise<ReservationCancellationPolicyDateRange> => {
  const response = await axiosClient.patch<ReservationCancellationPolicyDateRange>(
    `${BASE_URL}/${id}`,
    data
  );
  return response.data;
};

export const deleteReservationCancellationPolicyDateRange = async (id: number): Promise<void> => {
  await axiosClient.delete(`${BASE_URL}/${id}`);
};

export const searchReservationCancellationPolicyDateRanges = async (
  query: string
): Promise<ReservationCancellationPolicyDateRange[]> => {
  const response = await axiosClient.get<ReservationCancellationPolicyDateRange[]>(BASE_URL, {
    params: { search: query, limit: 20 },
  });
  return response.data;
};

