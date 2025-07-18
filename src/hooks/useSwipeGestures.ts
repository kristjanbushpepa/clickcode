
import { useEffect, useRef } from 'react';

interface SwipeGesturesOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  preventScroll?: boolean;
}

export const useSwipeGestures = ({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  preventScroll = false
}: SwipeGesturesOptions) => {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchEnd = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    };
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (preventScroll && touchStart.current) {
      const currentTouch = {
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY
      };
      
      const deltaX = Math.abs(currentTouch.x - touchStart.current.x);
      const deltaY = Math.abs(currentTouch.y - touchStart.current.y);
      
      // If horizontal swipe is more prominent, prevent vertical scroll
      if (deltaX > deltaY && deltaX > 10) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchStart.current || !e.changedTouches[0]) return;
    
    touchEnd.current = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    };

    const deltaX = touchStart.current.x - touchEnd.current.x;
    const deltaY = Math.abs(touchStart.current.y - touchEnd.current.y);
    
    // Only trigger swipe if horizontal movement is greater than vertical
    if (Math.abs(deltaX) > threshold && Math.abs(deltaX) > deltaY) {
      if (deltaX > 0 && onSwipeLeft) {
        e.preventDefault();
        onSwipeLeft();
      } else if (deltaX < 0 && onSwipeRight) {
        e.preventDefault();
        onSwipeRight();
      }
    }
  };

  useEffect(() => {
    const element = document.body;
    
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, threshold, preventScroll]);
};
