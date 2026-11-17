import React, { useCallback, useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * ConfirmationDialog Component - Modal dialog for confirming actions
 * Requirements: 7.5
 * 
 * Implements:
 * - Confirmation dialog when navigating with unsaved changes
 * - Accessible modal with focus trap
 * - Customizable title, message, and button labels
 */

export interface ConfirmationDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when dialog should close */
  onClose: () => void;
  /** Callback when user confirms the action */
  onConfirm: () => void;
  /** Dialog title */
  title: string;
  /** Dialog message/description */
  message: string;
  /** Label for the confirm button */
  confirmLabel?: string;
  /** Label for the cancel button */
  cancelLabel?: string;
  /** Whether the confirm action is destructive (shows red button) */
  destructive?: boolean;
  /** Icon to show (defaults to warning triangle) */
  icon?: React.ReactNode;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  destructive = false,
  icon,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap and escape key handling
  useEffect(() => {
    if (!isOpen) return;

    // Focus the cancel button when dialog opens
    cancelButtonRef.current?.focus();

    // Handle escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Handle confirm
  const handleConfirm = useCallback(() => {
    onConfirm();
    onClose();
  }, [onConfirm, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in"
      >
        {/* Content */}
        <div className="p-6 text-center">
          {/* Icon */}
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
            {icon || <AlertTriangle className="w-6 h-6 text-amber-500" />}
          </div>

          {/* Title */}
          <h2
            id="confirmation-dialog-title"
            className="text-lg font-semibold text-ink mb-2"
          >
            {title}
          </h2>

          {/* Message */}
          <p
            id="confirmation-dialog-description"
            className="text-muted text-sm"
          >
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex border-t border-line">
          <button
            ref={cancelButtonRef}
            onClick={onClose}
            className="flex-1 py-4 text-ink hover:bg-line transition-colors font-medium border-r border-line"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 py-4 font-medium transition-colors ${
              destructive
                ? 'text-danger hover:bg-danger/10'
                : 'text-accent-bright hover:bg-accent/10'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>

      {/* CSS for scale-in animation */}
      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ConfirmationDialog;
