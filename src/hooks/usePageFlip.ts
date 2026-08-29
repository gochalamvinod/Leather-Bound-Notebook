import { useState, useRef, useCallback, useEffect } from 'react';
import type { FlipDirection, PlayFlipParams } from '../types/flip';
import type { PageData } from '../types/notebook';
import { DEFAULT_FONT, DEFAULT_FONT_SIZE } from '../lib/editor/richText';

export interface UsePageFlipOptions {
  pages: PageData[];
  leftIndex: number;
  setLeftIndex?: (index: number | ((prev: number) => number)) => void;
  onLeftIndexChange?: (index: number) => void;
  activeSlot?: 'left' | 'right';
  setActiveSlot?: (slot: 'left' | 'right') => void;
  onActiveSlotChange?: (slot: 'left' | 'right') => void;
  isMobile?: boolean;
  onFlipStart?: (direction: FlipDirection) => void;
  onFlipComplete?: (direction: FlipDirection, newLeftIndex: number) => void;
}

export interface UsePageFlipReturn {
  isFlipping: boolean;
  flipDirection: FlipDirection | null;
  underLeftPage: PageData | null;
  underRightPage: PageData | null;
  turnNext: () => Promise<boolean>;
  turnPrev: () => Promise<boolean>;
  flip: (direction: FlipDirection) => Promise<boolean>;
  canPrev: boolean;
  canNext: boolean;
  cssFlip: (
    direction: FlipDirection,
    flippingSlot: 'left' | 'right',
    frontHTML: string,
    frontData?: PageData | null,
    backData?: PageData | null
  ) => Promise<void>;
  viewportRef: React.RefObject<HTMLDivElement | null>;
  bookSpreadRef: React.RefObject<HTMLDivElement | null>;
  flipLayerLeftRef: React.RefObject<HTMLDivElement | null>;
  flipLayerRightRef: React.RefObject<HTMLDivElement | null>;
  underLeftRef: React.RefObject<HTMLDivElement | null>;
  underRightRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Helper to detect WebGL rendering context support in current browser.
 */
export function isWebglAvailable(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

/**
 * Safely applies typography styles (fontFamily, fontSize) to a DOM page container.
 */
function applyPageStyle(el: HTMLElement, page?: Partial<PageData> | null): void {
  if (!el) return;
  el.style.fontFamily = page?.font || DEFAULT_FONT;
  el.style.fontSize = page?.fontSize || DEFAULT_FONT_SIZE;
}

/**
 * usePageFlip — React hook orchestrating realistic 3D WebGL page curl transitions,
 * robust CSS 3D fallback rotation (`preserve-3d`, `rotateY(±179.9deg)`), and mobile slide-fade.
 */
export function usePageFlip({
  pages,
  leftIndex,
  setLeftIndex,
  onLeftIndexChange,
  activeSlot: _activeSlot,
  setActiveSlot,
  onActiveSlotChange,
  isMobile = false,
  onFlipStart,
  onFlipComplete,
}: UsePageFlipOptions): UsePageFlipReturn {
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [flipDirection, setFlipDirection] = useState<FlipDirection | null>(null);
  const [underLeftPage, setUnderLeftPage] = useState<PageData | null>(null);
  const [underRightPage, setUnderRightPage] = useState<PageData | null>(null);

  const viewportRef = useRef<HTMLDivElement>(null!);
  const bookSpreadRef = useRef<HTMLDivElement>(null!);
  const flipLayerLeftRef = useRef<HTMLDivElement>(null!);
  const flipLayerRightRef = useRef<HTMLDivElement>(null!);
  const underLeftRef = useRef<HTMLDivElement>(null!);
  const underRightRef = useRef<HTMLDivElement>(null!);

  const isMountedRef = useRef<boolean>(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const flip3dModuleRef = useRef<{
    isWebglAvailable?: () => boolean;
    playFlip?: (params: PlayFlipParams) => Promise<void>;
  } | null>(null);

  const updateLeftIndex = useCallback(
    (newIndex: number | ((prev: number) => number)) => {
      if (setLeftIndex) {
        setLeftIndex(newIndex);
      }
      if (onLeftIndexChange && typeof newIndex === 'number') {
        onLeftIndexChange(newIndex);
      }
    },
    [setLeftIndex, onLeftIndexChange]
  );

  const updateActiveSlot = useCallback(
    (slot: 'left' | 'right') => {
      if (setActiveSlot) {
        setActiveSlot(slot);
      }
      if (onActiveSlotChange) {
        onActiveSlotChange(slot);
      }
    },
    [setActiveSlot, onActiveSlotChange]
  );

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        try {
          abortControllerRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const canPrev = leftIndex > 0 && !isFlipping;
  const canNext = isMobile
    ? leftIndex + 1 < pages.length && !isFlipping
    : leftIndex + 2 < pages.length && !isFlipping;

  /**
   * Lazily loads the Three.js 3D WebGL flip engine.
   */
  const loadFlip3d = useCallback(async () => {
    if (flip3dModuleRef.current) {
      return flip3dModuleRef.current;
    }
    try {
      const mod = await import('../lib/flip3d/flipEngine');
      flip3dModuleRef.current = mod;
      return mod;
    } catch {
      try {
        const legacyMod = await import('../../public/flip3d.js' as any);
        flip3dModuleRef.current = legacyMod;
        return legacyMod;
      } catch (err) {
        console.warn('[usePageFlip] WebGL 3D flip engine unavailable, using CSS 3D fallback.', err);
        return null;
      }
    }
  }, []);

  /**
   * Pure CSS 3D Fallback turn: executes dual-faced .flip-layer rotation (860ms cubic-bezier).
   */
  const cssFlip = useCallback(
    async (
      direction: FlipDirection,
      flippingSlot: 'left' | 'right',
      frontHTML: string,
      frontData?: PageData | null,
      backData?: PageData | null
    ): Promise<void> => {
      const bookEl = bookSpreadRef.current || document.getElementById('book');
      const refLayer = flippingSlot === 'right' ? flipLayerRightRef.current : flipLayerLeftRef.current;
      const layerId = flippingSlot === 'right' ? 'flipLayerRight' : 'flipLayerLeft';
      let layer: HTMLElement | null = refLayer || document.getElementById(layerId);

      if (!layer) {
        const slotEl = document.getElementById(flippingSlot === 'right' ? 'slotRight' : 'slotLeft');
        layer = (slotEl?.querySelector('.flip-layer') as HTMLElement | null) || null;
      }

      if (!layer) {
        await new Promise((resolve) => setTimeout(resolve, 860));
        return;
      }

      const front = layer.querySelector('.flip-face.front') as HTMLElement | null;
      const back = layer.querySelector('.flip-face.back') as HTMLElement | null;

      if (front) {
        front.innerHTML = frontHTML;
        applyPageStyle(front, frontData);
      }

      if (back) {
        back.innerHTML = backData?.html || '';
        applyPageStyle(back, backData);
      }

      if (bookEl) {
        bookEl.classList.add('flipping');
      }

      layer.style.display = 'block';
      layer.classList.remove('flipping-next', 'flipping-prev');
      void layer.offsetWidth; // Force reflow

      const flipClass = direction === 'next' ? 'flipping-next' : 'flipping-prev';
      layer.classList.add(flipClass);

      await new Promise<void>((resolve) => {
        let finished = false;
        const done = () => {
          if (finished) return;
          finished = true;
          layer?.removeEventListener('transitionend', onEnd);
          if (timer) clearTimeout(timer);
          if (layer) {
            layer.style.display = 'none';
            layer.classList.remove('flipping-next', 'flipping-prev');
          }
          if (bookEl) {
            bookEl.classList.remove('flipping');
          }
          resolve();
        };

        const onEnd = (e: TransitionEvent) => {
          if (e.target === layer) {
            done();
          }
        };

        layer?.addEventListener('transitionend', onEnd as EventListener);
        const timer = setTimeout(done, 920);
      });
    },
    []
  );

  /**
   * Single-page slide-fade transition for narrow/portrait viewports (<= 900px).
   */
  const mobileFlip = useCallback(
    async (direction: FlipDirection, targetLeft: number): Promise<void> => {
      const bookEl = bookSpreadRef.current || document.getElementById('book');
      const leftPageEl = document.getElementById('leftPage');

      if (bookEl) bookEl.classList.add('flipping');

      if (leftPageEl) {
        leftPageEl.style.transition = 'opacity 0.16s ease, transform 0.16s ease';
        leftPageEl.style.opacity = '0.3';
        leftPageEl.style.transform = direction === 'next' ? 'translateX(-12px)' : 'translateX(12px)';
      }

      await new Promise((r) => setTimeout(r, 160));

      if (!isMountedRef.current) return;

      updateLeftIndex(targetLeft);
      updateActiveSlot('left');

      if (leftPageEl) {
        leftPageEl.style.transition = 'none';
        leftPageEl.style.transform = direction === 'next' ? 'translateX(12px)' : 'translateX(-12px)';
        void leftPageEl.offsetWidth; // Force reflow
        leftPageEl.style.transition = 'opacity 0.16s ease, transform 0.16s ease';
        leftPageEl.style.opacity = '1';
        leftPageEl.style.transform = 'translateX(0)';
      }

      await new Promise((r) => setTimeout(r, 160));

      if (leftPageEl) {
        leftPageEl.style.transition = '';
        leftPageEl.style.transform = '';
        leftPageEl.style.opacity = '';
      }

      if (bookEl) bookEl.classList.remove('flipping');
    },
    [updateLeftIndex, updateActiveSlot]
  );

  /**
   * Main page turn coordinator: executes WebGL 3D flip with graceful CSS 3D fallback.
   */
  const flip = useCallback(
    async (direction: FlipDirection): Promise<boolean> => {
      if (isFlipping) return false;

      const step = isMobile ? 1 : 2;
      const targetLeft = direction === 'next' ? leftIndex + step : leftIndex - step;

      if (direction === 'next' && targetLeft >= pages.length) return false;
      if (direction === 'prev' && targetLeft < 0) return false;

      setIsFlipping(true);
      setFlipDirection(direction);
      onFlipStart?.(direction);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        if (isMobile) {
          await mobileFlip(direction, targetLeft);
          if (isMountedRef.current) {
            onFlipComplete?.(direction, targetLeft);
          }
          return true;
        }

        const flippingSlot: 'left' | 'right' = direction === 'next' ? 'right' : 'left';
        const frontEl = document.getElementById(flippingSlot === 'right' ? 'rightPage' : 'leftPage');
        const frontData = flippingSlot === 'right' ? pages[leftIndex + 1] : pages[leftIndex];
        const backIndex = direction === 'next' ? targetLeft : targetLeft + 1;
        const backData = pages[backIndex] || null;
        const underIndex = direction === 'next' ? targetLeft + 1 : targetLeft;
        const underData = pages[underIndex] || null;

        if (flippingSlot === 'right') {
          setUnderRightPage(underData);
        } else {
          setUnderLeftPage(underData);
        }

        const pageViewportEl = viewportRef.current || document.getElementById('pageViewport');
        const bookRect = pageViewportEl?.getBoundingClientRect();

        let usedWebgl = false;

        if (isWebglAvailable() && bookRect && frontEl) {
          try {
            const engineMod = await loadFlip3d();
            if (engineMod && typeof engineMod.playFlip === 'function') {
              await engineMod.playFlip({
                direction,
                bookRect,
                frontEl,
                backHTML: backData?.html || '',
                backFont: backData?.font || frontData?.font || DEFAULT_FONT,
                backFontSize: backData?.fontSize || frontData?.fontSize || DEFAULT_FONT_SIZE,
                signal: controller.signal,
              });
              usedWebgl = true;
            }
          } catch (webglErr) {
            console.warn('[usePageFlip] 3D WebGL flip failed, falling back to CSS 3D rotation:', webglErr);
          }
        }

        if (!usedWebgl && isMountedRef.current) {
          const frontHtml = frontEl?.innerHTML || frontData?.html || '';
          await cssFlip(direction, flippingSlot, frontHtml, frontData, backData);
        }

        if (isMountedRef.current) {
          updateLeftIndex(targetLeft);
          const nextActiveSlot = direction === 'next' ? 'left' : 'right';
          updateActiveSlot(nextActiveSlot);
          onFlipComplete?.(direction, targetLeft);
        }

        return true;
      } finally {
        if (isMountedRef.current) {
          setIsFlipping(false);
          setFlipDirection(null);
          setUnderLeftPage(null);
          setUnderRightPage(null);
        }
        abortControllerRef.current = null;
      }
    },
    [
      isFlipping,
      isMobile,
      leftIndex,
      pages,
      onFlipStart,
      onFlipComplete,
      mobileFlip,
      loadFlip3d,
      cssFlip,
      updateLeftIndex,
      updateActiveSlot,
    ]
  );

  const turnNext = useCallback(() => flip('next'), [flip]);
  const turnPrev = useCallback(() => flip('prev'), [flip]);

  return {
    isFlipping,
    flipDirection,
    underLeftPage,
    underRightPage,
    turnNext,
    turnPrev,
    flip,
    canPrev,
    canNext,
    cssFlip,
    viewportRef,
    bookSpreadRef,
    flipLayerLeftRef,
    flipLayerRightRef,
    underLeftRef,
    underRightRef,
  };
}

export default usePageFlip;
