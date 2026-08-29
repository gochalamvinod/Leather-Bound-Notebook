import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { api } from '../lib/api/client';
import { BookshelfEntry, CoverTheme, UserEntry } from '../types/notebook';
import { OkResponse, SetupResponse, StatusResponse, UserMeResponse } from '../types/api';

export interface AuthContextType {
  isUnlocked: boolean;
  currentUser: string | null;
  isAdmin: boolean;
  setupNeeded: boolean;
  lockedOut: boolean;
  remainingSeconds: number;
  notebooks: BookshelfEntry[];
  users: UserEntry[];
  loading: boolean;
  error: string | null;
  selectedBook: BookshelfEntry | null;
  authPayload: SetupResponse | null;
  setSelectedBook: (book: BookshelfEntry | null) => void;
  checkStatus: () => Promise<void>;
  unlock: (password: string, username?: string, bookId?: string) => Promise<boolean>;
  setup: (password: string, username?: string, notebookTitle?: string, coverColor?: CoverTheme) => Promise<boolean>;
  lock: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<OkResponse>;
  getMe: () => Promise<UserMeResponse>;
  refreshLibrary: () => Promise<BookshelfEntry[]>;
  handleSessionLocked: () => void;
  startLockoutCountdown: (seconds: number) => void;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [setupNeeded, setSetupNeeded] = useState<boolean>(false);
  const [lockedOut, setLockedOut] = useState<boolean>(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [notebooks, setNotebooks] = useState<BookshelfEntry[]>([]);
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<BookshelfEntry | null>(null);
  const [authPayload, setAuthPayload] = useState<SetupResponse | null>(null);

  const lockoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const bouncedRef = useRef<boolean>(false);

  const clearLockoutTimer = useCallback(() => {
    if (lockoutTimerRef.current) {
      clearInterval(lockoutTimerRef.current);
      lockoutTimerRef.current = null;
    }
  }, []);

  const startLockoutCountdown = useCallback((seconds: number) => {
    clearLockoutTimer();
    setLockedOut(true);
    setRemainingSeconds(seconds);

    let current = seconds;
    lockoutTimerRef.current = setInterval(() => {
      current -= 1;
      if (current <= 0) {
        clearLockoutTimer();
        setLockedOut(false);
        setRemainingSeconds(0);
      } else {
        setRemainingSeconds(current);
      }
    }, 1000);
  }, [clearLockoutTimer]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleSessionLocked = useCallback((msg?: string) => {
    if (bouncedRef.current) return;
    bouncedRef.current = true;
    setIsUnlocked(false);
    setCurrentUser(null);
    setIsAdmin(false);
    setAuthPayload(null);
    if (msg) {
      setError(msg);
    }
    setTimeout(() => {
      bouncedRef.current = false;
    }, 1000);
  }, []);

  const checkStatus = useCallback(async () => {
    try {
      setLoading(true);
      const status: StatusResponse = await api.getStatus();
      if ((status as any).superseded) {
        setIsUnlocked(false);
        setCurrentUser(null);
        setIsAdmin(false);
        setAuthPayload(null);
        setError('⚠️ You were logged out because this account was logged into from another device.');
        setNotebooks(status.notebooks || []);
        setUsers(status.users || []);
        return;
      }

      setSetupNeeded(status.setupNeeded);
      setIsUnlocked(status.unlocked);
      const user = status.currentUser || null;
      setCurrentUser(user);
      setIsAdmin(Boolean(status.isAdmin || (user && user.toLowerCase() === 'admin')));
      setNotebooks(status.notebooks || []);
      setUsers(status.users || []);

      if (status.lockedOut && status.remainingSeconds > 0) {
        startLockoutCountdown(status.remainingSeconds);
      } else {
        setLockedOut(false);
        setRemainingSeconds(0);
      }

      if (status.unlocked) {
        try {
          const nbRes = await api.getNotebook();
          if (nbRes && nbRes.ok) {
            setAuthPayload(nbRes);
          }
        } catch {
          // If fetching notebook fails, leave auth state as is
        }
      }
      setError(null);
    } catch (err: any) {
      if ((err as any)?.superseded || (err as any)?.singleDeviceViolation) {
        setIsUnlocked(false);
        setCurrentUser(null);
        setIsAdmin(false);
        setAuthPayload(null);
        setError('⚠️ You were logged out because this account was logged into from another device.');
        return;
      }
      setError(err.message || 'Failed to connect to notebook server.');
    } finally {
      setLoading(false);
    }
  }, [startLockoutCountdown]);

  const refreshLibrary = useCallback(async (): Promise<BookshelfEntry[]> => {
    try {
      const data = await api.getLibrary();
      if (data && data.ok) {
        setNotebooks(data.notebooks || []);
        setUsers(data.users || []);
        return data.notebooks || [];
      }
      return [];
    } catch (err: any) {
      return [];
    }
  }, []);

  const unlock = useCallback(
    async (password: string, username?: string, bookId?: string): Promise<boolean> => {
      setError(null);
      try {
        const res = await api.unlock({ password, username, bookId });
        if (res && res.ok) {
          setIsUnlocked(true);
          setCurrentUser(res.user);
          setIsAdmin(Boolean((res as any).isAdmin ?? (res.user && res.user.toLowerCase() === 'admin')));
          setAuthPayload(res);
          setSetupNeeded(false);
          setLockedOut(false);
          setRemainingSeconds(0);
          clearLockoutTimer();
          return true;
        }
        return false;
      } catch (err: any) {
        if (err.status === 429 || err.lockedOut) {
          const secs = err.remainingSeconds || 1800;
          startLockoutCountdown(secs);
          setError(`Security Lockout Active: 5 failed attempts detected. Notebook locked for 30 minutes.`);
        } else {
          setError(err.message || 'Incorrect password.');
        }
        throw err;
      }
    },
    [clearLockoutTimer, startLockoutCountdown]
  );

  const setup = useCallback(
    async (
      password: string,
      username?: string,
      notebookTitle?: string,
      coverColor?: CoverTheme
    ): Promise<boolean> => {
      setError(null);
      try {
        const res = await api.setup({ password, username, notebookTitle, coverColor });
        if (res && res.ok) {
          setIsUnlocked(true);
          setCurrentUser(res.user);
          setIsAdmin(Boolean((res as any).isAdmin ?? (res.user && res.user.toLowerCase() === 'admin')));
          setAuthPayload(res);
          setSetupNeeded(false);
          setLockedOut(false);
          setRemainingSeconds(0);
          clearLockoutTimer();
          return true;
        }
        return false;
      } catch (err: any) {
        setError(err.message || 'Could not create user/notebook.');
        throw err;
      }
    },
    [clearLockoutTimer]
  );

  const lock = useCallback(async (): Promise<void> => {
    try {
      await api.lock();
    } catch {
      // Proceed with local lock even if remote fails
    } finally {
      setIsUnlocked(false);
      setCurrentUser(null);
      setIsAdmin(false);
      setAuthPayload(null);
      setSelectedBook(null);
      setLoading(false);
      api.getStatus().then((status: StatusResponse) => {
        setSetupNeeded(status.setupNeeded);
        setNotebooks(status.notebooks || []);
        setUsers(status.users || []);
      }).catch(() => {});
    }
  }, []);

  const changePassword = useCallback(
    async (newPassword: string): Promise<OkResponse> => {
      try {
        const res = await api.changePassword({ newPassword });
        return res;
      } catch (err: any) {
        if (err.status === 401) {
          handleSessionLocked();
        }
        throw err;
      }
    },
    [handleSessionLocked]
  );

  const getMe = useCallback(async (): Promise<UserMeResponse> => {
    try {
      const res = await api.getMe();
      return res;
    } catch (err: any) {
      if (err.status === 401) {
        handleSessionLocked();
      }
      throw err;
    }
  }, [handleSessionLocked]);

  useEffect(() => {
    checkStatus();
    return () => {
      clearLockoutTimer();
    };
  }, [checkStatus, clearLockoutTimer]);

  // Single-Device Enforcement Heartbeat:
  // While unlocked, verify every 10 seconds that the session hasn't been superseded by another device
  useEffect(() => {
    if (!isUnlocked) return;
    const interval = setInterval(async () => {
      try {
        const status = await api.getStatus();
        if ((status as any).superseded || !status.unlocked) {
          setIsUnlocked(false);
          setCurrentUser(null);
          setIsAdmin(false);
          setAuthPayload(null);
          setError('⚠️ You were logged out because this account was logged into from another device.');
        }
      } catch (err: any) {
        if ((err as any)?.superseded || (err as any)?.singleDeviceViolation) {
          setIsUnlocked(false);
          setCurrentUser(null);
          setIsAdmin(false);
          setAuthPayload(null);
          setError('⚠️ You were logged out because this account was logged into from another device.');
        }
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [isUnlocked]);

  const value: AuthContextType = {
    isUnlocked,
    currentUser,
    isAdmin,
    setupNeeded,
    lockedOut,
    remainingSeconds,
    notebooks,
    users,
    loading,
    error,
    selectedBook,
    authPayload,
    setSelectedBook,
    checkStatus,
    unlock,
    setup,
    lock,
    changePassword,
    getMe,
    refreshLibrary,
    handleSessionLocked,
    startLockoutCountdown,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
