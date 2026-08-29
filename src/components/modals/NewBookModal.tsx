import React, { useEffect, useState } from 'react';
import { BookDimensionPreset, BookDimensions, CoverTheme } from '../../types/notebook';
import { useVault } from '../../context/VaultContext';
import { useEditor } from '../../context/EditorContext';
import { useAuth } from '../../context/AuthContext';

export interface NewBookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COVER_OPTIONS: Array<{ value: CoverTheme; label: string; chipClass: string }> = [
  { value: 'brown', label: 'Classic Brown', chipClass: 'chip-brown' },
  { value: 'green', label: 'Emerald Pine', chipClass: 'chip-green' },
  { value: 'navy', label: 'Midnight Navy', chipClass: 'chip-navy' },
  { value: 'burgundy', label: 'Royal Burgundy', chipClass: 'chip-burgundy' },
  { value: 'black', label: 'Obsidian Noir', chipClass: 'chip-black' },
];

export interface DimensionPresetOption {
  value: BookDimensionPreset;
  label: string;
  sub: string;
  ratio: number;
  icon: string;
}

export const DIMENSION_PRESETS: DimensionPresetOption[] = [
  {
    value: 'classic',
    label: 'Classic Journal',
    sub: '1.36 : 1 (Natural Portrait Spread)',
    ratio: 1.36,
    icon: '📖',
  },
  {
    value: 'compact',
    label: 'Compact Moleskine',
    sub: '1.20 : 1 (Tall Pocket Format)',
    ratio: 1.20,
    icon: '📓',
  },
  {
    value: 'square',
    label: 'Square Spread',
    sub: '1.00 : 1 (1:1 Ratio Spread)',
    ratio: 1.0,
    icon: '🎨',
  },
  {
    value: 'a4',
    label: 'A4 / A5 Standard',
    sub: '1.414 : 1 (ISO Standard Proportion)',
    ratio: 1.414,
    icon: '📄',
  },
  {
    value: 'pocket',
    label: 'Photo Album (3:2)',
    sub: '1.50 : 1 (Classic Landscape Spread)',
    ratio: 1.50,
    icon: '🖼️',
  },
  {
    value: 'wide',
    label: 'Wide Folio (16:9)',
    sub: '1.78 : 1 (Widescreen Canvas)',
    ratio: 1.778,
    icon: '🖥️',
  },
  {
    value: 'custom',
    label: 'Custom Aspect Ratio',
    sub: 'Continuous Ratio Slider (0.80 : 1 to 2.20 : 1)',
    ratio: 1.36,
    icon: '📐',
  },
];

const RATIO_QUICK_CHIPS = [
  { label: '1:1 Square', ratio: 1.0 },
  { label: '1.2:1 Compact', ratio: 1.2 },
  { label: '4:3 (1.33:1)', ratio: 1.333 },
  { label: '1.36:1 Classic', ratio: 1.36 },
  { label: 'A4 (1.41:1)', ratio: 1.414 },
  { label: '3:2 (1.5:1)', ratio: 1.5 },
  { label: '16:10 (1.6:1)', ratio: 1.6 },
  { label: '16:9 (1.78:1)', ratio: 1.778 },
  { label: '2:1 Panoramic', ratio: 2.0 },
];

export const NewBookModal: React.FC<NewBookModalProps> = ({ isOpen, onClose }) => {
  const { createBook } = useVault();
  const { flushSave } = useEditor();
  const { currentUser } = useAuth();

  const cleanUser = (currentUser || 'default').trim().toLowerCase();
  const [title, setTitle] = useState<string>('');
  const [coverColor, setCoverColor] = useState<CoverTheme>('brown');
  const [selectedPreset, setSelectedPreset] = useState<BookDimensionPreset>('classic');
  const [aspectRatio, setAspectRatio] = useState<number>(1.36);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(`${cleanUser}_`);
      setCoverColor('brown');
      setSelectedPreset('classic');
      setAspectRatio(1.36);
      setError(null);
    }
  }, [isOpen, cleanUser]);

  if (!isOpen) return null;

  const handlePresetSelect = (presetKey: BookDimensionPreset) => {
    setSelectedPreset(presetKey);
    const preset = DIMENSION_PRESETS.find((p) => p.value === presetKey);
    if (preset && presetKey !== 'custom') {
      setAspectRatio(preset.ratio);
    }
  };

  const handleRatioSliderChange = (r: number) => {
    setAspectRatio(r);
    setSelectedPreset('custom');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let raw = title.trim();

    // Strip repeated prefixes
    while (raw.toLowerCase().startsWith(`${cleanUser}_`)) {
      raw = raw.slice(cleanUser.length + 1).trim();
    }

    if (!raw) {
      raw = 'notebook';
    }

    // Compulsory: Book name must start with username_
    const compulsoryTitle = `${cleanUser}_${raw}`;

    setSubmitting(true);
    setError(null);

    try {
      await flushSave();
      const dims: BookDimensions = {
        preset: selectedPreset,
        aspectRatio: Number(aspectRatio.toFixed(3)),
        width: Math.round(840 * aspectRatio),
        height: 840,
        dimensionChangeCount: 0,
        maxDimensionChanges: 5,
      };
      await createBook(compulsoryTitle, coverColor, dims);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Could not create notebook.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="newBookModal" className="modal-overlay">
      <div className="modal-backdrop" id="newBookBackdrop" onClick={onClose} />
      <div className="new-book-card" style={{ maxWidth: '640px', width: '92vw', maxHeight: 'min(90vh, 780px)', overflowY: 'auto' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>📚</span>
            <h2>Create New Notebook</h2>
          </div>
          <button
            type="button"
            id="closeNewBookBtn"
            className="modal-close-btn"
            title="Close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <form id="newBookForm" className="new-book-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Notebook Title</span>
            <input
              type="text"
              id="newBookTitleInput"
              placeholder="e.g. Trading Journal, Research, Life Notes"
              required
              maxLength={80}
              autoComplete="off"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
            />
          </label>

          <label className="field">
            <span>Leather Cover Style</span>
            <div className="cover-color-palette">
              {COVER_OPTIONS.map((opt) => (
                <label key={opt.value} className="color-choice">
                  <input
                    type="radio"
                    name="coverColor"
                    value={opt.value}
                    checked={coverColor === opt.value}
                    onChange={() => setCoverColor(opt.value)}
                    disabled={submitting}
                  />
                  <span className={`cover-chip ${opt.chipClass}`}>{opt.label}</span>
                </label>
              ))}
            </div>
          </label>

          {/* Pure Aspect Ratio Engine */}
          <div className="field" style={{ marginTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, color: 'var(--paper)', fontSize: '0.9rem' }}>
                📐 Page Aspect Ratio & Proportion
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--brass-bright)', fontWeight: 700 }}>
                Spread Ratio: {aspectRatio.toFixed(2)} : 1
              </span>
            </div>

            {/* Presets Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '8px', marginBottom: '12px' }}>
              {DIMENSION_PRESETS.map((preset) => {
                const isSelected = selectedPreset === preset.value && (preset.value === 'custom' || Math.abs(aspectRatio - preset.ratio) < 0.01);
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handlePresetSelect(preset.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: isSelected ? '1.5px solid var(--brass-bright)' : '1px solid rgba(255,255,255,0.1)',
                      background: isSelected ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0, 0, 0, 0.25)',
                      color: isSelected ? '#fff' : 'rgba(255,255,255,0.8)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>{preset.icon}</span>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: isSelected ? 700 : 500 }}>
                        {preset.label}
                      </div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>{preset.sub}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Continuous Aspect Ratio Slider & Live Visual Box */}
            <div
              style={{
                padding: '12px 14px',
                background: 'rgba(0,0,0,0.35)',
                borderRadius: '10px',
                border: '1px solid rgba(212, 175, 55, 0.25)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--brass-bright)', fontWeight: 600 }}>
                  Adjust Spread Ratio (Fills screen without wasting space)
                </span>
                <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 800, background: 'rgba(212,175,55,0.25)', padding: '2px 8px', borderRadius: '6px' }}>
                  {aspectRatio.toFixed(2)} : 1
                </span>
              </div>

              <input
                type="range"
                min={0.80}
                max={2.20}
                step={0.02}
                value={aspectRatio}
                onChange={(e) => handleRatioSliderChange(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--brass-bright)', marginBottom: '8px' }}
              />

              {/* Quick Ratio Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
                {RATIO_QUICK_CHIPS.map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => handleRatioSliderChange(chip.ratio)}
                    style={{
                      fontSize: '0.7rem',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      border: Math.abs(aspectRatio - chip.ratio) < 0.01 ? '1px solid var(--brass-bright)' : '1px solid rgba(255,255,255,0.1)',
                      background: Math.abs(aspectRatio - chip.ratio) < 0.01 ? 'rgba(212,175,55,0.3)' : 'rgba(0,0,0,0.2)',
                      color: Math.abs(aspectRatio - chip.ratio) < 0.01 ? '#fff' : 'rgba(255,255,255,0.7)',
                      cursor: 'pointer',
                    }}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Live Aspect Ratio Visual Preview */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '64px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '46px',
                    aspectRatio: `${aspectRatio} / 1`,
                    background: 'linear-gradient(135deg, #fcfbf9 0%, #ede6db 100%)',
                    border: '1.5px solid var(--brass)',
                    borderRadius: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <div style={{ width: '1px', height: '100%', background: 'rgba(0,0,0,0.2)' }} />
                  <span style={{ position: 'absolute', fontSize: '0.65rem', color: '#555', fontWeight: 700 }}>
                    {aspectRatio.toFixed(2)}:1
                  </span>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-banner" style={{ marginTop: '10px' }} role="alert">
              {error}
            </div>
          )}

          <div className="modal-actions" style={{ marginTop: '16px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              id="confirmNewBookBtn"
              className="btn btn-primary"
              disabled={submitting || !title.trim()}
            >
              {submitting ? 'Creating...' : 'Create Notebook'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewBookModal;
