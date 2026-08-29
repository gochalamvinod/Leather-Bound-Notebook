import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../lib/api/client';
import {
  AdminBook,
  AdminStatusResponse,
  AdminUser,
  AuditLogEntry,
} from '../../types/api';
import { CoverTheme } from '../../types/notebook';
import { AdminGodModeModal } from './AdminGodModeModal';
import { PasswordStrengthMeter } from '../ui/PasswordStrengthMeter';

export interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabKey = 'users' | 'books' | 'logs' | 'keys';

export interface AdminRedeemKey {
  id: string;
  key_code: string;
  target_tier: 'ultimate' | 'premium' | 'classic';
  max_uses: number;
  used_count: number;
  is_active: number;
  created_by: string;
  redeemed_by?: string | null;
  redeemed_at?: string | null;
  created_at: string;
  notes?: string | null;
}

function formatUptime(seconds?: number): string {
  if (!seconds || seconds <= 0) return '0s';
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);
  return parts.join(' ');
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleString();
  } catch {
    return dateStr;
  }
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('users');
  const [statusData, setStatusData] = useState<AdminStatusResponse | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(false);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [bannerSuccess, setBannerSuccess] = useState<string | null>(null);

  // Users Tab State
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [userSearch, setUserSearch] = useState<string>('');
  const [isCreateUserOpen, setIsCreateUserOpen] = useState<boolean>(false);
  const [createUsername, setCreateUsername] = useState<string>('');
  const [createPassword, setCreatePassword] = useState<string>('');
  const [createTitle, setCreateTitle] = useState<string>('');
  const [createCover, setCreateCover] = useState<CoverTheme>('black');
  const [createRole, setCreateRole] = useState<string>('user');
  const [creatingUser, setCreatingUser] = useState<boolean>(false);

  // Reset Password State
  const [resetTargetUser, setResetTargetUser] = useState<string | null>(null);
  const [newPasswordVal, setNewPasswordVal] = useState<string>('');
  const [resettingPassword, setResettingPassword] = useState<boolean>(false);

  // Edit User State
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editUserDisplayName, setEditUserDisplayName] = useState<string>('');
  const [editUserRole, setEditUserRole] = useState<string>('user');
  const [editUserTier, setEditUserTier] = useState<string>('classic');
  const [savingEditUser, setSavingEditUser] = useState<boolean>(false);

  // Books Tab State
  const [books, setBooks] = useState<AdminBook[]>([]);
  const [loadingBooks, setLoadingBooks] = useState<boolean>(false);
  const [bookOwnerFilter, setBookOwnerFilter] = useState<string>('');
  const [bookTitleFilter, setBookTitleFilter] = useState<string>('');

  // Edit Book State
  const [editingBook, setEditingBook] = useState<AdminBook | null>(null);
  const [editBookTitle, setEditBookTitle] = useState<string>('');
  const [editBookCover, setEditBookCover] = useState<CoverTheme>('brown');
  const [savingEditBook, setSavingEditBook] = useState<boolean>(false);

  // Transfer Book State
  const [transferringBook, setTransferringBook] = useState<AdminBook | null>(null);
  const [transferToUser, setTransferToUser] = useState<string>('');
  const [savingTransfer, setSavingTransfer] = useState<boolean>(false);

  // Quota Management State
  const [quotaTargetBook, setQuotaTargetBook] = useState<AdminBook | null>(null);
  const [extraQuotaCount, setExtraQuotaCount] = useState<number>(5);
  const [savingQuota, setSavingQuota] = useState<boolean>(false);

  // Create Book State
  const [isCreateBookOpen, setIsCreateBookOpen] = useState<boolean>(false);
  const [newBookOwner, setNewBookOwner] = useState<string>('admin');
  const [newBookTitle, setNewBookTitle] = useState<string>('');
  const [newBookCover, setNewBookCover] = useState<CoverTheme>('brown');
  const [creatingBook, setCreatingBook] = useState<boolean>(false);

  // Admin God Mode State (View & Edit Pages for any user notebook)
  const [godModeBook, setGodModeBook] = useState<AdminBook | null>(null);
  const [isGodModeOpen, setIsGodModeOpen] = useState<boolean>(false);

  // Emergency Backup State
  const [isEmergencyPanelOpen, setIsEmergencyPanelOpen] = useState<boolean>(false);
  const [emergencyExporting, setEmergencyExporting] = useState<boolean>(false);
  const [emergencyImporting, setEmergencyImporting] = useState<boolean>(false);
  const [importPassword, setImportPassword] = useState<string>('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState<string>('');
  const [emergencyVerifying, setEmergencyVerifying] = useState<boolean>(false);
  const [emergencyVerifyResult, setEmergencyVerifyResult] = useState<{ valid: boolean; message: string; details?: any } | null>(null);

  // User Password Check State
  const [checkPasswordTargetUser, setCheckPasswordTargetUser] = useState<AdminUser | null>(null);
  const [checkPasswordCandidate, setCheckPasswordCandidate] = useState<string>('');
  const [checkPasswordResult, setCheckPasswordResult] = useState<{ valid: boolean; message: string; bookCount?: number } | null>(null);
  const [checkingUserPassword, setCheckingUserPassword] = useState<boolean>(false);

  // Audit Logs Tab State
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [totalLogsCount, setTotalLogsCount] = useState<number>(0);
  const [loadingLogs, setLoadingLogs] = useState<boolean>(false);
  const [logSearch, setLogSearch] = useState<string>('');
  const [logActionFilter, setLogActionFilter] = useState<string>('');
  const [logStatusFilter, setLogStatusFilter] = useState<string>('');
  const [logPageLimit, setLogPageLimit] = useState<number>(25);
  const [logPageOffset, setLogPageOffset] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isClearing, setIsClearing] = useState<boolean>(false);
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null);
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);
  const [copiedAllLogs, setCopiedAllLogs] = useState<boolean>(false);

  // Redeem Keys Tab State
  const [keys, setKeys] = useState<AdminRedeemKey[]>([]);
  const [loadingKeys, setLoadingKeys] = useState<boolean>(false);
  const [keyTier, setKeyTier] = useState<'ultimate' | 'premium'>('ultimate');
  const [keyCount, setKeyCount] = useState<number>(1);
  const [keyMaxUses, setKeyMaxUses] = useState<number>(1);
  const [keyNotes, setKeyNotes] = useState<string>('');
  const [generatingKeys, setGeneratingKeys] = useState<boolean>(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [keySearch, setKeySearch] = useState<string>('');
  const [keyFilterTier, setKeyFilterTier] = useState<string>('all');
  const [keyFilterStatus, setKeyFilterStatus] = useState<string>('all');

  // Clear banners helper
  const showSuccess = (msg: string) => {
    setBannerSuccess(msg);
    setBannerError(null);
    setTimeout(() => setBannerSuccess(null), 4000);
  };

  const showError = (msg: string) => {
    setBannerError(msg);
    setBannerSuccess(null);
  };

  const fetchKeys = useCallback(async () => {
    setLoadingKeys(true);
    try {
      const res = await fetch('/api/admin/keys');
      const data = await res.json();
      if (res.ok && data.ok) {
        setKeys(data.keys || []);
      }
    } catch (err: any) {
      showError('Failed to load license keys: ' + err.message);
    } finally {
      setLoadingKeys(false);
    }
  }, []);

  const handleCreateKeys = async () => {
    setGeneratingKeys(true);
    try {
      const res = await fetch('/api/admin/keys/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetTier: keyTier,
          count: keyCount,
          maxUses: keyMaxUses,
          notes: keyNotes.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to generate keys');
      }
      showSuccess(`Successfully generated ${data.keys?.length || keyCount} license key(s) in XXXX-XXXX-XXXX-XXXX-XXXX format.`);
      setKeyNotes('');
      fetchKeys();
    } catch (err: any) {
      showError(err.message || 'Key generation failed');
    } finally {
      setGeneratingKeys(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    try {
      const res = await fetch('/api/admin/keys/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Could not revoke key');
      showSuccess('Redeem key revoked successfully.');
      fetchKeys();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this license key?')) return;
    try {
      const res = await fetch('/api/admin/keys/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Could not delete key');
      showSuccess('Redeem key deleted.');
      fetchKeys();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleCopyKey = (keyCode: string, id: string) => {
    navigator.clipboard.writeText(keyCode);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  // Load Status
  const fetchStatus = useCallback(async () => {
    try {
      setLoadingStatus(true);
      const data = await api.getAdminStatus();
      setStatusData(data);
    } catch (err: any) {
      console.error('Failed to load admin status', err);
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  // Load Users
  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const data = await api.getAdminUsers();
      if (data && data.users) {
        setUsers(data.users);
      }
    } catch (err: any) {
      showError(err.message || 'Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // Load Books
  const fetchBooks = useCallback(async () => {
    try {
      setLoadingBooks(true);
      const data = await api.getAdminBooks();
      if (data && data.books) {
        const normalized = data.books.map((b: any) => ({
          id: b.id,
          title: b.title,
          owner: b.owner || b.user || b.username || 'unknown',
          pageCount: b.pageCount || 1,
          coverColor: b.coverColor || 'brown',
          createdAt: b.createdAt || null,
          updatedAt: b.updatedAt || new Date().toISOString(),
        }));
        setBooks(normalized);
      }
    } catch (err: any) {
      showError(err.message || 'Failed to load books');
    } finally {
      setLoadingBooks(false);
    }
  }, []);

  // Load Audit Logs
  const fetchLogs = useCallback(async () => {
    try {
      setLoadingLogs(true);
      const data = await api.getAdminLogs({
        search: logSearch.trim() || undefined,
        action: logActionFilter || undefined,
        status: logStatusFilter || undefined,
        limit: logPageLimit,
        offset: logPageOffset,
      });
      if (data && data.logs) {
        setLogs(data.logs);
        setTotalLogsCount(data.total || 0);
      }
    } catch (err: any) {
      showError(err.message || 'Failed to load audit logs');
    } finally {
      setLoadingLogs(false);
    }
  }, [logSearch, logActionFilter, logStatusFilter, logPageLimit, logPageOffset]);

  // Initial load when modal opens
  useEffect(() => {
    if (isOpen) {
      setBannerError(null);
      setBannerSuccess(null);
      fetchStatus();
      if (activeTab === 'users') fetchUsers();
      if (activeTab === 'books') fetchBooks();
      if (activeTab === 'logs') fetchLogs();
      if (activeTab === 'keys') fetchKeys();
    }
  }, [isOpen, activeTab, fetchStatus, fetchUsers, fetchBooks, fetchLogs, fetchKeys]);

  // Handle Tab Switch
  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setBannerError(null);
    setBannerSuccess(null);
    if (tab === 'users') fetchUsers();
    if (tab === 'books') fetchBooks();
    if (tab === 'keys') fetchKeys();
    if (tab === 'logs') {
      setLogPageOffset(0);
      fetchLogs();
    }
  };

  // User Actions
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createUsername.trim() || !createPassword) {
      showError('Username and password are required.');
      return;
    }
    if (createPassword.length < 4) {
      showError('Password must be at least 4 characters.');
      return;
    }

    try {
      setCreatingUser(true);
      await api.createAdminUser({
        username: createUsername.trim(),
        password: createPassword,
        notebookTitle: createTitle.trim() || undefined,
        coverColor: createCover,
        role: createRole,
      });
      showSuccess(`User "${createUsername.trim()}" created successfully.`);
      setCreateUsername('');
      setCreatePassword('');
      setCreateTitle('');
      setIsCreateUserOpen(false);
      await fetchUsers();
      await fetchStatus();
    } catch (err: any) {
      showError(err.message || 'Failed to create user.');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleDeleteUser = async (username: string) => {
    if (username.toLowerCase() === 'admin') {
      showError('Master Admin account cannot be deleted.');
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to permanently delete user "${username}" and all their notebooks? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await api.deleteAdminUser({ username });
      showSuccess(`User "${username}" deleted successfully.`);
      await fetchUsers();
      await fetchStatus();
    } catch (err: any) {
      showError(err.message || 'Failed to delete user.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser || !newPasswordVal) return;
    if (newPasswordVal.length < 4) {
      showError('Password must be at least 4 characters.');
      return;
    }

    try {
      setResettingPassword(true);
      await api.resetAdminPassword({
        username: resetTargetUser,
        newPassword: newPasswordVal,
      });
      showSuccess(`Password for "${resetTargetUser}" reset successfully.`);
      setResetTargetUser(null);
      setNewPasswordVal('');
    } catch (err: any) {
      showError(err.message || 'Failed to reset password.');
    } finally {
      setResettingPassword(false);
    }
  };

  const handleStartEditUser = (u: AdminUser) => {
    setEditingUser(u);
    setEditUserDisplayName(u.displayName || u.username);
    setEditUserRole(u.isAdmin || u.role === 'admin' ? 'admin' : 'user');
    setEditUserTier(u.tier || (u.isAdmin ? 'ultimate' : 'classic'));
    setResetTargetUser(null);
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      setSavingEditUser(true);
      await api.editAdminUser({
        username: editingUser.username,
        displayName: editUserDisplayName,
        role: editUserRole,
        tier: editUserTier,
      });
      showSuccess(`User "${editingUser.username}" profile & tier updated.`);
      setEditingUser(null);
      await fetchUsers();
      await fetchStatus();
    } catch (err: any) {
      showError(err.message || 'Failed to update user profile.');
    } finally {
      setSavingEditUser(false);
    }
  };

  const handleUnlockUser = async (username: string) => {
    try {
      await api.unlockAdminUser({ username });
      showSuccess(`Account lockout cleared for user "${username}".`);
      await fetchStatus();
      await fetchUsers();
    } catch (err: any) {
      showError(err.message || 'Failed to unlock user.');
    }
  };

  const handleUpdateUserTier = async (username: string, newTier: string) => {
    try {
      const res = await fetch('/api/admin/users/tier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, tier: newTier }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to update user tier');
      }

      setUsers((prev) =>
        prev.map((u) => (u.username.toLowerCase() === username.toLowerCase() ? { ...u, tier: newTier } : u))
      );
      showSuccess(`User "${username}" tier converted to ${newTier.toUpperCase()} (${newTier === 'ultimate' ? '⚡ Unlimited' : newTier === 'premium' ? '👑 VIP' : '📜 Free'}) successfully.`);
    } catch (err: any) {
      showError(err.message || 'Could not update user tier.');
    }
  };

  // Book Actions
  const handleStartEditBook = (b: AdminBook) => {
    setEditingBook(b);
    setEditBookTitle(b.title || '');
    setEditBookCover((b.coverColor as CoverTheme) || 'brown');
    setTransferringBook(null);
  };

  const handleSaveEditBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;
    try {
      setSavingEditBook(true);
      await api.editAdminBook({
        bookId: editingBook.id,
        owner: editingBook.owner,
        title: editBookTitle.trim() || 'Untitled Notebook',
        coverColor: editBookCover,
      });
      showSuccess(`Notebook "${editBookTitle}" updated successfully.`);
      setEditingBook(null);
      await fetchBooks();
      await fetchStatus();
    } catch (err: any) {
      showError(err.message || 'Failed to update notebook.');
    } finally {
      setSavingEditBook(false);
    }
  };

  const handleStartTransferBook = (b: AdminBook) => {
    setTransferringBook(b);
    const availableUsers = users
      .map((u) => u.username)
      .filter((u) => u.toLowerCase() !== (b.owner || '').toLowerCase());
    setTransferToUser(availableUsers[0] || 'admin');
    setEditingBook(null);
  };

  const handleSaveTransferBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferringBook || !transferToUser) return;
    try {
      setSavingTransfer(true);
      await api.transferAdminBook({
        bookId: transferringBook.id,
        fromUser: transferringBook.owner,
        toUser: transferToUser,
      });
      showSuccess(`Notebook "${transferringBook.title}" transferred to "${transferToUser}".`);
      setTransferringBook(null);
      await fetchBooks();
      await fetchStatus();
    } catch (err: any) {
      showError(err.message || 'Failed to transfer notebook.');
    } finally {
      setSavingTransfer(false);
    }
  };

  const handleSaveIncreaseQuota = async (resetUsed = false) => {
    if (!quotaTargetBook) return;
    try {
      setSavingQuota(true);
      const res = await api.adminIncreaseDimensionQuota({
        bookId: quotaTargetBook.id,
        owner: quotaTargetBook.owner,
        extraCount: resetUsed ? 0 : extraQuotaCount,
        resetUsed,
      });
      showSuccess(res.message || 'Dimension modification quota updated.');
      setQuotaTargetBook(null);
      await fetchBooks();
      await fetchStatus();
    } catch (err: any) {
      showError(err.message || 'Failed to update quota.');
    } finally {
      setSavingQuota(false);
    }
  };

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreatingBook(true);
      await api.createAdminBook({
        owner: newBookOwner || 'admin',
        title: newBookTitle.trim() || 'New Notebook',
        coverColor: newBookCover,
      });
      showSuccess(`Notebook "${newBookTitle || 'New Notebook'}" created for "${newBookOwner}".`);
      setIsCreateBookOpen(false);
      setNewBookTitle('');
      await fetchBooks();
      await fetchStatus();
    } catch (err: any) {
      showError(err.message || 'Failed to create notebook.');
    } finally {
      setCreatingBook(false);
    }
  };

  const handleExportBook = async (b: AdminBook) => {
    try {
      await api.exportAdminBook(b.id, b.owner);
      showSuccess(`Notebook "${b.title}" backup downloaded.`);
    } catch (err: any) {
      showError(err.message || 'Failed to export notebook.');
    }
  };

  const handleDeleteBook = async (bookId: string, owner: string, title: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${title}" owned by ${owner}? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await api.deleteAdminBook({ bookId, username: owner });
      showSuccess(`Book "${title}" deleted.`);
      await fetchBooks();
      await fetchStatus();
    } catch (err: any) {
      showError(err.message || 'Failed to delete book.');
    }
  };

  const handleOpenGodMode = (b: AdminBook) => {
    setGodModeBook(b);
    setIsGodModeOpen(true);
  };

  // Audit Log Actions

  const handleExportLogs = async () => {
    try {
      setIsExporting(true);
      await api.exportAdminLogs();
      showSuccess('Audit logs exported successfully.');
    } catch (err: any) {
      showError(err.message || 'Failed to export audit logs.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearLogs = async () => {
    if (
      !window.confirm(
        'Are you sure you want to clear all decrypted/stored audit logs? A LOGS_CLEARED event will be recorded.'
      )
    ) {
      return;
    }

    try {
      setIsClearing(true);
      await api.clearAdminLogs();
      showSuccess('Audit logs purged.');
      setLogPageOffset(0);
      await fetchLogs();
      await fetchStatus();
    } catch (err: any) {
      showError(err.message || 'Failed to clear logs.');
    } finally {
      setIsClearing(false);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    if (
      !window.confirm(
        'Are you sure you want to permanently delete this audit log entry?'
      )
    ) {
      return;
    }

    try {
      setDeletingLogId(logId);
      await api.deleteAdminLog(logId);
      showSuccess('Audit log entry deleted.');
      // Optimistically remove log from local state
      setLogs((prev) => prev.filter((l) => l.id !== logId));
      setTotalLogsCount((prev) => Math.max(0, prev - 1));
      // Refresh status stats and logs to reflect deletion
      await fetchStatus();
      await fetchLogs();
    } catch (err: any) {
      showError(err.message || 'Failed to delete audit log entry.');
    } finally {
      setDeletingLogId(null);
    }
  };

  const handleCopyLog = async (log: AuditLogEntry) => {
    try {
      const text = JSON.stringify(log, null, 2);
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedLogId(log.id);
      showSuccess(`Log entry #${log.id} copied to clipboard!`);
      setTimeout(() => setCopiedLogId(null), 2000);
    } catch (err: any) {
      showError('Failed to copy log entry: ' + (err.message || 'Clipboard error'));
    }
  };

  const handleCopyAllLogs = async () => {
    try {
      if (logs.length === 0) {
        showError('No logs available to copy.');
        return;
      }
      const text = JSON.stringify(logs, null, 2);
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedAllLogs(true);
      showSuccess(`Copied ${logs.length} audit logs to clipboard!`);
      setTimeout(() => setCopiedAllLogs(false), 2000);
    } catch (err: any) {
      showError('Failed to copy logs: ' + (err.message || 'Clipboard error'));
    }
  };

  // Emergency Backup: Export
  const handleEmergencyExport = async () => {
    setEmergencyExporting(true);
    setBannerError(null);
    try {
      await api.exportEmergencyBackup();
      showSuccess('Emergency backup archive downloaded successfully! Keep this file safe.');
    } catch (err: any) {
      showError('Emergency export failed: ' + (err.message || 'Unknown error'));
    } finally {
      setEmergencyExporting(false);
    }
  };

  // Emergency Backup: Import
  const handleEmergencyImport = async () => {
    if (!importFile) {
      showError('Please select an emergency backup file to import.');
      return;
    }
    if (!importPassword || importPassword.length < 4) {
      showError('Please enter the admin password that was active when this backup was exported.');
      return;
    }

    setEmergencyImporting(true);
    setImportProgress('Reading backup file...');
    setBannerError(null);

    try {
      // Read the file as base64
      const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Strip the data URL prefix to get pure base64
          const b64 = result.includes(',') ? result.split(',')[1] : result;
          resolve(b64);
        };
        reader.onerror = () => reject(new Error('Failed to read backup file'));
        reader.readAsDataURL(importFile);
      });

      setImportProgress('Decrypting and restoring backup...');

      const result = await api.importEmergencyBackup(importPassword, fileData);

      if (result.ok) {
        const stats = result.stats;
        showSuccess(
          `✅ Backup restored! ${stats?.usersRestored ?? 0} users, ${stats?.booksRestored ?? 0} notebooks, ${stats?.filesRestored ?? 0} files recovered.`
        );
        setImportPassword('');
        setImportFile(null);
        setImportProgress('');
        setIsEmergencyPanelOpen(false);
        // Refresh all data
        fetchStatus();
        fetchUsers();
        fetchBooks();
        fetchLogs();
      } else {
        showError(result.error || 'Import failed with unknown error.');
        setImportProgress('');
      }
    } catch (err: any) {
      showError('Emergency import failed: ' + (err.message || 'Unknown error'));
      setImportProgress('');
    } finally {
      setEmergencyImporting(false);
    }
  };

  // Emergency Backup: Test / Verify Password without restoring
  const handleVerifyEmergencyPassword = async () => {
    if (!importFile) {
      showError('Please select a backup file first.');
      return;
    }
    if (!importPassword) {
      showError('Please enter the password to test.');
      return;
    }
    setEmergencyVerifying(true);
    setEmergencyVerifyResult(null);
    try {
      const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const b64 = result.includes(',') ? result.split(',')[1] : result;
          resolve(b64);
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(importFile);
      });
      const res = await api.verifyEmergencyPassword(importPassword, fileData);
      if (res.valid) {
        setEmergencyVerifyResult({
          valid: true,
          message: res.message || 'Password verified! Decryption succeeded.',
          details: res.manifest,
        });
      } else {
        setEmergencyVerifyResult({
          valid: false,
          message: res.error || 'Password does not match this backup.',
        });
      }
    } catch (err: any) {
      setEmergencyVerifyResult({
        valid: false,
        message: 'Verification failed: ' + (err.message || 'Network error'),
      });
    } finally {
      setEmergencyVerifying(false);
    }
  };

  // User Password Checker
  const handleCheckUserPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkPasswordTargetUser || !checkPasswordCandidate) return;
    setCheckingUserPassword(true);
    setCheckPasswordResult(null);
    try {
      const res = await api.checkUserPassword(checkPasswordTargetUser.username, checkPasswordCandidate);
      setCheckPasswordResult({
        valid: res.valid,
        message: res.message || (res.valid ? 'Password is correct!' : 'Password mismatch.'),
        bookCount: res.bookCount,
      });
    } catch (err: any) {
      setCheckPasswordResult({
        valid: false,
        message: err.message || 'Failed to check password.',
      });
    } finally {
      setCheckingUserPassword(false);
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    const q = userSearch.toLowerCase();
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        (u.role && u.role.toLowerCase().includes(q))
    );
  }, [users, userSearch]);

  // Filtered Books
  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const matchOwner = bookOwnerFilter
        ? (b.owner || '').toLowerCase().includes(bookOwnerFilter.toLowerCase())
        : true;
      const matchTitle = bookTitleFilter
        ? (b.title || '').toLowerCase().includes(bookTitleFilter.toLowerCase())
        : true;
      return matchOwner && matchTitle;
    });
  }, [books, bookOwnerFilter, bookTitleFilter]);

  if (!isOpen) return null;

  const totalPages = Math.ceil(totalLogsCount / logPageLimit) || 1;
  const currentPage = Math.floor(logPageOffset / logPageLimit) + 1;

  return (
    <div id="adminDashboardModal" className="modal-overlay admin-dashboard-overlay">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="admin-dashboard-card">
        {/* Header Banner with System Stats */}
        <div className="admin-header">
          <div className="admin-header-title-row">
            <div className="admin-header-title">
              <span className="admin-crown-icon">👑</span>
              <h2>Master Admin Portal</h2>
            </div>
            <div className="admin-header-actions">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => {
                  fetchStatus();
                  if (activeTab === 'users') fetchUsers();
                  if (activeTab === 'books') fetchBooks();
                  if (activeTab === 'logs') fetchLogs();
                }}
                title="Refresh Data"
              >
                🔄 Refresh
              </button>
              <button
                type="button"
                id="closeAdminBtn"
                className="modal-close-btn"
                onClick={onClose}
                title="Close Admin Portal"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="admin-stats-bar">
            <div className="admin-stat-item">
              <span className="stat-label">Uptime</span>
              <span className="stat-value">
                {loadingStatus ? '...' : formatUptime(statusData?.uptimeSeconds || statusData?.uptime)}
              </span>
            </div>
            <div className="admin-stat-item">
              <span className="stat-label">Total Users</span>
              <span className="stat-value">
                {loadingStatus ? '...' : statusData?.totalUsers ?? statusData?.userCount ?? users.length}
              </span>
            </div>
            <div className="admin-stat-item">
              <span className="stat-label">Total Books</span>
              <span className="stat-value">
                {loadingStatus ? '...' : statusData?.totalBooks ?? statusData?.bookCount ?? books.length}
              </span>
            </div>
            <div className="admin-stat-item">
              <span className="stat-label">Audit Logs</span>
              <span className="stat-value">
                {loadingStatus ? '...' : statusData?.totalLogs ?? statusData?.logCount ?? totalLogsCount}
              </span>
            </div>
            <div className="admin-stat-item">
              <span className="stat-label">Version</span>
              <span className="stat-value">{statusData?.version ? `v${statusData.version}` : 'v2.0.0'}</span>
            </div>
          </div>
        </div>

        {/* Global Error/Success Notification Banners */}
        {bannerError && (
          <div className="admin-banner admin-banner-error" role="alert">
            <span>⚠️ {bannerError}</span>
            <button
              type="button"
              className="admin-banner-dismiss"
              onClick={() => setBannerError(null)}
            >
              ✕
            </button>
          </div>
        )}
        {bannerSuccess && (
          <div className="admin-banner admin-banner-success" role="status">
            <span>✓ {bannerSuccess}</span>
            <button
              type="button"
              className="admin-banner-dismiss"
              onClick={() => setBannerSuccess(null)}
            >
              ✕
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* Emergency Backup Panel                                         */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div style={{
          margin: '0 0 8px 0',
          textAlign: 'center',
        }}>
          <button
            type="button"
            onClick={() => setIsEmergencyPanelOpen((p) => !p)}
            style={{
              background: isEmergencyPanelOpen
                ? 'linear-gradient(135deg, #8b0000 0%, #cc3300 100%)'
                : 'linear-gradient(135deg, #1a1a2e 0%, #2d1b3d 100%)',
              color: '#ff6b6b',
              border: '1px solid #ff4444',
              borderRadius: '8px',
              padding: '8px 20px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.5px',
              textTransform: 'uppercase' as const,
              boxShadow: '0 0 12px rgba(255, 68, 68, 0.3)',
              transition: 'all 0.3s ease',
            }}
            title="Emergency Backup: Export or import an encrypted snapshot of all users, notebooks, and files"
          >
            🚨 Emergency Backup {isEmergencyPanelOpen ? '▲' : '▼'}
          </button>
        </div>

        {isEmergencyPanelOpen && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(139,0,0,0.15) 0%, rgba(30,10,10,0.9) 100%)',
            border: '1px solid rgba(255, 68, 68, 0.4)',
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '12px',
            boxShadow: '0 0 20px rgba(255, 0, 0, 0.1) inset',
          }}>
            <h3 style={{
              color: '#ff6b6b',
              margin: '0 0 6px 0',
              fontSize: '1.05rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              🚨 Emergency Backup System
            </h3>
            <p style={{
              color: 'rgba(255,200,200,0.7)',
              fontSize: '0.78rem',
              margin: '0 0 16px 0',
              lineHeight: 1.4,
            }}>
              Export creates an AES-256-GCM encrypted ZIP archive of all users, notebooks, media files, and database records.
              Import restores from a previously exported archive using the admin password that was active at export time.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            }}>
              {/* Export Card */}
              <div style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255, 180, 0, 0.3)',
                borderRadius: '8px',
                padding: '16px',
              }}>
                <h4 style={{ color: '#ffb400', margin: '0 0 10px 0', fontSize: '0.92rem' }}>
                  📤 Export Backup
                </h4>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', margin: '0 0 12px 0' }}>
                  Downloads an encrypted archive of the entire system. Secured with your current admin password.
                </p>
                <button
                  type="button"
                  onClick={handleEmergencyExport}
                  disabled={emergencyExporting}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    background: emergencyExporting
                      ? 'rgba(100,100,100,0.5)'
                      : 'linear-gradient(135deg, #b8860b 0%, #daa520 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: emergencyExporting ? 'wait' : 'pointer',
                    letterSpacing: '0.3px',
                    boxShadow: '0 2px 8px rgba(184, 134, 11, 0.4)',
                  }}
                >
                  {emergencyExporting ? '⏳ Generating Archive...' : '📦 Download Emergency Backup'}
                </button>
              </div>

              {/* Import Card */}
              <div style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(100, 200, 255, 0.3)',
                borderRadius: '8px',
                padding: '16px',
              }}>
                <h4 style={{ color: '#64c8ff', margin: '0 0 10px 0', fontSize: '0.92rem' }}>
                  📥 Import Backup
                </h4>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>
                    Backup File (.zip)
                  </label>
                  <input
                    type="file"
                    accept=".zip,.bin,.bak,application/octet-stream"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    disabled={emergencyImporting}
                    style={{
                      width: '100%',
                      padding: '6px',
                      background: 'rgba(30,30,50,0.8)',
                      border: '1px solid rgba(100,200,255,0.3)',
                      borderRadius: '4px',
                      color: '#ccc',
                      fontSize: '0.78rem',
                    }}
                  />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>
                    Admin Password (at time of export)
                  </label>
                  <input
                    type="password"
                    placeholder="Enter old admin password..."
                    value={importPassword}
                    onChange={(e) => setImportPassword(e.target.value)}
                    disabled={emergencyImporting}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: 'rgba(30,30,50,0.8)',
                      border: '1px solid rgba(100,200,255,0.3)',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box' as const,
                    }}
                  />
                </div>
                {importPassword && (
                  <PasswordStrengthMeter password={importPassword} showCriteria={false} />
                )}

                {emergencyVerifyResult && (
                  <div
                    style={{
                      marginBottom: '12px',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      background: emergencyVerifyResult.valid
                        ? 'rgba(56, 161, 105, 0.2)'
                        : 'rgba(229, 62, 62, 0.2)',
                      border: `1px solid ${emergencyVerifyResult.valid ? '#38a169' : '#e53e3e'}`,
                      color: emergencyVerifyResult.valid ? '#68d391' : '#fc8181',
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: '2px' }}>
                      {emergencyVerifyResult.valid ? '✓ Valid Password' : '⚠️ Password Check Failed'}
                    </div>
                    <div>{emergencyVerifyResult.message}</div>
                    {emergencyVerifyResult.details && (
                      <div style={{ marginTop: '4px', fontSize: '0.72rem', color: '#cbd5e0' }}>
                        Version: {emergencyVerifyResult.details.version || '2.0.0'} • Entries: {emergencyVerifyResult.details.totalEntries || 'Archive intact'}
                      </div>
                    )}
                  </div>
                )}

                {importProgress && (
                  <p style={{ color: '#64c8ff', fontSize: '0.78rem', margin: '0 0 8px 0' }}>
                    ⏳ {importProgress}
                  </p>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleVerifyEmergencyPassword}
                    disabled={emergencyVerifying || emergencyImporting || !importFile || !importPassword}
                    style={{
                      padding: '10px 12px',
                      background: emergencyVerifying || !importFile || !importPassword
                        ? 'rgba(100,100,100,0.5)'
                        : 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)',
                      color: '#e2e8f0',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: emergencyVerifying || !importFile || !importPassword ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {emergencyVerifying ? '⏳ Checking...' : '🔍 Check Password'}
                  </button>

                  <button
                    type="button"
                    onClick={handleEmergencyImport}
                    disabled={emergencyImporting || !importFile || !importPassword}
                    style={{
                      padding: '10px 12px',
                      background: emergencyImporting || !importFile || !importPassword
                        ? 'rgba(100,100,100,0.5)'
                        : 'linear-gradient(135deg, #1a6b9c 0%, #2196F3 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: emergencyImporting || !importFile || !importPassword ? 'not-allowed' : 'pointer',
                      letterSpacing: '0.3px',
                      boxShadow: '0 2px 8px rgba(33, 150, 243, 0.4)',
                    }}
                  >
                    {emergencyImporting ? '⏳ Restoring...' : '🔓 Decrypt & Restore'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="admin-tabs">
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => handleTabChange('users')}
          >
            👥 Users ({users.length})
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'books' ? 'active' : ''}`}
            onClick={() => handleTabChange('books')}
          >
            📚 Books ({books.length})
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => handleTabChange('logs')}
          >
            📜 Encrypted Audit Logs ({totalLogsCount})
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'keys' ? 'active' : ''}`}
            onClick={() => handleTabChange('keys')}
          >
            🔑 License Keys ({keys.length})
          </button>
        </div>

        {/* Tab Body */}
        <div className="admin-body">
          {/* ========================================================================= */}
          {/* TAB 1: USERS */}
          {/* ========================================================================= */}
          {activeTab === 'users' && (
            <div className="admin-tab-content">
              {/* Users Toolbar */}
              <div className="admin-table-toolbar">
                <div className="admin-search-wrapper">
                  <input
                    type="text"
                    placeholder="Search users by name or role..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="admin-input"
                  />
                  {userSearch && (
                    <button
                      type="button"
                      className="admin-input-clear"
                      onClick={() => setUserSearch('')}
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  id="openCreateUserBtn"
                  className="brass-btn admin-action-trigger"
                  onClick={() => setIsCreateUserOpen((prev) => !prev)}
                >
                  {isCreateUserOpen ? '✕ Cancel' : '+ Create User'}
                </button>
              </div>

              {/* Create User Collapsible Section */}
              {isCreateUserOpen && (
                <form
                  onSubmit={handleCreateUser}
                  className="admin-create-user-card"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--brass)',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '16px',
                  }}
                >
                  <h4 style={{ color: 'var(--brass-bright)', marginBottom: '12px' }}>
                    Create New Vault User
                  </h4>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--brass)', marginBottom: '4px' }}>
                        Username *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. charlie"
                        value={createUsername}
                        onChange={(e) => setCreateUsername(e.target.value)}
                        className="admin-input"
                        disabled={creatingUser}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--brass)', marginBottom: '4px' }}>
                        Initial Password *
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Min 4 characters"
                        value={createPassword}
                        onChange={(e) => setCreatePassword(e.target.value)}
                        className="admin-input"
                        disabled={creatingUser}
                      />
                      {createPassword && (
                        <PasswordStrengthMeter password={createPassword} />
                      )}
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--brass)', marginBottom: '4px' }}>
                        Initial Notebook Title (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Charlie's Research"
                        value={createTitle}
                        onChange={(e) => setCreateTitle(e.target.value)}
                        className="admin-input"
                        disabled={creatingUser}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--brass)', marginBottom: '4px' }}>
                        Cover Theme
                      </label>
                      <select
                        value={createCover}
                        onChange={(e) => setCreateCover(e.target.value as CoverTheme)}
                        className="admin-select"
                        disabled={creatingUser}
                      >
                        <option value="brown">Leather Brown</option>
                        <option value="black">Midnight Black</option>
                        <option value="blue">Sapphire Blue</option>
                        <option value="green">Emerald Green</option>
                        <option value="burgundy">Royal Burgundy</option>
                        <option value="obsidian">Obsidian</option>
                        <option value="gold">Imperial Gold</option>
                        <option value="navy">Deep Navy</option>
                        <option value="crimson">Crimson Red</option>
                        <option value="forest">Forest Moss</option>
                        <option value="amber">Warm Amber</option>
                        <option value="purple">Velvet Purple</option>
                        <option value="slate">Stone Slate</option>
                        <option value="teal">Ocean Teal</option>
                        <option value="vintage-tan">Vintage Tan</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--brass)', marginBottom: '4px' }}>
                        Role
                      </label>
                      <select
                        value={createRole}
                        onChange={(e) => setCreateRole(e.target.value)}
                        className="admin-select"
                        disabled={creatingUser}
                      >
                        <option value="user">Regular User (Member)</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                    <button
                      type="submit"
                      className="brass-btn"
                      disabled={creatingUser || !createUsername || !createPassword}
                    >
                      {creatingUser ? 'Creating...' : 'Create Account & Vault'}
                    </button>
                    <button
                      type="button"
                      className="admin-btn-secondary"
                      onClick={() => setIsCreateUserOpen(false)}
                      disabled={creatingUser}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Reset Password Modal/Section */}
              {resetTargetUser && (
                <div
                  className="admin-reset-card"
                  style={{
                    background: 'rgba(50, 20, 20, 0.4)',
                    border: '1px solid var(--brass-bright)',
                    borderRadius: '8px',
                    padding: '14px',
                    marginBottom: '16px',
                  }}
                >
                  <h4 style={{ color: 'var(--brass-bright)', marginBottom: '8px' }}>
                    🔑 Reset Password for "{resetTargetUser}"
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--paper)', opacity: 0.85, marginBottom: '10px' }}>
                    This will immediately re-encrypt the user's master vault with the new password.
                  </p>
                  <form onSubmit={handleResetPassword} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    <div style={{ flex: '1 1 280px', maxWidth: '350px' }}>
                      <input
                        type="password"
                        placeholder="New password (min 4 chars)"
                        value={newPasswordVal}
                        onChange={(e) => setNewPasswordVal(e.target.value)}
                        className="admin-input"
                        style={{ width: '100%' }}
                        autoFocus
                        required
                      />
                      {newPasswordVal && (
                        <PasswordStrengthMeter password={newPasswordVal} />
                      )}
                    </div>
                    <button
                      type="submit"
                      className="brass-btn"
                      disabled={resettingPassword || newPasswordVal.length < 4}
                    >
                      {resettingPassword ? 'Resetting...' : 'Save New Password'}
                    </button>
                    <button
                      type="button"
                      className="admin-btn-secondary"
                      onClick={() => {
                        setResetTargetUser(null);
                        setNewPasswordVal('');
                      }}
                      disabled={resettingPassword}
                    >
                      Cancel
                    </button>
                  </form>
                </div>
              )}

              {/* Edit User Modal/Section */}
              {editingUser && (
                <div
                  className="admin-edit-user-card"
                  style={{
                    background: 'rgba(20, 40, 60, 0.4)',
                    border: '1px solid var(--brass-bright)',
                    borderRadius: '8px',
                    padding: '14px',
                    marginBottom: '16px',
                  }}
                >
                  <h4 style={{ color: 'var(--brass-bright)', marginBottom: '8px' }}>
                    ✏️ Edit User Profile: "{editingUser.username}"
                  </h4>
                  <form onSubmit={handleSaveEditUser} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--brass)', marginBottom: '4px' }}>
                        Display Name
                      </label>
                      <input
                        type="text"
                        placeholder="Display Name"
                        value={editUserDisplayName}
                        onChange={(e) => setEditUserDisplayName(e.target.value)}
                        className="admin-input"
                        style={{ minWidth: '200px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--brass)', marginBottom: '4px' }}>
                        Role
                      </label>
                      <select
                        value={editUserRole}
                        onChange={(e) => setEditUserRole(e.target.value)}
                        className="admin-select"
                        disabled={editingUser.username.toLowerCase() === 'admin'}
                      >
                        <option value="user">Standard User</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--brass)', marginBottom: '4px' }}>
                        Membership Tier
                      </label>
                      <select
                        value={editUserTier}
                        onChange={(e) => setEditUserTier(e.target.value)}
                        className="admin-select"
                        style={{ fontWeight: 'bold' }}
                      >
                        <option value="classic">📜 Classic Scribe (Free)</option>
                        <option value="premium">👑 Guild Master (VIP)</option>
                        <option value="ultimate">⚡ Ultimate Sovereign (Zero Limits)</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="submit"
                        className="brass-btn"
                        disabled={savingEditUser}
                      >
                        {savingEditUser ? 'Saving...' : 'Save Profile'}
                      </button>
                      <button
                        type="button"
                        className="admin-btn-secondary"
                        onClick={() => setEditingUser(null)}
                        disabled={savingEditUser}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Password Checker Modal/Card */}
              {checkPasswordTargetUser && (
                <div
                  className="admin-check-password-card"
                  style={{
                    background: 'rgba(20, 35, 50, 0.6)',
                    border: '1px solid #64c8ff',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '16px',
                    boxShadow: '0 0 15px rgba(100, 200, 255, 0.15)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ color: '#64c8ff', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      🔍 Password Checker: @{checkPasswordTargetUser.username}
                    </h4>
                    <button
                      type="button"
                      className="admin-banner-dismiss"
                      onClick={() => {
                        setCheckPasswordTargetUser(null);
                        setCheckPasswordCandidate('');
                        setCheckPasswordResult(null);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#cbd5e0', marginBottom: '10px' }}>
                    Test whether a candidate password decrypts this user's encrypted vault without changing any user data.
                  </p>
                  <form onSubmit={handleCheckUserPassword}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      <input
                        type="password"
                        placeholder="Enter candidate password to test..."
                        value={checkPasswordCandidate}
                        onChange={(e) => setCheckPasswordCandidate(e.target.value)}
                        className="admin-input"
                        style={{ maxWidth: '300px' }}
                        autoFocus
                        required
                        disabled={checkingUserPassword}
                      />
                      <button
                        type="submit"
                        className="admin-btn-primary"
                        style={{ background: 'linear-gradient(135deg, #2b6cb0 0%, #3182ce 100%)', color: '#fff', fontWeight: 600 }}
                        disabled={checkingUserPassword || !checkPasswordCandidate}
                      >
                        {checkingUserPassword ? 'Testing...' : 'Verify Password'}
                      </button>
                      <button
                        type="button"
                        className="admin-btn-secondary"
                        onClick={() => {
                          setCheckPasswordTargetUser(null);
                          setCheckPasswordCandidate('');
                          setCheckPasswordResult(null);
                        }}
                      >
                        Close
                      </button>
                    </div>
                    {checkPasswordCandidate && (
                      <PasswordStrengthMeter password={checkPasswordCandidate} showCriteria={false} />
                    )}
                    {checkPasswordResult && (
                      <div
                        style={{
                          marginTop: '8px',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          background: checkPasswordResult.valid ? 'rgba(56, 161, 105, 0.2)' : 'rgba(229, 62, 62, 0.2)',
                          border: `1px solid ${checkPasswordResult.valid ? '#38a169' : '#e53e3e'}`,
                          color: checkPasswordResult.valid ? '#68d391' : '#fc8181',
                        }}
                      >
                        {checkPasswordResult.valid ? '✓ ' : '❌ '} {checkPasswordResult.message}
                        {checkPasswordResult.valid && checkPasswordResult.bookCount !== undefined && (
                          <span style={{ display: 'block', fontSize: '0.74rem', color: '#e2e8f0', marginTop: '2px' }}>
                            Successfully validated against {checkPasswordResult.bookCount} notebook(s) in vault.
                          </span>
                        )}
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* Users Table */}
              <div className="admin-table-container">
                {loadingUsers ? (
                  <div className="admin-loading-row">Loading users...</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="admin-empty-state">No users found.</div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Role</th>
                        <th>Membership Plan</th>
                        <th>Type</th>
                        <th>Books</th>
                        <th>Created</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => {
                        const isMasterAdmin = u.username.toLowerCase() === 'admin';
                        const currentTier = u.tier || (u.isAdmin ? 'ultimate' : 'classic');
                        return (
                          <tr key={u.id || u.username} className={isMasterAdmin ? 'admin-row-highlight' : ''}>
                            <td className="font-semibold">
                              <span style={{ marginRight: '6px' }}>{u.isAdmin ? '👑' : '👤'}</span>
                              {u.username}
                              {u.displayName && u.displayName !== u.username && (
                                <span style={{ opacity: 0.6, fontSize: '0.8rem', marginLeft: '6px' }}>
                                  ({u.displayName})
                                </span>
                              )}
                            </td>
                            <td>
                              <span className={`role-badge ${u.isAdmin ? 'role-admin' : 'role-user'}`}>
                                {u.role || (u.isAdmin ? 'admin' : 'user')}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <select
                                  value={currentTier}
                                  onChange={(e) => handleUpdateUserTier(u.username, e.target.value)}
                                  className="px-2 py-1 rounded text-xs font-bold border transition cursor-pointer"
                                  style={{
                                    background:
                                      currentTier === 'ultimate'
                                        ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.25), rgba(168, 85, 247, 0.25))'
                                        : currentTier === 'premium'
                                        ? 'rgba(212, 175, 55, 0.2)'
                                        : 'rgba(255, 255, 255, 0.08)',
                                    borderColor:
                                      currentTier === 'ultimate'
                                        ? '#eab308'
                                        : currentTier === 'premium'
                                        ? '#d4af37'
                                        : 'rgba(255, 255, 255, 0.2)',
                                    color:
                                      currentTier === 'ultimate'
                                        ? '#fef08a'
                                        : currentTier === 'premium'
                                        ? '#fef08a'
                                        : '#e5e7eb',
                                  }}
                                  title={`Convert tier for ${u.username} (Free / VIP / Ultimate)`}
                                >
                                  <option value="classic" style={{ background: '#1c1611', color: '#e5e7eb' }}>
                                    📜 Free (Classic)
                                  </option>
                                  <option value="premium" style={{ background: '#1c1611', color: '#fef08a' }}>
                                    👑 VIP (Guild Master)
                                  </option>
                                  <option value="ultimate" style={{ background: '#1c1611', color: '#fde047', fontWeight: 'bold' }}>
                                    ⚡ Ultimate (No Limits)
                                  </option>
                                </select>
                              </div>
                            </td>
                            <td>
                              {u.isAdmin ? (
                                <span className="admin-tag">Admin</span>
                              ) : (
                                <span className="user-tag">Member</span>
                              )}
                            </td>
                            <td>{u.bookCount || 0}</td>
                            <td className="text-muted">{formatDate(u.createdAt)}</td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'nowrap' }}>
                                <button
                                  type="button"
                                  className="admin-table-btn admin-btn-secondary"
                                  onClick={() => {
                                    setCheckPasswordTargetUser(u);
                                    setCheckPasswordCandidate('');
                                    setCheckPasswordResult(null);
                                  }}
                                  title={`Check / Test candidate password for ${u.username}`}
                                >
                                  🔍 Check
                                </button>
                                <button
                                  type="button"
                                  className="admin-table-btn admin-btn-reset"
                                  onClick={() => {
                                    setResetTargetUser(u.username);
                                    setNewPasswordVal('');
                                    setEditingUser(null);
                                  }}
                                  title={`Reset password for ${u.username}`}
                                >
                                  🔑 Pass
                                </button>
                                <button
                                  type="button"
                                  className="admin-table-btn admin-btn-secondary"
                                  onClick={() => handleStartEditUser(u)}
                                  title={`Edit profile for ${u.username}`}
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  type="button"
                                  className="admin-table-btn admin-btn-secondary"
                                  onClick={() => handleUnlockUser(u.username)}
                                  title={`Clear lockout timer for ${u.username}`}
                                >
                                  🔓 Unlock
                                </button>
                                <button
                                  type="button"
                                  className="admin-table-btn admin-btn-delete"
                                  disabled={isMasterAdmin}
                                  onClick={() => handleDeleteUser(u.username)}
                                  title={
                                    isMasterAdmin
                                      ? 'Master admin cannot be deleted'
                                      : `Delete user ${u.username}`
                                  }
                                >
                                  🗑 Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: BOOKS */}
          {/* ========================================================================= */}
          {activeTab === 'books' && (
            <div className="admin-tab-content">
              {/* Books Toolbar */}
              <div className="admin-table-toolbar">
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
                  <input
                    type="text"
                    placeholder="Filter by owner..."
                    value={bookOwnerFilter}
                    onChange={(e) => setBookOwnerFilter(e.target.value)}
                    className="admin-input"
                    style={{ maxWidth: '200px' }}
                  />
                  <input
                    type="text"
                    placeholder="Filter by title..."
                    value={bookTitleFilter}
                    onChange={(e) => setBookTitleFilter(e.target.value)}
                    className="admin-input"
                    style={{ maxWidth: '240px' }}
                  />
                  {(bookOwnerFilter || bookTitleFilter) && (
                    <button
                      type="button"
                      className="admin-btn-secondary"
                      onClick={() => {
                        setBookOwnerFilter('');
                        setBookTitleFilter('');
                      }}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  className="brass-btn admin-action-trigger"
                  onClick={() => setIsCreateBookOpen((prev) => !prev)}
                >
                  {isCreateBookOpen ? '✕ Cancel' : '+ Add Notebook for User'}
                </button>
              </div>

              {/* Create Book for User Form */}
              {isCreateBookOpen && (
                <form
                  onSubmit={handleCreateBook}
                  className="admin-create-book-card"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--brass)',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '16px',
                  }}
                >
                  <h4 style={{ color: 'var(--brass-bright)', marginBottom: '12px' }}>
                    ➕ Create New Notebook for User
                  </h4>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--brass)', marginBottom: '4px' }}>
                        Owner User *
                      </label>
                      <select
                        value={newBookOwner}
                        onChange={(e) => setNewBookOwner(e.target.value)}
                        className="admin-select"
                        disabled={creatingBook}
                      >
                        {users.map((u) => (
                          <option key={u.username} value={u.username}>
                            {u.username} {u.isAdmin ? '(Admin)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--brass)', marginBottom: '4px' }}>
                        Notebook Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Q3 Strategic Plan"
                        value={newBookTitle}
                        onChange={(e) => setNewBookTitle(e.target.value)}
                        className="admin-input"
                        disabled={creatingBook}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--brass)', marginBottom: '4px' }}>
                        Cover Theme
                      </label>
                      <select
                        value={newBookCover}
                        onChange={(e) => setNewBookCover(e.target.value as CoverTheme)}
                        className="admin-select"
                        disabled={creatingBook}
                      >
                        <option value="brown">Chestnut (Brown)</option>
                        <option value="black">Obsidian (Black)</option>
                        <option value="navy">Midnight (Navy)</option>
                        <option value="green">Forest (Green)</option>
                        <option value="burgundy">Burgundy (Wine)</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
                    <button
                      type="submit"
                      className="brass-btn"
                      disabled={creatingBook || !newBookTitle.trim()}
                    >
                      {creatingBook ? 'Creating...' : 'Create Notebook'}
                    </button>
                    <button
                      type="button"
                      className="admin-btn-secondary"
                      onClick={() => setIsCreateBookOpen(false)}
                      disabled={creatingBook}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Edit Book Modal/Section */}
              {editingBook && (
                <div
                  className="admin-edit-book-card"
                  style={{
                    background: 'rgba(30, 40, 20, 0.4)',
                    border: '1px solid var(--brass-bright)',
                    borderRadius: '8px',
                    padding: '14px',
                    marginBottom: '16px',
                  }}
                >
                  <h4 style={{ color: 'var(--brass-bright)', marginBottom: '8px' }}>
                    ✏️ Edit Notebook Details: "{editingBook.title}"
                  </h4>
                  <form onSubmit={handleSaveEditBook} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--brass)', marginBottom: '4px' }}>
                        Notebook Title
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Notebook Title"
                        value={editBookTitle}
                        onChange={(e) => setEditBookTitle(e.target.value)}
                        className="admin-input"
                        style={{ minWidth: '240px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--brass)', marginBottom: '4px' }}>
                        Cover Color Theme
                      </label>
                      <select
                        value={editBookCover}
                        onChange={(e) => setEditBookCover(e.target.value as CoverTheme)}
                        className="admin-select"
                      >
                        <option value="brown">Chestnut (Brown)</option>
                        <option value="black">Obsidian (Black)</option>
                        <option value="navy">Midnight (Navy)</option>
                        <option value="green">Forest (Green)</option>
                        <option value="burgundy">Burgundy (Wine)</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="submit"
                        className="brass-btn"
                        disabled={savingEditBook || !editBookTitle.trim()}
                      >
                        {savingEditBook ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        className="admin-btn-secondary"
                        onClick={() => setEditingBook(null)}
                        disabled={savingEditBook}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Transfer Book Ownership Modal/Section */}
              {transferringBook && (
                <div
                  className="admin-transfer-book-card"
                  style={{
                    background: 'rgba(50, 35, 10, 0.45)',
                    border: '1px solid var(--brass-bright)',
                    borderRadius: '8px',
                    padding: '14px',
                    marginBottom: '16px',
                  }}
                >
                  <h4 style={{ color: 'var(--brass-bright)', marginBottom: '8px' }}>
                    🔄 Transfer Notebook Ownership: "{transferringBook.title}"
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--paper)', opacity: 0.85, marginBottom: '10px' }}>
                    Current Owner: <strong>{transferringBook.owner}</strong>. Select the new user who will own this notebook:
                  </p>
                  <form onSubmit={handleSaveTransferBook} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <select
                      value={transferToUser}
                      onChange={(e) => setTransferToUser(e.target.value)}
                      className="admin-select"
                      style={{ minWidth: '200px' }}
                    >
                      {users
                        .filter((u) => u.username.toLowerCase() !== (transferringBook.owner || '').toLowerCase())
                        .map((u) => (
                          <option key={u.username} value={u.username}>
                            👤 {u.username} {u.isAdmin ? '(Admin)' : ''}
                          </option>
                        ))}
                    </select>
                    <button
                      type="submit"
                      className="brass-btn"
                      disabled={savingTransfer || !transferToUser}
                    >
                      {savingTransfer ? 'Transferring...' : 'Transfer Ownership'}
                    </button>
                    <button
                      type="button"
                      className="admin-btn-secondary"
                      onClick={() => setTransferringBook(null)}
                      disabled={savingTransfer}
                    >
                      Cancel
                    </button>
                  </form>
                </div>
              )}

              {/* Quota Management Modal/Card */}
              {quotaTargetBook && (
                <div
                  className="admin-quota-card"
                  style={{
                    background: 'rgba(20, 35, 45, 0.7)',
                    border: '1px solid var(--brass-bright)',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ color: 'var(--brass-bright)', margin: 0 }}>
                      📐 Dimension Modification Quota: "{quotaTargetBook.title}" (@{quotaTargetBook.owner})
                    </h4>
                    <button
                      type="button"
                      className="admin-banner-dismiss"
                      onClick={() => setQuotaTargetBook(null)}
                    >
                      ✕
                    </button>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#cbd5e0', marginBottom: '12px' }}>
                    Free users are allowed up to 5 dimension modifications per book by default. As an Admin, you can increase this notebook's modification limit or reset the used counter.
                  </p>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--brass)' }}>Add Extra Changes:</label>
                      <select
                        value={extraQuotaCount}
                        onChange={(e) => setExtraQuotaCount(Number(e.target.value))}
                        className="admin-select"
                        disabled={savingQuota}
                      >
                        <option value={5}>+5 Modifications</option>
                        <option value={10}>+10 Modifications</option>
                        <option value={20}>+20 Modifications</option>
                        <option value={50}>+50 Modifications</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      className="brass-btn"
                      onClick={() => handleSaveIncreaseQuota(false)}
                      disabled={savingQuota}
                    >
                      {savingQuota ? 'Updating...' : `➕ Add +${extraQuotaCount} Quota`}
                    </button>

                    <button
                      type="button"
                      className="admin-btn-secondary"
                      onClick={() => handleSaveIncreaseQuota(true)}
                      disabled={savingQuota}
                      style={{ borderColor: '#60a5fa', color: '#60a5fa' }}
                    >
                      🔄 Reset Used Counter to 0
                    </button>
                  </div>
                </div>
              )}

              {/* Books Table */}
              <div className="admin-table-container">
                {loadingBooks ? (
                  <div className="admin-loading-row">Loading books across all vaults...</div>
                ) : filteredBooks.length === 0 ? (
                  <div className="admin-empty-state">No notebooks match the specified filters.</div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Owner</th>
                        <th>Notebook Title</th>
                        <th>Theme</th>
                        <th>Size / Aspect Ratio</th>
                        <th>Quota</th>
                        <th>Pages</th>
                        <th>Updated</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBooks.map((b) => (
                        <tr key={b.id}>
                          <td className="font-semibold">
                            <span style={{ marginRight: '6px' }}>👤</span>
                            {b.owner}
                          </td>
                          <td>
                            <strong>{b.title}</strong>
                            <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>ID: {b.id}</div>
                          </td>
                          <td>
                            <span className={`cover-pill cover-pill-${b.coverColor || 'brown'}`}>
                              {b.coverColor || 'brown'}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--brass-bright)' }}>
                              Ratio {b.dimensions?.aspectRatio || 1.36} : 1
                            </div>
                            <div style={{ fontSize: '0.72rem', opacity: 0.75 }}>
                              {b.dimensions?.preset || 'classic'} preset
                            </div>
                          </td>
                          <td>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 600,
                                background:
                                  (b.dimensions?.dimensionChangeCount || 0) >=
                                  (b.dimensions?.maxDimensionChanges || 5)
                                    ? 'rgba(239, 68, 68, 0.2)'
                                    : 'rgba(52, 211, 153, 0.15)',
                                color:
                                  (b.dimensions?.dimensionChangeCount || 0) >=
                                  (b.dimensions?.maxDimensionChanges || 5)
                                    ? '#f87171'
                                    : '#34d399',
                              }}
                            >
                              {b.dimensions?.dimensionChangeCount || 0} /{' '}
                              {b.dimensions?.maxDimensionChanges || 5} Used
                            </span>
                          </td>
                          <td>{b.pageCount || 1}</td>
                          <td className="text-muted">{formatDate(b.updatedAt)}</td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'nowrap' }}>
                              <button
                                type="button"
                                className="admin-table-btn admin-btn-godmode brass-btn"
                                onClick={() => handleOpenGodMode(b)}
                                title={`Open "${b.title}" in God Mode to view and edit pages`}
                              >
                                📖 View & Edit Pages (God Mode)
                              </button>
                              <button
                                type="button"
                                className="admin-table-btn admin-btn-secondary"
                                onClick={() => {
                                  setQuotaTargetBook(b);
                                  setEditingBook(null);
                                  setTransferringBook(null);
                                }}
                                title="Increase dimension modification quota or reset count"
                              >
                                📐 Quota
                              </button>
                              <button
                                type="button"
                                className="admin-table-btn admin-btn-secondary"
                                onClick={() => handleStartEditBook(b)}
                                title="Edit notebook title and cover theme"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                type="button"
                                className="admin-table-btn admin-btn-secondary"
                                onClick={() => handleStartTransferBook(b)}
                                title="Transfer notebook to another user"
                              >
                                🔄 Transfer
                              </button>
                              <button
                                type="button"
                                className="admin-table-btn admin-btn-secondary"
                                onClick={() => handleExportBook(b)}
                                title="Download JSON backup of this notebook"
                              >
                                💾 Export
                              </button>
                              <button
                                type="button"
                                className="admin-table-btn admin-btn-delete"
                                onClick={() => handleDeleteBook(b.id, b.owner || 'unknown', b.title)}
                                title="Delete this notebook"
                              >
                                🗑 Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: AUDIT LOGS */}
          {/* ========================================================================= */}
          {activeTab === 'logs' && (
            <div className="admin-tab-content">
              {/* Audit Logs Controls & Filters */}
              <div className="admin-table-toolbar" style={{ flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
                  <input
                    type="text"
                    placeholder="Search logs (actor, action, details)..."
                    value={logSearch}
                    onChange={(e) => {
                      setLogSearch(e.target.value);
                      setLogPageOffset(0);
                    }}
                    className="admin-input"
                    style={{ minWidth: '220px' }}
                  />

                  <select
                    value={logActionFilter}
                    onChange={(e) => {
                      setLogActionFilter(e.target.value);
                      setLogPageOffset(0);
                    }}
                    className="admin-select"
                  >
                    <option value="">All Actions</option>
                    <option value="USER_LOGIN">USER_LOGIN</option>
                    <option value="USER_REGISTER">USER_REGISTER</option>
                    <option value="USER_LOCK">USER_LOCK</option>
                    <option value="ADMIN_USER_CREATE">ADMIN_USER_CREATE</option>
                    <option value="ADMIN_USER_DELETE">ADMIN_USER_DELETE</option>
                    <option value="ADMIN_PASSWORD_RESET">ADMIN_PASSWORD_RESET</option>
                    <option value="ADMIN_BOOK_DELETE">ADMIN_BOOK_DELETE</option>
                    <option value="UNAUTHORIZED_ADMIN_ACCESS">UNAUTHORIZED_ADMIN_ACCESS</option>
                    <option value="FORBIDDEN_ADMIN_ACCESS">FORBIDDEN_ADMIN_ACCESS</option>
                    <option value="LOGS_CLEARED">LOGS_CLEARED</option>
                    <option value="LOG_ENTRY_DELETED">LOG_ENTRY_DELETED</option>
                    <option value="SYSTEM_BOOT">SYSTEM_BOOT</option>
                  </select>

                  <select
                    value={logStatusFilter}
                    onChange={(e) => {
                      setLogStatusFilter(e.target.value);
                      setLogPageOffset(0);
                    }}
                    className="admin-select"
                  >
                    <option value="">All Statuses</option>
                    <option value="SUCCESS">SUCCESS</option>
                    <option value="FAILED">FAILED</option>
                    <option value="WARNING">WARNING</option>
                    <option value="PENDING">PENDING</option>
                  </select>

                  <select
                    value={logPageLimit}
                    onChange={(e) => {
                      setLogPageLimit(Number(e.target.value));
                      setLogPageOffset(0);
                    }}
                    className="admin-select"
                    style={{ width: '100px' }}
                  >
                    <option value={10}>10 / page</option>
                    <option value={25}>25 / page</option>
                    <option value={50}>50 / page</option>
                    <option value={100}>100 / page</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="brass-btn admin-action-btn"
                    onClick={handleCopyAllLogs}
                    title="Copy all current audit logs as JSON to clipboard"
                  >
                    {copiedAllLogs ? '✓ Logs Copied!' : '📋 Copy Logs (JSON)'}
                  </button>

                  <button
                    type="button"
                    className="brass-btn admin-action-btn"
                    onClick={handleExportLogs}
                    disabled={isExporting}
                    title="Export all decrypted audit logs to a JSON file"
                  >
                    {isExporting ? 'Exporting...' : '💾 Export Logs (JSON)'}
                  </button>

                  <button
                    type="button"
                    className="admin-btn-danger admin-action-btn"
                    onClick={handleClearLogs}
                    disabled={isClearing}
                    title="Purge all audit logs"
                  >
                    {isClearing ? 'Clearing...' : '🧹 Clear Logs'}
                  </button>
                </div>
              </div>

              {/* Logs Table */}
              <div className="admin-table-container">
                {loadingLogs ? (
                  <div className="admin-loading-row">Decrypting and loading audit records...</div>
                ) : logs.length === 0 ? (
                  <div className="admin-empty-state">No audit logs match current filters.</div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Actor</th>
                        <th>Action</th>
                        <th>Status</th>
                        <th>IP Address</th>
                        <th>Target / Resource</th>
                        <th>Details</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((l) => {
                        const isSuccess = (l.status || '').toUpperCase() === 'SUCCESS';
                        const isFailed = (l.status || '').toUpperCase() === 'FAILED';
                        return (
                          <tr key={l.id}>
                            <td className="text-muted" style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                              {formatDate(l.timestamp)}
                            </td>
                            <td className="font-semibold">
                              {l.actor || l.username || 'anonymous'}
                            </td>
                            <td>
                              <code className="admin-action-code">{l.action || l.eventType || 'UNKNOWN'}</code>
                            </td>
                            <td>
                              <span
                                className={`log-status-badge ${
                                  isSuccess
                                    ? 'status-success'
                                    : isFailed
                                    ? 'status-failed'
                                    : 'status-warning'
                                }`}
                              >
                                {l.status}
                              </span>
                            </td>
                            <td className="text-muted" style={{ fontSize: '0.8rem' }}>
                              {l.ip || l.ipAddress || '—'}
                            </td>
                            <td>{l.target || l.resource || '—'}</td>
                            <td className="log-details-cell" title={l.details}>
                              {l.details || '—'}
                            </td>
                            <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                              <button
                                type="button"
                                className="admin-table-btn admin-btn-secondary"
                                onClick={() => handleCopyLog(l)}
                                style={{ marginRight: '6px' }}
                                title="Copy this log entry as JSON"
                              >
                                {copiedLogId === l.id ? '✓ Copied' : '📋 Copy'}
                              </button>
                              <button
                                type="button"
                                className="admin-table-btn admin-btn-delete"
                                onClick={() => handleDeleteLog(l.id)}
                                disabled={deletingLogId === l.id}
                                title="Delete log entry"
                              >
                                {deletingLogId === l.id ? 'Deleting...' : '🗑 Delete'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination Controls */}
              <div className="admin-pagination">
                <span className="pagination-info">
                  Page {currentPage} of {totalPages} ({totalLogsCount} total logs)
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className="admin-btn-secondary pagination-btn"
                    disabled={logPageOffset <= 0 || loadingLogs}
                    onClick={() => setLogPageOffset((prev) => Math.max(0, prev - logPageLimit))}
                  >
                    ◀ Previous
                  </button>
                  <button
                    type="button"
                    className="admin-btn-secondary pagination-btn"
                    disabled={logPageOffset + logPageLimit >= totalLogsCount || loadingLogs}
                    onClick={() => setLogPageOffset((prev) => prev + logPageLimit)}
                  >
                    Next ▶
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: REDEEM KEYS */}
          {/* ========================================================================= */}
          {activeTab === 'keys' && (
            <div className="admin-tab-content">
              {/* Top Key Creation & Batch Generation Card */}
              <div
                style={{
                  background: 'rgba(25, 20, 15, 0.75)',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  borderRadius: '10px',
                  padding: '16px 20px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.4rem' }}>✨</span>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fef08a' }}>
                        Generate License & Redeem Keys
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#9ca3af' }}>
                        Generates secure 20-character license keys formatted as <code>XXXX-XXXX-XXXX-XXXX-XXXX</code> (numbers & capital letters).
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', alignItems: 'flex-end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#d1fae5', marginBottom: '4px', fontWeight: 600 }}>
                      Target Membership Plan
                    </label>
                    <select
                      className="admin-input"
                      value={keyTier}
                      onChange={(e) => setKeyTier(e.target.value as 'ultimate' | 'premium')}
                      style={{ width: '100%' }}
                    >
                      <option value="ultimate">⚡ Ultimate Sovereign (No Limits)</option>
                      <option value="premium">👑 Guild Master (VIP)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#d1fae5', marginBottom: '4px', fontWeight: 600 }}>
                      Quantity to Generate
                    </label>
                    <select
                      className="admin-input"
                      value={keyCount}
                      onChange={(e) => setKeyCount(Number(e.target.value))}
                      style={{ width: '100%' }}
                    >
                      <option value={1}>1 Key</option>
                      <option value={5}>5 Keys</option>
                      <option value={10}>10 Keys</option>
                      <option value={25}>25 Keys</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#d1fae5', marginBottom: '4px', fontWeight: 600 }}>
                      Max Uses Per Key
                    </label>
                    <select
                      className="admin-input"
                      value={keyMaxUses}
                      onChange={(e) => setKeyMaxUses(Number(e.target.value))}
                      style={{ width: '100%' }}
                    >
                      <option value={1}>1 Use (Single User)</option>
                      <option value={5}>5 Uses</option>
                      <option value={25}>25 Uses</option>
                      <option value={100}>100 Uses (Community)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#d1fae5', marginBottom: '4px', fontWeight: 600 }}>
                      Campaign / Note (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. VIP Member Giveaway"
                      value={keyNotes}
                      onChange={(e) => setKeyNotes(e.target.value)}
                      className="admin-input"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <button
                      type="button"
                      disabled={generatingKeys}
                      onClick={handleCreateKeys}
                      className="brass-btn"
                      style={{ width: '100%', height: '38px' }}
                    >
                      {generatingKeys ? 'Generating...' : '✨ Generate Keys'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Keys Search & Filter Toolbar */}
              <div className="admin-toolbar" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Search license keys or user..."
                  value={keySearch}
                  onChange={(e) => setKeySearch(e.target.value)}
                  className="admin-input"
                  style={{ minWidth: '220px', flex: 1 }}
                />

                <select
                  className="admin-input"
                  value={keyFilterTier}
                  onChange={(e) => setKeyFilterTier(e.target.value)}
                  style={{ minWidth: '130px' }}
                >
                  <option value="all">All Plans</option>
                  <option value="ultimate">⚡ Ultimate</option>
                  <option value="premium">👑 VIP</option>
                </select>

                <select
                  className="admin-input"
                  value={keyFilterStatus}
                  onChange={(e) => setKeyFilterStatus(e.target.value)}
                  style={{ minWidth: '130px' }}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">🟢 Active</option>
                  <option value="redeemed">🟣 Redeemed</option>
                  <option value="revoked">🔴 Revoked</option>
                </select>

                <button
                  type="button"
                  onClick={fetchKeys}
                  disabled={loadingKeys}
                  className="admin-btn-secondary"
                  title="Refresh keys table"
                >
                  🔄 Refresh
                </button>
              </div>

              {/* Keys Table */}
              <div className="admin-table-container">
                {loadingKeys ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="split-spinner" />
                    <p style={{ marginTop: '10px', color: '#9ca3af' }}>Loading license keys...</p>
                  </div>
                ) : keys.filter((k) => {
                    if (keySearch.trim()) {
                      const q = keySearch.toLowerCase().trim();
                      const matchesCode = k.key_code.toLowerCase().includes(q);
                      const matchesUser = k.redeemed_by?.toLowerCase().includes(q);
                      const matchesNotes = k.notes?.toLowerCase().includes(q);
                      if (!matchesCode && !matchesUser && !matchesNotes) return false;
                    }
                    if (keyFilterTier !== 'all' && k.target_tier !== keyFilterTier) return false;
                    const isFullyUsed = k.used_count >= k.max_uses;
                    const isKeyActive = k.is_active && !isFullyUsed;
                    if (keyFilterStatus === 'active' && !isKeyActive) return false;
                    if (keyFilterStatus === 'redeemed' && !isFullyUsed) return false;
                    if (keyFilterStatus === 'revoked' && (k.is_active || isFullyUsed)) return false;
                    return true;
                  }).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                    No license keys found. Generate a new key above.
                  </div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>License Key (XXXX-XXXX-XXXX-XXXX-XXXX)</th>
                        <th>Target Plan</th>
                        <th>Status</th>
                        <th>Uses</th>
                        <th>Redeemed By</th>
                        <th>Created</th>
                        <th>Notes</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {keys
                        .filter((k) => {
                          if (keySearch.trim()) {
                            const q = keySearch.toLowerCase().trim();
                            const matchesCode = k.key_code.toLowerCase().includes(q);
                            const matchesUser = k.redeemed_by?.toLowerCase().includes(q);
                            const matchesNotes = k.notes?.toLowerCase().includes(q);
                            if (!matchesCode && !matchesUser && !matchesNotes) return false;
                          }
                          if (keyFilterTier !== 'all' && k.target_tier !== keyFilterTier) return false;
                          const isFullyUsed = k.used_count >= k.max_uses;
                          const isKeyActive = k.is_active && !isFullyUsed;
                          if (keyFilterStatus === 'active' && !isKeyActive) return false;
                          if (keyFilterStatus === 'redeemed' && !isFullyUsed) return false;
                          if (keyFilterStatus === 'revoked' && (k.is_active || isFullyUsed)) return false;
                          return true;
                        })
                        .map((k) => {
                          const isFullyUsed = k.used_count >= k.max_uses;
                          const isKeyActive = k.is_active && !isFullyUsed;
                          return (
                            <tr key={k.id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <code
                                    style={{
                                      fontFamily: 'monospace',
                                      fontWeight: 'bold',
                                      color: isKeyActive ? '#fef08a' : '#9ca3af',
                                      fontSize: '0.92rem',
                                      letterSpacing: '1px',
                                    }}
                                  >
                                    {k.key_code}
                                  </code>
                                  <button
                                    type="button"
                                    className="admin-table-btn admin-btn-secondary"
                                    onClick={() => handleCopyKey(k.key_code, k.id)}
                                    title="Copy license key to clipboard"
                                    style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                                  >
                                    {copiedKeyId === k.id ? '✓ Copied' : '📋 Copy'}
                                  </button>
                                </div>
                              </td>
                              <td>
                                <span
                                  className={`tier-pill-badge ${
                                    k.target_tier === 'ultimate' ? 'tier-pill-ultimate' : 'tier-pill-vip'
                                  }`}
                                >
                                  {k.target_tier === 'ultimate' ? '⚡ Ultimate' : '👑 VIP'}
                                </span>
                              </td>
                              <td>
                                {isKeyActive ? (
                                  <span style={{ color: '#34d399', fontWeight: 600, fontSize: '0.82rem' }}>
                                    🟢 Active
                                  </span>
                                ) : isFullyUsed ? (
                                  <span style={{ color: '#c084fc', fontWeight: 600, fontSize: '0.82rem' }}>
                                    🟣 Redeemed
                                  </span>
                                ) : (
                                  <span style={{ color: '#f87171', fontWeight: 600, fontSize: '0.82rem' }}>
                                    🔴 Revoked
                                  </span>
                                )}
                              </td>
                              <td>
                                {k.used_count} / {k.max_uses}
                              </td>
                              <td>
                                {k.redeemed_by ? (
                                  <div>
                                    <strong style={{ color: '#fef08a' }}>{k.redeemed_by}</strong>
                                    <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                                      {formatDate(k.redeemed_at)}
                                    </div>
                                  </div>
                                ) : (
                                  <span style={{ color: '#6b7280' }}>—</span>
                                )}
                              </td>
                              <td style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
                                {formatDate(k.created_at)}
                              </td>
                              <td style={{ fontSize: '0.8rem', color: '#d1d5db', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {k.notes || '—'}
                              </td>
                              <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                {isKeyActive && (
                                  <button
                                    type="button"
                                    className="admin-table-btn admin-btn-edit"
                                    onClick={() => handleRevokeKey(k.id)}
                                    style={{ marginRight: '6px' }}
                                    title="Revoke key immediately"
                                  >
                                    🚫 Revoke
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="admin-table-btn admin-btn-delete"
                                  onClick={() => handleDeleteKey(k.id)}
                                  title="Delete key"
                                >
                                  🗑 Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin God Mode Viewer & Editor Modal */}
      {isGodModeOpen && godModeBook && (
        <AdminGodModeModal
          isOpen={isGodModeOpen}
          bookId={godModeBook.id}
          owner={godModeBook.owner}
          initialTitle={godModeBook.title}
          initialCover={godModeBook.coverColor as CoverTheme}
          onClose={() => {
            setIsGodModeOpen(false);
            setGodModeBook(null);
          }}
          onBookUpdated={() => {
            fetchBooks();
            fetchStatus();
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboardModal;

