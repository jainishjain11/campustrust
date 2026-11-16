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
import BackgroundOrbs from "@/components/background-orbs";
import GlassCard from "@/components/ui/glass-card";

import {
  Activity, AlertTriangle, ArrowDownRight, ArrowUpRight,
  Bell, CheckCircle2, ChevronDown, CircleHelp, Clock3,
  FileBarChart, Fingerprint, LayoutDashboard, LockKeyhole,
  Menu, Network, Search, Settings, Shield, ShieldAlert,
  ShieldCheck, Users, X, Sparkles, AlertOctagon,
  ExternalLink, Layers
} from "lucide-react";
import {
  Cell, Pie, PieChart, ResponsiveContainer, Tooltip,
} from "recharts";

const navigation = [
  { label: "Dashboard", shortLabel: "Dashboard", icon: LayoutDashboard },
  { label: "Security Topology Graph", shortLabel: "Graph", icon: Network },
  { label: "Identity Management", shortLabel: "Users", icon: Users },
  { label: "Asset Inventory", shortLabel: "Assets", icon: LockKeyhole },
  { label: "Access Reviews", shortLabel: "Access", icon: Fingerprint },
  { label: "Risk Register", shortLabel: "Risks", icon: ShieldAlert },
  { label: "Activity Monitoring", shortLabel: "Activity", icon: Activity },
  { label: "Incident Management", shortLabel: "Incidents", icon: AlertTriangle },
  { label: "Reports", shortLabel: "Reports", icon: FileBarChart },
];

// Core 5 items for mobile floating bottom bar
const mobileBottomNav = [
  { label: "Dashboard", shortLabel: "Dashboard", icon: LayoutDashboard },
  { label: "Identity Management", shortLabel: "Users", icon: Users },
  { label: "Access Reviews", shortLabel: "Access", icon: Fingerprint },
  { label: "Risk Register", shortLabel: "Risks", icon: ShieldAlert },
  { label: "Incident Management", shortLabel: "Incidents", icon: AlertTriangle },
];

const severityColors: Record<string, string> = {
  CRITICAL: "#F87171",
  HIGH: "#FDA672",
  MEDIUM: "#FCD34D",
  LOW: "#6EE7B7",
};

function StatCard({
  title, value, note, icon: Icon, tone, glow, trend,
}: {
  title: string;
  value: string | number;
  note: string;
  icon: React.ElementType;
  tone: string;
  glow?: "none" | "blue" | "sky" | "cyan" | "critical" | "warning" | "emerald";
  trend?: "up" | "down";
}) {
  return (
    <GlassCard glow={glow} className="p-5 sm:p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-300/80">{title}</p>
          <p className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-white tabular-nums">
            {value}
          </p>
        </div>
        <div className={`rounded-2xl p-3 ${tone} border border-white/15 shadow-sm`}>
          <Icon size={22} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-300 font-mono">
        {trend === "up" ? <ArrowUpRight size={15} className="text-[#F87171]" /> :
          trend === "down" ? <ArrowDownRight size={15} className="text-[#6EE7B7]" /> : null}
        <span className="truncate">{note}</span>
      </div>
    </GlassCard>
  );
}

const DEMO_PERSONAS = [
  {
    name: "Campus Administrator",
    role: "ADMIN",
    title: "System Administrator",
    initials: "AD",
    email: "admin@example.edu",
    avatarBg: "bg-gradient-to-tr from-blue-600 to-sky-400 text-white",
    badgeColor: "bg-blue-500/15 text-blue-200 border-blue-400/30",
  },
  {
    name: "Security Analyst",
    role: "SECURITY_ANALYST",
    title: "SOC Lead Analyst",
    initials: "SA",
    email: "analyst@example.edu",
    avatarBg: "bg-gradient-to-tr from-indigo-600 to-blue-500 text-white",
    badgeColor: "bg-indigo-500/15 text-indigo-200 border-indigo-400/30",
  },
  {
    name: "Dr. Priya Nair",
    role: "FACULTY",
    title: "Department Manager (ECE)",
    initials: "PN",
    email: "priya@example.edu",
    avatarBg: "bg-gradient-to-tr from-amber-500 to-orange-400 text-white",
    badgeColor: "bg-amber-500/15 text-amber-200 border-amber-400/30",
  },
  {
    name: "Rahul Mehta",
    role: "STUDENT",
    title: "Student Account (Read-Only)",
    initials: "RM",
    email: "rahul@example.edu",
    avatarBg: "bg-gradient-to-tr from-cyan-600 to-teal-400 text-white",
    badgeColor: "bg-teal-500/15 text-teal-200 border-teal-400/30",
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
    severityKey: risk.severity,
    value: risk.count,
    color: severityColors[risk.severity] || "#60A5FA",
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
      return { icon: AlertTriangle, color: "text-[#F87171] bg-red-500/15 border border-red-500/30" };
    }
    if (type.includes("REVIEW")) {
      return { icon: CheckCircle2, color: "text-[#6EE7B7] bg-emerald-500/15 border border-emerald-500/30" };
    }
    return { icon: Activity, color: "text-[#60A5FA] bg-blue-500/15 border border-blue-500/30" };
  };

  return (
    <div className="relative min-h-screen bg-[#0A1530] text-[#F5F8FF] selection:bg-blue-500/30 selection:text-white">
      {/* Three subtle drifting ambient background orbs */}
      <BackgroundOrbs />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop Floating Glass Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col glass-raised border-r border-white/15 transition-transform duration-300 ease-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
      >
        {/* Brand Logo Header */}
        <div className="flex h-[80px] items-center gap-3.5 border-b border-white/10 px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#3B82F6] to-[#60A5FA] text-white font-bold shadow-lg shadow-blue-500/30 border border-white/20">
            <Shield size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              CampusTrust
            </h1>
            <p className="text-[10px] font-mono tracking-wider text-[#60A5FA]">
              IDENTITY & ACCESS MIS
            </p>
          </div>
          <button
            className="ml-auto text-slate-300 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Prototype notice pill in sidebar */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-400/25 px-3 py-1 text-[11px] text-[#7DD3FC]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#60A5FA] animate-pulse" />
            <span className="font-medium tracking-wide">Prototype – Simulated Data</span>
          </div>
        </div>

        {/* Navigation list */}
        <div className="px-4 pt-4 overflow-y-auto flex-1">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[2px] text-slate-300/70 font-mono">
            Navigation Modules
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
                  className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left text-xs font-medium transition-all duration-200 cursor-pointer ${active
                      ? "lens-highlight text-white font-semibold shadow-md shadow-blue-950/40"
                      : "text-slate-300/80 hover:bg-white/[0.08] hover:text-white"
                    }`}
                >
                  <Icon size={17} className={active ? "text-[#60A5FA]" : "text-slate-400"} />
                  <span>{item.label}</span>
                  {item.label === "Risk Register" && (stats?.openRisks ?? 0) > 0 && (
                    <span className="ml-auto rounded-full bg-red-500/20 border border-red-500/40 px-2 py-0.5 text-[9px] font-bold text-[#F87171] tabular-nums">
                      {stats?.openRisks}
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
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs text-slate-300 hover:bg-white/[0.08] hover:text-white transition cursor-pointer"
          >
            <Settings size={16} className="text-slate-400" /> Settings & Reset
          </button>
          <button
            onClick={() => setShowHelpModal(true)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs text-slate-300 hover:bg-white/[0.08] hover:text-white transition cursor-pointer"
          >
            <CircleHelp size={16} className="text-slate-400" /> Viva Demo Guide
          </button>

          <div className="mt-2 flex items-center gap-3 rounded-2xl glass p-3 border border-white/15">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl font-bold text-xs shrink-0 shadow-sm ${currentPersona.avatarBg}`}>
              {currentPersona.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{currentPersona.name}</p>
              <p className="text-[10px] text-slate-300/80 truncate font-mono">{currentPersona.title}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Command Center Workspace */}
      <main className="min-h-screen lg:ml-[280px] pb-28 lg:pb-10 relative z-10">
        {/* Floating Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-[80px] items-center justify-between border-b border-white/12 glass-raised px-5 sm:px-8">
          <div className="flex items-center gap-3.5">
            <button
              className="rounded-xl p-2 text-slate-300 hover:bg-white/10 hover:text-white lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation drawer"
            >
              <Menu size={22} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#60A5FA] animate-pulse" />
                <p className="text-[10px] font-mono tracking-wider uppercase text-[#7DD3FC]">
                  CAMPUS TRUST · LIQUID GLASS MIS
                </p>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">{activePage}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Prototype notice badge for desktop */}
            <div className="hidden xl:flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-400/25 px-3 py-1 text-xs text-[#7DD3FC]">
              <span className="font-medium">Prototype – Simulated Data</span>
            </div>

            {/* Switch to Intro Showcase Button */}
            <button
              onClick={() => setViewMode("intro")}
              className="flex items-center gap-1.5 rounded-full btn-secondary-glass px-3.5 py-1.5 text-xs text-white transition cursor-pointer"
              title="View Apple-style Cinematic Showcase"
            >
              <Sparkles size={14} className="text-[#60A5FA]" />
              <span className="hidden sm:inline">Showcase</span>
            </button>

            {/* Quick Search trigger */}
            <div className="hidden items-center gap-2 rounded-full glass px-3.5 py-1.5 md:flex border border-white/15">
              <Search size={14} className="text-slate-400" />
              <span className="text-xs text-slate-300/80">Search security matrix...</span>
              <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-mono text-slate-300">/</span>
            </div>

            {/* Notification Bell */}
            <button
              aria-label="Security notifications"
              className="relative rounded-full p-2.5 text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
            >
              <Bell size={18} />
              {(stats?.openRisks ?? 0) > 0 && (
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#F87171] ring-2 ring-[#0A1530]" />
              )}
            </button>

            <div className="hidden h-7 border-l border-white/12 sm:block" />

            {/* Persona Switcher Dropdown (Liquid Glass) */}
            <div className="relative">
              <button
                onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
                className="flex items-center gap-2.5 rounded-2xl p-1.5 hover:bg-white/10 transition cursor-pointer border border-transparent hover:border-white/15"
                aria-label="Switch active persona"
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl font-bold text-xs shadow-sm ${currentPersona.avatarBg}`}>
                  {currentPersona.initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-white leading-tight">{currentPersona.name}</p>
                  <p className="text-[10px] text-[#7DD3FC] font-mono leading-tight">{currentPersona.role}</p>
                </div>
                <ChevronDown size={14} className="hidden text-slate-400 sm:block" />
              </button>

              {personaMenuOpen && (
                <div className="absolute right-0 top-12 z-50 w-72 rounded-[24px] glass-raised p-2.5 border border-white/20 shadow-2xl animate-in fade-in slide-in-from-top-2">
                  <div className="border-b border-white/10 px-3 py-2.5">
                    <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300/80">
                      Demonstration Persona (RBAC)
                    </p>
                    <p className="text-xs font-bold text-[#60A5FA] mt-0.5">{currentPersona.role}</p>
                  </div>
                  <div className="mt-1 space-y-1">
                    {DEMO_PERSONAS.map((persona) => (
                      <button
                        key={persona.role}
                        onClick={() => {
                          setCurrentPersona(persona);
                          setPersonaMenuOpen(false);
                        }}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs transition cursor-pointer ${currentPersona.role === persona.role
                            ? "bg-blue-500/20 font-semibold text-white border border-blue-400/40"
                            : "text-slate-300 hover:bg-white/[0.08]"
                          }`}
                      >
                        <div className={`flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold ${persona.avatarBg}`}>
                          {persona.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold">{persona.name}</p>
                          <p className="text-[10px] text-slate-300/70 truncate font-mono">{persona.title}</p>
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
        <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
          {isDashboard ? (
            <>
              {/* Dashboard Sub-Banner */}
              <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-[#7DD3FC] border border-blue-400/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#60A5FA] shadow-sm shadow-blue-400 animate-pulse" />
                    ACADEMIC VIVA DEMO READY
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    Security Command Overview
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-slate-300/80">
                    Live telemetry posture, identity access review status, and automated risk scoring.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
                  <Clock3 size={15} className="text-[#60A5FA]" /> Last updated: {currentTime || "Live"}
                </div>
              </div>

              {loading && <p className="mb-5 text-xs text-slate-300">Loading security state...</p>}
              {error && <p className="mb-5 rounded-2xl bg-red-500/15 border border-red-500/30 p-4 text-xs text-[#F87171]">{error}</p>}

              {stats && (
                <>
                  {/* Top 4 Stat Cards */}
                  <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                      title="Total Identities"
                      value={stats.totalUsers}
                      note="Registered campus accounts"
                      icon={Users}
                      tone="bg-blue-500/20 text-[#60A5FA]"
                      glow="blue"
                    />
                    <StatCard
                      title="Monitored Assets"
                      value={stats.totalAssets}
                      note="Digital systems in scope"
                      icon={LockKeyhole}
                      tone="bg-indigo-500/20 text-[#7DD3FC]"
                      glow="sky"
                    />
                    <StatCard
                      title="Open Risks"
                      value={stats.openRisks}
                      note="Findings awaiting remediation"
                      icon={ShieldAlert}
                      tone="bg-red-500/20 text-[#F87171]"
                      glow="critical"
                      trend="up"
                    />
                    <StatCard
                      title="Resolved Risks"
                      value={stats.resolvedRisks}
                      note="Remediation closed"
                      icon={ShieldCheck}
                      tone="bg-emerald-500/20 text-[#6EE7B7]"
                      glow="emerald"
                      trend="down"
                    />
                  </div>

                  {/* Mid Row: Severity Donut + Security Posture Ring */}
                  <div className="mb-6 grid gap-6 xl:grid-cols-3">
                    {/* Risk Distribution Chart */}
                    <GlassCard className="xl:col-span-2 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-bold text-white">Risk Distribution</h3>
                          <p className="mt-0.5 text-xs text-slate-300/80">Findings grouped by severity level</p>
                        </div>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-mono text-slate-300 border border-white/15">
                          {totalFindings} Findings
                        </span>
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
                                  backgroundColor: "rgba(10, 21, 48, 0.90)",
                                  backdropFilter: "blur(20px)",
                                  borderColor: "rgba(255, 255, 255, 0.18)",
                                  borderRadius: "16px",
                                  boxShadow: "0 16px 36px -8px rgba(10, 25, 60, 0.5)",
                                  fontSize: "12px",
                                  color: "#ffffff",
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-extrabold text-white tabular-nums">{totalFindings}</span>
                            <span className="text-[10px] text-slate-300/80 font-mono uppercase tracking-wider">Total findings</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {riskData.map((risk: any) => (
                            <div key={risk.name} className="rounded-xl bg-white/[0.04] p-2.5 border border-white/5">
                              <div className="mb-1.5 flex items-center justify-between text-xs">
                                <span className="flex items-center gap-2 font-medium text-slate-200">
                                  <span
                                    className="h-2.5 w-2.5 rounded-full shadow-sm"
                                    style={{ backgroundColor: risk.color }}
                                  />
                                  {risk.name} Severity
                                </span>
                                <span className="font-bold text-white font-mono tabular-nums">{risk.value}</span>
                              </div>
                              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
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
                    </GlassCard>

                    {/* Security Posture Index */}
                    <GlassCard className="p-6 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-bold text-white">Security Posture Score</h3>
                          <p className="mt-0.5 text-xs text-slate-300/80">Calculated campus risk index</p>
                        </div>
                        <ShieldCheck className="text-[#60A5FA]" size={22} />
                      </div>

                      <div className="my-6 text-center">
                        <div
                          className={`mx-auto flex h-36 w-36 items-center justify-center rounded-full border-[8px] transition-all duration-700 shadow-xl ${(stats.postureScore ?? 100) >= 80
                              ? "border-emerald-500/35 text-[#6EE7B7] shadow-emerald-500/20"
                              : (stats.postureScore ?? 100) >= 60
                                ? "border-amber-500/35 text-[#FCD34D] shadow-amber-500/20"
                                : "border-red-500/35 text-[#F87171] shadow-red-500/20"
                            }`}
                        >
                          <div>
                            <p className="text-4xl font-extrabold tracking-tight text-white tabular-nums">
                              {stats.postureScore ?? 100}%
                            </p>
                            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-300/80 mt-0.5">
                              {(stats.postureScore ?? 100) >= 80 ? "Healthy" : (stats.postureScore ?? 100) >= 60 ? "Moderate" : "Elevated Risk"}
                            </p>
                          </div>
                        </div>

                        <p className="mt-4 text-xs font-semibold text-slate-100">
                          {(stats.postureScore ?? 100) >= 80 ? "Campus Baseline Secure" : "Remediation In Progress"}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-300/80">
                          {stats.openRisks} active risk findings impacting posture
                        </p>
                      </div>

                      <div className="rounded-2xl bg-amber-500/10 border border-amber-500/25 p-3.5 text-xs leading-5 text-amber-200">
                        <span className="font-bold text-amber-100">Action:</span> {riskData.find((r: any) => r.name === "Critical")?.value ?? 0} critical risks requiring mitigation.
                      </div>
                    </GlassCard>
                  </div>

                  {/* Department Risk Exposure */}
                  {dashboard.departmentRisks && (
                    <GlassCard className="mb-6 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-base font-bold text-white">Department Risk Exposure</h3>
                          <p className="mt-0.5 text-xs text-slate-300/80">Active identity findings categorized across campus departments</p>
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {dashboard.departmentRisks.map((d: any) => (
                          <div key={d.code} className="rounded-2xl bg-white/[0.04] border border-white/10 p-4 hover:border-blue-400/40 hover:bg-white/[0.07] transition-all">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-white text-xs">{d.department}</span>
                              <span className="font-mono text-[10px] text-[#7DD3FC]">[{d.code}]</span>
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                              <span className="text-xs text-slate-300/80 tabular-nums">{d.userCount} identities</span>
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border tabular-nums ${d.riskCount > 0
                                    ? "bg-red-500/15 text-[#F87171] border-red-500/35"
                                    : "bg-emerald-500/15 text-[#6EE7B7] border-emerald-500/35"
                                  }`}
                              >
                                {d.riskCount} {d.riskCount === 1 ? "finding" : "findings"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  )}

                  {/* Bottom Row: Recent Findings & Recent Activities */}
                  <div className="grid gap-6 xl:grid-cols-3">
                    {/* Findings Table */}
                    <GlassCard className="overflow-hidden p-0 xl:col-span-2">
                      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                        <div>
                          <h3 className="text-base font-bold text-white">Recent Security Findings</h3>
                          <p className="mt-0.5 text-xs text-slate-300/80">Latest issues detected across digital assets</p>
                        </div>
                        <button
                          onClick={() => setActivePage("Risk Register")}
                          className="text-xs font-semibold text-[#60A5FA] hover:text-white transition cursor-pointer"
                        >
                          View all →
                        </button>
                      </div>

                      {/* Desktop Table View */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="border-b border-white/10 text-[10px] uppercase tracking-wider text-slate-300/70 bg-white/[0.02]">
                            <tr>
                              <th className="px-5 py-3.5 font-semibold">Finding</th>
                              <th className="px-4 py-3.5 font-semibold">Asset</th>
                              <th className="px-4 py-3.5 font-semibold">Owner</th>
                              <th className="px-4 py-3.5 font-semibold">Severity</th>
                              <th className="px-4 py-3.5 font-semibold">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {dashboard.recentFindings.map((finding: any) => (
                              <tr key={finding.id} className="hover:bg-white/[0.05] transition">
                                <td className="px-5 py-3.5">
                                  <p className="font-semibold text-white">{finding.title}</p>
                                  <p className="mt-0.5 text-[10px] font-mono text-[#7DD3FC]">{finding.findingCode}</p>
                                </td>
                                <td className="px-4 py-3.5 text-slate-300">{finding.asset?.name ?? "—"}</td>
                                <td className="px-4 py-3.5 text-slate-300">{finding.user?.fullName ?? "—"}</td>
                                <td className="px-4 py-3.5">
                                  <span
                                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${finding.severity === "CRITICAL"
                                        ? "bg-red-500/15 text-[#F87171] border-red-500/35"
                                        : finding.severity === "HIGH"
                                          ? "bg-orange-500/15 text-[#FDA672] border-orange-500/35"
                                          : finding.severity === "MEDIUM"
                                            ? "bg-amber-500/15 text-[#FCD34D] border-amber-500/35"
                                            : "bg-emerald-500/15 text-[#6EE7B7] border-emerald-500/35"
                                      }`}
                                  >
                                    {finding.severity}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5 text-slate-300 font-mono text-[11px]">{finding.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Stacked Responsive Cards */}
                      <div className="md:hidden divide-y divide-white/5 p-4 space-y-3">
                        {dashboard.recentFindings.map((finding: any) => (
                          <div key={finding.id} className="rounded-2xl bg-white/[0.03] p-3.5 border border-white/5 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-semibold text-white text-xs">{finding.title}</p>
                                <p className="text-[10px] font-mono text-[#7DD3FC]">{finding.findingCode}</p>
                              </div>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[9px] font-bold border shrink-0 ${finding.severity === "CRITICAL"
                                    ? "bg-red-500/15 text-[#F87171] border-red-500/35"
                                    : finding.severity === "HIGH"
                                      ? "bg-orange-500/15 text-[#FDA672] border-orange-500/35"
                                      : finding.severity === "MEDIUM"
                                        ? "bg-amber-500/15 text-[#FCD34D] border-amber-500/35"
                                        : "bg-emerald-500/15 text-[#6EE7B7] border-emerald-500/35"
                                  }`}
                              >
                                {finding.severity}
                              </span>
                            </div>
                            <div className="flex justify-between text-[11px] text-slate-300">
                              <span>Asset: {finding.asset?.name ?? "—"}</span>
                              <span className="font-mono text-slate-400">{finding.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </GlassCard>

                    {/* Recent Activity Feed */}
                    <GlassCard className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-bold text-white">Telemetry Stream</h3>
                          <p className="mt-0.5 text-xs text-slate-300/80">Latest security audit events</p>
                        </div>
                        <Activity size={18} className="text-[#60A5FA]" />
                      </div>

                      <div className="mt-5 space-y-3.5">
                        {dashboard.recentActivities.map((activity: any) => {
                          const style = activityStyle(activity.eventType);
                          const Icon = style.icon;
                          return (
                            <div key={activity.id} className="flex gap-3 items-start rounded-xl p-2 hover:bg-white/[0.04] transition">
                              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${style.color}`}>
                                <Icon size={16} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-white">{activity.action}</p>
                                <p className="mt-0.5 truncate text-[11px] text-slate-300/80">{activity.description}</p>
                                <p className="mt-1 text-[10px] text-slate-400 font-mono">{getTime(activity.createdAt)}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-5 border-t border-white/10 pt-4">
                        <button
                          onClick={() => setActivePage("Activity Monitoring")}
                          className="text-xs font-semibold text-[#60A5FA] hover:text-white transition cursor-pointer"
                        >
                          View telemetry console →
                        </button>
                      </div>
                    </GlassCard>
                  </div>
                </>
              )}

              <p className="mt-8 text-center text-xs text-slate-400 font-mono">
                CampusTrust · University Identity & Access Risk MIS · Liquid Glass Architecture
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

      {/* Floating Mobile Bottom Navigation Bar (Dashboard, Users, Access, Risks, Incidents) */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-3 inset-x-3 z-40 lg:hidden rounded-[24px] glass-raised border border-white/20 p-1.5 shadow-2xl"
      >
        <div className="grid grid-cols-5 gap-1 items-center">
          {mobileBottomNav.map((item) => {
            const Icon = item.icon;
            const active = activePage === item.label;
            return (
              <button
                key={item.label}
                onClick={() => setActivePage(item.label)}
                className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 cursor-pointer ${active
                    ? "lens-highlight text-white"
                    : "text-slate-300/70 hover:text-white hover:bg-white/[0.06]"
                  }`}
              >
                <Icon size={18} className={active ? "text-[#60A5FA]" : "currentColor"} />
                <span className="text-[10px] font-medium tracking-tight mt-1 truncate max-w-full">
                  {item.shortLabel}
                </span>
                {item.label === "Risk Register" && (stats?.openRisks ?? 0) > 0 && (
                  <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-[#F87171] ring-1 ring-[#0A1530]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Settings & Demo Data Factory Reset Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1530]/80 p-4 backdrop-blur-md animate-in fade-in">
          <GlassCard variant="raised" className="w-full max-w-md p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-sm">System Settings & Data Controls</h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3.5 space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Application:</span>
                  <span className="font-semibold text-white">CampusTrust Liquid Glass v2.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Database Engine:</span>
                  <span className="font-mono text-slate-300">SQLite + Prisma ORM</span>
                </div>
              </div>

              <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-red-200">
                <h4 className="font-bold flex items-center gap-1.5 text-xs text-[#F87171]">
                  <AlertTriangle size={15} />
                  Factory Seed Database Reset
                </h4>
                <p className="mt-1 text-[11px] text-red-200/80 leading-relaxed">
                  Reset all entities (users, assets, access grants, risk findings, incidents, and activity logs) back to the clean baseline demonstration state.
                </p>
                <button
                  type="button"
                  onClick={handleResetDb}
                  disabled={resettingDb}
                  className="mt-3 w-full rounded-full bg-red-600/80 hover:bg-red-500 px-4 py-2 font-bold text-xs text-white transition disabled:opacity-50"
                >
                  {resettingDb ? "Resetting Database..." : "Reset to Factory Seed"}
                </button>
              </div>

              <div className="flex justify-end pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="btn-secondary-glass px-4 py-2 text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Viva Demo Walkthrough Guide Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1530]/80 p-4 backdrop-blur-md animate-in fade-in">
          <GlassCard variant="raised" className="w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 sm:p-7">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck size={18} className="text-[#60A5FA]" />
                  CampusTrust Viva & Presentation Walkthrough Script
                </h3>
                <p className="text-xs text-slate-300/80 mt-0.5">
                  Recommended live demonstration sequence for final-year project evaluation.
                </p>
              </div>
              <button onClick={() => setShowHelpModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs text-slate-300 leading-relaxed">
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3.5 space-y-1.5">
                <h4 className="font-bold text-[#7DD3FC]">1. Security Overview & Dynamic Posture</h4>
                <p className="text-slate-300/80 text-[11px]">
                  Start on the Dashboard. Point out the live database metrics, the dynamic Security Posture Gauge, and the Department Risk Exposure cards for CSE, ECE, ADM, and LIB.
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3.5 space-y-1.5">
                <h4 className="font-bold text-[#7DD3FC]">2. Interactive Security Topology Graph</h4>
                <p className="text-slate-300/80 text-[11px]">
                  Open "Security Topology Graph". Show the visual mapping of students, faculty, and systems. Highlight the pulsing red line pointing out Aarav Sharma's out-of-role admin access on the Research Repository.
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3.5 space-y-1.5">
                <h4 className="font-bold text-[#7DD3FC]">3. Access Matrix & Out-of-Role Detection</h4>
                <p className="text-slate-300/80 text-[11px]">
                  Navigate to "Access Reviews". Show how CampusTrust flags unexpected out-of-role permissions. Demonstrate the "Certify Access" and "Revoke" controls.
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3.5 space-y-1.5">
                <h4 className="font-bold text-[#7DD3FC]">4. Deterministic Risk Assessment Engine</h4>
                <p className="text-slate-300/80 text-[11px]">
                  Navigate to "Risk Register". Click "Recalculate Risk Engine". Explain the formula: Likelihood (1–5) × Impact (1–5) = Score (1–25). Inspect the 5×5 interactive risk heatmap matrix.
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3.5 space-y-1.5">
                <h4 className="font-bold text-[#7DD3FC]">5. Escalation & Incident Mitigation Lifecycle</h4>
                <p className="text-slate-300/80 text-[11px]">
                  Click "Escalate" on finding RSK-024. Switch to "Incident Management", check off mitigation tasks, and click "Resolve & Close". Show that closing the incident automatically marks the linked risk finding as resolved!
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3.5 space-y-1.5">
                <h4 className="font-bold text-[#7DD3FC]">6. Security Telemetry Simulator</h4>
                <p className="text-slate-300/80 text-[11px]">
                  Navigate to "Activity Monitoring". Click "Simulate Event" and trigger a 3-burst failed login attempt to show real-time telemetry feeding into rule LG-01.
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3.5 space-y-1.5">
                <h4 className="font-bold text-[#7DD3FC]">7. Executive Reporting & Role Switcher</h4>
                <p className="text-slate-300/80 text-[11px]">
                  Open "Reports" and download the Risk Register CSV. Finally, use the header profile dropdown to switch to "Security Analyst" or "Student" to demonstrate Role-Based Access Control (RBAC).
                </p>
              </div>

              <div className="flex justify-end pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowHelpModal(false)}
                  className="btn-primary-glass px-5 py-2 text-xs"
                >
                  Got It
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}