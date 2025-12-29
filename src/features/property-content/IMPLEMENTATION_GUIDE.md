# Property Content Implementation Guide

## Status: ✅ Types, API Client, and Hooks Complete

### Completed Files:
- ✅ `types.ts` - All TypeScript interfaces
- ✅ `/api/property-content.api.ts` - API client with all 6 endpoints
- ✅ `hooks/usePropertyContents.ts` - Fetch paginated list
- ✅ `hooks/usePropertyContentByPropertyId.ts` - Fetch single record
- ✅ `hooks/usePropertyContentSearch.ts` - Search functionality
- ✅ `hooks/useCreatePropertyContent.ts` - Create mutation
- ✅ `hooks/useUpdatePropertyContent.ts` - Update mutation
- ✅ `hooks/useDeletePropertyContent.ts` - Delete mutation

### Still Needed:

#### Components (`components/`)
1. **PropertyContentForm.tsx** - Form for create/edit with:
   - Property selector (dropdown of properties)
   - RichTextEditor for `description`
   - RichTextEditor for `importantInformation`
   - Validation
   - Error handling

2. **PropertyContentTable.tsx** - Table with:
   - Property name column
   - Description preview (truncated)
   - Important info preview (truncated)
   - Actions (edit, delete, view details)
   - Loading/error states

3. **PropertyContentDetailsModal.tsx** - Modal showing:
   - Full description (formatted HTML)
   - Full important information (formatted HTML)
   - Property details
   - Metadata

#### Pages (`pages/`)
1. **PropertyContentList.tsx** - Main list page with:
   - Header with "Add Content" button
   - Search bar
   - PropertyContentTable
   - Pagination

2. **CreatePropertyContent.tsx** - Create page with:
   - Header with back button
   - PropertyContentForm

3. **EditPropertyContent.tsx** - Edit page with:
   - Header with back button
   - PropertyContentForm (pre-filled)
   - Loading state while fetching

#### Other Files
1. **index.ts** - Export all public APIs
2. **Translations** - Add to `fr.json` and `en.json`:
   ```json
   "propertyContent": {
     "title": "Property Content",
     "subtitle": "Manage descriptions and important information",
     "addContent": "Add Content",
     "form": {
       "property": "Property",
       "selectProperty": "Select a property",
       "description": "Description",
       "descriptionPlaceholder": "Enter property description...",
       "importantInfo": "Important Information",
       "importantInfoPlaceholder": "Enter important information..."
     },
     "table": {
       "property": "Property",
       "description": "Description",
       "importantInfo": "Important Info",
       "actions": "Actions",
       "empty": "No content records yet",
       "loading": "Loading content...",
       "error": "Unable to load content"
     },
     "create": {
       "title": "Add Property Content",
       "subtitle": "Add descriptions and important information"
     },
     "edit": {
       "title": "Edit Property Content",
       "subtitle": "Update property content",
       "notFound": "Content not found"
     }
   }
   ```

3. **Routes** - Add to `AppRoutes.tsx`:
   ```tsx
   <Route path="/properties/content" element={<PropertyContentList />} />
   <Route path="/properties/content/create" element={<CreatePropertyContent />} />
   <Route path="/properties/content/edit/:propertyId" element={<EditPropertyContent />} />
   ```

### Key Implementation Notes:

1. **Property Selector**: Use `useProperties()` hook to fetch available properties for the dropdown

2. **RichTextEditor**: Use the existing `RichTextEditor` component (same as Facilities)

3. **Primary Key**: `propertyId` (UUID) - not a numeric `id`

4. **Validation**:
   - `propertyId` is required
   - At least one of `description` or `importantInformation` should be filled
   - Both are optional text fields

5. **Table Display**:
   - Show property title (from relation)
   - Truncate long text with "..." and "View Details" button
   - Use the same ActionButtons component

6. **Search**: Searches in both `description` and `importantInformation` fields

### Next Steps:
1. Create the components following the Facilities pattern
2. Create the pages following the Facilities pattern
3. Add translations
4. Add routes
5. Test the complete CRUD flow

Then move on to the next feature: **Property Photos**

