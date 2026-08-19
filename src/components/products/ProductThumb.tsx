import Image from 'next/image';
import { Icon } from '@/components/ui/Icon';

export function ProductThumb({ imageUrl, name, size = 40 }: { imageUrl: string | null; name: string; size?: number }) {
  if (imageUrl) {
    return (
      <div
        className="relative shrink-0 overflow-hidden rounded border border-outline-variant bg-surface-container-lowest dark:border-outline dark:bg-inverse-surface"
        style={{ width: size, height: size }}
      >
        <Image src={imageUrl} alt={name} fill sizes={`${size}px`} className="object-contain" />
      </div>
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded border border-outline-variant bg-surface text-on-surface-variant dark:border-outline dark:bg-inverse-surface dark:text-surface-variant"
      style={{ width: size, height: size }}
    >
      <Icon name="image" size={Math.max(14, Math.round(size * 0.45))} />
    </div>
  );
}
