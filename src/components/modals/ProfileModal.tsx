import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api/client';
import { UserMeResponse } from '../../types/api';

export interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessNotice?: (msg: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  onSuccessNotice,
}) => {
  const { currentUser, getMe, updateProfile } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [profileData, setProfileData] = useState<UserMeResponse | null>(null);

  // Form fields
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [preferredName, setPreferredName] = useState<string>('');

  // Initial loaded snapshot to detect changes
  const [initialState, setInitialState] = useState<{
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    preferredName: string;
  } | null>(null);

  // Live validation states
  const [checkingUsername, setCheckingUsername] = useState<boolean>(false);
  const [usernameStatus, setUsernameStatus] = useState<{
    available: boolean;
    isCurrent: boolean;
    message: string;
  } | null>(null);

  const [checkingEmail, setCheckingEmail] = useState<boolean>(false);
  const [emailStatus, setEmailStatus] = useState<{
    available: boolean;
    isCurrent: boolean;
    message: string;
  } | null>(null);

  const [saving, setSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement | null>(null);

  // Load profile data when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    getMe()
      .then((data) => {
        if (!mounted) return;
        setProfileData(data);
        const u = data.user || '';
        const em = data.email || '';
        const fn = data.firstName || data.first_name || '';
        const ln = data.lastName || data.last_name || '';
        const pn = data.preferredName || data.preferred_name || '';

        setUsername(u);
        setEmail(em);
        setFirstName(fn);
        setLastName(ln);
        setPreferredName(pn);

        setInitialState({
          username: u,
          email: em,
          firstName: fn,
          lastName: ln,
          preferredName: pn,
        });

        setUsernameStatus({
          available: true,
          isCurrent: true,
          message: 'Current Username',
        });

        if (em) {
          setEmailStatus({
            available: true,
            isCurrent: true,
            message: 'Current Email',
          });
        } else {
          setEmailStatus(null);
        }
      })
      .catch((err) => {
        if (!mounted) return;
        setErrorMessage(err?.message || 'Failed to load user profile details.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isOpen, getMe]);

  // Debounced username availability check
  useEffect(() => {
    if (!initialState) return;

    const trimmed = username.trim().toLowerCase();
    if (!trimmed) {
      setUsernameStatus({ available: false, isCurrent: false, message: 'Username is required' });
      return;
    }
    if (trimmed.length < 3) {
      setUsernameStatus({ available: false, isCurrent: false, message: 'Minimum 3 characters' });
      return;
    }
    if (trimmed === initialState.username.toLowerCase()) {
      setUsernameStatus({ available: true, isCurrent: true, message: 'Current Username' });
      return;
    }

    setCheckingUsername(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.checkUsername(trimmed);
        setUsernameStatus({
          available: !!res.available,
          isCurrent: false,
          message: res.available ? '✓ Username is available' : '✗ Username already taken',
        });
      } catch (e: any) {
        setUsernameStatus({ available: false, isCurrent: false, message: 'Could not verify username' });
      } finally {
        setCheckingUsername(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username, initialState]);

  // Debounced email availability check
  useEffect(() => {
    if (!initialState) return;

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setEmailStatus(null);
      return;
    }

    // Basic regex check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailStatus({ available: false, isCurrent: false, message: 'Invalid email format' });
      return;
    }

    if (trimmed === (initialState.email || '').toLowerCase()) {
      setEmailStatus({ available: true, isCurrent: true, message: 'Current Email' });
      return;
    }

    setCheckingEmail(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.checkEmail(trimmed);
        setEmailStatus({
          available: !!res.available,
          isCurrent: !!res.isCurrent,
          message: res.isCurrent
            ? 'Current Email'
            : res.available
            ? '✓ Email is available'
            : '✗ Email already registered',
        });
      } catch (e: any) {
        setEmailStatus({ available: false, isCurrent: false, message: 'Could not check email' });
      } finally {
        setCheckingEmail(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [email, initialState]);

  // Escape to close and outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Has anything been modified?
  const hasChanges =
    initialState &&
    (username.trim().toLowerCase() !== initialState.username.toLowerCase() ||
      email.trim().toLowerCase() !== (initialState.email || '').toLowerCase() ||
      firstName.trim() !== initialState.firstName ||
      lastName.trim() !== initialState.lastName ||
      preferredName.trim() !== initialState.preferredName);

  const isUsernameValid = usernameStatus?.available !== false && username.trim().length >= 3;
  const isEmailValid = !email.trim() || emailStatus?.available !== false;
  const canSave = hasChanges && isUsernameValid && isEmailValid && !checkingUsername && !checkingEmail && !saving;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;

    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload = {
        username: username.trim(),
        email: email.trim() || undefined,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        preferredName: preferredName.trim() || undefined,
      };

      const res = await updateProfile(payload);
      if (res.ok) {
        setSuccessMessage('Your profile has been updated successfully.');
        onSuccessNotice?.('Profile updated successfully.');

        // Refresh profile data snapshot
        const updatedUser = res.user || username.trim();
        const updatedEmail = res.email || email.trim();
        const updatedFirst = res.firstName || firstName.trim();
        const updatedLast = res.lastName || lastName.trim();
        const updatedPref = res.preferredName || preferredName.trim();

        setInitialState({
          username: updatedUser,
          email: updatedEmail,
          firstName: updatedFirst,
          lastName: updatedLast,
          preferredName: updatedPref,
        });

        // Re-fetch latest me data
        getMe().then(setProfileData).catch(() => {});
      } else {
        setErrorMessage(res.error || 'Failed to update profile.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An error occurred while updating your profile.');
    } finally {
      setSaving(false);
    }
  };

  const tier = profileData?.tier || 'classic';
  const isUltimate = tier === 'ultimate';
  const isPremium = tier === 'premium';
  const tierLabel = isUltimate ? '⚡ Ultimate Sovereign' : isPremium ? '👑 Guild Master (VIP)' : '📜 Classic Scribe';

  const usedMB = ((profileData?.storageUsed || 0) / (1024 * 1024)).toFixed(1);
  const maxStorageStr = isUltimate
    ? '10 TB (Infinite)'
    : profileData?.maxTotalStorageBytes
    ? (profileData.maxTotalStorageBytes / (1024 * 1024 * 1024)).toFixed(0) + ' GB'
    : '1 GB';

  const storagePct = isUltimate
    ? 8
    : Math.min(100, Math.max(4, ((profileData?.storageUsed || 0) / (profileData?.maxTotalStorageBytes || 1073741824)) * 100));

  const authMethodLabel = profileData?.hasGoogleAuth || profileData?.authProvider === 'google'
    ? 'Google OAuth Account'
    : 'Local Master Password';

  const createdDateStr = profileData?.createdAt
    ? new Date(profileData.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="profile-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="profileModalTitle">
      <div className="profile-modal-card" ref={cardRef}>
        {/* Header */}
        <div className="profile-modal-header">
          <div className="profile-header-title-group">
            <span className="profile-header-icon" aria-hidden="true">👤</span>
            <div>
              <h2 id="profileModalTitle" className="profile-header-title">User Profile & Account</h2>
              <span className="profile-header-subtitle">Manage your personal credentials & encrypted vault identity</span>
            </div>
          </div>
          <button
            type="button"
            className="profile-modal-close-btn"
            onClick={onClose}
            title="Close modal (Esc)"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="profile-modal-body">
          {loading ? (
            <div className="profile-loading-state">
              <div className="profile-spinner" />
              <span>Loading your profile archives...</span>
            </div>
          ) : (
            <div className="profile-grid-layout">
              {/* Left Column: Identity Overview Card */}
              <div className="profile-identity-column">
                <div className="profile-avatar-card">
                  <div className={`profile-avatar-circle ${isUltimate ? 'avatar-ultimate' : isPremium ? 'avatar-vip' : ''}`}>
                    <span className="profile-avatar-symbol">
                      {preferredName ? preferredName[0].toUpperCase() : username ? username[0].toUpperCase() : '👤'}
                    </span>
                  </div>

                  <h3 className="profile-card-name">
                    {preferredName || (firstName ? `${firstName} ${lastName}`.trim() : currentUser)}
                  </h3>
                  <span className="profile-card-username">@{currentUser}</span>

                  {/* Tier Badge */}
                  <div className="profile-card-tier-wrap">
                    <span
                      className={`tier-pill-badge ${
                        isUltimate ? 'tier-pill-ultimate' : isPremium ? 'tier-pill-vip' : 'tier-pill-free'
                      }`}
                    >
                      {tierLabel}
                    </span>
                  </div>

                  {/* Account Metadata List */}
                  <div className="profile-meta-list">
                    <div className="profile-meta-row">
                      <span className="meta-label">Account Role:</span>
                      <span className="meta-val">{profileData?.role === 'admin' ? 'Master Admin' : 'Member'}</span>
                    </div>
                    <div className="profile-meta-row">
                      <span className="meta-label">Auth Provider:</span>
                      <span className="meta-val">{authMethodLabel}</span>
                    </div>
                    {createdDateStr && (
                      <div className="profile-meta-row">
                        <span className="meta-label">Member Since:</span>
                        <span className="meta-val">{createdDateStr}</span>
                      </div>
                    )}
                  </div>

                  {/* Storage Quota Bar */}
                  <div className="profile-storage-box">
                    <div className="profile-storage-labels">
                      <span className="storage-txt">Vault Storage</span>
                      <span className="storage-num">
                        {usedMB} MB / {maxStorageStr}
                      </span>
                    </div>
                    <div className="profile-storage-track">
                      <div
                        className="profile-storage-bar"
                        style={{
                          width: `${storagePct}%`,
                          background: isUltimate
                            ? 'linear-gradient(90deg, #eab308, #a855f7)'
                            : isPremium
                            ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                            : 'linear-gradient(90deg, #10b981, #059669)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Edit Profile Form */}
              <div className="profile-form-column">
                <form onSubmit={handleSave} className="profile-edit-form">
                  {errorMessage && (
                    <div className="profile-alert profile-alert-error" role="alert">
                      <span className="alert-icon">⚠️</span>
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {successMessage && (
                    <div className="profile-alert profile-alert-success" role="alert">
                      <span className="alert-icon">✨</span>
                      <span>{successMessage}</span>
                    </div>
                  )}

                  {/* Section: Core Credentials */}
                  <div className="profile-form-section">
                    <h4 className="profile-section-title">Core Account Credentials</h4>

                    {/* Username Input with Live Availability */}
                    <div className="profile-field-group">
                      <div className="profile-field-header">
                        <label htmlFor="profileUsernameInput">Username / Vault ID</label>
                        {usernameStatus && (
                          <span
                            className={`profile-status-badge ${
                              usernameStatus.isCurrent
                                ? 'status-current'
                                : usernameStatus.available
                                ? 'status-available'
                                : 'status-taken'
                            }`}
                          >
                            {checkingUsername ? 'Checking...' : usernameStatus.message}
                          </span>
                        )}
                      </div>
                      <div className="profile-input-wrapper">
                        <span className="profile-input-icon">@</span>
                        <input
                          type="text"
                          id="profileUsernameInput"
                          className="profile-input"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="e.g. vinod_writer"
                          maxLength={30}
                          required
                          disabled={saving}
                        />
                      </div>
                      <small className="profile-field-hint">
                        Changing your username preserves your private encryption key and renames your local vault archive.
                      </small>
                    </div>

                    {/* Email Input with Live Check */}
                    <div className="profile-field-group">
                      <div className="profile-field-header">
                        <label htmlFor="profileEmailInput">Email Address</label>
                        {emailStatus && (
                          <span
                            className={`profile-status-badge ${
                              emailStatus.isCurrent
                                ? 'status-current'
                                : emailStatus.available
                                ? 'status-available'
                                : 'status-taken'
                            }`}
                          >
                            {checkingEmail ? 'Checking...' : emailStatus.message}
                          </span>
                        )}
                      </div>
                      <div className="profile-input-wrapper">
                        <span className="profile-input-icon">✉</span>
                        <input
                          type="email"
                          id="profileEmailInput"
                          className="profile-input"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. author@example.com"
                          disabled={saving}
                        />
                      </div>
                      <small className="profile-field-hint">
                        Used for account recovery, OTP sign-in, and official Google authentication linkage.
                      </small>
                    </div>
                  </div>

                  {/* Section: Personal Details */}
                  <div className="profile-form-section">
                    <h4 className="profile-section-title">Personalization & Pen Name</h4>

                    <div className="profile-two-col">
                      <div className="profile-field-group">
                        <label htmlFor="profileFirstNameInput">First Name</label>
                        <input
                          type="text"
                          id="profileFirstNameInput"
                          className="profile-input"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="e.g. Vinod"
                          maxLength={50}
                          disabled={saving}
                        />
                      </div>

                      <div className="profile-field-group">
                        <label htmlFor="profileLastNameInput">Last Name</label>
                        <input
                          type="text"
                          id="profileLastNameInput"
                          className="profile-input"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="e.g. Kumar"
                          maxLength={50}
                          disabled={saving}
                        />
                      </div>
                    </div>

                    <div className="profile-field-group">
                      <label htmlFor="profilePreferredNameInput">Preferred Display Name (Pen Name)</label>
                      <input
                        type="text"
                        id="profilePreferredNameInput"
                        className="profile-input"
                        value={preferredName}
                        onChange={(e) => setPreferredName(e.target.value)}
                        placeholder="e.g. The Royal Scribe"
                        maxLength={60}
                        disabled={saving}
                      />
                      <small className="profile-field-hint">
                        If set, this name will be displayed in the header banner and welcome greetings.
                      </small>
                    </div>
                  </div>

                  {/* Footer Action Buttons */}
                  <div className="profile-form-actions">
                    <button
                      type="button"
                      className="profile-btn-cancel"
                      onClick={onClose}
                      disabled={saving}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="profile-btn-save"
                      disabled={!canSave}
                    >
                      {saving ? 'Saving Profile...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
