# Testing Guide - Event Storage System

This guide explains how to test the Channex event storage system.

## 🎯 Testing Methods

There are **3 ways** to test the event storage system:

1. **UI Test Page** (Recommended for beginners)
2. **Browser Console** (Quick testing)
3. **Programmatic Testing** (For developers)

---

## Method 1: UI Test Page (Easiest)

### Steps:

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Login to the application**

3. **Navigate to the test page:**
   - Go to: `http://localhost:3001/test-event-storage`
   - Or click the route in your browser

4. **Test different scenarios:**
   - **Test Single Payload**: Creates an event with one payload
   - **Test Multiple Payloads**: Creates an event with 3 payloads
   - **Test With Attachments**: Creates an event with 2 attachments

5. **Optional: Enter a Property ID**
   - Leave empty for random UUID
   - Or enter a valid UUID from your database

6. **Check Results:**
   - Success message shows created IDs
   - Check browser console for detailed logs
   - Verify in your database

### What to Verify:

- ✅ Success message appears
- ✅ Event Message ID is shown
- ✅ Number of payloads matches
- ✅ Number of attachments matches
- ✅ Check database tables:
  - `event_messages` table has 1 record
  - `event_message_details` table has N records (1 per payload)
  - `attachments` table has M records (1 per attachment)

---

## Method 2: Browser Console (Quick Testing)

### Steps:

1. **Open your browser console** (F12)

2. **Import the functions:**
   ```javascript
   // In browser console, you can't import directly
   // Instead, use the global window object or test via the UI
   ```

3. **Or test via Network tab:**
   - Open DevTools → Network tab
   - Use the UI test page
   - Watch the API calls:
     - `POST /api/event-messages`
     - `POST /api/event-message-details`
     - `POST /api/attachments`

### Quick Console Test (if you expose functions globally):

```javascript
// This would need to be added to your app for console testing
// For now, use the UI test page instead
```

---

## Method 3: Programmatic Testing (For Developers)

### Create a Test Script

Create a file `test-event-storage.ts`:

```typescript
import { storeChannexEventMessage } from '@/services/channexEventStorage';
import {
  createFakeChannexEventObject,
  createFakeChannexEventObjectWithMultiplePayloads,
  createFakeChannexEventObjectWithAttachments,
} from '@/utils/fakeChannexEventData';

async function testSinglePayload() {
  console.log('🧪 Testing single payload...');
  const eventObject = createFakeChannexEventObject('680585d7-af7f-4880-8e91-25fca1508b55');
  const result = await storeChannexEventMessage(eventObject);
  console.log('✅ Result:', result);
  return result;
}

async function testMultiplePayloads() {
  console.log('🧪 Testing multiple payloads...');
  const eventObject = createFakeChannexEventObjectWithMultiplePayloads(
    '680585d7-af7f-4880-8e91-25fca1508b55',
    3
  );
  const result = await storeChannexEventMessage(eventObject);
  console.log('✅ Result:', result);
  return result;
}

async function testWithAttachments() {
  console.log('🧪 Testing with attachments...');
  const eventObject = createFakeChannexEventObjectWithAttachments(
    '680585d7-af7f-4880-8e91-25fca1508b55',
    2
  );
  const result = await storeChannexEventMessage(eventObject);
  console.log('✅ Result:', result);
  return result;
}

// Run tests
async function runAllTests() {
  try {
    await testSinglePayload();
    await testMultiplePayloads();
    await testWithAttachments();
    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Uncomment to run:
// runAllTests();
```

### Run in Component

Add to any component temporarily:

```typescript
import { useEffect } from 'react';
import { storeChannexEventMessage } from '@/services/channexEventStorage';
import { createFakeChannexEventObject } from '@/utils/fakeChannexEventData';

function MyTestComponent() {
  useEffect(() => {
    const test = async () => {
      try {
        const eventObject = createFakeChannexEventObject();
        const result = await storeChannexEventMessage(eventObject);
        console.log('✅ Test result:', result);
      } catch (error) {
        console.error('❌ Test error:', error);
      }
    };
    test();
  }, []);

  return <div>Check console for test results</div>;
}
```

---

## 📊 What to Check After Testing

### Database Verification

After running a test, verify in your database:

#### 1. `event_messages` Table
```sql
SELECT * FROM event_messages ORDER BY created_at DESC LIMIT 1;
```
- Should have 1 record
- `property_id` matches your test property
- `event_type` = 'message'

#### 2. `event_message_details` Table
```sql
SELECT * FROM event_message_details 
WHERE event_message_id = '<event_message_id>' 
ORDER BY created_at;
```
- Should have N records (1 per payload)
- Each record has `message`, `sender`, etc.
- `event_message_id` matches the event message

#### 3. `attachments` Table
```sql
SELECT * FROM attachments 
WHERE event_message_details_id IN (
  SELECT id FROM event_message_details 
  WHERE event_message_id = '<event_message_id>'
);
```
- Should have M records (1 per attachment)
- Each record has `filename`, `type`, `size`

### Console Logs

Check browser console for:
- `📥 Storing Channex event:` - Input validation
- `✅ Event message created:` - Step 1 success
- `📦 Processing payload X/Y...` - Payload processing
- `✅ Payload X stored:` - Payload success
- `✅ Channex event stored successfully:` - Final success

### Network Tab

Check DevTools → Network tab:
- `POST /api/event-messages` - Status 201
- `POST /api/event-message-details` - Status 201 (one per payload)
- `POST /api/attachments` - Status 201 (one per attachment)

---

## 🧪 Test Scenarios

### Scenario 1: Single Payload, No Attachments
- **Expected**: 1 event_message, 1 event_message_details, 0 attachments
- **Test**: Click "Test Single Payload"

### Scenario 2: Multiple Payloads
- **Expected**: 1 event_message, 3 event_message_details, 0 attachments
- **Test**: Click "Test Multiple Payloads"

### Scenario 3: With Attachments
- **Expected**: 1 event_message, 1 event_message_details, 2 attachments
- **Test**: Click "Test With Attachments"

### Scenario 4: Invalid Property ID
- **Expected**: Error message
- **Test**: Enter invalid UUID in Property ID field

### Scenario 5: Real Channex Event
- **Expected**: Success with real data structure
- **Test**: Use actual Channex webhook payload (when available)

---

## 🐛 Troubleshooting

### Error: "Event object must have an 'event' field"
- **Cause**: Invalid event object structure
- **Solution**: Check that event object has `event` field

### Error: "Event object must have a 'property_id' field"
- **Cause**: Missing property_id
- **Solution**: Ensure property_id is provided

### Error: "Event object must have at least one payload"
- **Cause**: No payload or payloads array
- **Solution**: Ensure either `payload` or `payloads` exists

### Error: 401 Unauthorized
- **Cause**: Not logged in or token expired
- **Solution**: Login again

### Error: 400 Bad Request
- **Cause**: Invalid data format
- **Solution**: Check console logs for validation errors

### No Records in Database
- **Cause**: Backend not running or database connection issue
- **Solution**: 
  1. Check backend is running
  2. Check database connection
  3. Check API base URL in `.env`

---

## 📝 Testing Checklist

- [ ] Test single payload storage
- [ ] Test multiple payloads storage
- [ ] Test with attachments
- [ ] Verify event_messages table
- [ ] Verify event_message_details table
- [ ] Verify attachments table
- [ ] Test with invalid property ID
- [ ] Test error handling
- [ ] Check console logs
- [ ] Check network requests
- [ ] Verify data integrity (foreign keys)

---

## 🚀 Next Steps

After successful testing:

1. **Remove test route** (optional, for production)
2. **Create webhook endpoint** (when Channex integration is ready)
3. **Add webhook signature validation**
4. **Add retry mechanism** (if needed)
5. **Monitor production logs**

---

## 💡 Tips

- **Use the UI test page** for quick visual feedback
- **Check console logs** for detailed debugging
- **Use Network tab** to see actual API calls
- **Verify database** to ensure data integrity
- **Test edge cases** (empty attachments, null values, etc.)

---

## 📚 Related Files

- `src/services/channexEventStorage.ts` - Main storage logic
- `src/utils/fakeChannexEventData.ts` - Fake data generators
- `src/features/event-messages/pages/TestEventStorage.tsx` - UI test page
- `src/api/event-messages.api.ts` - API client
- `src/api/event-message-details.api.ts` - API client
- `src/api/attachments.api.ts` - API client

