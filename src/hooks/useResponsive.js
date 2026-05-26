import { useState, useEffect } from 'react';

function getWidth() {
  return typeof window !== 'undefined' ? window.innerWidth : 1280;
}

export function useResponsive() {
  const [width, setWidth] = useState(getWidth);

  useEffect(() => {
    const fn = () => setWidth(window.innerWidth);
    window.addEventListener('resize', fn, { passive: true });
    return () => window.removeEventListener('resize', fn);
  }, []);

  return {
    isMobile:  width <= 768,   // phone / small tablet
    isTablet:  width <= 1100,  // tablet
    isSmall:   width <= 480,   // small phone
    width,
  };
}
