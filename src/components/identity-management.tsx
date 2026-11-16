"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Users, UserCheck, UserX, ShieldAlert, Plus, Edit2,
  Trash2, Eye, X, Search, Filter, RefreshCw, KeyRound, Check
} from "lucide-react";
import GlassCard from "@/components/ui/glass-card";

type Department = {
  id: string;
  name: string;
  code: string;
  _count?: { users: number };
};

type User = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  departmentId: string | null;
  department: Department | null;
  createdAt: string;
  accessGrants?: Array<{
    id: string;
    accessLevel: string;
    isExpected: boolean;
    asset: {
      id: string;
      name: string;
      code: string;
      category: string;
    };
  }>;
  riskFindings?: Array<{
    id: string;
    findingCode: string;
    title: string;
    severity: string;
    status: string;
  }>;
  activities?: Array<{
    id: string;
    action: string;
    description: string;
    createdAt: string;
  }>;
};

const ROLES = ["STUDENT", "FACULTY", "DEPARTMENT_MANAGER", "SECURITY_ANALYST", "ADMIN"];
const STATUSES = ["ACTIVE", "INACTIVE"];

export default function IdentityManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "STUDENT",
    departmentId: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const [usersRes, deptsRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/departments"),
      ]);

      const usersData = await usersRes.json();
      const deptsData = await deptsRes.json();

      if (usersData.success) setUsers(usersData.data);
      if (deptsData.success) setDepartments(deptsData.data);
    } catch {
      setMessage({ text: "Failed to load directory.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to create user");
      }

      setMessage({ text: "User identity created successfully.", type: "success" });
      setShowCreateModal(false);
      setFormData({ fullName: "", email: "", role: "STUDENT", departmentId: "" });
      await loadData();
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : "Error creating user.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(e: FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: editingUser.fullName,
          email: editingUser.email,
          role: editingUser.role,
          status: editingUser.status,
          departmentId: editingUser.departmentId,
        }),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to update user");
      }

      setMessage({ text: "Identity updated successfully.", type: "success" });
      setEditingUser(null);
      await loadData();
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : "Error updating identity.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(user: User) {
    const nextStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const result = await res.json();
      if (result.success) {
        setMessage({
          text: `Account ${user.fullName} is now ${nextStatus}.`,
          type: "success",
        });
        await loadData();
      }
    } catch {
      setMessage({ text: "Unable to toggle status.", type: "error" });
    }
  }

  async function openUserDetails(user: User) {
    setViewingUser(user);
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/users/${user.id}`);
      const result = await res.json();
      if (result.success) {
        setViewingUser(result.data);
      }
    } catch {
      // Use fallback
    } finally {
      setLoadingDetails(false);
    }
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.department?.name || "").toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchesStatus = statusFilter === "ALL" || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "ACTIVE").length;
  const inactiveUsers = users.filter((u) => u.status === "INACTIVE").length;
  const privilegedUsers = users.filter(
    (u) => u.role === "ADMIN" || u.role === "SECURITY_ANALYST" || u.role === "DEPARTMENT_MANAGER"
  ).length;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-500/15 text-purple-200 border-purple-400/35";
      case "SECURITY_ANALYST":
        return "bg-blue-500/15 text-blue-200 border-blue-400/35";
      case "DEPARTMENT_MANAGER":
        return "bg-indigo-500/15 text-indigo-200 border-indigo-400/35";
      case "FACULTY":
        return "bg-amber-500/15 text-amber-200 border-amber-400/35";
      default:
        return "bg-teal-500/15 text-teal-200 border-teal-400/35";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Identity & Account Management
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300/80">
            Directory of campus students, faculty, and administrative staff with governance status.
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
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 btn-primary-glass px-5 py-2 text-xs cursor-pointer"
          >
            <Plus size={16} />
            Create Identity
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
        <GlassCard glow="blue" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300/80">Total Identities</span>
            <div className="rounded-xl bg-blue-500/20 p-2.5 text-[#60A5FA] border border-blue-500/30">
              <Users size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-white tracking-tight tabular-nums">{totalUsers}</p>
          <p className="mt-1 text-xs text-slate-300/80 font-mono">University directory total</p>
        </GlassCard>

        <GlassCard glow="emerald" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300/80">Active Accounts</span>
            <div className="rounded-xl bg-emerald-500/20 p-2.5 text-[#6EE7B7] border border-emerald-500/30">
              <UserCheck size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-[#6EE7B7] tracking-tight tabular-nums">{activeUsers}</p>
          <p className="mt-1 text-xs text-slate-300/80 font-mono">Authorized login state</p>
        </GlassCard>

        <GlassCard glow="warning" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300/80">Inactive Accounts</span>
            <div className="rounded-xl bg-amber-500/20 p-2.5 text-[#FCD34D] border border-amber-500/30">
              <UserX size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-[#FCD34D] tracking-tight tabular-nums">{inactiveUsers}</p>
          <p className="mt-1 text-xs text-slate-300/80 font-mono">Disabled or deprovisioned</p>
        </GlassCard>

        <GlassCard glow="sky" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300/80">Privileged Roles</span>
            <div className="rounded-xl bg-indigo-500/20 p-2.5 text-[#7DD3FC] border border-indigo-500/30">
              <KeyRound size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-white tracking-tight tabular-nums">{privilegedUsers}</p>
          <p className="mt-1 text-xs text-slate-300/80 font-mono">Admin, Analyst & Managers</p>
        </GlassCard>
      </div>

      {/* Filter and Search Bar */}
      <GlassCard className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by name, email, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl glass-input py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-400 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <Filter size={14} /> Filter:
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl glass-input px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.replace("_", " ")}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl glass-input px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
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
                <th className="px-4 py-3.5 font-semibold">User Identity</th>
                <th className="px-3 py-3.5 font-semibold">Role</th>
                <th className="px-3 py-3.5 font-semibold">Department</th>
                <th className="px-3 py-3.5 font-semibold">Status</th>
                <th className="px-4 py-3.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    Loading identity directory...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    No matching users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.05] transition">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#3B82F6]/30 to-[#60A5FA]/20 text-xs font-bold text-[#7DD3FC] border border-blue-400/35 shadow-sm">
                          {user.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{user.fullName}</p>
                          <p className="text-[11px] text-slate-300/80 font-mono">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${getRoleBadge(user.role)}`}>
                        {user.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-slate-200">
                      {user.department ? (
                        <span>
                          {user.department.name}{" "}
                          <span className="text-[10px] text-[#7DD3FC] font-mono">({user.department.code})</span>
                        </span>
                      ) : (
                        <span className="italic text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${user.status === "ACTIVE"
                            ? "bg-emerald-500/15 text-[#6EE7B7] border-emerald-500/35"
                            : "bg-slate-500/15 text-slate-300 border-slate-500/35"
                          }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${user.status === "ACTIVE" ? "bg-[#6EE7B7] shadow-sm shadow-emerald-400" : "bg-slate-400"
                            }`}
                        />
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openUserDetails(user)}
                          title="View Identity Dossier"
                          className="rounded-full p-2 text-slate-300 hover:bg-white/10 hover:text-white transition"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => setEditingUser(user)}
                          title="Edit User"
                          className="rounded-full p-2 text-slate-300 hover:bg-white/10 hover:text-white transition"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          title={user.status === "ACTIVE" ? "Deactivate User" : "Activate User"}
                          className={`rounded-full px-3 py-1 text-[11px] font-semibold border transition cursor-pointer ${user.status === "ACTIVE"
                              ? "border-red-400/40 text-[#F87171] hover:bg-red-500/15"
                              : "border-emerald-400/40 text-[#6EE7B7] hover:bg-emerald-500/15"
                            }`}
                        >
                          {user.status === "ACTIVE" ? "Deactivate" : "Activate"}
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
            <p className="py-6 text-center text-xs text-slate-400">Loading identity directory...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">No matching users found.</p>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className="rounded-2xl bg-white/[0.03] p-4 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#3B82F6]/30 to-[#60A5FA]/20 text-xs font-bold text-[#7DD3FC] border border-blue-400/35 shadow-sm">
                      {user.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-xs">{user.fullName}</p>
                      <p className="text-[11px] text-slate-400 font-mono truncate max-w-[180px]">{user.email}</p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold border ${user.status === "ACTIVE"
                        ? "bg-emerald-500/15 text-[#6EE7B7] border-emerald-500/35"
                        : "bg-slate-500/15 text-slate-300 border-slate-500/35"
                      }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${user.status === "ACTIVE" ? "bg-[#6EE7B7]" : "bg-slate-400"}`} />
                    {user.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${getRoleBadge(user.role)}`}>
                    {user.role.replace("_", " ")}
                  </span>
                  <span className="text-slate-300 text-[11px]">
                    {user.department ? `${user.department.name} (${user.department.code})` : "Unassigned"}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => openUserDetails(user)}
                    className="btn-secondary-glass px-3 py-1 text-[11px]"
                  >
                    Dossier
                  </button>
                  <button
                    onClick={() => setEditingUser(user)}
                    className="btn-secondary-glass px-3 py-1 text-[11px]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(user)}
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold border ${user.status === "ACTIVE"
                        ? "border-red-400/40 text-[#F87171] bg-red-500/10"
                        : "border-emerald-400/40 text-[#6EE7B7] bg-emerald-500/10"
                      }`}
                  >
                    {user.status === "ACTIVE" ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>

      {/* Create User Modal (Liquid Glass) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1530]/80 p-4 backdrop-blur-md animate-in fade-in">
          <GlassCard variant="raised" className="w-full max-w-md p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-sm">Add University Identity</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="mb-1 block font-medium text-slate-200">Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Dr. Ramesh Kumar"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full rounded-2xl glass-input p-2.5 text-xs text-white focus:outline-none"
                >
                </input>
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-200">University Email</label>
                <input
                  required
                  type="email"
                  placeholder="e.g. ramesh@example.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-2xl glass-input p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-200">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full rounded-2xl glass-input p-2.5 text-xs text-white focus:outline-none"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-200">Department</label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full rounded-2xl glass-input p-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
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
                  {saving ? "Creating..." : "Save Identity"}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1530]/80 p-4 backdrop-blur-md animate-in fade-in">
          <GlassCard variant="raised" className="w-full max-w-md p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-sm">Edit Identity: {editingUser.fullName}</h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="mb-1 block font-medium text-slate-200">Full Name</label>
                <input
                  required
                  type="text"
                  value={editingUser.fullName}
                  onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                  className="w-full rounded-2xl glass-input p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-200">University Email</label>
                <input
                  required
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full rounded-2xl glass-input p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-medium text-slate-200">Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full rounded-2xl glass-input p-2.5 text-xs text-white focus:outline-none"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-medium text-slate-200">Status</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                    className="w-full rounded-2xl glass-input p-2.5 text-xs text-white focus:outline-none"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-200">Department</label>
                <select
                  value={editingUser.departmentId || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, departmentId: e.target.value || null })}
                  className="w-full rounded-2xl glass-input p-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-5 flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="btn-secondary-glass px-4 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary-glass px-5 py-2 text-xs disabled:opacity-50"
                >
                  {saving ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* User Details Dossier Modal (Liquid Glass) */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1530]/80 p-4 backdrop-blur-md animate-in fade-in">
          <GlassCard variant="raised" className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-7">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-bold text-white">{viewingUser.fullName}</h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${viewingUser.status === "ACTIVE"
                        ? "bg-emerald-500/15 text-[#6EE7B7] border-emerald-500/35"
                        : "bg-slate-500/15 text-slate-300 border-slate-500/35"
                      }`}
                  >
                    {viewingUser.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300/80 font-mono mt-0.5">{viewingUser.email}</p>
              </div>
              <button onClick={() => setViewingUser(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-5 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-2xl bg-white/[0.04] border border-white/10 p-4">
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-300/80">Assigned Role</p>
                  <p className="font-semibold text-[#7DD3FC] mt-0.5">{viewingUser.role.replace("_", " ")}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-300/80">Department</p>
                  <p className="font-semibold text-white mt-0.5">{viewingUser.department?.name || "Unassigned"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-300/80">System ID</p>
                  <p className="font-mono text-[11px] text-slate-300 mt-0.5">{viewingUser.id.slice(0, 14)}...</p>
                </div>
              </div>

              {/* Assigned Assets */}
              <div>
                <h4 className="font-bold text-white flex items-center gap-1.5 mb-2.5">
                  <KeyRound size={15} className="text-[#60A5FA]" />
                  Assigned Digital Access & Privileges
                </h4>
                {loadingDetails ? (
                  <p className="text-slate-400">Loading access grants...</p>
                ) : (viewingUser.accessGrants || []).length === 0 ? (
                  <p className="text-slate-400 italic">No direct digital assets granted to this account.</p>
                ) : (
                  <div className="rounded-2xl border border-white/10 divide-y divide-white/5 overflow-hidden">
                    {viewingUser.accessGrants?.map((grant) => (
                      <div key={grant.id} className="flex items-center justify-between p-3.5 bg-white/[0.02]">
                        <div>
                          <p className="font-semibold text-white">{grant.asset.name}</p>
                          <p className="text-[10px] text-slate-300/80 font-mono">
                            {grant.asset.code} · {grant.asset.category}
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

              {/* Related Risk Findings */}
              <div>
                <h4 className="font-bold text-white flex items-center gap-1.5 mb-2.5">
                  <ShieldAlert size={15} className="text-[#F87171]" />
                  Associated Risk Findings
                </h4>
                {(viewingUser.riskFindings || []).length === 0 ? (
                  <p className="text-slate-400 italic">No active risk findings logged for this identity.</p>
                ) : (
                  <div className="space-y-2">
                    {viewingUser.riskFindings?.map((finding) => (
                      <div
                        key={finding.id}
                        className="flex items-center justify-between rounded-2xl border border-red-500/25 p-3.5 bg-red-500/10"
                      >
                        <div>
                          <span className="text-[10px] font-mono text-[#F87171] mr-2 font-bold">{finding.findingCode}</span>
                          <span className="font-semibold text-white">{finding.title}</span>
                        </div>
                        <span className="rounded-full bg-red-500/25 border border-red-500/40 px-2.5 py-0.5 text-[9px] font-bold text-[#F87171]">
                          {finding.severity}
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