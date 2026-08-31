import type {
  AdminBooksListResponse,
  AdminCheckUserPasswordResponse,
  AdminClearLogsResponse,
  AdminCreateBookRequest,
  AdminCreateUserRequest,
  AdminCreateUserResponse,
  AdminDeleteBookRequest,
  AdminDeleteBookResponse,
  AdminDeleteLogResponse,
  AdminDeleteUserRequest,
  AdminDeleteUserResponse,
  AdminEditBookRequest,
  AdminEditUserRequest,
  AdminEmergencyImportResponse,
  AdminEmergencyVerifyPasswordResponse,
  AdminGetNotebookResponse,
  AdminLogsQuery,
  AdminLogsResponse,
  AdminResetPasswordRequest,
  AdminResetPasswordResponse,
  AdminSaveNotebookRequest,
  AdminSaveNotebookResponse,
  AdminSavePageRequest,
  AdminSavePageResponse,
  AdminStatusResponse,
  AdminTransferBookRequest,
  AdminUnlockUserRequest,
  AdminUserBooksResponse,
  AdminUsersListResponse,
  BooksListResponse,
  ChangePasswordRequest,
  CreateBookRequest,
  DeleteBookRequest,
  ImageUploadResponse,
  LibraryResponse,
  LinkPreviewResponse,
  MediaUploadResponse,
  OkResponse,
  RenameBookRequest,
  SaveNotebookRequest,
  SaveNotebookResponse,
  SearchResponse,
  SetupRequest,
  SetupResponse,
  StatusResponse,
  SwitchBookRequest,
  UnlockRequest,
  UnlockResponse,
  UpdateDimensionsRequest,
  AdminIncreaseDimensionQuotaRequest,
  UserMeResponse,
  YouTubeSearchResponse,
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  ResetPasswordWithOtpRequest,
  GoogleAuthRequest,
} from '../../types/api';

/**
 * Standard typed HTTP request wrapper with cookie credentials and JSON/Blob support.
 */
async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  const isBinary =
    typeof FormData !== 'undefined' && options.body instanceof FormData ||
    typeof Blob !== 'undefined' && options.body instanceof Blob ||
    typeof ArrayBuffer !== 'undefined' && options.body instanceof ArrayBuffer;

  if (!headers.has('Content-Type') && !isBinary && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Transmit session cookie across all requests
  });

  let data: any = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const errorMsg =
      (typeof data === 'object' && data?.error) ||
      (typeof data === 'string' && data) ||
      `HTTP ${res.status}: ${res.statusText}`;
    const err: any = new Error(errorMsg);
    if (typeof data === 'object') {
      Object.assign(err, data);
    }
    err.status = res.status;
    throw err;
  }

  return data as T;
}

/**
 * Typed API Client exposing all Leatherbound Notebook REST endpoints.
 */
export const api = {
  /** Check vault lock status, user counts, and lockout timer */
  getStatus: () => request<StatusResponse>('/api/status'),

  /** Check if a candidate username is available or already taken */
  checkUsername: (username: string) =>
    request<{ ok: boolean; username: string; available: boolean; message: string }>(
      `/api/users/check-username?username=${encodeURIComponent(username)}`
    ),

  /** Get public bookshelf list and user accounts */
  getLibrary: () => request<LibraryResponse>('/api/library'),

  /** Initial vault creation or new user registration */
  setup: (body: SetupRequest) =>
    request<SetupResponse>('/api/setup', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  /** Unlock existing vault or user notebook with password */
  unlock: (body: UnlockRequest) =>
    request<UnlockResponse>('/api/unlock', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  /** Dispatch cryptographic 6-digit OTP code to email */
  sendOtp: (body: SendOtpRequest) =>
    request<SendOtpResponse>('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  /** Verify cryptographic OTP code for login/registration/recovery */
  verifyOtp: (body: VerifyOtpRequest) =>
    request<VerifyOtpResponse>('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  /** Get OTP cooldown and expiration status */
  getOtpStatus: (email: string, purpose = 'login') =>
    request<{ ok: boolean; hasActiveOtp: boolean; cooldownRemaining: number; expirationRemaining: number; remainingAttempts: number; isLocked: boolean }>(
      `/api/auth/otp-status?email=${encodeURIComponent(email)}&purpose=${encodeURIComponent(purpose)}`
    ),

  /** Reset account password with verified OTP */
  resetPasswordWithOtp: (body: ResetPasswordWithOtpRequest) =>
    request<OkResponse>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  /** Authenticate with Google / Gmail OAuth credential */
  googleAuth: (body: GoogleAuthRequest) =>
    request<SetupResponse & { email?: string; isNewUser?: boolean }>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  /** Lock the vault and invalidate the session cookie */
  lock: () =>
    request<OkResponse>('/api/lock', {
      method: 'POST',
    }),

  /** Get current authenticated user */
  getMe: () => request<UserMeResponse>('/api/users/me'),

  /** Fetch active notebook data and pages */
  getNotebook: () => request<UnlockResponse>('/api/notebook'),

  /** Persist notebook changes (autosave or explicit save) */
  saveNotebook: (body: SaveNotebookRequest) =>
    request<SaveNotebookResponse>('/api/notebook', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  /** List all books in the authenticated user's vault */
  getBooks: () => request<BooksListResponse>('/api/books'),

  /** Create a new notebook in the vault */
  createBook: (body: CreateBookRequest) =>
    request<UnlockResponse>('/api/books/create', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  /** Switch active notebook */
  switchBook: (body: SwitchBookRequest) =>
    request<UnlockResponse>('/api/books/switch', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  /** Delete a notebook from the vault (enforcing 1-book invariant) */
  deleteBook: (body: DeleteBookRequest) =>
    request<UnlockResponse>('/api/books/delete', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  /** Rename a notebook or change its leather cover theme */
  renameBook: (body: RenameBookRequest) =>
    request<UnlockResponse>('/api/books/rename', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  /** Update notebook page dimensions & aspect ratio */
  updateBookDimensions: (body: UpdateDimensionsRequest) =>
    request<UnlockResponse>('/api/books/update-dimensions', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  /** Admin: Increase or reset dimension modification quota for a book */
  adminIncreaseDimensionQuota: (body: AdminIncreaseDimensionQuotaRequest) =>
    request<OkResponse & { maxDimensionChanges?: number; dimensionChangeCount?: number }>(
      '/api/admin/books/increase-dimension-quota',
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    ),

  /** Change master vault password with re-encryption */
  changePassword: (body: ChangePasswordRequest) =>
    request<OkResponse>('/api/change-password', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  /** Upload base64 encoded image */
  uploadImageBase64: (data: string, ext?: string) =>
    request<ImageUploadResponse>('/api/images', {
      method: 'POST',
      body: JSON.stringify({ data, ext }),
    }),

  /** Upload raw binary file (image, video, audio) with streaming encryption */
  uploadMediaRaw: (body: Blob | ArrayBuffer, fileName: string, fileExt: string) =>
    request<MediaUploadResponse>('/api/media/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-File-Name': encodeURIComponent(fileName),
        'X-File-Ext': fileExt,
      },
      body,
    }),

  /** Delete encrypted image */
  deleteImage: (filename: string) =>
    request<OkResponse>(`/api/images/${encodeURIComponent(filename)}`, {
      method: 'DELETE',
    }),

  /** Fetch OpenGraph link preview card metadata */
  getLinkPreview: (url: string) =>
    request<LinkPreviewResponse>(`/api/link-preview?url=${encodeURIComponent(url)}`),

  /** Scrape DuckDuckGo web search results */
  searchWeb: (q: string) =>
    request<SearchResponse>(`/api/search?q=${encodeURIComponent(q)}`),

  /** Search YouTube embed videos */
  searchYouTube: (q: string) =>
    request<YouTubeSearchResponse>(`/api/youtube-search?q=${encodeURIComponent(q)}`),

  /** Check admin system status, uptime, user/book/log counts */
  getAdminStatus: () => request<AdminStatusResponse>('/api/admin/status'),

  /** List all registered users across the system */
  getAdminUsers: () => request<AdminUsersListResponse>('/api/admin/users'),

  /** Create a new user account with initial vault */
  createAdminUser: (data: AdminCreateUserRequest) =>
    request<AdminCreateUserResponse>('/api/admin/users/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** Delete a user and their encrypted vault */
  deleteAdminUser: (data: AdminDeleteUserRequest) =>
    request<AdminDeleteUserResponse>('/api/admin/users/delete', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** Force reset a user's password and re-encrypt vault */
  resetAdminPassword: (data: AdminResetPasswordRequest) =>
    request<AdminResetPasswordResponse>('/api/admin/users/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** List all notebooks across all users */
  getAdminBooks: () => request<AdminBooksListResponse>('/api/admin/books'),

  /** List notebooks belonging to a specific user */
  getAdminBooksForUser: (username: string) =>
    request<AdminUserBooksResponse>(`/api/admin/books/${encodeURIComponent(username)}`),

  /** Delete any notebook across the system */
  deleteAdminBook: (data: AdminDeleteBookRequest) =>
    request<AdminDeleteBookResponse>('/api/admin/books/delete', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** Edit / Rename notebook title and cover theme across any user */
  editAdminBook: (data: AdminEditBookRequest) =>
    request<OkResponse>('/api/admin/books/edit', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** Transfer notebook ownership from one user to another */
  transferAdminBook: (data: AdminTransferBookRequest) =>
    request<OkResponse>('/api/admin/books/transfer', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** Create a new notebook directly under any user */
  createAdminBook: (data: AdminCreateBookRequest) =>
    request<OkResponse>('/api/admin/books/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** Export a notebook as a JSON backup */
  exportAdminBook: async (bookId: string, owner?: string) => {
    const res = await fetch(`/api/admin/books/${encodeURIComponent(bookId)}/export?owner=${encodeURIComponent(owner || '')}`, {
      credentials: 'include',
    });
    if (!res.ok) {
      let errMsg = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const json = await res.json();
        if (json?.error) errMsg = json.error;
      } catch {}
      const err: any = new Error(errMsg);
      err.status = res.status;
      throw err;
    }
    const blob = await res.blob();
    if (typeof window !== 'undefined') {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notebook_${bookId}_backup.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
    return blob;
  },

  /** Edit user profile (displayName, role, newUsername) */
  editAdminUser: (data: AdminEditUserRequest) =>
    request<OkResponse>('/api/admin/users/edit', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** Clear failed login lockout state for user */
  unlockAdminUser: (data: AdminUnlockUserRequest) =>
    request<OkResponse>('/api/admin/users/unlock', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** Query encrypted audit logs with filters and pagination */
  getAdminLogs: (query?: AdminLogsQuery) => {
    const params = new URLSearchParams();
    if (query?.actor) params.set('actor', query.actor);
    if (query?.action) params.set('action', query.action);
    if (query?.status) params.set('status', query.status);
    if (query?.search) params.set('search', query.search);
    if (query?.limit !== undefined) params.set('limit', String(query.limit));
    if (query?.offset !== undefined) params.set('offset', String(query.offset));
    const qs = params.toString();
    return request<AdminLogsResponse>(`/api/admin/logs${qs ? `?${qs}` : ''}`);
  },

  /** Delete individual audit log entry by ID */
  deleteAdminLog: (id: string) =>
    request<AdminDeleteLogResponse>('/api/admin/logs/delete', {
      method: 'POST',
      body: JSON.stringify({ id }),
    }),

  /** Clear all audit logs and record LOGS_CLEARED event */
  clearAdminLogs: () =>
    request<AdminClearLogsResponse>('/api/admin/logs/clear', {
      method: 'POST',
    }),

  /** Export decrypted audit logs and trigger download */
  exportAdminLogs: async () => {
    const res = await fetch('/api/admin/logs/export', {
      credentials: 'include',
    });
    if (!res.ok) {
      let errMsg = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const json = await res.json();
        if (json?.error) errMsg = json.error;
      } catch {}
      const err: any = new Error(errMsg);
      err.status = res.status;
      throw err;
    }
    const blob = await res.blob();
    if (typeof window !== 'undefined') {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notebook_audit_logs_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
    return blob;
  },

  /**
   * Admin God Mode: Retrieve any user's notebook with full decrypted pages & HTML content
   */
  getAdminNotebook: (bookId: string) =>
    request<AdminGetNotebookResponse>(`/api/admin/notebooks/${encodeURIComponent(bookId)}`),

  /**
   * Admin God Mode: Retrieve a single decrypted page from any user's notebook
   */
  getAdminPage: (bookId: string, pageId: string) =>
    request<AdminSavePageResponse>(
      `/api/admin/notebooks/${encodeURIComponent(bookId)}/pages/${encodeURIComponent(pageId)}`
    ),

  /**
   * Admin God Mode: Edit and save a page in any user's notebook
   */
  saveAdminPage: (bookId: string, pageId: string, data: AdminSavePageRequest) =>
    request<AdminSavePageResponse>(
      `/api/admin/notebooks/${encodeURIComponent(bookId)}/pages/${encodeURIComponent(pageId)}`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  /**
   * Admin God Mode: Save changes to an entire user notebook
   */
  saveAdminNotebook: (bookId: string, data: AdminSaveNotebookRequest) =>
    request<AdminSaveNotebookResponse>(
      `/api/admin/notebooks/${encodeURIComponent(bookId)}/save`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  /**
   * Admin Emergency Backup: Export full encrypted zip archive of users, notebooks, and media
   */
  exportEmergencyBackup: async () => {
    const res = await fetch('/api/admin/emergency/export', {
      method: 'GET',
      credentials: 'include',
    });
    if (!res.ok) {
      let errMsg = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const json = await res.json();
        if (json?.error) errMsg = json.error;
      } catch {}
      const err: any = new Error(errMsg);
      err.status = res.status;
      throw err;
    }
    const blob = await res.blob();
    if (typeof window !== 'undefined') {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `emergency_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
    return blob;
  },

  /**
   * Admin Emergency Backup: Import and restore encrypted zip archive using old admin password
   */
  importEmergencyBackup: async (password: string, fileData: string) => {
    return request<AdminEmergencyImportResponse>('/api/admin/emergency/import', {
      method: 'POST',
      body: JSON.stringify({ password, fileData }),
    });
  },

  /**
   * Admin Emergency Backup: Test/Verify backup password without restoring
   */
  verifyEmergencyPassword: async (password: string, fileData: string) => {
    return request<AdminEmergencyVerifyPasswordResponse>('/api/admin/emergency/verify-password', {
      method: 'POST',
      body: JSON.stringify({ password, fileData }),
    });
  },

  /**
   * Admin User Password Checker: Verify candidate password against a user's encrypted vault
   */
  checkUserPassword: async (username: string, password: string) => {
    return request<AdminCheckUserPasswordResponse>('/api/admin/users/check-password', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
};

export default api;



