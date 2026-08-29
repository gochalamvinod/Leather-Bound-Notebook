/**
 * Comprehensive Empirical Challenge & Stress Testing Suite for Milestone 4
 * Tests:
 * 1. calculateResize (boundary dimensions, aspect ratios, handles, clamping, fuzzing, Shift modifier)
 * 2. calculateDropTarget & repositionElementInDom (empty container, nested elements, proximity, ejection guard, multi-block chains)
 * 3. PageSlot click resolution & interactive controls (SVGs, live embeds, document viewers, presentations, PDFs, captions, media figures)
 */

import { RESIZE_HANDLES, calculateResize, calculateDropTarget, repositionElementInDom } from '../src/lib/editor/imageResizer.ts';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    failed++;
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    passed++;
  }
}

function test(name, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
  } catch (err) {
    console.error(`💥 ERROR in test "${name}":`, err.message);
  }
}

console.log('================================================================');
console.log('STARTING EMPIRICAL STRESS TEST SUITE FOR MILESTONE 4');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// SUITE 1: calculateResize Verification & Stress Testing
// -----------------------------------------------------------------------------

test('calculateResize: zero delta preserves starting dimensions', () => {
  for (const handle of RESIZE_HANDLES) {
    const res = calculateResize({
      startWidth: 300,
      startHeight: 200,
      deltaX: 0,
      deltaY: 0,
      handle,
      minSize: 40,
      maintainAspectRatio: handle.isCorner,
    });
    assert(res.width === 300, `Expected width 300 for handle ${handle.cls}, got ${res.width}`);
    assert(res.height === 200, `Expected height 200 for handle ${handle.cls}, got ${res.height}`);
  }
});

test('calculateResize: minSize clamping on extreme shrinking delta (-99999px)', () => {
  for (const handle of RESIZE_HANDLES) {
    const deltaX = handle.dx * -99999;
    const deltaY = handle.dy * -99999;
    const res = calculateResize({
      startWidth: 400,
      startHeight: 300,
      deltaX,
      deltaY,
      handle,
      minSize: 40,
      maintainAspectRatio: handle.isCorner,
    });
    assert(res.width >= 40, `Width should be >= 40 for handle ${handle.cls}, got ${res.width}`);
    assert(res.height >= 40, `Height should be >= 40 for handle ${handle.cls}, got ${res.height}`);
    assert(!isNaN(res.width) && isFinite(res.width), `Width should be finite number, got ${res.width}`);
    assert(!isNaN(res.height) && isFinite(res.height), `Height should be finite number, got ${res.height}`);
  }
});

test('calculateResize: maxWidth clamping on large growth delta', () => {
  const seHandle = RESIZE_HANDLES.find(h => h.cls === 'se');
  const maxWidth = 500;
  const res = calculateResize({
    startWidth: 400,
    startHeight: 300,
    deltaX: 1000,
    deltaY: 1000,
    handle: seHandle,
    minSize: 40,
    maxWidth,
    maintainAspectRatio: true,
  });
  assert(res.width <= maxWidth, `Width should be clamped to ${maxWidth}, got ${res.width}`);
  assert(res.width === maxWidth, `Width should hit exactly maxWidth 500, got ${res.width}`);
  assert(res.height === 375, `Height should proportionally scale to 375, got ${res.height}`);
});

test('calculateResize: maxHeight clamping on vertical growth', () => {
  const seHandle = RESIZE_HANDLES.find(h => h.cls === 'se');
  const maxHeight = 300;
  const res = calculateResize({
    startWidth: 200,
    startHeight: 200,
    deltaX: 500,
    deltaY: 500,
    handle: seHandle,
    minSize: 40,
    maxHeight,
    maintainAspectRatio: true,
  });
  assert(res.height <= maxHeight, `Height should be clamped to ${maxHeight}, got ${res.height}`);
  assert(res.height === maxHeight, `Height should hit exactly maxHeight 300, got ${res.height}`);
  assert(res.width === 300, `Width should proportionally scale to 300, got ${res.width}`);
});

test('calculateResize: corner handles maintain aspect ratio correctly by default', () => {
  const corners = RESIZE_HANDLES.filter(h => h.isCorner);
  const startW = 600;
  const startH = 400;
  const initialRatio = startW / startH; // 1.5

  for (const handle of corners) {
    const deltaX = handle.dx * 100;
    const deltaY = handle.dy * 100;
    const res = calculateResize({
      startWidth: startW,
      startHeight: startH,
      deltaX,
      deltaY,
      handle,
      minSize: 40,
      maintainAspectRatio: true,
      originalAspectRatio: initialRatio,
    });
    const resultingRatio = res.width / res.height;
    const diff = Math.abs(resultingRatio - initialRatio);
    assert(diff < 0.02, `Corner ${handle.cls} aspect ratio mismatch: expected ~${initialRatio}, got ${resultingRatio}`);
  }
});

test('calculateResize: edge handles (e, w) resize width only when maintainAspectRatio=false', () => {
  const eastHandle = RESIZE_HANDLES.find(h => h.cls === 'e');
  const res = calculateResize({
    startWidth: 300,
    startHeight: 200,
    deltaX: 50,
    deltaY: 100,
    handle: eastHandle,
    minSize: 40,
    maintainAspectRatio: false,
  });
  assert(res.width === 350, `East handle width should be 350, got ${res.width}`);
  assert(res.height === 200, `East handle height must remain unchanged at 200, got ${res.height}`);

  const westHandle = RESIZE_HANDLES.find(h => h.cls === 'w');
  const resW = calculateResize({
    startWidth: 300,
    startHeight: 200,
    deltaX: -50,
    deltaY: 50,
    handle: westHandle,
    minSize: 40,
    maintainAspectRatio: false,
  });
  assert(resW.width === 350, `West handle width should be 350, got ${resW.width}`);
  assert(resW.height === 200, `West handle height must remain unchanged at 200, got ${resW.height}`);
});

test('calculateResize: edge handles (n, s) resize height only when maintainAspectRatio=false', () => {
  const southHandle = RESIZE_HANDLES.find(h => h.cls === 's');
  const res = calculateResize({
    startWidth: 300,
    startHeight: 200,
    deltaX: 100,
    deltaY: 60,
    handle: southHandle,
    minSize: 40,
    maintainAspectRatio: false,
  });
  assert(res.height === 260, `South handle height should be 260, got ${res.height}`);
  assert(res.width === 300, `South handle width must remain unchanged at 300, got ${res.width}`);

  const northHandle = RESIZE_HANDLES.find(h => h.cls === 'n');
  const resN = calculateResize({
    startWidth: 300,
    startHeight: 200,
    deltaX: 50,
    deltaY: -60,
    handle: northHandle,
    minSize: 40,
    maintainAspectRatio: false,
  });
  assert(resN.height === 260, `North handle height should be 260, got ${resN.height}`);
  assert(resN.width === 300, `North handle width must remain unchanged at 300, got ${resN.width}`);
});

test('calculateResize: Shift key modifier logic simulation', () => {
  // Corner handle with Shift toggles maintainAspectRatio from true to false
  const seHandle = RESIZE_HANDLES.find(h => h.cls === 'se');
  const resCornerShift = calculateResize({
    startWidth: 300,
    startHeight: 200,
    deltaX: 100,
    deltaY: 20,
    handle: seHandle,
    minSize: 40,
    maintainAspectRatio: false, // Shift released aspect lock
  });
  assert(resCornerShift.width === 400, `Free-form corner width should be 400, got ${resCornerShift.width}`);
  assert(resCornerShift.height === 220, `Free-form corner height should be 220, got ${resCornerShift.height}`);

  // Edge handle with Shift locks maintainAspectRatio to true
  const eastHandle = RESIZE_HANDLES.find(h => h.cls === 'e');
  const resEdgeShift = calculateResize({
    startWidth: 300,
    startHeight: 200,
    deltaX: 60, // 360 width (+20%)
    deltaY: 0,
    handle: eastHandle,
    minSize: 40,
    maintainAspectRatio: true, // Shift locked aspect ratio
    originalAspectRatio: 1.5,
  });
  assert(resEdgeShift.width === 360, `Locked edge width should be 360, got ${resEdgeShift.width}`);
  assert(resEdgeShift.height === 240, `Locked edge height should scale to 240 (+20%), got ${resEdgeShift.height}`);
});

test('calculateResize: Fuzzing 10,000 randomized valid inputs for invariant integrity', () => {
  for (let i = 0; i < 10000; i++) {
    const maxWidth = Math.random() > 0.3 ? Math.floor(Math.random() * 800) + 100 : undefined;
    const maxHeight = Math.random() > 0.3 ? Math.floor(Math.random() * 800) + 100 : undefined;
    const minSize = 40;

    const maxAllowedStartW = maxWidth || 1000;
    const maxAllowedStartH = maxHeight || 1000;
    const startW = Math.floor(Math.random() * (maxAllowedStartW - minSize)) + minSize;
    const startH = Math.floor(Math.random() * (maxAllowedStartH - minSize)) + minSize;

    const deltaX = Math.floor(Math.random() * 2000) - 1000;
    const deltaY = Math.floor(Math.random() * 2000) - 1000;
    const handle = RESIZE_HANDLES[Math.floor(Math.random() * RESIZE_HANDLES.length)];
    const maintainAspectRatio = Math.random() > 0.5;

    const res = calculateResize({
      startWidth: startW,
      startHeight: startH,
      deltaX,
      deltaY,
      handle,
      minSize,
      maxWidth,
      maxHeight,
      maintainAspectRatio,
    });

    assert(Number.isInteger(res.width), `Fuzz #${i}: Width must be integer, got ${res.width}`);
    assert(Number.isInteger(res.height), `Fuzz #${i}: Height must be integer, got ${res.height}`);
    assert(res.width >= minSize, `Fuzz #${i}: Width must be >= ${minSize}, got ${res.width}`);
    assert(res.height >= minSize, `Fuzz #${i}: Height must be >= ${minSize}, got ${res.height}`);
    if (maxWidth && maxWidth >= minSize) {
      assert(res.width <= maxWidth, `Fuzz #${i}: Width must be <= ${maxWidth}, got ${res.width}`);
    }
    if (maxHeight && maxHeight >= minSize) {
      assert(res.height <= maxHeight, `Fuzz #${i}: Height must be <= ${maxHeight}, got ${res.height}`);
    }
  }
});

// -----------------------------------------------------------------------------
// SUITE 2: calculateDropTarget & repositionElementInDom Verification
// -----------------------------------------------------------------------------

class MockHTMLElement {
  constructor(tagName, className = '', id = '') {
    this.tagName = tagName.toUpperCase();
    this.className = className;
    this.id = id;
    this.classList = new Set(className.split(' ').filter(Boolean));
    this.classList.contains = (c) => this.classList.has(c);
    this.classList.add = (c) => this.classList.add(c);
    this.classList.remove = (c) => this.classList.delete(c);
    this.children = [];
    this.parentElement = null;
    this._rect = { top: 0, bottom: 0, left: 0, right: 0, width: 100, height: 50 };
  }

  setRect(top, height, left = 0, width = 100) {
    this._rect = { top, height, left, width, bottom: top + height, right: left + width };
  }

  getBoundingClientRect() {
    return this._rect;
  }

  appendChild(child) {
    child.parentElement = this;
    this.children.push(child);
  }

  contains(el) {
    let cur = el;
    while (cur) {
      if (cur === this) return true;
      cur = cur.parentElement;
    }
    return false;
  }

  closest(selectors) {
    const list = selectors.split(',').map(s => s.trim());
    let cur = this;
    while (cur) {
      for (const sel of list) {
        if (sel.startsWith('.') && cur.classList.contains(sel.slice(1))) return cur;
        if (sel.toUpperCase() === cur.tagName) return cur;
      }
      cur = cur.parentElement;
    }
    return null;
  }

  insertBefore(newNode, refNode) {
    if (newNode.parentElement) {
      const idx = newNode.parentElement.children.indexOf(newNode);
      if (idx !== -1) newNode.parentElement.children.splice(idx, 1);
    }
    newNode.parentElement = this;
    const refIdx = this.children.indexOf(refNode);
    if (refIdx !== -1) {
      this.children.splice(refIdx, 0, newNode);
    } else {
      this.children.push(newNode);
    }
  }

  after(newNode) {
    if (!this.parentElement) return;
    if (newNode.parentElement) {
      const idx = newNode.parentElement.children.indexOf(newNode);
      if (idx !== -1) newNode.parentElement.children.splice(idx, 1);
    }
    newNode.parentElement = this.parentElement;
    const myIdx = this.parentElement.children.indexOf(this);
    this.parentElement.children.splice(myIdx + 1, 0, newNode);
  }
}

let mockElementAtPoint = null;
global.document = {
  elementFromPoint: (x, y) => mockElementAtPoint,
};
global.HTMLElement = MockHTMLElement;

test('calculateDropTarget: returns null for empty container', () => {
  const container = new MockHTMLElement('div', 'page current');
  const current = new MockHTMLElement('img', 'nb-media-figure');
  mockElementAtPoint = null;

  const result = calculateDropTarget(100, 100, container, current);
  assert(result === null, 'Drop target must be null for empty container');
});

test('calculateDropTarget: returns null when container contains only currentElement and overlay helpers', () => {
  const container = new MockHTMLElement('div', 'page current');
  const current = new MockHTMLElement('img', 'nb-media-figure');
  const dropIndicator = new MockHTMLElement('div', 'nb-drop-indicator-line');
  const overlay = new MockHTMLElement('div', 'img-overlay nb-unified-media-overlay');

  container.appendChild(current);
  container.appendChild(dropIndicator);
  container.appendChild(overlay);
  mockElementAtPoint = current;

  const result = calculateDropTarget(100, 100, container, current);
  assert(result === null, 'Drop target must be null when only current element and overlays exist in container');
});

test('calculateDropTarget: detects target child block directly under cursor', () => {
  const container = new MockHTMLElement('div', 'page current');
  const block1 = new MockHTMLElement('p', 'text-block');
  block1.setRect(50, 40);
  const block2 = new MockHTMLElement('p', 'text-block');
  block2.setRect(100, 40);
  const current = new MockHTMLElement('div', 'nb-media-figure');
  current.setRect(150, 60);

  container.appendChild(block1);
  container.appendChild(block2);
  container.appendChild(current);

  mockElementAtPoint = block2;
  const resBefore = calculateDropTarget(50, 110, container, current);
  assert(resBefore !== null, 'Drop target should not be null');
  assert(resBefore.targetElement === block2, 'Target element must be block2');
  assert(resBefore.position === 'before', 'Position should be "before" when hovering upper half');

  const resAfter = calculateDropTarget(50, 130, container, current);
  assert(resAfter !== null, 'Drop target should not be null');
  assert(resAfter.targetElement === block2, 'Target element must be block2');
  assert(resAfter.position === 'after', 'Position should be "after" when hovering lower half');
});

test('calculateDropTarget: climbs up from nested inner child to direct child block', () => {
  const container = new MockHTMLElement('div', 'page current');
  const block = new MockHTMLElement('div', 'nb-card-block');
  block.setRect(50, 100);
  const innerSpan = new MockHTMLElement('span', 'inner-text');
  const nestedIcon = new MockHTMLElement('svg', 'icon');
  innerSpan.appendChild(nestedIcon);
  block.appendChild(innerSpan);
  const current = new MockHTMLElement('img', 'nb-media-figure');

  container.appendChild(block);
  container.appendChild(current);

  mockElementAtPoint = nestedIcon;
  const res = calculateDropTarget(50, 80, container, current);
  assert(res !== null, 'Drop target should resolve nested element');
  assert(res.targetElement === block, 'Target element must resolve to direct child block, not nested svg');
  assert(res.position === 'before', 'Position should be "before"');
});

test('calculateDropTarget: fallback above first child and below last child', () => {
  const container = new MockHTMLElement('div', 'page current');
  const block1 = new MockHTMLElement('p', 'text-block');
  block1.setRect(50, 40);
  const block2 = new MockHTMLElement('p', 'text-block');
  block2.setRect(100, 40);
  const current = new MockHTMLElement('img', 'nb-media-figure');

  container.appendChild(block1);
  container.appendChild(block2);
  container.appendChild(current);

  mockElementAtPoint = null;

  const resTop = calculateDropTarget(50, 20, container, current);
  assert(resTop !== null, 'Top fallback drop target should not be null');
  assert(resTop.targetElement === block1, 'Target element must be block1');
  assert(resTop.position === 'before', 'Position must be "before"');

  const resBottom = calculateDropTarget(50, 200, container, current);
  assert(resBottom !== null, 'Bottom fallback drop target should not be null');
  assert(resBottom.targetElement === block2, 'Target element must be block2');
  assert(resBottom.position === 'after', 'Position must be "after"');
});

test('calculateDropTarget: multi-block chain proximity fallback between arbitrary blocks', () => {
  const container = new MockHTMLElement('div', 'page current');
  const blocks = [];
  for (let i = 0; i < 5; i++) {
    const b = new MockHTMLElement('p', `block-${i}`);
    b.setRect(50 + i * 50, 30); // 50-80, 100-130, 150-180, 200-230, 250-280
    container.appendChild(b);
    blocks.push(b);
  }
  const current = new MockHTMLElement('img', 'drag-img');
  container.appendChild(current);

  mockElementAtPoint = null; // simulate pointing between blocks in margin

  // Hover in gap between block-1 (mid 115) and block-2 (mid 165) at y = 135 (closer to block-1 bottom / block-2 top)
  const res = calculateDropTarget(50, 135, container, current);
  assert(res !== null, 'Should find proximity block');
  assert(res.targetElement === blocks[1] || res.targetElement === blocks[2], 'Should find nearest neighbor');
});

test('repositionElementInDom: guards against container ejection', () => {
  const pageSlot = new MockHTMLElement('div', 'page-slot');
  const container = new MockHTMLElement('div', 'page current');
  pageSlot.appendChild(container);

  const current = new MockHTMLElement('img', 'nb-media-figure');
  container.appendChild(current);

  const failPage = repositionElementInDom(current, container, 'before');
  assert(failPage === false, 'repositionElementInDom must return false when targetElement is .page');

  const failSlot = repositionElementInDom(current, pageSlot, 'before');
  assert(failSlot === false, 'repositionElementInDom must return false when targetElement is .page-slot');
});

test('repositionElementInDom: successfully repositions element before and after sibling block', () => {
  const container = new MockHTMLElement('div', 'page current');
  const block1 = new MockHTMLElement('p', 'b1');
  const block2 = new MockHTMLElement('p', 'b2');
  const current = new MockHTMLElement('img', 'current-img');

  container.appendChild(block1);
  container.appendChild(block2);
  container.appendChild(current);

  assert(container.children[2] === current, 'Initial current position');

  const success1 = repositionElementInDom(current, block1, 'before');
  assert(success1 === true, 'reposition before block1 should succeed');
  assert(container.children[0] === current, 'Current should now be first');
  assert(container.children[1] === block1, 'block1 should be second');
  assert(container.children[2] === block2, 'block2 should be third');

  const success2 = repositionElementInDom(current, block2, 'after');
  assert(success2 === true, 'reposition after block2 should succeed');
  assert(container.children[2] === current, 'Current should now be third');
});

// -----------------------------------------------------------------------------
// SUITE 3: PageSlot Click Event Resolution Logic
// -----------------------------------------------------------------------------

function simulatePageSlotClick(target, editableContainer) {
  let onImageClickCalledWith = null;

  const slideThumb = target.closest?.('.nb-slide-thumb-container, .nb-slide-thumb');
  const presNavBtn = target.closest?.('.nb-presentation-nav-btn');
  const presContainer = target.closest?.('.nb-presentation-container');

  if (presContainer && (slideThumb || presNavBtn)) {
    return { type: 'presentation_nav', onImageClickCalled: false };
  }

  const pdfNavBtn = target.closest?.('.nb-pdf-nav-btn');
  const pdfContainer = target.closest?.('.nb-pdf-container');

  if (pdfContainer && pdfNavBtn) {
    return { type: 'pdf_nav', onImageClickCalled: false };
  }

  const isLiveEmbedControl = target.closest?.(
    '.nb-live-embed__btn, .nb-live-embed__bar, .nb-live-embed__omnibox, .nb-live-embed__address-input, .nb-live-embed__resize-handle, .nb-live-embed__status-badge'
  );

  const backBtn = target.closest?.('.nb-live-embed__btn--back');
  if (backBtn) return { type: 'embed_back', onImageClickCalled: false };

  const fwdBtn = target.closest?.('.nb-live-embed__btn--forward');
  if (fwdBtn) return { type: 'embed_fwd', onImageClickCalled: false };

  const reloadBtn = target.closest?.('.nb-live-embed__btn--reload');
  if (reloadBtn) return { type: 'embed_reload', onImageClickCalled: false };

  const homeBtn = target.closest?.('.nb-live-embed__btn--home');
  if (homeBtn) return { type: 'embed_home', onImageClickCalled: false };

  const expandBtn = target.closest?.('.nb-live-embed__btn--expand');
  if (expandBtn) return { type: 'embed_expand', onImageClickCalled: false };

  const removeBtn = target.closest?.('.nb-live-embed__btn--remove');
  if (removeBtn) return { type: 'embed_remove', onImageClickCalled: false };

  if (
    isLiveEmbedControl ||
    target.closest?.('button') ||
    target.closest?.('a') ||
    target.closest?.('input, textarea, select') ||
    target.closest?.('figcaption') ||
    target.closest?.('.nb-link-card') ||
    target.closest?.('.nb-live-embed__bar') ||
    target.closest?.('.nb-live-embed__nav-group') ||
    target.closest?.('.nb-live-embed__omnibox') ||
    target.closest?.('.nb-live-embed__action-group') ||
    target.closest?.('.nb-live-embed__resize-handle') ||
    target.closest?.('.nb-live-embed__btn') ||
    target.closest?.('.nb-live-embed__address-input') ||
    target.closest?.('.nb-live-embed__info') ||
    target.closest?.('.nb-code-container') ||
    target.closest?.('.nb-word-container') ||
    target.closest?.('.nb-spreadsheet-container') ||
    target.closest?.('.nb-presentation-container') ||
    target.closest?.('.nb-pdf-container') ||
    target.closest?.('.vintage-media-caption') ||
    target.closest?.('.nb-media-caption') ||
    target.closest?.('.nb-audio-controls-row') ||
    target.closest?.('.nb-video-controls-overlay') ||
    target.closest?.('.nb-audio-timeline') ||
    target.closest?.('.nb-video-timeline') ||
    target.closest?.('.nb-audio-stats-panel') ||
    target.closest?.('.nb-video-stats-hud') ||
    target.closest?.('.nb-audio-badge') ||
    target.closest?.('.nb-presentation-thumbnails') ||
    target.closest?.('.nb-slide-thumb-container') ||
    target.closest?.('.nb-slide-thumb') ||
    target.closest?.('.nb-presentation-nav-group') ||
    target.closest?.('.nb-pdf-nav-group') ||
    target.closest?.('.nb-presentation-actions') ||
    target.closest?.('.nb-pdf-actions') ||
    target.closest?.('.nb-spreadsheet-actions') ||
    target.closest?.('.nb-word-actions') ||
    target.closest?.('.nb-code-actions') ||
    target.closest?.('.nb-presentation-stage') ||
    target.closest?.('.nb-pdf-stage') ||
    target.closest?.('.nb-spreadsheet-viewport') ||
    target.closest?.('.nb-sheet-tab') ||
    target.closest?.('.nb-code-body') ||
    target.closest?.('.nb-code-table') ||
    target.closest?.('.nb-code-content') ||
    target.closest?.('.nb-word-parchment-body')
  ) {
    return { type: 'guarded_interactive', onImageClickCalled: false };
  }

  const mediaContainer = target.closest?.(
    '.nb-media-figure, .media-container, .video-container, .audio-container'
  );
  const mediaEl = mediaContainer || (target.closest?.('img, video, audio'));

  if (mediaEl && editableContainer?.contains(mediaEl)) {
    onImageClickCalledWith = mediaEl;
    return { type: 'media_click', onImageClickCalled: true, target: mediaEl };
  }

  return { type: 'default_text', onImageClickCalled: false };
}

test('PageSlot: clicking nested SVG icon inside live embed back button executes back action without triggering image click', () => {
  const page = new MockHTMLElement('div', 'page current');
  const embed = new MockHTMLElement('div', 'nb-live-embed');
  const bar = new MockHTMLElement('div', 'nb-live-embed__bar');
  const backBtn = new MockHTMLElement('button', 'nb-live-embed__btn nb-live-embed__btn--back');
  const svg = new MockHTMLElement('svg', 'icon');
  const path = new MockHTMLElement('path', '');

  svg.appendChild(path);
  backBtn.appendChild(svg);
  bar.appendChild(backBtn);
  embed.appendChild(bar);
  page.appendChild(embed);

  const res = simulatePageSlotClick(path, page);
  assert(res.type === 'embed_back', `Expected embed_back, got ${res.type}`);
  assert(res.onImageClickCalled === false, 'Must not call onImageClick');
});

test('PageSlot: all live embed action buttons (forward, reload, home, expand, remove) guard against image click', () => {
  const page = new MockHTMLElement('div', 'page current');
  const embed = new MockHTMLElement('div', 'nb-live-embed');
  const bar = new MockHTMLElement('div', 'nb-live-embed__bar');
  embed.appendChild(bar);
  page.appendChild(embed);

  const buttonClasses = [
    { cls: 'nb-live-embed__btn--forward', expected: 'embed_fwd' },
    { cls: 'nb-live-embed__btn--reload',  expected: 'embed_reload' },
    { cls: 'nb-live-embed__btn--home',    expected: 'embed_home' },
    { cls: 'nb-live-embed__btn--expand',  expected: 'embed_expand' },
    { cls: 'nb-live-embed__btn--remove',  expected: 'embed_remove' },
  ];

  for (const { cls, expected } of buttonClasses) {
    const btn = new MockHTMLElement('button', `nb-live-embed__btn ${cls}`);
    const icon = new MockHTMLElement('span', 'btn-icon');
    btn.appendChild(icon);
    bar.appendChild(btn);

    const res = simulatePageSlotClick(icon, page);
    assert(res.type === expected, `Expected ${expected} for ${cls}, got ${res.type}`);
    assert(res.onImageClickCalled === false, `Must not call onImageClick for ${cls}`);
  }
});

test('PageSlot: clicking inside document viewers (Code, Word, Sheets) does not trigger image click', () => {
  const page = new MockHTMLElement('div', 'page current');

  // Code Container
  const codeContainer = new MockHTMLElement('div', 'nb-code-container');
  const codeContent = new MockHTMLElement('div', 'nb-code-content');
  const codeLine = new MockHTMLElement('span', 'token keyword');
  codeContent.appendChild(codeLine);
  codeContainer.appendChild(codeContent);
  page.appendChild(codeContainer);

  const resCode = simulatePageSlotClick(codeLine, page);
  assert(resCode.type === 'guarded_interactive', `Expected guarded_interactive for code, got ${resCode.type}`);
  assert(resCode.onImageClickCalled === false, 'Must not call onImageClick on code content');

  // Word Container
  const wordContainer = new MockHTMLElement('div', 'nb-word-container');
  const wordBody = new MockHTMLElement('div', 'nb-word-parchment-body');
  const wordP = new MockHTMLElement('p', 'word-p');
  wordBody.appendChild(wordP);
  wordContainer.appendChild(wordBody);
  page.appendChild(wordContainer);

  const resWord = simulatePageSlotClick(wordP, page);
  assert(resWord.type === 'guarded_interactive', `Expected guarded_interactive for word doc, got ${resWord.type}`);
  assert(resWord.onImageClickCalled === false, 'Must not call onImageClick on word doc body');

  // Spreadsheet Container
  const sheetContainer = new MockHTMLElement('div', 'nb-spreadsheet-container');
  const sheetViewport = new MockHTMLElement('div', 'nb-spreadsheet-viewport');
  const cell = new MockHTMLElement('div', 'nb-sheet-cell');
  sheetViewport.appendChild(cell);
  sheetContainer.appendChild(sheetViewport);
  page.appendChild(sheetContainer);

  const resSheet = simulatePageSlotClick(cell, page);
  assert(resSheet.type === 'guarded_interactive', `Expected guarded_interactive for sheet, got ${resSheet.type}`);
  assert(resSheet.onImageClickCalled === false, 'Must not call onImageClick on sheet cell');
});

test('PageSlot: presentation thumbnail & PDF navigation buttons trigger appropriate navigation handlers', () => {
  const page = new MockHTMLElement('div', 'page current');

  // Presentation nav
  const presContainer = new MockHTMLElement('div', 'nb-presentation-container');
  const thumb = new MockHTMLElement('div', 'nb-slide-thumb');
  presContainer.appendChild(thumb);
  page.appendChild(presContainer);

  const resPres = simulatePageSlotClick(thumb, page);
  assert(resPres.type === 'presentation_nav', `Expected presentation_nav, got ${resPres.type}`);

  // PDF nav
  const pdfContainer = new MockHTMLElement('div', 'nb-pdf-container');
  const pdfBtn = new MockHTMLElement('button', 'nb-pdf-nav-btn nb-pdf-next');
  pdfContainer.appendChild(pdfBtn);
  page.appendChild(pdfContainer);

  const resPdf = simulatePageSlotClick(pdfBtn, page);
  assert(resPdf.type === 'pdf_nav', `Expected pdf_nav, got ${resPdf.type}`);
});

test('PageSlot: genuine image / figure click triggers onImageClick', () => {
  const page = new MockHTMLElement('div', 'page current');
  const figure = new MockHTMLElement('figure', 'nb-media-figure');
  const img = new MockHTMLElement('img', 'vintage-img');
  figure.appendChild(img);
  page.appendChild(figure);

  const res = simulatePageSlotClick(img, page);
  assert(res.type === 'media_click', `Expected media_click, got ${res.type}`);
  assert(res.onImageClickCalled === true, 'onImageClick must be called');
  assert(res.target === figure, 'Target must resolve to figure container');
});

test('PageSlot: clicking image caption does not trigger onImageClick', () => {
  const page = new MockHTMLElement('div', 'page current');
  const figure = new MockHTMLElement('figure', 'nb-media-figure');
  const caption = new MockHTMLElement('figcaption', 'nb-media-caption');
  figure.appendChild(caption);
  page.appendChild(figure);

  const res = simulatePageSlotClick(caption, page);
  assert(res.type === 'guarded_interactive', `Expected guarded_interactive for caption, got ${res.type}`);
  assert(res.onImageClickCalled === false, 'onImageClick must not be called on caption');
});

console.log('\n================================================================');
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
