import { useState, useEffect, useRef } from "react";
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadialBarChart, RadialBar, Legend
} from "recharts";

// — Utility: generate simulated server metrics —
function generateServerMetrics(numServers, tick) {
  return Array.from({ length: numServers }, (_, i) => {
    const base = 30 + i * 5;
    const noise = Math.sin(tick * 0.3 + i) * 15 + Math.random() * 10;
    const cpu = Math.min(95, Math.max(5, base + noise));
    const mem = Math.min(90, Math.max(10, base + 10 + Math.cos(tick * 0.2 + i) * 12));
    const net = Math.min(100, Math.max(0, 20 + Math.sin(tick * 0.5 + i * 2) * 18));
    return {
      id: `SRV-${String(i + 1).padStart(2, "0")}`,
      cpu: parseFloat(cpu.toFixed(1)),
      memory: parseFloat(mem.toFixed(1)),
      network: parseFloat(net.toFixed(1)),
      status: cpu > 85 ? "critical" : cpu > 65 ? "warning" : "healthy",
      tasks: Math.floor(Math.random() * 12 + 2),
    };
  });
}

function generateHistoryPoint(tick, numServers) {
  const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const metrics = generateServerMetrics(numServers, tick);
  return {
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    cpu: parseFloat(avg(metrics.map((m) => m.cpu)).toFixed(1)),
    memory: parseFloat(avg(metrics.map((m) => m.memory)).toFixed(1)),
    network: parseFloat(avg(metrics.map((m) => m.network)).toFixed(1)),
    energy: parseFloat((avg(metrics.map((m) => m.cpu)) * 0.45 + 20).toFixed(1)),
  };
}

const STATUS_COLOR = { healthy: "#22d3a5", warning: "#f59e0b", critical: "#ef4444" };
const STATUS_BG = { healthy: "rgba(34,211,165,0.1)", warning: "rgba(245,158,11,0.1)", critical: "rgba(239,68,68,0.1)" };

export default function ResourceMonitor() {
  const NUM_SERVERS = 8;
  const MAX_HISTORY = 30;
  const tickRef = useRef(0);

  const [servers, setServers] = useState(() => generateServerMetrics(NUM_SERVERS, 0));
  const [history, setHistory] = useState(() =>
    Array.from({ length: 10 }, (_, i) => generateHistoryPoint(i, NUM_SERVERS))
  );
  const [selected, setSelected] = useState(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      tickRef.current += 1;
      const t = tickRef.current;
      setServers(generateServerMetrics(NUM_SERVERS, t));
      setHistory((prev) => {
        const next = [...prev, generateHistoryPoint(t, NUM_SERVERS)];
        return next.length > MAX_HISTORY ? next.slice(next.length - MAX_HISTORY) : next;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [paused]);

  const avgCpu = (servers.reduce((a, b) => a + b.cpu, 0) / servers.length).toFixed(1);
  const avgMem = (servers.reduce((a, b) => a + b.memory, 0) / servers.length).toFixed(1);
  const avgNet = (servers.reduce((a, b) => a + b.network, 0) / servers.length).toFixed(1);
  const totalTasks = servers.reduce((a, b) => a + b.tasks, 0);
  const criticalCount = servers.filter((s) => s.status === "critical").length;
  const warningCount = servers.filter((s) => s.status === "warning").length;
  const healthyCount = servers.filter((s) => s.status === "healthy").length;

  const radialData = [
    { name: "CPU", value: parseFloat(avgCpu), fill: "#60a5fa" },
    { name: "Memory", value: parseFloat(avgMem), fill: "#a78bfa" },
    { name: "Network", value: parseFloat(avgNet), fill: "#22d3a5" },
  ];

  const selectedServer = selected ? servers.find((s) => s.id === selected) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", color: "#e2e8f0", fontFamily: "'JetBrains Mono', 'Fira Code', monospace", padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#60a5fa", letterSpacing: 1 }}>⚡ Resource Monitor</span>
            <span style={{
              background: paused ? "rgba(239,68,68,0.15)" : "rgba(34,211,165,0.15)",
              color: paused ? "#ef4444" : "#22d3a5",
              border: `1px solid ${paused ? "#ef4444" : "#22d3a5"}`,
              borderRadius: 20, padding: "2px 12px", fontSize: 11, fontWeight: 700, letterSpacing: 1
            }}>{paused ? "● PAUSED" : "● LIVE"}</span>
          </div>
          <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>AI Data Center — {NUM_SERVERS} Servers</div>
        </div>
        <button
          onClick={() => setPaused((p) => !p)}
          style={{
            background: paused ? "rgba(34,211,165,0.1)" : "rgba(239,68,68,0.1)",
            color: paused ? "#22d3a5" : "#ef4444",
            border: `1px solid ${paused ? "#22d3a5" : "#ef4444"}`,
            borderRadius: 8, padding: "8px 20px", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 13
          }}
        >{paused ? "▶ Resume" : "⏸ Pause"}</button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Avg CPU", value: `${avgCpu}%`, color: "#60a5fa", icon: "🖥" },
          { label: "Avg Memory", value: `${avgMem}%`, color: "#a78bfa", icon: "💾" },
          { label: "Avg Network", value: `${avgNet}%`, color: "#22d3a5", icon: "🌐" },
          { label: "Active Tasks", value: totalTasks, color: "#f59e0b", icon: "⚙" },
          { label: "Critical", value: criticalCount, color: "#ef4444", icon: "🔴" },
          { label: "Warning", value: warningCount, color: "#f59e0b", icon: "🟡" },
          { label: "Healthy", value: healthyCount, color: "#22d3a5", icon: "🟢" },
        ].map((card) => (
          <div key={card.label} style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12, padding: "16px 18px"
          }}>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>{card.icon} {card.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 28 }}>
        {/* Line Chart */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 16 }}>📈 Live Metrics History</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={history}>
              <defs>
                <linearGradient id="gCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gMem" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3a5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22d3a5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" tick={{ fill: "#475569", fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tick={{ fill: "#475569", fontSize: 10 }} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, color: "#e2e8f0", fontSize: 12 }} />
              <Area type="monotone" dataKey="cpu" stroke="#60a5fa" fill="url(#gCpu)" strokeWidth={2} name="CPU %" dot={false} />
              <Area type="monotone" dataKey="memory" stroke="#a78bfa" fill="url(#gMem)" strokeWidth={2} name="Memory %" dot={false} />
              <Area type="monotone" dataKey="network" stroke="#22d3a5" fill="url(#gNet)" strokeWidth={2} name="Network %" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Radial Chart */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 8 }}>📊 Current Load</div>
          <ResponsiveContainer width="100%" height={220}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" data={radialData} startAngle={90} endAngle={-270}>
              <RadialBar minAngle={15} background={{ fill: "rgba(255,255,255,0.04)" }} dataKey="value" />
              <Legend iconSize={10} formatter={(val) => <span style={{ color: "#94a3b8", fontSize: 11 }}>{val}</span>} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, color: "#e2e8f0", fontSize: 12 }} formatter={(v) => `${v}%`} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Server Grid */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20, marginBottom: 28 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 16 }}>🖥 Server Fleet</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {servers.map((s) => (
            <div
              key={s.id}
              onClick={() => setSelected(selected === s.id ? null : s.id)}
              style={{
                background: selected === s.id ? STATUS_BG[s.status] : "rgba(255,255,255,0.02)",
                border: `1px solid ${selected === s.id ? STATUS_COLOR[s.status] : "rgba(255,255,255,0.06)"}`,
                borderRadius: 10, padding: "14px 16px", cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: "#e2e8f0" }}>{s.id}</span>
                <span style={{
                  background: STATUS_BG[s.status], color: STATUS_COLOR[s.status],
                  border: `1px solid ${STATUS_COLOR[s.status]}`,
                  borderRadius: 20, padding: "1px 9px", fontSize: 10, fontWeight: 700
                }}>{s.status.toUpperCase()}</span>
              </div>
              {[{ label: "CPU", value: s.cpu, color: "#60a5fa" }, { label: "MEM", value: s.memory, color: "#a78bfa" }, { label: "NET", value: s.network, color: "#22d3a5" }].map((m) => (
                <div key={m.label} style={{ marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#64748b", marginBottom: 2 }}>
                    <span>{m.label}</span><span style={{ color: m.color }}>{m.value}%</span>
                  </div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${m.value}%`, background: m.color, borderRadius: 2, transition: "width 0.5s" }} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 8, fontSize: 10, color: "#64748b" }}>⚙ {s.tasks} active tasks</div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Server Detail */}
      {selectedServer && (
        <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${STATUS_COLOR[selectedServer.status]}`, borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 12 }}>
            🔍 {selectedServer.id} — Detailed View
            <span style={{ marginLeft: 10, color: STATUS_COLOR[selectedServer.status], fontSize: 12 }}>{selectedServer.status.toUpperCase()}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {[
              { label: "CPU Usage", value: `${selectedServer.cpu}%`, color: "#60a5fa" },
              { label: "Memory", value: `${selectedServer.memory}%`, color: "#a78bfa" },
              { label: "Network I/O", value: `${selectedServer.network}%`, color: "#22d3a5" },
              { label: "Active Tasks", value: selectedServer.tasks, color: "#f59e0b" },
            ].map((m) => (
              <div key={m.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>{m.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: m.color }}>{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}