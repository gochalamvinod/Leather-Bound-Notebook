import type { FlipSceneResources } from '../../types/flip';

/**
 * Safely dispose a single disposable object (Texture, Material, Geometry, Renderer, etc.)
 */
export function safeDispose(target?: { dispose?: () => void } | null): void {
  if (!target || typeof target.dispose !== 'function') return;
  try {
    target.dispose();
  } catch (err) {
    console.warn('[disposeFlipScene] Error disposing resource:', err);
  }
}

/**
 * Explicitly disposes all WebGL and DOM resources associated with a 3D flip animation.
 *
 * Frees VRAM by calling .dispose() on textures, materials, geometries, and renderer,
 * cancels any pending requestAnimationFrame callback, removes the DOM overlay element,
 * and triggers abort signals if necessary.
 */
export function disposeFlipScene(resources?: FlipSceneResources | null): void {
  if (!resources) return;

  // 1. Cancel active animation frame
  if (typeof resources.rafId === 'number' && typeof cancelAnimationFrame === 'function') {
    try {
      cancelAnimationFrame(resources.rafId);
    } catch {
      // ignore
    }
  }

  // 2. Abort active controllers
  if (resources.abortController && !resources.abortController.signal.aborted) {
    try {
      resources.abortController.abort();
    } catch {
      // ignore
    }
  }

  // 3. Dispose Textures (including material maps if attached)
  if (resources.textures) {
    if (Array.isArray(resources.textures)) {
      for (const tex of resources.textures) {
        safeDispose(tex);
      }
    } else {
      safeDispose(resources.textures);
    }
  }

  // 4. Dispose Materials
  if (resources.materials) {
    if (Array.isArray(resources.materials)) {
      for (const mat of resources.materials) {
        if (mat && mat.map) safeDispose(mat.map);
        safeDispose(mat);
      }
    } else {
      if (resources.materials && resources.materials.map) safeDispose(resources.materials.map);
      safeDispose(resources.materials);
    }
  }

  // 5. Dispose Geometries
  if (resources.geometry) {
    safeDispose(resources.geometry);
  }

  // 6. Dispose WebGLRenderer
  if (resources.renderer) {
    try {
      if (typeof resources.renderer.forceContextLoss === 'function') {
        resources.renderer.forceContextLoss();
      }
    } catch {
      // ignore
    }
    safeDispose(resources.renderer);
  }

  // 7. Remove DOM Canvas Overlay
  if (resources.overlay) {
    try {
      if (typeof resources.overlay.remove === 'function') {
        resources.overlay.remove();
      } else if (resources.overlay.parentNode) {
        resources.overlay.parentNode.removeChild(resources.overlay);
      }
    } catch (err) {
      console.warn('[disposeFlipScene] Error removing overlay:', err);
    }
  }
}

/**
 * Attaches a 'webglcontextlost' event listener to the canvas element or WebGLRenderer.
 * Prevents default browser handling and invokes the supplied fallback/abort callback.
 * Returns a cleanup unsubscribe function.
 */
export function setupWebGLContextLossHandler(
  target: HTMLCanvasElement | { domElement?: HTMLElement | null; addEventListener?: Function } | null | undefined,
  onContextLost: (event: Event) => void
): () => void {
  const isCanvasLike = (el: any): el is HTMLCanvasElement => {
    if (!el || typeof el !== 'object') return false;
    if (typeof HTMLCanvasElement !== 'undefined' && el instanceof HTMLCanvasElement) return true;
    return el.tagName === 'CANVAS' || (typeof el.getContext === 'function' && typeof el.addEventListener === 'function');
  };

  const canvas = isCanvasLike(target)
    ? (target as HTMLCanvasElement)
    : isCanvasLike(target?.domElement)
    ? (target.domElement as HTMLCanvasElement)
    : null;

  if (!canvas || typeof canvas.addEventListener !== 'function') {
    return () => {};
  }

  const handleContextLost = (event: Event) => {
    try {
      if (typeof event.preventDefault === 'function') {
        event.preventDefault();
      }
    } catch {
      // ignore
    }
    console.warn('[WebGL Lifecycle] webglcontextlost event detected. Cancelling 3D flip.');
    try {
      onContextLost(event);
    } catch (err) {
      console.error('[WebGL Lifecycle] Error in context loss callback:', err);
    }
  };

  canvas.addEventListener('webglcontextlost', handleContextLost, false);

  return () => {
    try {
      canvas.removeEventListener('webglcontextlost', handleContextLost, false);
    } catch {
      // ignore
    }
  };
}

/**
 * Creates a linked AbortController that automatically triggers if an optional parent signal aborts.
 */
export function createFlipAbortController(parentSignal?: AbortSignal | null): AbortController {
  const controller = new AbortController();

  if (parentSignal) {
    if (parentSignal.aborted) {
      controller.abort();
    } else {
      parentSignal.addEventListener(
        'abort',
        () => {
          controller.abort();
        },
        { once: true }
      );
    }
  }

  return controller;
}
