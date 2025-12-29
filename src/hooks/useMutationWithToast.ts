/**
 * Hook to wrap mutations with automatic toast notifications
 * 
 * Automatically shows success/error toasts for mutations.
 */

import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/context/ToastContext';

interface UseMutationWithToastOptions<TData, TError, TVariables, TContext> 
  extends Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'onSuccess' | 'onError'> {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (data: TData, variables: TVariables, context: TContext | undefined) => void;
  onError?: (error: TError, variables: TVariables, context: TContext | undefined) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export function useMutationWithToast<TData = unknown, TError = Error, TVariables = void, TContext = unknown>(
  options: UseMutationWithToastOptions<TData, TError, TVariables, TContext>
): UseMutationResult<TData, TError, TVariables, TContext> {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  
  const {
    successMessage,
    errorMessage,
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
    ...mutationOptions
  } = options;

  return useMutation<TData, TError, TVariables, TContext>({
    ...mutationOptions,
    onSuccess: (data, variables, context) => {
      if (showSuccessToast && successMessage) {
        showSuccess(t(successMessage, { defaultValue: successMessage }));
      }
      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      if (showErrorToast) {
        const message = errorMessage || 
          (error as any)?.response?.data?.message || 
          (error as any)?.message || 
          t('common.error', { defaultValue: 'An error occurred' });
        showError(message);
      }
      onError?.(error, variables, context);
    },
  });
}

