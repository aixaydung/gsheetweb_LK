import React from 'react';

interface IconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
  size?: number | string;
}

export const Icon: React.FC<IconProps> = ({ name, className = '', style, size }) => {
  const customStyle: React.CSSProperties = {
    ...style,
    ...(size ? { fontSize: typeof size === 'number' ? `${size}px` : size } : {}),
  };

  return (
    <span
      className={`material-symbols-outlined select-none inline-flex items-center justify-center leading-none ${className}`}
      style={customStyle}
      aria-hidden="true"
    >
      {name}
    </span>
  );
};
