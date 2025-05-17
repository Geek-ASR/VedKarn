
"use client";

import { useState, useEffect, type RefObject } from 'react';

interface IntersectionObserverOptions extends IntersectionObserverInit {
  triggerOnce?: boolean;
}

function useIntersectionObserver(
  elementRef: RefObject<Element>,
  {
    threshold = 0.1, // Trigger when 10% of the element is visible
    root = null,
    rootMargin = '0%',
    triggerOnce = true, // Default to triggering the animation only once
  }: IntersectionObserverOptions = {}
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          if (triggerOnce) {
            observer.unobserve(element); // Stop observing after the first intersection if triggerOnce is true
          }
        } else {
          // Only set back to false if we are not triggering once, to allow re-triggering if element scrolls out and back in
          if (!triggerOnce) { 
            setIsIntersecting(false);
          }
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [elementRef, threshold, root, rootMargin, triggerOnce]);

  return isIntersecting;
}

export default useIntersectionObserver;
