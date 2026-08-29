/**
 * WebGL 3D Page Flip and Canvas snapshot type definitions.
 */

/**
 * Direction of page flip turn.
 * 'next': Turns the right page from right to left (pivots on spine at left edge).
 * 'prev': Turns the left page from left to right (pivots on spine at right edge).
 */
export type FlipDirection = 'next' | 'prev';

/**
 * Parameter structure required to execute a 3D WebGL page curl turn.
 */
export interface PlayFlipParams {
  direction: FlipDirection;
  bookRect?: DOMRect;
  frontEl?: HTMLElement;
  backHTML?: string;
  backFont?: string;
  backFontSize?: string;
  bookSpreadElement?: HTMLElement;
  leftCanvas?: HTMLCanvasElement;
  rightCanvas?: HTMLCanvasElement;
  duration?: number;
  onComplete?: () => void;
  signal?: AbortSignal;
}

/**
 * GPU resources for WebGL flip scene that must be disposed
 */
export interface FlipSceneResources {
  renderer?: { dispose: () => void; domElement?: HTMLElement | null; forceContextLoss?: () => void } | null;
  geometry?: { dispose: () => void } | null;
  materials?: Array<{ dispose: () => void; map?: { dispose: () => void } | null }> | { dispose: () => void; map?: { dispose: () => void } | null } | null;
  textures?: Array<{ dispose: () => void }> | { dispose: () => void } | null;
  overlay?: HTMLElement | null;
  rafId?: number | null;
  abortController?: AbortController | null;
}

/**
 * WebGL Flip Engine contract
 */
export interface FlipEngine {
  isWebglAvailable: () => boolean;
  playFlip: (params: PlayFlipParams) => Promise<void>;
  dispose?: () => void;
}

/**
 * DOM Snapshot options passed to html2canvas wrapper
 */
export interface SnapshotOptions {
  backgroundColor?: string;
  useCORS?: boolean;
  scale?: number;
  logging?: boolean;
  width: number;
  height: number;
  signal?: AbortSignal;
}

