'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Icon } from '@/components/ui/Icon';
import { ImageUploadModal } from '@/components/products/ImageUploadModal';
import { MAX_UPLOAD_SIZE_MB } from '@/lib/upload-constants';

interface ProductImageSectionProps {
  value: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
  /** Smaller inline trigger used inside EditProductModal instead of the full dropzone card. */
  compact?: boolean;
}

export function ProductImageSection({ value, onChange, disabled, compact }: ProductImageSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (compact) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-outline-variant bg-surface-container-low dark:border-outline dark:bg-inverse-surface">
          {value ? (
            <Image src={value} alt="Product" width={64} height={64} className="h-full w-full object-cover" />
          ) : (
            <Icon name="image" className="text-on-surface-variant/50 dark:text-surface-variant/50" />
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsModalOpen(true)}
            className="rounded-lg border border-outline-variant px-3 py-1.5 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-low disabled:opacity-50 dark:border-outline dark:text-inverse-on-surface dark:hover:bg-inverse-surface"
          >
            {value ? 'Change image' : 'Upload image'}
          </button>
          {value && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange(null)}
              title="Remove image"
              className="rounded-lg border border-outline-variant p-1.5 text-on-surface-variant transition-colors hover:bg-error/10 hover:text-error disabled:opacity-50 dark:border-outline dark:text-surface-variant"
            >
              <Icon name="delete" className="text-[18px]" />
            </button>
          )}
        </div>
        <ImageUploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} value={value} onUploaded={onChange} />
      </div>
    );
  }

  return (
    <div>
      {value ? (
        <div className="space-y-3">
          <div className="relative h-48 w-full overflow-hidden rounded-xl border border-outline-variant dark:border-outline">
            <Image src={value} alt="Product" fill sizes="(min-width: 1024px) 350px, 100vw" className="object-cover" />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={() => setIsModalOpen(true)}
              className="flex-1 rounded-lg border border-outline-variant px-3 py-2 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-low disabled:opacity-50 dark:border-outline dark:text-inverse-on-surface dark:hover:bg-inverse-surface"
            >
              Change image
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange(null)}
              title="Remove image"
              className="rounded-lg border border-outline-variant px-3 py-2 text-on-surface-variant transition-colors hover:bg-error/10 hover:text-error disabled:opacity-50 dark:border-outline dark:text-surface-variant"
            >
              <Icon name="delete" className="text-[18px]" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsModalOpen(true)}
          className="flex min-h-[250px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant p-8 text-center transition-colors hover:border-primary hover:bg-surface-container-low disabled:opacity-50 dark:border-outline"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container dark:bg-inverse-on-surface/10">
            <Icon name="cloud_upload" className="text-3xl text-on-surface-variant dark:text-surface-variant" />
          </div>
          <p className="mb-1 font-body-md text-body-md font-medium text-on-surface dark:text-inverse-on-surface">
            Click to upload or drag and drop
          </p>
          <p className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant">
            JPEG, PNG, WEBP or GIF (max. {MAX_UPLOAD_SIZE_MB}MB)
          </p>
        </button>
      )}
      <ImageUploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} value={value} onUploaded={onChange} />
    </div>
  );
}
