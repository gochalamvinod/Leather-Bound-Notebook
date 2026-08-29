import React from 'react';
import { FONTS, FONT_SIZES, DEFAULT_FONT, DEFAULT_FONT_SIZE } from '../../lib/editor/richText';

export interface TypographyControlsProps {
  activeFont?: string;
  activeFontSize?: string;
  onFontChange: (font: string) => void;
  onFontSizeChange: (fontSize: string) => void;
  onFormatCommand: (command: string, value?: string) => void;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  activeAlignment?: 'justifyLeft' | 'justifyCenter' | 'justifyRight' | string;
  className?: string;
}

export const TypographyControls: React.FC<TypographyControlsProps> = ({
  activeFont = DEFAULT_FONT,
  activeFontSize = DEFAULT_FONT_SIZE,
  onFontChange,
  onFontSizeChange,
  onFormatCommand,
  isBold = false,
  isItalic = false,
  isUnderline = false,
  activeAlignment = 'justifyLeft',
  className = '',
}) => {
  const handleButtonMouseDown = (e: React.MouseEvent) => {
    // Prevent button from stealing focus from contenteditable
    e.preventDefault();
  };

  return (
    <div className={`typography-controls-wrapper ${className}`} style={{ display: 'flex', alignItems: 'center' }}>
      {/* Font Family Selector */}
      <div className="tool-group">
        <select
          id="fontSelect"
          value={activeFont}
          onChange={(e) => onFontChange(e.target.value)}
          title="Select typeface"
          aria-label="Font family"
        >
          {FONTS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>

        {/* Font Size Selector */}
        <select
          id="sizeSelect"
          value={activeFontSize}
          onChange={(e) => onFontSizeChange(e.target.value)}
          title="Select font size"
          aria-label="Font size"
        >
          {FONT_SIZES.map((sz) => (
            <option key={sz} value={sz}>
              {sz}
            </option>
          ))}
        </select>
      </div>

      {/* Style Commands: Bold, Italic, Underline */}
      <div className="tool-group">
        <button
          type="button"
          className={`icon-btn ${isBold ? 'active' : ''}`}
          data-cmd="bold"
          onMouseDown={handleButtonMouseDown}
          onClick={() => onFormatCommand('bold')}
          title="Bold (Ctrl+B)"
          aria-label="Bold"
        >
          <strong>B</strong>
        </button>

        <button
          type="button"
          className={`icon-btn ${isItalic ? 'active' : ''}`}
          data-cmd="italic"
          onMouseDown={handleButtonMouseDown}
          onClick={() => onFormatCommand('italic')}
          title="Italic (Ctrl+I)"
          aria-label="Italic"
        >
          <em>I</em>
        </button>

        <button
          type="button"
          className={`icon-btn ${isUnderline ? 'active' : ''}`}
          data-cmd="underline"
          onMouseDown={handleButtonMouseDown}
          onClick={() => onFormatCommand('underline')}
          title="Underline (Ctrl+U)"
          aria-label="Underline"
        >
          <span style={{ textDecoration: 'underline' }}>U</span>
        </button>
      </div>

      {/* Alignment Commands: Left, Center, Right */}
      <div className="tool-group">
        <button
          type="button"
          className={`icon-btn ${activeAlignment === 'justifyLeft' ? 'active' : ''}`}
          data-cmd="justifyLeft"
          onMouseDown={handleButtonMouseDown}
          onClick={() => onFormatCommand('justifyLeft')}
          title="Align Left"
          aria-label="Align Left"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="15" y2="12" />
            <line x1="3" y1="18" x2="18" y2="18" />
          </svg>
        </button>

        <button
          type="button"
          className={`icon-btn ${activeAlignment === 'justifyCenter' ? 'active' : ''}`}
          data-cmd="justifyCenter"
          onMouseDown={handleButtonMouseDown}
          onClick={() => onFormatCommand('justifyCenter')}
          title="Align Center"
          aria-label="Align Center"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="6" y1="12" x2="18" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>

        <button
          type="button"
          className={`icon-btn ${activeAlignment === 'justifyRight' ? 'active' : ''}`}
          data-cmd="justifyRight"
          onMouseDown={handleButtonMouseDown}
          onClick={() => onFormatCommand('justifyRight')}
          title="Align Right"
          aria-label="Align Right"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="9" y1="12" x2="21" y2="12" />
            <line x1="6" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TypographyControls;
