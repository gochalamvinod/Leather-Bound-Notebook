import React from 'react';

export interface LeatherboundLogoProps {
  size?: number;
  className?: string;
}

export const LeatherboundLogo: React.FC<LeatherboundLogoProps> = ({
  size = 72,
  className = '',
}) => {
  return (
    <div
      className={`leatherbound-logo-emblem ${className}`}
      style={{ width: size, height: size }}
      aria-label="Leatherbound Notebook Crest"
    >
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="leatherGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8d4b24" />
            <stop offset="60%" stopColor="#532912" />
            <stop offset="100%" stopColor="#2e1406" />
          </linearGradient>
          <linearGradient id="goldSheenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff2be" />
            <stop offset="50%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#967425" />
          </linearGradient>
          <filter id="leatherShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Outer Halo Glow */}
        <circle cx="50" cy="50" r="46" fill="rgba(212, 175, 55, 0.08)" stroke="rgba(212, 175, 55, 0.35)" strokeWidth="1" />

        {/* Stacked Pages Underneath */}
        <path
          d="M38 72H78C81 72 83 74 83 77C83 80 81 82 78 82H40C37 82 35 80 35 77C35 74 37 72 38 72Z"
          fill="#f4edde"
          stroke="#3d2a1d"
          strokeWidth="1.5"
        />
        <path d="M40 76H76" stroke="rgba(61, 42, 29, 0.25)" strokeWidth="1" />
        <path d="M40 79H76" stroke="rgba(61, 42, 29, 0.25)" strokeWidth="1" />

        {/* Bookmark Ribbon */}
        <path
          d="M44 72V88L48 84L52 88V72H44Z"
          fill="#8b2500"
          filter="url(#leatherShadow)"
        />

        {/* Leather Journal Body */}
        <rect
          x="46"
          y="18"
          width="36"
          height="54"
          rx="7"
          fill="url(#leatherGrad)"
          stroke="#d4af37"
          strokeWidth="1"
          filter="url(#leatherShadow)"
        />

        {/* Perimeter Stitches */}
        <rect
          x="48"
          y="20"
          width="32"
          height="50"
          rx="5"
          fill="none"
          stroke="rgba(240, 223, 168, 0.4)"
          strokeWidth="0.8"
          strokeDasharray="2 2"
        />

        {/* Brass Clasp Strap */}
        <path
          d="M72 38H85C87.5 38 89 40 89 42.5C89 45 87.5 47 85 47H72V38Z"
          fill="url(#leatherGrad)"
          stroke="#d4af37"
          strokeWidth="1"
        />
        {/* Clasp Stud */}
        <circle cx="82" cy="42.5" r="2.5" fill="url(#goldSheenGrad)" stroke="#532912" strokeWidth="0.5" />

        {/* Intertwined Serif Letter 'L' */}
        <path
          d="M26 18H44V23H37V66C37 68 39 70 43 70H68C72 70 75 67 76 63L78 65C76 71 70 74 63 74H32C27 74 24 70 24 64V23H18V18H26Z"
          fill="#2b1408"
          stroke="url(#goldSheenGrad)"
          strokeWidth="1.2"
          filter="url(#leatherShadow)"
        />
      </svg>
    </div>
  );
};

export default LeatherboundLogo;
