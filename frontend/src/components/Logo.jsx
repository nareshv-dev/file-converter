import React from 'react';

/**
 * Convertify Logo Component
 * A unique SVG logo with gradient indigo-to-emerald arrows symbolizing file transformation.
 */
export default function ConvertifyLogo({ size = 40, showText = false }) {
  const id = `cfy-grad-${size}`;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          <filter id={`glow-${size}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background rounded square */}
        <rect width="100" height="100" rx="22" fill={`url(#${id})`} />

        {/* Document shape (left) */}
        <rect x="14" y="18" width="28" height="36" rx="4" fill="white" fillOpacity="0.25" />
        <rect x="18" y="22" width="16" height="2.5" rx="1" fill="white" fillOpacity="0.8" />
        <rect x="18" y="27" width="20" height="2.5" rx="1" fill="white" fillOpacity="0.8" />
        <rect x="18" y="32" width="14" height="2.5" rx="1" fill="white" fillOpacity="0.8" />

        {/* Document shape (right) */}
        <rect x="58" y="46" width="28" height="36" rx="4" fill="white" fillOpacity="0.25" />
        <rect x="62" y="50" width="16" height="2.5" rx="1" fill="white" fillOpacity="0.8" />
        <rect x="62" y="55" width="20" height="2.5" rx="1" fill="white" fillOpacity="0.8" />
        <rect x="62" y="60" width="14" height="2.5" rx="1" fill="white" fillOpacity="0.8" />

        {/* Arrow pointing right (top) */}
        <path
          d="M46 34 L58 34 M54 29 L59 34 L54 39"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#glow-${size})`}
        />

        {/* Arrow pointing left (bottom) */}
        <path
          d="M54 66 L42 66 M46 61 L41 66 L46 71"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#glow-${size})`}
        />
      </svg>

      {showText && (
        <span style={{
          fontWeight: 800,
          fontSize: size * 0.55,
          background: 'linear-gradient(135deg, #4F46E5, #10B981)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.5px',
          lineHeight: 1,
        }}>
          Convertify
        </span>
      )}
    </div>
  );
}
