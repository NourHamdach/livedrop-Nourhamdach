// /apps/storefront/src/pages/AdminDashboard.tsx
import React, { useEffect, useState } from "react";
import Price from "../components/atoms/Price";
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";
import {
  DollarSign, ShoppingCart, TrendingUp, Activity,
  Wifi, Clock, MessageSquare, Database, WifiOff,
} from "lucide-react";
import {
  DashboardBusiness,
  DailyPoint,
  DashboardPerformance,
  AssistantStats,
} from "../types";
import {
  fetchDashboardBusiness,
  fetchDailyRevenue,
  fetchDashboardPerformance,
  fetchAssistantStats,
} from "../lib/api";

type SystemHealth = {
  dbStatus: "connected" | "error" | "checking";
  llmStatus: "connected" | "error" | "checking";
  lastUpdate: Date;
};

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001/api";
const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export default function AdminDashboard() {
  const [business, setBusiness] = useState<DashboardBusiness | null>(null);
  const [dailyRevenue, setDailyRevenue] = useState<DailyPoint[]>([]);
  const [performance, setPerformance] = useState<DashboardPerformance | null>(null);
  const [assistant, setAssistant] = useState<AssistantStats | null>(null);
  const [system, setSystem] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    try {
      const [b, d, p, a] = await Promise.all([
        fetchDashboardBusiness(),
        fetchDailyRevenue({}),
        fetchDashboardPerformance(),
        fetchAssistantStats(),
      ]);

      const healthRes = await fetch(`${API_BASE}/health`);
      const health = await healthRes.json();

      setBusiness(b);
      setDailyRevenue(d);
      setPerformance(p);
      setAssistant(a);
      setSystem({
        dbStatus: health.database === "ok" ? "connected" : "error",
        llmStatus: health.llm_service === "ok" ? "connected" : "error",
        lastUpdate: new Date(),
      });
      setLoading(false);
    } catch (err) {
      console.error("Dashboard load error:", err);
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !business || !performance || !assistant || !system) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Loading dashboard…
      </div>
    );
  }

  const orderStatusData = Object.entries(business.ordersByStatus ?? {}).map(
  ([status, count]) => ({ status, count })
);

 const intentData = Object.entries(assistant.intentDistribution ?? {}).map(
  ([intent, count]) => ({ intent, count })
);

const functionData = Object.entries(assistant.functionCalls ?? {}).map(
  ([fn, count]) => ({ fn, count })
);


  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm p-6 flex justify-between">
        <h1 className="text-3xl font-semibold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">Auto-refresh every 30 s</p>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-10">
        {/* BUSINESS METRICS */}
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <DollarSign className="text-green-600" /> Business Metrics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            <MetricCard title="Total Revenue" value={<Price value={business.totalRevenue} size="lg" />} icon={DollarSign} />
            <MetricCard title="Total Orders" value={business.totalOrders.toLocaleString()} icon={ShoppingCart} />
            <MetricCard title="Average Order Value" value={<Price value={business.avgOrderValue} size="lg" />} icon={TrendingUp} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Revenue Over Time">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#10B981" />
                  <Line type="monotone" dataKey="orderCount" stroke="#F59E0B" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Orders by Status">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={orderStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count">
                    {orderStatusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </section>

        {/* PERFORMANCE */}
   {/* PERFORMANCE */}
<section>
  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
    <Activity className="text-blue-600" /> Performance Monitoring
  </h2>

  {/* ⚠️ Critical Alert Banner */}
  {performance.hasCriticalErrors && (
    <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 font-medium shadow-sm">
      ⚠️ Critical backend errors detected (status 500). Check logs below.
    </div>
  )}

  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
    <MetricCard title="API p50" value={`${performance.apiLatencyMsP50} ms`} icon={Activity} />
    <MetricCard title="API p95" value={`${performance.apiLatencyMsP95} ms`} icon={Activity} />
    <MetricCard title="Active SSE" value={performance.sseActiveConnections} icon={Wifi} />
    <MetricCard title="Sample Size" value={performance.sampleSize ?? 0} icon={Database} />
    <MetricCard title="Failed (24 h)" value={performance.failedRequestsCount24h ?? 0} icon={Activity} />
  </div>

  {/* Optional detailed failure table */}
  {performance.failedRoutes && Object.keys(performance.failedRoutes).length > 0 && (
    <div className="mt-6 bg-white border rounded-lg p-4 shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-2">Recent Failed Routes</h3>
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b text-gray-600">
            <th className="py-2 px-3">Route / Status</th>
            <th className="py-2 px-3">Count</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(performance.failedRoutes).map(([route, count]) => (
            <tr key={route} className="border-b last:border-0">
              <td className="py-2 px-3 font-mono text-gray-700">{route}</td>
              <td className="py-2 px-3">{count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</section>

        {/* ASSISTANT ANALYTICS */}
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
  <MessageSquare className="text-purple-600" /> Assistant Analytics
</h2>
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
  <MetricCard title="Total Queries" value={assistant.totalQueries} icon={MessageSquare} />
  <MetricCard title="p50 Response" value={`${assistant.avgResponseMsP50} ms`} icon={Clock} />
  <MetricCard title="p95 Response" value={`${assistant.avgResponseMsP95} ms`} icon={Clock} />
</div>

        {/* SYSTEM HEALTH */}
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Database className="text-green-600" /> System Health
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <HealthCard label="Database" ok={system.dbStatus === "connected"} icon={Database} />
            <HealthCard label="LLM Service" ok={system.llmStatus === "connected"} icon={Wifi} badIcon={WifiOff} />
            <HealthCard label="Last Update" detail={system.lastUpdate.toLocaleTimeString()} icon={Clock} />
          </div>
        </section>

        <footer className="text-center text-xs text-gray-500 pt-4">
          Data from /api/dashboard/* · Auto-refresh 30 s
        </footer>
      </main>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function MetricCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: React.ReactNode;
  icon: any;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <Icon size={18} className="text-gray-400" />
      </div>
      <div className="text-2xl font-semibold mt-2">{value}</div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}

function HealthCard({
  label,
  ok,
  detail,
  icon: Icon,
  badIcon: BadIcon,
}: {
  label: string;
  ok?: boolean;
  detail?: string;
  icon: any;
  badIcon?: any;
}) {
  const color = ok ? "text-green-600" : "text-red-600";
  const IconComponent = ok ? Icon : BadIcon || Icon;
  return (
    <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
      <div className="flex items-center justify-between">
        <p className="text-gray-700 font-medium">{label}</p>
        {IconComponent && <IconComponent size={20} className={color} />}
      </div>
      {detail && <p className="text-sm text-gray-600 mt-2">{detail}</p>}
    </div>
  );
}
