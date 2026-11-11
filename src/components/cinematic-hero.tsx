"use client";

import { useEffect, useRef } from "react";
import {
  Shield, KeyRound, Activity, ShieldAlert,
  ArrowRight, Sparkles, CheckCircle2, LockKeyhole,
  Users, Terminal, Network
} from "lucide-react";

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
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[#030712] text-white">
      {/* Background Interactive Mesh Canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-0 opacity-70"
      />

      {/* Top Floating Glass Navigation Header */}
      <header className="relative z-10 mx-auto mt-6 w-[92%] max-w-6xl rounded-2xl liquid-glass px-6 py-3.5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-lg shadow-cyan-500/25">
            <Shield size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              CampusTrust
              <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[9px] font-mono font-medium text-cyan-300 border border-cyan-500/20">
                v2.0 Liquid Glass
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-wide">
              SRMIST KTR · Academic Security MIS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onEnter}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:from-cyan-300 hover:to-blue-400 transition cursor-pointer"
          >
            Enter Command Center
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* Hero Showcase Center */}
      <main className="relative z-10 mx-auto max-w-5xl px-6 py-12 text-center flex flex-col items-center">
        {/* Subtle Pill Badge */}
        <div className="inline-flex items-center gap-2 rounded-full liquid-glass px-4 py-1.5 text-xs text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-950/40 mb-6 animate-pulse-glow">
          <Sparkles size={14} className="text-cyan-400" />
          <span className="font-medium tracking-wide">
            Next-Gen University Identity & Access Risk Governance
          </span>
        </div>

        {/* Cinematic Headline */}
        <h2 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400">
          Trust Every Identity.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
            Secure Every Connection.
          </span>
        </h2>

        {/* Narrative Subtitle */}
        <p className="mt-6 max-w-2xl text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
          A centralized Management Information System designed to identify out-of-role permissions, calculate deterministic risk scores ($L \times I$), audit simulated telemetry, and track mitigation tasks to full closure.
        </p>

        {/* Main Action Group */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onEnter}
            className="flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 px-7 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-500/25 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
          >
            <Shield size={18} />
            Launch Security Command Center
            <ArrowRight size={16} />
          </button>

          <button
            onClick={() => onSelectModule("Interactive Network Graph")}
            className="flex items-center gap-2 rounded-xl liquid-glass px-6 py-3.5 text-sm font-semibold text-white border border-white/10 hover:border-cyan-500/40 hover:bg-white/[0.08] transition cursor-pointer"
          >
            <Network size={18} className="text-cyan-400" />
            Explore Identity Graph
          </button>
        </div>

        {/* Feature Cards Grid (Apple-style Liquid Glass) */}
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 w-full text-left">
          <div
            onClick={() => onSelectModule("Identity Management")}
            className="rounded-2xl liquid-glass liquid-glass-interactive p-5 cursor-pointer group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition">
              <Users size={20} />
            </div>
            <h3 className="mt-4 text-sm font-bold text-white group-hover:text-cyan-300 transition">
              Identity Governance
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Complete directory of student, faculty, and administrative identities with automated lifecycle tracking.
            </p>
          </div>

          <div
            onClick={() => onSelectModule("Access Reviews")}
            className="rounded-2xl liquid-glass liquid-glass-interactive p-5 cursor-pointer group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-110 transition">
              <KeyRound size={20} />
            </div>
            <h3 className="mt-4 text-sm font-bold text-white group-hover:text-cyan-300 transition">
              Out-of-Role Detection
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Continuous audit of user-to-asset privileges, flagging excessive permissions and uncertified entitlements.
            </p>
          </div>

          <div
            onClick={() => onSelectModule("Risk Register")}
            className="rounded-2xl liquid-glass liquid-glass-interactive p-5 cursor-pointer group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 group-hover:scale-110 transition">
              <ShieldAlert size={20} />
            </div>
            <h3 className="mt-4 text-sm font-bold text-white group-hover:text-cyan-300 transition">
              Deterministic Engine
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Transparent risk formula: Likelihood (1–5) × Impact (1–5) generating stable finding codes without duplicates.
            </p>
          </div>

          <div
            onClick={() => onSelectModule("Activity Monitoring")}
            className="rounded-2xl liquid-glass liquid-glass-interactive p-5 cursor-pointer group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition">
              <Activity size={20} />
            </div>
            <h3 className="mt-4 text-sm font-bold text-white group-hover:text-cyan-300 transition">
              Telemetry Simulator
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Interactive scenario engine emitting simulated brute-force bursts, privilege escalations, and audit logs.
            </p>
          </div>
        </div>
      </main>

      {/* Footer Banner */}
      <footer className="relative z-10 border-t border-white/5 bg-[#030712]/80 backdrop-blur-md px-6 py-4 text-center">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <span>CampusTrust · Academic MIS Prototype · Fictional Case Study (SRMIST KTR)</span>
          <span className="font-mono text-cyan-400/80">Zero Trust Architecture · Capstone Demonstration</span>
        </div>
      </footer>
    </div>
  );
}

