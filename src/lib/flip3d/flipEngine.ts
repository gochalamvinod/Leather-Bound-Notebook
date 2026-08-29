/**
 * flipEngine.ts — Three.js WebGL 3D Page-Curl Animation Engine
 *
 * Implements a realistic 3D WebGL page-curl animation for a two-page open book.
 * Sized to the full open book spread with 1:1 pixel-mapped OrthographicCamera,
 * dual-faced meshes with spine hinge pivot at x=0, 32-segment plane geometry
 * with parabolic vertex deformation, dynamic key and rim directional lighting,
 * cubic easing over 860ms, and complete GPU resource disposal.
 */

import * as THREE from 'three';
import type { FlipDirection, PlayFlipParams, FlipEngine, FlipSceneResources } from '../../types/flip';
import { captureSpreadPages, paperFallbackCanvas } from './snapshot';
import { disposeFlipScene, setupWebGLContextLossHandler, createFlipAbortController } from './dispose';

export const DEFAULT_FLIP_DURATION_MS = 860;
export const GEOMETRY_SEGMENTS = 32;
export const CAMERA_Z_POSITION = 1200;
export const CAMERA_NEAR = 0.1;
export const CAMERA_FAR = 4000;

/**
 * Checks whether WebGL 1.0 or 2.0 rendering context is supported in the current environment.
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
 * Smooth cubic easing matching natural paper bending deceleration.
 * S-curve with zero first-derivative at t=0 and t=1 for smooth book page turning.
 */
export function easeInOutCubic(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return clamped < 0.5 ? 4 * clamped * clamped * clamped : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
}

/**
 * Calculates vertex parabolic curl Z displacement for a given normalized coordinate and animation progress.
 * Formula: z = intensity * (x - x0)^2 * sin(pi * progress)
 */
export function calculateParabolicCurlZ(
  x: number,
  _y: number,
  progress: number,
  curlIntensity: number = 0.5
): number {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const xOrigin = -0.5;
  const dx = x - xOrigin;
  return curlIntensity * (dx * dx) * Math.sin(Math.PI * clampedProgress);
}

/**
 * Calculates vertex curl Z offset across a page of width pageW.
 * factor is normalized [0, 1] across the page width.
 */
export function calculateVertexCurlZ(
  factor: number,
  easedProgress: number,
  maxCurl: number
): number {
  const curl = Math.sin(easedProgress * Math.PI) * maxCurl;
  return Math.sin(factor * Math.PI) * curl;
}

/**
 * Calculates the hinge rotation angle around the Y axis for a given direction and eased progress.
 */
export function calculateHingeRotation(direction: FlipDirection, easedProgress: number): number {
  const targetRotation = direction === 'next' ? -Math.PI : Math.PI;
  const rot = targetRotation * easedProgress;
  return rot === 0 ? 0 : rot;
}

/**
 * Calculates the dynamic X position of the key directional light tracking the page curl.
 */
export function calculateKeyLightX(bookW: number, easedProgress: number): number {
  return -bookW * 0.3 + Math.sin(easedProgress * Math.PI) * bookW * 0.25;
}

/**
 * Helper to compute book spread bounding rectangle from available parameters.
 */
function resolveBookRect(params: PlayFlipParams): {
  left: number;
  top: number;
  width: number;
  height: number;
} {
  if (params.bookRect) {
    return {
      left: params.bookRect.left,
      top: params.bookRect.top,
      width: params.bookRect.width,
      height: params.bookRect.height,
    };
  }

  if (params.bookSpreadElement && typeof params.bookSpreadElement.getBoundingClientRect === 'function') {
    const r = params.bookSpreadElement.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  }

  if (params.frontEl && params.frontEl.parentElement && typeof params.frontEl.parentElement.getBoundingClientRect === 'function') {
    const r = params.frontEl.parentElement.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  }

  if (typeof document !== 'undefined') {
    const defaultEl = document.getElementById('pageViewport') || document.getElementById('book');
    if (defaultEl && typeof defaultEl.getBoundingClientRect === 'function') {
      const r = defaultEl.getBoundingClientRect();
      return { left: r.left, top: r.top, width: r.width, height: r.height };
    }
  }

  if (typeof window !== 'undefined') {
    const defaultW = Math.min(960, Math.max(320, window.innerWidth - 40));
    const defaultH = Math.min(640, Math.max(240, window.innerHeight - 100));
    return {
      left: (window.innerWidth - defaultW) / 2,
      top: (window.innerHeight - defaultH) / 2,
      width: defaultW,
      height: defaultH,
    };
  }

  return { left: 0, top: 0, width: 800, height: 600 };
}

/**
 * Performs a realistic 3D WebGL page turn animation using Three.js.
 *
 * Sized to the full two-page open book viewport rectangle:
 * - Creates an OrthographicCamera with 1:1 pixel coordinate mapping
 * - Captures front and back canvas textures
 * - Bends 32-segment plane geometry parabolically: Z_i = sin(factor * PI) * curl(t)
 * - Pivots the leaf across the spine hinge (x = 0)
 * - Animates over 860ms with cubic easing and dynamic directional lighting
 * - Performs strict GPU memory cleanup on completion or cancellation
 */
export async function playFlip(params: PlayFlipParams): Promise<void> {
  const {
    direction,
    frontEl,
    backHTML,
    backFont = 'Georgia, serif',
    backFontSize = '18px',
    duration = DEFAULT_FLIP_DURATION_MS,
    signal,
    onComplete,
  } = params;

  if (signal?.aborted) {
    onComplete?.();
    return;
  }

  const rect = resolveBookRect(params);
  const bookW = Math.max(2, Math.round(rect.width));
  const h = Math.max(1, Math.round(rect.height));
  const pageW = Math.max(1, Math.round(bookW / 2));

  // Abort controller linked to optional parent signal
  const abortCtrl = createFlipAbortController(signal);
  const flipSignal = abortCtrl.signal;

  if (flipSignal.aborted) {
    onComplete?.();
    return;
  }

  // 1 & 2: Concurrently capture front (live DOM) and back (offscreen HTML) textures
  let frontSrc: HTMLCanvasElement;
  let backSrc: HTMLCanvasElement;

  if (params.leftCanvas && params.rightCanvas) {
    frontSrc = direction === 'next' ? params.rightCanvas : params.leftCanvas;
    backSrc = direction === 'next' ? params.leftCanvas : params.rightCanvas;
  } else {
    try {
      const captured = await captureSpreadPages({
        frontEl,
        backHTML,
        backFont,
        backFontSize,
        width: pageW,
        height: h,
        signal: flipSignal,
      });
      frontSrc = captured.frontCanvas;
      backSrc = captured.backCanvas;
    } catch {
      frontSrc = paperFallbackCanvas(pageW, h);
      backSrc = paperFallbackCanvas(pageW, h);
    }
  }

  if (flipSignal.aborted) {
    onComplete?.();
    return;
  }

  // 3: Build WebGL Scene sized to FULL open book
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(
    -bookW / 2,
    bookW / 2,
    h / 2,
    -h / 2,
    CAMERA_NEAR,
    CAMERA_FAR
  );
  camera.position.z = CAMERA_Z_POSITION;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2));
    renderer.setSize(bookW, h);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  } catch (err) {
    console.warn('[WebGL FlipEngine] Failed to initialize WebGLRenderer:', err);
    throw err;
  }

  // Fixed screen overlay container positioned exactly over the book viewport
  let overlay: HTMLElement | null = null;
  if (typeof document !== 'undefined' && document.body) {
    overlay = document.createElement('div');
    overlay.className = 'nb-flip3d-overlay';
    overlay.style.position = 'fixed';
    overlay.style.left = `${rect.left}px`;
    overlay.style.top = `${rect.top}px`;
    overlay.style.width = `${bookW}px`;
    overlay.style.height = `${h}px`;
    overlay.style.zIndex = '1000';
    overlay.style.pointerEvents = 'none';
    overlay.appendChild(renderer.domElement);
    document.body.appendChild(overlay);
  }

  // Light rig
  const ambientLight = new THREE.AmbientLight(0xfff3df, 0.65);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xfff6e6, 1.0);
  keyLight.position.set(-bookW * 0.3, h * 0.5, 900);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xdfeaff, 0.35);
  rimLight.position.set(bookW * 0.5, -h * 0.3, 600);
  scene.add(rimLight);

  // Textures
  const frontTex = new THREE.CanvasTexture(frontSrc);
  const backTex = new THREE.CanvasTexture(backSrc);
  frontTex.colorSpace = THREE.SRGBColorSpace;
  backTex.colorSpace = THREE.SRGBColorSpace;

  // Geometry: 32 horizontal segments for smooth parabolic curl
  const geometry = new THREE.PlaneGeometry(pageW, h, GEOMETRY_SEGMENTS, 1);
  const basePositions = geometry.attributes.position.array.slice() as Float32Array;

  const frontMat = new THREE.MeshStandardMaterial({
    map: frontTex,
    side: THREE.FrontSide,
    roughness: 0.92,
    metalness: 0.01,
  });

  const backMat = new THREE.MeshStandardMaterial({
    map: backTex,
    side: THREE.FrontSide,
    roughness: 0.92,
    metalness: 0.01,
  });

  // Pivot alignment across spine hinge (x = 0)
  // 'next': right page turns left, pivoting on its left edge (x=0)
  // 'prev': left page turns right, pivoting on its right edge (x=0)
  const pivotRight = direction === 'next';
  const localOffset = pivotRight ? pageW / 2 : -pageW / 2;

  const frontMesh = new THREE.Mesh(geometry, frontMat);
  frontMesh.position.x = localOffset;

  const backMesh = new THREE.Mesh(geometry, backMat);
  backMesh.position.x = localOffset;
  backMesh.rotation.y = Math.PI;

  const hinge = new THREE.Group();
  hinge.position.x = 0; // Hinge at spine center
  hinge.add(frontMesh, backMesh);
  scene.add(hinge);

  const targetRotation = direction === 'next' ? -Math.PI : Math.PI;
  const maxCurl = Math.min(70, pageW * 0.06);

  const resources: FlipSceneResources = {
    renderer,
    geometry,
    materials: [frontMat, backMat],
    textures: [frontTex, backTex],
    overlay,
    abortController: abortCtrl,
    rafId: null,
  };

  // Setup context loss listener
  const cleanupContextLoss = setupWebGLContextLossHandler(renderer, () => {
    abortCtrl.abort();
  });

  // Animation Loop
  try {
    await new Promise<void>((resolve, reject) => {
      let startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

      const onAbort = () => {
        if (resources.rafId && typeof cancelAnimationFrame === 'function') {
          cancelAnimationFrame(resources.rafId);
        }
        reject(new Error('WebGL flip animation aborted'));
      };

      if (flipSignal.aborted) {
        onAbort();
        return;
      }
      flipSignal.addEventListener('abort', onAbort, { once: true });

      function frame(now: number) {
        if (flipSignal.aborted) {
          return;
        }

        const elapsed = now - startTime;
        const progress = Math.min(1, Math.max(0, elapsed / duration));
        const eased = easeInOutCubic(progress);

        // Rotate page hinge
        hinge.rotation.y = targetRotation * eased;

        // Dynamic parabolic curvature: Peak curl mid-turn (eased ~ 0.5)
        const curl = Math.sin(eased * Math.PI) * maxCurl;
        const pos = geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const bx = basePositions[i * 3];
          const factor = (bx + pageW / 2) / pageW; // 0..1 across leaf width
          pos.setZ(i, Math.sin(factor * Math.PI) * curl);
        }
        pos.needsUpdate = true;
        geometry.computeVertexNormals();

        // Dynamic key light follows page swing
        keyLight.position.x = calculateKeyLightX(bookW, eased);

        renderer.render(scene, camera);

        if (progress < 1) {
          if (typeof requestAnimationFrame === 'function') {
            resources.rafId = requestAnimationFrame(frame);
          } else {
            setTimeout(() => frame(Date.now()), 16);
          }
        } else {
          resolve();
        }
      }

      if (typeof requestAnimationFrame === 'function') {
        resources.rafId = requestAnimationFrame(frame);
      } else {
        setTimeout(() => frame(Date.now()), 16);
      }
    });
  } finally {
    cleanupContextLoss();
    disposeFlipScene(resources);
    onComplete?.();
  }
}

/**
 * Standard WebGL Flip Engine singleton instance implementing the FlipEngine contract.
 */
export const webglFlipEngine: FlipEngine = {
  isWebglAvailable,
  playFlip,
  dispose: () => {
    // Teardown
  },
};

export const flipEngine: FlipEngine = webglFlipEngine;

export default webglFlipEngine;
