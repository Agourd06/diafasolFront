/**
 * Events Feature - Type Definitions
 * 
 * Handles Channex webhook events storage.
 * Separates incoming Channex events into 3 database tables:
 * - events (root level fields)
 * - event_details (payload object - fields vary by event type)
 * - attachments (payload.attachments array - only for message events)
 */

// ============================================
// Channex Event Object (Input from Webhook)
// ============================================

/**
 * Supported event types from Channex
 */
export type ChannexEventType =
  | 'message'
  | 'ari'
  | 'booking'
  | 'booking_unmapped_room'
  | 'booking_unmapped_rate'
  | 'sync_error'
  | 'reservation_request'
  | 'review';

/**
 * Payload structure for message events
 */
export interface ChannexMessagePayload {
  id: string;
  message: string;
  meta: any | null;
  sender: string;
  property_id: string;
  booking_id: string | null;
  message_thread_id: string | null;
  live_feed_event_id: string | null;
  attachments: Array<{
    filename?: string;
    type?: string;
    size?: number;
  }>;
  have_attachment: boolean;
  ota_message_id: string | null;
}

/**
 * Generic payload structure - can be any object
 * Different event types have different payload structures
 */
export type ChannexEventPayload = any;

/**
 * Complete Channex event object structure
 * Can have single payload or multiple payloads
 * Payload structure varies by event type
 */
export interface ChannexEventObject {
  event: ChannexEventType;
  payload?: ChannexEventPayload; // Single payload (structure varies by event type)
  payloads?: ChannexEventPayload[]; // Multiple payloads (alternative structure)
  property_id: string;
  user_id: string | null;
  timestamp: string;
}

// ============================================
// Database Entity Types (Output to Backend)
// ============================================

/**
 * Event (Root level - events table)
 * Note: userId is NOT stored here, it goes to event_details
 */
export interface EventMessage {
  id: string; // UUID
  companyId: number; // Auto-set from JWT token
  propertyId: string; // UUID (from root level property_id)
  eventType: string; // Event type (message, ari, booking, etc.)
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  // Optional fields from API response
  company?: any;
  property?: any;
  details?: EventMessageDetailsWithRelations[]; // Details array from API (includes attachments, scores, etc.)
}

/**
 * Event Details with relations (from API response)
 * Includes attachments for message events and scores for review events
 */
export interface EventMessageDetailsWithRelations extends EventMessageDetails {
  attachments?: Attachment[]; // For message events
  reviewScores?: EventReviewScore[]; // For review events
  reviewOtaScores?: EventReviewOtaScore[]; // For review events
}

/**
 * Event Details (Payload object - event_details table)
 * All fields except eventId and userId are optional
 * Different event types use different fields
 */
export interface EventMessageDetails {
  id: string; // UUID
  companyId: number; // Auto-set from JWT token
  eventId: string; // UUID (FK to events) - NOTE: changed from eventMessageId
  userId: string | null; // From root level user_id (stored in event_details, not events)
  
  // Message event fields
  message?: string | null;
  sender?: string | null;
  bookingId?: string | null;
  messageThreadId?: string | null;
  liveFeedEventId?: string | null;
  otaMessageId?: string | null;
  haveAttachment?: boolean | null;
  
  // ARI event fields
  availability?: number | null;
  booked?: number | null;
  date?: string | null; // Format: "YYYY-MM-DD"
  ratePlanId?: string | null;
  roomTypeId?: string | null;
  stopSell?: boolean | null;
  
  // Booking event fields
  revisionId?: string | null;
  bookingRevisionId?: string | null;
  
  // Sync error event fields
  channel?: string | null;
  channelEventId?: string | null;
  channelId?: string | null;
  channelName?: string | null;
  errorType?: string | null;
  propertyName?: string | null;
  
  // Reservation request event fields
  bms?: any | null; // JSON object
  resolved?: boolean | null;
  
  // Review event fields
  // Note: scores and otaScores are NOT stored here - they are stored separately in event-review-scores and event-review-ota-scores tables
  reviewId?: string | null;
  reply?: string | null;
  content?: string | null;
  reviewChannelId?: string | null;
  ota?: string | null;
  reviewPropertyId?: string | null;
  expiredAt?: string | null;
  isHidden?: boolean | null;
  isReplied?: boolean | null;
  otaOverallScore?: number | null;
  otaReservationId?: string | null;
  otaReviewId?: string | null;
  overallScore?: number | null;
  rawContent?: string | null;
  receivedAt?: string | null;
  reviewerName?: string | null;
  otaInsertedAt?: string | null;
  replyScheduledAt?: string | null;
  replySentAt?: string | null;
  
  meta: any | null; // For any additional data
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * Attachment (payload.attachments array - attachments table)
 */
export interface Attachment {
  id: string; // UUID
  companyId: number; // Auto-set from JWT token
  eventDetailsId: string; // UUID (FK to event_details) - Changed from eventMessageDetailsId
  filename: string | null;
  type: string | null;
  size: number | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * Event Review Score (payload.scores array - event-review-scores table)
 * Only for review events
 */
export interface EventReviewScore {
  id: string; // UUID
  companyId: number; // Auto-set from JWT token
  eventDetailsId: string; // UUID (FK to event_details)
  category: string; // e.g., "value", "clean", "location"
  score: number; // e.g., 10.0, 7.5
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * Event Review OTA Score (payload.ota_scores array - event-review-ota-scores table)
 * Only for review events
 */
export interface EventReviewOtaScore {
  id: string; // UUID
  companyId: number; // Auto-set from JWT token
  eventDetailsId: string; // UUID (FK to event_details)
  category: string; // e.g., "value", "clean", "location"
  score: number; // e.g., 10.0, 7.5
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// ============================================
// API Payload Types (For POST requests)
// ============================================

/**
 * Payload for creating an event
 * ⚠️ CRITICAL: Do NOT include companyId, id, createdAt, or updatedAt
 * ✅ userId belongs HERE in events table (Step 1)
 */
export interface CreateEventMessagePayload {
  propertyId: string;
  eventType: string;
  userId: string | null; // From root level user_id - goes to events table
}

/**
 * Payload for creating event details
 * ⚠️ CRITICAL: Do NOT include companyId, id, createdAt, or updatedAt
 * ⚠️ IMPORTANT: Do NOT include userId - it belongs only in events table (Step 1)
 * All fields except eventId are optional
 * Different event types use different fields
 */
export interface CreateEventMessageDetailsPayload {
  eventId: string; // Changed from eventMessageId
  // ⚠️ NO userId here - it belongs only in events table (Step 1)
  
  // Message event fields
  message?: string | null;
  sender?: string | null;
  bookingId?: string | null;
  messageThreadId?: string | null;
  liveFeedEventId?: string | null;
  otaMessageId?: string | null;
  haveAttachment?: boolean | null;
  
  // ARI event fields
  availability?: number | null;
  booked?: number | null;
  date?: string | null;
  ratePlanId?: string | null;
  roomTypeId?: string | null;
  stopSell?: boolean | null;
  
  // Booking event fields
  revisionId?: string | null;
  bookingRevisionId?: string | null;
  
  // Sync error event fields
  channel?: string | null;
  channelEventId?: string | null;
  channelId?: string | null;
  channelName?: string | null;
  errorType?: string | null;
  propertyName?: string | null;
  
  // Reservation request event fields
  bms?: any | null;
  resolved?: boolean | null;
  
  // Review event fields
  // Note: scores and otaScores are NOT included here - they are stored separately in event-review-scores and event-review-ota-scores tables
  reviewId?: string | null;
  reply?: string | null;
  content?: string | null;
  reviewChannelId?: string | null;
  ota?: string | null;
  reviewPropertyId?: string | null;
  expiredAt?: string | null;
  isHidden?: boolean | null;
  isReplied?: boolean | null;
  otaOverallScore?: number | null;
  otaReservationId?: string | null;
  otaReviewId?: string | null;
  overallScore?: number | null;
  rawContent?: string | null;
  receivedAt?: string | null;
  reviewerName?: string | null;
  otaInsertedAt?: string | null;
  replyScheduledAt?: string | null;
  replySentAt?: string | null;
  
  meta?: any | null; // For any additional data
}

/**
 * Payload for creating an attachment
 * ⚠️ CRITICAL: Do NOT include companyId, id, createdAt, or updatedAt
 */
export interface CreateAttachmentPayload {
  eventDetailsId: string; // Changed from eventMessageDetailsId
  filename: string | null;
  type: string | null;
  size: number | null;
}

// ============================================
// Storage Result Types
// ============================================

/**
 * Result of storing a single payload with its attachments and review scores
 */
export interface StoredPayloadResult {
  eventMessageDetails: EventMessageDetails;
  attachments: Attachment[];
  reviewScores: EventReviewScore[];
  reviewOtaScores: EventReviewOtaScore[];
}

/**
 * Complete result of storing a Channex event
 */
export interface StoredEventResult {
  success: boolean;
  eventMessage: EventMessage;
  eventMessageDetails: StoredPayloadResult[];
  channexFormat?: ChannexEventObject; // Optional: Channex-like format for comparison
}

