/**
 * Channex Event Storage Service
 * 
 * Handles the separation and storage of Channex webhook events into database tables.
 * 
 * Flow:
 * 1. Receives Channex event object
 * 2. Creates events record (root level fields: event, property_id)
 * 3. For each payload, creates event_details record (fields vary by event type)
 * 4. For each attachment in payload, creates attachments record (only for message events)
 * 
 * Performance optimizations:
 * - Parallel attachment creation using Promise.all
 * - Batch processing for multiple payloads
 * - Error handling with cleanup on failure
 */

import type {
  ChannexEventObject,
  ChannexEventPayload,
  ChannexMessagePayload,
  StoredEventResult,
  StoredPayloadResult,
  EventReviewScore,
  EventReviewOtaScore,
} from '@/features/event-messages/types';
import {
  createEventMessage,
} from '@/api/event-messages.api';
import {
  createEventMessageDetails,
} from '@/api/event-message-details.api';
import {
  createAttachment,
} from '@/api/attachments.api';
import {
  createEventReviewScore,
} from '@/api/event-review-scores.api';
import {
  createEventReviewOtaScore,
} from '@/api/event-review-ota-scores.api';

/**
 * Normalizes payload structure to always return an array
 * Handles both single payload and multiple payloads
 */
function normalizePayloads(eventObject: ChannexEventObject): ChannexEventPayload[] {
  if (eventObject.payloads && Array.isArray(eventObject.payloads)) {
    return eventObject.payloads;
  }
  if (eventObject.payload) {
    return [eventObject.payload];
  }
  return [];
}

/**
 * Validates the Channex event object structure
 * Supports all 8 event types with different payload structures
 */
function validateEventObject(eventObject: ChannexEventObject): void {
  const supportedEvents = [
    'message',
    'ari',
    'booking',
    'booking_unmapped_room',
    'booking_unmapped_rate',
    'sync_error',
    'reservation_request',
    'review',
  ];

  if (!eventObject.event) {
    throw new Error('Event object must have an "event" field');
  }

  if (!supportedEvents.includes(eventObject.event)) {
    throw new Error(
      `Unsupported event type: ${eventObject.event}. Supported types: ${supportedEvents.join(', ')}`
    );
  }

  if (!eventObject.property_id) {
    throw new Error('Event object must have a "property_id" field');
  }

  const payloads = normalizePayloads(eventObject);
  if (payloads.length === 0) {
    throw new Error('Event object must have at least one payload or payloads array');
  }

  // Only validate message-specific fields for message events
  if (eventObject.event === 'message') {
    for (const payload of payloads) {
      if (!payload.message && payload.message !== '') {
        throw new Error('Message event payload must have a "message" field');
      }
      if (!payload.sender && payload.sender !== '') {
        throw new Error('Message event payload must have a "sender" field');
      }
    }
  }
}

/**
 * Stores attachments for a given event details record
 * Processes all attachments in parallel for better performance
 * Only message events have attachments
 */
async function storeAttachments(
  eventDetailsId: string, // Changed from eventMessageDetailsId
  attachments: ChannexMessagePayload['attachments'] | undefined
): Promise<StoredPayloadResult['attachments']> {
  if (!attachments || attachments.length === 0) {
    return [];
  }

  // Process all attachments in parallel for better performance
  const attachmentPromises = attachments.map(async (attachment) => {
    return createAttachment({
      eventDetailsId, // Changed from eventMessageDetailsId
      filename: attachment.filename || null,
      type: attachment.type || null,
      size: attachment.size || null,
    });
  });

  try {
    const createdAttachments = await Promise.all(attachmentPromises);
    return createdAttachments;
  } catch (error) {
    console.error('❌ Error creating attachments:', error);
    // Don't throw - partial success is acceptable for attachments
    // The main event and details are already stored
    return [];
  }
}

/**
 * Stores review scores for a given event details record
 * Processes all scores in parallel for better performance
 * Only review events have scores
 */
async function storeReviewScores(
  eventDetailsId: string,
  scores: Array<{ category: string; score: number }> | undefined
): Promise<EventReviewScore[]> {
  console.log('📊 storeReviewScores called:', {
    eventDetailsId,
    scores,
    scoresLength: scores?.length || 0,
    isArray: Array.isArray(scores),
  });

  if (!scores || scores.length === 0) {
    console.log('⚠️ No scores to store (empty or undefined)');
    return [];
  }

  // Process all scores in parallel for better performance
  const scorePromises = scores.map(async (score, index) => {
    console.log(`📊 Creating review score ${index + 1}/${scores.length}:`, {
      category: score.category,
      score: score.score,
    });
    return createEventReviewScore({
      eventDetailsId,
      category: score.category || '',
      score: score.score || 0,
    });
  });

  try {
    const createdScores = await Promise.all(scorePromises);
    console.log(`✅ Created ${createdScores.length} review scores`);
    return createdScores;
  } catch (error) {
    console.error('❌ Error creating review scores:', error);
    // Don't throw - partial success is acceptable for scores
    // The main event and details are already stored
    return [];
  }
}

/**
 * Stores review OTA scores for a given event details record
 * Processes all OTA scores in parallel for better performance
 * Only review events have OTA scores
 */
async function storeReviewOtaScores(
  eventDetailsId: string,
  otaScores: Array<{ category: string; score: number }> | undefined
): Promise<EventReviewOtaScore[]> {
  console.log('📊 storeReviewOtaScores called:', {
    eventDetailsId,
    otaScores,
    otaScoresLength: otaScores?.length || 0,
    isArray: Array.isArray(otaScores),
  });

  if (!otaScores || otaScores.length === 0) {
    console.log('⚠️ No OTA scores to store (empty or undefined)');
    return [];
  }

  // Process all OTA scores in parallel for better performance
  const otaScorePromises = otaScores.map(async (score, index) => {
    console.log(`📊 Creating review OTA score ${index + 1}/${otaScores.length}:`, {
      category: score.category,
      score: score.score,
    });
    return createEventReviewOtaScore({
      eventDetailsId,
      category: score.category || '',
      score: score.score || 0,
    });
  });

  try {
    const createdOtaScores = await Promise.all(otaScorePromises);
    console.log(`✅ Created ${createdOtaScores.length} review OTA scores`);
    return createdOtaScores;
  } catch (error) {
    console.error('❌ Error creating review OTA scores:', error);
    // Don't throw - partial success is acceptable for OTA scores
    // The main event and details are already stored
    return [];
  }
}

/**
 * Maps payload fields to event_details based on event type
 * According to the guide, different event types have different field mappings
 * ⚠️ IMPORTANT: userId is NOT included here - it belongs only in events table (Step 1)
 */
function mapPayloadToEventDetails(
  eventType: string,
  payload: ChannexEventPayload,
  eventId: string
): any {
  const basePayload: any = {
    eventId, // Changed from eventMessageId
    // ⚠️ NO userId here - it belongs only in events table (Step 1)
  };

  switch (eventType) {
    case 'message': {
      // Message event: extract specific fields
      return {
        ...basePayload,
        message: payload.message || null,
        sender: payload.sender || null,
        bookingId: payload.booking_id || null,
        messageThreadId: payload.message_thread_id || null,
        liveFeedEventId: payload.live_feed_event_id || null,
        otaMessageId: payload.ota_message_id || null,
        haveAttachment: payload.have_attachment || false,
        meta: payload.meta || null,
      };
    }

    case 'ari': {
      // ARI event: availability, rates, inventory
      return {
        ...basePayload,
        availability: payload.availability ?? null,
        booked: payload.booked ?? null,
        date: payload.date || null, // Format: "YYYY-MM-DD"
        ratePlanId: payload.rate_plan_id || null,
        roomTypeId: payload.room_type_id || null,
        stopSell: payload.stop_sell ?? null,
        meta: null,
      };
    }

    case 'booking': {
      // Booking event
      return {
        ...basePayload,
        bookingId: payload.booking_id || null,
        revisionId: payload.revision_id || null,
        meta: null,
      };
    }

    case 'booking_unmapped_room':
    case 'booking_unmapped_rate': {
      // Booking unmapped room/rate events
      return {
        ...basePayload,
        bookingId: payload.booking_id || null,
        bookingRevisionId: payload.booking_revision_id || null,
        meta: null,
      };
    }

    case 'sync_error': {
      // Sync error event
      return {
        ...basePayload,
        channel: payload.channel || null,
        channelEventId: payload.channel_event_id || null,
        channelId: payload.channel_id || null,
        channelName: payload.channel_name || null,
        errorType: payload.error_type || null,
        propertyName: payload.property_name || null,
        meta: null,
      };
    }

    case 'reservation_request': {
      // Reservation request event
      return {
        ...basePayload,
        bms: payload.bms || null, // JSON object
        resolved: payload.resolved ?? null,
        meta: null,
      };
    }

    case 'review': {
      // Review event
      // Note: scores and ota_scores are NOT included here - they are stored separately in Step 4
      return {
        ...basePayload,
        reviewId: payload.id || null,
        reply: payload.reply || null,
        content: payload.content || null,
        reviewChannelId: payload.channel_id || null,
        // scores and ota_scores are stored separately in event-review-scores and event-review-ota-scores tables
        ota: payload.ota || null,
        reviewPropertyId: payload.property_id || null,
        expiredAt: payload.expired_at || null,
        isHidden: payload.is_hidden ?? null,
        isReplied: payload.is_replied ?? null,
        otaOverallScore: payload.ota_overall_score ?? null,
        otaReservationId: payload.ota_reservation_id || null,
        otaReviewId: payload.ota_review_id || null,
        // ota_scores are stored separately in event-review-ota-scores table
        overallScore: payload.overall_score ?? null,
        rawContent: payload.raw_content || null,
        receivedAt: payload.received_at || null,
        reviewerName: payload.reviewer_name || null,
        bookingId: payload.booking_id || null,
        liveFeedEventId: payload.live_feed_event_id || null,
        otaInsertedAt: payload.ota_inserted_at || null,
        replyScheduledAt: payload.reply_scheduled_at || null,
        replySentAt: payload.reply_sent_at || null,
        meta: null,
      };
    }

    default: {
      // Generic fallback - store entire payload in meta
      return {
        ...basePayload,
        meta: payload,
      };
    }
  }
}

/**
 * Stores a single payload and its attachments
 * Maps fields based on event type according to the guide
 * ⚠️ IMPORTANT: userId is NOT passed here - it belongs only in events table (Step 1)
 */
async function storePayload(
  eventId: string, // Changed from eventMessageId
  payload: ChannexEventPayload,
  eventType: string
): Promise<StoredPayloadResult> {
  // Map payload fields based on event type (NO userId - it's only in events table)
  const createPayload = mapPayloadToEventDetails(eventType, payload, eventId);

  // Create event details
  const eventMessageDetails = await createEventMessageDetails(createPayload);

  // Store attachments (only for message events)
  const attachments =
    eventType === 'message' && payload.attachments
      ? await storeAttachments(
          eventMessageDetails.id, // This is eventDetailsId from the response
          (payload as ChannexMessagePayload).attachments
        )
      : [];

  // Store review scores (only for review events)
  console.log('🔍 Checking for review scores:', {
    eventType,
    isReview: eventType === 'review',
    hasScores: !!payload.scores,
    scoresCount: payload.scores?.length || 0,
    scores: payload.scores,
  });
  
  const reviewScores =
    eventType === 'review' && payload.scores && Array.isArray(payload.scores) && payload.scores.length > 0
      ? await storeReviewScores(
          eventMessageDetails.id,
          payload.scores
        )
      : [];

  // Store review OTA scores (only for review events)
  console.log('🔍 Checking for review OTA scores:', {
    eventType,
    isReview: eventType === 'review',
    hasOtaScores: !!payload.ota_scores,
    otaScoresCount: payload.ota_scores?.length || 0,
    otaScores: payload.ota_scores,
  });
  
  const reviewOtaScores =
    eventType === 'review' && payload.ota_scores && Array.isArray(payload.ota_scores) && payload.ota_scores.length > 0
      ? await storeReviewOtaScores(
          eventMessageDetails.id,
          payload.ota_scores
        )
      : [];

  return {
    eventMessageDetails,
    attachments,
    reviewScores,
    reviewOtaScores,
  };
}

/**
 * Transforms stored result back to Channex-like format for easy comparison
 * This makes it easier to verify data was stored correctly and matches input
 * Handles all event types
 */
function transformToChannexFormat(
  eventObject: ChannexEventObject,
  storedResult: StoredEventResult
): ChannexEventObject {
  const originalPayloads = normalizePayloads(eventObject);
  const isMessageEvent = storedResult.eventMessage.eventType === 'message';
  
  // Reconstruct payloads from stored details
  const payloads = storedResult.eventMessageDetails.map((storedPayload, index) => {
    const details = storedPayload.eventMessageDetails;
    const originalPayload = originalPayloads[index];

    if (isMessageEvent) {
      // Message event: reconstruct from extracted fields
      const attachments = storedPayload.attachments.map((att) => ({
        filename: att.filename || undefined,
        type: att.type || undefined,
        size: att.size || undefined,
      }));

      return {
        id: originalPayload?.id || details.id,
        message: details.message || '',
        meta: details.meta,
        sender: details.sender || '',
        property_id: storedResult.eventMessage.propertyId,
        booking_id: details.bookingId || null,
        message_thread_id: details.messageThreadId || null,
        live_feed_event_id: details.liveFeedEventId || null,
        attachments,
        have_attachment: Boolean(details.haveAttachment),
        ota_message_id: details.otaMessageId || null,
      };
    } else if (storedResult.eventMessage.eventType === 'review') {
      // Review event: reconstruct from extracted fields and scores
      const scores = storedPayload.reviewScores.map((score) => ({
        category: score.category,
        score: score.score,
      }));
      const otaScores = storedPayload.reviewOtaScores.map((score) => ({
        category: score.category,
        score: score.score,
      }));

      return {
        id: details.reviewId || originalPayload?.id || details.id,
        reply: details.reply || null,
        content: details.content || null,
        channel_id: details.reviewChannelId || null,
        scores,
        ota: details.ota || null,
        property_id: details.reviewPropertyId || storedResult.eventMessage.propertyId,
        expired_at: details.expiredAt || null,
        is_hidden: details.isHidden ?? false,
        is_replied: details.isReplied ?? false,
        ota_overall_score: details.otaOverallScore ?? null,
        ota_reservation_id: details.otaReservationId || null,
        ota_review_id: details.otaReviewId || null,
        ota_scores: otaScores,
        overall_score: details.overallScore ?? null,
        raw_content: details.rawContent || null,
        received_at: details.receivedAt || null,
        reviewer_name: details.reviewerName || null,
        booking_id: details.bookingId || null,
        live_feed_event_id: details.liveFeedEventId || null,
        ota_inserted_at: details.otaInsertedAt || null,
        reply_scheduled_at: details.replyScheduledAt || null,
        reply_sent_at: details.replySentAt || null,
      };
    } else {
      // Non-message, non-review event: return entire payload from meta
      return details.meta || originalPayload;
    }
  });

  // Return in Channex format (single payload or multiple payloads)
  if (payloads.length === 1) {
    return {
      event: storedResult.eventMessage.eventType as any,
      payload: payloads[0],
      property_id: storedResult.eventMessage.propertyId,
      user_id: storedResult.eventMessageDetails[0]?.eventMessageDetails.userId || null,
      timestamp: storedResult.eventMessage.createdAt,
    };
  } else {
    return {
      event: storedResult.eventMessage.eventType as any,
      payloads,
      property_id: storedResult.eventMessage.propertyId,
      user_id: storedResult.eventMessageDetails[0]?.eventMessageDetails.userId || null,
      timestamp: storedResult.eventMessage.createdAt,
    };
  }
}

/**
 * Main function to store a Channex event
 * 
 * Separates the incoming Channex event object into 3 database tables:
 * 1. events (root level: event, property_id) - Note: userId goes to event_details
 * 2. event_details (payload object - fields vary by event type)
 * 3. attachments (payload.attachments array - only for message events)
 * 
 * @param eventObject - The Channex event object received from webhook
 * @returns Complete result with all created records AND Channex-like format
 * 
 * @throws Error if validation fails or storage fails
 */
export async function storeChannexEventMessage(
  eventObject: ChannexEventObject
): Promise<StoredEventResult & { channexFormat: ChannexEventObject }> {
  // Validate input
  validateEventObject(eventObject);

  let eventId: string | null = null;
  const storedPayloads: StoredPayloadResult[] = [];

  try {
    // ============================================
    // STEP 1: Create Event (ONCE per event)
    // ============================================
    console.log('📥 Storing Channex event:', {
      event: eventObject.event,
      propertyId: eventObject.property_id,
      hasPayload: !!eventObject.payload,
      hasPayloads: !!eventObject.payloads,
    });

    const eventMessage = await createEventMessage({
      propertyId: eventObject.property_id,
      eventType: eventObject.event,
      userId: eventObject.user_id, // ✅ userId goes HERE in events table (Step 1)
    });

    eventId = eventMessage.id;
    console.log('✅ Event created:', eventId);

    // ============================================
    // STEP 2: Process Payload(s)
    // ============================================
    const payloads = normalizePayloads(eventObject);
    console.log(`📦 Processing ${payloads.length} payload(s)...`);

    // Process payloads sequentially to maintain order
    // (Parallel processing could be added if order doesn't matter)
    for (let i = 0; i < payloads.length; i++) {
      const payload = payloads[i];
      console.log(`📦 Processing payload ${i + 1}/${payloads.length}...`, {
        eventType: eventObject.event,
        hasScores: !!payload.scores,
        scoresCount: payload.scores?.length || 0,
        hasOtaScores: !!payload.ota_scores,
        otaScoresCount: payload.ota_scores?.length || 0,
        payloadKeys: Object.keys(payload),
      });

      try {
        const storedPayload = await storePayload(
          eventId,
          payload,
          eventObject.event
        );

        storedPayloads.push(storedPayload);
        console.log(`✅ Payload ${i + 1} stored:`, {
          detailsId: storedPayload.eventMessageDetails.id,
          attachmentsCount: storedPayload.attachments.length,
        });
      } catch (error) {
        console.error(`❌ Error storing payload ${i + 1}:`, error);
        // Continue with next payload even if one fails
        // This allows partial success
        throw error; // Re-throw to trigger cleanup
      }
    }

    // ============================================
    // Return complete result
    // ============================================
    console.log('✅ Channex event stored successfully:', {
      eventId,
      payloadsCount: storedPayloads.length,
      totalAttachments: storedPayloads.reduce(
        (sum, p) => sum + p.attachments.length,
        0
      ),
    });

    const storedResult: StoredEventResult = {
      success: true,
      eventMessage,
      eventMessageDetails: storedPayloads,
    };

    // Transform to Channex format for easy comparison
    const channexFormat = transformToChannexFormat(eventObject, storedResult);
    console.log('📋 Stored data in Channex format:', channexFormat);

    return {
      ...storedResult,
      channexFormat,
    };
  } catch (error) {
    console.error('❌ Error storing Channex event message:', error);

    // Note: We don't cleanup here because:
    // 1. Event message creation is atomic
    // 2. Partial data might be useful for debugging
    // 3. Backend should handle cascading deletes if needed
    // If cleanup is needed, it should be done at the backend level

    throw error;
  }
}

