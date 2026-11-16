"use client";

import { useEffect, useRef } from "react";
import {
  Shield, KeyRound, Activity, ShieldAlert,
  ArrowRight, Sparkles, CheckCircle2, LockKeyhole,
  Users, Terminal, Network
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { BackgroundOrbs } from "@/components/background-orbs";

type CinematicHeroProps = {
  onEnter: () => void;
  onSelectModule: (moduleName: string) => void;
};

export default function CinematicHero({ onEnter, onSelectModule }: CinematicHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particle nodes representing university identities and assets
    const NODE_COUNT = 45;
    const nodes: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      label?: string;
    }> = [];

    const colors = ["#22d3ee", "#38bdf8", "#818cf8", "#c084fc", "#34d399"];

    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2.5 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connection lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            const alpha = (1 - dist / 140) * 0.18;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#0A1530] via-[#0C1F45] to-[#0E2A5C] text-[#F5F8FF]">
      {/* 3 Slowly Drifting Ambient Background Orbs */}
      <BackgroundOrbs />

      {/* Background Interactive Mesh Canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-0 opacity-40"
      />

      {/* Top Floating Glass Navigation Header */}
      <header className="relative z-10 mx-auto mt-6 w-[92%] max-w-6xl glass-raised rounded-full px-6 py-3.5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#38BDF8] to-[#3B82F6] text-slate-950 font-bold shadow-lg shadow-blue-500/25">
            <Shield size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              CampusTrust
              <span className="glass-chip text-[9px] font-mono text-[#60A5FA]">
                v2.0 Liquid Glass
              </span>
            </h1>
            <p className="text-[10px] text-slate-300/80 font-mono tracking-wide">
              SRMIST KTR · Academic Security MIS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onEnter}
            className="btn-primary-glass flex items-center gap-2 text-xs font-semibold cursor-pointer shadow-lg shadow-blue-500/20"
          >
            Enter Command Center
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* Hero Showcase Center */}
      <main className="relative z-10 mx-auto max-w-5xl px-6 py-12 text-center flex flex-col items-center">
        {/* Subtle Pill Badge */}
        <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs text-[#7DD3FC] border border-blue-400/30 shadow-lg mb-6">
          <Sparkles size={14} className="text-[#38BDF8]" />
          <span className="font-medium tracking-wide">
            Next-Gen University Identity & Access Risk Governance
          </span>
        </div>

        {/* Cinematic Headline */}
        <h2 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] text-transparent bg-clip-text bg-gradient-to-b from-white via-[#F5F8FF] to-slate-300">
          Trust Every Identity.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60A5FA] via-[#7DD3FC] to-[#818CF8]">
            Secure Every Connection.
          </span>
        </h2>

        {/* Narrative Subtitle */}
        <p className="mt-6 max-w-2xl text-base sm:text-lg text-slate-200/90 font-normal leading-relaxed">
          A centralized Management Information System designed to identify out-of-role permissions, calculate deterministic risk scores ($L \times I$), audit simulated telemetry, and track mitigation tasks to full closure.
        </p>

        {/* Main Action Group */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onEnter}
            className="btn-primary-glass flex items-center gap-2.5 px-7 py-3.5 text-sm font-bold shadow-xl shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
          >
            <Shield size={18} />
            Launch Security Command Center
            <ArrowRight size={16} />
          </button>

          <button
            onClick={() => onSelectModule("Interactive Network Graph")}
            className="btn-secondary-glass flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-white transition cursor-pointer"
          >
            <Network size={18} className="text-[#38BDF8]" />
            Explore Identity Graph
          </button>
        </div>

        {/* Feature Cards Grid (Apple-style Liquid Glass) */}
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 w-full text-left">
          <GlassCard
            variant="interactive"
            glow="blue"
            onClick={() => onSelectModule("Identity Management")}
            className="p-5 cursor-pointer group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-[#60A5FA] border border-blue-500/20 group-hover:scale-110 transition">
              <Users size={20} />
            </div>
            <h3 className="mt-4 text-sm font-bold text-white group-hover:text-[#60A5FA] transition">
              Identity Governance
            </h3>
            <p className="mt-1 text-xs text-slate-300/80 leading-relaxed">
              Complete directory of student, faculty, and administrative identities with automated lifecycle tracking.
            </p>
          </GlassCard>

          <GlassCard
            variant="interactive"
            glow="indigo"
            onClick={() => onSelectModule("Access Reviews")}
            className="p-5 cursor-pointer group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-[#C084FC] border border-purple-500/20 group-hover:scale-110 transition">
              <KeyRound size={20} />
            </div>
            <h3 className="mt-4 text-sm font-bold text-white group-hover:text-[#7DD3FC] transition">
              Out-of-Role Detection
            </h3>
            <p className="mt-1 text-xs text-slate-300/80 leading-relaxed">
              Continuous audit of user-to-asset privileges, flagging excessive permissions and uncertified entitlements.
            </p>
          </GlassCard>

          <GlassCard
            variant="interactive"
            glow="red"
            onClick={() => onSelectModule("Risk Register")}
            className="p-5 cursor-pointer group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-[#F87171] border border-red-500/20 group-hover:scale-110 transition">
              <ShieldAlert size={20} />
            </div>
            <h3 className="mt-4 text-sm font-bold text-white group-hover:text-[#F87171] transition">
              Deterministic Engine
            </h3>
            <p className="mt-1 text-xs text-slate-300/80 leading-relaxed">
              Transparent risk formula: Likelihood (1–5) × Impact (1–5) generating stable finding codes without duplicates.
            </p>
          </GlassCard>

          <GlassCard
            variant="interactive"
            glow="cyan"
            onClick={() => onSelectModule("Activity Monitoring")}
            className="p-5 cursor-pointer group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-[#38BDF8] border border-cyan-500/20 group-hover:scale-110 transition">
              <Activity size={20} />
            </div>
            <h3 className="mt-4 text-sm font-bold text-white group-hover:text-[#38BDF8] transition">
              Telemetry Simulator
            </h3>
            <p className="mt-1 text-xs text-slate-300/80 leading-relaxed">
              Interactive scenario engine emitting simulated brute-force bursts, privilege escalations, and audit logs.
            </p>
          </GlassCard>
        </div>
      </main>

      {/* Footer Banner */}
      <footer className="relative z-10 border-t border-white/10 glass px-6 py-4 text-center">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <span>CampusTrust · Academic MIS Prototype · Fictional Case Study (SRMIST KTR)</span>
          <span className="font-mono text-[#60A5FA]">Zero Trust Architecture · Capstone Demonstration</span>
        </div>
      </footer>
    </div>
  );
}