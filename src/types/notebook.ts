/**
 * Core domain types and interfaces for the Leatherbound Notebook application.
 */

export type CoverTheme = 'brown' | 'green' | 'navy' | 'burgundy' | 'black';

export interface CoverColorOption {
  value: CoverTheme;
  label: string;
  chipClass: string;
  colorHex: string;
}

export interface FontOption {
  label: string;
  value: string;
}

export type FontSize =
  | '12px'
  | '14px'
  | '16px'
  | '18px'
  | '20px'
  | '22px'
  | '24px'
  | '28px'
  | '32px'
  | '36px';

export interface PageData {
  id: string;
  font?: string;
  fontSize?: string;
  html: string;
  createdAt?: string;
  updatedAt?: string;
}

export type BookDimensionPreset =
  | 'classic'
  | 'compact'
  | 'a4'
  | 'square'
  | 'pocket'
  | 'photo'
  | 'wide'
  | 'custom';

export interface BookDimensions {
  preset?: BookDimensionPreset;
  width: number;             // Total spread width in px (e.g. 1140)
  height: number;            // Spread height in px (e.g. 840)
  aspectRatio: number;       // Width / Height (e.g. 1.36)
  dimensionChangeCount?: number; // Times modified (default 0)
  maxDimensionChanges?: number;  // Allowed modifications for free tier (default 5)
}

export interface BookData {
  id: string;
  title: string;
  coverColor: CoverTheme;
  createdAt: string;
  updatedAt: string;
  pages: PageData[];
  owner?: string;
  dimensions?: BookDimensions;
}

export interface VaultData {
  version: number;
  activeBookId: string;
  books: BookData[];
  user?: string;
}

export interface BookshelfEntry {
  id: string;
  title: string;
  coverColor: CoverTheme;
  pageCount: number;
  updatedAt: string;
  owner?: string;
  user?: string;
  createdAt?: string;
  dimensions?: BookDimensions;
}

export interface UserEntry {
  username: string;
  displayName?: string;
  bookCount?: number;
  lastActive?: string;
  isAdmin?: boolean;
  role?: string;
}

export type SaveStatus = 'saved' | 'saving' | 'editing' | 'error' | 'locked' | 'Saved' | 'Saving...' | 'Editing...' | 'Error' | 'Locked';

export type ActiveSlot = 'left' | 'right';

export type LockTab = 'notebooks' | 'login' | 'create';

export type EmojiCategory =
  | 'smileys'
  | 'gestures'
  | 'books'
  | 'nature'
  | 'food'
  | 'objects'
  | 'symbols';

export interface EmojiItem {
  emoji: string;
  name: string;
  category: EmojiCategory;
  keywords?: string[];
}

export interface SpreadState {
  leftIndex: number;
  rightIndex: number;
  totalSpreads: number;
  currentSpread: number;
  hasLeftPage: boolean;
  hasRightPage: boolean;
}

export interface MediaUploadState {
  uploading: boolean;
  progress: number;
  loadedBytes: number;
  totalBytes: number;
  filename: string;
  isAudio?: boolean;
  isVideo?: boolean;
}

export interface ImageOverlayState {
  visible: boolean;
  targetImg: HTMLImageElement | null;
  slot: ActiveSlot;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface UrlClassification {
  type: 'video' | 'embed' | 'card' | 'link';
  embedUrl?: string;
  canonicalUrl: string;
}

export interface AuthContextType {
  isUnlocked: boolean;
  currentUser: string | null;
  isAdmin?: boolean;
  setupNeeded: boolean;
  lockedOut: boolean;
  remainingSeconds: number;
  notebooks: BookshelfEntry[];
  users: UserEntry[];
  checkStatus: () => Promise<void>;
  unlock: (password: string, username?: string, bookId?: string) => Promise<boolean>;
  setup: (password: string, username?: string, notebookTitle?: string, coverColor?: CoverTheme) => Promise<boolean>;
  lock: () => Promise<void>;
}

export interface VaultContextType {
  vault: VaultData | null;
  activeBook: BookData | null;
  books: BookshelfEntry[];
  saveStatus: SaveStatus;
  saveError: string | null;
  switchBook: (bookId: string) => Promise<void>;
  createBook: (title: string, coverColor: CoverTheme) => Promise<void>;
  renameBook: (bookId: string, title?: string, coverColor?: CoverTheme) => Promise<void>;
  deleteBook: (bookId: string) => Promise<void>;
  updateActiveBook: (updater: (book: BookData) => BookData) => void;
  triggerManualSave: () => Promise<void>;
}
