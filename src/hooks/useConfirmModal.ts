import { useState } from "react";

type UseConfirmModalReturn = {
  isOpen: boolean;
  isLoading: boolean;
  openModal: () => void;
  closeModal: () => void;
  setLoading: (loading: boolean) => void;
  handleConfirm: (callback: () => void | Promise<void>) => Promise<void>;
};

/**
 * Custom hook to manage confirmation modal state
 * 
 * @example
 * const deleteModal = useConfirmModal();
 * 
 * // Open modal
 * <button onClick={deleteModal.openModal}>Delete</button>
 * 
 * // Render modal
 * <ConfirmModal
 *   isOpen={deleteModal.isOpen}
 *   onClose={deleteModal.closeModal}
 *   onConfirm={() => deleteModal.handleConfirm(async () => {
 *     await deleteItem(id);
 *   })}
 *   isLoading={deleteModal.isLoading}
 * />
 */
export const useConfirmModal = (): UseConfirmModalReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    if (!isLoading) {
      setIsOpen(false);
    }
  };

  const setLoading = (loading: boolean) => setIsLoading(loading);

  const handleConfirm = async (callback: () => void | Promise<void>) => {
    setIsLoading(true);
    try {
      await callback();
      setIsOpen(false);
    } catch (error) {
      // Error handling is done in the callback
      console.error("Confirmation action failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isOpen,
    isLoading,
    openModal,
    closeModal,
    setLoading,
    handleConfirm,
  };
};

