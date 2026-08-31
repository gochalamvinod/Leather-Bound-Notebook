import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CoverTheme, LockTab } from '../../types/notebook';
import LoginTab from './LoginTab';
import RegisterTab from './RegisterTab';
import PasswordResetModal from './PasswordResetModal';
import LeatherboundLogo from '../ui/LeatherboundLogo';

export interface LockScreenProps {
  onUnlockSuccess?: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlockSuccess }) => {
  const {
    setupNeeded,
    lockedOut,
    remainingSeconds,
    error,
    selectedBook,
    setSelectedBook,
    unlock,
    setup,
    loading,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<LockTab>(setupNeeded ? 'create' : 'login');
  const [prefilledUsername, setPrefilledUsername] = useState<string>('');
  const [prefilledPassword, setPrefilledPassword] = useState<string>('');
  const [prefilledEmail, setPrefilledEmail] = useState<string>('');
  const [autoRedirectNotice, setAutoRedirectNotice] = useState<string | null>(null);
  const [shaking, setShaking] = useState<boolean>(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [resetPrefillEmail, setResetPrefillEmail] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleSwitchToCreate = (userToPrefill?: string, passToPrefill?: string, isAuto?: boolean, emailToPrefill?: string) => {
    if (userToPrefill !== undefined) setPrefilledUsername(userToPrefill);
    if (passToPrefill !== undefined) setPrefilledPassword(passToPrefill);
    if (emailToPrefill !== undefined) setPrefilledEmail(emailToPrefill);
    if (isAuto && userToPrefill) {
      setAutoRedirectNotice(`No account found for "${userToPrefill}". Switched to account creation.`);
    } else {
      setAutoRedirectNotice(null);
    }
    setActiveTab('create');
  };

  const handleSwitchToLogin = (userToPrefill?: string) => {
    if (userToPrefill !== undefined) setPrefilledUsername(userToPrefill);
    setAutoRedirectNotice(null);
    setActiveTab('login');
  };

  const handleOpenPasswordReset = (emailPrefill?: string) => {
    if (emailPrefill) {
      setResetPrefillEmail(emailPrefill);
    }
    setIsResetModalOpen(true);
  };

  useEffect(() => {
    if (setupNeeded) {
      setActiveTab('create');
    } else {
      setActiveTab('login');
    }
  }, [setupNeeded]);

  // Ambient Golden Embers & Floating Light Motes Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      fadeSpeed: number;
    }> = [];

    const numParticles = Math.min(45, Math.floor(width / 30));
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.2 + 0.8,
        speedY: -(Math.random() * 0.45 + 0.15),
        speedX: (Math.random() - 0.5) * 0.25,
        opacity: Math.random() * 0.7 + 0.2,
        fadeSpeed: (Math.random() * 0.008 + 0.003) * (Math.random() > 0.5 ? 1 : -1),
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.opacity += p.fadeSpeed;

        if (p.opacity > 0.85 || p.opacity < 0.15) {
          p.fadeSpeed = -p.fadeSpeed;
        }

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${Math.max(0, p.opacity)})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(240, 223, 168, 0.6)';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  const triggerShake = () => {
    setShaking(false);
    setTimeout(() => setShaking(true), 10);
    setTimeout(() => setShaking(false), 600);
  };

  const handleClearSelectedBook = () => {
    setSelectedBook(null);
  };

  const handleUnlock = async (password: string, username?: string, bookId?: string) => {
    try {
      const ok = await unlock(password, username, bookId);
      if (ok) {
        onUnlockSuccess?.();
      }
    } catch {
      triggerShake();
    }
  };

  const handleRegister = async (
    password: string,
    username: string,
    notebookTitle: string,
    coverColor: CoverTheme
  ) => {
    try {
      const ok = await setup(password, username, notebookTitle, coverColor);
      if (ok) {
        onUnlockSuccess?.();
      }
    } catch {
      triggerShake();
    }
  };

  const isLogin = activeTab === 'login';

  return (
    <section id="lockScreen" className="split-auth-viewport">
      {/* 1. Live Background Particle Canvas */}
      <canvas ref={canvasRef} className="royal-particles-canvas" />

      {/* 2. Ambient Radiant Aura */}
      <div className="royal-ambient-aura" />

      {/* 3. Main Dual-Panel Royal Card */}
      <div className={`split-auth-card ${shaking ? 'shake' : ''} ${!isLogin ? 'mode-register' : 'mode-login'}`}>
        {/* Brand Side Panel (Curved Organic Shape) */}
        <div className="brand-panel royal-brand-panel">
          <div className="brand-panel-inner">
            {/* Authentic Brand Monogram Crest with Float Animation */}
            <div className="brand-crest-wrapper">
              <LeatherboundLogo size={80} />
            </div>

            <div className="brand-typography-block">
              <h2 className="brand-main-name">LEATHERBOUND</h2>
              <div className="brand-name-divider">
                <span className="divider-line" />
                <span className="divider-tag">NOTEBOOK</span>
                <span className="divider-line" />
              </div>
            </div>

            <h1 className="brand-welcome-title">
              {isLogin ? 'Welcome Back!' : 'Join the Archives'}
            </h1>

            <p className="brand-welcome-desc">
              {isLogin
                ? 'To stay connected with your encrypted library, please sign in with your master credentials.'
                : 'Create your master cipher and begin authoring within your private 3D leatherbound vault.'}
            </p>

            <button
              type="button"
              className="pill-btn-outline royal-sheen-outline"
              onClick={() => isLogin ? handleSwitchToCreate() : handleSwitchToLogin()}
            >
              {isLogin ? 'CREATE ACCOUNT' : 'SIGN IN'}
            </button>

            <div className="brand-footer-note">
              <span>ZERO-KNOWLEDGE · AES-256 ENCRYPTED</span>
            </div>
          </div>

          {/* Decorative Curved Wave Overlay */}
          <div className="brand-curve-mask" />
        </div>

        {/* Form Side Panel */}
        <div className="form-panel royal-form-panel">
          {/* Mobile-Only Header with Logo, Title, and Tab Switch */}
          <div className="auth-mobile-header">
            <div className="auth-mobile-logo-wrapper">
              <LeatherboundLogo size={48} />
            </div>
            <h2 className="auth-mobile-brand-title">LEATHERBOUND NOTEBOOK</h2>
            <div className="auth-mobile-tabs">
              <button
                type="button"
                className={`auth-mobile-tab-btn ${isLogin ? 'active' : ''}`}
                onClick={() => handleSwitchToLogin()}
              >
                🔐 Sign In
              </button>
              <button
                type="button"
                className={`auth-mobile-tab-btn ${!isLogin ? 'active' : ''}`}
                onClick={() => handleSwitchToCreate()}
              >
                ✨ Create Account
              </button>
            </div>
          </div>

          {isLogin ? (
            <LoginTab
              selectedBook={selectedBook}
              onClearSelectedBook={handleClearSelectedBook}
              onUnlock={handleUnlock}
              onSwitchToCreate={handleSwitchToCreate}
              onOpenPasswordReset={handleOpenPasswordReset}
              lockedOut={lockedOut}
              remainingSeconds={remainingSeconds}
              error={error}
              loading={loading}
              initialUsername={prefilledUsername}
            />
          ) : (
            <RegisterTab
              onRegister={handleRegister}
              onSwitchToLogin={handleSwitchToLogin}
              error={error}
              loading={loading}
              initialUsername={prefilledUsername}
              initialPassword={prefilledPassword}
              initialEmail={prefilledEmail}
              autoNotice={autoRedirectNotice}
            />
          )}
        </div>
      </div>

      {/* Password Reset OTP Modal */}
      <PasswordResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        initialEmail={resetPrefillEmail || prefilledEmail}
        onSuccess={() => {
          setIsResetModalOpen(false);
          setActiveTab('login');
        }}
      />
    </section>
  );
};

export default LockScreen;
