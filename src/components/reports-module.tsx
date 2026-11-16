"use client";

import { useEffect, useState } from "react";
import {
  FileBarChart, Download, ShieldCheck, ShieldAlert,
  Server, Users, RefreshCw, Printer, AlertTriangle, Check
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

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
          <div className="flex items-center gap-2 mb-1">
            <span className="glass-chip text-[10px] uppercase tracking-wider text-[#60A5FA] font-mono">
              Audit Intelligence
            </span>
            <span className="glass-chip text-[10px] text-[#7DD3FC] font-mono">
              Compliance Reports
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F5F8FF] sm:text-[28px]">
            Management Reports & Risk Intelligence
          </h1>
          <p className="mt-1 text-xs text-slate-300/80">
            Export official risk registers, identity access matrices, and executive posture summaries.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={loadSummary}
            className="btn-secondary-glass flex items-center gap-1.5 text-xs font-medium cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? "animate-spin text-[#60A5FA]" : ""} />
            Refresh
          </button>
          <button
            onClick={handlePrint}
            className="btn-primary-glass flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-lg shadow-blue-500/20"
          >
            <Printer size={14} />
            Print Report
          </button>
        </div>
      </div>

      {/* Formal Academic Prototype Disclaimer (Liquid Glass) */}
      <GlassCard variant="default" glow="blue" className="p-4 sm:p-5">
        <div className="flex items-start gap-3.5">
          <div className="rounded-xl bg-blue-500/10 p-2.5 text-[#60A5FA] border border-blue-500/20 shrink-0">
            <FileBarChart size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#F5F8FF]">CampusTrust Academic Assessment Report</h3>
            <p className="mt-1 text-xs text-slate-300/80 leading-relaxed">
              This report represents a simulated Management Information System (MIS) assessment for educational evaluation. All identity records, digital assets, and security findings are fictional demonstration models for academic coursework and do not represent actual university production vulnerabilities.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono">
              <span className="glass-chip text-[10px]">Report Generated: {new Date().toLocaleDateString()}</span>
              <span className="glass-chip text-[10px]">Case: SRMIST KTR (Fictionalized)</span>
              <span className="glass-chip text-[10px] text-[#6EE7B7]">Classification: Prototype</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Export Options Grid (Liquid Glass) */}
      <div>
        <h2 className="text-sm font-bold text-[#F5F8FF] mb-3 flex items-center gap-2">
          <Download size={15} className="text-[#60A5FA]" />
          One-Click CSV Export Center
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Risk Register */}
          <GlassCard variant="interactive" glow="red" className="p-5 flex flex-col justify-between">
            <div>
              <div className="rounded-xl bg-red-500/10 p-2.5 text-[#F87171] border border-red-500/20 w-fit">
                <ShieldAlert size={20} />
              </div>
              <h3 className="mt-3.5 text-sm font-bold text-[#F5F8FF]">Risk Register CSV</h3>
              <p className="mt-1 text-xs text-slate-300/80 leading-relaxed">
                Full catalog of identified risk findings, scores, likelihood, impact, and affected assets.
              </p>
            </div>
            <a
              href="/api/reports/export?type=risks"
              download
              className="mt-4 btn-primary-glass flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer text-center"
            >
              <Download size={14} /> Download Risks CSV
            </a>
          </GlassCard>

          {/* Card 2: Identities */}
          <GlassCard variant="interactive" glow="blue" className="p-5 flex flex-col justify-between">
            <div>
              <div className="rounded-xl bg-blue-500/10 p-2.5 text-[#60A5FA] border border-blue-500/20 w-fit">
                <Users size={20} />
              </div>
              <h3 className="mt-3.5 text-sm font-bold text-[#F5F8FF]">Identity Directory CSV</h3>
              <p className="mt-1 text-xs text-slate-300/80 leading-relaxed">
                Complete directory of registered students, faculty, analysts, and administrative accounts.
              </p>
            </div>
            <a
              href="/api/reports/export?type=users"
              download
              className="mt-4 btn-primary-glass flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer text-center"
            >
              <Download size={14} /> Download Users CSV
            </a>
          </GlassCard>

          {/* Card 3: Asset Inventory */}
          <GlassCard variant="interactive" glow="indigo" className="p-5 flex flex-col justify-between">
            <div>
              <div className="rounded-xl bg-purple-500/10 p-2.5 text-[#C084FC] border border-purple-500/20 w-fit">
                <Server size={20} />
              </div>
              <h3 className="mt-3.5 text-sm font-bold text-[#F5F8FF]">Asset Inventory CSV</h3>
              <p className="mt-1 text-xs text-slate-300/80 leading-relaxed">
                Catalog of monitored digital assets, criticality ratings, and operational status.
              </p>
            </div>
            <a
              href="/api/reports/export?type=assets"
              download
              className="mt-4 btn-primary-glass flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer text-center"
            >
              <Download size={14} /> Download Assets CSV
            </a>
          </GlassCard>

          {/* Card 4: Activity Log */}
          <GlassCard variant="interactive" glow="cyan" className="p-5 flex flex-col justify-between">
            <div>
              <div className="rounded-xl bg-emerald-500/10 p-2.5 text-[#6EE7B7] border border-emerald-500/20 w-fit">
                <ShieldCheck size={20} />
              </div>
              <h3 className="mt-3.5 text-sm font-bold text-[#F5F8FF]">Telemetry Logs CSV</h3>
              <p className="mt-1 text-xs text-slate-300/80 leading-relaxed">
                Full chronological stream of authentication events, access changes, and security actions.
              </p>
            </div>
            <a
              href="/api/reports/export?type=activity"
              download
              className="mt-4 btn-primary-glass flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer text-center"
            >
              <Download size={14} /> Download Logs CSV
            </a>
          </GlassCard>
        </div>
      </div>

      {/* Executive Security Findings Preview (Liquid Glass) */}
      <GlassCard variant="raised" className="p-4 sm:p-5">
        <h3 className="font-bold text-[#F5F8FF] mb-1">Executive Risk Register Summary</h3>
        <p className="text-xs text-slate-300/80 mb-4">
          Latest prioritized risk conditions evaluated by the CampusTrust rule engine.
        </p>

        {loading ? (
          <p className="text-xs text-slate-400 py-8 text-center">Loading report summary...</p>
        ) : !summary ? (
          <p className="text-xs text-slate-400 py-8 text-center">No report data available.</p>
        ) : (
          <>
            {/* Mobile Cards (md:hidden) */}
            <div className="space-y-3 md:hidden">
              {summary.recentFindings.map((finding) => (
                <div key={finding.id} className="glass rounded-[18px] p-3.5 space-y-2 border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#38BDF8]">{finding.findingCode}</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold border ${finding.severity === "CRITICAL"
                          ? "bg-red-500/15 text-[#F87171] border-red-500/30"
                          : finding.severity === "HIGH"
                            ? "bg-orange-500/15 text-[#FDA672] border-orange-500/30"
                            : "bg-amber-500/15 text-[#FCD34D] border-amber-500/30"
                        }`}
                    >
                      {finding.severity}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-white">{finding.title}</h4>
                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-slate-400">
                    <span>{finding.category}</span>
                    <span className="font-mono text-white font-bold">{finding.score}/25</span>
                    <span className="rounded-full px-2 py-0.5 bg-white/5 border border-white/10 text-slate-300">
                      {finding.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table (hidden md:block) */}
            <div className="hidden md:block overflow-x-auto">
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
                      <td className="px-4 py-3 font-mono font-semibold text-[#38BDF8]">{finding.findingCode}</td>
                      <td className="px-4 py-3 text-white font-medium">{finding.title}</td>
                      <td className="px-3 py-3 text-slate-300/80 text-[11px]">{finding.category}</td>
                      <td className="px-3 py-3 font-mono font-bold text-white tabular-nums">{finding.score}/25</td>
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold border ${finding.severity === "CRITICAL"
                              ? "bg-red-500/15 text-[#F87171] border-red-500/30"
                              : finding.severity === "HIGH"
                                ? "bg-orange-500/15 text-[#FDA672] border-orange-500/30"
                                : "bg-amber-500/15 text-[#FCD34D] border-amber-500/30"
                            }`}
                        >
                          {finding.severity}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${finding.status === "RESOLVED"
                              ? "bg-emerald-500/15 text-[#6EE7B7] border-emerald-500/30"
                              : finding.status === "IN_PROGRESS"
                                ? "bg-blue-500/15 text-[#60A5FA] border-blue-500/30"
                                : "bg-amber-500/15 text-[#FCD34D] border-amber-500/30"
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
          </>
        )}
      </GlassCard>
    </div>
  );
}