'use client';

import React from 'react';
import Image from 'next/image';

interface PaymentBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'white' | 'transparent' | 'footer';
}

// 1. Official VISA Vector SVG
export const VisaBadge: React.FC<PaymentBadgeProps> = ({ className = '', size = 'md' }) => {
  const heightClass = size === 'sm' ? 'h-6' : size === 'lg' ? 'h-9' : 'h-7';
  return (
    <div className={`inline-flex items-center justify-center bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-2xs select-none ${heightClass} ${className}`}>
      <svg className="h-3.5 sm:h-4 w-auto" viewBox="0 0 100 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M39.6 2.2L26 30.5H17.4L10.7 7.7C10.3 6.1 9.9 5.5 8.7 4.8C6.7 3.8 3.3 2.8 0 2.2L0.3 0.8H14.8C16.8 0.8 18.5 2.1 19 4.3L22.6 21.2L31.2 0.8H39.6V2.2ZM74.5 21C74.6 13.2 63.3 12.8 63.4 9.3C63.4 8.2 64.5 7.1 66.8 6.8C68 6.6 71.3 6.5 75 8L76.5 1.5C74.5 0.7 71.8 0 68.3 0C59.9 0 54.1 4.5 54 11C53.9 15.9 58.4 18.6 61.8 20.2C65.2 21.8 66.3 22.9 66.3 24.3C66.2 26.6 63.6 27.5 61.1 27.5C56.9 27.5 54.4 26.9 52.4 26L50.8 32.7C52.8 33.6 56.4 34.4 60.2 34.4C69.1 34.4 74.4 30 74.5 21ZM96.6 30.5H104L97.5 0.8H90.8C89.3 0.8 88 1.6 87.4 3L74.8 30.5H83.8L85.6 25.6H96.1L96.6 30.5ZM88.1 19.3L92.4 8.1L94.9 19.3H88.1ZM51.8 0.8L44.8 30.5H36.3L43.3 0.8H51.8Z" fill="#1434CB" />
      </svg>
    </div>
  );
};

// 2. Official Mastercard Vector SVG (Overlapping Red and Orange-Yellow Circles)
export const MastercardBadge: React.FC<PaymentBadgeProps> = ({ className = '', size = 'md' }) => {
  const heightClass = size === 'sm' ? 'h-6' : size === 'lg' ? 'h-9' : 'h-7';
  return (
    <div className={`inline-flex items-center justify-center bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-2xs select-none ${heightClass} ${className}`}>
      <svg className="h-4 sm:h-4.5 w-auto" viewBox="0 0 50 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="17" cy="16" r="14" fill="#EB001B" />
        <circle cx="33" cy="16" r="14" fill="#F79E1B" />
        <path d="M25 5.5C28.5 8.2 30.8 12.4 30.8 17C30.8 21.6 28.5 25.8 25 28.5C21.5 25.8 19.2 21.6 19.2 17C19.2 12.4 21.5 8.2 25 5.5Z" fill="#FF5F00" />
      </svg>
    </div>
  );
};

// 3. Official Meeza Vector Badge (Egyptian National Payment Gateway)
export const MeezaBadge: React.FC<PaymentBadgeProps & { variant?: 'green' | 'white' }> = ({ className = '', size = 'md', variant = 'white' }) => {
  const heightClass = size === 'sm' ? 'h-6' : size === 'lg' ? 'h-9' : 'h-7';
  if (variant === 'white') {
    return (
      <div className={`inline-flex items-center justify-center bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-2xs select-none ${heightClass} ${className}`}>
        <svg className="h-3.5 sm:h-4 w-auto" viewBox="0 0 70 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="3" fill="#8B1F54" />
          <circle cx="15" cy="8" r="3" fill="#007A33" />
          <circle cx="8" cy="15" r="3" fill="#FDB913" />
          <circle cx="15" cy="15" r="3" fill="#8B1F54" />
          <text x="24" y="17" fill="#8B1F54" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="14" letterSpacing="-0.5">
            ميزة
          </text>
        </svg>
      </div>
    );
  }
  return (
    <div className={`inline-flex items-center justify-center bg-[#007A33] px-2.5 py-1 rounded-lg text-white font-extrabold select-none shadow-2xs ${heightClass} ${className}`}>
      <span className="text-[11px] tracking-tight">ميزة Meeza</span>
    </div>
  );
};

// 4. valU Installments Vector Badge
export const ValuBadge: React.FC<PaymentBadgeProps> = ({ className = '', size = 'md' }) => {
  const heightClass = size === 'sm' ? 'h-6' : size === 'lg' ? 'h-9' : 'h-7';
  return (
    <div className={`inline-flex items-center justify-center bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-2xs select-none ${heightClass} ${className}`}>
      <svg className="h-3.5 sm:h-4 w-auto" viewBox="0 0 65 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="2" y="17" fill="#00A859" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="15" fontStyle="italic" letterSpacing="-0.5">
          valU
        </text>
        <text x="44" y="14" fill="#FF6A00" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="16">
          *
        </text>
      </svg>
    </div>
  );
};

// 5. Aman Installments Vector Badge
export const AmanBadge: React.FC<PaymentBadgeProps> = ({ className = '', size = 'md' }) => {
  const heightClass = size === 'sm' ? 'h-6' : size === 'lg' ? 'h-9' : 'h-7';
  return (
    <div className={`inline-flex items-center justify-center bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-2xs select-none ${heightClass} ${className}`}>
      <svg className="h-3.5 sm:h-4 w-auto" viewBox="0 0 70 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="35" y="12" fill="#00A859" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="11" textAnchor="middle">
          أمان
        </text>
        <text x="35" y="21" fill="#00A859" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="8" textAnchor="middle">
          Aman
        </text>
      </svg>
    </div>
  );
};

// 6. Fawry Pay Later Vector Badge
export const FawryBadge: React.FC<PaymentBadgeProps> = ({ className = '', size = 'md' }) => {
  const heightClass = size === 'sm' ? 'h-6' : size === 'lg' ? 'h-9' : 'h-7';
  return (
    <div className={`inline-flex items-center justify-center bg-[#FDB913] px-2.5 py-1 rounded-lg select-none shadow-2xs ${heightClass} ${className}`}>
      <svg className="h-3.5 sm:h-4 w-auto" viewBox="0 0 80 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="5" y="17" fill="#002855" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="13" letterSpacing="0.5">
          fawry
        </text>
        <text x="50" y="16" fill="#002855" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="7">
          Pay Later
        </text>
      </svg>
    </div>
  );
};

// 7. Vodafone Cash Vector Badge
export const VodafoneCashBadge: React.FC<PaymentBadgeProps> = ({
  className = '',
  size = 'md',
  variant = 'transparent'
}) => {
  const heightClass = size === 'sm' ? 'h-7' : size === 'lg' ? 'h-10' : 'h-8';
  const containerClass = variant === 'white'
    ? 'bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-2xs'
    : 'bg-transparent';

  return (
    <div className={`inline-flex items-center justify-center select-none ${containerClass} ${heightClass} ${className}`}>
      <Image
        src="/images/payments/vodafone-cash.png"
        alt="Vodafone Cash"
        width={80}
        height={32}
        className="h-full w-auto object-contain drop-shadow-sm transition-transform hover:scale-105"
      />
    </div>
  );
};

// 8. InstaPay Vector Badge
export const InstaPayBadge: React.FC<PaymentBadgeProps> = ({
  className = '',
  size = 'md',
  variant = 'transparent'
}) => {
  const heightClass = size === 'sm' ? 'h-7' : size === 'lg' ? 'h-10' : 'h-8';
  const containerClass = variant === 'white'
    ? 'bg-white px-2 py-0.5 rounded-lg border border-gray-200 shadow-2xs'
    : 'bg-transparent';
  const imgSrc = variant === 'white'
    ? '/images/payments/instapay.png'
    : '/images/payments/instapay-light.png';

  return (
    <div className={`inline-flex items-center justify-center select-none ${containerClass} ${heightClass} ${className}`}>
      <Image
        src={imgSrc}
        alt="InstaPay"
        width={80}
        height={32}
        className="h-full w-auto object-contain drop-shadow-sm transition-transform hover:scale-105"
      />
    </div>
  );
};

// 9. CIB Bank Vector Badge
export const CIBBadge: React.FC<PaymentBadgeProps> = ({ className = '', size = 'md' }) => {
  const heightClass = size === 'sm' ? 'h-6' : size === 'lg' ? 'h-9' : 'h-7';
  return (
    <div className={`inline-flex items-center justify-center bg-[#004B87] px-2.5 py-1 rounded-lg text-white font-bold select-none shadow-2xs ${heightClass} ${className}`}>
      <span className="text-[11px]">CIB Bank</span>
    </div>
  );
};

// 10. Banque Misr Vector Badge
export const BanqueMisrBadge: React.FC<PaymentBadgeProps> = ({ className = '', size = 'md' }) => {
  const heightClass = size === 'sm' ? 'h-6' : size === 'lg' ? 'h-9' : 'h-7';
  return (
    <div className={`inline-flex items-center justify-center bg-[#8C1D40] px-2.5 py-1 rounded-lg text-white font-bold select-none shadow-2xs ${heightClass} ${className}`}>
      <span className="text-[11px]">بنك مصر Banque Misr</span>
    </div>
  );
};
