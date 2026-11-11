"use client";

import { useEffect, useState, useRef } from "react";
import {
  Network, ShieldAlert, KeyRound, Server, User,
  CheckCircle2, RefreshCw, ZoomIn, ZoomOut, Info, AlertTriangle
} from "lucide-react";

type UserNode = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  department?: { name: string } | null;
};

type AssetNode = {
  id: string;
  name: string;
  code: string;
  category: string;
  criticality: number;
};

type GrantEdge = {
  id: string;
  userId: string;
  assetId: string;
  accessLevel: string;
  isExpected: boolean;
};

type GraphNode = {
  id: string;
  type: "USER" | "ASSET";
  label: string;
  subLabel: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  data: any;
  hasRisk: boolean;
};

export default function SecurityNetworkGraph() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [users, setUsers] = useState<UserNode[]>([]);
  const [assets, setAssets] = useState<AssetNode[]>([]);
  const [grants, setGrants] = useState<GrantEdge[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [filterSuspiciousOnly, setFilterSuspiciousOnly] = useState(false);

  // Load backend data
  async function loadData() {
    setLoading(true);
    try {
      const [uRes, aRes, gRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/assets"),
        fetch("/api/access"),
      ]);

      const uData = await uRes.json();
      const aData = await aRes.json();
      const gData = await gRes.json();

      if (uData.success) setUsers(uData.data);
      if (aData.success) setAssets(aData.data);
      if (gData.success) setGrants(gData.data);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Canvas animation & physics simulation
  useEffect(() => {
    if (loading || users.length === 0 || assets.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 900);
    let height = (canvas.height = 540);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 540;
    };
    window.addEventListener("resize", handleResize);

    // Build Graph Nodes
    const graphNodes: GraphNode[] = [];

    // Place users on left-center ring
    users.forEach((u, i) => {
      const angle = (i / users.length) * Math.PI * 2;
      const r = 160 + (i % 2) * 35;
      const cx = width * 0.35;
      const cy = height * 0.5;

      const hasRisk = grants.some((g) => g.userId === u.id && !g.isExpected);

      graphNodes.push({
        id: u.id,
        type: "USER",
        label: u.fullName,
        subLabel: `${u.role} · ${u.department?.name || "Unassigned"}`,
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        radius: u.role === "ADMIN" ? 17 : 14,
        color: hasRisk
          ? "#ef4444"
          : u.role === "ADMIN"
          ? "#c084fc"
          : u.role === "SECURITY_ANALYST"
          ? "#60a5fa"
          : u.role === "FACULTY"
          ? "#fbbf24"
          : "#22d3ee",
        data: u,
        hasRisk,
      });
    });

    // Place assets on right-center ring
    assets.forEach((a, i) => {
      const angle = (i / assets.length) * Math.PI * 2;
      const r = 160 + (i % 2) * 30;
      const cx = width * 0.7;
      const cy = height * 0.5;

      const hasRisk = grants.some((g) => g.assetId === a.id && !g.isExpected);

      graphNodes.push({
        id: a.id,
        type: "ASSET",
        label: a.name,
        subLabel: `${a.code} · Criticality ${a.criticality}/5`,
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        radius: a.criticality >= 5 ? 19 : a.criticality === 4 ? 16 : 14,
        color: hasRisk
          ? "#f87171"
          : a.criticality >= 5
          ? "#fb7185"
          : a.criticality === 4
          ? "#f97316"
          : "#a855f7",
        data: a,
        hasRisk,
      });
    });

    let animationId: number;
    let pulsePhase = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      pulsePhase += 0.04;

      // 1. Draw Links
      grants.forEach((grant) => {
        if (filterSuspiciousOnly && grant.isExpected) return;

        const uNode = graphNodes.find((n) => n.id === grant.userId);
        const aNode = graphNodes.find((n) => n.id === grant.assetId);

        if (uNode && aNode) {
          ctx.beginPath();
          ctx.moveTo(uNode.x, uNode.y);
          ctx.lineTo(aNode.x, aNode.y);

          if (!grant.isExpected) {
            // Out-of-role excessive permission link (Pulsing Red)
            const pulse = 0.5 + Math.sin(pulsePhase) * 0.35;
            ctx.strokeStyle = `rgba(239, 68, 68, ${pulse})`;
            ctx.lineWidth = 2.5;
            ctx.setLineDash([5, 4]);
          } else {
            // Compliant standard link (Subtle Cyan / Blue)
            ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
            ctx.lineWidth = 1.2;
            ctx.setLineDash([]);
          }

          ctx.stroke();
          ctx.setLineDash([]); // reset
        }
      });

      // 2. Draw Nodes
      graphNodes.forEach((node) => {
        // Floating gentle drift
        node.x += node.vx;
        node.y += node.vy;

        // Bounding
        if (node.x < 30 || node.x > width - 30) node.vx *= -1;
        if (node.y < 30 || node.y > height - 30) node.vy *= -1;

        const isHovered = hoveredNode?.id === node.id;
        const isSelected = selectedNode?.id === node.id;

        // Glow ring
        if (node.hasRisk || isSelected || isHovered) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + (isSelected ? 8 : 5), 0, Math.PI * 2);
          ctx.fillStyle = node.hasRisk ? "rgba(239, 68, 68, 0.25)" : "rgba(34, 211, 238, 0.25)";
          ctx.fill();
        }

        // Main node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = isHovered || isSelected ? 15 : 6;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Inner core
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        ctx.fill();

        // Node Label
        ctx.font = isHovered || isSelected ? "bold 11px system-ui" : "10px system-ui";
        ctx.fillStyle = isHovered || isSelected ? "#ffffff" : "rgba(226, 232, 240, 0.75)";
        ctx.textAlign = "center";
        ctx.fillText(node.label.length > 16 ? node.label.slice(0, 14) + "..." : node.label, node.x, node.y + node.radius + 13);
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    // Mouse Interaction
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let found: GraphNode | null = null;
      for (const node of graphNodes) {
        const dx = node.x - mouseX;
        const dy = node.y - mouseY;
        if (Math.sqrt(dx * dx + dy * dy) < node.radius + 6) {
          found = node;
          break;
        }
      }
      setHoveredNode(found);
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      for (const node of graphNodes) {
        const dx = node.x - mouseX;
        const dy = node.y - mouseY;
        if (Math.sqrt(dx * dx + dy * dy) < node.radius + 6) {
          setSelectedNode(node);
          return;
        }
      }
      setSelectedNode(null);
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleClick);
      cancelAnimationFrame(animationId);
    };
  }, [loading, users, assets, grants, filterSuspiciousOnly, hoveredNode, selectedNode]);

  const unexpectedGrants = grants.filter((g) => !g.isExpected);

  return (
    <div className="space-y-6">
      {/* Header and Toolbar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Interactive Security Identity Graph
            <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs font-mono font-medium text-cyan-300 border border-cyan-500/20">
              Live Topology
            </span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Interactive visual mapping between campus identities, digital applications, and out-of-role entitlement paths.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setFilterSuspiciousOnly(!filterSuspiciousOnly)}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition cursor-pointer border ${
              filterSuspiciousOnly
                ? "bg-red-500/20 text-red-300 border-red-500/40 glow-red"
                : "liquid-glass text-slate-300 hover:text-white border-white/10"
            }`}
          >
            <AlertTriangle size={14} className={filterSuspiciousOnly ? "text-red-400" : "text-amber-400"} />
            {filterSuspiciousOnly ? "Showing Out-of-Role Only" : "Filter Out-of-Role Paths"}
          </button>

          <button
            onClick={loadData}
            className="flex items-center gap-1.5 rounded-xl liquid-glass px-3 py-2 text-xs font-medium text-slate-300 hover:text-white border-white/10 transition cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Graph Visualization Container */}
      <div className="relative rounded-2xl liquid-glass p-4 border border-white/10 overflow-hidden shadow-2xl">
        {/* Floating Graph Legend Overlay */}
        <div className="absolute top-6 left-6 z-20 flex flex-wrap items-center gap-3 rounded-xl bg-slate-950/70 backdrop-blur-md px-3.5 py-2 text-[11px] border border-white/10 text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
            Student Identity
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
            Faculty
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-purple-400 shadow-sm shadow-purple-400/50" />
            Digital Asset
          </span>
          <span className="flex items-center gap-1.5 font-bold text-red-400">
            <span className="h-2 w-4 border-t-2 border-dashed border-red-400 inline-block mr-0.5" />
            Out-of-Role / Excessive
          </span>
        </div>

        {/* Canvas Display */}
        <div className="relative w-full h-[540px] rounded-xl overflow-hidden bg-[#020510]/80">
          <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" />

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs text-xs text-slate-400">
              Generating security network topology...
            </div>
          )}
        </div>

        {/* Selected Node Details Drawer */}
        {selectedNode && (
          <div className="mt-4 rounded-xl bg-slate-900/80 backdrop-blur-md p-4 border border-white/15 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold"
                  style={{ backgroundColor: selectedNode.color }}
                >
                  {selectedNode.type === "USER" ? <User size={20} /> : <Server size={20} />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    {selectedNode.label}
                    {selectedNode.hasRisk && (
                      <span className="rounded bg-red-500/20 px-2 py-0.5 text-[9px] font-bold text-red-300 border border-red-500/30">
                        RISK FLAGGED
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400">{selectedNode.subLabel}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-white/5"
              >
                Close Inspection
              </button>
            </div>

            {/* Relations Summary */}
            <div className="mt-3 grid sm:grid-cols-3 gap-3 text-xs pt-3 border-t border-white/10">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Entity Type</span>
                <p className="font-semibold text-slate-200">{selectedNode.type}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Security Health</span>
                <p className={`font-semibold ${selectedNode.hasRisk ? "text-red-400" : "text-emerald-400"}`}>
                  {selectedNode.hasRisk ? "Non-Compliant Entitlement Detected" : "Compliant Permissions"}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Actions</span>
                <p className="text-cyan-400 cursor-pointer hover:underline">View in Directory →</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Out-of-Role Entitlement Insights Card */}
      <div className="rounded-2xl liquid-glass p-5 border border-white/10">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
          <ShieldAlert size={16} className="text-red-400" />
          Active Out-of-Role Topology Findings ({unexpectedGrants.length})
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Identities holding access entitlements that bypass standard role-based access rules.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {unexpectedGrants.map((grant) => {
            const u = users.find((x) => x.id === grant.userId);
            const a = assets.find((x) => x.id === grant.assetId);

            return (
              <div
                key={grant.id}
                className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-red-200">
                    {u?.fullName ?? "User"} → {a?.name ?? "Asset"}
                  </p>
                  <p className="text-[10px] text-red-300/80 mt-0.5">
                    Assigned: <strong className="font-mono">{grant.accessLevel}</strong> · Role: {u?.role}
                  </p>
                </div>
                <span className="rounded bg-red-500/30 px-2 py-0.5 text-[9px] font-bold text-red-200">
                  FLAGGED
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

