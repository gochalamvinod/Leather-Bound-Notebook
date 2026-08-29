import React, { useEffect, useState, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import {
  RESIZE_HANDLES,
  HandleConfig,
  calculateResize,
  calculateDropTarget,
  repositionElementInDom,
} from '../../lib/editor/imageResizer';
import { api } from '../../lib/api/client';

export interface OverlayBounds {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface ImageOverlayProps {
  targetImage?: HTMLElement | HTMLImageElement | HTMLVideoElement | null;
  targetImg?: HTMLElement | HTMLImageElement | HTMLVideoElement | null;
  targetElement?: HTMLElement | null;
  containerElement?: HTMLElement | null;
  onResize?: (width: number, height: number) => void;
  onMove?: (targetElement: HTMLElement, position: 'before' | 'after') => void;
  onDelete?: () => void;
  onDismiss?: () => void;
  onClose?: () => void;
  onUpdate?: () => void;
  onCaptionEdit?: () => void;
  maintainAspectRatio?: boolean;
  minSize?: number;
  className?: string;
}

export const ImageOverlay: React.FC<ImageOverlayProps> = ({
  targetImage: propTargetImage,
  targetImg,
  targetElement: propTargetElement,
  containerElement,
  onResize,
  onMove,
  onDelete,
  onDismiss,
  onClose,
  onUpdate,
  onCaptionEdit,
  maintainAspectRatio = true,
  minSize = 40,
  className = '',
}) => {
  const target = (propTargetElement || propTargetImage || targetImg || null) as HTMLElement | null;
  const handleClose = useCallback(() => {
    onDismiss?.();
    onClose?.();
  }, [onDismiss, onClose]);

  const [bounds, setBounds] = useState<OverlayBounds | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const isResizingRef = useRef<boolean>(false);

  // Synchronize overlay position directly with target element's bounding rect
  const updatePosition = useCallback(() => {
    if (!target || !document.body.contains(target)) {
      setBounds(null);
      return;
    }
    const r = target.getBoundingClientRect();
    setBounds({
      left: Math.round(r.left),
      top: Math.round(r.top),
      width: Math.round(r.width),
      height: Math.round(r.height),
    });
  }, [target]);

  useEffect(() => {
    updatePosition();

    let animId: number;
    const handleScrollOrResize = () => {
      if (!isDraggingRef.current && !isResizingRef.current) {
        updatePosition();
      }
    };

    window.addEventListener('scroll', handleScrollOrResize, { passive: true, capture: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && target) {
      ro = new ResizeObserver(() => {
        if (!isDraggingRef.current && !isResizingRef.current) {
          updatePosition();
        }
      });
      ro.observe(target);
      const bookEl = document.getElementById('book');
      if (bookEl) ro.observe(bookEl);
      const pageEl = target.closest('.page.current') || target.parentElement;
      if (pageEl) ro.observe(pageEl);
    }

    // Continuous RAF check for 500ms to catch CSS transitions / page turns / ratio updates
    let frames = 0;
    const loop = () => {
      if (frames < 45) {
        updatePosition();
        frames++;
        animId = requestAnimationFrame(loop);
      }
    };
    animId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, { capture: true });
      window.removeEventListener('resize', handleScrollOrResize);
      if (ro) ro.disconnect();
      if (animId) cancelAnimationFrame(animId);
    };
  }, [target, updatePosition]);

  // Click outside or Escape key to dismiss
  useEffect(() => {
    const handleDocumentMouseDown = (e: MouseEvent) => {
      if (isDraggingRef.current || isResizingRef.current) return;
      const clickedEl = e.target as Node;
      if (
        overlayRef.current &&
        !overlayRef.current.contains(clickedEl) &&
        target &&
        !target.contains(clickedEl) &&
        clickedEl !== target
      ) {
        // If clicking on caption or child of current media, do not dismiss
        const parentMedia = (clickedEl as HTMLElement).closest?.('.media-container, .nb-media-figure, .nb-live-embed, .video-container');
        if (parentMedia && parentMedia === target) return;

        handleClose?.();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose?.();
      }
    };

    document.addEventListener('mousedown', handleDocumentMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleDocumentMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [target, handleClose]);

  // Disable pointer events on all iframes and videos while dragging or resizing
  const setIframePointerEvents = (enabled: boolean) => {
    const iframes = document.querySelectorAll<HTMLElement>('iframe, .nb-live-embed__iframe, video');
    iframes.forEach((f) => {
      f.style.pointerEvents = enabled ? '' : 'none';
    });
  };

  // Handle Drag Handle (Ghost Drag-to-Move)
  const startDrag = (clientX: number, clientY: number) => {
    if (!target) return;

    isDraggingRef.current = true;
    setIframePointerEvents(false);
    const startClientX = clientX;
    const startClientY = clientY;
    const initialRect = target.getBoundingClientRect();
    const container =
      containerElement ||
      (target.closest('.page.current') as HTMLElement) ||
      target.parentElement;

    target.style.pointerEvents = 'none';

    if (overlayRef.current) {
      overlayRef.current.style.pointerEvents = 'none';
    }

    // Create drop indicator line
    const dropIndicator = document.createElement('div');
    dropIndicator.className = 'nb-drop-indicator-line';
    dropIndicator.style.position = 'fixed';
    dropIndicator.style.height = '3px';
    dropIndicator.style.background = 'var(--brass-bright, #d4af37)';
    dropIndicator.style.boxShadow = '0 0 8px rgba(212, 175, 55, 0.8)';
    dropIndicator.style.borderRadius = '2px';
    dropIndicator.style.zIndex = '999998';
    dropIndicator.style.display = 'none';
    dropIndicator.style.pointerEvents = 'none';
    document.body.appendChild(dropIndicator);

    // Create ghost clone
    const ghost = target.cloneNode(true) as HTMLElement;
    ghost.style.opacity = '0.65';
    ghost.style.pointerEvents = 'none';
    ghost.style.position = 'fixed';
    ghost.style.zIndex = '999999';
    ghost.style.width = `${initialRect.width}px`;
    ghost.style.height = `${initialRect.height}px`;
    ghost.style.left = `${initialRect.left}px`;
    ghost.style.top = `${initialRect.top}px`;
    ghost.style.boxShadow = '0 12px 32px rgba(0,0,0,0.65)';
    ghost.style.borderRadius = '6px';
    ghost.style.transition = 'none';
    document.body.appendChild(ghost);

    let lastDropTarget: { targetElement: HTMLElement; position: 'before' | 'after' } | null = null;

    const onPointerMove = (currentClientX: number, currentClientY: number) => {
      if (!ghost) return;
      const dx = currentClientX - startClientX;
      const dy = currentClientY - startClientY;
      ghost.style.left = `${initialRect.left + dx}px`;
      ghost.style.top = `${initialRect.top + dy}px`;

      if (container) {
        const dropTarget = calculateDropTarget(currentClientX, currentClientY, container, target);
        lastDropTarget = dropTarget;
        if (dropTarget) {
          const tRect = dropTarget.targetElement.getBoundingClientRect();
          dropIndicator.style.display = 'block';
          dropIndicator.style.width = `${tRect.width}px`;
          dropIndicator.style.left = `${tRect.left}px`;
          dropIndicator.style.top = `${dropTarget.position === 'before' ? Math.round(tRect.top - 2) : Math.round(tRect.bottom - 1)}px`;
        } else {
          dropIndicator.style.display = 'none';
        }
      }
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
      setIframePointerEvents(true);
      target.style.pointerEvents = '';
      if (overlayRef.current) {
        overlayRef.current.style.pointerEvents = '';
      }

      if (dropIndicator && dropIndicator.parentElement) {
        dropIndicator.parentElement.removeChild(dropIndicator);
      }

      if (ghost && ghost.parentElement) {
        ghost.parentElement.removeChild(ghost);
      }

      if (lastDropTarget && container) {
        repositionElementInDom(target, lastDropTarget.targetElement, lastDropTarget.position);
        onMove?.(lastDropTarget.targetElement, lastDropTarget.position);
        onUpdate?.();
      }

      requestAnimationFrame(() => {
        updatePosition();
      });

      const editableContainer = (target.closest('.page.current, [contenteditable="true"]') || target.parentElement) as HTMLElement | null;
      if (editableContainer) {
        editableContainer.dispatchEvent(new Event('input', { bubbles: true }));
      }
      onUpdate?.();
    };

    const handleMouseMove = (ev: MouseEvent) => {
      onPointerMove(ev.clientX, ev.clientY);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      onPointerUp();
    };

    const handleTouchMove = (ev: TouchEvent) => {
      if (ev.touches[0]) {
        ev.preventDefault();
        onPointerMove(ev.touches[0].clientX, ev.touches[0].clientY);
      }
    };

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      onPointerUp();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleDragMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    startDrag(e.clientX, e.clientY);
  };

  const handleDragTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches[0]) {
      e.preventDefault();
      e.stopPropagation();
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  // Handle Resize Handles (Mouse & Touch)
  const startResize = (clientX: number, clientY: number, handle: HandleConfig, _isShiftPressed: boolean = false) => {
    if (!target) return;

    isResizingRef.current = true;
    setIframePointerEvents(false);
    const startX = clientX;
    const startY = clientY;
    const startW = target.offsetWidth || 120;
    const startH = target.offsetHeight || 90;
    const originalRatio = startH > 0 ? startW / startH : 1;

    const isImage = target.tagName === 'IMG' || !!target.querySelector('img');
    const isVideo = target.tagName === 'VIDEO' || target.classList.contains('video-container') || target.classList.contains('nb-progressive-video-container');

    const container =
      containerElement ||
      (target.closest('.page.current') as HTMLElement) ||
      target.parentElement;
    const containerMaxWidth = container ? Math.max(minSize, container.clientWidth - 16) : undefined;

    const onPointerMove = (currentClientX: number, currentClientY: number, shiftKey: boolean) => {
      const deltaX = currentClientX - startX;
      const deltaY = currentClientY - startY;
      
      // Corner handles maintain aspect ratio by default (unless Shift toggles it).
      // Edge handles resize single dimension by default (unless Shift locks ratio).
      const lockRatio = handle.isCorner
        ? (maintainAspectRatio !== false ? !shiftKey : shiftKey)
        : shiftKey;

      const { width: newW, height: newH } = calculateResize({
        startWidth: startW,
        startHeight: startH,
        deltaX,
        deltaY,
        handle,
        minSize,
        maxWidth: containerMaxWidth,
        maintainAspectRatio: lockRatio,
        originalAspectRatio: originalRatio,
      });

      target.style.width = `${newW}px`;
      target.style.height = `${newH}px`;
      target.style.maxWidth = '100%';

      if (isImage || target.classList.contains('nb-media-figure') || target.tagName === 'FIGURE') {
        const imgEl = target.querySelector('img') || (target.tagName === 'IMG' ? (target as HTMLImageElement) : null);
        if (imgEl && imgEl !== target) {
          imgEl.style.width = '100%';
          imgEl.style.height = '100%';
          imgEl.style.objectFit = 'contain';
        }
      } else if (isVideo) {
        const videoEl = target.querySelector('video') || (target.tagName === 'VIDEO' ? (target as HTMLVideoElement) : null);
        if (videoEl && videoEl !== target) {
          videoEl.style.width = '100%';
          videoEl.style.height = '100%';
          videoEl.style.objectFit = 'contain';
        }
      } else if (target.classList.contains('nb-live-embed') || target.querySelector('.nb-live-embed__frame-wrap')) {
        const wrap = target.querySelector('.nb-live-embed__frame-wrap') as HTMLElement | null;
        if (wrap) {
          wrap.style.height = `${Math.max(100, newH - 36)}px`;
        }
      }

      updatePosition();
      onResize?.(newW, newH);
      onUpdate?.();
    };

    const onPointerUp = () => {
      isResizingRef.current = false;
      setIframePointerEvents(true);
      requestAnimationFrame(() => {
        updatePosition();
      });
      
      const editableContainer = (target.closest('.page.current, [contenteditable="true"]') || target.parentElement) as HTMLElement | null;
      if (editableContainer) {
        editableContainer.dispatchEvent(new Event('input', { bubbles: true }));
      }
      
      onUpdate?.();
    };

    const handleMouseMove = (ev: MouseEvent) => {
      onPointerMove(ev.clientX, ev.clientY, ev.shiftKey);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      onPointerUp();
    };

    const handleTouchMove = (ev: TouchEvent) => {
      if (ev.touches[0]) {
        ev.preventDefault();
        onPointerMove(ev.touches[0].clientX, ev.touches[0].clientY, false);
      }
    };

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      onPointerUp();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleResizeMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    handle: HandleConfig
  ) => {
    e.preventDefault();
    e.stopPropagation();
    startResize(e.clientX, e.clientY, handle, e.shiftKey);
  };

  const handleResizeTouchStart = (
    e: React.TouchEvent<HTMLDivElement>,
    handle: HandleConfig
  ) => {
    if (e.touches[0]) {
      e.preventDefault();
      e.stopPropagation();
      startResize(e.touches[0].clientX, e.touches[0].clientY, handle, false);
    }
  };

  // Handle Add / Edit Caption
  const handleCaptionClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!target) return;

    // Check if element is a video container or standalone image/video
    let captionEl: HTMLElement | null = target.querySelector('.vintage-media-caption, .nb-media-caption, figcaption');

    if (!captionEl) {
      if (target.classList.contains('media-container') || target.classList.contains('video-container')) {
        captionEl = document.createElement('div');
        captionEl.className = 'vintage-media-caption';
        captionEl.setAttribute('contenteditable', 'true');
        captionEl.setAttribute('placeholder', 'Add a caption...');
        captionEl.innerText = 'Caption';
        target.appendChild(captionEl);
      } else if (target.tagName === 'IMG') {
        const parent = target.parentElement;
        if (parent && parent.tagName === 'FIGURE') {
          captionEl = document.createElement('figcaption');
          captionEl.className = 'nb-media-caption';
          captionEl.setAttribute('contenteditable', 'true');
          captionEl.innerText = 'Caption';
          parent.appendChild(captionEl);
        } else {
          captionEl = document.createElement('div');
          captionEl.className = 'vintage-media-caption';
          captionEl.setAttribute('contenteditable', 'true');
          captionEl.setAttribute('placeholder', 'Add a caption...');
          captionEl.innerText = 'Caption';
          target.after(captionEl);
        }
      } else {
        captionEl = document.createElement('div');
        captionEl.className = 'vintage-media-caption';
        captionEl.setAttribute('contenteditable', 'true');
        captionEl.innerText = 'Caption';
        target.appendChild(captionEl);
      }
    }

    if (captionEl) {
      captionEl.focus();
      const sel = window.getSelection();
      if (sel) {
        const range = document.createRange();
        range.selectNodeContents(captionEl);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }

    updatePosition();
    const editableContainer = (target.closest('.page.current, [contenteditable="true"]') || target.parentElement) as HTMLElement | null;
    if (editableContainer) {
      editableContainer.dispatchEvent(new Event('input', { bubbles: true }));
    }
    onCaptionEdit?.();
    onUpdate?.();
  };

  // Handle Delete
  const handleDeleteClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!target) return;
    if (typeof window !== 'undefined' && !window.confirm('Remove this item from page?')) {
      return;
    }

    const src = target.getAttribute('src') || target.querySelector('img, video, audio')?.getAttribute('src');
    const parentContainer = (target.closest('.page.current, [contenteditable="true"]') || target.parentElement) as HTMLElement | null;
    target.remove();
    if (parentContainer) {
      parentContainer.dispatchEvent(new Event('input', { bubbles: true }));
    }
    onDelete?.();
    handleClose?.();
    onUpdate?.();

    if (src && src.startsWith('/images/')) {
      const filename = src.split('/').pop();
      if (filename) {
        try {
          await api.deleteImage(filename);
        } catch {
          // Best-effort delete
        }
      }
    }
  };

  if (!target || !bounds) {
    return null;
  }

  const isVideo = target.tagName === 'VIDEO' || target.classList.contains('video-container') || target.classList.contains('nb-progressive-video-container');
  const isImage = target.tagName === 'IMG' || !!target.querySelector('img');

  // Mount to document.body via Portal with position: fixed
  return ReactDOM.createPortal(
    <div
      ref={overlayRef}
      className={`img-overlay nb-unified-media-overlay ${className}`}
      style={{
        position: 'fixed',
        left: `${bounds.left}px`,
        top: `${bounds.top}px`,
        width: `${bounds.width}px`,
        height: `${bounds.height}px`,
        zIndex: 99999,
      }}
      data-testid="img-overlay"
    >
      {/* Top Toolbar Actions Bar */}
      <div className="nb-overlay-toolbar">
        {/* Top-left Drag handle pill */}
        <div
          className="img-overlay__drag"
          title="Drag to reposition on page"
          onMouseDown={handleDragMouseDown}
          onTouchStart={handleDragTouchStart}
          data-testid="img-overlay-drag"
        >
          ⠿ Move
        </div>

        {/* Caption button for images & videos */}
        {(isImage || isVideo) && (
          <button
            type="button"
            className="img-overlay__btn img-overlay__btn--caption"
            title="Add or edit caption"
            onClick={handleCaptionClick}
            data-testid="img-overlay-caption"
          >
            📝 Caption
          </button>
        )}

        {/* Top-right Delete button */}
        <button
          type="button"
          className="img-overlay__delete"
          title="Remove element"
          onClick={handleDeleteClick}
          data-testid="img-overlay-delete"
        >
          🗑
        </button>
      </div>

      {/* 8 Circular Resize Handles */}
      {RESIZE_HANDLES.map((handle) => (
        <div
          key={handle.cls}
          className={`img-overlay__handle img-overlay__handle--${handle.cls}`}
          style={{ cursor: handle.cursor }}
          title={`Resize (${handle.cls.toUpperCase()})`}
          onMouseDown={(e) => handleResizeMouseDown(e, handle)}
          onTouchStart={(e) => handleResizeTouchStart(e, handle)}
          data-handle={handle.cls}
          data-testid={`img-handle-${handle.cls}`}
        />
      ))}
    </div>,
    document.body
  );
};

export default ImageOverlay;
