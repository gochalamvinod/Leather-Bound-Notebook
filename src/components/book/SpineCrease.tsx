import React from 'react';

export interface SpineCreaseProps {
  className?: string;
  width?: number | string;
}

export const SpineCrease: React.FC<SpineCreaseProps> = ({
  className = '',
  width = 44,
}) => {
  const widthStyle = typeof width === 'number' ? `${width}px` : width;

  return (
    <div
      className={`spine-crease ${className}`}
      style={{ width: widthStyle }}
      aria-hidden="true"
    />
  );
};

export default SpineCrease;
