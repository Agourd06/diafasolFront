# Quick Start - Testing Event Storage

## 🚀 Fastest Way to Test

1. **Start your app:**
   ```bash
   npm run dev
   ```

2. **Login to the application**

3. **Navigate to test page:**
   ```
   http://localhost:3001/test-event-storage
   ```

4. **Click a test button:**
   - "Test Single Payload" - Creates 1 event with 1 payload
   - "Test Multiple Payloads" - Creates 1 event with 3 payloads  
   - "Test With Attachments" - Creates 1 event with 2 attachments

5. **Check the result:**
   - Success message shows created IDs
   - Check browser console for logs
   - Verify in database

## 📊 Expected Results

### Single Payload Test:
- ✅ 1 record in `event_messages`
- ✅ 1 record in `event_message_details`
- ✅ 0 records in `attachments`

### Multiple Payloads Test:
- ✅ 1 record in `event_messages`
- ✅ 3 records in `event_message_details`
- ✅ 0 records in `attachments`

### With Attachments Test:
- ✅ 1 record in `event_messages`
- ✅ 1 record in `event_message_details`
- ✅ 2 records in `attachments`

## 🔍 Verify in Database

```sql
-- Check event_messages
SELECT * FROM event_messages ORDER BY created_at DESC LIMIT 1;

-- Check event_message_details
SELECT * FROM event_message_details 
WHERE event_message_id = '<id_from_above>' 
ORDER BY created_at;

-- Check attachments
SELECT * FROM attachments 
WHERE event_message_details_id IN (
  SELECT id FROM event_message_details 
  WHERE event_message_id = '<id_from_above>'
);
```

## 📝 Console Logs to Watch

- `📥 Storing Channex event:` - Input received
- `✅ Event message created:` - Step 1 done
- `📦 Processing payload X/Y...` - Processing
- `✅ Payload X stored:` - Payload done
- `✅ Channex event stored successfully:` - All done!

## 🐛 Common Issues

**401 Unauthorized?** → Login again

**400 Bad Request?** → Check console for validation errors

**No records created?** → Check backend is running and database connection

---

For detailed testing guide, see [TESTING_GUIDE.md](./TESTING_GUIDE.md)

