# ConfirmModal Component - Global Reusable Delete/Confirmation Modal

## 🎯 Overview

The `ConfirmModal` is a beautiful, animated confirmation dialog component that can be used throughout the entire application for any confirmation action (especially deletions). It provides a consistent UX with proper animations, keyboard support, and loading states.

## ✨ Features

- 🎨 **Beautiful Design** - Professional modal with icon, backdrop blur, and smooth animations
- ⌨️ **Keyboard Support** - ESC key to close (when not loading)
- 🔒 **Body Scroll Lock** - Prevents background scrolling when modal is open
- 📱 **Responsive** - Works perfectly on mobile and desktop
- 🌐 **Internationalized** - Full i18n support with translations
- 🎭 **Multiple Variants** - Danger (red), Warning (yellow), Info (blue)
- ⏳ **Loading States** - Shows spinner and disables actions during async operations
- 🎬 **Smooth Animations** - Fade-in backdrop and slide-up modal

## 🚀 Usage

### Basic Example (with hook)

```tsx
import { useConfirmModal } from "../../hooks/useConfirmModal";
import ConfirmModal from "../../components/ui/ConfirmModal";

function MyComponent() {
  const deleteModal = useConfirmModal();
  const [selectedItem, setSelectedItem] = useState(null);

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    deleteModal.openModal();
  };

  const handleDeleteConfirm = async () => {
    await deleteModal.handleConfirm(async () => {
      await deleteItem(selectedItem.id);
      setSelectedItem(null);
    });
  };

  return (
    <>
      <button onClick={() => handleDeleteClick(item)}>Delete</button>
      
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteModal.isLoading}
        title="Confirm deletion"
        message={`Are you sure you want to delete "${selectedItem?.name}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
}
```

### Advanced Example (with translations)

```tsx
import { useTranslation } from "react-i18next";
import { useConfirmModal } from "../../hooks/useConfirmModal";
import ConfirmModal from "../../components/ui/ConfirmModal";

function MyComponent() {
  const { t } = useTranslation();
  const deleteModal = useConfirmModal();
  const deleteMutation = useDeleteItem();
  const [selectedItem, setSelectedItem] = useState(null);

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    deleteModal.openModal();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;
    
    await deleteModal.handleConfirm(async () => {
      await deleteMutation.mutateAsync(selectedItem.id);
      setSelectedItem(null);
    });
  };

  return (
    <>
      <button onClick={() => handleDeleteClick(item)}>
        {t("common.delete")}
      </button>
      
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteModal.isLoading}
        title={t("modal.delete.title")}
        message={t("modal.delete.message", { name: selectedItem?.name })}
        confirmText={t("modal.delete.confirm")}
        cancelText={t("modal.delete.cancel")}
        variant="danger"
      />
    </>
  );
}
```

## 📋 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | **Required** | Controls modal visibility |
| `onClose` | `() => void` | **Required** | Called when modal should close |
| `onConfirm` | `() => void` | **Required** | Called when user confirms action |
| `title` | `string` | `"Êtes-vous sûr ?"` | Modal title |
| `message` | `string` | `"Cette action ne peut pas être annulée."` | Modal message/description |
| `confirmText` | `string` | `"Confirmer"` | Text for confirm button |
| `cancelText` | `string` | `"Annuler"` | Text for cancel button |
| `isLoading` | `boolean` | `false` | Shows loading state on confirm button |
| `variant` | `"danger" \| "warning" \| "info"` | `"danger"` | Visual style variant |

## 🎨 Variants

### Danger (Red) - Default
Use for destructive actions like deletions.

```tsx
<ConfirmModal variant="danger" {...props} />
```

### Warning (Yellow)
Use for potentially problematic actions.

```tsx
<ConfirmModal variant="warning" {...props} />
```

### Info (Blue)
Use for general confirmations.

```tsx
<ConfirmModal variant="info" {...props} />
```

## 🪝 useConfirmModal Hook

The `useConfirmModal` hook simplifies modal state management.

### API

```typescript
const {
  isOpen,           // boolean - Modal open state
  isLoading,        // boolean - Loading state
  openModal,        // () => void - Open the modal
  closeModal,       // () => void - Close the modal
  setLoading,       // (loading: boolean) => void - Set loading state
  handleConfirm,    // (callback: () => void | Promise<void>) => Promise<void> - Execute confirmation with loading
} = useConfirmModal();
```

### Methods

#### `openModal()`
Opens the modal.

```tsx
<button onClick={deleteModal.openModal}>Delete</button>
```

#### `closeModal()`
Closes the modal (only if not loading).

```tsx
<ConfirmModal onClose={deleteModal.closeModal} {...props} />
```

#### `handleConfirm(callback)`
Executes an async callback with automatic loading state management and modal closing.

```tsx
await deleteModal.handleConfirm(async () => {
  await api.deleteItem(id);
});
```

## 🌐 Translations

Add these keys to your i18n locale files:

### `src/i18n/locales/fr.json`
```json
{
  "modal": {
    "confirm": {
      "title": "Êtes-vous sûr ?",
      "message": "Cette action ne peut pas être annulée.",
      "confirm": "Confirmer",
      "cancel": "Annuler"
    },
    "delete": {
      "title": "Confirmer la suppression",
      "message": "Êtes-vous sûr de vouloir supprimer cet élément ?",
      "confirm": "Supprimer",
      "cancel": "Annuler"
    }
  }
}
```

### `src/i18n/locales/en.json`
```json
{
  "modal": {
    "confirm": {
      "title": "Are you sure?",
      "message": "This action cannot be undone.",
      "confirm": "Confirm",
      "cancel": "Cancel"
    },
    "delete": {
      "title": "Confirm deletion",
      "message": "Are you sure you want to delete this item?",
      "confirm": "Delete",
      "cancel": "Cancel"
    }
  }
}
```

## 🎬 Animations

The modal uses custom CSS animations defined in `src/styles/index.css`:

- **Backdrop:** `modal-fade-in` (0.2s)
- **Modal:** `modal-slide-up` (0.3s)

## ♿ Accessibility

- **ESC key:** Closes modal (when not loading)
- **Backdrop click:** Closes modal (when not loading)
- **Body scroll lock:** Prevents background scrolling
- **Focus management:** Buttons are keyboard accessible
- **Loading state:** Disables actions during async operations

## 🏗️ File Structure

```
src/
├── components/
│   └── ui/
│       ├── ConfirmModal.tsx          # Main component
│       └── ConfirmModal.README.md    # This file
├── hooks/
│   └── useConfirmModal.ts            # Modal state hook
├── styles/
│   └── index.css                     # Animations
└── i18n/
    └── locales/
        ├── fr.json                   # French translations
        └── en.json                   # English translations
```

## 📦 Real-World Example

See `src/features/facilities/components/FacilityTable.tsx` for a complete implementation example.

## 🎯 Best Practices

1. **Always use the hook** - It handles state management correctly
2. **Store selected item** - Keep track of what's being deleted
3. **Use translations** - Don't hardcode text
4. **Handle errors** - Wrap async callbacks in try-catch if needed
5. **Reset state** - Clear selected item after success

## 🚨 Common Mistakes

❌ **Don't forget to close the modal on success**
```tsx
// Bad
const handleConfirm = async () => {
  await deleteItem(id);
  // Modal stays open!
};

// Good
await deleteModal.handleConfirm(async () => {
  await deleteItem(id);
  // Modal auto-closes
});
```

❌ **Don't use window.confirm() anymore**
```tsx
// Bad
if (window.confirm("Delete?")) {
  deleteItem(id);
}

// Good
<ConfirmModal ... />
```

❌ **Don't allow closing during loading**
```tsx
// Bad - Manual close implementation
const handleClose = () => setIsOpen(false);

// Good - Hook handles this
const handleClose = deleteModal.closeModal; // Prevents close if loading
```

## 💡 Tips

- Use `variant="danger"` for all delete operations
- Use `variant="warning"` for actions that change important data
- Use `variant="info"` for general confirmations
- Personalize messages with item names for better UX
- Keep titles short (max 3-4 words)
- Make messages clear about consequences

## 🔮 Future Enhancements

Potential improvements:
- Custom icons
- Multiple buttons (e.g., "Save", "Don't Save", "Cancel")
- Toast notification after success
- Undo functionality
- Confirmation input (type name to confirm)

