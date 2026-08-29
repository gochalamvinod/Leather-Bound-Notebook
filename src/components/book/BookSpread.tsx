import React, { useEffect, useMemo, useRef } from 'react';
import { PageData } from '../../types/notebook';
import { useVault } from '../../context/VaultContext';
import PageSlot from './PageSlot';
import SpineCrease from './SpineCrease';
import EmptyPlaceholder from './EmptyPlaceholder';

export interface BookSpreadProps {
  leftIndex: number;
  pages: PageData[];
  activeSlot: 'left' | 'right';
  isMobile?: boolean;
  isFlipping?: boolean;
  canPrev?: boolean;
  canNext?: boolean;
  underLeftPage?: PageData | null;
  underRightPage?: PageData | null;
  viewportRef?: React.RefObject<HTMLDivElement>;
  flipLayerLeftRef?: React.RefObject<HTMLDivElement>;
  flipLayerRightRef?: React.RefObject<HTMLDivElement>;
  onActiveSlotChange: (slot: 'left' | 'right') => void;
  onPageContentChange: (pageIndex: number, html: string) => void;
  onTurnPrev: () => void;
  onTurnNext: () => void;
  onAddPage: () => void;
  onImageClick?: (img: HTMLElement) => void;
  onMediaUploadStart?: (title: string, icon?: string) => void;
  onMediaUploadProgress?: (percent: number, loadedMB: string, totalMB: string) => void;
  onMediaUploadEnd?: () => void;
  className?: string;
}

export const BookSpread: React.FC<BookSpreadProps> = ({
  leftIndex,
  pages,
  activeSlot,
  isMobile = false,
  isFlipping = false,
  canPrev: propCanPrev,
  canNext: propCanNext,
  underLeftPage = null,
  underRightPage = null,
  viewportRef,
  flipLayerLeftRef,
  flipLayerRightRef,
  onActiveSlotChange,
  onPageContentChange,
  onTurnPrev,
  onTurnNext,
  onAddPage,
  onImageClick,
  onMediaUploadStart,
  onMediaUploadProgress,
  onMediaUploadEnd,
  className = '',
}) => {
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const leftPageData = pages[leftIndex] || null;
  const rightPageData = !isMobile ? pages[leftIndex + 1] || null : null;

  const canPrev = propCanPrev !== undefined ? propCanPrev : leftIndex > 0 && !isFlipping;
  const canNext =
    propCanNext !== undefined
      ? propCanNext
      : isMobile
      ? leftIndex + 1 < pages.length && !isFlipping
      : leftIndex + 2 < pages.length && !isFlipping;

  // Keyboard navigation (Left / Right arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      // If user is actively typing in an input, textarea, or contenteditable, don't hijack left/right arrows
      const isEditable =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.getAttribute('contenteditable') === 'true');

      if (isEditable) return;

      if (e.key === 'ArrowLeft' && canPrev) {
        e.preventDefault();
        onTurnPrev();
      } else if (e.key === 'ArrowRight' && canNext) {
        e.preventDefault();
        onTurnNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canPrev, canNext, onTurnPrev, onTurnNext]);

  // Touch swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    if (e.changedTouches.length === 1) {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartXRef.current;
      const deltaY = touchEndY - touchStartYRef.current;

      // Minimum 45px swipe with horizontal dominance (dx > dy * 1.3)
      if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
        if (deltaX < 0 && canNext) {
          onTurnNext();
        } else if (deltaX > 0 && canPrev) {
          onTurnPrev();
        }
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const { activeBook } = useVault();
  const dims = activeBook?.dimensions;
  const ratio = Number(dims?.aspectRatio) > 0 ? Number(dims?.aspectRatio) : 1.36;

  const customStyle: React.CSSProperties = useMemo(() => {
    if (isMobile) return {};
    return {
      ['--book-ratio' as any]: ratio,
      aspectRatio: `${ratio} / 1`,
      height: `min(calc(100dvh - 84px), calc((100vw - 32px) / ${ratio}))`,
      width: `min(calc(100vw - 32px), calc((100dvh - 84px) * ${ratio}))`,
      maxHeight: 'calc(100dvh - 78px)',
      maxWidth: 'min(98vw, calc(100vw - 24px))',
    };
  }, [ratio, isMobile]);

  return (
    <div
      id="book"
      className={`book ${isMobile ? 'book--single-page' : 'book--two-page'} ${isFlipping ? 'flipping' : ''} ${className}`}
      style={customStyle}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Leather Cover Backing Frame */}
      <div className="book-cover-backing" aria-hidden="true" />

      {/* Stacked Page Fore-Edges (Left and Right) */}
      <div className="page-stack-left" aria-hidden="true" />
      <div className="page-stack-right" aria-hidden="true" />

      <div id="pageViewport" ref={viewportRef} className="page-viewport">
        {/* Left page slot */}
        <PageSlot
          slot="left"
          pageData={leftPageData}
          underPageData={underLeftPage}
          isActive={activeSlot === 'left'}
          onFocus={() => onActiveSlotChange('left')}
          onContentChange={(html) => onPageContentChange(leftIndex, html)}
          onImageClick={onImageClick}
          onMediaUploadStart={onMediaUploadStart}
          onMediaUploadProgress={onMediaUploadProgress}
          onMediaUploadEnd={onMediaUploadEnd}
        />

        {/* Skeuomorphic center spine crease */}
        {!isMobile && <SpineCrease />}

        {/* Right page slot (desktop only) */}
        {!isMobile &&
          (rightPageData ? (
            <PageSlot
              slot="right"
              pageData={rightPageData}
              underPageData={underRightPage}
              isActive={activeSlot === 'right'}
              onFocus={() => onActiveSlotChange('right')}
              onContentChange={(html) => onPageContentChange(leftIndex + 1, html)}
              onImageClick={onImageClick}
              onMediaUploadStart={onMediaUploadStart}
              onMediaUploadProgress={onMediaUploadProgress}
              onMediaUploadEnd={onMediaUploadEnd}
            />
          ) : (
            <div id="slotRight" className="page-slot slot-right" data-slot="right">
              <EmptyPlaceholder onAddPage={onAddPage} />
            </div>
          ))}

        {/* Flip layers for CSS 3D fallback transitions */}
        <div id="flipLayerLeft" ref={flipLayerLeftRef} className="flip-layer pivot-right">
          <div className="flip-face front" />
          <div className="flip-face back" />
        </div>
        <div id="flipLayerRight" ref={flipLayerRightRef} className="flip-layer pivot-left">
          <div className="flip-face front" />
          <div className="flip-face back" />
        </div>
      </div>

      {/* Brass page turn navigation buttons */}
      <button
        type="button"
        id="prevBtn"
        className="page-turn left"
        disabled={!canPrev}
        onClick={onTurnPrev}
        title="Previous spread (‹)"
        aria-label="Previous spread"
      >
        ‹
      </button>

      <button
        type="button"
        id="nextBtn"
        className="page-turn right"
        disabled={!canNext}
        onClick={onTurnNext}
        title="Next spread (›)"
        aria-label="Next spread"
      >
        ›
      </button>
    </div>
  );
};

export default BookSpread;
