import React, { useMemo } from 'react';
import { checkPasswordStrength } from '../../lib/crypto/passwordCheck';

export interface PasswordStrengthMeterProps {
  password: string;
  showCriteria?: boolean;
  showFeedback?: boolean;
  className?: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  showCriteria = true,
  showFeedback = false,
  className = '',
}) => {
  const result = useMemo(() => checkPasswordStrength(password), [password]);

  if (!password) return null;

  return (
    <div
      className={`password-strength-meter ${className}`}
      style={{
        marginTop: '6px',
        marginBottom: '10px',
        padding: '8px 10px',
        background: 'rgba(0, 0, 0, 0.35)',
        border: '1px solid rgba(184, 147, 90, 0.3)',
        borderRadius: '6px',
        fontSize: '0.78rem',
      }}
    >
      {/* Header with Score and Strength Label */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
        <span style={{ color: 'var(--brass, #b8935a)', fontWeight: 600 }}>Password Security</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: result.color, fontWeight: 700 }}>{result.label}</span>
          <span style={{ color: '#a0aec0', fontSize: '0.72rem' }}>({result.score}%)</span>
        </div>
      </div>

      {/* Strength Bar */}
      <div
        style={{
          width: '100%',
          height: '5px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '3px',
          overflow: 'hidden',
          marginBottom: showCriteria ? '8px' : '0',
        }}
      >
        <div
          style={{
            width: `${result.score}%`,
            height: '100%',
            background: result.color,
            borderRadius: '3px',
            transition: 'width 0.3s ease, background-color 0.3s ease',
          }}
        />
      </div>

      {/* Criteria Badges */}
      {showCriteria && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          <span
            style={{
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '0.7rem',
              background: result.criteria.minLength ? 'rgba(56, 161, 105, 0.25)' : 'rgba(255, 255, 255, 0.05)',
              color: result.criteria.minLength ? '#68d391' : '#718096',
              border: `1px solid ${result.criteria.minLength ? '#38a169' : 'transparent'}`,
            }}
          >
            {result.criteria.minLength ? '✓' : '○'} 8+ chars
          </span>
          <span
            style={{
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '0.7rem',
              background: result.criteria.hasUpper ? 'rgba(56, 161, 105, 0.25)' : 'rgba(255, 255, 255, 0.05)',
              color: result.criteria.hasUpper ? '#68d391' : '#718096',
              border: `1px solid ${result.criteria.hasUpper ? '#38a169' : 'transparent'}`,
            }}
          >
            {result.criteria.hasUpper ? '✓' : '○'} Upper (A-Z)
          </span>
          <span
            style={{
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '0.7rem',
              background: result.criteria.hasLower ? 'rgba(56, 161, 105, 0.25)' : 'rgba(255, 255, 255, 0.05)',
              color: result.criteria.hasLower ? '#68d391' : '#718096',
              border: `1px solid ${result.criteria.hasLower ? '#38a169' : 'transparent'}`,
            }}
          >
            {result.criteria.hasLower ? '✓' : '○'} Lower (a-z)
          </span>
          <span
            style={{
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '0.7rem',
              background: result.criteria.hasNumber ? 'rgba(56, 161, 105, 0.25)' : 'rgba(255, 255, 255, 0.05)',
              color: result.criteria.hasNumber ? '#68d391' : '#718096',
              border: `1px solid ${result.criteria.hasNumber ? '#38a169' : 'transparent'}`,
            }}
          >
            {result.criteria.hasNumber ? '✓' : '○'} Number (0-9)
          </span>
          <span
            style={{
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '0.7rem',
              background: result.criteria.hasSymbol ? 'rgba(56, 161, 105, 0.25)' : 'rgba(255, 255, 255, 0.05)',
              color: result.criteria.hasSymbol ? '#68d391' : '#718096',
              border: `1px solid ${result.criteria.hasSymbol ? '#38a169' : 'transparent'}`,
            }}
          >
            {result.criteria.hasSymbol ? '✓' : '○'} Symbol (!@#$)
          </span>
        </div>
      )}

      {/* Feedback Tips */}
      {showFeedback && result.feedback.length > 0 && (
        <div style={{ marginTop: '6px', color: '#cbd5e0', fontSize: '0.72rem' }}>
          💡 {result.feedback[0]}
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;
