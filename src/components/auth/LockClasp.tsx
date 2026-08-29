import React from 'react';

export interface LockClaspProps {
  open?: boolean;
  className?: string;
  onClick?: () => void;
  size?: number;
}

export const LockClasp: React.FC<LockClaspProps> = ({
  open = false,
  className = '',
  onClick,
  size = 64,
}) => {
  return (
    <div
      className={`clasp ${open ? 'open' : ''} ${className}`}
      id="clasp"
      aria-label={open ? 'Notebook unlocked' : 'Notebook locked'}
      role={onClick ? 'button' : 'img'}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <svg
        viewBox="0 0 80 80"
        width={size}
        height={size}
        className="clasp-svg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main Antique Brass Plate Metallic Gradient */}
          <linearGradient id="claspBrassPlate" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff3cd" />
            <stop offset="18%" stopColor="#e5c378" />
            <stop offset="42%" stopColor="#b88d44" />
            <stop offset="70%" stopColor="#876023" />
            <stop offset="92%" stopColor="#553a11" />
            <stop offset="100%" stopColor="#3c2709" />
          </linearGradient>

          {/* Beveled Rim Highlight Gradient */}
          <linearGradient id="claspRimHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="35%" stopColor="#eccf89" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#684a17" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#1f1404" stopOpacity="0.9" />
          </linearGradient>

          {/* 3D Tubular Metallic Shackle Gradient */}
          <linearGradient id="claspShackleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5a3d13" />
            <stop offset="15%" stopColor="#ab833a" />
            <stop offset="35%" stopColor="#fff6d8" />
            <stop offset="60%" stopColor="#d2a852" />
            <stop offset="85%" stopColor="#7a551e" />
            <stop offset="100%" stopColor="#3d270a" />
          </linearGradient>

          {/* 3D Rivet Radial Gradient */}
          <radialGradient id="claspRivetGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fff9e6" />
            <stop offset="45%" stopColor="#dfb969" />
            <stop offset="80%" stopColor="#79561c" />
            <stop offset="100%" stopColor="#2c1d07" />
          </radialGradient>

          {/* Escutcheon Keyhole Rim Radial Gradient */}
          <radialGradient id="claspKeyholeRim" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#fff1c4" />
            <stop offset="50%" stopColor="#b4893e" />
            <stop offset="85%" stopColor="#674614" />
            <stop offset="100%" stopColor="#2e1d05" />
          </radialGradient>

          {/* Keyhole Interior Recessed Shadow Gradient */}
          <linearGradient id="claspKeyholeDepth" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0a0502" />
            <stop offset="50%" stopColor="#160d06" />
            <stop offset="100%" stopColor="#25160b" />
          </linearGradient>

          {/* Drop Shadows */}
          <filter id="claspPlateShadow" x="-20%" y="-20%" width="150%" height="150%">
            <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#000000" floodOpacity="0.75" />
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.5" />
          </filter>

          <filter id="claspShackleShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.65" />
          </filter>

          <filter id="unlockedGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Back Glow when unlocked */}
        {open && (
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="url(#claspKeyholeRim)"
            opacity="0.25"
            filter="url(#unlockedGlow)"
            className="clasp-unlock-aura"
          />
        )}

        {/* 3D Metallic U-Shackle */}
        <g
          id="claspShackleGroup"
          className="clasp-shackle-group"
          style={{
            transformOrigin: '54px 34px',
            transform: open ? 'rotate(-44deg) translate(-4px, -6px)' : 'none',
            transition: 'transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          filter="url(#claspShackleShadow)"
        >
          {/* Shackle body - outer tube */}
          <path
            id="claspShackle"
            className="clasp-shackle"
            d="M26 36 V21 C26 13.268 32.268 7 40 7 C47.732 7 54 13.268 54 21 V36"
            stroke="url(#claspShackleGrad)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Shackle specular inner highlight stripe */}
          <path
            d="M27.5 35 V21 C27.5 14.096 33.096 8.5 40 8.5 C46.904 8.5 52.5 14.096 52.5 21 V35"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeOpacity="0.65"
          />
          {/* Shackle deep inner shadow stripe */}
          <path
            d="M24.5 35 V21 C24.5 12.44 31.44 5.5 40 5.5 C48.56 5.5 55.5 12.44 55.5 21 V35"
            stroke="#1d1104"
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeOpacity="0.5"
          />
        </g>

        {/* Antique Brass Main Baseplate */}
        <g filter="url(#claspPlateShadow)">
          {/* Outer beveled base */}
          <rect
            x="12"
            y="32"
            width="56"
            height="42"
            rx="7"
            fill="url(#claspRimHighlight)"
          />
          {/* Main plate body */}
          <rect
            x="13.5"
            y="33.5"
            width="53"
            height="39"
            rx="5.5"
            fill="url(#claspBrassPlate)"
          />

          {/* Stamped inner border relief */}
          <rect
            x="17"
            y="37"
            width="46"
            height="32"
            rx="3.5"
            fill="none"
            stroke="#452f0c"
            strokeWidth="1"
            strokeOpacity="0.75"
          />
          <rect
            x="17.5"
            y="37.5"
            width="45"
            height="31"
            rx="3"
            fill="none"
            stroke="#fff1c4"
            strokeWidth="0.75"
            strokeOpacity="0.55"
          />

          {/* Shackle Entry Sockets (Left & Right) */}
          <ellipse cx="26" cy="33.5" rx="5" ry="2.5" fill="#1b1105" />
          <ellipse cx="26" cy="33" rx="4" ry="1.8" fill="#38240b" stroke="#fff0b8" strokeWidth="0.6" strokeOpacity="0.4" />
          <ellipse cx="54" cy="33.5" rx="5" ry="2.5" fill="#1b1105" />
          <ellipse cx="54" cy="33" rx="4" ry="1.8" fill="#38240b" stroke="#fff0b8" strokeWidth="0.6" strokeOpacity="0.4" />

          {/* 4 Corner Brass Rivets */}
          {/* Top-Left Rivet */}
          <g transform="translate(18, 38)">
            <circle cx="0" cy="0" r="2.8" fill="#120b03" opacity="0.6" />
            <circle cx="0" cy="-0.3" r="2.4" fill="url(#claspRivetGrad)" />
            <circle cx="-0.6" cy="-0.9" r="0.8" fill="#ffffff" opacity="0.8" />
          </g>
          {/* Top-Right Rivet */}
          <g transform="translate(62, 38)">
            <circle cx="0" cy="0" r="2.8" fill="#120b03" opacity="0.6" />
            <circle cx="0" cy="-0.3" r="2.4" fill="url(#claspRivetGrad)" />
            <circle cx="-0.6" cy="-0.9" r="0.8" fill="#ffffff" opacity="0.8" />
          </g>
          {/* Bottom-Left Rivet */}
          <g transform="translate(18, 68)">
            <circle cx="0" cy="0" r="2.8" fill="#120b03" opacity="0.6" />
            <circle cx="0" cy="-0.3" r="2.4" fill="url(#claspRivetGrad)" />
            <circle cx="-0.6" cy="-0.9" r="0.8" fill="#ffffff" opacity="0.8" />
          </g>
          {/* Bottom-Right Rivet */}
          <g transform="translate(62, 68)">
            <circle cx="0" cy="0" r="2.8" fill="#120b03" opacity="0.6" />
            <circle cx="0" cy="-0.3" r="2.4" fill="url(#claspRivetGrad)" />
            <circle cx="-0.6" cy="-0.9" r="0.8" fill="#ffffff" opacity="0.8" />
          </g>

          {/* Decorative Center Escutcheon Ring */}
          <circle cx="40" cy="52.5" r="10.5" fill="#190f05" opacity="0.5" />
          <circle cx="40" cy="52" r="10" fill="url(#claspKeyholeRim)" />
          <circle cx="40" cy="52" r="8.2" fill="#301f09" stroke="#fff4cc" strokeWidth="0.8" strokeOpacity="0.5" />

          {/* Recessed Keyhole Relief */}
          <path
            d="M40 46 C37.8 46 36 47.8 36 50 C36 51.5 36.8 52.8 38 53.4 V57.5 C38 58.6 38.9 59.5 40 59.5 C41.1 59.5 42 58.6 42 57.5 V53.4 C43.2 52.8 44 51.5 44 50 C44 47.8 42.2 46 40 46 Z"
            fill="url(#claspKeyholeDepth)"
            stroke="#0a0502"
            strokeWidth="0.6"
          />
          {/* Keyhole inner specular edge */}
          <path
            d="M38.2 54.2 L38.2 57.5 C38.2 58.4 39 59.2 40 59.2"
            stroke="#fff2c2"
            strokeWidth="0.6"
            strokeOpacity="0.45"
            fill="none"
          />
        </g>
      </svg>
    </div>
  );
};

export default LockClasp;
