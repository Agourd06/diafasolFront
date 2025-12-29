# RichTextEditor - WYSIWYG Editor for Rich Content

## 🎯 Overview

The `RichTextEditor` is a rich text editing component built with SunEditor. It provides a professional WYSIWYG (What You See Is What You Get) editor for creating formatted content like facility descriptions, property details, and other rich text fields.

## ✨ Features

- 📝 **Rich Formatting** - Bold, italic, underline, strikethrough
- 🎨 **Colors** - Text and highlight colors
- 📏 **Typography** - Font sizes, headings, paragraphs
- 📋 **Lists** - Bullet and numbered lists
- 🔗 **Links** - Insert hyperlinks
- ↩️ **Undo/Redo** - Full edit history
- 📱 **Responsive** - Works on all screen sizes
- ⚡ **Lazy Loading** - Loads editor only when needed
- 🎨 **Custom Styled** - Matches app theme (brand colors)
- 🌐 **SSR Safe** - Works with server-side rendering

## 📦 Installation

Already installed! The editor uses:
- `suneditor` - Core editor library
- `suneditor-react` - React wrapper

## 🚀 Usage

### Basic Example

```tsx
import RichTextEditor from "../../components/ui/RichTextEditor";
import { useState } from "react";

function MyForm() {
  const [content, setContent] = useState("");

  return (
    <RichTextEditor
      value={content}
      onChange={setContent}
      placeholder="Start typing..."
    />
  );
}
```

### With Form Validation

```tsx
import RichTextEditor from "../../components/ui/RichTextEditor";
import Label from "../../components/ui/Label";
import { useState } from "react";

function DescriptionField() {
  const [description, setDescription] = useState("");
  
  // Strip HTML to check actual text length
  const textLength = description.replace(/<[^>]*>/g, "").trim().length;
  const isValid = textLength <= 1000;

  return (
    <div className="space-y-2">
      <Label htmlFor="description">Description</Label>
      <RichTextEditor
        value={description}
        onChange={setDescription}
        placeholder="Décrivez l'équipement..."
        rows={6}
      />
      <p className="text-xs text-slate-500">
        {textLength}/1000 caractères
      </p>
      {!isValid && (
        <p className="text-xs text-red-600">
          Description trop longue
        </p>
      )}
    </div>
  );
}
```

### Display HTML Content (in table)

```tsx
// Safely render HTML in table cells
<td className="px-4 py-3">
  {item.description ? (
    <div
      className="line-clamp-2 text-sm"
      dangerouslySetInnerHTML={{ __html: item.description }}
    />
  ) : (
    <span className="text-slate-400">—</span>
  )}
</td>
```

## 📋 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | **Required** | HTML content of the editor |
| `onChange` | `(html: string) => void` | **Required** | Called when content changes |
| `placeholder` | `string` | `"Commencez à écrire..."` | Placeholder text |
| `rows` | `number` | `6` | Initial height in rows |

## 🎨 Toolbar Features

The editor includes the following tools:

### Text Formatting
- **Bold** (Ctrl+B)
- **Italic** (Ctrl+I)
- **Underline** (Ctrl+U)
- **Strikethrough**

### Colors
- **Text Color** - 48 colors
- **Highlight Color** - Background highlighting

### Typography
- **Font Size** - 8px to 48px
- **Format Block** - Headings (H1-H6), paragraphs

### Alignment & Lists
- **Text Align** - Left, center, right, justify
- **Lists** - Bullet points, numbered lists
- **Links** - Insert/edit hyperlinks

### Utilities
- **Undo** (Ctrl+Z)
- **Redo** (Ctrl+Y)
- **Remove Formatting** - Clear all styles

## 💾 Data Storage

### Saving to Database

The editor outputs HTML, which is stored as a string:

```tsx
// In your form submit
const handleSubmit = () => {
  const payload = {
    name: name.trim(),
    description: description.trim(), // HTML string
  };
  
  await createItem(payload);
};
```

### Backend Requirements

Your backend should:
1. Accept HTML strings (stored as TEXT or LONGTEXT in MySQL)
2. Sanitize HTML if needed (though SunEditor is safe by default)
3. Return HTML as-is

```typescript
// Example backend DTO
class CreateFacilityDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string; // HTML content
}
```

## 📏 Length Validation

Since the content is HTML, you need to strip tags for accurate length checking:

```tsx
// Get actual text length (no HTML tags)
const textLength = description.replace(/<[^>]*>/g, "").trim().length;

// Validate
const isValid = textLength <= 1000;
```

## 🎨 Styling

The editor is styled to match your app theme:

- **Border:** Rounded, slate-200
- **Toolbar:** Light slate background
- **Buttons:** Slate text, hover effects
- **Focus:** Brand color accents

Styles are in `src/styles/index.css`:

```css
.sun-editor {
  border-radius: 0.5rem;
  border: 1px solid rgb(226 232 240);
}

.sun-editor .se-toolbar {
  background-color: rgb(248 250 252);
}
```

## 🎯 Best Practices

### 1. Always Validate Length
```tsx
// ❌ Bad - counts HTML tags
const isValid = description.length <= 255;

// ✅ Good - counts actual text
const textLength = description.replace(/<[^>]*>/g, "").trim().length;
const isValid = textLength <= 1000;
```

### 2. Sanitize User Input (if needed)
```tsx
// Optional: Use DOMPurify for extra security
import DOMPurify from "dompurify";

const cleanHTML = DOMPurify.sanitize(description);
```

### 3. Display with `dangerouslySetInnerHTML`
```tsx
// ✅ Safe when HTML comes from SunEditor
<div dangerouslySetInnerHTML={{ __html: description }} />
```

### 4. Use `line-clamp` for Tables
```tsx
// Shows 2 lines max with ellipsis
<div
  className="line-clamp-2"
  dangerouslySetInnerHTML={{ __html: description }}
/>
```

## ⚡ Performance

### Lazy Loading

The editor is lazy-loaded to improve initial page load:

```tsx
const SunEditor = React.lazy(() => import("suneditor-react"));

// Shows loading state until editor loads
<Suspense fallback={<LoadingSpinner />}>
  <SunEditor ... />
</Suspense>
```

### Client-Only Rendering

The editor only renders on the client side (not during SSR):

```tsx
const [isClient, setIsClient] = useState(false);

useEffect(() => {
  setIsClient(true); // Render after mount
}, []);
```

## 🔧 Customization

### Change Toolbar Buttons

Edit `editorOptions` in `RichTextEditor.tsx`:

```tsx
buttonList: [
  ['undo', 'redo'],
  ['bold', 'italic', 'underline'],
  ['fontSize', 'formatBlock'],
  ['align', 'list'],
  ['link', 'image'], // Add image support
  ['removeFormat'],
]
```

### Change Height

Pass the `rows` prop:

```tsx
<RichTextEditor rows={10} ... /> // Taller editor
```

### Change Font Sizes

Edit `fontSize` in `editorOptions`:

```tsx
fontSize: [8, 10, 12, 14, 16, 18, 20, 24]
```

## 📱 Responsive Behavior

The editor is fully responsive:

- **Desktop:** Full toolbar, resizable height
- **Tablet:** Compact toolbar
- **Mobile:** Touch-friendly, scrollable toolbar

## 🌐 Internationalization

The placeholder can be translated:

```tsx
import { useTranslation } from "react-i18next";

const { t } = useTranslation();

<RichTextEditor
  placeholder={t("editor.placeholder")}
  ...
/>
```

## 🐛 Troubleshooting

### Editor Not Loading

**Problem:** Editor shows loading spinner forever

**Solution:** Check browser console for errors. Ensure packages are installed:
```bash
npm install suneditor suneditor-react
```

### Content Not Saving

**Problem:** HTML content is lost after save

**Solution:** Make sure your backend accepts strings (not parsing as JSON):

```typescript
// ✅ Good - stores HTML as string
description: string;

// ❌ Bad - tries to parse HTML
description: JSON;
```

### Length Validation Fails

**Problem:** "Description too long" even though it's short

**Solution:** Strip HTML tags before checking length:

```tsx
const textLength = description.replace(/<[^>]*>/g, "").trim().length;
```

### Styles Look Wrong

**Problem:** Editor doesn't match app theme

**Solution:** Ensure `index.css` has the custom styles and is imported in `main.tsx`.

## 📚 Complete Example (Facilities)

See these files for complete implementation:
- `src/features/facilities/components/FacilityForm.tsx` - Create form
- `src/features/facilities/pages/EditFacility.tsx` - Edit form
- `src/features/facilities/components/FacilityTable.tsx` - Display HTML

## 🔗 Resources

- [SunEditor Documentation](https://github.com/JiHong88/SunEditor)
- [suneditor-react GitHub](https://github.com/mkhstar/suneditor-react)
- [SunEditor Demo](https://suneditor.com/sample/index.html)

## 🚀 Next Steps

You can now use this editor for:
- ✅ **Facility descriptions** (already implemented)
- 📋 **Property descriptions**
- 🛏️ **Room type details**
- 📝 **Booking notes**
- 📧 **Email templates**
- 📄 **CMS content**

Just import and use! 🎉

