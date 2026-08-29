// flip3d.js — the "heavy graphics" page-turn for a real two-page open book.
//
// Loaded lazily (dynamic import) from app.js, and every export here is
// wrapped defensively by the caller: if WebGL isn't available, a snapshot
// fails, or anything throws, app.js falls back to a plain CSS rotation so
// the notebook always stays usable.
//
// The book shows two pages side by side. The leaf that's turning always
// occupies exactly ONE of those pages and pivots at the spine — the vertical
// centerline of the open book — the same way a real bound page does. That's
// why the WebGL camera and canvas are sized to the FULL open-book rectangle
// (both pages), not just the page that's turning: as the leaf rotates past
// 90°, it visually swings across the spine and comes to rest flat over the
// opposite page, exactly where the static DOM will pick it up once the
// animation ends.
//
// How a single flip works:
//   1. Snapshot the outgoing page (the live DOM element) into a canvas.
//   2. Snapshot the incoming page (rendered off-screen, since it isn't on
//      screen yet) into another canvas.
//   3. Build a WebGL scene sized to the whole open book, with a real light
//      rig, and a camera whose bounds match the book in on-screen pixels.
//   4. Put both snapshots on two single-sided planes, back to back, so the
//      "leaf" shows the outgoing page on one face and the incoming page on
//      the other — like a real double-sided sheet.
//   5. Rotate that leaf around the spine, gently bowing its geometry (a soft
//      curl) as it turns, then tear the scene down.

import * as THREE from './vendor/three/three.module.js';
import html2canvas from './vendor/html2canvas.esm.js';

const PAGE_BG = '#f4edde';
const PAGE_PADDING = '60px 52px 40px'; // must match .page padding in style.css
const PAGE_LINE_HEIGHT = '36px';       // must match .page line-height in style.css

let stagingEl = null;
function getStagingEl(width, height) {
  if (!stagingEl) {
    stagingEl = document.createElement('div');
    stagingEl.style.position = 'fixed';
    stagingEl.style.top = '0';
    stagingEl.style.left = '-99999px';
    stagingEl.style.overflow = 'hidden';
    stagingEl.style.boxSizing = 'border-box';
    stagingEl.style.background = PAGE_BG;
    stagingEl.style.padding = PAGE_PADDING;
    stagingEl.style.lineHeight = PAGE_LINE_HEIGHT;
    document.body.appendChild(stagingEl);
  }
  stagingEl.style.width = width + 'px';
  stagingEl.style.height = height + 'px';
  return stagingEl;
}

function paperFallbackCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  const ctx = c.getContext('2d');
  ctx.fillStyle = PAGE_BG;
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = 'rgba(44,36,22,0.12)';
  ctx.lineWidth = 1;
  for (let y = 36; y < c.height; y += 36) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(c.width, y + 0.5);
    ctx.stroke();
  }
  return c;
}

async function safeSnapshot(el, w, h) {
  try {
    const canvas = await Promise.race([
      html2canvas(el, {
        backgroundColor: PAGE_BG,
        useCORS: true,
        scale: 1,
        logging: false,
        width: Math.round(w),
        height: Math.round(h),
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('snapshot timeout')), 1800)),
    ]);
    return canvas;
  } catch (err) {
    return null;
  }
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function isWebglAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')));
  } catch (e) {
    return false;
  }
}

/**
 * @param {Object} opts
 * @param {'next'|'prev'} opts.direction
 * @param {DOMRect} opts.bookRect - on-screen rect of the WHOLE open book (both
 *   pages, from the outer edge of the left page to the outer edge of the
 *   right page) — e.g. the page-viewport element's getBoundingClientRect().
 * @param {HTMLElement} opts.frontEl - the live page element currently showing
 *   on the flipping side (the right page for 'next', the left page for 'prev')
 * @param {string} opts.backHTML - HTML for the page revealed on the other
 *   side of the leaf, rendered off-screen for a snapshot
 * @param {string} opts.backFont
 * @param {string} opts.backFontSize
 * @returns {Promise<void>} resolves once the animation + cleanup is done
 */
export async function playFlip({ direction, bookRect, frontEl, backHTML, backFont, backFontSize }) {
  const bookW = Math.max(2, Math.round(bookRect.width));
  const h = Math.max(1, Math.round(bookRect.height));
  const pageW = bookW / 2; // each page is exactly half the open book

  // 1 & 2: snapshots, sized to a SINGLE page (front = currently visible page,
  // back = rendered off-screen).
  const stage = getStagingEl(pageW, h);
  stage.style.fontFamily = backFont || 'Georgia, serif';
  stage.style.fontSize = backFontSize || '18px';
  stage.innerHTML = backHTML || '';
  // give layout a frame to settle before capturing
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  const [frontCanvas, backCanvas] = await Promise.all([
    safeSnapshot(frontEl, pageW, h),
    safeSnapshot(stage, pageW, h),
  ]);
  stage.innerHTML = '';

  const frontSrc = frontCanvas || paperFallbackCanvas(pageW, h);
  const backSrc = backCanvas || paperFallbackCanvas(pageW, h);

  // 3: scene sized to the FULL open book, so the leaf can swing across the
  // spine and land, fully in view, on top of the opposite page.
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-bookW / 2, bookW / 2, h / 2, -h / 2, 0.1, 4000);
  camera.position.z = 1200;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(bookW, h);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.left = bookRect.left + 'px';
  overlay.style.top = bookRect.top + 'px';
  overlay.style.width = bookW + 'px';
  overlay.style.height = h + 'px';
  overlay.style.zIndex = '1000';
  overlay.style.pointerEvents = 'none';
  overlay.appendChild(renderer.domElement);
  document.body.appendChild(overlay);

  scene.add(new THREE.AmbientLight(0xfff3df, 0.65));
  const key = new THREE.DirectionalLight(0xfff6e6, 1.0);
  key.position.set(-bookW * 0.3, h * 0.5, 900);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xdfeaff, 0.35);
  rim.position.set(bookW * 0.5, -h * 0.3, 600);
  scene.add(rim);

  const frontTex = new THREE.CanvasTexture(frontSrc);
  const backTex = new THREE.CanvasTexture(backSrc);
  frontTex.colorSpace = THREE.SRGBColorSpace;
  backTex.colorSpace = THREE.SRGBColorSpace;

  const segments = 32;
  const geometry = new THREE.PlaneGeometry(pageW, h, segments, 1);
  const basePositions = geometry.attributes.position.array.slice();

  const frontMat = new THREE.MeshStandardMaterial({ map: frontTex, side: THREE.FrontSide, roughness: 0.92, metalness: 0.01 });
  const backMat = new THREE.MeshStandardMaterial({ map: backTex, side: THREE.FrontSide, roughness: 0.92, metalness: 0.01 });

  // 'next' turns the right page, pivoting at its LEFT edge (the spine);
  // 'prev' turns the left page, pivoting at its RIGHT edge (the spine).
  // The hinge always sits at world x = 0 — the exact center of the open
  // book — so a 180° turn carries the leaf cleanly from one page to the
  // other, fully inside the camera's view the whole time.
  const pivotRight = direction === 'next';
  const localOffset = pivotRight ? pageW / 2 : -pageW / 2;

  const frontMesh = new THREE.Mesh(geometry, frontMat);
  frontMesh.position.x = localOffset;
  const backMesh = new THREE.Mesh(geometry, backMat);
  backMesh.position.x = localOffset;
  backMesh.rotation.y = Math.PI;

  const hinge = new THREE.Group();
  hinge.position.x = 0; // the spine
  hinge.add(frontMesh, backMesh);
  scene.add(hinge);

  const targetRotation = direction === 'next' ? -Math.PI : Math.PI;
  const duration = 860;
  const maxCurl = Math.min(70, pageW * 0.06);

  await new Promise((resolve) => {
    const start = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = easeInOutCubic(t);
      hinge.rotation.y = targetRotation * eased;

      // gentle curl: bow the geometry across its width, peaking mid-flip
      const curl = Math.sin(eased * Math.PI) * maxCurl;
      const pos = geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const bx = basePositions[i * 3];
        const factor = (bx + pageW / 2) / pageW; // 0..1 across the page
        pos.setZ(i, Math.sin(factor * Math.PI) * curl);
      }
      pos.needsUpdate = true;
      geometry.computeVertexNormals();

      key.position.x = -bookW * 0.3 + Math.sin(eased * Math.PI) * bookW * 0.25;

      renderer.render(scene, camera);

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        resolve();
      }
    }
    requestAnimationFrame(frame);
  });

  // 5: teardown
  renderer.dispose();
  geometry.dispose();
  frontMat.dispose();
  backMat.dispose();
  frontTex.dispose();
  backTex.dispose();
  overlay.remove();
}
