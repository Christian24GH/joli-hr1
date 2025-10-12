import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * ConfirmationModal - A reusable confirmation dialog component
 * 
 * @param {boolean} open - Controls whether the modal is open
 * @param {function} onOpenChange - Callback when modal open state changes
 * @param {function} onConfirm - Callback when user confirms the action
 * @param {function} onCancel - Optional callback when user cancels
 * @param {string} title - Modal title (default: "Are you sure?")
 * @param {string} description - Modal description
 * @param {string} confirmText - Text for confirm button (default: "Continue")
 * @param {string} cancelText - Text for cancel button (default: "Cancel")
 * @param {string} variant - Variant for confirm button (default: "default")
 */
export function ConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  title = "Are you sure?",
  description = "This action cannot be undone. Do you want to continue?",
  confirmText = "Continue",
  cancelText = "Cancel",
  variant = "default",
}) {
  const handleConfirm = () => {
    onConfirm?.();
    onOpenChange?.(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange?.(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className={variant === "destructive" ? "bg-red-600 hover:bg-red-700" : ""}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * useConfirmation - A custom hook to easily manage confirmation modal state
 * 
 * @returns {object} - Object containing isOpen, confirm, and cancel functions
 * 
 * @example
 * const confirmation = useConfirmation();
 * 
 * <button onClick={() => confirmation.confirm(() => {
 *   // Your action here
 * })}>
 *   Delete
 * </button>
 * 
 * <ConfirmationModal
 *   open={confirmation.isOpen}
 *   onOpenChange={confirmation.setIsOpen}
 *   onConfirm={confirmation.onConfirm}
 *   title="Delete Item"
 *   description="Are you sure you want to delete this item?"
 *   confirmText="Delete"
 *   variant="destructive"
 * />
 */
export function useConfirmation() {
  const [isOpen, setIsOpen] = React.useState(false);
  const callbackRef = React.useRef(null);

  const confirm = React.useCallback((callback) => {
    callbackRef.current = callback;
    setIsOpen(true);
  }, []);

  const onConfirm = React.useCallback(() => {
    if (callbackRef.current) {
      callbackRef.current();
    }
    setIsOpen(false);
    callbackRef.current = null;
  }, []);

  const cancel = React.useCallback(() => {
    setIsOpen(false);
    callbackRef.current = null;
  }, []);

  return {
    isOpen,
    setIsOpen,
    confirm,
    onConfirm,
    cancel,
  };
}
