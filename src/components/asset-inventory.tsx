"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  LockKeyhole, ShieldAlert, Plus, Edit2, Eye, X, Search,
  Filter, RefreshCw, Server, AlertTriangle, KeyRound
} from "lucide-react";
import GlassCard from "@/components/ui/glass-card";

type Asset = {
  id: string;
  name: string;
  code: string;
  category: string;
  description: string | null;
  criticality: number;
  status: string;
  createdAt: string;
  _count?: {
    accessGrants: number;
    riskFindings: number;
    incidents: number;
  };
  accessGrants?: Array<{
    id: string;
    accessLevel: string;
    isExpected: boolean;
    user: {
      id: string;
      fullName: string;
      email: string;
      role: string;
      department?: { name: string } | null;
    };
  }>;
  riskFindings?: Array<{
    id: string;
    findingCode: string;
    title: string;
    severity: string;
    score: number;
    status: string;
  }>;
};

const CATEGORIES = ["Academic", "Research", "Library", "Administration", "Infrastructure"];
const CRITICALITY_LEVELS = [
  { value: 5, label: "5 - Critical (Tier 1 Core)", color: "bg-red-500/15 text-[#F87171] border-red-500/35" },
  { value: 4, label: "4 - High (Tier 2 Vital)", color: "bg-orange-500/15 text-[#FDA672] border-orange-500/35" },
  { value: 3, label: "3 - Moderate (Tier 3 Standard)", color: "bg-amber-500/15 text-[#FCD34D] border-amber-500/35" },
  { value: 2, label: "2 - Low (Tier 4 Internal)", color: "bg-blue-500/15 text-[#60A5FA] border-blue-500/35" },
  { value: 1, label: "1 - Minimal (Informational)", color: "bg-slate-500/15 text-slate-300 border-slate-500/35" },
];

export default function AssetInventory() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [criticalityFilter, setCriticalityFilter] = useState("ALL");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Forms
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category: "Academic",
    criticality: 3,
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  async function loadAssets() {
    setLoading(true);
    try {
      const res = await fetch("/api/assets");
      const result = await res.json();
      if (result.success) setAssets(result.data);
    } catch {
      setMessage({ text: "Failed to load asset inventory.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAssets();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to create asset.");
      }

      setMessage({ text: "Asset registered successfully.", type: "success" });
      setShowCreateModal(false);
      setFormData({ code: "", name: "", category: "Academic", criticality: 3, description: "" });
      await loadAssets();
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : "Error registering asset.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(e: FormEvent) {
    e.preventDefault();
    if (!editingAsset) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/assets/${editingAsset.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingAsset.name,
          category: editingAsset.category,
          criticality: editingAsset.criticality,
          status: editingAsset.status,
          description: editingAsset.description,
        }),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to update asset.");
      }

      setMessage({ text: "Asset updated successfully.", type: "success" });
      setEditingAsset(null);
      await loadAssets();
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : "Error updating asset.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(asset: Asset) {
    const nextStatus = asset.status === "ACTIVE" ? "DECOMMISSIONED" : "ACTIVE";
    try {
      const res = await fetch(`/api/assets/${asset.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const result = await res.json();
      if (result.success) {
        setMessage({
          text: `Asset ${asset.code} status changed to ${nextStatus}.`,
          type: "success",
        });
        await loadAssets();
      }
    } catch {
      setMessage({ text: "Unable to update asset status.", type: "error" });
    }
  }

  async function openAssetDetails(asset: Asset) {
    setViewingAsset(asset);
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/assets/${asset.id}`);
      const result = await res.json();
      if (result.success) {
        setViewingAsset(result.data);
      }
    } catch {
      // Fallback
    } finally {
      setLoadingDetails(false);
    }
  }

  const filteredAssets = assets.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.code.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase());

    const matchesCat = categoryFilter === "ALL" || a.category === categoryFilter;
    const matchesCrit = criticalityFilter === "ALL" || a.criticality === Number(criticalityFilter);

    return matchesSearch && matchesCat && matchesCrit;
  });

  const totalAssets = assets.length;
  const criticalAssets = assets.filter((a) => a.criticality >= 4).length;
  const assetsWithRisks = assets.filter((a) => (a._count?.riskFindings ?? 0) > 0).length;
  const activeAssets = assets.filter((a) => a.status === "ACTIVE").length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Digital Asset & Application Inventory
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300/80">
            Catalog of university portals, repositories, and critical academic information systems.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadAssets}
            className="flex items-center gap-1.5 btn-secondary-glass px-4 py-2 text-xs transition cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 btn-primary-glass px-5 py-2 text-xs cursor-pointer"
          >
            <Plus size={16} />
            Register Asset
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
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300/80">Monitored Assets</span>
            <div className="rounded-xl bg-blue-500/20 p-2.5 text-[#60A5FA] border border-blue-500/30">
              <Server size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-white tracking-tight tabular-nums">{totalAssets}</p>
          <p className="mt-1 text-xs text-slate-300/80 font-mono">Registered systems</p>
        </GlassCard>

        <GlassCard glow="critical" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300/80">Tier-1 & 2 Critical</span>
            <div className="rounded-xl bg-red-500/20 p-2.5 text-[#F87171] border border-red-500/30">
              <AlertTriangle size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-[#F87171] tracking-tight tabular-nums">{criticalAssets}</p>
          <p className="mt-1 text-xs text-slate-300/80 font-mono">Criticality Level 4 & 5</p>
        </GlassCard>

        <GlassCard glow="warning" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300/80">Assets With Open Risks</span>
            <div className="rounded-xl bg-amber-500/20 p-2.5 text-[#FCD34D] border border-amber-500/30">
              <ShieldAlert size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-[#FCD34D] tracking-tight tabular-nums">{assetsWithRisks}</p>
          <p className="mt-1 text-xs text-slate-300/80 font-mono">Requires remediation</p>
        </GlassCard>

        <GlassCard glow="emerald" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300/80">Operational Active</span>
            <div className="rounded-xl bg-emerald-500/20 p-2.5 text-[#6EE7B7] border border-emerald-500/30">
              <LockKeyhole size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-[#6EE7B7] tracking-tight tabular-nums">{activeAssets}</p>
          <p className="mt-1 text-xs text-slate-300/80 font-mono">Live on campus network</p>
        </GlassCard>
      </div>

      {/* Filter and Search Bar */}
      <GlassCard className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by asset code, application name, or category..."
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
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl glass-input px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={criticalityFilter}
              onChange={(e) => setCriticalityFilter(e.target.value)}
              className="rounded-xl glass-input px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Criticality</option>
              <option value="5">Critical (5/5)</option>
              <option value="4">High (4/5)</option>
              <option value="3">Moderate (3/5)</option>
              <option value="2">Low (2/5)</option>
              <option value="1">Minimal (1/5)</option>
            </select>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="mt-5 hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 text-[10px] uppercase tracking-wider text-slate-300/70 bg-white/[0.02]">
              <tr>
                <th className="px-4 py-3.5 font-semibold">Asset Code & Name</th>
                <th className="px-3 py-3.5 font-semibold">Category</th>
                <th className="px-3 py-3.5 font-semibold">Criticality</th>
                <th className="px-3 py-3.5 font-semibold">Entitled Users</th>
                <th className="px-3 py-3.5 font-semibold">Open Risks</th>
                <th className="px-3 py-3.5 font-semibold">Status</th>
                <th className="px-4 py-3.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Loading asset inventory...
                  </td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No matching assets found.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-white/[0.05] transition">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 text-purple-200 border border-purple-400/30 shadow-sm">
                          <Server size={16} />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{asset.name}</p>
                          <p className="font-mono text-[10px] text-[#7DD3FC]">{asset.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-medium text-slate-300 border border-white/10">
                        {asset.category}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                          asset.criticality >= 5
                            ? "bg-red-500/15 text-[#F87171] border-red-500/35"
                            : asset.criticality === 4
                            ? "bg-orange-500/15 text-[#FDA672] border-orange-500/35"
                            : asset.criticality === 3
                            ? "bg-amber-500/15 text-[#FCD34D] border-amber-500/35"
                            : "bg-blue-500/15 text-[#60A5FA] border-blue-500/35"
                        }`}
                      >
                        Tier {asset.criticality}/5
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="font-bold text-white tabular-nums">
                        {asset._count?.accessGrants ?? 0}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1">accounts</span>
                    </td>
                    <td className="px-3 py-3.5">
                      {(asset._count?.riskFindings ?? 0) > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2.5 py-0.5 text-[10px] font-bold text-[#F87171] border border-red-500/35">
                          <ShieldAlert size={12} />
                          {asset._count?.riskFindings} active
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#6EE7B7] font-medium">None</span>
                      )}
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${
                          asset.status === "ACTIVE"
                            ? "bg-emerald-500/15 text-[#6EE7B7] border-emerald-500/35"
                            : "bg-slate-500/15 text-slate-300 border-slate-500/35"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            asset.status === "ACTIVE" ? "bg-[#6EE7B7] shadow-sm shadow-emerald-400" : "bg-slate-400"
                          }`}
                        />
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openAssetDetails(asset)}
                          title="View Security Details"
                          className="rounded-full p-2 text-slate-300 hover:bg-white/10 hover:text-white transition"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => setEditingAsset(asset)}
                          title="Edit Asset"
                          className="rounded-full p-2 text-slate-300 hover:bg-white/10 hover:text-white transition"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(asset)}
                          title={asset.status === "ACTIVE" ? "Decommission Asset" : "Reactivate"}
                          className={`rounded-full px-3 py-1 text-[11px] font-semibold border transition cursor-pointer ${
                            asset.status === "ACTIVE"
                              ? "border-red-400/40 text-[#F87171] hover:bg-red-500/15"
                              : "border-emerald-400/40 text-[#6EE7B7] hover:bg-emerald-500/15"
                          }`}
                        >
                          {asset.status === "ACTIVE" ? "Decommission" : "Activate"}
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
            <p className="py-6 text-center text-xs text-slate-400">Loading asset inventory...</p>
          ) : filteredAssets.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">No matching assets found.</p>
          ) : (
            filteredAssets.map((asset) => (
              <div key={asset.id} className="rounded-2xl bg-white/[0.03] p-4 border border-white/10 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 text-purple-200 border border-purple-400/30 shadow-sm">
                      <Server size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-xs">{asset.name}</p>
                      <p className="font-mono text-[10px] text-[#7DD3FC]">{asset.code}</p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold border ${
                      asset.criticality >= 5
                        ? "bg-red-500/15 text-[#F87171] border-red-500/35"
                        : asset.criticality === 4
                        ? "bg-orange-500/15 text-[#FDA672] border-orange-500/35"
                        : asset.criticality === 3
                        ? "bg-amber-500/15 text-[#FCD34D] border-amber-500/35"
                        : "bg-blue-500/15 text-[#60A5FA] border-blue-500/35"
                    }`}
                  >
                    Tier {asset.criticality}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-2 border-t border-white/5">
                  <div className="rounded-xl bg-white/[0.02] p-1.5 border border-white/5">
                    <span className="text-slate-400 block text-[9px]">Category</span>
                    <span className="font-medium text-white truncate block">{asset.category}</span>
                  </div>
                  <div className="rounded-xl bg-white/[0.02] p-1.5 border border-white/5">
                    <span className="text-slate-400 block text-[9px]">Accounts</span>
                    <span className="font-bold text-white tabular-nums">{asset._count?.accessGrants ?? 0}</span>
                  </div>
                  <div className="rounded-xl bg-white/[0.02] p-1.5 border border-white/5">
                    <span className="text-slate-400 block text-[9px]">Risks</span>
                    <span className={`font-bold tabular-nums ${(asset._count?.riskFindings ?? 0) > 0 ? "text-[#F87171]" : "text-[#6EE7B7]"}`}>
                      {asset._count?.riskFindings ?? 0}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => openAssetDetails(asset)}
                    className="btn-secondary-glass px-3 py-1 text-[11px]"
                  >
                    Dossier
                  </button>
                  <button
                    onClick={() => setEditingAsset(asset)}
                    className="btn-secondary-glass px-3 py-1 text-[11px]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(asset)}
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold border ${
                      asset.status === "ACTIVE"
                        ? "border-red-400/40 text-[#F87171] bg-red-500/10"
                        : "border-emerald-400/40 text-[#6EE7B7] bg-emerald-500/10"
                    }`}
                  >
                    {asset.status === "ACTIVE" ? "Decommission" : "Activate"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>

      {/* Register Asset Modal (Liquid Glass) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1530]/80 p-4 backdrop-blur-md animate-in fade-in">
          <GlassCard variant="raised" className="w-full max-w-md p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-sm">Register Digital Asset</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-medium text-slate-200">Asset Code</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. AST-007"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full rounded-2xl glass-input p-2.5 text-xs text-white uppercase focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-medium text-slate-200">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-2xl glass-input p-2.5 text-xs text-white focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-200">Application Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Examination Result Portal"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-2xl glass-input p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-200">Criticality Rating</label>
                <select
                  value={formData.criticality}
                  onChange={(e) => setFormData({ ...formData, criticality: Number(e.target.value) })}
                  className="w-full rounded-2xl glass-input p-2.5 text-xs text-white focus:outline-none"
                >
                  {CRITICALITY_LEVELS.map((crit) => (
                    <option key={crit.value} value={crit.value}>
                      {crit.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-slate-400">
                  Criticality directly influences the calculated risk impact for security findings.
                </p>
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-200">Description</label>
                <textarea
                  rows={2}
                  placeholder="Purpose, data sensitivity, and scope..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-2xl glass-input p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary-glass px-4 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary-glass px-5 py-2 text-xs disabled:opacity-50"
                >
                  {saving ? "Registering..." : "Register Asset"}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Edit Asset Modal */}
      {editingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1530]/80 p-4 backdrop-blur-md animate-in fade-in">
          <GlassCard variant="raised" className="w-full max-w-md p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-sm">Edit Asset: {editingAsset.code}</h3>
              <button onClick={() => setEditingAsset(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="mb-1 block font-medium text-slate-200">Application Name</label>
                <input
                  required
                  type="text"
                  value={editingAsset.name}
                  onChange={(e) => setEditingAsset({ ...editingAsset, name: e.target.value })}
                  className="w-full rounded-2xl glass-input p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-medium text-slate-200">Category</label>
                  <select
                    value={editingAsset.category}
                    onChange={(e) => setEditingAsset({ ...editingAsset, category: e.target.value })}
                    className="w-full rounded-2xl glass-input p-2.5 text-xs text-white focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-medium text-slate-200">Criticality (1-5)</label>
                  <select
                    value={editingAsset.criticality}
                    onChange={(e) => setEditingAsset({ ...editingAsset, criticality: Number(e.target.value) })}
                    className="w-full rounded-2xl glass-input p-2.5 text-xs text-white focus:outline-none"
                  >
                    {CRITICALITY_LEVELS.map((crit) => (
                      <option key={crit.value} value={crit.value}>
                        {crit.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-200">Operational Status</label>
                <select
                  value={editingAsset.status}
                  onChange={(e) => setEditingAsset({ ...editingAsset, status: e.target.value })}
                  className="w-full rounded-2xl glass-input p-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                  <option value="DECOMMISSIONED">DECOMMISSIONED</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-200">Description</label>
                <textarea
                  rows={2}
                  value={editingAsset.description || ""}
                  onChange={(e) => setEditingAsset({ ...editingAsset, description: e.target.value })}
                  className="w-full rounded-2xl glass-input p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingAsset(null)}
                  className="btn-secondary-glass px-4 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary-glass px-5 py-2 text-xs disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Asset Details Dossier Modal */}
      {viewingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1530]/80 p-4 backdrop-blur-md animate-in fade-in">
          <GlassCard variant="raised" className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-7">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-bold text-white">{viewingAsset.name}</h3>
                  <span className="font-mono text-xs text-[#7DD3FC]">[{viewingAsset.code}]</span>
                </div>
                <p className="text-xs text-slate-300/80">{viewingAsset.category} System</p>
              </div>
              <button onClick={() => setViewingAsset(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-5 text-xs">
              <div className="grid grid-cols-3 gap-3 rounded-2xl bg-white/[0.04] border border-white/10 p-4">
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-300/80">Criticality</p>
                  <p className="font-bold text-[#60A5FA] mt-0.5">Tier {viewingAsset.criticality} / 5</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-300/80">System Status</p>
                  <p className="font-semibold text-[#6EE7B7] mt-0.5">{viewingAsset.status}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-300/80">Classification</p>
                  <p className="font-semibold text-slate-200 mt-0.5">
                    {viewingAsset.criticality >= 4 ? "Confidential" : "Internal"}
                  </p>
                </div>
              </div>

              {viewingAsset.description && (
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-300/80 mb-1">Description & Scope</p>
                  <p className="text-slate-300 bg-white/[0.03] p-3 rounded-2xl border border-white/10 leading-relaxed">
                    {viewingAsset.description}
                  </p>
                </div>
              )}

              {/* Users with Access */}
              <div>
                <h4 className="font-bold text-white flex items-center gap-1.5 mb-2.5">
                  <KeyRound size={15} className="text-[#60A5FA]" />
                  Entitled Users & Access Permissions
                </h4>
                {loadingDetails ? (
                  <p className="text-slate-400">Loading access grants...</p>
                ) : (viewingAsset.accessGrants || []).length === 0 ? (
                  <p className="text-slate-400 italic">No access grants currently recorded for this asset.</p>
                ) : (
                  <div className="rounded-2xl border border-white/10 divide-y divide-white/5 max-h-48 overflow-y-auto">
                    {viewingAsset.accessGrants?.map((grant) => (
                      <div key={grant.id} className="flex items-center justify-between p-3.5 bg-white/[0.02]">
                        <div>
                          <p className="font-semibold text-white">{grant.user.fullName}</p>
                          <p className="text-[10px] text-slate-300/80 font-mono">
                            {grant.user.email} · {grant.user.role} {grant.user.department ? `· ${grant.user.department.name}` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!grant.isExpected && (
                            <span className="rounded-full bg-red-500/20 border border-red-500/40 px-2.5 py-0.5 text-[9px] font-bold text-[#F87171]">
                              OUT-OF-ROLE ACCESS
                            </span>
                          )}
                          <span className="rounded-full bg-white/10 px-3 py-0.5 font-mono text-[10px] font-semibold text-slate-200 border border-white/15">
                            {grant.accessLevel}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Open Risk Findings */}
              <div>
                <h4 className="font-bold text-white flex items-center gap-1.5 mb-2.5">
                  <ShieldAlert size={15} className="text-[#F87171]" />
                  Active Security Findings for this Asset
                </h4>
                {(viewingAsset.riskFindings || []).length === 0 ? (
                  <p className="text-slate-400 italic">No active risk findings for this asset.</p>
                ) : (
                  <div className="space-y-2">
                    {viewingAsset.riskFindings?.map((finding) => (
                      <div
                        key={finding.id}
                        className="flex items-center justify-between rounded-2xl border border-red-500/25 p-3.5 bg-red-500/10"
                      >
                        <div>
                          <span className="text-[10px] font-mono text-[#F87171] mr-2 font-bold">{finding.findingCode}</span>
                          <span className="font-semibold text-white">{finding.title}</span>
                        </div>
                        <span className="rounded-full bg-red-500/25 border border-red-500/40 px-2.5 py-0.5 text-[9px] font-bold text-[#F87171]">
                          {finding.severity} (Score {finding.score})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
