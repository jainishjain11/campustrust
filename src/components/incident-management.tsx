"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  AlertTriangle, CheckCircle2, Clock, Plus, RefreshCw,
  Search, Filter, ShieldAlert, CheckSquare, Square,
  X, User, ArrowRight, Server
} from "lucide-react";

type MitigationTask = {
  id: string;
  title: string;
  description: string;
  status: string;
  dueDate: string | null;
  assignee?: { id: string; fullName: string; role: string } | null;
};

type Incident = {
  id: string;
  incidentCode: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  asset?: { id: string; name: string; code: string } | null;
  riskFinding?: { id: string; findingCode: string; title: string; severity: string } | null;
  reportedBy?: { id: string; fullName: string } | null;
  tasks: MitigationTask[];
};

type UserOption = { id: string; fullName: string; role: string };
type AssetOption = { id: string; name: string; code: string };

const PRIORITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "ACCEPTED"];

export default function IncidentManagement() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [assets, setAssets] = useState<AssetOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeIncidentForTask, setActiveIncidentForTask] = useState<Incident | null>(null);

  // Forms
  const [incidentForm, setIncidentForm] = useState({
    title: "",
    description: "",
    priority: "HIGH",
    assetId: "",
    initialTaskTitle: "Investigate access policy discrepancy",
  });

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    assigneeId: "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const [incidentsRes, usersRes, assetsRes] = await Promise.all([
        fetch("/api/incidents"),
        fetch("/api/users"),
        fetch("/api/assets"),
      ]);

      const incidentsData = await incidentsRes.json();
      const usersData = await usersRes.json();
      const assetsData = await assetsRes.json();

      if (incidentsData.success) setIncidents(incidentsData.data);
      if (usersData.success) setUsers(usersData.data);
      if (assetsData.success) setAssets(assetsData.data);
    } catch {
      setMessage({ text: "Failed to load incidents.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreateIncident(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(incidentForm),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to create incident.");
      }

      setMessage({ text: result.message, type: "success" });
      setShowCreateModal(false);
      setIncidentForm({
        title: "",
        description: "",
        priority: "HIGH",
        assetId: "",
        initialTaskTitle: "Investigate access policy discrepancy",
      });
      await loadData();
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Error creating incident.", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(incident: Incident, newStatus: string) {
    try {
      const res = await fetch(`/api/incidents/${incident.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();
      if (result.success) {
        setMessage({
          text: `Incident ${incident.incidentCode} marked as ${newStatus}.${
            newStatus === "RESOLVED" ? " Associated risk findings automatically resolved." : ""
          }`,
          type: "success",
        });
        await loadData();
      }
    } catch {
      setMessage({ text: "Unable to update incident status.", type: "error" });
    }
  }

  async function handleToggleTask(incident: Incident, task: MitigationTask) {
    const nextStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    try {
      const res = await fetch(`/api/incidents/${incident.id}/tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task.id, status: nextStatus }),
      });
      const result = await res.json();
      if (result.success) {
        await loadData();
      }
    } catch {
      setMessage({ text: "Unable to update task status.", type: "error" });
    }
  }

  async function handleAddTask(e: FormEvent) {
    e.preventDefault();
    if (!activeIncidentForTask) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/incidents/${activeIncidentForTask.id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskForm),
      });
      const result = await res.json();
      if (result.success) {
        setMessage({ text: "Remediation task added.", type: "success" });
        setActiveIncidentForTask(null);
        setTaskForm({ title: "", description: "", assigneeId: "" });
        await loadData();
      }
    } catch {
      setMessage({ text: "Unable to add remediation task.", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.incidentCode.toLowerCase().includes(search.toLowerCase()) ||
      inc.title.toLowerCase().includes(search.toLowerCase()) ||
      inc.description.toLowerCase().includes(search.toLowerCase()) ||
      (inc.asset?.name.toLowerCase().includes(search.toLowerCase()) ?? false);

    const matchesStatus = statusFilter === "ALL" || inc.status === statusFilter;
    const matchesPriority = priorityFilter === "ALL" || inc.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalCount = incidents.length;
  const activeCount = incidents.filter((i) => i.status === "OPEN" || i.status === "IN_PROGRESS").length;
  const highCritCount = incidents.filter((i) => (i.priority === "CRITICAL" || i.priority === "HIGH") && i.status !== "RESOLVED").length;
  const resolvedCount = incidents.filter((i) => i.status === "RESOLVED").length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-[26px]">
            Incident Mitigation & Remediation Workflow
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Remediation ticketing, assigned corrective actions, and mitigation task tracking to closure.
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
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:from-cyan-300 hover:to-blue-400 transition cursor-pointer"
          >
            <Plus size={15} />
            Create Incident
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
            <span className="text-xs font-medium text-slate-400">Total Incidents</span>
            <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-400 border border-blue-500/20">
              <AlertTriangle size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-white tracking-tight">{totalCount}</p>
          <p className="mt-1 text-[11px] text-slate-400 font-mono">Remediation cases</p>
        </div>

        <div className="rounded-2xl liquid-glass p-5 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Remediation</span>
            <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-400 border border-amber-500/20">
              <Clock size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-amber-400 tracking-tight">{activeCount}</p>
          <p className="mt-1 text-[11px] text-slate-400 font-mono">In Progress tickets</p>
        </div>

        <div className="rounded-2xl liquid-glass p-5 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Urgent Priority</span>
            <div className="rounded-xl bg-red-500/10 p-2.5 text-red-400 border border-red-500/20">
              <ShieldAlert size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-red-400 tracking-tight">{highCritCount}</p>
          <p className="mt-1 text-[11px] text-slate-400 font-mono">Critical & High priority</p>
        </div>

        <div className="rounded-2xl liquid-glass p-5 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Resolved Incidents</span>
            <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-emerald-400 tracking-tight">{resolvedCount}</p>
          <p className="mt-1 text-[11px] text-slate-400 font-mono">Mitigation verified</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl liquid-glass p-5 border border-white/10 shadow-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search incident code, title, description, or asset..."
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
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
            >
              <option value="ALL">All Priorities</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Incident Cases Cards */}
        <div className="mt-5 space-y-4">
          {loading ? (
            <p className="py-10 text-center text-slate-400 text-xs">Loading incident tickets...</p>
          ) : filteredIncidents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-slate-400 text-xs">
              No incident tickets found matching current filters.
            </div>
          ) : (
            filteredIncidents.map((inc) => (
              <div
                key={inc.id}
                className="rounded-2xl liquid-glass p-5 border border-white/10 shadow-lg transition hover:border-cyan-500/30"
              >
                {/* Header row */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-3.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-500/10 px-2.5 py-0.5 rounded-lg border border-cyan-500/20">
                      {inc.incidentCode}
                    </span>
                    <span
                      className={`rounded-md px-2.5 py-0.5 text-[10px] font-bold border ${
                        inc.priority === "CRITICAL"
                          ? "bg-red-500/10 text-red-300 border-red-500/30"
                          : inc.priority === "HIGH"
                          ? "bg-orange-500/10 text-orange-300 border-orange-500/30"
                          : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                      }`}
                    >
                      {inc.priority} PRIORITY
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${
                        inc.status === "RESOLVED"
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                          : inc.status === "IN_PROGRESS"
                          ? "bg-blue-500/10 text-blue-300 border-blue-500/30"
                          : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                      }`}
                    >
                      {inc.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {inc.status === "OPEN" && (
                      <button
                        onClick={() => handleStatusChange(inc, "IN_PROGRESS")}
                        className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-[10px] font-semibold text-blue-300 hover:bg-blue-500/20 transition cursor-pointer"
                      >
                        Start Investigation
                      </button>
                    )}
                    {inc.status !== "RESOLVED" && (
                      <button
                        onClick={() => handleStatusChange(inc, "RESOLVED")}
                        className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-semibold text-emerald-300 hover:bg-emerald-500/20 transition cursor-pointer"
                      >
                        Resolve & Close
                      </button>
                    )}
                    <button
                      onClick={() => setActiveIncidentForTask(inc)}
                      className="rounded-xl border border-white/10 px-3 py-1.5 text-[10px] font-medium text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-1 transition cursor-pointer"
                    >
                      <Plus size={12} /> Add Task
                    </button>
                  </div>
                </div>

                {/* Body info */}
                <div className="mt-3.5">
                  <h3 className="text-sm font-bold text-white">{inc.title}</h3>
                  <p className="mt-1 text-xs text-slate-300 leading-relaxed">{inc.description}</p>
                </div>

                {/* Metadata */}
                <div className="mt-3.5 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                  {inc.asset && (
                    <span className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1 border border-white/5">
                      <Server size={13} className="text-cyan-400" />
                      Asset: <strong className="text-white">{inc.asset.name}</strong> ({inc.asset.code})
                    </span>
                  )}
                  {inc.riskFinding && (
                    <span className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1 border border-amber-500/20 text-amber-300">
                      <ShieldAlert size={13} className="text-amber-400" />
                      Linked Finding: <strong>{inc.riskFinding.findingCode}</strong>
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500 ml-auto font-mono">
                    Logged: {new Date(inc.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Mitigation Checklist */}
                <div className="mt-4 rounded-xl bg-white/[0.02] p-3.5 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Remediation Tasks Checklist ({inc.tasks.filter((t) => t.status === "COMPLETED").length}/
                      {inc.tasks.length} Completed)
                    </p>
                  </div>

                  {inc.tasks.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic">No mitigation tasks scheduled yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {inc.tasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => handleToggleTask(inc, task)}
                          className="flex items-start gap-3 rounded-xl bg-white/[0.03] p-2.5 border border-white/5 hover:border-cyan-500/30 cursor-pointer transition"
                        >
                          <div className="pt-0.5 text-slate-400">
                            {task.status === "COMPLETED" ? (
                              <CheckSquare size={16} className="text-emerald-400" />
                            ) : (
                              <Square size={16} />
                            )}
                          </div>
                          <div className="min-w-0 flex-1 text-xs">
                            <p
                              className={`font-semibold ${
                                task.status === "COMPLETED"
                                  ? "line-through text-slate-500"
                                  : "text-white"
                              }`}
                            >
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-[11px] text-slate-400 mt-0.5">{task.description}</p>
                            )}
                          </div>
                          {task.assignee && (
                            <span className="rounded-lg bg-white/5 px-2 py-0.5 text-[9px] font-medium text-slate-300 flex items-center gap-1 border border-white/5">
                              <User size={10} />
                              {task.assignee.fullName}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Incident Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl liquid-glass p-6 border border-white/15 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-sm">Create Security Incident Ticket</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="mb-1 block font-medium text-slate-300">Incident Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Excessive Privileges on Research Repository"
                  value={incidentForm.title}
                  onChange={(e) => setIncidentForm({ ...incidentForm, title: e.target.value })}
                  className="w-full rounded-xl bg-slate-950/70 border border-white/10 p-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-medium text-slate-300">Priority Level</label>
                  <select
                    value={incidentForm.priority}
                    onChange={(e) => setIncidentForm({ ...incidentForm, priority: e.target.value })}
                    className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-medium text-slate-300">Related Asset</label>
                  <select
                    value={incidentForm.assetId}
                    onChange={(e) => setIncidentForm({ ...incidentForm, assetId: e.target.value })}
                    className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="">-- Choose Asset --</option>
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-300">Incident Description & Scope</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide incident context, detection source, and impacted identities..."
                  value={incidentForm.description}
                  onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })}
                  className="w-full rounded-xl bg-slate-950/70 border border-white/10 p-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-300">Initial Mitigation Task</label>
                <input
                  type="text"
                  value={incidentForm.initialTaskTitle}
                  onChange={(e) => setIncidentForm({ ...incidentForm, initialTaskTitle: e.target.value })}
                  className="w-full rounded-xl bg-slate-950/70 border border-white/10 p-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-white/10 px-3.5 py-2 text-xs text-slate-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-xs font-bold text-slate-950 hover:from-cyan-300 hover:to-blue-400 disabled:opacity-50"
                >
                  {saving ? "Creating Ticket..." : "Create Incident"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {activeIncidentForTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl liquid-glass p-6 border border-white/15 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-sm">
                Add Task for {activeIncidentForTask.incidentCode}
              </h3>
              <button onClick={() => setActiveIncidentForTask(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="mb-1 block font-medium text-slate-300">Action Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Revoke admin token on LDAP"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full rounded-xl bg-slate-950/70 border border-white/10 p-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-300">Assignee (Analyst/Admin)</label>
                <select
                  value={taskForm.assigneeId}
                  onChange={(e) => setTaskForm({ ...taskForm, assigneeId: e.target.value })}
                  className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                >
                  <option value="">-- Unassigned --</option>
                  {users
                    .filter((u) => u.role === "SECURITY_ANALYST" || u.role === "ADMIN")
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({u.role})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-300">Task Notes / Checklist</label>
                <textarea
                  rows={2}
                  placeholder="Detailed instructions for the analyst..."
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full rounded-xl bg-slate-950/70 border border-white/10 p-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveIncidentForTask(null)}
                  className="rounded-xl border border-white/10 px-3.5 py-2 text-xs text-slate-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-xs font-bold text-slate-950 hover:from-cyan-300 hover:to-blue-400 disabled:opacity-50"
                >
                  {saving ? "Adding..." : "Add Mitigation Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
