"use client";

import { useEffect, useState } from "react";
import IdentityManagement from "@/components/identity-management";
import AssetInventory from "@/components/asset-inventory";
import AccessReviews from "@/components/access-reviews";
import RiskRegister from "@/components/risk-register";
import ActivityMonitoring from "@/components/activity-monitoring";
import IncidentManagement from "@/components/incident-management";
import ReportsModule from "@/components/reports-module";
import SecurityNetworkGraph from "@/components/security-network-graph";
import CinematicHero from "@/components/cinematic-hero";

import {
  Activity, AlertTriangle, ArrowDownRight, ArrowUpRight,
  Bell, CheckCircle2, ChevronDown, CircleHelp, Clock3,
  FileBarChart, Fingerprint, LayoutDashboard, LockKeyhole,
  LogOut, Menu, Network, Search, Settings, Shield, ShieldAlert,
  ShieldCheck, Users, X, Sparkles, Terminal, RefreshCw, KeyRound
} from "lucide-react";
import {
  Cell, Pie, PieChart, ResponsiveContainer, Tooltip,
} from "recharts";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Security Topology Graph", icon: Network },
  { label: "Identity Management", icon: Users },
  { label: "Asset Inventory", icon: LockKeyhole },
  { label: "Access Reviews", icon: Fingerprint },
  { label: "Risk Register", icon: ShieldAlert },
  { label: "Activity Monitoring", icon: Activity },
  { label: "Incident Management", icon: AlertTriangle },
  { label: "Reports", icon: FileBarChart },
];

const severityColors: Record<string, string> = {
  CRITICAL: "#ef4444",
  HIGH: "#f97316",
  MEDIUM: "#eab308",
  LOW: "#10b981",
};

function StatCard({
  title, value, note, icon: Icon, tone, glow, trend,
}: {
  title: string;
  value: string | number;
  note: string;
  icon: React.ElementType;
  tone: string;
  glow?: string;
  trend?: "up" | "down";
}) {
  return (
    <div className={`rounded-2xl liquid-glass p-5 border border-white/10 shadow-lg ${glow || ""}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">{title}</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-white">
            {value}
          </p>
        </div>
        <div className={`rounded-xl p-2.5 ${tone} border border-white/10`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
        {trend === "up" ? <ArrowUpRight size={14} className="text-red-400" /> :
          trend === "down" ? <ArrowDownRight size={14} className="text-emerald-400" /> : null}
        <span>{note}</span>
      </div>
    </div>
  );
}

const DEMO_PERSONAS = [
  {
    name: "Campus Administrator",
    role: "ADMIN",
    title: "System Administrator",
    initials: "AD",
    email: "admin@example.edu",
    avatarBg: "bg-cyan-400 text-slate-950",
    badgeColor: "bg-purple-500/10 text-purple-300 border-purple-500/30",
  },
  {
    name: "Security Analyst",
    role: "SECURITY_ANALYST",
    title: "SOC Lead Analyst",
    initials: "SA",
    email: "analyst@example.edu",
    avatarBg: "bg-blue-600 text-white",
    badgeColor: "bg-blue-500/10 text-blue-300 border-blue-500/30",
  },
  {
    name: "Dr. Priya Nair",
    role: "FACULTY",
    title: "Department Manager (ECE)",
    initials: "PN",
    email: "priya@example.edu",
    avatarBg: "bg-amber-500 text-white",
    badgeColor: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  },
  {
    name: "Rahul Mehta",
    role: "STUDENT",
    title: "Student Account (Read-Only)",
    initials: "RM",
    email: "rahul@example.edu",
    avatarBg: "bg-slate-600 text-white",
    badgeColor: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
  },
];

export default function Home() {
  const [viewMode, setViewMode] = useState<"app" | "intro">("app");
  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [currentPersona, setCurrentPersona] = useState(DEMO_PERSONAS[0]);
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);

  // Modals
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [resettingDb, setResettingDb] = useState(false);

  async function loadDashboard() {
    try {
      const response = await fetch("/api/dashboard");
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load dashboard.");
      }

      setDashboard(result.data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    loadDashboard();
  }, []);

  async function handleResetDb() {
    if (!confirm("Are you sure you want to reset all demo database records back to the initial seeded factory state? All custom edits will be reverted.")) {
      return;
    }
    setResettingDb(true);
    try {
      const res = await fetch("/api/admin/reset", { method: "POST" });
      const result = await res.json();
      if (result.success) {
        alert(result.message);
        setShowSettingsModal(false);
        window.location.reload();
      } else {
        alert(result.message || "Failed to reset database.");
      }
    } catch {
      alert("Error contacting reset endpoint.");
    } finally {
      setResettingDb(false);
    }
  }

  // If in Intro Mode, render the cinematic hero
  if (viewMode === "intro") {
    return (
      <CinematicHero
        onEnter={() => setViewMode("app")}
        onSelectModule={(moduleName) => {
          setActivePage(moduleName);
          setViewMode("app");
        }}
      />
    );
  }

  const isDashboard = activePage === "Dashboard";
  const stats = dashboard?.statistics;

  const riskData = (dashboard?.riskDistribution || []).map((risk: any) => ({
    name: risk.severity.charAt(0) + risk.severity.slice(1).toLowerCase(),
    value: risk.count,
    color: severityColors[risk.severity],
  }));

  const totalFindings = riskData.reduce(
    (total: number, risk: any) => total + risk.value, 0
  );

  const getTime = (date: string) => {
    const minutes = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const activityStyle = (type: string) => {
    if (type.includes("RISK") || type.includes("FAILED") || type.includes("SUSPICIOUS")) {
      return { icon: AlertTriangle, color: "text-red-400 bg-red-500/10 border border-red-500/20" };
    }
    if (type.includes("REVIEW")) {
      return { icon: CheckCircle2, color: "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" };
    }
    return { icon: Activity, color: "text-cyan-400 bg-cyan-500/10 border border-cyan-500/20" };
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-300">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Floating Glass Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col liquid-glass border-r border-white/10 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Brand Logo Header */}
        <div className="flex h-[76px] items-center gap-3 border-b border-white/10 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 text-slate-950 font-bold shadow-lg shadow-cyan-500/25">
            <Shield size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              CampusTrust
            </h1>
            <p className="text-[10px] font-mono tracking-wider text-cyan-400">
              IDENTITY & RISK MIS
            </p>
          </div>
          <button
            className="ml-auto text-slate-400 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation list */}
        <div className="px-4 pt-6 overflow-y-auto flex-1">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[2px] text-slate-400 font-mono">
            Command Modules
          </p>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = activePage === item.label;
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    setActivePage(item.label);
                    setSidebarOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-medium transition cursor-pointer ${
                    active
                      ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30 shadow-md shadow-cyan-950/40 glow-cyan font-semibold"
                      : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  <Icon size={17} className={active ? "text-cyan-400" : "text-slate-400"} />
                  {item.label}
                  {item.label === "Risk Register" && (
                    <span className="ml-auto rounded-full bg-red-500/20 border border-red-500/40 px-2 py-0.5 text-[9px] font-bold text-red-300">
                      {stats?.openRisks ?? 0}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions & Active Persona */}
        <div className="mt-auto space-y-1.5 border-t border-white/10 px-4 py-4">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs text-slate-400 hover:bg-white/[0.05] hover:text-white transition cursor-pointer"
          >
            <Settings size={16} /> Settings & Reset
          </button>
          <button
            onClick={() => setShowHelpModal(true)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs text-slate-400 hover:bg-white/[0.05] hover:text-white transition cursor-pointer"
          >
            <CircleHelp size={16} /> Viva Demo Guide
          </button>

          <div className="mt-3 flex items-center gap-3 rounded-xl bg-white/[0.04] p-3 border border-white/5">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl font-bold text-xs shrink-0 ${currentPersona.avatarBg}`}>
              {currentPersona.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{currentPersona.name}</p>
              <p className="text-[10px] text-slate-400 truncate font-mono">{currentPersona.title}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Command Center Workspace */}
      <main className="min-h-screen lg:ml-[270px]">
        {/* Floating Top Bar */}
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-white/10 liquid-glass px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              className="text-slate-400 hover:text-white lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={22} />
            </button>
            <div>
              <p className="text-[10px] font-mono tracking-wider text-cyan-400">
                CAMPUS TRUST · COMMAND CENTER
              </p>
              <h2 className="text-lg font-bold text-white tracking-tight">{activePage}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Switch to Intro Showcase Button */}
            <button
              onClick={() => setViewMode("intro")}
              className="flex items-center gap-1.5 rounded-xl liquid-glass px-3 py-1.5 text-xs text-cyan-300 hover:text-white border-white/10 hover:border-cyan-500/40 transition cursor-pointer shadow-sm"
              title="View Apple-style Cinematic Showcase"
            >
              <Sparkles size={14} className="text-cyan-400" />
              <span className="hidden sm:inline">Showcase</span>
            </button>

            {/* Quick Search */}
            <div className="hidden items-center gap-2 rounded-xl bg-slate-950/60 border border-white/10 px-3 py-1.5 md:flex">
              <Search size={15} className="text-slate-400" />
              <span className="text-xs text-slate-400">Search security matrix...</span>
              <span className="rounded bg-white/5 border border-white/10 px-1.5 py-0.5 text-[9px] font-mono text-slate-400">/</span>
            </div>

            {/* Bell Alert */}
            <button
              aria-label="Notifications"
              className="relative rounded-xl p-2 text-slate-400 hover:bg-white/[0.05] hover:text-white transition cursor-pointer"
            >
              <Bell size={18} />
              {(stats?.openRisks ?? 0) > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#030712]" />
              )}
            </button>

            <div className="hidden h-7 border-l border-white/10 sm:block" />

            {/* Persona Switcher Dropdown (Liquid Glass) */}
            <div className="relative">
              <button
                onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
                className="flex items-center gap-2.5 rounded-xl p-1.5 hover:bg-white/[0.05] transition cursor-pointer border border-transparent hover:border-white/10"
                aria-label="Switch active persona"
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl font-bold text-xs ${currentPersona.avatarBg}`}>
                  {currentPersona.initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-white leading-tight">{currentPersona.name}</p>
                  <p className="text-[10px] text-cyan-400/80 font-mono leading-tight">{currentPersona.role}</p>
                </div>
                <ChevronDown size={14} className="hidden text-slate-400 sm:block" />
              </button>

              {personaMenuOpen && (
                <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl liquid-glass p-2 border border-white/15 shadow-2xl animate-in fade-in slide-in-from-top-2">
                  <div className="border-b border-white/10 px-3 py-2">
                    <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Demonstration Persona (RBAC)
                    </p>
                    <p className="text-xs font-bold text-cyan-300 mt-0.5">{currentPersona.role}</p>
                  </div>
                  <div className="mt-1 space-y-1">
                    {DEMO_PERSONAS.map((persona) => (
                      <button
                        key={persona.role}
                        onClick={() => {
                          setCurrentPersona(persona);
                          setPersonaMenuOpen(false);
                        }}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs transition cursor-pointer ${
                          currentPersona.role === persona.role
                            ? "bg-cyan-500/15 font-semibold text-cyan-200 border border-cyan-500/30"
                            : "text-slate-300 hover:bg-white/[0.05]"
                        }`}
                      >
                        <div className={`flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold ${persona.avatarBg}`}>
                          {persona.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{persona.name}</p>
                          <p className="text-[10px] text-slate-400 truncate font-mono">{persona.title}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="mx-auto max-w-[1500px] p-5 sm:p-8">
          {isDashboard ? (
            <>
              {/* Dashboard Sub-Banner */}
              <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold text-cyan-300 border border-cyan-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400 animate-pulse" />
                    ACADEMIC VIVA DEMO READY
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-[28px]">
                    Security Command Overview
                  </h1>
                  <p className="mt-1 text-xs text-slate-400">
                    Live telemetry posture, identity access review status, and automated risk scoring.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <Clock3 size={15} className="text-cyan-400" /> Last updated: {currentTime || "Live"}
                </div>
              </div>

              {loading && <p className="mb-5 text-xs text-slate-400">Loading security state...</p>}
              {error && <p className="mb-5 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-300">{error}</p>}

              {stats && (
                <>
                  {/* Top 4 Stat Cards */}
                  <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                      title="Total Identities"
                      value={stats.totalUsers}
                      note="Registered campus accounts"
                      icon={Users}
                      tone="bg-blue-500/10 text-blue-400"
                      glow="glow-blue"
                    />
                    <StatCard
                      title="Monitored Assets"
                      value={stats.totalAssets}
                      note="Digital systems in scope"
                      icon={LockKeyhole}
                      tone="bg-purple-500/10 text-purple-400"
                    />
                    <StatCard
                      title="Open Risks"
                      value={stats.openRisks}
                      note="Findings awaiting remediation"
                      icon={ShieldAlert}
                      tone="bg-red-500/10 text-red-400"
                      glow="glow-red"
                      trend="up"
                    />
                    <StatCard
                      title="Resolved Risks"
                      value={stats.resolvedRisks}
                      note="Remediation closed"
                      icon={ShieldCheck}
                      tone="bg-emerald-500/10 text-emerald-400"
                      glow="glow-emerald"
                      trend="down"
                    />
                  </div>

                  {/* Mid Row: Severity Donut + Security Posture Ring */}
                  <div className="mb-6 grid gap-6 xl:grid-cols-3">
                    {/* Risk Distribution Chart */}
                    <section className="rounded-2xl liquid-glass p-6 border border-white/10 shadow-xl xl:col-span-2">
                      <div>
                        <h3 className="font-bold text-white">Risk Distribution</h3>
                        <p className="mt-1 text-xs text-slate-400">Findings grouped by severity level</p>
                      </div>
                      <div className="mt-5 grid items-center gap-6 sm:grid-cols-2">
                        <div className="relative h-[220px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={riskData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={66}
                                outerRadius={94}
                                paddingAngle={4}
                                stroke="none"
                              >
                                {riskData.map((entry: any) => (
                                  <Cell key={entry.name} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                                  borderColor: "rgba(255, 255, 255, 0.15)",
                                  borderRadius: "12px",
                                  fontSize: "12px",
                                  color: "#ffffff",
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-extrabold text-white">{totalFindings}</span>
                            <span className="text-[10px] text-slate-400 font-mono">Total findings</span>
                          </div>
                        </div>

                        <div className="space-y-3.5">
                          {riskData.map((risk: any) => (
                            <div key={risk.name}>
                              <div className="mb-1 flex items-center justify-between text-xs">
                                <span className="flex items-center gap-2 font-medium text-slate-300">
                                  <span
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: risk.color }}
                                  />
                                  {risk.name} Severity
                                </span>
                                <span className="font-bold text-white font-mono">{risk.value}</span>
                              </div>
                              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${totalFindings ? (risk.value / totalFindings) * 100 : 0}%`,
                                    backgroundColor: risk.color,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>

                    {/* Security Posture Index */}
                    <section className="rounded-2xl liquid-glass p-6 border border-white/10 shadow-xl flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-white">Security Posture Score</h3>
                          <p className="mt-1 text-xs text-slate-400">Calculated campus risk index</p>
                        </div>
                        <ShieldCheck className="text-cyan-400" size={22} />
                      </div>

                      <div className="my-6 text-center">
                        <div
                          className={`mx-auto flex h-32 w-32 items-center justify-center rounded-full border-[8px] transition-all duration-700 ${
                            (stats.postureScore ?? 100) >= 80
                              ? "border-emerald-500/30 text-emerald-400 glow-emerald"
                              : (stats.postureScore ?? 100) >= 60
                              ? "border-amber-500/30 text-amber-400"
                              : "border-red-500/30 text-red-400 glow-red"
                          }`}
                        >
                          <div>
                            <p className="text-4xl font-extrabold tracking-tight text-white">
                              {stats.postureScore ?? 100}%
                            </p>
                            <p className="text-[9px] font-mono uppercase tracking-wider text-slate-400 mt-0.5">
                              {(stats.postureScore ?? 100) >= 80 ? "Healthy" : (stats.postureScore ?? 100) >= 60 ? "Moderate" : "Elevated Risk"}
                            </p>
                          </div>
                        </div>

                        <p className="mt-4 text-xs font-semibold text-slate-200">
                          {(stats.postureScore ?? 100) >= 80 ? "Campus Baseline Secure" : "Remediation In Progress"}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          {stats.openRisks} active risk findings impacting posture
                        </p>
                      </div>

                      <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs leading-5 text-amber-300">
                        <span className="font-bold text-amber-200">Priority:</span> {riskData.find((r: any) => r.name === "Critical")?.value ?? 0} critical risks awaiting review.
                      </div>
                    </section>
                  </div>

                  {/* Department Risk Exposure */}
                  {dashboard.departmentRisks && (
                    <section className="mb-6 rounded-2xl liquid-glass p-6 border border-white/10 shadow-xl">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-white">Department Risk Exposure</h3>
                          <p className="mt-1 text-xs text-slate-400">Active identity findings categorized across campus departments</p>
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {dashboard.departmentRisks.map((d: any) => (
                          <div key={d.code} className="rounded-xl bg-white/[0.03] border border-white/5 p-4 hover:border-cyan-500/30 transition">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-white text-xs">{d.department}</span>
                              <span className="font-mono text-[10px] text-cyan-400">[{d.code}]</span>
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                              <span className="text-[11px] text-slate-400">{d.userCount} identities</span>
                              <span
                                className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                                  d.riskCount > 0
                                    ? "bg-red-500/10 text-red-300 border-red-500/30"
                                    : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                                }`}
                              >
                                {d.riskCount} {d.riskCount === 1 ? "finding" : "findings"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Bottom Row: Recent Findings & Recent Activities */}
                  <div className="grid gap-6 xl:grid-cols-3">
                    {/* Findings Table */}
                    <section className="overflow-hidden rounded-2xl liquid-glass border border-white/10 shadow-xl xl:col-span-2">
                      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                        <div>
                          <h3 className="font-bold text-white">Recent Security Findings</h3>
                          <p className="mt-1 text-xs text-slate-400">Latest issues detected across digital assets</p>
                        </div>
                        <button
                          onClick={() => setActivePage("Risk Register")}
                          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
                        >
                          View all →
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[650px] text-left text-xs">
                          <thead className="border-b border-white/10 text-[10px] uppercase tracking-wider text-slate-400">
                            <tr>
                              <th className="px-5 py-3 font-semibold">Finding</th>
                              <th className="px-4 py-3 font-semibold">Asset</th>
                              <th className="px-4 py-3 font-semibold">Owner</th>
                              <th className="px-4 py-3 font-semibold">Severity</th>
                              <th className="px-4 py-3 font-semibold">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {dashboard.recentFindings.map((finding: any) => (
                              <tr key={finding.id} className="hover:bg-white/[0.04] transition">
                                <td className="px-5 py-4">
                                  <p className="font-semibold text-white">{finding.title}</p>
                                  <p className="mt-1 text-[10px] font-mono text-cyan-400">{finding.findingCode}</p>
                                </td>
                                <td className="px-4 py-4 text-slate-300">{finding.asset?.name ?? "—"}</td>
                                <td className="px-4 py-4 text-slate-300">{finding.user?.fullName ?? "—"}</td>
                                <td className="px-4 py-4">
                                  <span
                                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                                      finding.severity === "CRITICAL"
                                        ? "bg-red-500/10 text-red-300 border-red-500/30"
                                        : finding.severity === "HIGH"
                                        ? "bg-orange-500/10 text-orange-300 border-orange-500/30"
                                        : finding.severity === "MEDIUM"
                                        ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                                        : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                                    }`}
                                  >
                                    {finding.severity}
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-slate-300 font-mono text-[11px]">{finding.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>

                    {/* Recent Activity Feed */}
                    <section className="rounded-2xl liquid-glass p-6 border border-white/10 shadow-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-white">Telemetry Stream</h3>
                          <p className="mt-1 text-xs text-slate-400">Latest security audit events</p>
                        </div>
                        <Activity size={18} className="text-cyan-400" />
                      </div>

                      <div className="mt-5 space-y-4">
                        {dashboard.recentActivities.map((activity: any) => {
                          const style = activityStyle(activity.eventType);
                          const Icon = style.icon;
                          return (
                            <div key={activity.id} className="flex gap-3">
                              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${style.color}`}>
                                <Icon size={16} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-white">{activity.action}</p>
                                <p className="mt-0.5 truncate text-[11px] text-slate-400">{activity.description}</p>
                                <p className="mt-1 text-[10px] text-slate-400 font-mono">{getTime(activity.createdAt)}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-5 border-t border-white/10 pt-4">
                        <button
                          onClick={() => setActivePage("Activity Monitoring")}
                          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
                        >
                          View telemetry console →
                        </button>
                      </div>
                    </section>
                  </div>
                </>
              )}

              <p className="mt-8 text-center text-[10px] text-slate-400 font-mono">
                CampusTrust · Academic MIS Prototype · All displayed records are fictional demonstration data.
              </p>
            </>
          ) : activePage === "Security Topology Graph" ? (
            <SecurityNetworkGraph />
          ) : activePage === "Identity Management" ? (
            <IdentityManagement />
          ) : activePage === "Asset Inventory" ? (
            <AssetInventory />
          ) : activePage === "Access Reviews" ? (
            <AccessReviews />
          ) : activePage === "Risk Register" ? (
            <RiskRegister />
          ) : activePage === "Activity Monitoring" ? (
            <ActivityMonitoring />
          ) : activePage === "Incident Management" ? (
            <IncidentManagement />
          ) : activePage === "Reports" ? (
            <ReportsModule />
          ) : null}
        </div>
      </main>

      {/* Settings & Demo Data Factory Reset Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl liquid-glass p-6 border border-white/15 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-sm">System Settings & Data Controls</h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3.5 space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Application:</span>
                  <span className="font-semibold text-white">CampusTrust v2.0 Liquid Glass</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Case Study:</span>
                  <span className="font-semibold text-cyan-300">SRMIST KTR (Fictionalized)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Database Engine:</span>
                  <span className="font-mono text-slate-300">SQLite + Prisma ORM</span>
                </div>
              </div>

              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-red-200">
                <h4 className="font-bold flex items-center gap-1.5 text-xs text-red-300">
                  <AlertTriangle size={15} />
                  Factory Seed Database Reset
                </h4>
                <p className="mt-1 text-[11px] text-red-300/80 leading-relaxed">
                  Reset all entities (users, assets, access grants, risk findings, incidents, and activity logs) back to the clean baseline demonstration state.
                </p>
                <button
                  type="button"
                  onClick={handleResetDb}
                  disabled={resettingDb}
                  className="mt-3 w-full rounded-xl bg-red-600/80 hover:bg-red-500 px-4 py-2 font-bold text-xs text-white transition disabled:opacity-50"
                >
                  {resettingDb ? "Resetting Database..." : "Reset to Factory Seed"}
                </button>
              </div>

              <div className="flex justify-end pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs text-slate-300 hover:bg-white/5"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Viva Demo Walkthrough Guide Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl liquid-glass p-6 border border-white/15 shadow-2xl">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck size={18} className="text-cyan-400" />
                  CampusTrust Viva & Presentation Walkthrough Script
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Recommended live demonstration sequence for final-year project evaluation.
                </p>
              </div>
              <button onClick={() => setShowHelpModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3.5 space-y-2">
                <h4 className="font-bold text-cyan-300">1. Security Overview & Dynamic Posture</h4>
                <p className="text-slate-400 text-[11px]">
                  Start on the Dashboard. Point out the live database metrics, the dynamic Security Posture Gauge, and the Department Risk Exposure cards for CSE, ECE, ADM, and LIB.
                </p>
              </div>

              <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3.5 space-y-2">
                <h4 className="font-bold text-cyan-300">2. Interactive Security Topology Graph</h4>
                <p className="text-slate-400 text-[11px]">
                  Open "Security Topology Graph". Show the visual mapping of students, faculty, and systems. Highlight the pulsing red line pointing out Aarav Sharma's out-of-role admin access on the Research Repository.
                </p>
              </div>

              <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3.5 space-y-2">
                <h4 className="font-bold text-cyan-300">3. Access Matrix & Out-of-Role Detection</h4>
                <p className="text-slate-400 text-[11px]">
                  Navigate to "Access Reviews". Show how CampusTrust flags unexpected out-of-role permissions. Demonstrate the "Certify Access" and "Revoke" controls.
                </p>
              </div>

              <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3.5 space-y-2">
                <h4 className="font-bold text-cyan-300">4. Deterministic Risk Assessment Engine</h4>
                <p className="text-slate-400 text-[11px]">
                  Navigate to "Risk Register". Click "Recalculate Risk Engine". Explain the formula: Likelihood (1–5) × Impact (1–5) = Score (1–25). Show that repeated runs are idempotent and do not create duplicates.
                </p>
              </div>

              <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3.5 space-y-2">
                <h4 className="font-bold text-cyan-300">5. Escalation & Incident Mitigation Lifecycle</h4>
                <p className="text-slate-400 text-[11px]">
                  Click "Escalate" on finding RSK-024. Switch to "Incident Management", check off mitigation tasks, and click "Resolve & Close". Show that closing the incident automatically marks the linked risk finding as resolved!
                </p>
              </div>

              <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3.5 space-y-2">
                <h4 className="font-bold text-cyan-300">6. Security Telemetry Simulator</h4>
                <p className="text-slate-400 text-[11px]">
                  Navigate to "Activity Monitoring". Click "Simulate Event" and trigger a 3-burst failed login attempt to show real-time telemetry feeding into rule LG-01.
                </p>
              </div>

              <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3.5 space-y-2">
                <h4 className="font-bold text-cyan-300">7. Executive Reporting & Role Switcher</h4>
                <p className="text-slate-400 text-[11px]">
                  Open "Reports" and download the Risk Register CSV. Finally, use the header profile dropdown to switch to "Security Analyst" or "Student" to demonstrate Role-Based Access Control (RBAC).
                </p>
              </div>

              <div className="flex justify-end pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowHelpModal(false)}
                  className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2 font-bold text-xs text-slate-950 hover:from-cyan-300 hover:to-blue-400"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
