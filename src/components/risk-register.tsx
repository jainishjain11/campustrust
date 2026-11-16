"use client";

import { useEffect, useState } from "react";
import {
  ShieldAlert, ShieldCheck, AlertTriangle, RefreshCw,
  Search, Filter, Eye, AlertOctagon, CheckCircle2,
  X, ArrowUpRight, Plus, ExternalLink, Grid3X3, Layers
} from "lucide-react";
import GlassCard from "@/components/ui/glass-card";

type RiskFinding = {
  id: string;
  findingCode: string;
  title: string;
  description: string;
  category: string;
  likelihood: number;
  impact: number;
  score: number;
  severity: string;
  status: string;
  createdAt: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    department?: { name: string } | null;
  } | null;
  asset?: {
    id: string;
    name: string;
    code: string;
    criticality: number;
  } | null;
  incidents?: Array<{
    id: string;
    incidentCode: string;
    status: string;
  }>;
};

const SEVERITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "ACCEPTED"];

function getSeverity(score: number): "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" {
  if (score >= 17) return "CRITICAL";
  if (score >= 10) return "HIGH";
  if (score >= 5) return "MEDIUM";
  return "LOW";
}

function getSeverityConfig(sev: string) {
  switch (sev) {
    case "CRITICAL":
      return {
        label: "Critical",
        icon: AlertOctagon,
        color: "#F87171",
        cellBg: "bg-red-500/15 hover:bg-red-500/25 border-red-500/30",
        badge: "bg-red-500/20 text-[#F87171] border-red-500/40",
      };
    case "HIGH":
      return {
        label: "High",
        icon: AlertTriangle,
        color: "#FDA672",
        cellBg: "bg-orange-500/15 hover:bg-orange-500/25 border-orange-500/30",
        badge: "bg-orange-500/20 text-[#FDA672] border-orange-500/40",
      };
    case "MEDIUM":
      return {
        label: "Medium",
        icon: ShieldAlert,
        color: "#FCD34D",
        cellBg: "bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/30",
        badge: "bg-amber-500/20 text-[#FCD34D] border-amber-500/40",
      };
    default:
      return {
        label: "Low",
        icon: ShieldCheck,
        color: "#6EE7B7",
        cellBg: "bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/30",
        badge: "bg-emerald-500/20 text-[#6EE7B7] border-emerald-500/40",
      };
  }
}

export default function RiskRegister() {
  const [risks, setRisks] = useState<RiskFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedCell, setSelectedCell] = useState<{ l: number; i: number } | null>(null);

  const [viewingRisk, setViewingRisk] = useState<RiskFinding | null>(null);
  const [escalatingRisk, setEscalatingRisk] = useState<RiskFinding | null>(null);
  const [escalatePriority, setEscalatePriority] = useState("HIGH");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  async function loadRisks() {
    setLoading(true);
    try {
      const res = await fetch("/api/risks");
      const result = await res.json();
      if (result.success) setRisks(result.data);
    } catch {
      setMessage({ text: "Failed to load risk findings.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRisks();
  }, []);

  async function handleRecalculate() {
    setRecalculating(true);
    setMessage(null);
    try {
      const res = await fetch("/api/risks/recalculate", { method: "POST" });
      const result = await res.json();
      if (result.success) {
        setMessage({ text: result.message, type: "success" });
        await loadRisks();
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : "Failed to run risk assessment.",
        type: "error",
      });
    } finally {
      setRecalculating(false);
    }
  }

  async function handleStatusChange(risk: RiskFinding, newStatus: string) {
    try {
      const res = await fetch(`/api/risks/${risk.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();
      if (result.success) {
        setMessage({ text: `Finding ${risk.findingCode} marked as ${newStatus}.`, type: "success" });
        await loadRisks();
      }
    } catch {
      setMessage({ text: "Unable to update status.", type: "error" });
    }
  }

  async function handleEscalate() {
    if (!escalatingRisk) return;
    try {
      const res = await fetch(`/api/risks/${escalatingRisk.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priority: escalatePriority,
          title: `Mitigate: ${escalatingRisk.title}`,
          description: escalatingRisk.description,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setMessage({ text: result.message, type: "success" });
        setEscalatingRisk(null);
        await loadRisks();
      }
    } catch {
      setMessage({ text: "Unable to escalate risk finding.", type: "error" });
    }
  }

  const filteredRisks = risks.filter((r) => {
    const matchesSearch =
      r.findingCode.toLowerCase().includes(search.toLowerCase()) ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      (r.user?.fullName.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (r.asset?.name.toLowerCase().includes(search.toLowerCase()) ?? false);

    const matchesSeverity = severityFilter === "ALL" || r.severity === severityFilter;
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    const matchesCell =
      !selectedCell || (r.likelihood === selectedCell.l && r.impact === selectedCell.i);

    return matchesSearch && matchesSeverity && matchesStatus && matchesCell;
  });

  const criticalCount = risks.filter((r) => r.severity === "CRITICAL" && r.status !== "RESOLVED").length;
  const highCount = risks.filter((r) => r.severity === "HIGH" && r.status !== "RESOLVED").length;
  const openCount = risks.filter((r) => r.status === "OPEN").length;
  const resolvedCount = risks.filter((r) => r.status === "RESOLVED").length;

  // Likelihood rows (5 down to 1), Impact cols (1 up to 5)
  const likelihoods = [5, 4, 3, 2, 1];
  const impacts = [1, 2, 3, 4, 5];

  const likelihoodLabels: Record<number, string> = {
    5: "5 - Almost Certain",
    4: "4 - Likely",
    3: "3 - Moderate",
    2: "2 - Low",
    1: "1 - Rare",
  };

  const impactLabels: Record<number, string> = {
    1: "1 - Negligible",
    2: "2 - Minor",
    3: "3 - Moderate",
    4: "4 - Major",
    5: "5 - Critical",
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Risk Register & Assessment Engine
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300/80">
            Deterministic rule-based risk scoring (Likelihood × Impact) evaluating identity lifecycle, access entitlements, and telemetry.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadRisks}
            className="flex items-center gap-1.5 btn-secondary-glass px-4 py-2 text-xs transition cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="flex items-center gap-2 btn-primary-glass px-5 py-2 text-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={recalculating ? "animate-spin" : ""} />
            {recalculating ? "Evaluating Rules..." : "Recalculate Risk Engine"}
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {message && (
        <div
          className={`flex items-center justify-between rounded-2xl p-4 text-xs backdrop-blur-md ${message.type === "success"
              ? "bg-emerald-500/15 text-[#6EE7B7] border border-emerald-500/35"
              : "bg-red-500/15 text-[#F87171] border border-red-500/35"
            }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-4 text-slate-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Stats Cards (Liquid Glass) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlassCard glow="critical" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300/80">Critical Severity</span>
            <div className="rounded-xl bg-red-500/20 p-2.5 text-[#F87171] border border-red-500/30">
              <AlertOctagon size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-[#F87171] tracking-tight tabular-nums">{criticalCount}</p>
          <p className="mt-1 text-xs text-slate-300/80 font-mono">Score 17 - 25 (Immediate Action)</p>
        </GlassCard>

        <GlassCard glow="warning" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300/80">High Severity</span>
            <div className="rounded-xl bg-orange-500/20 p-2.5 text-[#FDA672] border border-orange-500/30">
              <AlertTriangle size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-[#FDA672] tracking-tight tabular-nums">{highCount}</p>
          <p className="mt-1 text-xs text-slate-300/80 font-mono">Score 10 - 16 (Escalation Required)</p>
        </GlassCard>

        <GlassCard glow="blue" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300/80">Open Findings</span>
            <div className="rounded-xl bg-blue-500/20 p-2.5 text-[#60A5FA] border border-blue-500/30">
              <ShieldAlert size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-[#60A5FA] tracking-tight tabular-nums">{openCount}</p>
          <p className="mt-1 text-xs text-slate-300/80 font-mono">Awaiting remediation</p>
        </GlassCard>

        <GlassCard glow="emerald" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300/80">Remediated Findings</span>
            <div className="rounded-xl bg-emerald-500/20 p-2.5 text-[#6EE7B7] border border-emerald-500/30">
              <ShieldCheck size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-[#6EE7B7] tracking-tight tabular-nums">{resolvedCount}</p>
          <p className="mt-1 text-xs text-slate-300/80 font-mono">Actions closed</p>
        </GlassCard>
      </div>

      {/* 5×5 Glass Risk Assessment Heatmap */}
      <GlassCard className="p-5 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <Grid3X3 className="text-[#60A5FA]" size={20} />
              <h3 className="text-base font-bold text-white">5×5 Risk Assessment Matrix</h3>
            </div>
            <p className="text-xs text-slate-300/80 mt-0.5">
              Click any coordinate cell to filter findings by exact Likelihood × Impact value.
            </p>
          </div>

          {selectedCell && (
            <button
              onClick={() => setSelectedCell(null)}
              className="self-start sm:self-auto flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/15 px-3 py-1 text-xs text-white border border-white/20 transition cursor-pointer"
            >
              <X size={13} />
              Clear Filter (L:{selectedCell.l}, I:{selectedCell.i})
            </button>
          )}
        </div>

        {/* Heatmap Grid Container */}
        <div className="mt-5 overflow-x-auto">
          <div className="min-w-[620px]">
            {/* Column Impact Headers */}
            <div className="grid grid-cols-6 gap-2 mb-2 text-center text-xs">
              <div className="text-left font-mono font-bold text-[10px] uppercase tracking-wider text-slate-400 self-end px-2">
                Likelihood ↓ / Impact →
              </div>
              {impacts.map((imp) => (
                <div key={imp} className="rounded-xl bg-white/[0.04] p-2 border border-white/5">
                  <span className="block font-bold text-white font-mono text-xs">Tier {imp}</span>
                  <span className="block text-[9px] text-slate-300/70 truncate">{impactLabels[imp].split("-")[1]}</span>
                </div>
              ))}
            </div>

            {/* Matrix Rows (5 down to 1) */}
            <div className="space-y-2">
              {likelihoods.map((lh) => (
                <div key={lh} className="grid grid-cols-6 gap-2 items-center">
                  {/* Row Header */}
                  <div className="rounded-xl bg-white/[0.04] p-2 border border-white/5 text-left">
                    <span className="block font-bold text-white font-mono text-xs">Level {lh}</span>
                    <span className="block text-[9px] text-slate-300/70 truncate">{likelihoodLabels[lh].split("-")[1]}</span>
                  </div>

                  {/* 5 Impact Cells for this Likelihood */}
                  {impacts.map((imp) => {
                    const score = lh * imp;
                    const sev = getSeverity(score);
                    const cfg = getSeverityConfig(sev);
                    const Icon = cfg.icon;
                    const activeFindingsInCell = risks.filter(
                      (r) => r.likelihood === lh && r.impact === imp && r.status !== "RESOLVED"
                    );
                    const count = activeFindingsInCell.length;
                    const isSelected = selectedCell?.l === lh && selectedCell?.i === imp;

                    return (
                      <button
                        key={`${lh}-${imp}`}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedCell(null);
                          } else {
                            setSelectedCell({ l: lh, i: imp });
                          }
                        }}
                        className={`relative rounded-2xl p-3 border transition-all duration-200 cursor-pointer flex flex-col justify-between h-[84px] text-left ${cfg.cellBg} ${isSelected
                            ? "ring-2 ring-white scale-[1.03] shadow-lg shadow-blue-500/30"
                            : "hover:scale-[1.01]"
                          }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-mono text-sm font-extrabold text-white tabular-nums">
                            {score}
                          </span>
                          <span
                            className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider"
                            style={{ color: cfg.color }}
                          >
                            <Icon size={10} />
                            {cfg.label}
                          </span>
                        </div>

                        <div className="mt-auto flex items-center justify-between w-full">
                          <span className="text-[9px] text-slate-300/70 font-mono">
                            {lh}×{imp}
                          </span>
                          {count > 0 ? (
                            <span className="rounded-full bg-white/20 border border-white/30 px-2 py-0.5 text-[10px] font-bold text-white tabular-nums">
                              {count} {count === 1 ? "risk" : "risks"}
                            </span>
                          ) : (
                            <span className="text-[9px] text-slate-400/50">—</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Severity Band Legend */}
            <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300/80 font-mono">
                Severity Bands (Likelihood × Impact):
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1.5 rounded-full bg-red-500/15 border border-red-500/35 px-3 py-1 text-[11px] font-semibold text-[#F87171]">
                  <AlertOctagon size={13} />
                  Critical (17–25)
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-orange-500/15 border border-orange-500/35 px-3 py-1 text-[11px] font-semibold text-[#FDA672]">
                  <AlertTriangle size={13} />
                  High (10–16)
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/35 px-3 py-1 text-[11px] font-semibold text-[#FCD34D]">
                  <ShieldAlert size={13} />
                  Medium (5–9)
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/35 px-3 py-1 text-[11px] font-semibold text-[#6EE7B7]">
                  <ShieldCheck size={13} />
                  Low (1–4)
                </span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Filter and Search Bar */}
      <GlassCard className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search finding code, title, user, or asset..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl glass-input py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-400 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1 text-xs text-slate-300">
              <Filter size={14} /> Filter:
            </div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="rounded-xl glass-input px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Severities</option>
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl glass-input px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="mt-5 hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 text-[10px] uppercase tracking-wider text-slate-300/70 bg-white/[0.02]">
              <tr>
                <th className="px-4 py-3.5 font-semibold">Finding Code & Title</th>
                <th className="px-3 py-3.5 font-semibold">Formula (L × I)</th>
                <th className="px-3 py-3.5 font-semibold">Severity</th>
                <th className="px-3 py-3.5 font-semibold">Affected Entity</th>
                <th className="px-3 py-3.5 font-semibold">Status</th>
                <th className="px-4 py-3.5 text-right font-semibold">Mitigation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    Loading risk findings...
                  </td>
                </tr>
              ) : filteredRisks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No risk findings matching criteria.
                  </td>
                </tr>
              ) : (
                filteredRisks.map((risk) => {
                  const cfg = getSeverityConfig(risk.severity);
                  const Icon = cfg.icon;
                  return (
                    <tr key={risk.id} className="hover:bg-white/[0.05] transition">
                      <td className="px-4 py-3.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-[#7DD3FC]">{risk.findingCode}</span>
                            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[9px] font-medium text-slate-300 border border-white/10">
                              {risk.category}
                            </span>
                          </div>
                          <p className="font-semibold text-white mt-1">{risk.title}</p>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-1.5 font-mono text-xs tabular-nums">
                          <span className="text-slate-300" title="Likelihood">
                            L:{risk.likelihood}
                          </span>
                          <span className="text-slate-500">×</span>
                          <span className="text-slate-300" title="Impact">
                            I:{risk.impact}
                          </span>
                          <span className="text-slate-500">=</span>
                          <span className="font-bold text-[#60A5FA]">{risk.score}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${cfg.badge}`}>
                          <Icon size={12} />
                          {risk.severity}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        {risk.user && (
                          <p className="text-white font-medium">
                            👤 {risk.user.fullName}{" "}
                            <span className="text-[10px] text-slate-300/70 font-mono">({risk.user.role})</span>
                          </p>
                        )}
                        {risk.asset && (
                          <p className="text-slate-300 text-[11px] mt-0.5">
                            🖥️ {risk.asset.name}{" "}
                            <span className="font-mono text-[10px] text-[#7DD3FC]">[{risk.asset.code}]</span>
                          </p>
                        )}
                        {!risk.user && !risk.asset && <span className="text-slate-400 italic">System-wide</span>}
                      </td>
                      <td className="px-3 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${risk.status === "RESOLVED"
                              ? "bg-emerald-500/15 text-[#6EE7B7] border-emerald-500/35"
                              : risk.status === "IN_PROGRESS"
                                ? "bg-blue-500/15 text-[#60A5FA] border-blue-500/35"
                                : "bg-amber-500/15 text-[#FCD34D] border-amber-500/35"
                            }`}
                        >
                          {risk.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingRisk(risk)}
                            title="View Assessment Details"
                            className="rounded-full p-2 text-slate-300 hover:bg-white/10 hover:text-white transition"
                          >
                            <Eye size={15} />
                          </button>
                          {risk.status !== "RESOLVED" && (
                            <>
                              <button
                                onClick={() => setEscalatingRisk(risk)}
                                title="Escalate to Incident / Remediation Task"
                                className="rounded-full border border-blue-400/40 bg-blue-500/15 px-3 py-1 text-[11px] font-semibold text-[#7DD3FC] hover:bg-blue-500/25 transition cursor-pointer"
                              >
                                Escalate
                              </button>
                              <button
                                onClick={() => handleStatusChange(risk, "RESOLVED")}
                                title="Mark Remediated / Resolved"
                                className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold text-[#6EE7B7] hover:bg-emerald-500/25 transition cursor-pointer"
                              >
                                Resolve
                              </button>
                            </>
                          )}
                          {risk.status === "RESOLVED" && (
                            <button
                              onClick={() => handleStatusChange(risk, "OPEN")}
                              title="Reopen Finding"
                              className="rounded-full px-3 py-1 text-[11px] text-slate-300 hover:bg-white/10 border border-white/10"
                            >
                              Reopen
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Responsive Cards View */}
        <div className="md:hidden mt-4 space-y-3">
          {loading ? (
            <p className="py-6 text-center text-xs text-slate-400">Loading risk findings...</p>
          ) : filteredRisks.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">No risk findings matching criteria.</p>
          ) : (
            filteredRisks.map((risk) => {
              const cfg = getSeverityConfig(risk.severity);
              const Icon = cfg.icon;
              return (
                <div key={risk.id} className="rounded-2xl bg-white/[0.03] p-4 border border-white/10 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[10px] text-[#7DD3FC]">{risk.findingCode}</span>
                      <p className="font-semibold text-white text-xs mt-0.5">{risk.title}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold border shrink-0 ${cfg.badge}`}>
                      <Icon size={11} />
                      {risk.severity}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1 border-t border-white/5">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Formula:</span>
                      <span className="font-mono font-bold text-white">L:{risk.likelihood} × I:{risk.impact} = {risk.score}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Status:</span>
                      <span className="font-mono text-white">{risk.status.replace("_", " ")}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => setViewingRisk(risk)}
                      className="rounded-full btn-secondary-glass px-3 py-1 text-[11px]"
                    >
                      View
                    </button>
                    {risk.status !== "RESOLVED" ? (
                      <>
                        <button
                          onClick={() => setEscalatingRisk(risk)}
                          className="rounded-full bg-blue-500/20 border border-blue-400/40 text-[#7DD3FC] px-3 py-1 text-[11px] font-semibold"
                        >
                          Escalate
                        </button>
                        <button
                          onClick={() => handleStatusChange(risk, "RESOLVED")}
                          className="rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[#6EE7B7] px-3 py-1 text-[11px] font-semibold"
                        >
                          Resolve
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(risk, "OPEN")}
                        className="rounded-full border border-white/15 px-3 py-1 text-[11px] text-slate-300"
                      >
                        Reopen
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </GlassCard>

      {/* View Finding Detail Modal (Liquid Glass) */}
      {viewingRisk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1530]/80 p-4 backdrop-blur-md animate-in fade-in">
          <GlassCard variant="raised" className="w-full max-w-lg p-6">
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <span className="font-mono text-xs text-[#7DD3FC]">{viewingRisk.findingCode}</span>
                <h3 className="text-base font-bold text-white mt-0.5">{viewingRisk.title}</h3>
              </div>
              <button onClick={() => setViewingRisk(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3.5">
                <p className="text-[10px] uppercase font-semibold text-slate-300">Risk Assessment Methodology</p>
                <div className="mt-2.5 grid grid-cols-3 gap-2.5 text-center">
                  <div className="rounded-xl bg-white/5 p-2.5 border border-white/10">
                    <p className="text-[10px] text-slate-300/80">Likelihood</p>
                    <p className="text-lg font-bold text-white mt-0.5 tabular-nums">{viewingRisk.likelihood} / 5</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-2.5 border border-white/10">
                    <p className="text-[10px] text-slate-300/80">Impact</p>
                    <p className="text-lg font-bold text-white mt-0.5 tabular-nums">{viewingRisk.impact} / 5</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-2.5 border border-white/10">
                    <p className="text-[10px] text-slate-300/80">Calculated Score</p>
                    <p className="text-lg font-bold text-[#F87171] mt-0.5 tabular-nums">{viewingRisk.score} / 25</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="font-semibold text-slate-200">Detailed Description:</p>
                <p className="mt-1 text-slate-300 leading-relaxed bg-white/[0.03] p-3 rounded-2xl border border-white/10">
                  {viewingRisk.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Affected User:</span>
                  <span className="font-semibold text-white">
                    {viewingRisk.user?.fullName ?? "System wide"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Target Asset:</span>
                  <span className="font-semibold text-white">
                    {viewingRisk.asset?.name ?? "System wide"}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setViewingRisk(null)}
                  className="btn-secondary-glass px-4 py-2 text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Escalate to Incident Modal */}
      {escalatingRisk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1530]/80 p-4 backdrop-blur-md animate-in fade-in">
          <GlassCard variant="raised" className="w-full max-w-md p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-sm">Escalate Risk to Incident</h3>
              <button onClick={() => setEscalatingRisk(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <p className="text-slate-300 leading-relaxed">
                Create an official security mitigation incident for finding{" "}
                <span className="font-mono font-bold text-[#7DD3FC]">{escalatingRisk.findingCode}</span>. This will automatically schedule remediation tasks.
              </p>

              <div>
                <label className="mb-1 block font-medium text-slate-200">Incident Priority</label>
                <select
                  value={escalatePriority}
                  onChange={(e) => setEscalatePriority(e.target.value)}
                  className="w-full rounded-2xl glass-input p-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="CRITICAL">CRITICAL (Immediate mitigation)</option>
                  <option value="HIGH">HIGH (Remediate within 24 hours)</option>
                  <option value="MEDIUM">MEDIUM (Remediate during sprint)</option>
                  <option value="LOW">LOW (Informational review)</option>
                </select>
              </div>

              <div className="mt-5 flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEscalatingRisk(null)}
                  className="btn-secondary-glass px-4 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleEscalate}
                  className="btn-primary-glass px-5 py-2 text-xs"
                >
                  Confirm Escalation
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}