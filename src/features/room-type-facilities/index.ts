/**
 * Room Type Facilities Feature - Centralized Exports
 */

// Types
export type {
  RoomTypeFacilityLink,
  CreateRoomTypeFacilityLinkPayload,
  PaginatedRoomTypeFacilityLinksResponse,
  RoomTypeFacilityLinkQueryParams,
} from './types';

// Hooks
export {
  useRoomTypeFacilities,
  useRoomTypeFacilitiesByRoomType,
  useCreateRoomTypeFacilityLink,
  useDeleteRoomTypeFacilityLink,
} from './hooks';

// Components
export { default as RoomTypeFacilityLinkForm } from './components/RoomTypeFacilityLinkForm';
export { default as RoomTypeFacilitiesTable } from './components/RoomTypeFacilitiesTable';

// Pages
export { default as RoomTypeFacilitiesList } from './pages/RoomTypeFacilitiesList';
export { default as CreateRoomTypeFacilityLink } from './pages/CreateRoomTypeFacilityLink';

