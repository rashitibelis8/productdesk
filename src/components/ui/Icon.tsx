interface IconProps {
  name: string;
  filled?: boolean;
  className?: string;
  size?: number;
}

export function Icon({ name, filled, className, size }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined ${className ?? ''}`}
      data-weight={filled ? 'fill' : undefined}
      style={size ? { fontSize: size, width: size, height: size } : undefined}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
