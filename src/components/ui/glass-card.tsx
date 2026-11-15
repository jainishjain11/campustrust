"use client";

import React, { type ReactNode } from "react";

type GlassCardProps = {
  children: ReactNode;
  variant?: "default" | "raised" | "interactive";
  glow?: "none" | "blue" | "sky" | "cyan" | "indigo" | "red" | "critical" | "warning" | "emerald";
  className?: string;
  onClick?: () => void;
  role?: string;
  tabIndex?: number;
  id?: string;
};

/**
 * Reusable GlassCard Component
 * Liquid Glass styling with:
 * - 24px border radius (rounded-3xl)
 * - Translucent surface with dark navy tint for WCAG AA 4.5:1 text contrast
 * - 24px backdrop blur with 160% saturation
 * - Specular top edge highlight (inset 0 1px 1px 0 rgba(255, 255, 255, 0.18))
 * - Soft blue-tinted shadows
 */
export default function GlassCard({
  children,
  variant = "default",
  glow = "none",
  className = "",
  onClick,
  role,
  tabIndex,
  id,
}: GlassCardProps) {
  const variantClass =
    variant === "raised"
      ? "glass-raised"
      : variant === "interactive"
      ? "glass-card liquid-glass-interactive cursor-pointer"
      : "glass-card";

  const glowClass =
    glow === "blue"
      ? "shadow-[0_16px_36px_-8px_rgba(59,130,246,0.35)] border-blue-400/30"
      : glow === "sky"
      ? "shadow-[0_16px_36px_-8px_rgba(125,211,252,0.30)] border-sky-400/30"
      : glow === "cyan"
      ? "shadow-[0_16px_36px_-8px_rgba(34,211,238,0.30)] border-cyan-400/30"
      : glow === "indigo"
      ? "shadow-[0_16px_36px_-8px_rgba(99,102,241,0.30)] border-indigo-400/30"
      : glow === "red" || glow === "critical"
      ? "shadow-[0_16px_36px_-8px_rgba(248,113,113,0.35)] border-red-400/35"
      : glow === "warning"
      ? "shadow-[0_16px_36px_-8px_rgba(252,211,77,0.30)] border-amber-400/30"
      : glow === "emerald"
      ? "shadow-[0_16px_36px_-8px_rgba(110,231,183,0.30)] border-emerald-400/30"
      : "";

  return (
    <div
      id={id}
      role={role}
      tabIndex={tabIndex}
      onClick={onClick}
      className={`rounded-[24px] p-6 transition-all duration-300 ${variantClass} ${glowClass} ${className}`}
    >
      {children}
    </div>
  );
}

export { GlassCard };
