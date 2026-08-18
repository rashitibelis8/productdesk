'use client';

import { ReactNode } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Icon } from './Icon';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'primary';
  preview?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isLoading,
  variant = 'danger',
  preview,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} maxWidthClass="max-w-sm">
      <div className="flex flex-col items-center text-center">
        {variant === 'danger' && (
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error/10 text-error">
            <Icon name="warning" filled className="text-[28px]" />
          </div>
        )}
        <h2 className="font-headline-md text-headline-md text-on-surface dark:text-inverse-on-surface">{title}</h2>
        <p className="mt-2 font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">{message}</p>
      </div>

      {preview && (
        <div className="mt-4 rounded-lg border border-outline-variant bg-surface-container-low p-3 dark:border-outline dark:bg-inverse-on-surface/5">
          {preview}
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} isLoading={isLoading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
