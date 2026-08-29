/**
 * Image Resizer & Media Upload Engine
 * 
 * Provides:
 * - 8-handle circular resize calculation with aspect ratio maintenance & 40px min constraint
 * - Ghost drag-to-move repositioning DOM logic
 * - Client-side canvas downscaling (max dimension 1100px, JPEG 0.85)
 * - Raw binary streaming upload for media up to 1GB with progress tracking
 */

import { api } from '../api/client';

export type HandleDirection = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export interface HandleConfig {
  cls: HandleDirection;
  cursor: string;
  dx: number; // -1 = left, 0 = none, 1 = right
  dy: number; // -1 = top, 0 = none, 1 = bottom
  isCorner: boolean;
}

export const RESIZE_HANDLES: HandleConfig[] = [
  { cls: 'nw', cursor: 'nw-resize', dx: -1, dy: -1, isCorner: true },
  { cls: 'n',  cursor: 'n-resize',  dx:  0, dy: -1, isCorner: false },
  { cls: 'ne', cursor: 'ne-resize', dx:  1, dy: -1, isCorner: true },
  { cls: 'w',  cursor: 'w-resize',  dx: -1, dy:  0, isCorner: false },
  { cls: 'e',  cursor: 'e-resize',  dx:  1, dy:  0, isCorner: false },
  { cls: 'sw', cursor: 'sw-resize', dx: -1, dy:  1, isCorner: true },
  { cls: 's',  cursor: 's-resize',  dx:  0, dy:  1, isCorner: false },
  { cls: 'se', cursor: 'se-resize', dx:  1, dy:  1, isCorner: true },
];

export interface ResizeOptions {
  startWidth: number;
  startHeight: number;
  deltaX: number;
  deltaY: number;
  handle: HandleConfig;
  minSize?: number;
  maxWidth?: number;
  maxHeight?: number;
  maintainAspectRatio?: boolean;
  originalAspectRatio?: number;
}

export interface ResizeResult {
  width: number;
  height: number;
}

/**
 * Calculate the new width and height during an active handle drag.
 * Enforces minimum size (default 40px), clamps to container maxWidth/maxHeight,
 * and maintains single-dimension for edge handles while preserving ratio for corner handles.
 */
export function calculateResize({
  startWidth,
  startHeight,
  deltaX,
  deltaY,
  handle,
  minSize = 40,
  maxWidth,
  maxHeight,
  maintainAspectRatio = false,
  originalAspectRatio,
}: ResizeOptions): ResizeResult {
  const ratio = originalAspectRatio || (startHeight > 0 ? startWidth / startHeight : 1);
  const minW = minSize;
  const minH = minSize;

  let newWidth = startWidth;
  let newHeight = startHeight;

  // Corner Handles (nw, ne, se, sw)
  if (handle.isCorner) {
    // Project deltas along handle directions
    const candidateW = startWidth + handle.dx * deltaX;
    const candidateH = startHeight + handle.dy * deltaY;

    if (maintainAspectRatio && ratio > 0) {
      // Use the dominant movement direction to determine scale
      const scaleW = candidateW / startWidth;
      const scaleH = candidateH / startHeight;
      const scale = Math.abs(deltaX) >= Math.abs(deltaY) ? scaleW : scaleH;

      let w = Math.round(startWidth * scale);
      if (maxWidth && w > maxWidth) w = maxWidth;
      if (w < minW) w = minW;

      let h = Math.round(w / ratio);
      if (maxHeight && h > maxHeight) {
        h = maxHeight;
        w = Math.round(h * ratio);
      }
      if (h < minH) {
        h = minH;
        w = Math.round(h * ratio);
      }

      newWidth = w;
      newHeight = h;
    } else {
      let w = candidateW;
      let h = candidateH;
      if (maxWidth) w = Math.min(maxWidth, w);
      if (maxHeight) h = Math.min(maxHeight, h);
      newWidth = Math.max(minW, Math.round(w));
      newHeight = Math.max(minH, Math.round(h));
    }
    return { width: Math.round(newWidth), height: Math.round(newHeight) };
  }

  // Pure horizontal handles (e, w)
  if (handle.dx !== 0 && handle.dy === 0) {
    let rawW = startWidth + handle.dx * deltaX;
    if (maxWidth) rawW = Math.min(maxWidth, rawW);
    rawW = Math.max(minW, Math.round(rawW));

    if (maintainAspectRatio && ratio > 0) {
      let h = Math.round(rawW / ratio);
      if (maxHeight && h > maxHeight) {
        h = maxHeight;
        rawW = Math.round(h * ratio);
      }
      if (h < minH) {
        h = minH;
        rawW = Math.round(h * ratio);
      }
      newWidth = rawW;
      newHeight = h;
    } else {
      newWidth = rawW;
      newHeight = startHeight;
    }
    return { width: Math.round(newWidth), height: Math.round(newHeight) };
  }

  // Pure vertical handles (n, s)
  if (handle.dy !== 0 && handle.dx === 0) {
    let rawH = startHeight + handle.dy * deltaY;
    if (maxHeight) rawH = Math.min(maxHeight, rawH);
    rawH = Math.max(minH, Math.round(rawH));

    if (maintainAspectRatio && ratio > 0) {
      let w = Math.round(rawH * ratio);
      if (maxWidth && w > maxWidth) {
        w = maxWidth;
        rawH = Math.round(w / ratio);
      }
      if (w < minW) {
        w = minW;
        rawH = Math.round(w / ratio);
      }
      newHeight = rawH;
      newWidth = w;
    } else {
      newHeight = rawH;
      newWidth = startWidth;
    }
    return { width: Math.round(newWidth), height: Math.round(rawH) };
  }

  return { width: Math.round(newWidth), height: Math.round(newHeight) };
}

export interface OverlayBounds {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Get absolute page coordinates (including scroll offsets) for placing the overlay.
 */
export function getOverlayBounds(element: HTMLElement): OverlayBounds {
  const r = element.getBoundingClientRect();
  const scrollX = typeof window !== 'undefined' ? window.scrollX : 0;
  const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;

  return {
    left: Math.round(r.left + scrollX),
    top: Math.round(r.top + scrollY),
    width: Math.round(r.width),
    height: Math.round(r.height),
  };
}

export interface DropTargetResult {
  targetElement: HTMLElement;
  position: 'before' | 'after';
}

/**
 * Identify drop target element inside the editable container at pointer coordinates.
 * NEVER returns container itself, and prevents document ejection outside the editable page.
 */
export function calculateDropTarget(
  clientX: number,
  clientY: number,
  container: HTMLElement,
  currentElement: HTMLElement
): DropTargetResult | null {
  if (typeof document === 'undefined' || !container) return null;

  // Get all direct child elements of container excluding helper overlays & current element
  const directChildren = Array.from(container.children).filter(
    (c): c is HTMLElement =>
      c instanceof HTMLElement &&
      c !== currentElement &&
      !c.classList.contains('nb-drop-indicator-line') &&
      !c.classList.contains('img-overlay') &&
      !c.classList.contains('nb-unified-media-overlay')
  );

  if (directChildren.length === 0) {
    return null;
  }

  // Check element at pointer coordinates
  const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null;

  if (el && el !== container && container.contains(el) && el !== currentElement) {
    // Find the direct child block inside container
    let blockEl: HTMLElement | null = el;
    while (blockEl && blockEl.parentElement && blockEl.parentElement !== container) {
      blockEl = blockEl.parentElement;
    }

    if (blockEl && blockEl !== currentElement && blockEl.parentElement === container && blockEl !== container) {
      const elRect = blockEl.getBoundingClientRect();
      const midY = elRect.top + elRect.height / 2;
      return {
        targetElement: blockEl,
        position: clientY < midY ? 'before' : 'after',
      };
    }
  }

  // Fallback to vertical proximity across all direct child blocks
  if (clientY <= directChildren[0].getBoundingClientRect().top + 10) {
    return { targetElement: directChildren[0], position: 'before' };
  }

  if (clientY >= directChildren[directChildren.length - 1].getBoundingClientRect().bottom - 10) {
    return { targetElement: directChildren[directChildren.length - 1], position: 'after' };
  }

  let bestChild: HTMLElement = directChildren[0];
  let bestDist = Infinity;

  for (const child of directChildren) {
    const r = child.getBoundingClientRect();
    const mid = r.top + r.height / 2;
    const dist = Math.abs(clientY - mid);
    if (dist < bestDist) {
      bestDist = dist;
      bestChild = child;
    }
  }

  const bestRect = bestChild.getBoundingClientRect();
  const bestMid = bestRect.top + bestRect.height / 2;

  return {
    targetElement: bestChild,
    position: clientY < bestMid ? 'before' : 'after',
  };
}

/**
 * Reposition an element in the DOM relative to a target element.
 */
export function repositionElementInDom(
  currentElement: HTMLElement,
  targetElement: HTMLElement,
  position: 'before' | 'after'
): boolean {
  try {
    if (!currentElement || !targetElement || currentElement === targetElement) return false;
    // Guard against container / root element insertion that would eject element
    if (
      targetElement.classList.contains('page') ||
      targetElement.classList.contains('page-slot') ||
      targetElement.tagName === 'BODY' ||
      targetElement.tagName === 'HTML'
    ) {
      return false;
    }
    if (position === 'before') {
      targetElement.parentElement?.insertBefore(currentElement, targetElement);
    } else {
      targetElement.after(currentElement);
    }
    return true;
  } catch (e) {
    console.warn('repositionElementInDom failed:', e);
    return false;
  }
}

/**
 * Downscale an image client-side onto an HTML Canvas.
 * Max dimension defaults to 1100px, JPEG quality 0.85.
 */
export function resizeToDataUrl(
  file: File | Blob,
  maxDim: number = 1100,
  quality: number = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Window environment required for canvas downscaling'));
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;

        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, w);
        canvas.height = Math.max(1, h);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Canvas 2D context creation failed'));
        }

        ctx.drawImage(img, 0, 0, w, h);
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image for downscaling'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Resize standard images client-side, then POST to /api/images.
 * Returns the server URL like "/images/abc123.jpg".
 */
export async function uploadImageFile(
  file: File,
  maxDim: number = 1100,
  quality: number = 0.85
): Promise<string> {
  const dataUrl = await resizeToDataUrl(file, maxDim, quality);
  const extMatch = file.type ? file.type.match(/image\/([a-z0-9+]+)/i) : null;
  const ext = extMatch ? extMatch[1].replace('jpeg', 'jpg') : 'jpg';

  const res = await api.uploadImageBase64(dataUrl, ext);
  if (!res.ok || !res.url) {
    throw new Error('Image upload failed');
  }
  return res.url;
}

export interface StreamingUploadProgressCallback {
  (percent: number, loadedMB: string, totalMB: string): void;
}

export interface MediaUploadResult {
  ok: boolean;
  url: string;
  mediaUrl?: string;
  imageUrl?: string;
  filename: string;
  size: number;
  isVideo?: boolean;
  isAudio?: boolean;
  ext?: string;
  encrypted?: boolean;
  hlsPlaylistUrl?: string;
  hlsMasterUrl?: string;
  posterUrl?: string;
}

/**
 * Client-side fast video poster extractor.
 * Captures the initial frame to canvas and returns a base64 JPEG thumbnail
 * so the video element displays cleanly without a black box.
 */
export function extractVideoPoster(file: File): Promise<string> {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith('video/')) {
      return resolve('');
    }
    try {
      const blobUrl = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      video.src = blobUrl;

      let resolved = false;
      const cleanup = () => {
        if (!resolved) {
          resolved = true;
          URL.revokeObjectURL(blobUrl);
        }
      };

      const timer = setTimeout(() => {
        cleanup();
        resolve('');
      }, 3000);

      video.onloadeddata = () => {
        try {
          video.currentTime = Math.min(0.1, (video.duration || 0.2) / 2);
        } catch {
          // fallback to immediate render
        }
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = Math.min(video.videoWidth || 640, 800);
          canvas.height = Math.min(video.videoHeight || 360, 450);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const poster = canvas.toDataURL('image/jpeg', 0.82);
            clearTimeout(timer);
            cleanup();
            return resolve(poster);
          }
        } catch {}
        clearTimeout(timer);
        cleanup();
        resolve('');
      };

      video.onerror = () => {
        clearTimeout(timer);
        cleanup();
        resolve('');
      };
    } catch {
      resolve('');
    }
  });
}

/**
 * Raw binary streaming upload for files up to 1GB to /api/media/upload.
 * Provides real-time progress callbacks.
 */
export function uploadLargeMediaFile(
  file: File,
  onProgress?: StreamingUploadProgressCallback
): Promise<MediaUploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/media/upload', true);
    xhr.withCredentials = true;

    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.setRequestHeader('X-File-Name', encodeURIComponent(file.name || 'media'));

    const extMatch = file.name ? file.name.match(/\.([a-z0-9]+)$/i) : null;
    const ext = extMatch
      ? extMatch[1].toLowerCase()
      : file.type.includes('video')
      ? 'mp4'
      : file.type.includes('audio')
      ? 'mp3'
      : 'jpg';

    xhr.setRequestHeader('X-File-Ext', ext);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (e: ProgressEvent) => {
        if (e.lengthComputable && e.total > 0) {
          const percent = Math.round((e.loaded / e.total) * 100);
          const loadedMB = (e.loaded / (1024 * 1024)).toFixed(1);
          const totalMB = (e.total / (1024 * 1024)).toFixed(1);
          onProgress(percent, loadedMB, totalMB);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status === 401) {
        return reject(new Error('Session locked (HTTP 401)'));
      }
      if (xhr.status === 413) {
        return reject(new Error('File is too large for the media server (HTTP 413)'));
      }
      if (xhr.status >= 400) {
        let errMsg = `Server returned HTTP ${xhr.status}`;
        try {
          const parsed = JSON.parse(xhr.responseText);
          if (parsed && parsed.error) errMsg = parsed.error;
        } catch {}
        return reject(new Error(errMsg));
      }
      try {
        const json = JSON.parse(xhr.responseText) as MediaUploadResult;
        if (!json.ok) {
          return reject(new Error((json as any).error || 'Upload failed'));
        }
        resolve(json);
      } catch (err) {
        reject(new Error('Invalid response from media server'));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during media upload'));
    xhr.send(file);
  });
}
