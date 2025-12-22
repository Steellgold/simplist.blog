import { useEffect, useRef, useState } from "react";
import { IconData } from "./types";

export function useIconPagination(
  items: IconData[],
  batchSize: number,
  enabled: boolean,
) {
  const [visibleCount, setVisibleCount] = useState(batchSize);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Reset count when items or search changes
  useEffect(() => {
    setVisibleCount(batchSize);
  }, [items, batchSize]);

  // Intersection observer for lazy loading
  useEffect(() => {
    if (!enabled || !loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleCount((prev) => Math.min(prev + batchSize, items.length));
          }
        });
      },
      { threshold: 0.1, rootMargin: "100px" },
    );

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (loadMoreRef.current) {
        observer.observe(loadMoreRef.current);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [enabled, items.length, batchSize]);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  return {
    visibleItems,
    hasMore,
    loadMoreRef,
  };
}
