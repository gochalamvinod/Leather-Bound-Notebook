import html2canvas from 'html2canvas';
import type { SnapshotOptions } from '../../types/flip';

export const PAGE_BG = '#f4edde';
export const PAGE_PADDING = '60px 52px 40px';
export const PAGE_LINE_HEIGHT = '36px';
export const RULED_LINE_COLOR = 'rgba(44,36,22,0.12)';
export const DEFAULT_SNAPSHOT_TIMEOUT_MS = 1800;

let stagingEl: HTMLElement | null = null;

/**
 * Creates or retrieves a persistent hidden off-screen staging DOM container
 * for pre-rendering incoming pages before capturing them to canvas textures.
 */
export function getStagingEl(width: number, height: number): HTMLElement {
  if (typeof document === 'undefined') {
    // Return mock element in non-browser test environment if document is missing
    return {} as HTMLElement;
  }

  if (!stagingEl || !stagingEl.parentNode) {
    stagingEl = document.createElement('div');
    stagingEl.id = 'nb-staging-page';
    stagingEl.style.position = 'fixed';
    stagingEl.style.top = '0';
    stagingEl.style.left = '-99999px';
    stagingEl.style.overflow = 'hidden';
    stagingEl.style.boxSizing = 'border-box';
    stagingEl.style.background = PAGE_BG;
    stagingEl.style.padding = PAGE_PADDING;
    stagingEl.style.lineHeight = PAGE_LINE_HEIGHT;
    stagingEl.style.pointerEvents = 'none';
    stagingEl.style.zIndex = '-9999';
    document.body.appendChild(stagingEl);
  }

  stagingEl.style.width = `${Math.max(1, Math.round(width))}px`;
  stagingEl.style.height = `${Math.max(1, Math.round(height))}px`;
  return stagingEl;
}

/**
 * Removes or resets the off-screen staging container from the DOM.
 */
export function cleanupStagingEl(): void {
  if (stagingEl) {
    stagingEl.innerHTML = '';
    if (stagingEl.parentNode) {
      stagingEl.parentNode.removeChild(stagingEl);
    }
    stagingEl = null;
  }
}

/**
 * Generates a procedural parchment paper canvas fallback texture with realistic
 * skeuomorphic #f4edde paper color and 36px faint ruled notebook lines.
 */
export function paperFallbackCanvas(width: number, height: number): HTMLCanvasElement {
  if (typeof document === 'undefined') {
    return {} as HTMLCanvasElement;
  }

  const canvas = document.createElement('canvas');
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Background parchment fill
  ctx.fillStyle = PAGE_BG;
  ctx.fillRect(0, 0, w, h);

  // 36px faint ruled lines
  ctx.strokeStyle = RULED_LINE_COLOR;
  ctx.lineWidth = 1;
  for (let y = 36; y < h; y += 36) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(w, y + 0.5);
    ctx.stroke();
  }

  return canvas;
}

/**
 * Captures an on-screen or off-screen DOM element to an HTMLCanvasElement using html2canvas.
 * Protected with an 1800ms Promise.race timeout and AbortSignal support.
 * Returns null if capture times out, aborts, or errors.
 */
export async function safeSnapshot(
  element: HTMLElement | null | undefined,
  width: number,
  height: number,
  options?: Partial<SnapshotOptions>
): Promise<HTMLCanvasElement | null> {
  if (!element || width <= 0 || height <= 0) {
    return null;
  }

  if (options?.signal?.aborted) {
    return null;
  }

  const timeoutMs = DEFAULT_SNAPSHOT_TIMEOUT_MS;
  let timerId: ReturnType<typeof setTimeout> | undefined;
  let abortHandler: (() => void) | undefined;

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      timerId = setTimeout(() => {
        reject(new Error(`DOM Snapshot timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    const abortPromise = options?.signal
      ? new Promise<never>((_, reject) => {
          abortHandler = () => reject(new Error('DOM Snapshot aborted'));
          options.signal?.addEventListener('abort', abortHandler, { once: true });
        })
      : null;

    const renderPromise = (async (): Promise<HTMLCanvasElement> => {
      const renderFn = typeof html2canvas === 'function' ? html2canvas : (html2canvas as any)?.default;
      if (typeof renderFn !== 'function') {
        throw new Error('html2canvas library is not available');
      }

      const canvas = await renderFn(element, {
        backgroundColor: options?.backgroundColor || PAGE_BG,
        useCORS: options?.useCORS ?? true,
        scale: options?.scale ?? 1,
        logging: options?.logging ?? false,
        width: Math.max(1, Math.round(width)),
        height: Math.max(1, Math.round(height)),
      });

      return canvas;
    })();

    const raceList: Promise<HTMLCanvasElement>[] = [renderPromise, timeoutPromise];
    if (abortPromise) {
      raceList.push(abortPromise);
    }

    const result = await Promise.race(raceList);
    return result;
  } catch (err) {
    console.warn('[Snapshot] Snapshot capture fell back to procedural texture:', err);
    return null;
  } finally {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    if (abortHandler && options?.signal) {
      options.signal.removeEventListener('abort', abortHandler);
    }
  }
}

/**
 * Captures a live DOM element to a canvas, immediately returning a procedural parchment fallback
 * if snapshotting fails or times out.
 */
export async function snapshotPage(
  element: HTMLElement | null | undefined,
  width: number,
  height: number,
  options?: Partial<SnapshotOptions>
): Promise<HTMLCanvasElement> {
  const canvas = await safeSnapshot(element, width, height, options);
  if (canvas) {
    return canvas;
  }
  return paperFallbackCanvas(width, height);
}

/**
 * Renders arbitrary HTML string content into the off-screen staging element, settles layout
 * across animation frames, snapshots to canvas, and returns the result with fallback.
 */
export async function snapshotOffscreenHtml(
  html: string,
  font?: string,
  fontSize?: string,
  width: number = 400,
  height: number = 600,
  options?: Partial<SnapshotOptions>
): Promise<HTMLCanvasElement> {
  const stage = getStagingEl(width, height);
  stage.style.fontFamily = font || 'Georgia, serif';
  stage.style.fontSize = fontSize || '18px';
  stage.innerHTML = html || '';

  // Give layout 2 frames to settle fonts and images
  await settleLayoutFrames(options?.signal);

  if (options?.signal?.aborted) {
    stage.innerHTML = '';
    return paperFallbackCanvas(width, height);
  }

  const canvas = await safeSnapshot(stage, width, height, options);
  stage.innerHTML = '';

  return canvas || paperFallbackCanvas(width, height);
}

/**
 * Captures both the front page (from live DOM element) and back page (from offscreen staging HTML)
 * concurrently, guaranteed to return valid HTMLCanvasElements via fallback.
 */
export async function captureSpreadPages(params: {
  frontEl?: HTMLElement | null;
  backHTML?: string;
  backFont?: string;
  backFontSize?: string;
  width: number;
  height: number;
  signal?: AbortSignal;
}): Promise<{ frontCanvas: HTMLCanvasElement; backCanvas: HTMLCanvasElement }> {
  const { frontEl, backHTML, backFont, backFontSize, width, height, signal } = params;

  const [frontCanvas, backCanvas] = await Promise.all([
    snapshotPage(frontEl, width, height, { signal }),
    snapshotOffscreenHtml(backHTML || '', backFont, backFontSize, width, height, { signal }),
  ]);

  return { frontCanvas, backCanvas };
}

/**
 * Waits for 2 requestAnimationFrame cycles so DOM mutations and fonts settle before capture.
 */
function settleLayoutFrames(signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal?.aborted) {
      resolve();
      return;
    }

    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => {
        if (signal?.aborted) {
          resolve();
          return;
        }
        requestAnimationFrame(() => resolve());
      });
    } else {
      setTimeout(resolve, 16);
    }
  });
}
