'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGlobalStore } from '@/lib/store';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Tactile Neobrutalist Spotlight Card with compositor hover/press physics
 * and pointer-tracked radial glow overlay (respects reduced motion).
 */
export const SpotlightMotionCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = '', delay = 0 }) => {
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const rectRef = useRef<DOMRect | null>(null);

  useEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;
    rectRef.current = el.getBoundingClientRect();
    const ro = new ResizeObserver(() => {
      if (surfaceRef.current) rectRef.current = surfaceRef.current.getBoundingClientRect();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || !surfaceRef.current) return;
    const rect = rectRef.current || surfaceRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 100;
    const y = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 100;
    surfaceRef.current.style.setProperty('--mouse-x', `${x.toFixed(1)}%`);
    surfaceRef.current.style.setProperty('--mouse-y', `${y.toFixed(1)}%`);
  };

  return (
    <motion.div
      ref={surfaceRef}
      onPointerMove={handlePointerMove}
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.32, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { y: -3 }}
      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
      className={`cern-spotlight-surface ${className}`}
    >
      <div aria-hidden="true" className="cern-spotlight-layer" />
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
};

/**
 * GSAP ScrollTrigger Staggered Reveal Container for grids & lists.
 */
export const GsapStaggerSection: React.FC<{
  children: React.ReactNode;
  className?: string;
  selector?: string;
}> = ({ children, className = '', selector = '.gsap-stagger-item' }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || reduceMotion) return;

    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const items = el.querySelectorAll(selector);
      if (items.length === 0) return;

      gsap.fromTo(
        items,
        { opacity: 0, y: 20, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.45,
          stagger: 0.05,
          ease: 'power3.out',
          clearProps: 'transform',
          scrollTrigger: {
            trigger: el,
            start: 'top 86%',
            once: true,
          },
        }
      );
    });

    return () => mm.revert();
  }, [reduceMotion, selector]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

/**
 * Smooth Spring Number Ticker (renders target value cleanly in SSR, counts up on mount).
 */
export const NumberTicker: React.FC<{
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}> = ({ value, decimals = 1, suffix = '', className = '' }) => {
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);
  const [display, setDisplay] = useState<string>(value.toFixed(decimals));

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(value.toFixed(decimals));
      return;
    }
    const obj = { val: value * 0.25 };
    const tween = gsap.to(obj, {
      val: value,
      duration: 0.85,
      ease: 'power2.out',
      onUpdate: () => setDisplay(obj.val.toFixed(decimals)),
    });
    return () => {
      tween.kill();
    };
  }, [value, decimals, reduceMotion]);

  return (
    <span className={`tabular-nums ${className}`}>
      {display}
      {suffix}
    </span>
  );
};

/**
 * Fixed top 2px root-scroll beamline progress bar.
 * Uses compositor-only CSS Scroll-Driven Animation when supported,
 * with Framer Motion useScroll fallback for older engines, and honors reduceMotion.
 */
export const ScrollBeamProgress: React.FC = () => {
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);
  const [nativeTimeline, setNativeTimeline] = useState(true);
  const { scrollYProgress } = useScroll();
  const smoothScaleX = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 32,
    restDelta: 0.001,
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof CSS !== 'undefined') {
      setNativeTimeline(Boolean(CSS.supports?.('animation-timeline', 'scroll(root block)')));
    }
  }, []);

  if (reduceMotion) return null;

  if (nativeTimeline) {
    return (
      <div
        className="cern-scroll-progress cern-scroll-progress-native"
        aria-hidden="true"
      />
    );
  }

  return (
    <motion.div
      className="cern-scroll-progress"
      style={{ scaleX: smoothScaleX }}
      aria-hidden="true"
    />
  );
};
