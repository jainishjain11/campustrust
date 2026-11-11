"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Fingerprint, ShieldAlert, ShieldCheck, Plus, Trash2,
  X, Search, Filter, RefreshCw, KeyRound, AlertTriangle
} from "lucide-react";

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
      setMessage({ text: "Failed to load access entitlement matrix.", type: "error" });
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
        throw new Error(result.message || "Failed to grant access.");
      }

      setMessage({ text: result.message || "Access granted.", type: "success" });
      setShowGrantModal(false);
      setGrantForm({ userId: "", assetId: "", accessLevel: "READ", isExpected: true });
      await loadData();
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Error granting access.", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleCompliance(grant: AccessGrant) {
    try {
      const res = await fetch(`/api/access/${grant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isExpected: !grant.isExpected }),
      });
      const result = await res.json();
      if (result.success) {
        setMessage({
          text: `Entitlement updated: marked as ${!grant.isExpected ? "Compliant" : "Unexpected Out-of-Role"}.`,
          type: "success",
        });
        await loadData();
      }
    } catch {
      setMessage({ text: "Unable to update entitlement certification.", type: "error" });
    }
  }

  async function handleRevoke(grant: AccessGrant) {
    if (!confirm(`Revoke ${grant.accessLevel} access for ${grant.user.fullName} on ${grant.asset.name}?`)) {
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
      setMessage({ text: "Unable to revoke access.", type: "error" });
    }
  }

  const filteredGrants = grants.filter((g) => {
    const matchesSearch =
      g.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      g.user.email.toLowerCase().includes(search.toLowerCase()) ||
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
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-[26px]">
            Access Governance & Entitlement Matrix
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Verify user-to-asset permissions, audit privileged access, and flag out-of-role entitlements.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 rounded-xl liquid-glass px-3 py-2 text-xs font-medium text-slate-300 hover:text-white border-white/10 transition cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={() => setShowGrantModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:from-cyan-300 hover:to-blue-400 transition cursor-pointer"
          >
            <Plus size={15} />
            Assign Entitlement
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

      {/* Stat Cards (Liquid Glass) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl liquid-glass p-5 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Entitlements</span>
            <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-400 border border-blue-500/20">
              <KeyRound size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-white tracking-tight">{totalGrants}</p>
          <p className="mt-1 text-[11px] text-slate-400 font-mono">Granted permission paths</p>
        </div>

        <div className="rounded-2xl liquid-glass p-5 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Out-of-Role Entitlements</span>
            <div className="rounded-xl bg-red-500/10 p-2.5 text-red-400 border border-red-500/20">
              <AlertTriangle size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-red-400 tracking-tight">{unexpectedCount}</p>
          <p className="mt-1 text-[11px] text-slate-400 font-mono">Out-of-role permissions</p>
        </div>

        <div className="rounded-2xl liquid-glass p-5 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Admin Privileges</span>
            <div className="rounded-xl bg-purple-500/10 p-2.5 text-purple-400 border border-purple-500/20">
              <Fingerprint size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-purple-300 tracking-tight">{adminGrants}</p>
          <p className="mt-1 text-[11px] text-slate-400 font-mono">High-privilege accounts</p>
        </div>

        <div className="rounded-2xl liquid-glass p-5 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">High-Criticality Assets</span>
            <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-400 border border-amber-500/20">
              <ShieldAlert size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-amber-400 tracking-tight">{highCritGrants}</p>
          <p className="mt-1 text-[11px] text-slate-400 font-mono">Tier 1 & 2 asset grants</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl liquid-glass p-5 border border-white/10 shadow-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search user, asset code, or application name..."
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
              value={complianceFilter}
              onChange={(e) => setComplianceFilter(e.target.value)}
              className="rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
            >
              <option value="ALL">All Entitlements</option>
              <option value="UNEXPECTED">⚠️ Flagged Out-of-Role Only</option>
              <option value="COMPLIANT">✓ Compliant Role-Based</option>
            </select>

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
            >
              <option value="ALL">All Levels</option>
              <option value="ADMIN">ADMIN</option>
              <option value="WRITE">WRITE</option>
              <option value="READ">READ</option>
            </select>
          </div>
        </div>

        {/* Access Matrix Table */}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-xs">
            <thead className="border-b border-white/10 text-[10px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">User Identity</th>
                <th className="px-3 py-3 font-semibold">Asset Application</th>
                <th className="px-3 py-3 font-semibold">Access Level</th>
                <th className="px-3 py-3 font-semibold">Compliance Status</th>
                <th className="px-3 py-3 font-semibold">Granted Date</th>
                <th className="px-4 py-3 text-right font-semibold">Review Actions</th>
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
                    className={`transition hover:bg-white/[0.04] ${
                      !grant.isExpected ? "bg-red-500/[0.06]" : ""
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="font-semibold text-white">{grant.user.fullName}</p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {grant.user.role} {grant.user.department ? `· ${grant.user.department.name}` : ""}
                        </p>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <p className="font-semibold text-white">{grant.asset.name}</p>
                      <p className="font-mono text-[10px] text-cyan-400">
                        {grant.asset.code} · Criticality {grant.asset.criticality}/5
                      </p>
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className={`rounded-md px-2.5 py-1 font-mono text-[10px] font-bold border ${
                          grant.accessLevel === "ADMIN"
                            ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                            : grant.accessLevel === "WRITE"
                            ? "bg-blue-500/10 text-blue-300 border-blue-500/30"
                            : "bg-slate-500/10 text-slate-300 border-slate-500/30"
                        }`}
                      >
                        {grant.accessLevel}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      {!grant.isExpected ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-0.5 text-[10px] font-bold text-red-300 border border-red-500/30">
                          <AlertTriangle size={12} />
                          Out-of-Role / Excessive
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
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
                          className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold border transition cursor-pointer ${
                            grant.isExpected
                              ? "border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                              : "border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
                          }`}
                        >
                          {grant.isExpected ? "Flag Out-of-Role" : "Certify Access"}
                        </button>
                        <button
                          onClick={() => handleRevoke(grant)}
                          title="Revoke Permission"
                          className="flex items-center gap-1 rounded-lg border border-red-500/30 px-2.5 py-1 text-[10px] font-semibold text-red-300 hover:bg-red-500/10 transition cursor-pointer"
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
      </div>

      {/* Grant Access Modal (Liquid Glass) */}
      {showGrantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl liquid-glass p-6 border border-white/15 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-sm">Assign Access Entitlement</h3>
              <button onClick={() => setShowGrantModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateGrant} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="mb-1 block font-medium text-slate-300">Select User Account</label>
                <select
                  required
                  value={grantForm.userId}
                  onChange={(e) => setGrantForm({ ...grantForm, userId: e.target.value })}
                  className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
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
                <label className="mb-1 block font-medium text-slate-300">Select Digital Asset / Application</label>
                <select
                  required
                  value={grantForm.assetId}
                  onChange={(e) => setGrantForm({ ...grantForm, assetId: e.target.value })}
                  className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                >
                  <option value="">-- Choose Asset --</option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} [{a.code}] - Criticality {a.criticality}/5
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-300">Access Privilege Level</label>
                <select
                  value={grantForm.accessLevel}
                  onChange={(e) => setGrantForm({ ...grantForm, accessLevel: e.target.value })}
                  className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                >
                  <option value="READ">READ (Standard View & Query)</option>
                  <option value="WRITE">WRITE (Create, Edit, & Update Data)</option>
                  <option value="ADMIN">ADMIN (Full Administrative Control)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isExpected"
                  checked={grantForm.isExpected}
                  onChange={(e) => setGrantForm({ ...grantForm, isExpected: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-400"
                />
                <label htmlFor="isExpected" className="text-xs text-slate-300 font-medium">
                  Mark as role-compliant expected entitlement
                </label>
              </div>
              <p className="text-[10px] text-slate-400">
                If unchecked or if out-of-role privilege is detected, CampusTrust will automatically generate a risk finding.
              </p>

              <div className="mt-5 flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowGrantModal(false)}
                  className="rounded-xl border border-white/10 px-3.5 py-2 text-xs text-slate-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-xs font-bold text-slate-950 hover:from-cyan-300 hover:to-blue-400 disabled:opacity-50"
                >
                  {saving ? "Granting..." : "Assign Entitlement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
