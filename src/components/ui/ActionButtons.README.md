# ActionButtons - Global Reusable Action Buttons

## 🎯 Overview

The `ActionButtons` module provides consistent, reusable action buttons for tables and lists throughout the entire application. No more duplicating edit/delete button code!

## 📦 Components Included

1. **`EditButton`** - ✏️ Blue edit/update button
2. **`DeleteButton`** - 🗑️ Red delete button
3. **`ViewButton`** - 👁️ Gray view/details button
4. **`ActionButtons`** - Combined component with all buttons

## ✨ Features

- ✅ **DRY Principle** - Write once, use everywhere
- ✅ **Consistent Design** - Same look across all tables
- ✅ **Hover Effects** - Blue for edit, red for delete, gray for view
- ✅ **Icons** - Professional Heroicons
- ✅ **Translations** - Full i18n support
- ✅ **Flexible** - Show/hide individual buttons
- ✅ **Accessible** - Tooltips and proper button semantics

## 🚀 Usage

### Basic Example (Combined)

The easiest way - use `ActionButtons` with both edit and delete:

```tsx
import { ActionButtons } from "../../components/ui/ActionButtons";

function MyTable() {
  return (
    <table>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td>{item.name}</td>
            <td>
              <ActionButtons
                editPath={`/items/edit/${item.id}`}
                onDelete={() => handleDelete(item)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Individual Buttons

Use buttons separately when you need custom layout:

```tsx
import { EditButton, DeleteButton, ViewButton } from "../../components/ui/ActionButtons";

function CustomActions({ item }) {
  return (
    <div className="flex gap-2">
      <ViewButton to={`/items/${item.id}`} />
      <EditButton to={`/items/edit/${item.id}`} />
      <DeleteButton onClick={() => handleDelete(item)} />
    </div>
  );
}
```

### Advanced Example (Conditional Buttons)

Show/hide buttons based on permissions:

```tsx
import { ActionButtons } from "../../components/ui/ActionButtons";

function PermissionBasedActions({ item, canEdit, canDelete, canView }) {
  return (
    <ActionButtons
      viewPath={canView ? `/items/${item.id}` : undefined}
      editPath={canEdit ? `/items/edit/${item.id}` : undefined}
      onDelete={canDelete ? () => handleDelete(item) : undefined}
      showView={canView}
      showEdit={canEdit}
      showDelete={canDelete}
    />
  );
}
```

### With Loading State

Disable delete button during operation:

```tsx
import { ActionButtons } from "../../components/ui/ActionButtons";

function MyTable() {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (item) => {
    setDeletingId(item.id);
    try {
      await deleteItem(item.id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <ActionButtons
      editPath={`/items/edit/${item.id}`}
      onDelete={() => handleDelete(item)}
      deleteDisabled={deletingId === item.id}
    />
  );
}
```

## 📋 Component APIs

### `ActionButtons` Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `editPath` | `string \| undefined` | - | Path for edit navigation |
| `viewPath` | `string \| undefined` | - | Path for view navigation |
| `onDelete` | `() => void \| undefined` | - | Delete click handler |
| `deleteDisabled` | `boolean` | `false` | Disable delete button |
| `showEdit` | `boolean` | `true` | Show/hide edit button |
| `showView` | `boolean` | `false` | Show/hide view button |
| `showDelete` | `boolean` | `true` | Show/hide delete button |

### `EditButton` Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `to` | `string` | **Required** | Navigation path |
| `title` | `string` | `t("common.edit")` | Tooltip text |

### `DeleteButton` Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onClick` | `() => void` | **Required** | Click handler |
| `title` | `string` | `t("common.delete")` | Tooltip text |
| `disabled` | `boolean` | `false` | Disable button |

### `ViewButton` Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `to` | `string` | **Required** | Navigation path |
| `title` | `string` | `t("common.view")` | Tooltip text |

## 🎨 Visual Design

### Button States

**Edit Button (Blue):**
- Default: Gray icon
- Hover: Blue background + blue icon
- Active: Darker blue

**Delete Button (Red):**
- Default: Gray icon
- Hover: Red background + red icon
- Disabled: 50% opacity, no pointer

**View Button (Gray):**
- Default: Gray icon
- Hover: Light gray background + darker gray icon

### Layout

Buttons are displayed in a flex row with 8px gap:

```
[ 👁️ View ]  [ ✏️ Edit ]  [ 🗑️ Delete ]
```

## 🌍 Translations

Required translation keys (already added):

```json
{
  "common": {
    "edit": "Modifier",
    "delete": "Supprimer",
    "view": "Voir"
  }
}
```

## 📝 Complete Real-World Example

```tsx
// src/features/products/components/ProductTable.tsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActionButtons } from "../../../components/ui/ActionButtons";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { useConfirmModal } from "../../../hooks/useConfirmModal";
import { useDeleteProduct } from "../hooks/useDeleteProduct";

function ProductTable({ products }) {
  const { t } = useTranslation();
  const deleteModal = useConfirmModal();
  const deleteMutation = useDeleteProduct();
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    deleteModal.openModal();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;
    
    await deleteModal.handleConfirm(async () => {
      await deleteMutation.mutateAsync(selectedProduct.id);
      setSelectedProduct(null);
    });
  };

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>${product.price}</td>
              <td>
                <ActionButtons
                  editPath={`/products/edit/${product.id}`}
                  onDelete={() => handleDeleteClick(product)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteModal.isLoading}
        title={t("modal.delete.title")}
        message={t("modal.delete.messageProduct", { name: selectedProduct?.name })}
        variant="danger"
      />
    </>
  );
}
```

## 🔄 Migration Guide

### Before (Duplicated Code)

```tsx
// ❌ Old way - repeated in every table
<td>
  <div className="flex gap-2">
    <Link to={`/items/edit/${item.id}`}>
      <button className="...">
        <svg>...</svg>
      </button>
    </Link>
    <button onClick={() => handleDelete(item)} className="...">
      <svg>...</svg>
    </button>
  </div>
</td>
```

### After (Reusable Component)

```tsx
// ✅ New way - one line
<td>
  <ActionButtons
    editPath={`/items/edit/${item.id}`}
    onDelete={() => handleDelete(item)}
  />
</td>
```

## 🎯 Use Cases

### 1. Standard CRUD Table
```tsx
<ActionButtons
  editPath={`/items/edit/${item.id}`}
  onDelete={() => handleDelete(item)}
/>
```

### 2. Read-Only with View
```tsx
<ActionButtons
  viewPath={`/items/${item.id}`}
  showEdit={false}
  showDelete={false}
/>
```

### 3. Edit Only (No Delete)
```tsx
<ActionButtons
  editPath={`/items/edit/${item.id}`}
  showDelete={false}
/>
```

### 4. All Three Buttons
```tsx
<ActionButtons
  viewPath={`/items/${item.id}`}
  editPath={`/items/edit/${item.id}`}
  onDelete={() => handleDelete(item)}
  showView={true}
/>
```

### 5. Custom Layout
```tsx
<div className="flex justify-end gap-2">
  <EditButton to={`/items/edit/${item.id}`} title="Modifier cet élément" />
  <DeleteButton onClick={() => handleDelete(item)} />
</div>
```

## 🏗️ File Structure

```
src/
├── components/
│   └── ui/
│       ├── ActionButtons.tsx          # Components
│       └── ActionButtons.README.md    # This file
└── features/
    └── facilities/
        └── components/
            └── FacilityTable.tsx      # Example usage
```

## 💡 Best Practices

1. **Always use ActionButtons for tables** - Maintains consistency
2. **Use individual buttons for custom layouts** - More flexibility
3. **Combine with ConfirmModal** - Better UX for deletions
4. **Use translations** - Don't hardcode tooltips
5. **Handle loading states** - Disable during async operations

## 🚨 Common Mistakes

❌ **Don't duplicate the SVG code**
```tsx
// Bad
<button>
  <svg>...</svg>
</button>
```

✅ **Use the components**
```tsx
// Good
<EditButton to={path} />
```

❌ **Don't forget to handle delete properly**
```tsx
// Bad - deletes immediately
<ActionButtons onDelete={() => deleteItem(id)} />
```

✅ **Show confirmation modal first**
```tsx
// Good
<ActionButtons onDelete={() => openDeleteModal(item)} />
```

## 📊 Benefits

- **Code Reduction:** 15+ lines → 1-3 lines
- **Consistency:** Same design everywhere
- **Maintainability:** Update once, apply everywhere
- **Accessibility:** Built-in tooltips and semantics
- **Internationalization:** Automatic translations

## 🔮 Future Enhancements

Potential additions:
- Duplicate button
- Archive button
- Restore button (for soft deletes)
- Download button
- Share button
- Custom icon support
- Button size variants (sm, md, lg)
- Icon-only mode (no tooltip)

## 📚 Related Components

- `ConfirmModal` - For delete confirmations
- `useConfirmModal` - Hook for modal state
- `Button` - For primary actions

