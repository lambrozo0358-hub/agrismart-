import React, { useState, useEffect } from "react";
import { translations } from "../translations";
import { Language } from "../types";
import { 
  Users, 
  Sprout, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  AlertTriangle,
  Layout,
  RefreshCw
} from "lucide-react";

interface AdminPanelProps {
  lang: Language;
}

export default function AdminPanel({ lang }: AdminPanelProps) {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const t = translations[lang];

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/metrics")
      .then((res) => res.json())
      .then((data) => {
        setMetrics(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Sandbox user list for management simulator
  const demoUsers = [
    { id: 1, name: "Yassine El Mansouri", location: "Souss-Massa", plan: "Premium", phone: "+212 661-234567", activeCrops: "Tomatoes, Citrus" },
    { id: 2, name: "Fatima Ez-Zahra", location: "Saïs Olive Groves", plan: "Enterprise", phone: "+212 672-918234", activeCrops: "Olives, Wheat" },
    { id: 3, name: "Driss El Alami", location: "Gharb Valley", plan: "Free", phone: "+212 670-349281", activeCrops: "Tomato nursery" },
    { id: 4, name: "Morocco Olive Corp", location: "Haouz Plain", plan: "Enterprise", phone: "+212 522-814911", activeCrops: "Olives, Wheat, Potato rows" }
  ];

  return (
    <div className="space-y-6 text-left">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-slate-900">{t.adminPanel}</h3>
              <p className="text-xs text-slate-500">{t.farmActivityMonitor}</p>
            </div>
          </div>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold font-mono px-3 py-1 rounded-full uppercase border border-emerald-200">
            Regional System Controller: active
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : metrics ? (
          <div className="space-y-6">
            
            {/* Summary counters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                <div className="flex justify-between items-start text-slate-400">
                  <span className="text-xs font-semibold uppercase">{t.totalUsers}</span>
                  <Users className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="text-2xl font-extrabold text-slate-950 font-display mt-2">
                  {metrics.totalUsers}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">✓ Verified Moroccan IDs</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                <div className="flex justify-between items-start text-slate-400">
                  <span className="text-xs font-semibold uppercase">{t.totalFarms}</span>
                  <Sprout className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="text-2xl font-extrabold text-slate-950 font-display mt-2">
                  {metrics.totalFarmsHectares.toLocaleString()} Hectares
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Souss-Massa & Gharb area</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                <div className="flex justify-between items-start text-slate-400">
                  <span className="text-xs font-semibold uppercase">{t.systemLoad}</span>
                  <Cpu className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-2xl font-extrabold text-slate-950 font-display mt-2">
                  {metrics.systemLoadPct}%
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Gemini-3.5 API latency: 1.2s</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                <div className="flex justify-between items-start text-slate-400">
                  <span className="text-xs font-semibold uppercase">{t.usersWithSustainedPlans}</span>
                  <Zap className="w-5 h-5 text-amber-500" />
                </div>
                <div className="text-2xl font-extrabold text-slate-950 font-display mt-2">
                  {metrics.premiumPlanRatio}%
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Standard subscription growth</p>
              </div>
            </div>

            {/* Subscribed Farmers list */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 text-sm">{t.userManagement}</h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-sm text-left text-slate-500">
                  <thead className="text-xs text-slate-700 bg-slate-50 border-b border-slate-200 uppercase font-mono">
                    <tr>
                      <th className="px-6 py-3.5">Farmer Name</th>
                      <th className="px-6 py-3.5">Cropping Region</th>
                      <th className="px-6 py-3.5">Active Crops</th>
                      <th className="px-6 py-3.5">Phone Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {demoUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-semibold text-slate-900">{u.name}</td>
                        <td className="px-6 py-4">{u.location}</td>
                        <td className="px-6 py-4 text-xs font-mono font-medium">{u.activeCrops}</td>
                        <td className="px-6 py-4 text-xs">{u.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        ) : null}
      </div>
    </div>
  );
}
