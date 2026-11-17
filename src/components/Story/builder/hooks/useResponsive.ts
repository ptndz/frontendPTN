import { useState, useEffect, useCallback, useMemo } from 'react';
import { getDeviceType, type DeviceType } from '../constants/breakpoints';

export interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  viewportWidth: number;
  viewportHeight: number;
  deviceType: DeviceType;
}

function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  }) as T;
}

function getViewportDimensions(): { width: number; height: number } {
  if (typeof window === 'undefined') {
    return { width: 1200, height: 800 };
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

export function useResponsive(): ResponsiveState {
  const [dimensions, setDimensions] = useState(getViewportDimensions);

  const handleResize = useCallback(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const debouncedResize = debounce(handleResize, 50);
    handleResize();
    window.addEventListener('resize', debouncedResize);

    return () => {
      window.removeEventListener('resize', debouncedResize);
    };
  }, [handleResize]);

  const responsiveState = useMemo<ResponsiveState>(() => {
    const { width, height } = dimensions;
    const deviceType = getDeviceType(width);

    return {
      isMobile: deviceType === 'mobile',
      isTablet: deviceType === 'tablet',
      isDesktop: deviceType === 'desktop',
      viewportWidth: width,
      viewportHeight: height,
      deviceType,
    };
  }, [dimensions]);

  return responsiveState;
}

export default useResponsive;
