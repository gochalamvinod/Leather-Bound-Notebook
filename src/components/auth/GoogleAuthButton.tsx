import React, { useState, useEffect, useRef } from 'react';

export interface GoogleAuthButtonProps {
  onSuccess: (credential: string) => Promise<void>;
  onError?: (error: string) => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
  className?: string;
  theme?: 'parchment' | 'dark-leather' | 'emerald';
  initialEmail?: string;
  initialName?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: (momentListener?: (notification: any) => void) => void;
        };
      };
    };
  }
}

// Default Google OAuth Client ID
const DEFAULT_CLIENT_ID =
  (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
  '845928731571-66hm84u21smlmq6bv8mtrbhppqsmabcv.apps.googleusercontent.com';

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  onSuccess,
  onError,
  loading = false,
  disabled = false,
  label = 'Sign in with Google',
  className = '',
  theme = 'parchment',
}) => {
  const [internalLoading, setInternalLoading] = useState<boolean>(false);
  const gisBtnRef = useRef<HTMLDivElement | null>(null);
  const isLoading = loading || internalLoading;

  useEffect(() => {
    const activeClientId =
      (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
      (typeof window !== 'undefined' && (window as any).__GOOGLE_CLIENT_ID) ||
      DEFAULT_CLIENT_ID;

    // Check if Google Identity Services is available
    const initGis = () => {
      if (window.google?.accounts?.id && activeClientId) {
        try {
          window.google.accounts.id.initialize({
            client_id: activeClientId,
            callback: async (response: { credential: string }) => {
              if (response?.credential) {
                setInternalLoading(true);
                try {
                  await onSuccess(response.credential);
                } catch (err: any) {
                  onError?.(err?.message || 'Google sign-in failed.');
                } finally {
                  setInternalLoading(false);
                }
              }
            },
            auto_select: true,
            cancel_on_tap_outside: false,
            context: 'signin',
          });

          // Render Google's official button inside the container
          if (gisBtnRef.current) {
            gisBtnRef.current.innerHTML = '';
            window.google.accounts.id.renderButton(gisBtnRef.current, {
              theme: 'outline',
              size: 'large',
              type: 'standard',
              shape: 'rectangular',
              text: 'signin_with',
              logo_alignment: 'left',
              width: 320,
            });
          }

          // Trigger Google One Tap prompt in top right
          window.google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed()) {
              console.log('Google One Tap not displayed reason:', notification.getNotDisplayedReason());
            }
          });
        } catch (err) {
          console.warn('Google Identity Services initialization error:', err);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGis();
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(timer);
          initGis();
        }
      }, 300);
      return () => clearInterval(timer);
    }
  }, [onSuccess, onError]);

  const handleClick = () => {
    if (disabled || isLoading) return;

    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isSkippedMoment() || notification.isDismissedMoment()) {
            console.log('User dismissed Google prompt');
          }
        });
      } catch (e) {
        console.warn('GIS prompt error:', e);
      }
    }
  };

  return (
    <div className={`google-auth-wrapper ${className}`}>
      {/* Official Google Identity Services Rendered Button */}
      <div ref={gisBtnRef} className="google-gis-btn-container" onClick={handleClick} />

      {/* Fallback button if GIS script is still loading */}
      {(!window.google?.accounts?.id || isLoading) && (
        <button
          type="button"
          className={`google-official-btn theme-${theme}`}
          onClick={handleClick}
          disabled={disabled || isLoading}
          aria-busy={isLoading}
        >
          <div className="google-icon-wrapper">
            <svg className="google-icon-svg" viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          </div>
          <span className="google-official-btn-text">
            {isLoading ? 'Signing in with Google...' : label}
          </span>
        </button>
      )}
    </div>
  );
};

export default GoogleAuthButton;
