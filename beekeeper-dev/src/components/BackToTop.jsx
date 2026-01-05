import React, { useEffect, useMemo, useRef, useState } from "react";

export default function BackToTop({
  containerRef,
  showAfter = 100,
  minOverflow = 200,
}) {
  const [visible, setVisible] = useState(false);
  const ticking = useRef(false);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false
    );
  }, []);

  useEffect(() => {
    const getTarget = () => containerRef?.current || null;

    const getMetrics = () => {
      const el = getTarget();

      // Use container ONLY if it actually scrolls
      if (el && el.scrollHeight > el.clientHeight + 1) {
        return {
          mode: "container",
          overflow: el.scrollHeight - el.clientHeight,
          top: el.scrollTop,
          el,
        };
      }

      // Otherwise fallback to window scroll
      const doc = document.documentElement;
      return {
        mode: "window",
        overflow: doc.scrollHeight - window.innerHeight,
        top: window.scrollY || doc.scrollTop || 0,
        el: null,
      };
    };

    const update = () => {
      ticking.current = false;
      const { overflow, top } = getMetrics();

      const shouldEnable = overflow >= minOverflow;
      const shouldShow = shouldEnable && top >= showAfter;

      setVisible(shouldShow);
    };

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(update);
    };

    update();

    const { mode, el } = getMetrics();
    if (mode === "container" && el) {
      el.addEventListener("scroll", onScroll, { passive: true });
    } else {
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    const ro = new ResizeObserver(() => update());
    const target = getTarget();
    if (target) ro.observe(target);
    ro.observe(document.documentElement);

    return () => {
      if (mode === "container" && el) {
        el.removeEventListener("scroll", onScroll);
      } else {
        window.removeEventListener("scroll", onScroll);
      }
      ro.disconnect();
    };
  }, [containerRef, showAfter, minOverflow]);

  const handleClick = () => {
    const el = containerRef?.current || null;

    // scroll container if it's scrollable
    if (el && el.scrollHeight > el.clientHeight + 1) {
      el.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
      return;
    }

    // otherwise scroll window
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Back to top"
      title="Back to top"
      className="
        fixed z-[9999]
        bottom-6 right-6 sm:bottom-8 sm:right-8
        h-11 w-11
        rounded-full shadow-lg
        bg-[#1a3329] text-white
        hover:bg-[#244a3b]
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1a3329]
        flex items-center justify-center
      "
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 5l-7 7m7-7l7 7M12 5v14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
