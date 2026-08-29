import React from 'react';

export interface MediaUploadToastProps {
  isOpen: boolean;
  fileName?: string;
  progressPercent?: number;
  percent?: number;
  loadedMB?: string | number;
  totalMB?: string | number;
  statsText?: string;
  phase?: string;
  eta?: string;
  speedText?: string;
  isAudio?: boolean;
  isVideo?: boolean;
  title?: string;
  icon?: string;
  error?: string | null;
  onCancel?: () => void;
  className?: string;
}

export const MediaUploadToast: React.FC<MediaUploadToastProps> = ({
  isOpen,
  fileName,
  progressPercent,
  percent: propPercent,
  loadedMB = '0',
  totalMB = '0',
  statsText,
  phase = 'Processing segments…',
  eta,
  speedText,
  isAudio = false,
  isVideo = false,
  title,
  icon: propIcon,
  error = null,
  onCancel,
  className = '',
}) => {
  if (!isOpen) return null;

  const rawPercent =
    typeof progressPercent === 'number'
      ? progressPercent
      : typeof propPercent === 'number'
      ? propPercent
      : 0;
  const clampedPercent = Math.min(100, Math.max(0, Math.round(rawPercent)));
  const displayIcon = propIcon || (isAudio ? '🎵' : isVideo ? '🎬' : '📼');
  const displayTitle =
    title ||
    (fileName
      ? `Uploading ${fileName}…`
      : isAudio
      ? 'Processing Audio…'
      : isVideo
      ? 'Processing Video…'
      : 'Uploading Media…');

  const displayStats =
    statsText ||
    `${clampedPercent}% (${loadedMB} MB / ${totalMB} MB)`;

  return (
    <div
      id="mediaUploadToast"
      className={`media-upload-toast ${className}`}
      role="status"
      aria-live="polite"
      data-testid="media-upload-toast"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 100000,
        minWidth: '340px',
        maxWidth: '440px',
        background: 'linear-gradient(145deg, #1d2520, #111813)',
        border: '1px solid var(--brass, #c6a052)',
        borderRadius: '12px',
        boxShadow: '0 12px 36px rgba(0,0,0,0.7), 0 0 16px rgba(198,160,82,0.25)',
        padding: '16px 20px',
        color: 'var(--brass-bright, #f1dfa8)',
        fontFamily: 'inherit',
      }}
    >
      <div className="toast-content" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Header Row */}
        <div className="toast-header-row" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="toast-icon" aria-hidden="true" style={{ fontSize: '1.3rem' }}>
            {displayIcon}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
            <span
              id="toastTitle"
              className="toast-title"
              style={{
                fontSize: '0.92rem',
                fontWeight: 600,
                color: '#fff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {displayTitle}
            </span>
            {phase && (
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--brass, #c6a052)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  marginTop: '2px',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: clampedPercent >= 100 ? '#4ade80' : '#eab308',
                    boxShadow: clampedPercent >= 100 ? '0 0 6px #4ade80' : '0 0 6px #eab308',
                  }}
                />
                {phase}
              </span>
            )}
          </div>

          {onCancel && (
            <button
              type="button"
              className="toast-close-btn"
              onClick={onCancel}
              title="Dismiss"
              style={{
                marginLeft: 'auto',
                background: 'transparent',
                border: 'none',
                color: 'var(--brass-dim, #b8935a)',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              ✕
            </button>
          )}
        </div>

        {error ? (
          <div
            className="toast-error"
            style={{
              color: 'var(--danger-bright, #ff6b6b)',
              fontSize: '0.85rem',
              padding: '6px 8px',
              background: 'rgba(255,107,107,0.1)',
              borderRadius: '6px',
            }}
          >
            {error}
          </div>
        ) : (
          <>
            {/* Progress Bar */}
            <div
              className="toast-progress-bar-bg"
              aria-hidden="true"
              style={{
                width: '100%',
                height: '8px',
                background: 'rgba(0,0,0,0.5)',
                borderRadius: '4px',
                overflow: 'hidden',
                border: '1px solid rgba(198,160,82,0.3)',
                position: 'relative',
              }}
            >
              <div
                id="toastProgressFill"
                className="toast-progress-bar-fill"
                style={{
                  width: `${clampedPercent}%`,
                  height: '100%',
                  background:
                    clampedPercent >= 100
                      ? 'linear-gradient(90deg, #10b981, #34d399)'
                      : 'linear-gradient(90deg, #b8935a, #f1dfa8)',
                  borderRadius: '4px',
                  transition: 'width 0.2s ease-out',
                  boxShadow: '0 0 10px rgba(241,223,168,0.5)',
                }}
                data-testid="toast-progress-fill"
              />
            </div>

            {/* Footer Stats & ETA Row */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.78rem',
                color: 'var(--brass-dim, #b8935a)',
              }}
            >
              <span id="toastStats" data-testid="toast-stats" style={{ fontFeatureSettings: "'tnum'" }}>
                {displayStats}
                {speedText ? ` • ${speedText}` : ''}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {eta && (
                  <span
                    style={{
                      background: 'rgba(198,160,82,0.15)',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '0.72rem',
                      fontWeight: 500,
                    }}
                  >
                    ⏱ {eta}
                  </span>
                )}
                <span
                  title="Streamed in 4-8MB encrypted storage shards to minimize RAM consumption"
                  style={{
                    background: 'rgba(52,211,153,0.12)',
                    color: '#34d399',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                  }}
                >
                  ⚡ Low-RAM
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MediaUploadToast;
