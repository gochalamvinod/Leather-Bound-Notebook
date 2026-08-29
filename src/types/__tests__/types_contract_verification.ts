/**
 * Compile-time and runtime type contract verification suite.
 * Validates structural integrity and type conformance across all core domain models and API contracts.
 */

import {
  CoverTheme,
  CoverColorOption,
  FontOption,
  FontSize,
  PageData,
  BookData,
  VaultData,
  BookshelfEntry,
  UserEntry,
  SaveStatus,
  ActiveSlot,
  LockTab,
  EmojiCategory,
  EmojiItem,
  SpreadState,
  MediaUploadState,
  ImageOverlayState,
  UrlClassification,
  AuthContextType,
  VaultContextType,
} from '../notebook';

import {
  StatusResponse,
  LibraryResponse,
  SetupRequest,
  SetupResponse,
  UnlockRequest,
  UnlockResponse,
  OkResponse,
  UserMeResponse,
  SaveNotebookRequest,
  SaveNotebookResponse,
  BooksListResponse,
  CreateBookRequest,
  SwitchBookRequest,
  DeleteBookRequest,
  RenameBookRequest,
  ChangePasswordRequest,
  ImageUploadRequest,
  ImageUploadResponse,
  MediaUploadResponse,
  LinkPreviewResponse,
  SearchResultItem,
  SearchResponse,
  YouTubeResultItem,
  YouTubeSearchResponse,
  ApiErrorResponse,
  AdminSystemStats,
  AdminStatusResponse,
  AdminUser,
  AdminUsersListResponse,
  AdminCreateUserRequest,
  AdminCreateUserResponse,
  AdminDeleteUserRequest,
  AdminDeleteUserResponse,
  AdminResetPasswordRequest,
  AdminResetPasswordResponse,
  AdminBook,
  AdminBooksListResponse,
  AdminUserBooksResponse,
  AdminDeleteBookRequest,
  AdminDeleteBookResponse,
  AdminDeleteLogRequest,
  AdminDeleteLogResponse,
  AuditAction,
  AuditLogStatus,
  AuditLogEntry,
  AdminLogsQuery,
  AdminLogsResponse,
  AdminClearLogsResponse,
} from '../api';

import {
  FlipDirection,
  PlayFlipParams,
  FlipEngine,
  SnapshotOptions,
} from '../flip';

import { api } from '../../lib/api/client';

// 1. Domain Types Verification
export const coverThemeBrown: CoverTheme = 'brown';
export const coverThemeGreen: CoverTheme = 'green';
export const coverThemeNavy: CoverTheme = 'navy';
export const coverThemeBurgundy: CoverTheme = 'burgundy';
export const coverThemeBlack: CoverTheme = 'black';

export const sampleCoverOption: CoverColorOption = {
  value: coverThemeBrown,
  label: 'Classic Brown',
  chipClass: 'chip-brown',
  colorHex: '#5a3d28',
};

export const sampleFontOption: FontOption = {
  label: 'Georgia',
  value: 'Georgia, serif',
};

export const sampleFontSize: FontSize = '18px';

export const samplePage: PageData = {
  id: 'p-1',
  font: sampleFontOption.value,
  fontSize: sampleFontSize,
  html: '<p>Hello 3D Notebook</p>',
  createdAt: '2026-08-22T00:00:00.000Z',
  updatedAt: '2026-08-22T00:00:00.000Z',
};

export const sampleBook: BookData = {
  id: 'book-1',
  title: 'My Leatherbound Journal',
  coverColor: coverThemeGreen,
  createdAt: '2026-08-22T00:00:00.000Z',
  updatedAt: '2026-08-22T00:00:00.000Z',
  pages: [samplePage],
  owner: 'alice',
};

export const sampleVault: VaultData = {
  version: 2,
  activeBookId: 'book-1',
  books: [sampleBook],
  user: 'alice',
};

export const sampleBookshelfEntry: BookshelfEntry = {
  id: 'book-1',
  title: 'My Leatherbound Journal',
  coverColor: coverThemeBurgundy,
  pageCount: 1,
  updatedAt: '2026-08-22T00:00:00.000Z',
  owner: 'alice',
  user: 'alice',
  createdAt: '2026-08-22T00:00:00.000Z',
};

export const sampleUserEntry: UserEntry = {
  username: 'alice',
  displayName: 'Alice In Wonderland',
  bookCount: 1,
  lastActive: '2026-08-22T00:00:00.000Z',
};

export const sampleSaveStatus: SaveStatus = 'Saved';
export const sampleSlot: ActiveSlot = 'left';
export const sampleLockTab: LockTab = 'notebooks';
export const sampleEmojiCategory: EmojiCategory = 'books';

export const sampleEmojiItem: EmojiItem = {
  emoji: '📖',
  name: 'Open Book',
  category: sampleEmojiCategory,
  keywords: ['book', 'read', 'literature'],
};

export const sampleSpread: SpreadState = {
  leftIndex: 0,
  rightIndex: 1,
  totalSpreads: 3,
  currentSpread: 0,
  hasLeftPage: true,
  hasRightPage: true,
};

export const sampleMediaUpload: MediaUploadState = {
  uploading: false,
  progress: 100,
  loadedBytes: 1024,
  totalBytes: 1024,
  filename: 'video.mp4',
  isVideo: true,
  isAudio: false,
};

export const sampleImageOverlay: ImageOverlayState = {
  visible: false,
  targetImg: null,
  slot: sampleSlot,
  x: 100,
  y: 200,
  width: 300,
  height: 200,
};

export const sampleUrlClassification: UrlClassification = {
  type: 'video',
  embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
  canonicalUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
};

export const sampleAuthContext: AuthContextType = {
  isUnlocked: true,
  currentUser: 'alice',
  setupNeeded: false,
  lockedOut: false,
  remainingSeconds: 0,
  notebooks: [sampleBookshelfEntry],
  users: [sampleUserEntry],
  checkStatus: async () => {},
  unlock: async () => true,
  setup: async () => true,
  lock: async () => {},
};

export const sampleVaultContext: VaultContextType = {
  vault: sampleVault,
  activeBook: sampleBook,
  books: [sampleBookshelfEntry],
  saveStatus: sampleSaveStatus,
  saveError: null,
  switchBook: async () => {},
  createBook: async () => {},
  renameBook: async () => {},
  deleteBook: async () => {},
  updateActiveBook: () => {},
  triggerManualSave: async () => {},
};

// 2. API Types Verification
export const sampleStatusResponse: StatusResponse = {
  setupNeeded: false,
  unlocked: true,
  currentUser: 'alice',
  bookCount: 1,
  notebooks: [sampleBookshelfEntry],
  users: [sampleUserEntry],
  lockedOut: false,
  remainingSeconds: 0,
};

export const sampleLibraryResponse: LibraryResponse = {
  ok: true,
  notebooks: [sampleBookshelfEntry],
  users: [sampleUserEntry],
};

export const sampleSetupRequest: SetupRequest = {
  password: 'SecretPassword123!',
  username: 'alice',
  notebookTitle: 'Alice Codex',
  coverColor: coverThemeNavy,
};

export const sampleSetupResponse: SetupResponse = {
  ok: true,
  user: 'alice',
  vault: sampleVault,
  activeBookId: 'book-1',
  notebook: sampleBook,
};

export const sampleUnlockRequest: UnlockRequest = {
  password: 'SecretPassword123!',
  username: 'alice',
  bookId: 'book-1',
};

export const sampleOkResponse: OkResponse = {
  ok: true,
};

export const sampleUserMeResponse: UserMeResponse = {
  ok: true,
  user: 'alice',
};

export const sampleSaveRequest: SaveNotebookRequest = {
  notebook: sampleBook,
  vault: sampleVault,
};

export const sampleSaveResponse: SaveNotebookResponse = {
  ok: true,
  updatedAt: '2026-08-22T00:00:00.000Z',
  user: 'alice',
  vault: sampleVault,
  notebook: sampleBook,
};

export const sampleBooksListResponse: BooksListResponse = {
  ok: true,
  user: 'alice',
  activeBookId: 'book-1',
  books: [sampleBookshelfEntry],
};

export const sampleCreateBookRequest: CreateBookRequest = {
  title: 'Second Journal',
  coverColor: coverThemeBlack,
};

export const sampleSwitchBookRequest: SwitchBookRequest = {
  bookId: 'book-2',
};

export const sampleDeleteBookRequest: DeleteBookRequest = {
  bookId: 'book-2',
};

export const sampleRenameBookRequest: RenameBookRequest = {
  bookId: 'book-1',
  title: 'Renamed Journal',
  coverColor: coverThemeBrown,
};

export const sampleChangePasswordRequest: ChangePasswordRequest = {
  newPassword: 'NewSecretPassword456!',
};

export const sampleImageUploadRequest: ImageUploadRequest = {
  data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  ext: 'png',
};

export const sampleImageUploadResponse: ImageUploadResponse = {
  ok: true,
  url: '/images/img_123.png',
  filename: 'img_123.png',
  encrypted: true,
};

export const sampleMediaUploadResponse: MediaUploadResponse = {
  ok: true,
  url: '/media/video_123.mp4',
  mediaUrl: '/media/video_123.mp4',
  filename: 'video_123.mp4',
  size: 2048576,
  isVideo: true,
  isAudio: false,
  ext: 'mp4',
  encrypted: true,
};

export const sampleLinkPreview: LinkPreviewResponse = {
  ok: true,
  title: 'Leathercrafting Guide',
  description: 'Ancient art of bookbinding.',
  image: 'https://example.com/cover.jpg',
  domain: 'example.com',
  url: 'https://example.com/guide',
};

export const sampleSearchResult: SearchResultItem = {
  title: 'Bookbinding Basics',
  snippet: 'Learn how to bind leather journals.',
  url: 'https://example.com/leather',
  source: 'duckduckgo',
};

export const sampleSearchResponse: SearchResponse = {
  ok: true,
  results: [sampleSearchResult],
};

export const sampleYouTubeResult: YouTubeResultItem = {
  id: 'dQw4w9WgXcQ',
  title: 'Never Gonna Give You Up',
  channel: 'Rick Astley',
  duration: '3:33',
  thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
};

export const sampleYouTubeSearchResponse: YouTubeSearchResponse = {
  ok: true,
  results: [sampleYouTubeResult],
};

export const sampleApiError: ApiErrorResponse = {
  error: 'Invalid credentials',
  lockedOut: false,
  remainingSeconds: 0,
  attemptsRemaining: 2,
};

// 3. Admin Types Verification
export const sampleSystemStats: AdminSystemStats = {
  memoryUsage: 128000000,
  nodeVersion: 'v20.0.0',
  platform: 'win32',
  dataDirSize: 1048576,
  databaseType: 'sqlite',
  activeSessions: 2,
};

export const sampleAdminStatusResponse: AdminStatusResponse = {
  ok: true,
  userCount: 5,
  totalUsers: 5,
  bookCount: 12,
  totalBooks: 12,
  logCount: 85,
  totalLogs: 85,
  adminUser: 'admin',
  dataDir: '/data',
  uptimeSeconds: 3600,
  uptime: 3600,
  version: '2.0.0',
  timestamp: '2026-08-22T00:00:00.000Z',
  systemStats: sampleSystemStats,
};

export const sampleAdminUser: AdminUser = {
  id: 'usr-1',
  username: 'admin',
  displayName: 'Master Administrator',
  role: 'admin',
  isAdmin: true,
  createdAt: '2026-08-22T00:00:00.000Z',
  updatedAt: '2026-08-22T00:00:00.000Z',
  bookCount: 3,
  sizeBytes: 4096,
  lastActive: '2026-08-22T00:00:00.000Z',
};

export const sampleAdminUsersListResponse: AdminUsersListResponse = {
  ok: true,
  users: [sampleAdminUser],
  total: 1,
};

export const sampleAdminCreateUserRequest: AdminCreateUserRequest = {
  username: 'bob',
  password: 'BobSecurePassword123!',
  notebookTitle: "Bob's Journal",
  coverColor: 'navy',
  role: 'user',
};

export const sampleAdminCreateUserResponse: AdminCreateUserResponse = {
  ok: true,
  user: 'bob',
  bookCount: 1,
  message: 'User bob created successfully.',
};

export const sampleAdminDeleteUserRequest: AdminDeleteUserRequest = {
  username: 'bob',
};

export const sampleAdminDeleteUserResponse: AdminDeleteUserResponse = {
  ok: true,
  deletedUser: 'bob',
  fileRemoved: true,
  message: 'User bob deleted successfully.',
};

export const sampleAdminResetPasswordRequest: AdminResetPasswordRequest = {
  username: 'bob',
  newPassword: 'NewBobPassword456!',
};

export const sampleAdminResetPasswordResponse: AdminResetPasswordResponse = {
  ok: true,
  user: 'bob',
  message: 'Password reset successfully.',
};

export const sampleAdminBook: AdminBook = {
  id: 'book-admin-1',
  userId: 'usr-1',
  username: 'admin',
  owner: 'admin',
  user: 'admin',
  title: 'Master Ledger',
  pageCount: 10,
  coverColor: 'brown',
  createdAt: '2026-08-22T00:00:00.000Z',
  updatedAt: '2026-08-22T00:00:00.000Z',
};

export const sampleAdminBooksListResponse: AdminBooksListResponse = {
  ok: true,
  books: [sampleAdminBook],
  total: 1,
};

export const sampleAdminUserBooksResponse: AdminUserBooksResponse = {
  ok: true,
  user: 'admin',
  books: [sampleAdminBook],
  total: 1,
};

export const sampleAdminDeleteBookRequest: AdminDeleteBookRequest = {
  bookId: 'book-admin-1',
  username: 'admin',
};

export const sampleAdminDeleteBookResponse: AdminDeleteBookResponse = {
  ok: true,
  deletedBookId: 'book-admin-1',
  owner: 'admin',
  message: 'Book deleted successfully.',
};

export const sampleAuditLogStatus: AuditLogStatus = 'SUCCESS';

export const sampleAuditLogEntry: AuditLogEntry = {
  id: 'log-1',
  timestamp: '2026-08-22T00:00:00.000Z',
  eventType: 'ADMIN_USER_CREATE',
  action: 'ADMIN_USER_CREATE',
  username: 'admin',
  actor: 'admin',
  ipAddress: '127.0.0.1',
  ip: '127.0.0.1',
  userAgent: 'Mozilla/5.0',
  resource: 'bob',
  target: 'bob',
  status: sampleAuditLogStatus,
  details: 'Created user bob',
  raw: { detail: 'test' },
  metadata: { ip: '127.0.0.1' },
};

export const sampleAdminLogsQuery: AdminLogsQuery = {
  actor: 'admin',
  action: 'ADMIN_USER_CREATE',
  status: 'SUCCESS',
  search: 'bob',
  limit: 50,
  offset: 0,
};

export const sampleAdminLogsResponse: AdminLogsResponse = {
  ok: true,
  total: 1,
  limit: 50,
  offset: 0,
  logs: [sampleAuditLogEntry],
};

export const sampleAdminClearLogsResponse: AdminClearLogsResponse = {
  ok: true,
  message: 'Audit logs cleared successfully.',
  clearedAt: '2026-08-22T00:00:00.000Z',
};

export const sampleAdminDeleteLogRequest: AdminDeleteLogRequest = {
  id: 'log-1',
  logId: 'log-1',
};

export const sampleAdminDeleteLogResponse: AdminDeleteLogResponse = {
  ok: true,
  message: 'Audit log entry deleted successfully.',
  id: 'log-1',
  deletedLogId: 'log-1',
};

export const sampleAuditAction: AuditAction = 'LOG_ENTRY_DELETED';

// 4. Flip 3D Types Verification
export const sampleFlipDirection: FlipDirection = 'next';

export const sampleFlipParams: PlayFlipParams = {
  direction: sampleFlipDirection,
  duration: 800,
  backHTML: '<div>Back page content</div>',
  backFont: 'Georgia, serif',
  backFontSize: '18px',
  onComplete: () => {},
};

export const sampleFlipEngine: FlipEngine = {
  isWebglAvailable: () => true,
  playFlip: async (_params: PlayFlipParams) => {},
  dispose: () => {},
};

export const sampleSnapshotOptions: SnapshotOptions = {
  width: 800,
  height: 600,
  scale: 1,
  backgroundColor: '#f8f5ee',
};

// 5. API Client Method Signature Contract Verification
export type ApiMethodContracts = {
  getStatus: () => Promise<StatusResponse>;
  getLibrary: () => Promise<LibraryResponse>;
  setup: (body: SetupRequest) => Promise<SetupResponse>;
  unlock: (body: UnlockRequest) => Promise<UnlockResponse>;
  lock: () => Promise<OkResponse>;
  getMe: () => Promise<UserMeResponse>;
  getNotebook: () => Promise<UnlockResponse>;
  saveNotebook: (body: SaveNotebookRequest) => Promise<SaveNotebookResponse>;
  getBooks: () => Promise<BooksListResponse>;
  createBook: (body: CreateBookRequest) => Promise<UnlockResponse>;
  switchBook: (body: SwitchBookRequest) => Promise<UnlockResponse>;
  deleteBook: (body: DeleteBookRequest) => Promise<UnlockResponse>;
  renameBook: (body: RenameBookRequest) => Promise<UnlockResponse>;
  changePassword: (body: ChangePasswordRequest) => Promise<OkResponse>;
  uploadImageBase64: (data: string, ext?: string) => Promise<ImageUploadResponse>;
  uploadMediaRaw: (body: Blob | ArrayBuffer, fileName: string, fileExt: string) => Promise<MediaUploadResponse>;
  deleteImage: (filename: string) => Promise<OkResponse>;
  getLinkPreview: (url: string) => Promise<LinkPreviewResponse>;
  searchWeb: (q: string) => Promise<SearchResponse>;
  searchYouTube: (q: string) => Promise<YouTubeSearchResponse>;
  getAdminStatus: () => Promise<AdminStatusResponse>;
  getAdminUsers: () => Promise<AdminUsersListResponse>;
  createAdminUser: (data: AdminCreateUserRequest) => Promise<AdminCreateUserResponse>;
  deleteAdminUser: (data: AdminDeleteUserRequest) => Promise<AdminDeleteUserResponse>;
  resetAdminPassword: (data: AdminResetPasswordRequest) => Promise<AdminResetPasswordResponse>;
  getAdminBooks: () => Promise<AdminBooksListResponse>;
  getAdminBooksForUser: (username: string) => Promise<AdminUserBooksResponse>;
  deleteAdminBook: (data: AdminDeleteBookRequest) => Promise<AdminDeleteBookResponse>;
  getAdminLogs: (query?: AdminLogsQuery) => Promise<AdminLogsResponse>;
  deleteAdminLog: (id: string) => Promise<AdminDeleteLogResponse>;
  clearAdminLogs: () => Promise<AdminClearLogsResponse>;
  exportAdminLogs: () => Promise<Blob>;
};

// Verify `api` client conforms to the contract
export const apiClientConformanceCheck: ApiMethodContracts = api;

export function verifyTypeContracts(): boolean {
  return Boolean(
    sampleCoverOption &&
    sampleFontOption &&
    samplePage &&
    sampleBook &&
    sampleVault &&
    sampleBookshelfEntry &&
    sampleUserEntry &&
    sampleSaveStatus &&
    sampleSlot &&
    sampleLockTab &&
    sampleEmojiItem &&
    sampleSpread &&
    sampleMediaUpload &&
    sampleImageOverlay &&
    sampleUrlClassification &&
    sampleAuthContext &&
    sampleVaultContext &&
    sampleStatusResponse &&
    sampleLibraryResponse &&
    sampleSetupRequest &&
    sampleSetupResponse &&
    sampleUnlockRequest &&
    sampleOkResponse &&
    sampleUserMeResponse &&
    sampleSaveRequest &&
    sampleSaveResponse &&
    sampleBooksListResponse &&
    sampleCreateBookRequest &&
    sampleSwitchBookRequest &&
    sampleDeleteBookRequest &&
    sampleRenameBookRequest &&
    sampleChangePasswordRequest &&
    sampleImageUploadRequest &&
    sampleImageUploadResponse &&
    sampleMediaUploadResponse &&
    sampleLinkPreview &&
    sampleSearchResponse &&
    sampleYouTubeSearchResponse &&
    sampleApiError &&
    sampleSystemStats &&
    sampleAdminStatusResponse &&
    sampleAdminUser &&
    sampleAdminUsersListResponse &&
    sampleAdminCreateUserRequest &&
    sampleAdminCreateUserResponse &&
    sampleAdminDeleteUserRequest &&
    sampleAdminDeleteUserResponse &&
    sampleAdminResetPasswordRequest &&
    sampleAdminResetPasswordResponse &&
    sampleAdminBook &&
    sampleAdminBooksListResponse &&
    sampleAdminUserBooksResponse &&
    sampleAdminDeleteBookRequest &&
    sampleAdminDeleteBookResponse &&
    sampleAuditLogEntry &&
    sampleAdminLogsQuery &&
    sampleAdminLogsResponse &&
    sampleAdminClearLogsResponse &&
    sampleAdminDeleteLogRequest &&
    sampleAdminDeleteLogResponse &&
    sampleAuditAction &&
    sampleFlipParams &&
    sampleFlipEngine &&
    sampleSnapshotOptions &&
    apiClientConformanceCheck
  );
}
