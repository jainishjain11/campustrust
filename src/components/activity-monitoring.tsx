"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Activity, AlertTriangle, ShieldCheck, RefreshCw,
  Search, Filter, Plus, Radio, Server, UserCheck, X,
  Terminal, Shield
} from "lucide-react";

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
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-[26px]">
            Security Activity & Telemetry Monitoring
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Real-time simulated audit trail for authentication, access grants, and security anomalies.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadLogs}
            className="flex items-center gap-1.5 rounded-xl liquid-glass px-3 py-2 text-xs font-medium text-slate-300 hover:text-white border-white/10 transition cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={() => setShowSimModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:from-cyan-300 hover:to-blue-400 transition cursor-pointer"
          >
            <Radio size={15} />
            Simulate Event
          </button>
        </div>
      </div>

      {/* Academic Prototype Notice */}
      <div className="rounded-2xl liquid-glass border border-cyan-500/30 p-4 text-xs text-cyan-200 flex items-center gap-3 shadow-lg shadow-cyan-950/20">
        <Activity size={18} className="text-cyan-400 shrink-0" />
        <p>
          <strong className="font-semibold text-white">Simulated Telemetry Environment:</strong> All authentication logs and anomaly events are generated for academic demonstration and risk evaluation verification.
        </p>
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

      {/* Stat Cards (Liquid Glass) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl liquid-glass p-5 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Telemetry Logs</span>
            <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-400 border border-blue-500/20">
              <Activity size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-white tracking-tight">{totalLogs}</p>
          <p className="mt-1 text-[11px] text-slate-400 font-mono">Recorded events</p>
        </div>

        <div className="rounded-2xl liquid-glass p-5 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Authentication Events</span>
            <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400 border border-emerald-500/20">
              <UserCheck size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-emerald-400 tracking-tight">{authEvents}</p>
          <p className="mt-1 text-[11px] text-slate-400 font-mono">Logins & SSO sessions</p>
        </div>

        <div className="rounded-2xl liquid-glass p-5 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Security Anomalies</span>
            <div className="rounded-xl bg-red-500/10 p-2.5 text-red-400 border border-red-500/20">
              <AlertTriangle size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-red-400 tracking-tight">{anomalyEvents}</p>
          <p className="mt-1 text-[11px] text-slate-400 font-mono">Failed bursts & escalation</p>
        </div>

        <div className="rounded-2xl liquid-glass p-5 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Risk & Incident Events</span>
            <div className="rounded-xl bg-purple-500/10 p-2.5 text-purple-400 border border-purple-500/20">
              <ShieldCheck size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-purple-300 tracking-tight">{riskEvents}</p>
          <p className="mt-1 text-[11px] text-slate-400 font-mono">Engine & ticket actions</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl liquid-glass p-5 border border-white/10 shadow-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by action, description, user, or asset..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl bg-slate-950/60 border border-white/10 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Filter size={14} /> Event Type:
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
            >
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Activity Table (Liquid Glass Dark Console) */}
        <div className="mt-5 overflow-x-auto">
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
                    className={`transition hover:bg-white/[0.04] ${
                      log.eventType === "SUSPICIOUS_ACTIVITY" ? "bg-red-500/[0.06]" : ""
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
                        className={`rounded-md px-2.5 py-1 text-[9px] font-bold border ${
                          log.eventType === "SUSPICIOUS_ACTIVITY"
                            ? "bg-red-500/10 text-red-300 border-red-500/30"
                            : log.eventType === "AUTHENTICATION"
                            ? "bg-blue-500/10 text-blue-300 border-blue-500/30"
                            : log.eventType === "RISK"
                            ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                            : log.eventType === "INCIDENT"
                            ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                            : "bg-slate-500/10 text-slate-300 border-slate-500/30"
                        }`}
                      >
                        {log.eventType.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap font-mono text-[10px] text-cyan-400 font-medium">
                      {log.action}
                    </td>
                    <td className="px-4 py-3.5 text-slate-300 text-[11px] max-w-md leading-relaxed">
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
                        <p className="text-[10px] text-slate-400 mt-0.5">🖥️ {log.asset.name}</p>
                      )}
                      {!log.user && !log.asset && <span className="text-slate-400 italic">System Engine</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulate Event Modal (Liquid Glass) */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl liquid-glass p-6 border border-white/15 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-sm">Trigger Simulated Security Telemetry</h3>
              <button onClick={() => setShowSimModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSimulate} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="mb-1 block font-medium text-slate-300">Select Test Scenario</label>
                <select
                  value={simForm.scenario}
                  onChange={(e) => setSimForm({ ...simForm, scenario: e.target.value })}
                  className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                >
                  <option value="FAILED_LOGIN_BURST">
                    🚨 Repeated Failed Logins (3 burst attempts)
                  </option>
                  <option value="PRIVILEGE_ESCALATION">
                    ⚠️ Privilege Escalation Attempt (Unauthorized Admin)
                  </option>
                  <option value="OFF_HOURS_ACCESS">
                    🌙 Suspicious Off-Hours Access (03:14 AM session)
                  </option>
                  <option value="SSO_SUCCESS">
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
                  className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                >
                  <option value="">-- Choose User (Optional) --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
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
                  className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                >
                  <option value="">-- Choose Asset (Optional) --</option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} [{a.code}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-5 flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowSimModal(false)}
                  className="rounded-xl border border-white/10 px-3.5 py-2 text-xs text-slate-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={simulating}
                  className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-xs font-bold text-slate-950 hover:from-cyan-300 hover:to-blue-400 disabled:opacity-50"
                >
                  {simulating ? "Generating Event..." : "Emit Simulated Telemetry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
