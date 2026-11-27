'use client';

import React, { useEffect } from 'react';
import { MotionConfig, useScroll, useSpring, motion } from 'framer-motion';
import { useGlobalStore } from '@/lib/store';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const MotionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    ScrollTrigger.refresh();
  }, [reduceMotion]);

  return (
    <MotionConfig reducedMotion={reduceMotion ? 'always' : 'user'}>
      {/* Fixed 3px Compositor-Accelerated Beam Scroll Progress Ribbon */}
      {!reduceMotion && (
        <motion.div
          aria-hidden="true"
          className="fixed top-0 left-0 right-0 h-[3px] z-50 origin-left pointer-events-none cern-beam-accent-bar"
          style={{ scaleX: smoothProgress }}
        />
      )}
      {children}
    </MotionConfig>
  );
};
