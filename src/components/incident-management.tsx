"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  AlertTriangle, CheckCircle2, Clock, Plus, RefreshCw,
  Search, Filter, ShieldAlert, CheckSquare, Square,
  X, User, ArrowRight, Server, Calendar
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

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
          <div className="flex items-center gap-2 mb-1">
            <span className="glass-chip text-[10px] uppercase tracking-wider text-[#60A5FA] font-mono">
              SecOps Workflow
            </span>
            <span className="glass-chip text-[10px] text-amber-300 font-mono flex items-center gap-1">
              <Clock size={11} className="text-amber-400" /> Active SLA Tracking
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F5F8FF] sm:text-[28px]">
            Incident Mitigation & Remediation
          </h1>
          <p className="mt-1 text-xs text-slate-300/80">
            Remediation ticketing, assigned corrective actions, and mitigation task tracking to closure.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            className="btn-secondary-glass flex items-center gap-1.5 text-xs font-medium cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? "animate-spin text-[#60A5FA]" : ""} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary-glass flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-lg shadow-blue-500/20"
          >
            <Plus size={14} />
            Create Incident
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {message && (
        <div
          className={`flex items-center justify-between rounded-2xl p-4 text-xs backdrop-blur-md transition-all ${
            message.type === "success"
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
            <span className="text-[11px] sm:text-xs font-medium text-slate-300/80">Total Incidents</span>
            <div className="rounded-xl bg-blue-500/10 p-2 text-[#60A5FA] border border-blue-500/20">
              <AlertTriangle size={16} />
            </div>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#F5F8FF] tracking-tight tabular-nums">
            {totalCount}
          </p>
          <p className="mt-1 text-[11px] text-slate-400 font-mono">Remediation cases</p>
        </GlassCard>

        <GlassCard variant="default" glow="cyan" className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-300/80">Active In-Progress</span>
            <div className="rounded-xl bg-amber-500/10 p-2 text-[#FCD34D] border border-amber-500/20">
              <Clock size={16} />
            </div>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#FCD34D] tracking-tight tabular-nums">
            {activeCount}
          </p>
          <p className="mt-1 text-[11px] text-slate-400 font-mono">Remediation in progress</p>
        </GlassCard>

        <GlassCard variant="default" glow="indigo" className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-300/80">Urgent Priority</span>
            <div className="rounded-xl bg-red-500/10 p-2 text-[#F87171] border border-red-500/20">
              <ShieldAlert size={16} />
            </div>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#F87171] tracking-tight tabular-nums">
            {highCritCount}
          </p>
          <p className="mt-1 text-[11px] text-slate-400 font-mono">Critical & High priority</p>
        </GlassCard>

        <GlassCard variant="default" className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-300/80">Resolved Incidents</span>
            <div className="rounded-xl bg-emerald-500/10 p-2 text-[#6EE7B7] border border-emerald-500/20">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#6EE7B7] tracking-tight tabular-nums">
            {resolvedCount}
          </p>
          <p className="mt-1 text-[11px] text-slate-400 font-mono">Mitigation verified</p>
        </GlassCard>
      </div>

      {/* Filter and Search Bar */}
      <GlassCard variant="raised" className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search incident code, title, description, or asset..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input w-full py-2.5 pl-10 pr-4 text-xs text-[#F5F8FF] placeholder-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-300/80 shrink-0 font-medium">
              <Filter size={13} className="text-[#60A5FA]" /> Filter:
            </div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="glass-input px-3 py-2 text-xs text-[#F5F8FF] cursor-pointer"
            >
              <option value="ALL" className="bg-[#0A1530]">All Priorities</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p} className="bg-[#0A1530]">
                  {p}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="glass-input px-3 py-2 text-xs text-[#F5F8FF] cursor-pointer"
            >
              <option value="ALL" className="bg-[#0A1530]">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s} className="bg-[#0A1530]">
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
            <div className="glass rounded-[20px] border border-dashed border-white/10 p-10 text-center text-slate-400 text-xs">
              No incident tickets found matching current filters.
            </div>
          ) : (
            filteredIncidents.map((inc) => {
              // Calculate SLA due date indicator
              const createdDate = new Date(inc.createdAt);
              const daysToAdd = inc.priority === "CRITICAL" ? 1 : inc.priority === "HIGH" ? 3 : 7;
              const targetDueDate = new Date(createdDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
              const isOverdue = inc.status !== "RESOLVED" && Date.now() > targetDueDate.getTime();

              return (
                <div
                  key={inc.id}
                  className="glass rounded-[24px] p-4 sm:p-5 border border-white/10 transition-all hover:border-blue-400/30 hover:shadow-lg hover:shadow-blue-950/20"
                >
                  {/* Header row */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-3.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#38BDF8] bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                        {inc.incidentCode}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                          inc.priority === "CRITICAL"
                            ? "bg-red-500/15 text-[#F87171] border-red-500/30"
                            : inc.priority === "HIGH"
                            ? "bg-orange-500/15 text-[#FDA672] border-orange-500/30"
                            : "bg-amber-500/15 text-[#FCD34D] border-amber-500/30"
                        }`}
                      >
                        {inc.priority} PRIORITY
                      </span>
                      
                      {/* Clear Open, In Progress, Resolved status chips */}
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                          inc.status === "RESOLVED"
                            ? "bg-emerald-500/15 text-[#6EE7B7] border-emerald-500/30"
                            : inc.status === "IN_PROGRESS"
                            ? "bg-blue-500/15 text-[#60A5FA] border-blue-500/30"
                            : "bg-amber-500/15 text-[#FCD34D] border-amber-500/30"
                        }`}
                      >
                        {inc.status === "RESOLVED" ? "Resolved" : inc.status === "IN_PROGRESS" ? "In Progress" : "Open"}
                      </span>

                      {/* Due-Date Indicator */}
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono flex items-center gap-1 border ${
                          inc.status === "RESOLVED"
                            ? "bg-white/5 text-slate-400 border-white/10"
                            : isOverdue
                            ? "bg-red-500/20 text-[#F87171] border-red-500/40 animate-pulse"
                            : "bg-amber-500/10 text-amber-300 border-amber-500/20"
                        }`}
                      >
                        <Calendar size={11} />
                        {inc.status === "RESOLVED"
                          ? "Remediated"
                          : isOverdue
                          ? "SLA Overdue"
                          : `Due: ${targetDueDate.toLocaleDateString()}`}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {inc.status === "OPEN" && (
                        <button
                          onClick={() => handleStatusChange(inc, "IN_PROGRESS")}
                          className="btn-secondary-glass text-[11px] font-semibold text-[#60A5FA] cursor-pointer"
                        >
                          Start Investigation
                        </button>
                      )}
                      {inc.status !== "RESOLVED" && (
                        <button
                          onClick={() => handleStatusChange(inc, "RESOLVED")}
                          className="btn-primary-glass text-[11px] font-semibold text-white cursor-pointer shadow-sm shadow-blue-500/20"
                        >
                          Resolve & Close
                        </button>
                      )}
                      <button
                        onClick={() => setActiveIncidentForTask(inc)}
                        className="btn-secondary-glass text-[11px] font-medium text-slate-200 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={12} /> Add Task
                      </button>
                    </div>
                  </div>

                  {/* Body info */}
                  <div className="mt-3.5">
                    <h3 className="text-sm font-bold text-[#F5F8FF]">{inc.title}</h3>
                    <p className="mt-1 text-xs text-slate-300/80 leading-relaxed">{inc.description}</p>
                  </div>

                  {/* Metadata */}
                  <div className="mt-3.5 flex flex-wrap items-center gap-2.5 text-[11px] text-slate-400">
                    {inc.asset && (
                      <span className="flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 border border-white/10">
                        <Server size={12} className="text-[#38BDF8]" />
                        Asset: <strong className="text-white">{inc.asset.name}</strong> ({inc.asset.code})
                      </span>
                    )}
                    {inc.riskFinding && (
                      <span className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 border border-amber-500/20 text-amber-300">
                        <ShieldAlert size={12} className="text-amber-400" />
                        Linked Finding: <strong>{inc.riskFinding.findingCode}</strong>
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 ml-auto font-mono">
                      Logged: {new Date(inc.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {/* Mitigation Checklist */}
                  <div className="mt-4 rounded-[18px] bg-white/[0.02] p-3.5 border border-white/5">
                    <div className="flex items-center justify-between mb-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Remediation Tasks Checklist ({inc.tasks.filter((t) => t.status === "COMPLETED").length}/
                        {inc.tasks.length} Completed)
                      </p>
                    </div>

                    {inc.tasks.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">No mitigation tasks scheduled yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {inc.tasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => handleToggleTask(inc, task)}
                            className="flex items-start gap-3 rounded-xl bg-white/[0.03] p-2.5 border border-white/5 hover:border-blue-400/30 cursor-pointer transition"
                          >
                            <div className="pt-0.5 text-slate-400">
                              {task.status === "COMPLETED" ? (
                                <CheckSquare size={15} className="text-[#6EE7B7]" />
                              ) : (
                                <Square size={15} />
                              )}
                            </div>
                            <div className="min-w-0 flex-1 text-xs">
                              <p
                                className={`font-semibold ${
                                  task.status === "COMPLETED"
                                    ? "line-through text-slate-500"
                                    : "text-[#F5F8FF]"
                                }`}
                              >
                                {task.title}
                              </p>
                              {task.description && (
                                <p className="text-[11px] text-slate-400 mt-0.5">{task.description}</p>
                              )}
                            </div>
                            {task.assignee && (
                              <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-medium text-slate-300 flex items-center gap-1 border border-white/10 shrink-0">
                                <User size={10} className="text-[#60A5FA]" />
                                {task.assignee.fullName}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </GlassCard>

      {/* Create Incident Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1530]/80 p-4 backdrop-blur-xl animate-in fade-in duration-200">
          <GlassCard variant="raised" glow="blue" className="w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-[#F5F8FF] text-sm flex items-center gap-2">
                <AlertTriangle size={16} className="text-[#38BDF8]" />
                Create Security Incident Ticket
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
                aria-label="Close modal"
              >
                <X size={16} />
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
                  className="glass-input w-full p-2.5 text-xs text-[#F5F8FF] placeholder-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-medium text-slate-300">Priority Level</label>
                  <select
                    value={incidentForm.priority}
                    onChange={(e) => setIncidentForm({ ...incidentForm, priority: e.target.value })}
                    className="glass-input w-full p-2.5 text-xs text-[#F5F8FF] cursor-pointer"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p} className="bg-[#0A1530]">
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
                    className="glass-input w-full p-2.5 text-xs text-[#F5F8FF] cursor-pointer"
                  >
                    <option value="" className="bg-[#0A1530]">-- Choose Asset --</option>
                    {assets.map((a) => (
                      <option key={a.id} value={a.id} className="bg-[#0A1530]">
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
                  className="glass-input w-full p-2.5 text-xs text-[#F5F8FF] placeholder-slate-400"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-300">Initial Mitigation Task</label>
                <input
                  type="text"
                  value={incidentForm.initialTaskTitle}
                  onChange={(e) => setIncidentForm({ ...incidentForm, initialTaskTitle: e.target.value })}
                  className="glass-input w-full p-2.5 text-xs text-[#F5F8FF] placeholder-slate-400"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary-glass text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary-glass text-xs font-semibold disabled:opacity-50 cursor-pointer shadow-lg shadow-blue-500/20"
                >
                  {saving ? "Creating Ticket..." : "Create Incident"}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Add Task Modal */}
      {activeIncidentForTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1530]/80 p-4 backdrop-blur-xl animate-in fade-in duration-200">
          <GlassCard variant="raised" glow="blue" className="w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-[#F5F8FF] text-sm flex items-center gap-2">
                <Plus size={16} className="text-[#38BDF8]" />
                Add Task for {activeIncidentForTask.incidentCode}
              </h3>
              <button
                onClick={() => setActiveIncidentForTask(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
                aria-label="Close modal"
              >
                <X size={16} />
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
                  className="glass-input w-full p-2.5 text-xs text-[#F5F8FF] placeholder-slate-400"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-300">Assignee (Analyst/Admin)</label>
                <select
                  value={taskForm.assigneeId}
                  onChange={(e) => setTaskForm({ ...taskForm, assigneeId: e.target.value })}
                  className="glass-input w-full p-2.5 text-xs text-[#F5F8FF] cursor-pointer"
                >
                  <option value="" className="bg-[#0A1530]">-- Unassigned --</option>
                  {users
                    .filter((u) => u.role === "SECURITY_ANALYST" || u.role === "ADMIN")
                    .map((u) => (
                      <option key={u.id} value={u.id} className="bg-[#0A1530]">
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
                  className="glass-input w-full p-2.5 text-xs text-[#F5F8FF] placeholder-slate-400"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveIncidentForTask(null)}
                  className="btn-secondary-glass text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary-glass text-xs font-semibold disabled:opacity-50 cursor-pointer shadow-lg shadow-blue-500/20"
                >
                  {saving ? "Adding..." : "Add Mitigation Task"}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
