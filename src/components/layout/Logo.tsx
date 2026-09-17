'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'white';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', variant = 'default' }) => {
  const isWhite = variant === 'white';
  const logoSrc = isWhite ? '/images/logo-white.png' : '/images/logo.png';

  // Logo aspect ratio is 648x463 ≈ 1.4
  const dimensions = {
    sm: { height: 34, width: 48 },
    md: { height: 42, width: 59 },
    lg: { height: 56, width: 78 },
  }[size];

  return (
    <Link
      href="/"
      dir="ltr"
      style={{ direction: 'ltr' }}
      className={`inline-flex items-center group select-none ${className}`}
      aria-label="HUB CLOUD IT Solutions Home"
    >
      <Image
        src={logoSrc}
        alt="HUB CLOUD IT Solutions"
        width={dimensions.width}
        height={dimensions.height}
        priority
        className="w-auto object-contain transition-transform duration-200 group-hover:scale-105"
        style={{ height: `${dimensions.height}px` }}
      />
    </Link>
  );
};
