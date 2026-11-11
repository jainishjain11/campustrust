"use client";

import { useEffect, useState } from "react";
import {
  FileBarChart, Download, ShieldCheck, ShieldAlert,
  Server, Users, RefreshCw, Printer, AlertTriangle, Check
} from "lucide-react";

type ReportSummary = {
  totalUsers: number;
  totalAssets: number;
  openRisks: number;
  resolvedRisks: number;
  criticalRisks: number;
  highRisks: number;
  mediumRisks: number;
  lowRisks: number;
  totalIncidents: number;
  resolvedIncidents: number;
  recentFindings: Array<{
    id: string;
    findingCode: string;
    title: string;
    severity: string;
    score: number;
    status: string;
    category: string;
  }>;
};

export default function ReportsModule() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadSummary() {
    setLoading(true);
    try {
      const [risksRes, dashRes] = await Promise.all([
        fetch("/api/risks"),
        fetch("/api/dashboard"),
      ]);

      const risksData = await risksRes.json();
      const dashData = await dashRes.json();

      if (risksData.success && dashData.success) {
        const findings = risksData.data;
        const stats = dashData.data.statistics;

        setSummary({
          totalUsers: stats.totalUsers,
          totalAssets: stats.totalAssets,
          openRisks: stats.openRisks,
          resolvedRisks: stats.resolvedRisks,
          criticalRisks: findings.filter((f: any) => f.severity === "CRITICAL" && f.status !== "RESOLVED").length,
          highRisks: findings.filter((f: any) => f.severity === "HIGH" && f.status !== "RESOLVED").length,
          mediumRisks: findings.filter((f: any) => f.severity === "MEDIUM" && f.status !== "RESOLVED").length,
          lowRisks: findings.filter((f: any) => f.severity === "LOW" && f.status !== "RESOLVED").length,
          totalIncidents: 0,
          resolvedIncidents: 0,
          recentFindings: findings.slice(0, 8),
        });
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSummary();
  }, []);

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-[26px]">
            Management Reports & Risk Intelligence
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Export official risk registers, identity access matrices, and executive posture summaries.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadSummary}
            className="flex items-center gap-1.5 rounded-xl liquid-glass px-3 py-2 text-xs font-medium text-slate-300 hover:text-white border-white/10 transition cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:from-cyan-300 hover:to-blue-400 transition cursor-pointer"
          >
            <Printer size={15} />
            Print Report
          </button>
        </div>
      </div>

      {/* Formal Academic Prototype Disclaimer (Liquid Glass) */}
      <div className="rounded-2xl liquid-glass p-5 border border-white/10 shadow-lg">
        <div className="flex items-start gap-3.5">
          <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-400 border border-blue-500/20 shrink-0">
            <FileBarChart size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">CampusTrust Academic Assessment Report</h3>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed">
              This report represents a simulated Management Information System (MIS) assessment for educational evaluation. All identity records, digital assets, and security findings are fictional demonstration models for academic coursework and do not represent actual university production vulnerabilities.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-mono">
              <span>Report Generated: {new Date().toLocaleDateString()}</span>
              <span>Case Environment: SRMIST KTR (Fictionalized)</span>
              <span>Classification: Academic Demo Prototype</span>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options Grid (Liquid Glass) */}
      <div>
        <h2 className="text-sm font-bold text-white mb-3">One-Click CSV Export Center</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Risk Register */}
          <div className="rounded-2xl liquid-glass liquid-glass-interactive p-5 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="rounded-xl bg-red-500/10 p-2.5 text-red-400 border border-red-500/20 w-fit">
                <ShieldAlert size={20} />
              </div>
              <h3 className="mt-3.5 text-sm font-bold text-white">Risk Register CSV</h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Full catalog of identified risk findings, scores, likelihood, impact, and affected assets.
              </p>
            </div>
            <a
              href="/api/reports/export?type=risks"
              download
              className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 py-2.5 text-xs font-semibold text-red-300 hover:bg-red-500/30 transition cursor-pointer"
            >
              <Download size={14} /> Download Risks CSV
            </a>
          </div>

          {/* Card 2: Identities */}
          <div className="rounded-2xl liquid-glass liquid-glass-interactive p-5 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-400 border border-blue-500/20 w-fit">
                <Users size={20} />
              </div>
              <h3 className="mt-3.5 text-sm font-bold text-white">Identity Directory CSV</h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Complete directory of registered students, faculty, analysts, and administrative accounts.
              </p>
            </div>
            <a
              href="/api/reports/export?type=users"
              download
              className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 py-2.5 text-xs font-semibold text-blue-300 hover:bg-blue-500/30 transition cursor-pointer"
            >
              <Download size={14} /> Download Users CSV
            </a>
          </div>

          {/* Card 3: Asset Inventory */}
          <div className="rounded-2xl liquid-glass liquid-glass-interactive p-5 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="rounded-xl bg-purple-500/10 p-2.5 text-purple-400 border border-purple-500/20 w-fit">
                <Server size={20} />
              </div>
              <h3 className="mt-3.5 text-sm font-bold text-white">Asset Inventory CSV</h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Catalog of monitored digital assets, criticality ratings, and operational status.
              </p>
            </div>
            <a
              href="/api/reports/export?type=assets"
              download
              className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 py-2.5 text-xs font-semibold text-purple-300 hover:bg-purple-500/30 transition cursor-pointer"
            >
              <Download size={14} /> Download Assets CSV
            </a>
          </div>

          {/* Card 4: Activity Log */}
          <div className="rounded-2xl liquid-glass liquid-glass-interactive p-5 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400 border border-emerald-500/20 w-fit">
                <ShieldCheck size={20} />
              </div>
              <h3 className="mt-3.5 text-sm font-bold text-white">Telemetry Logs CSV</h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Full chronological stream of authentication events, access changes, and security actions.
              </p>
            </div>
            <a
              href="/api/reports/export?type=activity"
              download
              className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 transition cursor-pointer"
            >
              <Download size={14} /> Download Logs CSV
            </a>
          </div>
        </div>
      </div>

      {/* Executive Security Findings Preview (Liquid Glass) */}
      <div className="rounded-2xl liquid-glass p-5 border border-white/10 shadow-xl">
        <h3 className="font-bold text-white mb-1">Executive Risk Register Summary</h3>
        <p className="text-xs text-slate-400 mb-4">
          Latest prioritized risk conditions evaluated by the CampusTrust rule engine.
        </p>

        {loading ? (
          <p className="text-xs text-slate-400 py-8 text-center">Loading report summary...</p>
        ) : !summary ? (
          <p className="text-xs text-slate-400 py-8 text-center">No report data available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-xs">
              <thead className="border-b border-white/10 text-[10px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Finding Code</th>
                  <th className="px-4 py-3 font-semibold">Risk Finding Title</th>
                  <th className="px-3 py-3 font-semibold">Category</th>
                  <th className="px-3 py-3 font-semibold">Score</th>
                  <th className="px-3 py-3 font-semibold">Severity</th>
                  <th className="px-3 py-3 font-semibold">Remediation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {summary.recentFindings.map((finding) => (
                  <tr key={finding.id} className="hover:bg-white/[0.04] transition">
                    <td className="px-4 py-3 font-mono font-semibold text-cyan-400">{finding.findingCode}</td>
                    <td className="px-4 py-3 text-white font-medium">{finding.title}</td>
                    <td className="px-3 py-3 text-slate-400 text-[11px]">{finding.category}</td>
                    <td className="px-3 py-3 font-mono font-bold text-white">{finding.score}/25</td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-md px-2.5 py-1 text-[10px] font-bold border ${
                          finding.severity === "CRITICAL"
                            ? "bg-red-500/10 text-red-300 border-red-500/30"
                            : finding.severity === "HIGH"
                            ? "bg-orange-500/10 text-orange-300 border-orange-500/30"
                            : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {finding.severity}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${
                          finding.status === "RESOLVED"
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                            : finding.status === "IN_PROGRESS"
                            ? "bg-blue-500/10 text-blue-300 border-blue-500/30"
                            : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {finding.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
