/**
 * Rich text formatting commands, selection persistence, and auto-linkification
 * for the Leatherbound Notebook ContentEditable editor.
 */

export interface FontOption {
  label: string;
  value: string;
}

export const FONTS: FontOption[] = [
  { label: 'Georgia', value: "Georgia, 'Times New Roman', serif" },
  { label: 'Times New Roman', value: "'Times New Roman', Times, serif" },
  { label: 'Palatino', value: "'Palatino Linotype', 'Book Antiqua', Palatino, serif" },
  { label: 'Garamond', value: "Garamond, 'Book Antiqua', serif" },
  { label: 'Baskerville', value: "Baskerville, 'Times New Roman', serif" },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Trebuchet MS', value: "'Trebuchet MS', sans-serif" },
  { label: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' },
  { label: 'Courier New', value: "'Courier New', Courier, monospace" },
  { label: 'Consolas', value: "Consolas, 'Courier New', monospace" },
  { label: 'Comic Sans MS', value: "'Comic Sans MS', 'Comic Sans', cursive" },
  { label: 'Brush Script', value: "'Brush Script MT', 'Segoe Script', cursive" },
  { label: 'Papyrus', value: 'Papyrus, fantasy' },
  { label: 'Impact', value: "Impact, 'Arial Narrow Bold', sans-serif" },
];

export const FONT_SIZES: string[] = [
  '12px',
  '14px',
  '16px',
  '18px',
  '20px',
  '22px',
  '24px',
  '28px',
  '32px',
  '36px',
];

export const DEFAULT_FONT = FONTS[0].value;
export const DEFAULT_FONT_SIZE = '18px';

// Module-level saved range for restoring selection across toolbar clicks
let currentSavedRange: Range | null = null;

/**
 * Save the current window selection Range if it is within the specified container
 * (or if container is not specified, save any active range).
 */
export function saveSelection(container?: HTMLElement | null): Range | null {
  if (typeof window === 'undefined') return null;
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    if (!container || container.contains(range.commonAncestorContainer)) {
      currentSavedRange = range.cloneRange();
      return currentSavedRange;
    }
  }
  return null;
}

/**
 * Restore the saved Range (or a passed-in Range) to window selection.
 */
export function restoreSelection(rangeToRestore?: Range | null): boolean {
  if (typeof window === 'undefined') return false;
  const targetRange = rangeToRestore !== undefined ? rangeToRestore : currentSavedRange;
  if (!targetRange) return false;
  const sel = window.getSelection();
  if (sel) {
    sel.removeAllRanges();
    sel.addRange(targetRange);
    return true;
  }
  return false;
}

/**
 * Get the currently cached saved range.
 */
export function getSavedRange(): Range | null {
  return currentSavedRange;
}

/**
 * Clear the cached saved range.
 */
export function clearSavedRange(): void {
  currentSavedRange = null;
}

/**
 * Execute a document formatting command safely.
 */
export function execFormat(command: string, value: string | null = null): boolean {
  if (typeof document === 'undefined') return false;
  try {
    return document.execCommand(command, false, value ?? undefined);
  } catch (err) {
    console.warn(`execCommand('${command}') failed:`, err);
    return false;
  }
}

/**
 * Query whether a formatting command is active in current selection.
 */
export function isCommandActive(command: string): boolean {
  if (typeof document === 'undefined') return false;
  try {
    return document.queryCommandState(command);
  } catch (e) {
    return false;
  }
}

/**
 * Query the current string value of a formatting command.
 */
export function queryCommandValue(command: string): string {
  if (typeof document === 'undefined') return '';
  try {
    return document.queryCommandValue(command) || '';
  } catch (e) {
    return '';
  }
}

/**
 * Format commands wrappers
 */
export function setBold(): boolean {
  return execFormat('bold');
}

export function setItalic(): boolean {
  return execFormat('italic');
}

export function setUnderline(): boolean {
  return execFormat('underline');
}

export function setAlignment(alignment: 'justifyLeft' | 'justifyCenter' | 'justifyRight' | 'left' | 'center' | 'right' | 'justify'): boolean {
  switch (alignment) {
    case 'justifyCenter':
    case 'center':
      return execFormat('justifyCenter');
    case 'justifyRight':
    case 'right':
      return execFormat('justifyRight');
    case 'justify':
      return execFormat('justifyFull');
    case 'justifyLeft':
    case 'left':
    default:
      return execFormat('justifyLeft');
  }
}

export function setTextColor(hexColor: string): boolean {
  return execFormat('foreColor', hexColor);
}

export function setHighlightColor(hexColor: string): boolean {
  return execFormat('hiliteColor', hexColor);
}

export function setFontName(fontName: string): boolean {
  return execFormat('fontName', fontName);
}

export function setFontSize(fontSize: string): boolean {
  return execFormat('fontSize', fontSize);
}

/**
 * Insert text at the current caret position.
 */
export function insertTextAtSelection(text: string): boolean {
  if (typeof document === 'undefined') return false;
  return execFormat('insertText', text);
}

/**
 * Insert HTML markup at current caret position.
 */
export function insertHtmlAtSelection(html: string): boolean {
  if (typeof document === 'undefined') return false;
  return execFormat('insertHTML', html);
}

/**
 * Insert an image URL at current caret position.
 */
export function insertImageAtSelection(url: string): boolean {
  if (typeof document === 'undefined') return false;
  return execFormat('insertImage', url);
}

/**
 * Place the selection caret from screen point coordinates (x, y).
 */
export function placeCaretFromPoint(x: number, y: number, container: HTMLElement): void {
  if (typeof document === 'undefined') return;
  container.focus();
  let range: Range | null = null;
  const doc = document as any;
  if (doc.caretRangeFromPoint) {
    range = doc.caretRangeFromPoint(x, y);
  } else if (doc.caretPositionFromPoint) {
    const pos = doc.caretPositionFromPoint(x, y);
    if (pos) {
      range = document.createRange();
      range.setStart(pos.offsetNode, pos.offset);
    }
  }
  if (range) {
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }
}

/**
 * Auto-link a URL typed into the editable element immediately after space/enter.
 * Scans preceding text node for `https?://\S+` and wraps with `<a href="..." target="_blank" rel="noopener noreferrer">`.
 */
export function linkifyRecentTyping(container: HTMLElement): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return false;
    const range = sel.getRangeAt(0);
    if (!container.contains(range.startContainer)) return false;
    const node = range.startContainer;
    if (node.nodeType !== Node.TEXT_NODE) return false;
    if (node.parentElement && node.parentElement.closest('a')) return false;

    const text = node.textContent || '';
    const before = text.slice(0, range.startOffset);
    const m = before.match(/(https?:\/\/\S+)(\s)$/i);
    if (!m) return false;

    const urlText = m[1];
    const urlStart = before.length - m[0].length;

    const a = document.createElement('a');
    a.href = urlText;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = urlText;

    const wrapRange = document.createRange();
    wrapRange.setStart(node, urlStart);
    wrapRange.setEnd(node, urlStart + urlText.length);
    wrapRange.deleteContents();
    wrapRange.insertNode(a);

    const after = document.createRange();
    after.setStartAfter(a);
    after.collapse(true);
    sel.removeAllRanges();
    sel.addRange(after);
    return true;
  } catch (err) {
    // Non-critical auto-enhancement
    return false;
  }
}
