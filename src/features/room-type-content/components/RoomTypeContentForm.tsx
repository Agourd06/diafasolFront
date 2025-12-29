/**
 * Room Type Content Form Component
 * 
 * Form for creating/editing room type content with rich text editor.
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '@/utils/validation';
import RoomTypeSearchSelect from '@/components/inputs/RoomTypeSearchSelect';
import { useRoomTypeById } from '@/features/room-types/hooks/useRoomTypeById';
import RichTextEditor from '@/components/ui/RichTextEditor';
import Button from '../../../components/ui/Button';
import Label from '../../../components/ui/Label';
import { useCreateRoomTypeContent, useUpdateRoomTypeContent } from '../hooks';
import type { RoomTypeContent } from '../types';

interface RoomTypeContentFormProps {
  content?: RoomTypeContent;
  initialRoomTypeId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const RoomTypeContentForm: React.FC<RoomTypeContentFormProps> = ({
  content,
  initialRoomTypeId,
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslation();
  const isEditMode = !!content;
  const createMutation = useCreateRoomTypeContent();
  const updateMutation = useUpdateRoomTypeContent();

  const [roomTypeId, setRoomTypeId] = useState(content?.roomTypeId || initialRoomTypeId || '');
  const [description, setDescription] = useState(content?.description || '');

  // Fetch room type information for display
  const currentRoomTypeId = content?.roomTypeId || initialRoomTypeId || '';
  const { data: roomTypeData } = useRoomTypeById(currentRoomTypeId, !!currentRoomTypeId);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (content) {
      setRoomTypeId(content.roomTypeId || '');
      setDescription(content.description || '');
      setValidationErrors({});
    } else if (initialRoomTypeId) {
      setRoomTypeId(initialRoomTypeId);
    }
  }, [content, initialRoomTypeId]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!isEditMode && !roomTypeId) {
      errors.roomTypeId = t('roomTypeContent.validation.roomTypeRequired');
    }

    if (!description || !description.trim()) {
      errors.description = t('roomTypeContent.validation.descriptionRequired');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const cleanDescription = description.trim().replace(/\s+$/gm, '');

    const formData: any = {
      ...(cleanDescription && { description: cleanDescription }),
    };

    if (!isEditMode) {
      formData.roomTypeId = roomTypeId;
    }

    try {
      if (isEditMode && content) {
        await updateMutation.mutateAsync({ roomTypeId: content.roomTypeId, payload: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      // Reset form
      setRoomTypeId(initialRoomTypeId || '');
      setDescription('');
      setValidationErrors({});
      onSuccess?.();
    } catch (error) {
      // Error is handled by mutation
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Room Type Information Banner */}
      {roomTypeData && (
        <div className="bg-brand-50 border border-brand-200 rounded-lg p-3 mb-2">
          <p className="text-sm font-semibold text-brand-900">
            {t('roomTypeContent.form.roomTypeOfContent')}: <span className="font-bold text-brand-700">{roomTypeData.title}</span>
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
          <p className="font-medium">{t('common.error')}</p>
          <p className="text-xs mt-1">{getErrorMessage(error)}</p>
        </div>
      )}

      {/* Room Type Selector (only if not preselected) */}
      {!isEditMode && !initialRoomTypeId && (
        <div className="space-y-1.5">
          <RoomTypeSearchSelect
            label={`${t('roomTypeContent.form.selectRoomType')} *`}
            value={roomTypeId}
            onChange={setRoomTypeId}
            error={validationErrors.roomTypeId}
            disabled={isLoading}
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-sm font-medium">
          {t('roomTypeContent.form.descriptionLabel')} <span className="text-red-500">*</span>
        </Label>
        <RichTextEditor
          value={description}
          onChange={setDescription}
          placeholder={t('roomTypeContent.form.descriptionPlaceholder')}
          rows={6}
        />
        {validationErrors.description && (
          <p className="text-xs text-red-600">{validationErrors.description}</p>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          type="submit"
          disabled={isLoading}
          isLoading={isLoading}
          className="flex-1"
        >
          {isEditMode ? t('common.update') : t('common.create')}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={isLoading}
          >
            {t('common.cancel')}
          </Button>
        )}
      </div>
    </form>
  );
};

export default RoomTypeContentForm;
