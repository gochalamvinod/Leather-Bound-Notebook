/**
 * Password Strength Analysis & Security Checker Utility
 * Provides entropy calculation, rule validation, and score rating.
 */

export type PasswordStrengthLevel = 'very-weak' | 'weak' | 'fair' | 'strong' | 'very-strong';

export interface PasswordCriteria {
  minLength: boolean;
  hasLower: boolean;
  hasUpper: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
  isNotCommon: boolean;
}

export interface PasswordCheckResult {
  score: number; // 0 to 100
  level: PasswordStrengthLevel;
  label: string;
  color: string;
  entropy: number;
  criteria: PasswordCriteria;
  feedback: string[];
}

const COMMON_PASSWORDS = new Set([
  '123456', 'password', '12345678', 'qwerty', '123456789', '12345', '1234',
  '111111', '1234567', 'dragon', 'admin', 'welcome', 'login', 'pass1234',
  'master', 'secret', 'hunter2', 'letmein', 'football', 'monkey', 'shadow'
]);

export function checkPasswordStrength(password: string): PasswordCheckResult {
  if (!password || typeof password !== 'string') {
    return {
      score: 0,
      level: 'very-weak',
      label: 'Empty',
      color: '#a0aec0',
      entropy: 0,
      criteria: {
        minLength: false,
        hasLower: false,
        hasUpper: false,
        hasNumber: false,
        hasSymbol: false,
        isNotCommon: true,
      },
      feedback: ['Enter a password to check its strength.'],
    };
  }

  const length = password.length;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);
  const isCommon = COMMON_PASSWORDS.has(password.toLowerCase().trim());

  // Calculate pool size for entropy
  let poolSize = 0;
  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasNumber) poolSize += 10;
  if (hasSymbol) poolSize += 33;
  if (poolSize === 0) poolSize = 10;

  const entropy = Math.round(length * Math.log2(poolSize));

  // Score computation
  let score = 0;

  // Length points
  if (length >= 4) score += 10;
  if (length >= 8) score += 20;
  if (length >= 12) score += 15;
  if (length >= 16) score += 10;

  // Character variety points
  if (hasLower) score += 10;
  if (hasUpper) score += 10;
  if (hasNumber) score += 10;
  if (hasSymbol) score += 15;

  // Multi-type bonus
  const varieties = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
  if (varieties >= 3) score += 10;
  if (varieties >= 4) score += 10;

  // Penalties
  if (isCommon) score = Math.min(score, 15);
  if (/^[a-zA-Z]+$/.test(password) || /^[0-9]+$/.test(password)) {
    score = Math.max(0, score - 15);
  }
  if (/(.)\1{2,}/.test(password)) {
    score = Math.max(0, score - 10); // Repeated characters
  }

  score = Math.min(100, Math.max(0, score));

  let level: PasswordStrengthLevel = 'very-weak';
  let label = 'Very Weak';
  let color = '#e53e3e'; // Red

  if (score >= 80) {
    level = 'very-strong';
    label = 'Very Strong';
    color = '#38a169'; // Green
  } else if (score >= 60) {
    level = 'strong';
    label = 'Strong';
    color = '#319795'; // Teal
  } else if (score >= 40) {
    level = 'fair';
    label = 'Fair';
    color = '#d69e2e'; // Yellow / Amber
  } else if (score >= 20) {
    level = 'weak';
    label = 'Weak';
    color = '#dd6b20'; // Orange
  }

  const feedback: string[] = [];
  if (length < 8) feedback.push('Use at least 8 characters.');
  if (!hasUpper) feedback.push('Add uppercase letters.');
  if (!hasLower) feedback.push('Add lowercase letters.');
  if (!hasNumber) feedback.push('Add numbers.');
  if (!hasSymbol) feedback.push('Add special symbols (!@#$%^&*).');
  if (isCommon) feedback.push('Avoid common dictionary passwords.');

  return {
    score,
    level,
    label,
    color,
    entropy,
    criteria: {
      minLength: length >= 8,
      hasLower,
      hasUpper,
      hasNumber,
      hasSymbol,
      isNotCommon: !isCommon,
    },
    feedback,
  };
}
