/**
 * Channex Event Storage - Usage Examples
 * 
 * This file demonstrates how to use the event storage system.
 * It's for reference only and won't be imported in production.
 */

import { storeChannexEventMessage } from './channexEventStorage';
import {
  createFakeChannexEventObject,
  createFakeChannexEventObjectWithMultiplePayloads,
  createFakeChannexEventObjectWithAttachments,
} from '@/utils/fakeChannexEventData';

/**
 * Example 1: Store a single payload event
 */
export async function exampleStoreSinglePayload() {
  // Create fake data (in production, this comes from Channex webhook)
  const eventObject = createFakeChannexEventObject('680585d7-af7f-4880-8e91-25fca1508b55');

  try {
    const result = await storeChannexEventMessage(eventObject);
    console.log('✅ Event stored:', {
      eventMessageId: result.eventMessage.id,
      detailsCount: result.eventMessageDetails.length,
      attachmentsCount: result.eventMessageDetails.reduce(
        (sum, p) => sum + p.attachments.length,
        0
      ),
    });
    return result;
  } catch (error) {
    console.error('❌ Error storing event:', error);
    throw error;
  }
}

/**
 * Example 2: Store an event with multiple payloads
 */
export async function exampleStoreMultiplePayloads() {
  const eventObject = createFakeChannexEventObjectWithMultiplePayloads(
    '680585d7-af7f-4880-8e91-25fca1508b55',
    3 // 3 payloads
  );

  try {
    const result = await storeChannexEventMessage(eventObject);
    console.log('✅ Event with multiple payloads stored:', {
      eventMessageId: result.eventMessage.id,
      payloadsCount: result.eventMessageDetails.length,
    });
    return result;
  } catch (error) {
    console.error('❌ Error storing event:', error);
    throw error;
  }
}

/**
 * Example 3: Store an event with attachments
 */
export async function exampleStoreWithAttachments() {
  const eventObject = createFakeChannexEventObjectWithAttachments(
    '680585d7-af7f-4880-8e91-25fca1508b55',
    2 // 2 attachments
  );

  try {
    const result = await storeChannexEventMessage(eventObject);
    console.log('✅ Event with attachments stored:', {
      eventMessageId: result.eventMessage.id,
      attachmentsCount: result.eventMessageDetails[0]?.attachments.length || 0,
    });
    return result;
  } catch (error) {
    console.error('❌ Error storing event:', error);
    throw error;
  }
}

/**
 * Example 4: Store a real Channex event object (from webhook)
 * 
 * This is what you'll use when Channex integration is ready.
 * The webhook endpoint will receive this object and call storeChannexEventMessage.
 */
export async function exampleStoreRealChannexEvent() {
  // This is the actual structure Channex will send
  const realEventObject = {
    event: 'message',
    payload: {
      id: 'e10b1d2d-ac82-46f3-810f-a18514eca3e1',
      message: 'Thanks a lot.',
      meta: null,
      sender: 'guest',
      property_id: '680585d7-af7f-4880-8e91-25fca1508b55',
      booking_id: 'c680428a-573a-4969-bcd8-c92d16cff54a',
      message_thread_id: 'bb737f04-c418-4c35-b821-4cf1a58ce626',
      live_feed_event_id: 'fb3365e5-3460-4a57-6747-828bf871fcf3',
      attachments: [],
      have_attachment: false,
      ota_message_id: '0d8aadb0-a2e8-11f0-be32-995226a481d7',
    },
    property_id: '680585d7-af7f-4880-8e91-25fca1508b55',
    user_id: null,
    timestamp: '2021-12-24T00:00:00.0000Z',
  };

  try {
    const result = await storeChannexEventMessage(realEventObject);
    return result;
  } catch (error) {
    console.error('❌ Error storing real Channex event:', error);
    throw error;
  }
}

/**
 * Example 5: Future webhook endpoint handler
 * 
 * This is what you'll create when Channex integration is ready.
 * Channex will POST to this endpoint.
 */
/*
export async function handleChannexWebhook(req: Request, res: Response) {
  try {
    // Validate the incoming request
    const eventObject: ChannexEventObject = req.body;
    
    // Store the event
    const result = await storeChannexEventMessage(eventObject);
    
    // Return success response to Channex
    res.status(200).json({
      success: true,
      eventMessageId: result.eventMessage.id,
    });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
*/

