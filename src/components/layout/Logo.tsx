'use client';

import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'white';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', variant = 'default' }) => {
  const height = size === 'sm' ? 36 : size === 'lg' ? 54 : 44;
  const isWhite = variant === 'white';

  return (
    <Link
      href="/"
      dir="ltr"
      style={{ direction: 'ltr' }}
      className={`inline-flex items-center group select-none ${className}`}
    >
      {/* High-Resolution SVG Vector of Official HUB CLOUD IT Solutions Logo (Strictly LTR Isolated) */}
      <svg
        height={height}
        viewBox="0 0 200 96"
        fill="none"
        style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-200 group-hover:scale-105"
      >
        {/* H Letter */}
        <path
          d="M10 10 H28 V38 H52 V10 H70 V62 H52 V46 H28 V62 H10 V10 Z"
          fill={isWhite ? '#FFFFFF' : '#475569'}
        />

        {/* U Styled as Blue USB Male Connector */}
        {/* USB Plug Head */}
        <rect x="91" y="10" width="22" height="14" rx="2" fill={isWhite ? '#FFFFFF' : '#007BFF'} />
        <rect x="95" y="13" width="4" height="4" rx="1" fill={isWhite ? '#003882' : '#FFFFFF'} />
        <rect x="105" y="13" width="4" height="4" rx="1" fill={isWhite ? '#003882' : '#FFFFFF'} />
        {/* USB Plug Body */}
        <path
          d="M86 24 H118 V46 C118 56 110 63 102 63 C94 63 86 56 86 46 V24 Z"
          fill={isWhite ? '#FFFFFF' : '#007BFF'}
        />
        {/* USB Cable Neck */}
        <rect x="98" y="63" width="8" height="10" fill={isWhite ? '#FFFFFF' : '#007BFF'} />

        {/* B Letter */}
        <path
          d="M134 10 H164 C175 10 182 16 182 24 C182 30 178 35 171 37 C180 39 185 45 185 53 C185 62 176 68 163 68 H134 V10 Z M152 23 V33 H162 C166 33 169 31 169 28 C169 25 166 23 162 23 H152 Z M152 44 V55 H163 C168 55 171 53 171 49.5 C171 46 168 44 163 44 H152 Z"
          fill={isWhite ? '#FFFFFF' : '#475569'}
        />

        {/* CLOUD Word - Pinned Left-to-Right */}
        <text
          x="10"
          y="78"
          fill={isWhite ? '#FFFFFF' : '#007BFF'}
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="900"
          fontSize="23"
          letterSpacing="2"
          textAnchor="start"
          direction="ltr"
          style={{ direction: 'ltr', unicodeBidi: 'bidi-override' }}
        >
          CLOUD
        </text>

        {/* IT Solutions Word - Pinned Left-to-Right */}
        <text
          x="10"
          y="93"
          fill={isWhite ? '#FFFFFF' : '#007BFF'}
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="700"
          fontSize="12"
          letterSpacing="1"
          textAnchor="start"
          direction="ltr"
          style={{ direction: 'ltr', unicodeBidi: 'bidi-override' }}
        >
          IT Solutions
        </text>
      </svg>
    </Link>
  );
};
