import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api/client';
import { LinkCardMetadata } from '../../lib/editor/linkClassifier';

export interface LinkPreviewCardProps {
  url: string;
  initialData?: LinkCardMetadata;
  onRemove?: () => void;
  className?: string;
}

export const LinkPreviewCard: React.FC<LinkPreviewCardProps> = ({
  url,
  initialData,
  onRemove,
  className = '',
}) => {
  const [metadata, setMetadata] = useState<LinkCardMetadata>(() => {
    let domain = initialData?.domain || '';
    if (!domain) {
      try {
        domain = new URL(url).hostname.replace(/^www\./, '');
      } catch (e) {
        domain = '';
      }
    }
    return {
      title: initialData?.title || domain || url,
      description: initialData?.description || '',
      image: initialData?.image || null,
      domain: domain,
      url: url,
    };
  });

  const [loading, setLoading] = useState<boolean>(!initialData?.title);
  const [_error, setError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    // If full metadata was passed in initially, no need to refetch
    if (initialData && initialData.title && initialData.title !== url) {
      setMetadata((prev) => ({ ...prev, ...initialData }));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    api.getLinkPreview(url)
      .then((res) => {
        if (!isMounted) return;
        if (res && res.ok) {
          let domain = res.domain || '';
          if (!domain) {
            try {
              domain = new URL(url).hostname.replace(/^www\./, '');
            } catch (e) {
              domain = '';
            }
          }
          setMetadata({
            title: res.title || domain || url,
            description: res.description || '',
            image: res.image || null,
            domain: domain,
            url: res.url || url,
          });
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setError(true);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [url, initialData]);

  const displayTitle = metadata.title || metadata.domain || url;
  const displayDomain = metadata.domain || '';

  return (
    <div className={`nb-link-card-wrapper ${className}`} style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
      <a
        className="nb-link-card"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        contentEditable={false}
      >
        {/* Card Thumbnail */}
        {metadata.image ? (
          <img
            className="nb-link-card__thumb"
            src={metadata.image}
            alt=""
            onError={(e) => {
              // Fallback to placeholder icon if image fails to load
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <span className="nb-link-card__thumb--placeholder">📰</span>
        )}

        {/* Card Body */}
        <div className="nb-link-card__body">
          <div className="nb-link-card__title">
            {loading ? 'Loading preview...' : displayTitle}
          </div>

          {metadata.description && (
            <div className="nb-link-card__desc">{metadata.description}</div>
          )}

          <div className="nb-link-card__domain">
            {displayDomain || 'web'} <span className="nb-link-card__domain-dot">•</span> Preview Card
          </div>
        </div>

        {/* External Link Arrow */}
        <span className="nb-link-card__arrow">↗</span>
      </a>

      {/* Optional Remove Button */}
      {onRemove && (
        <button
          type="button"
          className="nb-link-card__remove-btn"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          title="Remove preview card"
          aria-label="Remove card"
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'var(--danger)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.4)',
            cursor: 'pointer',
            fontSize: '11px',
            lineHeight: '18px',
            textAlign: 'center',
            padding: 0,
            zIndex: 10,
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default LinkPreviewCard;
