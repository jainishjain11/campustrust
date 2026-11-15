"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Fingerprint, ShieldAlert, ShieldCheck, Plus, Trash2,
  X, Search, Filter, RefreshCw, KeyRound, AlertTriangle
} from "lucide-react";
import GlassCard from "@/components/ui/glass-card";

type AccessGrant = {
  id: string;
  accessLevel: string;
  isExpected: boolean;
  grantedAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    status: string;
    department?: { name: string; code: string } | null;
  };
  asset: {
    id: string;
    name: string;
    code: string;
    category: string;
    criticality: number;
    status: string;
  };
};

type UserOption = {
  id: string;
  fullName: string;
  email: string;
  role: string;
};

type AssetOption = {
  id: string;
  name: string;
  code: string;
  criticality: number;
};

export default function AccessReviews() {
  const [grants, setGrants] = useState<AccessGrant[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [assets, setAssets] = useState<AssetOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [complianceFilter, setComplianceFilter] = useState("ALL");
  const [levelFilter, setLevelFilter] = useState("ALL");

  const [showGrantModal, setShowGrantModal] = useState(false);
  const [grantForm, setGrantForm] = useState({
    userId: "",
    assetId: "",
    accessLevel: "READ",
    isExpected: true,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const [grantsRes, usersRes, assetsRes] = await Promise.all([
        fetch("/api/access"),
        fetch("/api/users"),
        fetch("/api/assets"),
      ]);

      const grantsData = await grantsRes.json();
      const usersData = await usersRes.json();
      const assetsData = await assetsRes.json();

      if (grantsData.success) setGrants(grantsData.data);
      if (usersData.success) setUsers(usersData.data);
      if (assetsData.success) setAssets(assetsData.data);
    } catch {
      setMessage({ text: "Failed to load access reviews.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreateGrant(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(grantForm),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to create access grant.");
      }

      setMessage({ text: "Access entitlement assigned successfully.", type: "success" });
      setShowGrantModal(false);
      setGrantForm({ userId: "", assetId: "", accessLevel: "READ", isExpected: true });
      await loadData();
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : "Error creating access entitlement.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleCompliance(grant: AccessGrant) {
    const updatedStatus = !grant.isExpected;
    try {
      const res = await fetch(`/api/access/${grant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isExpected: updatedStatus }),
      });
      const result = await res.json();

      if (result.success) {
        setMessage({
          text: updatedStatus
            ? `Entitlement certified as role-compliant.`
            : `Entitlement flagged as unexpected out-of-role access.`,
          type: "success",
        });
        await loadData();
      }
    } catch {
      setMessage({ text: "Unable to update compliance flag.", type: "error" });
    }
  }

  async function handleRevoke(grant: AccessGrant) {
    if (
      !confirm(
        `Are you sure you want to revoke ${grant.accessLevel} access for ${grant.user.fullName} on ${grant.asset.name}?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/access/${grant.id}`, {
        method: "DELETE",
      });
      const result = await res.json();

      if (result.success) {
        setMessage({ text: result.message, type: "success" });
        await loadData();
      }
    } catch {
      setMessage({ text: "Unable to revoke access grant.", type: "error" });
    }
  }

  const filteredGrants = grants.filter((g) => {
    const matchesSearch =
      g.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      g.asset.name.toLowerCase().includes(search.toLowerCase()) ||
      g.asset.code.toLowerCase().includes(search.toLowerCase());

    const matchesCompliance =
      complianceFilter === "ALL" ||
      (complianceFilter === "UNEXPECTED" && !g.isExpected) ||
      (complianceFilter === "COMPLIANT" && g.isExpected);

    const matchesLevel = levelFilter === "ALL" || g.accessLevel === levelFilter;

    return matchesSearch && matchesCompliance && matchesLevel;
  });

  const totalGrants = grants.length;
  const unexpectedCount = grants.filter((g) => !g.isExpected).length;
  const adminGrants = grants.filter((g) => g.accessLevel === "ADMIN").length;
  const highCritGrants = grants.filter((g) => g.asset.criticality >= 4).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Access Reviews & Entitlement Certification
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300/80">
            Audit and verify identity access rights against authorized role baselines across campus applications.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 btn-secondary-glass px-4 py-2 text-xs transition cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={() => setShowGrantModal(true)}
            className="flex items-center gap-1.5 btn-primary-glass px-5 py-2 text-xs cursor-pointer"
          >
            <Plus size={16} />
            Assign Entitlement
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {message && (
        <div
          className={`flex items-center justify-between rounded-2xl p-4 text-xs backdrop-blur-md ${
            message.type === "success"
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

      {/* Stat Cards (Liquid Glass) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlassCard glow="blue" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300/80">Total Entitlements</span>
            <div className="rounded-xl bg-blue-500/20 p-2.5 text-[#60A5FA] border border-blue-500/30">
              <KeyRound size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-white tracking-tight tabular-nums">{totalGrants}</p>
          <p className="mt-1 text-xs text-slate-300/80 font-mono">Granted permission paths</p>
        </GlassCard>

        <GlassCard glow="critical" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300/80">Out-of-Role Entitlements</span>
            <div className="rounded-xl bg-red-500/20 p-2.5 text-[#F87171] border border-red-500/30">
              <AlertTriangle size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-[#F87171] tracking-tight tabular-nums">{unexpectedCount}</p>
          <p className="mt-1 text-xs text-slate-300/80 font-mono">Flagged policy discrepancies</p>
        </GlassCard>

        <GlassCard glow="sky" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300/80">Admin Privileges</span>
            <div className="rounded-xl bg-indigo-500/20 p-2.5 text-[#7DD3FC] border border-indigo-500/30">
              <Fingerprint size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-white tracking-tight tabular-nums">{adminGrants}</p>
          <p className="mt-1 text-xs text-slate-300/80 font-mono">High-privilege accounts</p>
        </GlassCard>

        <GlassCard glow="warning" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300/80">High-Criticality Assets</span>
            <div className="rounded-xl bg-amber-500/20 p-2.5 text-[#FCD34D] border border-amber-500/30">
              <ShieldAlert size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-[#FCD34D] tracking-tight tabular-nums">{highCritGrants}</p>
          <p className="mt-1 text-xs text-slate-300/80 font-mono">Tier 1 & 2 asset grants</p>
        </GlassCard>
      </div>

      {/* Filter and Search Bar */}
      <GlassCard className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search user, asset code, or application name..."
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
              value={complianceFilter}
              onChange={(e) => setComplianceFilter(e.target.value)}
              className="rounded-xl glass-input px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Entitlements</option>
              <option value="UNEXPECTED">⚠️ Flagged Out-of-Role Only</option>
              <option value="COMPLIANT">✓ Compliant Role-Based</option>
            </select>

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="rounded-xl glass-input px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Levels</option>
              <option value="ADMIN">ADMIN</option>
              <option value="WRITE">WRITE</option>
              <option value="READ">READ</option>
            </select>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="mt-5 hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 text-[10px] uppercase tracking-wider text-slate-300/70 bg-white/[0.02]">
              <tr>
                <th className="px-4 py-3.5 font-semibold">User Identity</th>
                <th className="px-3 py-3.5 font-semibold">Asset Application</th>
                <th className="px-3 py-3.5 font-semibold">Access Level</th>
                <th className="px-3 py-3.5 font-semibold">Compliance Status</th>
                <th className="px-3 py-3.5 font-semibold">Granted Date</th>
                <th className="px-4 py-3.5 text-right font-semibold">Review Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    Loading access matrix...
                  </td>
                </tr>
              ) : filteredGrants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No access grants matching criteria.
                  </td>
                </tr>
              ) : (
                filteredGrants.map((grant) => (
                  <tr
                    key={grant.id}
                    className={`transition hover:bg-white/[0.05] ${
                      !grant.isExpected ? "bg-red-500/[0.07]" : ""
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="font-semibold text-white">{grant.user.fullName}</p>
                        <p className="text-[11px] text-slate-300/80 font-mono">
                          {grant.user.role} {grant.user.department ? `· ${grant.user.department.name}` : ""}
                        </p>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <p className="font-semibold text-white">{grant.asset.name}</p>
                      <p className="font-mono text-[10px] text-[#7DD3FC]">
                        {grant.asset.code} · Criticality Tier {grant.asset.criticality}/5
                      </p>
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold border ${
                          grant.accessLevel === "ADMIN"
                            ? "bg-purple-500/15 text-purple-200 border-purple-400/35"
                            : grant.accessLevel === "WRITE"
                            ? "bg-blue-500/15 text-blue-200 border-blue-400/35"
                            : "bg-slate-500/15 text-slate-300 border-slate-500/35"
                        }`}
                      >
                        {grant.accessLevel}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      {!grant.isExpected ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 py-0.5 text-[10px] font-bold text-[#F87171] border border-red-500/35">
                          <AlertTriangle size={12} />
                          Out-of-Role / Excessive
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-[#6EE7B7] border border-emerald-500/35">
                          <ShieldCheck size={12} />
                          Role-Compliant
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3.5 text-slate-400 text-[11px] font-mono">
                      {new Date(grant.grantedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleCompliance(grant)}
                          title={grant.isExpected ? "Flag as Out-of-Role" : "Certify as Compliant"}
                          className={`rounded-full px-3 py-1 text-[11px] font-semibold border transition cursor-pointer ${
                            grant.isExpected
                              ? "border-amber-400/40 text-[#FCD34D] hover:bg-amber-500/15"
                              : "border-emerald-400/40 text-[#6EE7B7] hover:bg-emerald-500/15"
                          }`}
                        >
                          {grant.isExpected ? "Flag Out-of-Role" : "Certify Access"}
                        </button>
                        <button
                          onClick={() => handleRevoke(grant)}
                          title="Revoke Permission"
                          className="flex items-center gap-1 rounded-full border border-red-400/40 px-3 py-1 text-[11px] font-semibold text-[#F87171] hover:bg-red-500/15 transition cursor-pointer"
                        >
                          <Trash2 size={12} />
                          Revoke
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Responsive Cards View */}
        <div className="md:hidden mt-4 space-y-3">
          {loading ? (
            <p className="py-6 text-center text-xs text-slate-400">Loading access matrix...</p>
          ) : filteredGrants.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">No access grants matching criteria.</p>
          ) : (
            filteredGrants.map((grant) => (
              <div
                key={grant.id}
                className={`rounded-2xl p-4 border space-y-3 ${
                  !grant.isExpected
                    ? "bg-red-500/[0.08] border-red-500/30"
                    : "bg-white/[0.03] border-white/10"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-white text-xs">{grant.user.fullName}</p>
                    <p className="text-[11px] text-slate-300/80 font-mono">{grant.user.role} {grant.user.department ? `· ${grant.user.department.name}` : ""}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-mono text-[9px] font-bold border ${
                      grant.accessLevel === "ADMIN"
                        ? "bg-purple-500/15 text-purple-200 border-purple-400/35"
                        : grant.accessLevel === "WRITE"
                        ? "bg-blue-500/15 text-blue-200 border-blue-400/35"
                        : "bg-slate-500/15 text-slate-300 border-slate-500/35"
                    }`}
                  >
                    {grant.accessLevel}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                  <span className="text-white font-medium">{grant.asset.name}</span>
                  <span className="font-mono text-[10px] text-[#7DD3FC]">[{grant.asset.code}]</span>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  {!grant.isExpected ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[9px] font-bold text-[#F87171] border border-red-500/35">
                      <AlertTriangle size={11} />
                      Out-of-Role
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-semibold text-[#6EE7B7] border border-emerald-500/35">
                      <ShieldCheck size={11} />
                      Compliant
                    </span>
                  )}
                  <span className="text-slate-400 font-mono text-[10px]">
                    {new Date(grant.grantedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => handleToggleCompliance(grant)}
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold border ${
                      grant.isExpected
                        ? "border-amber-400/40 text-[#FCD34D] bg-amber-500/10"
                        : "border-emerald-400/40 text-[#6EE7B7] bg-emerald-500/10"
                    }`}
                  >
                    {grant.isExpected ? "Flag" : "Certify"}
                  </button>
                  <button
                    onClick={() => handleRevoke(grant)}
                    className="rounded-full border border-red-400/40 text-[#F87171] bg-red-500/10 px-3 py-1 text-[11px] font-semibold"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>

      {/* Grant Access Modal (Liquid Glass) */}
      {showGrantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1530]/80 p-4 backdrop-blur-md animate-in fade-in">
          <GlassCard variant="raised" className="w-full max-w-md p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-sm">Assign Access Entitlement</h3>
              <button onClick={() => setShowGrantModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateGrant} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="mb-1 block font-medium text-slate-200">Select User Account</label>
                <select
                  required
                  value={grantForm.userId}
                  onChange={(e) => setGrantForm({ ...grantForm, userId: e.target.value })}
                  className="w-full rounded-2xl glass-input p-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="">-- Choose User Identity --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.role}) - {u.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-200">Select Target Asset</label>
                <select
                  required
                  value={grantForm.assetId}
                  onChange={(e) => setGrantForm({ ...grantForm, assetId: e.target.value })}
                  className="w-full rounded-2xl glass-input p-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="">-- Choose Digital System --</option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} [{a.code}] - Criticality Tier {a.criticality}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-medium text-slate-200">Access Level</label>
                  <select
                    value={grantForm.accessLevel}
                    onChange={(e) => setGrantForm({ ...grantForm, accessLevel: e.target.value })}
                    className="w-full rounded-2xl glass-input p-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="READ">READ (Viewer)</option>
                    <option value="WRITE">WRITE (Operator / Editor)</option>
                    <option value="ADMIN">ADMIN (Full Control)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-medium text-slate-200">Policy Baseline</label>
                  <select
                    value={grantForm.isExpected ? "true" : "false"}
                    onChange={(e) => setGrantForm({ ...grantForm, isExpected: e.target.value === "true" })}
                    className="w-full rounded-2xl glass-input p-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="true">Role Compliant (Standard)</option>
                    <option value="false">Out-of-Role (Special Exception)</option>
                  </select>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowGrantModal(false)}
                  className="btn-secondary-glass px-4 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary-glass px-5 py-2 text-xs disabled:opacity-50"
                >
                  {saving ? "Granting..." : "Assign Entitlement"}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
