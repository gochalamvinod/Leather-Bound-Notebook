import { BookData, BookDimensions, BookshelfEntry, CoverTheme, UserEntry, VaultData } from './notebook';

/**
 * Standard API status endpoint response: GET /api/status
 */
export interface StatusResponse {
  setupNeeded: boolean;
  unlocked: boolean;
  currentUser: string | null;
  isAdmin?: boolean;
  bookCount: number;
  notebooks: BookshelfEntry[];
  users: UserEntry[];
  lockedOut: boolean;
  remainingSeconds: number;
  error?: string;
}

export type ApiStatusResponse = StatusResponse;

/**
 * Public library index response: GET /api/library
 */
export interface LibraryResponse {
  ok: true;
  notebooks: BookshelfEntry[];
  users: UserEntry[];
}

export type ApiLibraryResponse = LibraryResponse;

/**
 * Setup/Register payload: POST /api/setup, POST /api/users/register, POST /api/auth/register
 */
export interface SetupRequest {
  password: string;
  username?: string;
  notebookTitle?: string;
  coverColor?: CoverTheme;
}

export type ApiRegisterRequest = SetupRequest;

/**
 * Standard Auth Success payload returned by setup, unlock, switch, create, and rename
 */
export interface SetupResponse {
  ok: true;
  user: string;
  vault: VaultData;
  activeBookId: string;
  notebook: BookData;
  error?: string;
}

export type ApiAuthSuccessResponse = SetupResponse;

/**
 * Unlock/Login payload: POST /api/unlock, POST /api/users/login, POST /api/auth/login
 */
export interface UnlockRequest {
  password: string;
  username?: string;
  bookId?: string;
}

export type ApiUnlockRequest = UnlockRequest;

export type UnlockResponse = SetupResponse;

/**
 * Simple success response (e.g. POST /api/lock, POST /api/auth/logout, POST /api/change-password)
 */
export interface OkResponse {
  ok: true;
  message?: string;
  error?: string;
}

export type ApiOkResponse = OkResponse;

/**
 * User me response: GET /api/users/me
 */
export interface UserMeResponse {
  ok: true;
  user: string;
  userId?: string | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  preferredName?: string | null;
  displayName?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  preferred_name?: string | null;
  role?: string;
  authProvider?: string;
  googleId?: string | null;
  hasGoogleAuth?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  tier?: 'classic' | 'premium' | 'ultimate';
  storageUsed?: number;
  maxBooks?: number;
  maxPagesPerBook?: number;
  maxTotalStorageBytes?: number;
  maxVideoSizeBytes?: number;
}

export type ApiUserMeResponse = UserMeResponse;

export interface UpdateProfileRequest {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  preferredName?: string;
}

export interface UpdateProfileResponse {
  ok: boolean;
  success?: boolean;
  message?: string;
  user?: string;
  userId?: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  preferredName?: string | null;
  displayName?: string;
  usernameChanged?: boolean;
  error?: string;
}

export interface CheckEmailResponse {
  ok: boolean;
  email: string;
  available: boolean;
  isCurrent?: boolean;
  message?: string;
  error?: string;
}

/**
 * Get active notebook response: GET /api/notebook
 */
export type NotebookResponse = SetupResponse;
export type ApiNotebookResponse = SetupResponse;

/**
 * Save notebook request: POST /api/notebook or POST /api/save
 */
export interface SaveNotebookRequest {
  notebook?: Partial<BookData> & { id?: string };
  vault?: VaultData;
}

export type ApiSaveNotebookRequest = SaveNotebookRequest;

/**
 * Save notebook response: POST /api/notebook or POST /api/save
 */
export interface SaveNotebookResponse {
  ok: true;
  updatedAt: string;
  user: string;
  vault: VaultData;
  notebook: BookData;
  error?: string;
}

export type ApiSaveNotebookResponse = SaveNotebookResponse;

/**
 * Books list response: GET /api/books
 */
export interface BooksListResponse {
  ok: true;
  user: string;
  activeBookId: string;
  books: BookshelfEntry[];
}

export type ApiBooksListResponse = BooksListResponse;

/**
 * Create book request: POST /api/books/create
 */
export interface CreateBookRequest {
  title?: string;
  coverColor?: CoverTheme;
  dimensions?: BookDimensions;
}

export type ApiCreateBookRequest = CreateBookRequest;

/**
 * Update dimensions request: POST /api/books/update-dimensions
 */
export interface UpdateDimensionsRequest {
  bookId: string;
  dimensions: BookDimensions;
}

export type ApiUpdateDimensionsRequest = UpdateDimensionsRequest;

/**
 * Admin Increase Dimension Quota request: POST /api/admin/books/increase-dimension-quota
 */
export interface AdminIncreaseDimensionQuotaRequest {
  bookId: string;
  owner?: string;
  extraCount?: number;
  newLimit?: number;
  resetUsed?: boolean;
}

/**
 * Switch book request: POST /api/books/switch
 */
export interface SwitchBookRequest {
  bookId: string;
}

export type ApiSwitchBookRequest = SwitchBookRequest;

/**
 * Delete book request: POST /api/books/delete or DELETE /api/books/:id
 */
export interface DeleteBookRequest {
  bookId: string;
}

export type ApiDeleteBookRequest = DeleteBookRequest;

/**
 * Rename book request: POST /api/books/rename or PUT /api/books/:id
 */
export interface RenameBookRequest {
  bookId: string;
  title?: string;
  coverColor?: CoverTheme;
  dimensions?: BookDimensions;
}

export type ApiRenameBookRequest = RenameBookRequest;

/**
 * Change password request: POST /api/change-password
 */
export interface ChangePasswordRequest {
  newPassword: string;
}

export type ApiChangePasswordRequest = ChangePasswordRequest;

/**
 * Image upload request (base64 payload): POST /api/images or POST /api/images/upload
 */
export interface ImageUploadRequest {
  data: string;
  ext?: string;
}

export type ApiImageUploadRequest = ImageUploadRequest;

/**
 * Image upload response: POST /api/images or POST /api/images/upload
 */
export interface ImageUploadResponse {
  ok: true;
  url: string;
  filename: string;
  encrypted: true;
  error?: string;
}

export type ApiImageUploadResponse = ImageUploadResponse;

/**
 * Media upload response: POST /api/media/upload or POST /api/images/raw
 */
export interface MediaUploadResponse {
  ok: true;
  url: string;
  mediaUrl: string;
  imageUrl?: string;
  filename: string;
  size: number;
  isVideo: boolean;
  isAudio: boolean;
  ext: string;
  encrypted: true;
  hlsPlaylistUrl?: string;
  hlsMasterUrl?: string;
  error?: string;
}

export type ApiMediaUploadResponse = MediaUploadResponse;

/**
 * Link preview response: GET /api/link-preview?url=...
 */
export interface LinkPreviewResponse {
  ok: boolean;
  title?: string;
  description?: string;
  image?: string | null;
  domain?: string;
  url?: string;
  error?: string;
}

export type ApiLinkPreviewResponse = LinkPreviewResponse;

/**
 * Web search item result
 */
export interface SearchResultItem {
  title: string;
  snippet: string;
  url: string;
  icon?: string;
  source: string;
}

export type ApiSearchResultItem = SearchResultItem;

/**
 * Web search response: GET /api/search?q=...
 */
export interface SearchResponse {
  ok: true;
  results: SearchResultItem[];
  error?: string;
}

export type ApiSearchResponse = SearchResponse;

/**
 * YouTube search item result
 */
export interface YouTubeResultItem {
  id: string;
  title: string;
  channel: string;
  duration: string;
  thumbnail: string;
}

export type ApiYouTubeResultItem = YouTubeResultItem;

/**
 * YouTube search response: GET /api/youtube-search?q=...
 */
export interface YouTubeSearchResponse {
  ok: true;
  results: YouTubeResultItem[];
  error?: string;
}

export type ApiYouTubeSearchResponse = YouTubeSearchResponse;

/**
 * Standard API error response
 */
export interface ApiErrorResponse {
  error: string;
  lockedOut?: boolean;
  remainingSeconds?: number;
  attemptsRemaining?: number;
  message?: string;
}

/**
 * System and resource statistics for admin diagnostics
 */
export interface AdminSystemStats {
  memoryUsage?: number | string;
  nodeVersion?: string;
  platform?: string;
  dataDirSize?: number | string;
  databaseType?: string;
  activeSessions?: number;
  [key: string]: any;
}

export type ApiAdminSystemStats = AdminSystemStats;

/**
 * Admin dashboard status response: GET /api/admin/status
 */
export interface AdminStatusResponse {
  ok?: boolean;
  userCount?: number;
  totalUsers?: number;
  bookCount?: number;
  totalBooks?: number;
  logCount?: number;
  totalLogs?: number;
  adminUser?: string;
  dataDir?: string;
  uptimeSeconds?: number;
  uptime?: number;
  version?: string | number;
  timestamp?: string;
  systemStats?: AdminSystemStats;
  error?: string;
}

export type ApiAdminStatusResponse = AdminStatusResponse;

/**
 * Admin User representation: GET /api/admin/users
 */
export interface AdminUser {
  id?: string;
  username: string;
  displayName?: string;
  role?: 'admin' | 'user' | string;
  tier?: 'classic' | 'premium' | 'ultimate' | string;
  isAdmin: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  bookCount: number;
  sizeBytes?: number;
  lastActive?: string;
}

export type ApiAdminUser = AdminUser;

/**
 * Admin users list response: GET /api/admin/users
 */
export interface AdminUsersListResponse {
  ok: true;
  users: AdminUser[];
  total: number;
  error?: string;
}

export type ApiAdminUsersListResponse = AdminUsersListResponse;

/**
 * Admin create user request: POST /api/admin/users/create
 */
export interface AdminCreateUserRequest {
  username: string;
  password: string;
  notebookTitle?: string;
  coverColor?: CoverTheme;
  role?: string;
}

export type ApiAdminCreateUserRequest = AdminCreateUserRequest;

/**
 * Admin create user response: POST /api/admin/users/create
 */
export interface AdminCreateUserResponse {
  ok: true;
  user: string;
  bookCount?: number;
  message?: string;
  error?: string;
}

export type ApiAdminCreateUserResponse = AdminCreateUserResponse;

/**
 * Admin delete user request: POST /api/admin/users/delete
 */
export interface AdminDeleteUserRequest {
  username: string;
}

export type ApiAdminDeleteUserRequest = AdminDeleteUserRequest;

/**
 * Admin delete user response: POST /api/admin/users/delete
 */
export interface AdminDeleteUserResponse {
  ok: true;
  deletedUser: string;
  fileRemoved?: boolean;
  message?: string;
  error?: string;
}

export type ApiAdminDeleteUserResponse = AdminDeleteUserResponse;

/**
 * Admin reset password request: POST /api/admin/users/reset-password
 */
export interface AdminResetPasswordRequest {
  username: string;
  newPassword: string;
}

export type ApiAdminResetPasswordRequest = AdminResetPasswordRequest;

/**
 * Admin reset password response: POST /api/admin/users/reset-password
 */
export interface AdminResetPasswordResponse {
  ok: true;
  user: string;
  message: string;
  error?: string;
}

export type ApiAdminResetPasswordResponse = AdminResetPasswordResponse;

/**
 * Admin book representation: GET /api/admin/books, GET /api/admin/books/:username
 */
export interface AdminBook {
  id: string;
  userId?: string;
  username?: string;
  owner?: string;
  user?: string;
  title: string;
  pageCount: number;
  coverColor?: CoverTheme | string;
  dimensions?: BookDimensions;
  createdAt?: string;
  updatedAt: string;
}

export type ApiAdminBook = AdminBook;

/**
 * Admin books list response: GET /api/admin/books
 */
export interface AdminBooksListResponse {
  ok: true;
  books: (AdminBook | BookshelfEntry)[];
  total: number;
  error?: string;
}

export type ApiAdminBooksListResponse = AdminBooksListResponse;

/**
 * Admin user books list response: GET /api/admin/books/:username
 */
export interface AdminUserBooksResponse {
  ok: true;
  user: string;
  books: (AdminBook | BookshelfEntry)[];
  total: number;
  error?: string;
}

export type ApiAdminUserBooksResponse = AdminUserBooksResponse;

/**
 * Admin delete book request: POST /api/admin/books/delete
 */
export interface AdminDeleteBookRequest {
  bookId: string;
  username?: string;
}

export type ApiAdminDeleteBookRequest = AdminDeleteBookRequest;

/**
 * Admin delete book response: POST /api/admin/books/delete
 */
export interface AdminDeleteBookResponse {
  ok: true;
  deletedBookId: string;
  owner?: string;
  message?: string;
  error?: string;
}

export type ApiAdminDeleteBookResponse = AdminDeleteBookResponse;

/**
 * Admin edit/rename book request: POST /api/admin/books/edit
 */
export interface AdminEditBookRequest {
  bookId: string;
  owner?: string;
  title?: string;
  coverColor?: CoverTheme | string;
}

export type ApiAdminEditBookRequest = AdminEditBookRequest;

/**
 * Admin transfer book request: POST /api/admin/books/transfer
 */
export interface AdminTransferBookRequest {
  bookId: string;
  fromUser?: string;
  toUser: string;
}

export type ApiAdminTransferBookRequest = AdminTransferBookRequest;

/**
 * Admin create book request: POST /api/admin/books/create
 */
export interface AdminCreateBookRequest {
  owner: string;
  title: string;
  coverColor?: CoverTheme | string;
}

export type ApiAdminCreateBookRequest = AdminCreateBookRequest;

/**
 * Admin edit user request: POST /api/admin/users/edit
 */
export interface AdminEditUserRequest {
  username: string;
  newUsername?: string;
  displayName?: string;
  role?: string;
  tier?: string;
}

export type ApiAdminEditUserRequest = AdminEditUserRequest;

/**
 * Admin unlock user request: POST /api/admin/users/unlock
 */
export interface AdminUnlockUserRequest {
  username?: string;
}

export type ApiAdminUnlockUserRequest = AdminUnlockUserRequest;

/**
 * Audit log action type
 */
export type AuditAction =
  | 'USER_LOGIN'
  | 'USER_REGISTER'
  | 'USER_LOCK'
  | 'ADMIN_USER_CREATE'
  | 'ADMIN_USER_DELETE'
  | 'ADMIN_PASSWORD_RESET'
  | 'ADMIN_BOOK_DELETE'
  | 'UNAUTHORIZED_ADMIN_ACCESS'
  | 'FORBIDDEN_ADMIN_ACCESS'
  | 'LOGS_CLEARED'
  | 'LOG_ENTRY_DELETED'
  | 'SYSTEM_BOOT'
  | string;

export type ApiAuditAction = AuditAction;

/**
 * Audit log entry status
 */
export type AuditLogStatus = 'SUCCESS' | 'FAILED' | 'PENDING' | 'WARNING' | string;

/**
 * Encrypted/Decrypted Audit Log Entry: GET /api/admin/logs
 */
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType?: string;
  action?: AuditAction;
  username?: string;
  actor?: string;
  ipAddress?: string;
  ip?: string;
  userAgent?: string;
  resource?: string;
  target?: string;
  status: AuditLogStatus;
  details?: string;
  raw?: Record<string, any> | string;
  metadata?: Record<string, any>;
}

export type ApiAuditLogEntry = AuditLogEntry;

/**
 * Admin audit logs query parameters: GET /api/admin/logs
 */
export interface AdminLogsQuery {
  actor?: string;
  action?: string;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export type ApiAdminLogsQuery = AdminLogsQuery;

/**
 * Admin audit logs response: GET /api/admin/logs
 */
export interface AdminLogsResponse {
  ok: true;
  total: number;
  limit: number;
  offset: number;
  logs: AuditLogEntry[];
  error?: string;
}

export type ApiAdminLogsResponse = AdminLogsResponse;

/**
 * Admin clear logs response: POST /api/admin/logs/clear
 */
export interface AdminClearLogsResponse {
  ok: true;
  message: string;
  clearedAt: string;
  error?: string;
}

export type ApiAdminClearLogsResponse = AdminClearLogsResponse;

/**
 * Admin delete individual audit log request: POST /api/admin/logs/delete
 */
export interface AdminDeleteLogRequest {
  id?: string;
  logId?: string;
}

export type ApiAdminDeleteLogRequest = AdminDeleteLogRequest;

/**
 * Admin delete individual audit log response: POST /api/admin/logs/delete
 */
export interface AdminDeleteLogResponse {
  ok: boolean;
  message?: string;
  id?: string;
  deletedLogId?: string;
  error?: string;
}

export type ApiAdminDeleteLogResponse = AdminDeleteLogResponse;

/**
 * Admin God Mode Page Data representation
 */
export interface AdminPageData {
  id: string;
  pageIndex?: number;
  html: string;
  font?: string;
  fontSize?: string;
  drawings?: any;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Admin God Mode Notebook Details with decrypted pages
 */
export interface AdminNotebookDetails {
  id: string;
  title: string;
  coverColor?: CoverTheme | string;
  owner?: string;
  user?: string;
  createdAt?: string;
  updatedAt?: string;
  pages: AdminPageData[];
}

/**
 * Admin God Mode Get Notebook response: GET /api/admin/notebooks/:bookId
 */
export interface AdminGetNotebookResponse {
  ok: boolean;
  book?: AdminNotebookDetails;
  notebook?: AdminNotebookDetails;
  message?: string;
  error?: string;
}

export type ApiAdminGetNotebookResponse = AdminGetNotebookResponse;

/**
 * Admin God Mode Save Page request: POST /api/admin/notebooks/:bookId/pages/:pageId
 */
export interface AdminSavePageRequest {
  html: string;
  font?: string;
  fontSize?: string;
  drawings?: any;
  title?: string;
}

export type ApiAdminSavePageRequest = AdminSavePageRequest;

/**
 * Admin God Mode Save Page response: POST /api/admin/notebooks/:bookId/pages/:pageId
 */
export interface AdminSavePageResponse {
  ok: boolean;
  page?: AdminPageData;
  message?: string;
  error?: string;
}

export type ApiAdminSavePageResponse = AdminSavePageResponse;

/**
 * Admin God Mode Save Notebook request: POST /api/admin/notebooks/:bookId/save
 */
export interface AdminSaveNotebookRequest {
  book?: Partial<AdminNotebookDetails>;
  notebook?: Partial<AdminNotebookDetails>;
  pages?: AdminPageData[];
  title?: string;
  coverColor?: CoverTheme | string;
}

export type ApiAdminSaveNotebookRequest = AdminSaveNotebookRequest;

/**
 * Admin God Mode Save Notebook response: POST /api/admin/notebooks/:bookId/save
 */
export interface AdminSaveNotebookResponse {
  ok: boolean;
  book?: AdminNotebookDetails;
  message?: string;
  error?: string;
}

export type ApiAdminSaveNotebookResponse = AdminSaveNotebookResponse;

/**
 * Emergency backup restore request: POST /api/admin/emergency/import
 */
export interface AdminEmergencyImportRequest {
  password: string;
  fileData?: string; // base64 payload
  zipBase64?: string;
}

export type ApiAdminEmergencyImportRequest = AdminEmergencyImportRequest;

/**
 * Emergency backup restore response: POST /api/admin/emergency/import
 */
export interface AdminEmergencyImportResponse {
  ok: boolean;
  message?: string;
  stats?: {
    usersRestored: number;
    booksRestored: number;
    filesRestored: number;
    timestamp?: string;
  };
  error?: string;
}

export type ApiAdminEmergencyImportResponse = AdminEmergencyImportResponse;

/**
 * Emergency backup password verification response: POST /api/admin/emergency/verify-password
 */
export interface AdminEmergencyVerifyPasswordResponse {
  ok: boolean;
  valid: boolean;
  entriesCount?: number;
  manifest?: {
    type?: string;
    version?: string;
    timestamp?: string;
    totalEntries?: number;
  };
  message?: string;
  error?: string;
}

export type ApiAdminEmergencyVerifyPasswordResponse = AdminEmergencyVerifyPasswordResponse;

/**
 * Admin check user password response: POST /api/admin/users/check-password
 */
export interface AdminCheckUserPasswordResponse {
  ok: boolean;
  valid: boolean;
  username?: string;
  bookCount?: number;
  message?: string;
  error?: string;
}

export type ApiAdminCheckUserPasswordResponse = AdminCheckUserPasswordResponse;

/**
 * Re-export OTP types from ./otp
 */
export * from './otp';

