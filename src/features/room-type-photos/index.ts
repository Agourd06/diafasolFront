/**
 * Room Type Photos Feature - Centralized Exports
 */

// Types
export type {
  RoomTypePhoto,
  CreateRoomTypePhotoPayload,
  UpdateRoomTypePhotoPayload,
  PaginatedRoomTypePhotosResponse,
  RoomTypePhotoQueryParams,
} from './types';

// Hooks
export {
  useRoomTypePhotos,
  useRoomTypePhotosSearch,
  useRoomTypePhotosByRoomType,
  useRoomTypePhotoById,
  useCreateRoomTypePhoto,
  useUpdateRoomTypePhoto,
  useDeleteRoomTypePhoto,
} from './hooks';

// Components
export { default as RoomTypePhotoForm } from './components/RoomTypePhotoForm';
export { default as RoomTypePhotosTable } from './components/RoomTypePhotosTable';

// Pages
export { default as RoomTypePhotosList } from './pages/RoomTypePhotosList';
export { default as CreateRoomTypePhoto } from './pages/CreateRoomTypePhoto';
export { default as EditRoomTypePhoto } from './pages/EditRoomTypePhoto';

