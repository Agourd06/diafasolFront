# Event Messages Feature

## Overview

This feature handles the storage of Channex webhook event messages. When Channex sends an event object via webhook, this system separates the data into 3 database tables:

1. **`event_messages`** - Root level fields (`event`, `property_id`)
2. **`event_message_details`** - The entire `payload` object
3. **`attachments`** - Items from `payload.attachments` array

## Architecture

### Data Flow

```
Channex Webhook → Event Object → Storage Service → 3 Database Tables
```

### File Structure

```
src/
├── features/event-messages/
│   ├── types.ts                    # TypeScript interfaces
│   ├── index.ts                    # Feature exports
│   └── README.md                   # This file
├── api/
│   ├── event-messages.api.ts       # Event messages API client
│   ├── event-message-details.api.ts # Event message details API client
│   └── attachments.api.ts          # Attachments API client
├── services/
│   ├── channexEventStorage.ts      # Main storage logic
│   └── channexEventStorage.example.ts # Usage examples
└── utils/
    └── fakeChannexEventData.ts     # Fake data generator for testing
```

## Key Concepts

### 1. Data Separation

The incoming Channex event object is separated as follows:

- **Root Level** → `event_messages` table
  - `event` → `eventType`
  - `property_id` → `propertyId`
  
- **Payload Object** → `event_message_details` table
  - Entire `payload` object becomes one `event_message_details` record
  - `user_id` from root level also goes to `event_message_details`
  
- **Attachments Array** → `attachments` table
  - Each item in `payload.attachments` becomes one `attachments` record

### 2. Multiple Payloads Support

One event can have multiple payloads:
- Single payload: `{ payload: {...} }`
- Multiple payloads: `{ payloads: [{...}, {...}] }`

The system handles both structures automatically.

### 3. Performance Optimizations

- **Parallel Attachment Creation**: All attachments for a payload are created in parallel using `Promise.all`
- **Sequential Payload Processing**: Payloads are processed sequentially to maintain order
- **Error Handling**: Partial failures don't block other payloads

## Usage

### Basic Usage

```typescript
import { storeChannexEventMessage } from '@/services/channexEventStorage';
import type { ChannexEventObject } from '@/features/event-messages/types';

// Event object from Channex webhook
const eventObject: ChannexEventObject = {
  event: 'message',
  payload: {
    id: 'e10b1d2d-ac82-46f3-810f-a18514eca3e1',
    message: 'Thanks a lot.',
    sender: 'guest',
    property_id: '680585d7-af7f-4880-8e91-25fca1508b55',
    // ... other fields
  },
  property_id: '680585d7-af7f-4880-8e91-25fca1508b55',
  user_id: null,
  timestamp: '2021-12-24T00:00:00.0000Z',
};

// Store the event
const result = await storeChannexEventMessage(eventObject);
console.log('Stored:', result.eventMessage.id);
```

### Testing with Fake Data

```typescript
import {
  createFakeChannexEventObject,
  createFakeChannexEventObjectWithMultiplePayloads,
  createFakeChannexEventObjectWithAttachments,
} from '@/utils/fakeChannexEventData';
import { storeChannexEventMessage } from '@/services/channexEventStorage';

// Single payload
const fakeEvent = createFakeChannexEventObject();
await storeChannexEventMessage(fakeEvent);

// Multiple payloads
const fakeEventMultiple = createFakeChannexEventObjectWithMultiplePayloads(
  'property-id',
  3 // 3 payloads
);
await storeChannexEventMessage(fakeEventMultiple);

// With attachments
const fakeEventWithAttachments = createFakeChannexEventObjectWithAttachments(
  'property-id',
  2 // 2 attachments
);
await storeChannexEventMessage(fakeEventWithAttachments);
```

### Future Webhook Endpoint

When Channex integration is ready, create a webhook endpoint:

```typescript
// POST /api/push_message
export async function handleChannexWebhook(req: Request, res: Response) {
  try {
    const eventObject: ChannexEventObject = req.body;
    const result = await storeChannexEventMessage(eventObject);
    
    res.status(200).json({
      success: true,
      eventMessageId: result.eventMessage.id,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
```

## API Endpoints

### Event Messages

- **POST** `/api/event-messages` - Create event message
- **GET** `/api/event-messages/:id` - Get event message by ID

### Event Message Details

- **POST** `/api/event-message-details` - Create event message details
- **GET** `/api/event-message-details/:id` - Get event message details by ID

### Attachments

- **POST** `/api/attachments` - Create attachment
- **GET** `/api/attachments/:id` - Get attachment by ID

## Type Definitions

### ChannexEventObject

The input structure from Channex webhook:

```typescript
interface ChannexEventObject {
  event: string;
  payload?: ChannexEventPayload;      // Single payload
  payloads?: ChannexEventPayload[];   // Multiple payloads
  property_id: string;
  user_id: string | null;
  timestamp: string;
}
```

### StoredEventResult

The output structure after storage:

```typescript
interface StoredEventResult {
  success: boolean;
  eventMessage: EventMessage;
  eventMessageDetails: StoredPayloadResult[];
}
```

## Error Handling

The storage function validates input and throws errors for:
- Missing `event` field
- Missing `property_id` field
- Missing payload(s)
- Invalid payload structure

Errors are logged with detailed context for debugging.

## Notes

- **Authentication**: All API calls use JWT token from `axiosClient` interceptors
- **Company ID**: Automatically extracted from JWT token (not sent in payload)
- **Timestamps**: Backend automatically sets `createdAt` and `updatedAt`
- **Original Timestamp**: If needed, store `timestamp` from Channex in `meta` field

## Testing

Use the fake data generators to test the storage system:

```typescript
import { createFakeChannexEventObject } from '@/utils/fakeChannexEventData';
import { storeChannexEventMessage } from '@/services/channexEventStorage';

const fakeEvent = createFakeChannexEventObject();
const result = await storeChannexEventMessage(fakeEvent);
// Verify result.eventMessage, result.eventMessageDetails, etc.
```

## Future Enhancements

- [ ] Webhook signature validation
- [ ] Retry mechanism for failed storage
- [ ] Batch processing for high-volume events
- [ ] Event deduplication
- [ ] Webhook endpoint implementation

