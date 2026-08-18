'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_SIZE_BYTES, MAX_UPLOAD_SIZE_MB } from '@/lib/upload-constants';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Currently committed image URL on the product (may be null). */
  value: string | null;
  /** Called with the new URL (or null) only when the user confirms via the footer button. */
  onUploaded: (url: string | null) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImageUploadModal({ isOpen, onClose, value, onUploaded }: ImageUploadModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingUrl, setPendingUrl] = useState<string | null>(value);
  const [fileMeta, setFileMeta] = useState<{ name: string; size: number } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPendingUrl(value);
      setFileMeta(null);
      setError(null);
      setIsDragging(false);
    }
  }, [isOpen, value]);

  const handleFile = async (file: File) => {
    setError(null);

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError('Invalid image format. Use JPEG, PNG, WEBP or GIF.');
      return;
    }
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      setError(`Image must be ${MAX_UPLOAD_SIZE_MB}MB or smaller.`);
      return;
    }

    setFileMeta({ name: file.name, size: file.size });
    setPendingUrl(URL.createObjectURL(file));
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? 'Failed to upload image');
        setPendingUrl(value);
        setFileMeta(null);
        return;
      }
      setPendingUrl(data.url);
    } catch {
      setError('Failed to upload image');
      setPendingUrl(value);
      setFileMeta(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePending = () => {
    setPendingUrl(null);
    setFileMeta(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleConfirm = () => {
    onUploaded(pendingUrl);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidthClass="max-w-lg">
      <div className="-m-6 flex max-h-[85vh] flex-col overflow-hidden rounded-xl">
        <div className="flex items-center justify-between border-b border-outline-variant p-stack-md dark:border-outline">
          <h2 className="font-headline-md text-headline-md text-on-surface dark:text-inverse-on-surface">
            Upload Product Image
          </h2>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface dark:text-surface-variant dark:hover:bg-inverse-on-surface/10"
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-stack-md overflow-y-auto p-gutter">
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-stack-lg text-center transition-colors',
              isDragging
                ? 'border-primary bg-surface-container-low dark:bg-inverse-on-surface/5'
                : 'border-outline-variant bg-surface hover:bg-surface-container-low dark:border-outline dark:bg-inverse-surface dark:hover:bg-inverse-on-surface/5'
            )}
          >
            <div className="mb-stack-sm flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary dark:text-inverse-primary">
              <Icon name="cloud_upload" className="text-[24px]" />
            </div>
            <p className="mb-1 font-body-md text-body-md font-medium text-on-surface dark:text-inverse-on-surface">
              <span className="font-semibold text-primary dark:text-inverse-primary">Click to upload</span> or drag and drop
            </p>
            <p className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant">
              JPEG, PNG, WEBP or GIF (max. {MAX_UPLOAD_SIZE_MB}MB)
            </p>
          </div>

          {error && <p className="font-label-md text-label-md text-error">{error}</p>}

          {pendingUrl && (
            <div className="flex items-center justify-between rounded-lg border border-outline-variant bg-surface p-stack-sm dark:border-outline dark:bg-inverse-surface">
              <div className="flex items-center gap-stack-sm">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-surface-container-high dark:bg-inverse-on-surface/10">
                  <Image src={pendingUrl} alt="Preview" width={48} height={48} className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-col">
                  <span className="w-48 truncate font-body-md text-body-md font-medium text-on-surface dark:text-inverse-on-surface">
                    {fileMeta?.name ?? 'Product image'}
                  </span>
                  <span className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant">
                    {isUploading ? 'Uploading…' : fileMeta ? formatFileSize(fileMeta.size) : 'Current image'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                aria-label="Remove image"
                onClick={handleRemovePending}
                disabled={isUploading}
                className="flex items-center gap-1 rounded p-1 text-error transition-colors hover:bg-error/10 disabled:opacity-50"
              >
                <Icon name="delete" className="text-[18px]" />
                <span className="hidden font-label-md text-label-md sm:inline">Remove</span>
              </button>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(',')}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>

        <div className="flex items-center justify-end gap-stack-sm border-t border-outline-variant bg-surface-container-lowest p-stack-md dark:border-outline dark:bg-inverse-surface">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={isUploading} isLoading={isUploading}>
            Upload Image
          </Button>
        </div>
      </div>
    </Modal>
  );
}
