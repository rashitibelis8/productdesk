import Image from 'next/image';
import { Icon } from '@/components/ui/Icon';

export function ProductThumb({ imageUrl, name, size = 40 }: { imageUrl: string | null; name: string; size?: number }) {
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={name}
        width={size}
        height={size}
        className="rounded border border-outline-variant object-cover dark:border-outline"
        style={{ width: size, height: size }}
      />
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
