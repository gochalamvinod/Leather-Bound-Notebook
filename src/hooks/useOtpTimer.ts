import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseOtpTimerOptions {
  /** Initial cooldown seconds (e.g. 60) */
  initialCooldown?: number;
  /** Initial expiration seconds (e.g. 600) */
  initialExpiration?: number;
  /** Auto-start cooldown on mount (default true if initialCooldown > 0) */
  autoStartCooldown?: boolean;
  /** Callback when cooldown hits 0 */
  onCooldownEnd?: () => void;
  /** Callback when expiration hits 0 */
  onExpire?: () => void;
}

export interface UseOtpTimerReturn {
  /** Seconds remaining before resending is permitted */
  cooldownRemaining: number;
  /** Formatted cooldown string (e.g. "00:45") */
  formattedCooldown: string;
  /** True if cooldown is active and user must wait */
  isCooldownActive: boolean;
  /** Seconds remaining before current OTP expires */
  expirationRemaining: number;
  /** Formatted expiration string (e.g. "09:30") */
  formattedExpiration: string;
  /** True if OTP has expired */
  isExpired: boolean;
  /** Helper to format any seconds number into "MM:SS" */
  formatTime: (seconds: number) => string;
  /** Start a new cooldown timer with specified or default seconds */
  startCooldown: (seconds?: number) => void;
  /** Reset / cancel cooldown immediately (allows resend) */
  resetCooldown: () => void;
  /** Set a new expiration duration */
  setExpiration: (seconds?: number) => void;
  /** Reset both cooldown and expiration */
  resetAll: (newCooldown?: number, newExpiration?: number) => void;
}

/**
 * Robust countdown timer hook for OTP cooldowns and expiration.
 * Employs absolute timestamp calculations to prevent browser tab throttle drift.
 */
export function useOtpTimer(options: UseOtpTimerOptions = {}): UseOtpTimerReturn {
  const {
    initialCooldown = 60,
    initialExpiration = 600,
    autoStartCooldown = true,
    onCooldownEnd,
    onExpire,
  } = options;

  const defaultCooldownSec = initialCooldown;
  const defaultExpirationSec = initialExpiration;

  // Timestamps for drift-proof tracking
  const [cooldownEndTime, setCooldownEndTime] = useState<number | null>(() =>
    autoStartCooldown && initialCooldown > 0 ? Date.now() + initialCooldown * 1000 : null
  );

  const [expirationEndTime, setExpirationEndTime] = useState<number | null>(() =>
    initialExpiration > 0 ? Date.now() + initialExpiration * 1000 : null
  );

  const [cooldownRemaining, setCooldownRemaining] = useState<number>(() =>
    autoStartCooldown ? initialCooldown : 0
  );

  const [expirationRemaining, setExpirationRemaining] = useState<number>(initialExpiration);

  const onCooldownEndRef = useRef(onCooldownEnd);
  onCooldownEndRef.current = onCooldownEnd;

  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const hadActiveCooldownRef = useRef(autoStartCooldown && initialCooldown > 0);
  const hadActiveExpirationRef = useRef(initialExpiration > 0);

  const formatTime = useCallback((secs: number): string => {
    const s = Math.max(0, Math.floor(secs));
    const mins = Math.floor(s / 60);
    const remainder = s % 60;
    const paddedMins = mins < 10 ? `0${mins}` : `${mins}`;
    const paddedSecs = remainder < 10 ? `0${remainder}` : `${remainder}`;
    return `${paddedMins}:${paddedSecs}`;
  }, []);

  const startCooldown = useCallback((seconds: number = defaultCooldownSec) => {
    if (seconds <= 0) {
      setCooldownEndTime(null);
      setCooldownRemaining(0);
      return;
    }
    const end = Date.now() + seconds * 1000;
    setCooldownEndTime(end);
    setCooldownRemaining(seconds);
    hadActiveCooldownRef.current = true;
  }, [defaultCooldownSec]);

  const resetCooldown = useCallback(() => {
    setCooldownEndTime(null);
    setCooldownRemaining(0);
    hadActiveCooldownRef.current = false;
  }, []);

  const setExpiration = useCallback((seconds: number = defaultExpirationSec) => {
    if (seconds <= 0) {
      setExpirationEndTime(null);
      setExpirationRemaining(0);
      return;
    }
    const end = Date.now() + seconds * 1000;
    setExpirationEndTime(end);
    setExpirationRemaining(seconds);
    hadActiveExpirationRef.current = true;
  }, [defaultExpirationSec]);

  const resetAll = useCallback((newCooldown: number = defaultCooldownSec, newExpiration: number = defaultExpirationSec) => {
    startCooldown(newCooldown);
    setExpiration(newExpiration);
  }, [defaultCooldownSec, defaultExpirationSec, startCooldown, setExpiration]);

  // Periodic interval to sync seconds remaining against timestamps
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      // Update cooldown
      if (cooldownEndTime !== null) {
        const remaining = Math.max(0, Math.ceil((cooldownEndTime - now) / 1000));
        setCooldownRemaining(remaining);
        if (remaining <= 0) {
          setCooldownEndTime(null);
          if (hadActiveCooldownRef.current) {
            hadActiveCooldownRef.current = false;
            onCooldownEndRef.current?.();
          }
        }
      }

      // Update expiration
      if (expirationEndTime !== null) {
        const remaining = Math.max(0, Math.ceil((expirationEndTime - now) / 1000));
        setExpirationRemaining(remaining);
        if (remaining <= 0) {
          setExpirationEndTime(null);
          if (hadActiveExpirationRef.current) {
            hadActiveExpirationRef.current = false;
            onExpireRef.current?.();
          }
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [cooldownEndTime, expirationEndTime]);

  const isCooldownActive = cooldownRemaining > 0;
  const isExpired = expirationEndTime !== null && expirationRemaining <= 0;

  return {
    cooldownRemaining,
    formattedCooldown: formatTime(cooldownRemaining),
    isCooldownActive,
    expirationRemaining,
    formattedExpiration: formatTime(expirationRemaining),
    isExpired,
    formatTime,
    startCooldown,
    resetCooldown,
    setExpiration,
    resetAll,
  };
}

export default useOtpTimer;
