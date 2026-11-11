"use client";

import { useEffect, useState } from "react";
import {
  ShieldAlert, ShieldCheck, AlertTriangle, RefreshCw,
  Search, Filter, Eye, AlertOctagon, CheckCircle2,
  X, ArrowUpRight, Plus, ExternalLink
} from "lucide-react";

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

export default function RiskRegister() {
  const [risks, setRisks] = useState<RiskFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

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

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const criticalCount = risks.filter((r) => r.severity === "CRITICAL" && r.status !== "RESOLVED").length;
  const highCount = risks.filter((r) => r.severity === "HIGH" && r.status !== "RESOLVED").length;
  const openCount = risks.filter((r) => r.status === "OPEN").length;
  const resolvedCount = risks.filter((r) => r.status === "RESOLVED").length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-[26px]">
            Risk Register & Assessment Engine
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Deterministic rule-based risk scoring (Likelihood × Impact) evaluating identity lifecycle, access, and anomalies.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadRisks}
            className="flex items-center gap-1.5 rounded-xl liquid-glass px-3 py-2 text-xs font-medium text-slate-300 hover:text-white border-white/10 transition cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:from-cyan-300 hover:to-blue-400 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={recalculating ? "animate-spin" : ""} />
            {recalculating ? "Evaluating Rules..." : "Recalculate Risk Engine"}
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {message && (
        <div
          className={`flex items-center justify-between rounded-xl p-3.5 text-xs backdrop-blur-md ${
            message.type === "success"
              ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
              : "bg-red-500/10 text-red-300 border border-red-500/30"
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
        <div className="rounded-2xl liquid-glass p-5 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Critical Severity</span>
            <div className="rounded-xl bg-red-500/10 p-2.5 text-red-400 border border-red-500/20">
              <AlertOctagon size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-red-400 tracking-tight">{criticalCount}</p>
          <p className="mt-1 text-[11px] text-slate-400 font-mono">Score 17 - 25 (Immediate Action)</p>
        </div>

        <div className="rounded-2xl liquid-glass p-5 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">High Severity</span>
            <div className="rounded-xl bg-orange-500/10 p-2.5 text-orange-400 border border-orange-500/20">
              <AlertTriangle size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-orange-400 tracking-tight">{highCount}</p>
          <p className="mt-1 text-[11px] text-slate-400 font-mono">Score 10 - 16 (Escalation Required)</p>
        </div>

        <div className="rounded-2xl liquid-glass p-5 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Open Findings</span>
            <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-400 border border-blue-500/20">
              <ShieldAlert size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-blue-400 tracking-tight">{openCount}</p>
          <p className="mt-1 text-[11px] text-slate-400 font-mono">Awaiting remediation</p>
        </div>

        <div className="rounded-2xl liquid-glass p-5 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Remediated Findings</span>
            <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-emerald-400 tracking-tight">{resolvedCount}</p>
          <p className="mt-1 text-[11px] text-slate-400 font-mono">Actions closed</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl liquid-glass p-5 border border-white/10 shadow-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search finding code, title, user, or asset..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl bg-slate-950/60 border border-white/10 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Filter size={14} /> Filter:
            </div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
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
              className="rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
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

        {/* Risk Register Table (Liquid Glass Dark) */}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs">
            <thead className="border-b border-white/10 text-[10px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Finding Code & Title</th>
                <th className="px-3 py-3 font-semibold">Risk Formula (L × I)</th>
                <th className="px-3 py-3 font-semibold">Severity</th>
                <th className="px-3 py-3 font-semibold">Affected Entity</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Mitigation Actions</th>
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
                filteredRisks.map((risk) => (
                  <tr key={risk.id} className="hover:bg-white/[0.04] transition">
                    <td className="px-4 py-3.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-cyan-400">{risk.findingCode}</span>
                          <span className="rounded-lg bg-white/5 px-2 py-0.5 text-[9px] font-medium text-slate-300 border border-white/10">
                            {risk.category}
                          </span>
                        </div>
                        <p className="font-semibold text-white mt-1">{risk.title}</p>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span className="text-slate-300" title="Likelihood">
                          L:{risk.likelihood}
                        </span>
                        <span className="text-slate-500">×</span>
                        <span className="text-slate-300" title="Impact">
                          I:{risk.impact}
                        </span>
                        <span className="text-slate-500">=</span>
                        <span className="font-bold text-cyan-300">{risk.score}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className={`rounded-md px-2.5 py-1 text-[10px] font-bold border ${
                          risk.severity === "CRITICAL"
                            ? "bg-red-500/10 text-red-300 border-red-500/30"
                            : risk.severity === "HIGH"
                            ? "bg-orange-500/10 text-orange-300 border-orange-500/30"
                            : risk.severity === "MEDIUM"
                            ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                            : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                        }`}
                      >
                        {risk.severity}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      {risk.user && (
                        <p className="text-white font-medium">
                          👤 {risk.user.fullName}{" "}
                          <span className="text-[10px] text-slate-400 font-mono">({risk.user.role})</span>
                        </p>
                      )}
                      {risk.asset && (
                        <p className="text-slate-300 text-[11px] mt-0.5">
                          🖥️ {risk.asset.name}{" "}
                          <span className="font-mono text-[10px] text-cyan-400">[{risk.asset.code}]</span>
                        </p>
                      )}
                      {!risk.user && !risk.asset && <span className="text-slate-400 italic">System-wide</span>}
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${
                          risk.status === "RESOLVED"
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                            : risk.status === "IN_PROGRESS"
                            ? "bg-blue-500/10 text-blue-300 border-blue-500/30"
                            : "bg-amber-500/10 text-amber-300 border-amber-500/30"
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
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-cyan-300 transition"
                        >
                          <Eye size={15} />
                        </button>

                        {risk.status !== "RESOLVED" && (
                          <>
                            <button
                              onClick={() => setEscalatingRisk(risk)}
                              title="Escalate to Incident / Remediation Task"
                              className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold text-blue-300 hover:bg-blue-500/20 transition cursor-pointer"
                            >
                              Escalate
                            </button>
                            <button
                              onClick={() => handleStatusChange(risk, "RESOLVED")}
                              title="Mark Remediated / Resolved"
                              className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-300 hover:bg-emerald-500/20 transition cursor-pointer"
                            >
                              Resolve
                            </button>
                          </>
                        )}
                        {risk.status === "RESOLVED" && (
                          <button
                            onClick={() => handleStatusChange(risk, "OPEN")}
                            title="Reopen Finding"
                            className="rounded-lg px-2.5 py-1 text-[10px] text-slate-400 hover:bg-white/10"
                          >
                            Reopen
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Finding Detail Modal (Liquid Glass) */}
      {viewingRisk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl liquid-glass p-6 border border-white/15 shadow-2xl">
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <span className="font-mono text-xs text-cyan-400">{viewingRisk.findingCode}</span>
                <h3 className="text-base font-bold text-white mt-0.5">{viewingRisk.title}</h3>
              </div>
              <button onClick={() => setViewingRisk(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3.5">
                <p className="text-[10px] uppercase font-semibold text-slate-400">Risk Assessment Methodology</p>
                <div className="mt-2.5 grid grid-cols-3 gap-2.5 text-center">
                  <div className="rounded-lg bg-white/5 p-2.5 border border-white/5">
                    <p className="text-[10px] text-slate-400">Likelihood</p>
                    <p className="text-lg font-bold text-white mt-0.5">{viewingRisk.likelihood} / 5</p>
                  </div>
                  <div className="rounded-lg bg-white/5 p-2.5 border border-white/5">
                    <p className="text-[10px] text-slate-400">Impact</p>
                    <p className="text-lg font-bold text-white mt-0.5">{viewingRisk.impact} / 5</p>
                  </div>
                  <div className="rounded-lg bg-white/5 p-2.5 border border-white/5">
                    <p className="text-[10px] text-slate-400">Calculated Score</p>
                    <p className="text-lg font-bold text-red-400 mt-0.5">{viewingRisk.score} / 25</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="font-semibold text-slate-300">Detailed Description:</p>
                <p className="mt-1 text-slate-400 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/5">
                  {viewingRisk.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Affected User:</span>
                  <span className="font-semibold text-white">
                    {viewingRisk.user?.fullName ?? "No single user (System wide)"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Target Asset:</span>
                  <span className="font-semibold text-white">
                    {viewingRisk.asset?.name ?? "No single asset"}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setViewingRisk(null)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs text-slate-300 hover:bg-white/5"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Escalate to Incident Modal */}
      {escalatingRisk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl liquid-glass p-6 border border-white/15 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-sm">Escalate Risk to Incident</h3>
              <button onClick={() => setEscalatingRisk(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <p className="text-slate-300 leading-relaxed">
                Create an official security mitigation incident for finding{" "}
                <span className="font-mono font-bold text-cyan-300">{escalatingRisk.findingCode}</span>. This will automatically schedule remediation tasks.
              </p>

              <div>
                <label className="mb-1 block font-medium text-slate-300">Incident Priority</label>
                <select
                  value={escalatePriority}
                  onChange={(e) => setEscalatePriority(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
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
                  className="rounded-xl border border-white/10 px-3.5 py-2 text-xs text-slate-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleEscalate}
                  className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-xs font-bold text-white hover:from-blue-400 hover:to-indigo-500"
                >
                  Confirm Escalation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
