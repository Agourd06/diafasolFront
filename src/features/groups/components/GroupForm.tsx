import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Label from '../../../components/ui/Label';
import { useCreateGroup } from '../hooks/useCreateGroup';
import { useUpdateGroup } from '../hooks/useUpdateGroup';
import { getErrorMessage } from '@/utils/validation';
import { useToast } from '@/context/ToastContext';
import type { Group } from '../types';

interface GroupFormProps {
  group?: Group;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const GroupForm: React.FC<GroupFormProps> = ({
  group,
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const isEditMode = !!group;
  const createMutation = useCreateGroup();
  const updateMutation = useUpdateGroup();

  const [title, setTitle] = useState(group?.title || '');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (group) {
      setTitle(group.title || '');
      setValidationErrors({});
    }
  }, [group]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = t('groups.validation.titleRequired');
    } else if (title.trim().length > 255) {
      errors.title = t('groups.validation.titleTooLong');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formData = {
      title: title.trim(),
    };

    try {
      if (isEditMode && group) {
        await updateMutation.mutateAsync({ id: group.id, payload: formData });
        showSuccess(t('groups.updateSuccess', { defaultValue: 'Group updated successfully!' }));
      } else {
        await createMutation.mutateAsync(formData);
        showSuccess(t('groups.createSuccess', { defaultValue: 'Group created successfully!' }));
      }
      setTitle('');
      setValidationErrors({});
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || t('common.error', { defaultValue: 'An error occurred' });
      showError(errorMessage);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
          <p className="font-medium">{t('common.error')}</p>
          <p className="text-xs mt-1">{getErrorMessage(error)}</p>
        </div>
      )}

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title" className="text-sm font-medium">
          {t('groups.form.title')} <span className="text-red-500">*</span>
        </Label>
        <Input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`text-sm ${validationErrors.title ? 'border-red-500' : ''}`}
          placeholder={t('groups.form.titlePlaceholder')}
          disabled={isLoading}
          maxLength={255}
        />
        {validationErrors.title && (
          <p className="text-xs text-red-600">{validationErrors.title}</p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex gap-2 pt-2">
        <Button
          type="submit"
          className="flex-1"
          isLoading={isLoading}
          disabled={!title.trim()}
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

export default GroupForm;
