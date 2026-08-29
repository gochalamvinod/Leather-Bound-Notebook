import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getIframeSrcForUrl } from '../../lib/editor/linkClassifier';

export interface LiveEmbedProps {
  url: string;
  initialTitle?: string;
  domain?: string;
  icon?: string;
  height?: number;
  isVideo?: boolean;
  onRemove?: () => void;
  onUrlChange?: (newUrl: string) => void;
  onHeightChange?: (newHeight: number) => void;
  className?: string;
}

export const LiveEmbed: React.FC<LiveEmbedProps> = ({
  url,
  initialTitle,
  domain,
  icon = '🌐',
  height = 380,
  isVideo = false,
  onRemove,
  onUrlChange,
  onHeightChange,
  className = '',
}) => {
  const [currentUrl, setCurrentUrl] = useState<string>(url);
  const [inputValue, setInputValue] = useState<string>(url);
  const [currentHeight, setCurrentHeight] = useState<number>(Math.max(180, Math.min(1200, height)));
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [iframeKey, setIframeKey] = useState<number>(Date.now());
  const [cacheBuster, setCacheBuster] = useState<string>('');

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const frameWrapRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const startYRef = useRef<number>(0);
  const startHeightRef = useRef<number>(height);

  // Sync external url prop change
  useEffect(() => {
    setCurrentUrl(url);
    setInputValue(url);
  }, [url]);

  // Global Escape key listener to close expanded fullscreen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  // Window message listener from proxied child iframes to update address bar
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === 'nb-embed-nav' && iframeRef.current && iframeRef.current.contentWindow === e.source) {
        if (e.data.url) {
          let displayUrl = e.data.url;
          try {
            const u = new URL(displayUrl);
            const proxiedParam = u.searchParams.get('url');
            if (proxiedParam) displayUrl = proxiedParam;
          } catch (err) {
            /* ignore */
          }
          setInputValue(displayUrl);
          setCurrentUrl(displayUrl);
          onUrlChange?.(displayUrl);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onUrlChange]);

  // Navigation: Back (via postMessage to iframe)
  const handleBack = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage({ type: 'nb-embed-cmd', action: 'back' }, '*');
      } catch (err) {
        /* ignore */
      }
    }
  }, []);

  // Navigation: Forward (via postMessage to iframe)
  const handleForward = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage({ type: 'nb-embed-cmd', action: 'forward' }, '*');
      } catch (err) {
        /* ignore */
      }
    }
  }, []);

  // Navigation: Reload (with cache-buster timestamp)
  const handleReload = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    const timestamp = `_t=${Date.now()}`;
    setCacheBuster(timestamp);
    setIframeKey(Date.now());
    if (videoRef.current) {
      const v = videoRef.current;
      const originalSrc = currentUrl;
      const newSrc = originalSrc + (originalSrc.includes('?') ? '&' : '?') + timestamp;
      v.src = newSrc;
      v.load();
    }
  }, [currentUrl]);

  // Navigation: Home / Reset
  const handleHome = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCacheBuster('');
    setIframeKey(Date.now());
    setCurrentUrl(url);
    setInputValue(url);
    onUrlChange?.(url);
  }, [url, onUrlChange]);

  // Omnibox submit on Enter
  const handleAddressKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      e.preventDefault();
      let val = inputValue.trim();
      if (!val) return;

      if (!/^https?:\/\//i.test(val) && !val.includes('.') && !val.includes('/')) {
        val = 'https://duckduckgo.com/html/?q=' + encodeURIComponent(val);
      } else if (!/^https?:\/\//i.test(val)) {
        val = 'https://' + val;
      }

      setInputValue(val);
      setCurrentUrl(val);
      setCacheBuster('');
      setIframeKey(Date.now());
      onUrlChange?.(val);
    }
  };

  // Drag-to-resize height handle logic (180px - 1200px)
  const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startHeightRef.current = currentHeight;

    if (iframeRef.current) {
      iframeRef.current.style.pointerEvents = 'none';
    }

    const onMouseMove = (ev: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaY = ev.clientY - startYRef.current;
      const newH = Math.max(180, Math.min(1200, startHeightRef.current + deltaY));
      setCurrentHeight(newH);
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      if (iframeRef.current) {
        iframeRef.current.style.pointerEvents = '';
      }
      onHeightChange?.(currentHeight);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const computedIframeSrc = () => {
    const baseSrc = getIframeSrcForUrl(currentUrl);
    if (!cacheBuster) return baseSrc;
    return baseSrc + (baseSrc.includes('?') ? '&' : '?') + cacheBuster;
  };

  const isVideoMode = isVideo || /\.(mp4|webm|ogg|ogv|mov|m4v)(\?[^\s]*)?(#.*)?$/i.test(currentUrl);

  return (
    <div
      className={`nb-live-embed ${isVideoMode ? 'nb-live-embed--video' : ''} ${
        isExpanded ? 'nb-live-embed--expanded' : ''
      } ${className}`}
      contentEditable={false}
      data-url={currentUrl}
    >
      {/* Top Bar / Omnibox Navigation Header */}
      <div className="nb-live-embed__bar">
        {!isVideoMode ? (
          <>
            <div className="nb-live-embed__nav-group">
              <button
                type="button"
                className="nb-live-embed__btn nb-live-embed__btn--back"
                onClick={handleBack}
                title="Back"
                aria-label="Back"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                type="button"
                className="nb-live-embed__btn nb-live-embed__btn--forward"
                onClick={handleForward}
                title="Forward"
                aria-label="Forward"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
              <button
                type="button"
                className="nb-live-embed__btn nb-live-embed__btn--reload"
                onClick={handleReload}
                title="Reload"
                aria-label="Reload"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
              </button>
              <button
                type="button"
                className="nb-live-embed__btn nb-live-embed__btn--home"
                onClick={handleHome}
                title="Original Page"
                aria-label="Home"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </button>
            </div>

            <div className="nb-live-embed__omnibox">
              <span className="nb-live-embed__icon">{icon}</span>
              <input
                type="text"
                className="nb-live-embed__address-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleAddressKeyDown}
                title="Type a URL or search query and press Enter"
                placeholder="Enter URL or search..."
              />
            </div>
          </>
        ) : (
          <>
            <span className="nb-live-embed__icon">🎬</span>
            <span className="nb-live-embed__info">
              <span className="nb-live-embed__title">{initialTitle || currentUrl.split('/').pop()?.split('?')[0] || 'Video'}</span>
              <span className="nb-live-embed__domain">{domain || 'HTML5 Video'}</span>
            </span>
            <button
              type="button"
              className="nb-live-embed__btn nb-live-embed__btn--reload"
              onClick={handleReload}
              title="Reload video"
              aria-label="Reload video"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
            </button>
          </>
        )}

        <div className="nb-live-embed__action-group">
          <button
            type="button"
            className="nb-live-embed__btn nb-live-embed__btn--expand"
            onClick={() => setIsExpanded((prev) => !prev)}
            title="Expand / Fullscreen"
            aria-label="Expand Fullscreen"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          </button>
          <a
            className="nb-live-embed__btn nb-live-embed__btn--open"
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in new tab"
            aria-label="Open in new tab"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
          {onRemove && (
            <button
              type="button"
              className="nb-live-embed__btn nb-live-embed__btn--remove"
              onClick={onRemove}
              title="Remove embed"
              aria-label="Remove embed"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Frame / Video Wrap Container */}
      <div
        ref={frameWrapRef}
        className="nb-live-embed__frame-wrap"
        style={!isExpanded ? { height: `${currentHeight}px` } : undefined}
      >
        {isVideoMode ? (
          <video
            ref={videoRef}
            className="nb-live-embed__video"
            src={currentUrl}
            controls
            preload="metadata"
            playsInline
          />
        ) : (
          <iframe
            key={iframeKey}
            ref={iframeRef}
            className="nb-live-embed__iframe"
            src={computedIframeSrc()}
            loading="eager"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; display-capture; fullscreen; geolocation; webgl; xr-spatial-tracking"
            allowFullScreen
          />
        )}
      </div>

      {/* Drag-to-resize height corner handle */}
      {!isExpanded && (
        <div
          className="nb-live-embed__resize-handle"
          title="Drag to resize height"
          onMouseDown={handleResizeMouseDown}
        />
      )}
    </div>
  );
};

export default LiveEmbed;
