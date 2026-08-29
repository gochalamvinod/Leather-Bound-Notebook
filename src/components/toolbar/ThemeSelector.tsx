import React, { useState, useRef, useEffect } from 'react';
import { CoverTheme } from '../../types/notebook';

export interface ThemeSelectorProps {
  activeTheme?: CoverTheme;
  onThemeChange: (theme: CoverTheme) => void;
}

const THEME_OPTIONS: Array<{ value: CoverTheme; label: string; bg: string; dot: string }> = [
  { value: 'green', label: 'Emerald Pine', bg: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', dot: '#10b981' },
  { value: 'brown', label: 'Classic Brown', bg: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)', dot: '#b45309' },
  { value: 'navy', label: 'Midnight Navy', bg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', dot: '#3b82f6' },
  { value: 'burgundy', label: 'Royal Burgundy', bg: 'linear-gradient(135deg, #be123c 0%, #881337 100%)', dot: '#be123c' },
  { value: 'black', label: 'Obsidian Noir', bg: 'linear-gradient(135deg, #4b5563 0%, #111827 100%)', dot: '#4b5563' },
];

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  activeTheme = 'green',
  onThemeChange,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const currentTheme = THEME_OPTIONS.find((t) => t.value === activeTheme) || THEME_OPTIONS[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="theme-selector-wrapper" ref={dropdownRef}>
      <button
        type="button"
        id="themeSelectorBtn"
        className="theme-selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title="Switch Notebook Cover Theme"
        aria-label="Theme Selector"
      >
        <span className="theme-dot" style={{ background: currentTheme.bg }} />
        <span className="theme-label">{currentTheme.label}</span>
        <span className="theme-caret">▾</span>
      </button>

      {isOpen && (
        <div className="theme-dropdown-menu" role="menu">
          <div className="theme-dropdown-header">Cover Themes</div>
          <div className="theme-options-list">
            {THEME_OPTIONS.map((theme) => {
              const isSelected = activeTheme === theme.value;
              return (
                <button
                  key={theme.value}
                  type="button"
                  className={`theme-option-item ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    onThemeChange(theme.value);
                    setIsOpen(false);
                  }}
                >
                  <span className="theme-option-dot" style={{ background: theme.bg }} />
                  <span className="theme-option-text">{theme.label}</span>
                  {isSelected && <span className="theme-check">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
