import React, { useState, useEffect, useCallback } from 'react';
import { useVault } from '../../context/VaultContext';
import { useEditor } from '../../context/EditorContext';
import { PageData } from '../../types/notebook';
import { DEFAULT_FONT, DEFAULT_FONT_SIZE } from '../../lib/editor/richText';
import { usePageFlip } from '../../hooks/usePageFlip';
import { TierConfig } from '../../lib/tiers';
import BookSpread from './BookSpread';
import PageControls from './PageControls';

export interface BookRoomProps {
  activeFont?: string;
  activeFontSize?: string;
  tierConfig?: TierConfig;
  onPageLimitReached?: () => void;
  onActiveSlotPageChange?: (page: PageData | null) => void;
  onImageClick?: (img: HTMLElement) => void;
  onMediaUploadStart?: (title: string, icon?: string) => void;
  onMediaUploadProgress?: (percent: number, loadedMB: string, totalMB: string) => void;
  onMediaUploadEnd?: () => void;
  className?: string;
}

export const BookRoom: React.FC<BookRoomProps> = ({
  activeFont,
  activeFontSize,
  tierConfig,
  onPageLimitReached,
  onActiveSlotPageChange,
  onImageClick,
  onMediaUploadStart,
  onMediaUploadProgress,
  onMediaUploadEnd,
  className = '',
}) => {
  const { activeBook, updateActiveBook } = useVault();
  const { scheduleAutosave } = useEditor();

  const [leftIndex, setLeftIndex] = useState<number>(0);
  const [activeSlot, setActiveSlot] = useState<'left' | 'right'>('left');
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 900;
  });

  // Track window resize & orientation for responsive layout (<= 900px single page view)
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 900;
      setIsMobile(mobile);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Update dynamic document.body data-cover attribute when coverColor changes
  useEffect(() => {
    const coverTheme = activeBook?.coverColor || 'brown';
    document.body.dataset.cover = coverTheme;
  }, [activeBook?.coverColor]);

  const pages: PageData[] = activeBook?.pages || [
    { id: 'p-default-1', font: DEFAULT_FONT, fontSize: DEFAULT_FONT_SIZE, html: '' },
  ];

  // Keep leftIndex within valid bounds when pages change
  useEffect(() => {
    if (leftIndex >= pages.length) {
      if (isMobile) {
        setLeftIndex(Math.max(0, pages.length - 1));
      } else {
        let validLeft = leftIndex;
        while (validLeft > 0 && validLeft >= pages.length) {
          validLeft -= 2;
        }
        setLeftIndex(Math.max(0, validLeft));
      }
    }
  }, [pages.length, leftIndex, isMobile]);

  // Report active page changes to parent for toolbar sync
  useEffect(() => {
    const targetIdx = isMobile || activeSlot === 'left' ? leftIndex : leftIndex + 1;
    const activePage = pages[targetIdx] || pages[leftIndex] || null;
    onActiveSlotPageChange?.(activePage);
  }, [leftIndex, activeSlot, pages, isMobile, onActiveSlotPageChange]);

  const handleActiveSlotChange = useCallback((slot: 'left' | 'right') => {
    setActiveSlot(slot);
  }, []);

  // Mount 3D WebGL page flip engine & fallback hook
  const {
    isFlipping,
    canPrev,
    canNext,
    turnNext,
    turnPrev,
    flip,
    underLeftPage,
    underRightPage,
  } = usePageFlip({
    pages,
    leftIndex,
    setLeftIndex,
    activeSlot,
    setActiveSlot,
    isMobile,
  });

  const handlePageContentChange = useCallback(
    (pageIndex: number, html: string) => {
      if (!activeBook) return;
      const updatedPages = [...pages];
      if (updatedPages[pageIndex]) {
        updatedPages[pageIndex] = {
          ...updatedPages[pageIndex],
          html,
          updatedAt: new Date().toISOString(),
        };
        const updatedBook = {
          ...activeBook,
          pages: updatedPages,
          updatedAt: new Date().toISOString(),
        };
        updateActiveBook(() => updatedBook);
        scheduleAutosave(updatedBook);
      }
    },
    [activeBook, pages, updateActiveBook, scheduleAutosave]
  );

  const handleAddPage = useCallback(async () => {
    if (!activeBook || isFlipping) return;

    if (tierConfig && pages.length >= tierConfig.maxPagesPerBook) {
      if (onPageLimitReached) {
        onPageLimitReached();
      }
      return;
    }

    const basePage = pages[leftIndex] || pages[pages.length - 1] || {
      font: DEFAULT_FONT,
      fontSize: DEFAULT_FONT_SIZE,
    };

    const newPage: PageData = {
      id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      font: activeFont || basePage.font || DEFAULT_FONT,
      fontSize: activeFontSize || basePage.fontSize || DEFAULT_FONT_SIZE,
      html: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedPages = [...pages];

    if (isMobile) {
      updatedPages.splice(leftIndex + 1, 0, newPage);
      const updatedBook = {
        ...activeBook,
        pages: updatedPages,
        updatedAt: new Date().toISOString(),
      };
      updateActiveBook(() => updatedBook);
      setLeftIndex(leftIndex + 1);
      setActiveSlot('left');
      scheduleAutosave(updatedBook);
      return;
    }

    if (!pages[leftIndex + 1]) {
      // Right slot of current spread is empty — fill it without flipping
      updatedPages.splice(leftIndex + 1, 0, newPage);
      const updatedBook = {
        ...activeBook,
        pages: updatedPages,
        updatedAt: new Date().toISOString(),
      };
      updateActiveBook(() => updatedBook);
      setActiveSlot('right');
      scheduleAutosave(updatedBook);
    } else {
      // Insert a fresh spread after current spread and trigger flip animation
      updatedPages.splice(leftIndex + 2, 0, newPage);
      const updatedBook = {
        ...activeBook,
        pages: updatedPages,
        updatedAt: new Date().toISOString(),
      };
      updateActiveBook(() => updatedBook);
      scheduleAutosave(updatedBook);
      await flip('next');
      setActiveSlot('left');
    }
  }, [activeBook, isFlipping, pages, leftIndex, isMobile, activeFont, activeFontSize, updateActiveBook, scheduleAutosave, flip]);

  const handleDeletePage = useCallback(() => {
    if (!activeBook || pages.length <= 1 || isFlipping) return;

    const targetIdx = isMobile
      ? leftIndex
      : activeSlot === 'right' && pages[leftIndex + 1]
      ? leftIndex + 1
      : leftIndex;

    const updatedPages = [...pages];
    updatedPages.splice(targetIdx, 1);

    let newLeftIndex = leftIndex;
    if (isMobile) {
      newLeftIndex = Math.min(newLeftIndex, updatedPages.length - 1);
      newLeftIndex = Math.max(0, newLeftIndex);
    } else {
      while (newLeftIndex > 0 && newLeftIndex >= updatedPages.length) {
        newLeftIndex -= 2;
      }
      newLeftIndex = Math.max(0, newLeftIndex);
    }

    const updatedBook = {
      ...activeBook,
      pages: updatedPages,
      updatedAt: new Date().toISOString(),
    };

    updateActiveBook(() => updatedBook);
    setLeftIndex(newLeftIndex);
    scheduleAutosave(updatedBook);
  }, [activeBook, pages, leftIndex, activeSlot, isMobile, isFlipping, updateActiveBook, scheduleAutosave]);

  const handleImageClick = useCallback(
    (img: HTMLElement) => {
      onImageClick?.(img);
    },
    [onImageClick]
  );

  return (
    <main className={`book-room ${className}`}>
      <BookSpread
        leftIndex={leftIndex}
        pages={pages}
        activeSlot={activeSlot}
        isMobile={isMobile}
        isFlipping={isFlipping}
        canPrev={canPrev}
        canNext={canNext}
        underLeftPage={underLeftPage}
        underRightPage={underRightPage}
        onActiveSlotChange={handleActiveSlotChange}
        onPageContentChange={handlePageContentChange}
        onTurnPrev={turnPrev}
        onTurnNext={turnNext}
        onAddPage={handleAddPage}
        onImageClick={handleImageClick}
        onMediaUploadStart={onMediaUploadStart}
        onMediaUploadProgress={onMediaUploadProgress}
        onMediaUploadEnd={onMediaUploadEnd}
      />

      <PageControls
        leftIndex={leftIndex}
        totalPages={pages.length}
        isMobile={isMobile}
        isFlipping={isFlipping}
        onAddPage={handleAddPage}
        onDeletePage={handleDeletePage}
      />
    </main>
  );
};

export default BookRoom;
