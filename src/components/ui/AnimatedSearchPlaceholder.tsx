'use client';

import React, { useState, useEffect } from 'react';

interface AnimatedSearchPlaceholderProps {
  isRtl?: boolean;
  hasValue?: boolean;
}

const SEARCH_SUGGESTIONS_EN = [
  'HP laptops',
  'Dell workstations',
  'Cisco routers & switches',
  'MacBook Air M2',
  'Document scanners',
  'Logitech accessories',
  'Gaming laptops RTX 4060',
  'Wi-Fi 6 mesh routers'
];

const SEARCH_SUGGESTIONS_AR = [
  'لابتوبات HP',
  'أجهزة ديل ديسكتوب',
  'راوترات وسويتشات سيسكو',
  'ماك بوك إير M2',
  'ماسحات ضوئية للمستندات',
  'ماوسات وملحقات لوجيتك',
  'لابتوبات جيمنج RTX',
  'راوترات واي فاي 6 فائقة السرعة'
];

export const AnimatedSearchPlaceholder: React.FC<AnimatedSearchPlaceholderProps> = ({
  isRtl = false,
  hasValue = false,
}) => {
  const suggestions = isRtl ? SEARCH_SUGGESTIONS_AR : SEARCH_SUGGESTIONS_EN;
  const [index, setIndex] = useState(0);
  const [animationClass, setAnimationClass] = useState('opacity-100 translate-y-0');

  useEffect(() => {
    if (hasValue) return;

    const interval = setInterval(() => {
      // 1. Slide out upward with fade out
      setAnimationClass('opacity-0 -translate-y-2.5 transition-all duration-300 ease-in');

      // 2. Switch text while hidden
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % suggestions.length);
        // Position below before sliding in
        setAnimationClass('opacity-0 translate-y-2.5');

        // 3. Slide in from bottom with fade in
        requestAnimationFrame(() => {
          setTimeout(() => {
            setAnimationClass('opacity-100 translate-y-0 transition-all duration-400 ease-out');
          }, 30);
        });
      }, 300);
    }, 3200);

    return () => clearInterval(interval);
  }, [hasValue, suggestions.length]);

  if (hasValue) return null;

  return (
    <div
      className="absolute inset-y-0 flex items-center pointer-events-none select-none text-[13px] sm:text-[14px] text-gray-400 font-normal truncate left-3 rtl:left-auto rtl:right-3"
      aria-hidden="true"
    >
      <span className="text-gray-400 font-normal">
        {isRtl ? 'ابحث عن' : 'Search for'}
      </span>
      <span className="mx-1.5 text-gray-300">•</span>
      <span
        className={`inline-block font-semibold text-blue-600/90 dark:text-blue-500 will-change-transform ${animationClass}`}
      >
        {suggestions[index]}
      </span>
    </div>
  );
};
