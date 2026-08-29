import React from 'react';

export interface ColorSwatchesProps {
  textColor?: string;
  highlightColor?: string;
  onTextColorChange: (color: string) => void;
  onHighlightColorChange: (color: string) => void;
  className?: string;
}

export const ColorSwatches: React.FC<ColorSwatchesProps> = ({
  textColor = '#2c2416',
  highlightColor = '#f6e27a',
  onTextColorChange,
  onHighlightColorChange,
  className = '',
}) => {
  return (
    <div className={`tool-group color-swatches-group ${className}`}>
      {/* Text Color Swatch */}
      <label
        className="swatch"
        title="Text ink color"
        style={{ color: textColor }}
      >
        <span style={{ fontWeight: 'bold', fontSize: '15px' }}>A</span>
        <input
          id="colorInput"
          type="color"
          value={textColor}
          onChange={(e) => onTextColorChange(e.target.value)}
          aria-label="Text ink color"
        />
      </label>

      {/* Highlight Color Swatch */}
      <label
        className="swatch highlight"
        title="Highlight background color"
        style={{ backgroundColor: highlightColor }}
      >
        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>H</span>
        <input
          id="highlightInput"
          type="color"
          value={highlightColor}
          onChange={(e) => onHighlightColorChange(e.target.value)}
          aria-label="Highlight color"
        />
      </label>
    </div>
  );
};

export default ColorSwatches;
