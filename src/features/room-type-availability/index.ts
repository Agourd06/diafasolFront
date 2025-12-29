/**
 * Room Type Availability Feature - Centralized Exports
 */

// Types
export type {
  RoomTypeAvailability,
  CreateRoomTypeAvailabilityPayload,
  UpdateRoomTypeAvailabilityPayload,
  PaginatedRoomTypeAvailabilityResponse,
  RoomTypeAvailabilityQueryParams,
  RoomTypeAvailabilityDateRange,
} from './types';

// Hooks
export {
  useRoomTypeAvailability,
  useRoomTypeAvailabilitySearch,
  useRoomTypeAvailabilityByRoomType,
  useRoomTypeAvailabilityByDateRange,
  useRoomTypeAvailabilityById,
  useCreateRoomTypeAvailability,
  useUpdateRoomTypeAvailability,
  useDeleteRoomTypeAvailability,
} from './hooks';

// Components
export { default as RoomTypeAvailabilityForm } from './components/RoomTypeAvailabilityForm';
export { default as RoomTypeAvailabilityTable } from './components/RoomTypeAvailabilityTable';

// Pages
export { default as RoomTypeAvailabilityList } from './pages/RoomTypeAvailabilityList';
export { default as CreateRoomTypeAvailability } from './pages/CreateRoomTypeAvailability';
export { default as EditRoomTypeAvailability } from './pages/EditRoomTypeAvailability';

