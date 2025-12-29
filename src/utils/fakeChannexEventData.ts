/**
 * Fake Channex Event Data Generator
 * 
 * Generates fake data matching the Channex event object structure
 * for testing the event storage system.
 * 
 * Supports all 8 event types:
 * - message
 * - ari
 * - booking
 * - booking_unmapped_room
 * - booking_unmapped_rate
 * - sync_error
 * - reservation_request
 * - review
 * 
 * This is used for testing until the actual Channex webhook integration is ready.
 */

import type { ChannexEventObject, ChannexEventType } from '@/features/event-messages/types';

/**
 * Generates a fake UUID v4
 */
function generateFakeUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generates a fake attachment object
 */
function generateFakeAttachment(): ChannexEventPayload['attachments'][0] {
  const types = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'];
  const extensions = ['jpg', 'png', 'pdf', 'txt'];
  const ext = extensions[Math.floor(Math.random() * extensions.length)];
  const type = types[extensions.indexOf(ext)];

  return {
    filename: `attachment_${Date.now()}.${ext}`,
    type,
    size: Math.floor(Math.random() * 1000000) + 1000, // 1KB to 1MB
  };
}

/**
 * Generates a fake message payload
 */
function generateFakeMessagePayload(
  propertyId: string,
  bookingId?: string
): any {
  const senders = ['guest', 'host', 'system'];
  const messages = [
    'Thanks a lot.',
    'You\'re welcome!',
    'Is breakfast included?',
    'Check-in is at 3 PM.',
    'Thank you for your booking.',
    'We look forward to hosting you.',
  ];

  const hasAttachments = Math.random() > 0.7; // 30% chance of having attachments
  const attachments = hasAttachments
    ? Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () =>
        generateFakeAttachment()
      )
    : [];

  return {
    id: generateFakeUUID(),
    message: messages[Math.floor(Math.random() * messages.length)],
    meta: null,
    sender: senders[Math.floor(Math.random() * senders.length)],
    property_id: propertyId,
    booking_id: bookingId || (Math.random() > 0.3 ? generateFakeUUID() : null),
    message_thread_id: Math.random() > 0.3 ? generateFakeUUID() : null,
    live_feed_event_id: Math.random() > 0.5 ? generateFakeUUID() : null,
    attachments,
    have_attachment: attachments.length > 0,
    ota_message_id: Math.random() > 0.4 ? generateFakeUUID() : null,
  };
}

/**
 * Generates a fake ARI payload
 */
function generateFakeAriPayload(propertyId: string): any {
  return {
    availability: Math.floor(Math.random() * 10) + 1,
    booked: Math.floor(Math.random() * 5),
    date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    rate_plan_id: generateFakeUUID(),
    room_type_id: generateFakeUUID(),
    stop_sell: Math.random() > 0.7,
  };
}

/**
 * Generates a fake booking payload
 */
function generateFakeBookingPayload(propertyId: string, bookingId?: string): any {
  return {
    booking_id: bookingId || generateFakeUUID(),
    property_id: propertyId,
    revision_id: generateFakeUUID(),
  };
}

/**
 * Generates a fake booking unmapped room payload
 */
function generateFakeBookingUnmappedRoomPayload(bookingId?: string): any {
  return {
    booking_id: bookingId || generateFakeUUID(),
    booking_revision_id: generateFakeUUID(),
  };
}

/**
 * Generates a fake booking unmapped rate payload
 */
function generateFakeBookingUnmappedRatePayload(bookingId?: string): any {
  return {
    booking_id: bookingId || generateFakeUUID(),
    booking_revision_id: generateFakeUUID(),
  };
}

/**
 * Generates a fake sync error payload
 */
function generateFakeSyncErrorPayload(propertyId: string): any {
  const channels = ['Agoda', 'Booking.com', 'Expedia', 'Airbnb'];
  const errorTypes = ['general_error', 'rate_error', 'availability_error', 'booking_error'];
  const channel = channels[Math.floor(Math.random() * channels.length)];

  return {
    channel,
    channel_event_id: generateFakeUUID(),
    channel_id: generateFakeUUID(),
    channel_name: channel,
    error_type: errorTypes[Math.floor(Math.random() * errorTypes.length)],
    property_name: `Hotel ${Math.floor(Math.random() * 100)}`,
  };
}

/**
 * Generates a fake reservation request payload
 */
function generateFakeReservationRequestPayload(): any {
  return {
    bms: {
      id: generateFakeUUID(),
      message: 'Reservation request',
      type: 'request',
    },
    resolved: false,
  };
}

/**
 * Generates a fake review payload
 */
function generateFakeReviewPayload(propertyId: string, bookingId?: string): any {
  const categories = ['value', 'clean', 'location', 'comfort', 'facilities', 'staff'];
  const scores = categories.map((category) => ({
    category,
    score: Math.random() * 5 + 5, // 5.0 to 10.0
  }));

  return {
    id: generateFakeUUID(),
    reply: null,
    content: null,
    channel_id: generateFakeUUID(),
    scores,
    ota: 'BookingCom',
    property_id: propertyId,
    expired_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    is_hidden: false,
    is_replied: false,
    ota_overall_score: Math.random() * 5 + 5,
    ota_reservation_id: String(Math.floor(Math.random() * 1000000000)),
    ota_review_id: Math.random().toString(36).substring(7),
    ota_scores: scores,
    overall_score: Math.random() * 5 + 5,
    raw_content: null,
    received_at: new Date().toISOString(),
    reviewer_name: null,
    booking_id: bookingId || generateFakeUUID(),
    live_feed_event_id: generateFakeUUID(),
    ota_inserted_at: null,
    reply_scheduled_at: null,
    reply_sent_at: null,
  };
}

/**
 * Generates a fake Channex event object with a single payload
 * 
 * @param propertyId - Optional property ID (defaults to random UUID)
 * @param bookingId - Optional booking ID (defaults to random UUID or null)
 * @param eventType - Optional event type (defaults to 'message')
 * @returns Fake Channex event object
 */
export function createFakeChannexEventObject(
  propertyId?: string,
  bookingId?: string,
  eventType: ChannexEventType = 'message'
): ChannexEventObject {
  const propId = propertyId || generateFakeUUID();

  let payload: any;
  switch (eventType) {
    case 'message':
      payload = generateFakeMessagePayload(propId, bookingId);
      break;
    case 'ari':
      payload = generateFakeAriPayload(propId);
      break;
    case 'booking':
      payload = generateFakeBookingPayload(propId, bookingId);
      break;
    case 'booking_unmapped_room':
      payload = generateFakeBookingUnmappedRoomPayload(bookingId);
      break;
    case 'booking_unmapped_rate':
      payload = generateFakeBookingUnmappedRatePayload(bookingId);
      break;
    case 'sync_error':
      payload = generateFakeSyncErrorPayload(propId);
      break;
    case 'reservation_request':
      payload = generateFakeReservationRequestPayload();
      break;
    case 'review':
      payload = generateFakeReviewPayload(propId, bookingId);
      break;
    default:
      payload = generateFakeMessagePayload(propId, bookingId);
  }

  return {
    event: eventType,
    payload,
    property_id: propId,
    user_id: Math.random() > 0.5 ? generateFakeUUID() : null,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generates a fake Channex event object with multiple payloads
 * 
 * @param propertyId - Optional property ID (defaults to random UUID)
 * @param payloadCount - Number of payloads to generate (defaults to 2)
 * @param bookingId - Optional booking ID (defaults to random UUID or null)
 * @param eventType - Optional event type (defaults to 'message')
 * @returns Fake Channex event object with payloads array
 */
export function createFakeChannexEventObjectWithMultiplePayloads(
  propertyId?: string,
  payloadCount: number = 2,
  bookingId?: string,
  eventType: ChannexEventType = 'message'
): ChannexEventObject {
  const propId = propertyId || generateFakeUUID();

  const generatePayload = () => {
    switch (eventType) {
      case 'message':
        return generateFakeMessagePayload(propId, bookingId);
      case 'ari':
        return generateFakeAriPayload(propId);
      case 'booking':
        return generateFakeBookingPayload(propId, bookingId);
      case 'booking_unmapped_room':
        return generateFakeBookingUnmappedRoomPayload(bookingId);
      case 'booking_unmapped_rate':
        return generateFakeBookingUnmappedRatePayload(bookingId);
      case 'sync_error':
        return generateFakeSyncErrorPayload(propId);
      case 'reservation_request':
        return generateFakeReservationRequestPayload();
      case 'review':
        return generateFakeReviewPayload(propId, bookingId);
      default:
        return generateFakeMessagePayload(propId, bookingId);
    }
  };

  return {
    event: eventType,
    payloads: Array.from({ length: payloadCount }, generatePayload),
    property_id: propId,
    user_id: Math.random() > 0.5 ? generateFakeUUID() : null,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generates a fake Channex event object with attachments (message events only)
 * 
 * @param propertyId - Optional property ID (defaults to random UUID)
 * @param attachmentCount - Number of attachments to generate (defaults to 2)
 * @param bookingId - Optional booking ID (defaults to random UUID or null)
 * @returns Fake Channex event object with attachments
 */
export function createFakeChannexEventObjectWithAttachments(
  propertyId?: string,
  attachmentCount: number = 2,
  bookingId?: string
): ChannexEventObject {
  const propId = propertyId || generateFakeUUID();
  const payload = generateFakeMessagePayload(propId, bookingId);
  
  // Force attachments (only for message events)
  payload.attachments = Array.from({ length: attachmentCount }, () =>
    generateFakeAttachment()
  );
  payload.have_attachment = true;

  return {
    event: 'message',
    payload,
    property_id: propId,
    user_id: Math.random() > 0.5 ? generateFakeUUID() : null,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generates a fake Channex event object with review scores (review events only)
 * 
 * @param propertyId - Optional property ID (defaults to random UUID)
 * @param scoreCount - Number of scores to generate (defaults to 6)
 * @param bookingId - Optional booking ID (defaults to random UUID or null)
 * @returns Fake Channex event object with review scores
 */
export function createFakeChannexEventObjectWithReviewScores(
  propertyId?: string,
  scoreCount: number = 6,
  bookingId?: string
): ChannexEventObject {
  const propId = propertyId || generateFakeUUID();
  const payload = generateFakeReviewPayload(propId, bookingId);
  
  // Force scores with specified count
  const categories = ['value', 'clean', 'location', 'comfort', 'facilities', 'staff'];
  const selectedCategories = categories.slice(0, Math.min(scoreCount, categories.length));
  
  payload.scores = selectedCategories.map((category) => ({
    category,
    score: Math.random() * 5 + 5, // 5.0 to 10.0
  }));
  
  // OTA scores are the same as scores
  payload.ota_scores = payload.scores.map((score) => ({ ...score }));

  console.log('📊 Generated review event with scores:', {
    scoresCount: payload.scores.length,
    otaScoresCount: payload.ota_scores.length,
    scores: payload.scores,
    otaScores: payload.ota_scores,
  });

  return {
    event: 'review',
    payload,
    property_id: propId,
    user_id: Math.random() > 0.5 ? generateFakeUUID() : null,
    timestamp: new Date().toISOString(),
  };
}

