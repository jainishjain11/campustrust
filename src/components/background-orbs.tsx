"use client";

import React from "react";

/**
 * BackgroundOrbs - Three subtle, slowly drifting ambient gradient orbs
 * Colors:
 * - Blue orb:   #3B82F6
 * - Sky orb:    #7DD3FC
 * - Indigo orb: #6366F1
 *
 * Uses GPU-accelerated transforms and opacity only (no blur animations)
 * for maximum performance and 60 FPS scrolling on all devices.
 */
export default function BackgroundOrbs() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Orb 1: Blue Orb (Top Left / Center) */}
      <div
        className="orb-blue absolute -top-32 -left-24 h-[480px] w-[480px] rounded-full sm:h-[620px] sm:w-[620px] lg:h-[720px] lg:w-[720px]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.28) 0%, rgba(59, 130, 246, 0.08) 45%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Orb 2: Sky Orb (Top Right / Center) */}
      <div
        className="orb-sky absolute top-20 -right-24 h-[440px] w-[440px] rounded-full sm:h-[580px] sm:w-[580px] lg:h-[680px] lg:w-[680px]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(125, 211, 252, 0.24) 0%, rgba(125, 211, 252, 0.06) 50%, transparent 70%)",
          filter: "blur(65px)",
        }}
      />

      {/* Orb 3: Indigo Orb (Bottom Center / Left) */}
      <div
        className="orb-indigo absolute -bottom-40 left-1/4 h-[500px] w-[500px] rounded-full sm:h-[640px] sm:w-[640px] lg:h-[760px] lg:w-[760px]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.22) 0%, rgba(99, 102, 241, 0.05) 50%, transparent 75%)",
          filter: "blur(70px)",
        }}
      />

      {/* Ambient noise / texture overlay for organic liquid glass depth */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_transparent_0%,_rgba(10,21,48,0.5)_100%)]"
      />
    </div>
  );
}

export { BackgroundOrbs };
