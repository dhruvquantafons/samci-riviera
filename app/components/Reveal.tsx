"use client";

import { useEffect, useRef } from "react";

interface RevealProps {
  children: React.ReactNode;
  /** Milliseconds to stagger this element behind its neighbours. */
  delay?: number;
  /** Element type to render, when a div would be wrong for the layout. */
  as?: "div" | "section" | "li" | "article" | "span";
  className?: string;
}

/**
 * Fades and lifts its children into view the first time they are scrolled to.
 *
 * Reveals by flipping a data attribute on the node rather than by holding
 * React state: the change is purely visual, so there is nothing to re-render,
 * and it keeps the effect free of synchronous setState. IntersectionObserver
 * costs nothing while idle, and each element is unobserved once it has fired
 * so it never animates twice.
 *
 * The visual work lives in the .reveal rules in globals.css, which collapse to
 * a no-op under prefers-reduced-motion.
 */
export default function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const show = () => node.setAttribute("data-visible", "true");

    // No observer support, or motion is unwelcome: show it straight away.
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      show();
      return;
    }

    // Already on screen at mount (above the fold) — reveal without waiting.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          show();
          observer.unobserve(entry.target);
        }
      },
      // Fire a little before the element reaches the viewport edge.
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      // One shared ref type across the allowed tags.
      ref={ref as React.Ref<never>}
      data-visible="false"
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`reveal ${className}`}
    >
      {children}
    </Tag>
  );
}
