"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Activity, AlertTriangle, ShieldCheck, RefreshCw,
  Search, Filter, Radio, UserCheck, X, Server, Shield
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

type ActivityLog = {
  id: string;
  action: string;
  description: string;
  eventType: string;
  ipAddress: string | null;
  createdAt: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  } | null;
  asset?: {
    id: string;
    name: string;
    code: string;
  } | null;
};

type UserOption = { id: string; fullName: string; role: string };
type AssetOption = { id: string; name: string; code: string };

const EVENT_TYPES = [
  "ALL",
  "AUTHENTICATION",
  "SUSPICIOUS_ACTIVITY",
  "ACCESS",
  "RISK",
  "INCIDENT",
  "REVIEW",
];

export default function ActivityMonitoring() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [assets, setAssets] = useState<AssetOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const [showSimModal, setShowSimModal] = useState(false);
  const [simForm, setSimForm] = useState({
    scenario: "FAILED_LOGIN_BURST",
    userId: "",
    assetId: "",
  });
  const [simulating, setSimulating] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  async function loadLogs() {
    setLoading(true);
    try {
      const [logsRes, usersRes, assetsRes] = await Promise.all([
        fetch("/api/activity?limit=100"),
        fetch("/api/users"),
        fetch("/api/assets"),
      ]);

      const logsData = await logsRes.json();
      const usersData = await usersRes.json();
      const assetsData = await assetsRes.json();

      if (logsData.success) setLogs(logsData.data);
      if (usersData.success) setUsers(usersData.data);
      if (assetsData.success) setAssets(assetsData.data);
    } catch {
      setMessage({ text: "Failed to load telemetry events.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  async function handleSimulate(e: FormEvent) {
    e.preventDefault();
    setSimulating(true);
    setMessage(null);

    try {
      const res = await fetch("/api/activity/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(simForm),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to trigger event.");
      }

      setMessage({ text: result.message, type: "success" });
      setShowSimModal(false);
      await loadLogs();
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Error simulating event.", type: "error" });
    } finally {
      setSimulating(false);
    }
  }

  const getTimeAgo = (dateStr: string) => {
    const diff = Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000));
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.description.toLowerCase().includes(search.toLowerCase()) ||
      (log.user?.fullName.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (log.asset?.name.toLowerCase().includes(search.toLowerCase()) ?? false);

    const matchesType = typeFilter === "ALL" || log.eventType === typeFilter;

    return matchesSearch && matchesType;
  });

  const totalLogs = logs.length;
  const authEvents = logs.filter((l) => l.eventType === "AUTHENTICATION").length;
  const anomalyEvents = logs.filter((l) => l.eventType === "SUSPICIOUS_ACTIVITY").length;
  const riskEvents = logs.filter((l) => l.eventType === "RISK" || l.eventType === "INCIDENT").length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="glass-chip text-[10px] uppercase tracking-wider text-[#60A5FA] font-mono">
              Live Audit Stream
            </span>
            <span className="glass-chip text-[10px] text-[#6EE7B7] font-mono flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#6EE7B7] animate-pulse" /> Active Telemetry
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F5F8FF] sm:text-[28px]">
            Security Activity & Telemetry
          </h1>
          <p className="mt-1 text-xs text-slate-300/80">
            Real-time simulated audit trail for authentication, access grants, and security anomalies.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={loadLogs}
            className="btn-secondary-glass flex items-center gap-1.5 text-xs font-medium cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? "animate-spin text-[#60A5FA]" : ""} />
            Refresh
          </button>
          <button
            onClick={() => setShowSimModal(true)}
            className="btn-primary-glass flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-lg shadow-blue-500/20"
          >
            <Radio size={14} />
            Simulate Event
          </button>
        </div>
      </div>

      {/* Prototype Notice Banner */}
      <div className="glass rounded-[20px] border border-cyan-500/30 p-3.5 text-xs text-cyan-200 flex items-center gap-3 shadow-lg shadow-cyan-950/20">
        <Activity size={18} className="text-[#38BDF8] shrink-0" />
        <p className="leading-relaxed">
          <strong className="font-semibold text-[#F5F8FF]">Prototype – Simulated Data:</strong> Telemetry events and authentication logs are synthetically generated for academic demonstration and risk evaluation verification.
        </p>
      </div>

      {/* Alert Banner */}
      {message && (
        <div
          className={`flex items-center justify-between rounded-2xl p-4 text-xs backdrop-blur-md transition-all ${message.type === "success"
              ? "bg-emerald-500/10 text-emerald-200 border border-emerald-500/30 shadow-lg shadow-emerald-950/20"
              : "bg-red-500/10 text-red-200 border border-red-500/30 shadow-lg shadow-red-950/20"
            }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-4 text-slate-400 hover:text-white cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Stat Cards (Liquid Glass) */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <GlassCard variant="default" glow="blue" className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-300/80">Total Telemetry</span>
            <div className="rounded-xl bg-blue-500/10 p-2 text-[#60A5FA] border border-blue-500/20">
              <Activity size={16} />
            </div>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#F5F8FF] tracking-tight tabular-nums">
            {totalLogs}
          </p>
          <p className="mt-1 text-[11px] text-slate-400 font-mono">Recorded events</p>
        </GlassCard>

        <GlassCard variant="default" glow="cyan" className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-300/80">Authentication</span>
            <div className="rounded-xl bg-emerald-500/10 p-2 text-[#6EE7B7] border border-emerald-500/20">
              <UserCheck size={16} />
            </div>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#6EE7B7] tracking-tight tabular-nums">
            {authEvents}
          </p>
          <p className="mt-1 text-[11px] text-slate-400 font-mono">Logins & SSO sessions</p>
        </GlassCard>

        <GlassCard variant="default" glow="indigo" className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-300/80">Anomalies</span>
            <div className="rounded-xl bg-red-500/10 p-2 text-[#F87171] border border-red-500/20">
              <AlertTriangle size={16} />
            </div>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#F87171] tracking-tight tabular-nums">
            {anomalyEvents}
          </p>
          <p className="mt-1 text-[11px] text-slate-400 font-mono">Failed bursts & escalation</p>
        </GlassCard>

        <GlassCard variant="default" className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-300/80">Risk & Incident</span>
            <div className="rounded-xl bg-purple-500/10 p-2 text-[#C084FC] border border-purple-500/20">
              <ShieldCheck size={16} />
            </div>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#E9D5FF] tracking-tight tabular-nums">
            {riskEvents}
          </p>
          <p className="mt-1 text-[11px] text-slate-400 font-mono">Engine & ticket actions</p>
        </GlassCard>
      </div>

      {/* Filter and Search Bar */}
      <GlassCard variant="raised" className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search by action, description, user, or asset..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input w-full py-2.5 pl-10 pr-4 text-xs text-[#F5F8FF] placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-300/80 shrink-0 font-medium">
              <Filter size={13} className="text-[#60A5FA]" /> Event Type:
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="glass-input px-3 py-2 text-xs text-[#F5F8FF] cursor-pointer"
            >
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t} className="bg-[#0A1530] text-[#F5F8FF]">
                  {t.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mobile View: Stacked Responsive Glass Cards (md:hidden) */}
        <div className="mt-5 space-y-3 md:hidden">
          {loading ? (
            <p className="py-8 text-center text-xs text-slate-400">Loading telemetry stream...</p>
          ) : filteredLogs.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-400">No activity logs found.</p>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`glass rounded-[18px] p-3.5 space-y-2 border transition ${log.eventType === "SUSPICIOUS_ACTIVITY"
                    ? "border-red-500/30 bg-red-950/20"
                    : "border-white/10"
                  }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold border ${log.eventType === "SUSPICIOUS_ACTIVITY"
                        ? "bg-red-500/15 text-[#F87171] border-red-500/30"
                        : log.eventType === "AUTHENTICATION"
                          ? "bg-blue-500/15 text-[#60A5FA] border-blue-500/30"
                          : log.eventType === "RISK"
                            ? "bg-amber-500/15 text-[#FCD34D] border-amber-500/30"
                            : log.eventType === "INCIDENT"
                              ? "bg-purple-500/15 text-[#C084FC] border-purple-500/30"
                              : "bg-slate-500/15 text-slate-300 border-slate-500/30"
                      }`}
                  >
                    {log.eventType.replace("_", " ")}
                  </span>
                  <div className="text-right">
                    <span className="font-semibold text-[#F5F8FF] text-[11px] block">{getTimeAgo(log.createdAt)}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div className="font-mono text-[10px] text-[#38BDF8] font-semibold">
                  {log.action}
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">
                  {log.description}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-[10px] text-slate-400">
                  <span className="font-mono">{log.ipAddress || "127.0.0.1"}</span>
                  <div className="flex items-center gap-1.5">
                    {log.user && (
                      <span className="font-semibold text-white">{log.user.fullName}</span>
                    )}
                    {log.asset && (
                      <span className="text-[#60A5FA]">🖥️ {log.asset.name}</span>
                    )}
                    {!log.user && !log.asset && <span className="italic">System</span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Activity Table (hidden md:block) */}
        <div className="mt-5 hidden md:block overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs">
            <thead className="border-b border-white/10 text-[10px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Timestamp</th>
                <th className="px-3 py-3 font-semibold">Event Type</th>
                <th className="px-3 py-3 font-semibold">Action Code</th>
                <th className="px-4 py-3 font-semibold">Description</th>
                <th className="px-3 py-3 font-semibold">Origin IP</th>
                <th className="px-4 py-3 font-semibold">Involved Entities</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    Loading telemetry stream...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No activity logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className={`transition hover:bg-white/[0.04] ${log.eventType === "SUSPICIOUS_ACTIVITY" ? "bg-red-500/[0.06]" : ""
                      }`}
                  >
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-semibold text-white block">{getTimeAgo(log.createdAt)}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold border ${log.eventType === "SUSPICIOUS_ACTIVITY"
                            ? "bg-red-500/15 text-[#F87171] border-red-500/30"
                            : log.eventType === "AUTHENTICATION"
                              ? "bg-blue-500/15 text-[#60A5FA] border-blue-500/30"
                              : log.eventType === "RISK"
                                ? "bg-amber-500/15 text-[#FCD34D] border-amber-500/30"
                                : log.eventType === "INCIDENT"
                                  ? "bg-purple-500/15 text-[#C084FC] border-purple-500/30"
                                  : "bg-slate-500/15 text-slate-300 border-slate-500/30"
                          }`}
                      >
                        {log.eventType.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap font-mono text-[11px] text-[#38BDF8] font-semibold">
                      {log.action}
                    </td>
                    <td className="px-4 py-3.5 text-slate-200 text-xs max-w-md leading-relaxed">
                      {log.description}
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap font-mono text-[10px] text-slate-400">
                      {log.ipAddress || "127.0.0.1 (local)"}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {log.user && (
                        <p className="font-semibold text-white text-[11px]">{log.user.fullName}</p>
                      )}
                      {log.asset && (
                        <p className="text-[10px] text-[#60A5FA] mt-0.5">🖥️ {log.asset.name}</p>
                      )}
                      {!log.user && !log.asset && <span className="text-slate-400 italic">System Engine</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Simulate Event Modal (Liquid Glass) */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1530]/80 p-4 backdrop-blur-xl animate-in fade-in duration-200">
          <GlassCard variant="raised" glow="blue" className="w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-[#F5F8FF] text-sm flex items-center gap-2">
                <Radio size={16} className="text-[#38BDF8]" />
                Trigger Simulated Security Telemetry
              </h3>
              <button
                onClick={() => setShowSimModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSimulate} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="mb-1 block font-medium text-slate-300">Select Test Scenario</label>
                <select
                  value={simForm.scenario}
                  onChange={(e) => setSimForm({ ...simForm, scenario: e.target.value })}
                  className="glass-input w-full p-2.5 text-xs text-[#F5F8FF] cursor-pointer"
                >
                  <option value="FAILED_LOGIN_BURST" className="bg-[#0A1530]">
                    🚨 Repeated Failed Logins (3 burst attempts)
                  </option>
                  <option value="PRIVILEGE_ESCALATION" className="bg-[#0A1530]">
                    ⚠️ Privilege Escalation Attempt (Unauthorized Admin)
                  </option>
                  <option value="OFF_HOURS_ACCESS" className="bg-[#0A1530]">
                    🌙 Suspicious Off-Hours Access (03:14 AM session)
                  </option>
                  <option value="SSO_SUCCESS" className="bg-[#0A1530]">
                    ✓ Routine Single Sign-On (SSO) Success
                  </option>
                </select>
                <p className="mt-1 text-[10px] text-slate-400">
                  'Repeated Failed Logins' feeds into Risk Engine rule LG-01 upon recalculation.
                </p>
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-300">Target User Identity</label>
                <select
                  value={simForm.userId}
                  onChange={(e) => setSimForm({ ...simForm, userId: e.target.value })}
                  className="glass-input w-full p-2.5 text-xs text-[#F5F8FF] cursor-pointer"
                >
                  <option value="" className="bg-[#0A1530]">-- Choose User (Optional) --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id} className="bg-[#0A1530]">
                      {u.fullName} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-300">Target Digital Asset</label>
                <select
                  value={simForm.assetId}
                  onChange={(e) => setSimForm({ ...simForm, assetId: e.target.value })}
                  className="glass-input w-full p-2.5 text-xs text-[#F5F8FF] cursor-pointer"
                >
                  <option value="" className="bg-[#0A1530]">-- Choose Asset (Optional) --</option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id} className="bg-[#0A1530]">
                      {a.name} [{a.code}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-5 flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowSimModal(false)}
                  className="btn-secondary-glass text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={simulating}
                  className="btn-primary-glass text-xs font-semibold disabled:opacity-50 cursor-pointer shadow-lg shadow-blue-500/20"
                >
                  {simulating ? "Generating Event..." : "Emit Simulated Telemetry"}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}