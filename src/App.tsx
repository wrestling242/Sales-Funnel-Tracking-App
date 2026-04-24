/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, Fragment } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, 
  Bell, 
  LayoutDashboard, 
  Edit3, 
  Award,
  Settings,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

interface FunnelEntry {
  id?: string;
  created_at?: string;
  period: 'daily' | 'weekly';
  dms: number;
  calls: number;
  appointments: number;
  meetings: number;
  negotiations: number;
  orders: number;
}

interface FunnelTarget {
  id?: number;
  type: 'daily' | 'monthly';
  dms: number;
  calls: number;
  appointments: number;
  meetings: number;
  negotiations: number;
  orders: number;
  updated_at?: string;
}

// --- Constants ---

const FUNNEL_STAGES = [
  { name: 'Direct Outreach', key: 'dms' },
  { name: 'Initial Qualification', key: 'calls' },
  { name: 'Appointment Secured', key: 'appointments' },
  { name: 'Solution Presentation', key: 'meetings' },
  { name: 'Value Proposal', key: 'negotiations' },
  { name: 'Contract Closing (KGI)', key: 'orders' },
];

// --- Components ---

const ComparisonTable = ({ title, entries, label }: { title: string, entries: FunnelEntry[], label: string }) => {
  return (
    <div className="bg-white border border-border-subtle rounded-[24px] overflow-hidden shadow-sm">
      <div className="px-8 py-5 bg-slate-50 border-b border-border-subtle flex justify-between items-center">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{title}</h3>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-bold text-slate-400">NODE {label}</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-r border-border-subtle bg-slate-50/30 w-32">Date</th>
              <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-r border-border-subtle bg-slate-50/30 w-44">Intelligence Data</th>
              {FUNNEL_STAGES.map((p, i) => (
                <th key={i} className={cn(
                  "px-6 py-5 text-[10px] font-bold text-slate-600 uppercase tracking-wider text-center border-r border-border-subtle last:border-r-0 min-w-[140px]",
                  i === 0 && "bg-slate-50/10"
                )}>
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={FUNNEL_STAGES.length + 2} className="px-8 py-20 text-center text-slate-400 text-sm font-medium italic">
                  No operational data deployed to node.
                </td>
              </tr>
            ) : (
              entries.map((entry, entryIndex) => {
                const dateStr = new Date(entry.created_at!).toLocaleDateString('en-US', { 
                  month: 'numeric', 
                  day: 'numeric', 
                  year: '2-digit' 
                });

                return (
                  <Fragment key={entry.id || entryIndex}>
                    {/* Frequency Row */}
                    <tr className="group hover:bg-slate-50/30 transition-colors">
                      <td rowSpan={2} className="px-6 py-5 text-xs font-bold text-slate-500 border-r border-border-subtle bg-slate-50/20 text-center">
                        {dateStr}
                      </td>
                      <td className="px-6 py-5 text-xs font-bold text-primary border-r border-border-subtle bg-slate-50/10">Total Frequency</td>
                      {FUNNEL_STAGES.map((p, i) => (
                        <td key={i} className="px-6 py-5 text-sm tabular-nums text-center font-bold text-primary border-r border-border-subtle last:border-r-0 bg-white group-hover:bg-transparent">
                          {(entry as any)[p.key]}
                        </td>
                      ))}
                    </tr>
                    {/* Conversion Row */}
                    <tr className="group hover:bg-slate-50/30 transition-colors border-b-2 border-slate-100 last:border-b-0">
                      <td className="px-6 py-5 text-xs font-semibold text-secondary border-r border-border-subtle">Conversion Rate</td>
                      {FUNNEL_STAGES.map((p, i) => {
                        const currentVal = (entry as any)[p.key];
                        const prevPhase = FUNNEL_STAGES[i - 1];
                        const prevVal = prevPhase ? (entry as any)[prevPhase.key] : null;
                        const conversion = prevVal !== null && prevVal > 0 
                          ? (currentVal / prevVal) * 100 
                          : 0;
                        
                        return (
                          <td key={i} className="px-6 py-5 text-sm tabular-nums text-center text-slate-500 border-r border-border-subtle last:border-r-0">
                            {prevPhase ? (
                              <div className="flex flex-col items-center gap-1">
                                <span className={cn(
                                  "font-bold",
                                  conversion > 50 ? "text-emerald-500" : conversion > 20 ? "text-primary" : "text-slate-400"
                                )}>
                                  {conversion.toFixed(1)}%
                                </span>
                                <span className="text-[9px] text-slate-400 uppercase tracking-tighter">to {p.name.split(' ').pop()}</span>
                              </div>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const FunnelPage = ({ entries }: { entries: FunnelEntry[] }) => {
  const dailyEntries = [...entries]
    .filter(e => e.period === 'daily')
    .sort((a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime());

  return (
    <div className="space-y-8 pb-10 pt-4">
      <header>
        <h2 className="text-3xl font-semibold tracking-tight text-primary">Daily Activity Funnel</h2>
        <p className="text-sm font-medium text-slate-500">Sales Performance Dashboard</p>
        <p className="text-secondary mt-1">Stochastic analytics of daily lead-to-order probability transitions.</p>
      </header>
      <div className="grid grid-cols-1 gap-10">
        <ComparisonTable 
          title="Daily Activity Logs" 
          label="Alpha"
          entries={dailyEntries}
        />
      </div>
    </div>
  );
};



const SummaryCard = ({ title, value, trend, isPositive }: any) => (
  <div className="bg-white border border-border-subtle p-6 rounded-[16px]">
    <div className="text-[12px] font-semibold uppercase tracking-wider text-slate-400 mb-2">{title}</div>
    <div className="text-2xl font-semibold text-primary mb-1 tabular-nums">{value}</div>
    <div className="flex items-center gap-1.5">
      <span className={cn(
        "text-xs font-semibold flex items-center gap-0.5",
        isPositive ? "text-emerald-500" : "text-rose-500"
      )}>
        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {trend}
      </span>
      <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">vs last week</span>
    </div>
  </div>
);

// --- Removed redundant FUNNEL_STAGES definition here ---

const StatsPage = ({ entries, targets, onUpdateTarget }: { 
  entries: FunnelEntry[], 
  targets: FunnelTarget[],
  onUpdateTarget: (target: FunnelTarget) => Promise<void>
}) => {
  const now = new Date();
  const [editingTarget, setEditingTarget] = useState<FunnelTarget | null>(null);
  
  const getAggregates = (list: FunnelEntry[]) => ({
    dms: list.reduce((a, b) => a + Number(b.dms || 0), 0),
    calls: list.reduce((a, b) => a + Number(b.calls || 0), 0),
    appointments: list.reduce((a, b) => a + Number(b.appointments || 0), 0),
    meetings: list.reduce((a, b) => a + Number(b.meetings || 0), 0),
    negotiations: list.reduce((a, b) => a + Number(b.negotiations || 0), 0),
    orders: list.reduce((a, b) => a + Number(b.orders || 0), 0),
  });

  const dailyTarget = targets.find(t => t.type === 'daily') || { type: 'daily', dms: 0, calls: 0, appointments: 0, meetings: 0, negotiations: 0, orders: 0 } as FunnelTarget;
  const monthlyTarget = targets.find(t => t.type === 'monthly') || { type: 'monthly', dms: 0, calls: 0, appointments: 0, meetings: 0, negotiations: 0, orders: 0 } as FunnelTarget;

  const todayEntries = entries.filter(e => new Date(e.created_at!).toDateString() === now.toDateString());
  const monthEntries = entries.filter(e => {
    const d = new Date(e.created_at!);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const today = getAggregates(todayEntries);
  const month = getAggregates(monthEntries);
  const total = getAggregates(entries);

  const handleSaveTarget = async () => {
    if (editingTarget) {
      await onUpdateTarget(editingTarget);
      setEditingTarget(null);
    }
  };

  const renderKPIRow = (title: string, data: any, options: { 
    isConversion?: boolean, 
    subtext?: string, 
    isEditable?: boolean, 
    targetType?: 'daily' | 'monthly',
    compareWithTarget?: any 
  } = {}) => {
    const { isConversion = false, subtext, isEditable = false, targetType, compareWithTarget } = options;
    const isEditing = editingTarget && editingTarget.type === targetType;

    return (
      <tr className={cn(
        "group hover:bg-slate-50/50 transition-colors relative", 
        isConversion ? "bg-slate-50/20" : "",
        isEditing ? "bg-slate-100/50" : ""
      )}>
        <td className="px-8 py-5 border-r border-border-subtle">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className={cn("text-xs font-bold", isConversion ? "text-secondary" : "text-primary")}>{title}</span>
              {isEditable && !isEditing && (
                <button 
                  onClick={() => setEditingTarget(targetType === 'monthly' ? monthlyTarget : dailyTarget)}
                  className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Edit3 size={12} />
                </button>
              )}
              {isEditing && (
                <button 
                  onClick={handleSaveTarget}
                  className="px-2 py-0.5 rounded bg-primary text-white text-[10px] font-bold hover:bg-slate-800 transition-colors"
                >
                  SAVE
                </button>
              )}
            </div>
            {subtext && <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter mt-0.5">{subtext}</span>}
          </div>
        </td>
        {FUNNEL_STAGES.map((s, i) => {
          const val = (isEditing ? (editingTarget as any)[s.key] : (data as any)[s.key]);
          const prevKey = FUNNEL_STAGES[i-1]?.key as string;
          const prevVal = prevKey ? (data as any)[prevKey] : null;
          
          let display: any = "";
          let colorClass = "";

          if (isConversion && compareWithTarget) {
            const currentActual = Number(val || 0);
            const prevActual = Number(prevVal || 0);
            const actualRate = prevActual > 0 ? (currentActual / prevActual) : 0;

            const currentTarget = Number((compareWithTarget as any)[s.key] || 0);
            const targetPrevKey = FUNNEL_STAGES[i-1]?.key as string;
            const prevTarget = targetPrevKey ? Number((compareWithTarget as any)[targetPrevKey] || 0) : 0;
            const targetRate = prevTarget > 0 ? (currentTarget / prevTarget) : 0;

            if (targetRate > 0) {
              const progress = (actualRate / targetRate) * 100;
              if (progress < 33.3) colorClass = "text-rose-500";
              else if (progress < 66.6) colorClass = "text-amber-500";
              else colorClass = "text-emerald-500";
            }
          }

          if (isConversion) {
            const conv = (prevVal && prevVal > 0) ? (val / prevVal) * 100 : 0;
            display = prevVal !== null ? `${conv.toFixed(1)}%` : "—";
          } else if (isEditing) {
            display = (
              <input 
                type="number"
                step="0.1"
                value={val || ''}
                onChange={(e) => setEditingTarget(prev => prev ? ({ ...prev, [s.key]: parseFloat(e.target.value) || 0 }) : null)}
                className="w-full bg-white border border-border-subtle rounded-lg px-2 py-1 text-center font-bold text-primary focus:outline-none focus:border-primary text-sm shadow-sm"
              />
            );
          } else {
            display = val.toLocaleString(undefined, { maximumFractionDigits: 2 });
          }

          return (
            <td key={i} className="px-6 py-5 text-center border-r border-border-subtle last:border-r-0">
              <span className={cn(
                "text-sm tabular-nums font-bold",
                isConversion 
                  ? (colorClass || "text-slate-500 font-semibold") 
                  : "text-primary",
                !isConversion && !isEditing && val > 0 && "text-primary"
              )}>
                {display}
              </span>
            </td>
          );
        })}
      </tr>
    );
  };

  return (
    <div className="space-y-8 pb-10">
      <header>
        <h2 className="text-3xl font-semibold tracking-tight text-primary">Overview</h2>
        <p className="text-sm font-medium text-slate-500">Sales Performance Dashboard</p>
        <p className="text-secondary mt-1">Operational Diagnostics & Strategic KPI Dashboard.</p>
      </header>

      <div className="bg-white border border-border-subtle rounded-[24px] overflow-hidden shadow-sm">
        <div className="px-8 py-5 bg-slate-50 border-b border-border-subtle flex justify-between items-center">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Funnel KPI Architecture</h3>
          <p className="text-[9px] text-slate-400 font-bold uppercase">Click edit to update targets</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-border-subtle">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-r border-border-subtle w-56">Intelligence Layer</th>
                {FUNNEL_STAGES.map((s, i) => (
                  <th key={i} className="px-6 py-5 text-[10px] font-bold text-slate-600 uppercase tracking-wider text-center border-r border-border-subtle last:border-r-0">
                    {s.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {renderKPIRow("Monthly KPI", monthlyTarget, { subtext: "Strategic Target", isEditable: true, targetType: 'monthly' })}
              {renderKPIRow("Monthly Progress", month, { subtext: `Period ${now.getMonth() + 1}/${now.getFullYear()}` })}
              {renderKPIRow("Monthly Conversion Performance", month, { isConversion: true, subtext: "Strategic Yield", compareWithTarget: monthlyTarget })}
              <tr className="bg-slate-100/30 h-1" />
              {renderKPIRow("Daily KPI", dailyTarget, { subtext: "Daily Objective", isEditable: true, targetType: 'daily' })}
              {renderKPIRow("Today's Results", today, { subtext: "Real-time Delta" })}
              <tr className="bg-slate-100/30 h-1" />
              {[...monthEntries].sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()).slice(0, 5).map((entry, idx) => {
                const date = new Date(entry.created_at!);
                const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                return (
                  <Fragment key={entry.id || idx}>
                    {renderKPIRow(`${label} Results`, entry, { subtext: "LOGGED PRODUCTION" })}
                  </Fragment>
                );
              })}
              <tr className="bg-slate-100/30 h-1" />
              {renderKPIRow("Running Total", total, { subtext: "Cumulative Force" })}
              {renderKPIRow("Running Conversion Rate", total, { isConversion: true, subtext: "Node Integrity", compareWithTarget: monthlyTarget })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const EntryPage = ({ onSave }: { onSave: (data: FunnelEntry) => Promise<void> }) => {
  const [formData, setFormData] = useState<FunnelEntry>({
    period: 'daily',
    created_at: new Date().toISOString().split('T')[0],
    dms: 0,
    calls: 0,
    appointments: 0,
    meetings: 0,
    negotiations: 0,
    orders: 0
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    setIsSaving(true);
    // Ensure we send back a proper ISO string if the user picked a date
    const finalData = {
      ...formData,
      created_at: formData.created_at ? new Date(formData.created_at).toISOString() : undefined
    };
    await onSave(finalData);
    setIsSaving(false);
    setFormData({ 
      period: 'daily', 
      created_at: new Date().toISOString().split('T')[0],
      dms: 0, 
      calls: 0, 
      appointments: 0, 
      meetings: 0, 
      negotiations: 0, 
      orders: 0 
    });
  };

  const handleChange = (field: keyof FunnelEntry, value: string) => {
    if (field === 'period') {
      setFormData(prev => ({ ...prev, [field]: value as 'daily' | 'weekly' }));
    } else if (field === 'created_at') {
      setFormData(prev => ({ ...prev, [field]: value }));
    } else {
      setFormData(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
    }
  };

  return (
    <div className="space-y-8 pb-10 max-w-5xl mx-auto">
      <header className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-primary">Intelligence Node</h2>
          <p className="text-sm font-medium text-slate-500">Sales Performance Dashboard</p>
          <p className="text-secondary mt-1">Manual data entry for funnel activity metrics.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white border border-border-subtle rounded-[16px] p-8">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-base font-semibold text-primary">Funnel Metrics</h3>
            <div className="flex items-center gap-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase">DEPLOYMENT DATE</label>
              <input 
                type="date"
                value={formData.created_at || ''}
                onChange={(e) => handleChange('created_at', e.target.value)}
                className="bg-slate-50 border border-border-subtle rounded-lg px-3 py-1 text-xs font-semibold focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">
            {FUNNEL_STAGES.map((item) => (
              <div key={item.key} className="group">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 group-focus-within:text-primary">
                  {item.name}
                </label>
                <input 
                  type="number" 
                  value={(formData as any)[item.key] || ''}
                  onChange={(e) => handleChange(item.key as keyof FunnelEntry, e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-border-subtle rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:bg-white text-sm transition-all"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-border-subtle rounded-[16px] p-8">
          <div className="flex justify-end gap-3">
            <button 
              onClick={() => setFormData({ period: 'daily', dms: 0, calls: 0, appointments: 0, meetings: 0, negotiations: 0, orders: 0 })}
              className="px-6 py-2.5 rounded-xl border border-border-subtle font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              Flush
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-10 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? 'Syncing...' : 'Deploy Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsPage = ({ entries }: { entries: FunnelEntry[] }) => (
  <div className="space-y-8 pb-10 max-w-3xl mx-auto">
    <header>
      <h2 className="text-3xl font-semibold tracking-tight text-primary">Configuration</h2>
      <p className="text-sm font-medium text-slate-500">Sales Performance Dashboard</p>
      <p className="text-secondary mt-1">System parameters and database connectivity profiles.</p>
    </header>
    <div className="bg-white border border-border-subtle rounded-[16px] overflow-hidden">
      <div className="p-6 border-b border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database size={20} className="text-slate-400" />
          <div>
            <p className="font-semibold text-sm">Vercel Postgres</p>
            <p className="text-xs text-slate-400">Server-side relational database sync.</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full border border-emerald-100">
          STABLE LINK
        </div>
      </div>
      <div className="p-8 space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Environment Status</label>
          <div className="p-4 bg-slate-50 rounded-xl border border-border-subtle border-dashed flex items-center gap-4">
            <AlertCircle className="text-slate-400" size={20} />
            <p className="text-xs text-slate-500">Database is automatically provisioned via POSTGRES_URL. No local keys required.</p>
          </div>
        </div>
        <div className="pt-6 border-t border-border-subtle flex justify-between items-center">
          <span className="text-sm font-medium">Recorded Events</span>
          <span className="text-xs font-bold tabular-nums text-slate-400">{entries.length} RECORDS</span>
        </div>
        <div className="pt-4 flex justify-between items-center">
          <span className="text-sm font-medium">Automatic Backups</span>
          <div className="w-10 h-5 bg-primary rounded-full relative">
            <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const NavItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
      active ? "bg-slate-100 text-primary shadow-sm" : "text-slate-400 hover:text-primary hover:bg-slate-50"
    )}
  >
    <Icon size={20} className={cn("transition-transform group-hover:scale-110", active && "scale-110")} />
    {label}
  </button>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<'entry' | 'stats' | 'funnel' | 'settings'>('stats');
  const [entries, setEntries] = useState<FunnelEntry[]>([]);
  const [targets, setTargets] = useState<FunnelTarget[]>([]);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    fetchEntries();
    fetchTargets();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await fetch('/api/entries');
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setDbError(errorData.message || errorData.error || `Server responded with ${res.status}`);
        return;
      }
      const data = await res.json();
      setEntries(data.map((e: any) => ({
        ...e,
        dms: Number(e.dms || 0),
        calls: Number(e.calls || 0),
        appointments: Number(e.appointments || 0),
        meetings: Number(e.meetings || 0),
        negotiations: Number(e.negotiations || 0),
        orders: Number(e.orders || 0),
      })));
      setDbError(null);
    } catch (err: any) {
      console.error('Error fetching entries:', err);
      setDbError('Failed to connect to backend server.');
    }
  };

  const fetchTargets = async () => {
    try {
      const res = await fetch('/api/targets');
      if (res.ok) {
        const data = await res.json();
        setTargets(data.map((t: any) => ({
          ...t,
          dms: Number(t.dms || 0),
          calls: Number(t.calls || 0),
          appointments: Number(t.appointments || 0),
          meetings: Number(t.meetings || 0),
          negotiations: Number(t.negotiations || 0),
          orders: Number(t.orders || 0),
        })));
      }
    } catch (err) {
      console.error('Error fetching targets:', err);
    }
  };

  const handleUpdateTarget = async (target: FunnelTarget) => {
    try {
      const res = await fetch('/api/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(target)
      });
      if (res.ok) {
        const updatedRaw = await res.json();
        const updated = {
          ...updatedRaw,
          dms: Number(updatedRaw.dms || 0),
          calls: Number(updatedRaw.calls || 0),
          appointments: Number(updatedRaw.appointments || 0),
          meetings: Number(updatedRaw.meetings || 0),
          negotiations: Number(updatedRaw.negotiations || 0),
          orders: Number(updatedRaw.orders || 0),
        };
        setTargets(prev => prev.map(t => t.type === updated.type ? updated : t));
      }
    } catch (err) {
      console.error('Error updating target:', err);
    }
  };

  const handleSaveEntry = async (formData: FunnelEntry) => {
    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Failed to save to database');
      }
      
      const savedEntry = await res.json();
      setEntries(prev => [savedEntry, ...prev]);
      alert('Data successfully deployed to node.');
    } catch (err: any) {
      console.error('Error saving entry:', err);
      alert(`Sync failure: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-bg overflow-hidden">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-border-subtle flex-col p-6 h-screen sticky top-0">
        <div className="flex items-center gap-2 mb-12">
          <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
            <LayoutDashboard className="text-white" size={14} />
          </div>
          <span className="font-bold text-lg tracking-tight">Intelligence</span>
        </div>
        
        <nav className="space-y-1">
          <NavItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={activeTab === 'stats'} 
            onClick={() => setActiveTab('stats')}
          />
          <NavItem 
            icon={Edit3} 
            label="Daily Entry" 
            active={activeTab === 'entry'} 
            onClick={() => setActiveTab('entry')}
          />
          <NavItem 
            icon={TrendingUp} 
            label="Funnel" 
            active={activeTab === 'funnel'}
            onClick={() => setActiveTab('funnel')}
          />
          <NavItem 
            icon={Settings} 
            label="Settings" 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')}
          />
        </nav>

        <div className="mt-auto">
          <div className="p-4 rounded-2xl bg-slate-50 border border-border-subtle">
            <p className="text-[11px] font-semibold text-primary mb-1">Premium Plan</p>
            <p className="text-[10px] text-slate-500">Upgrade for more insights</p>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-border-subtle h-16 lg:h-20 sticky top-0 z-40 px-6 lg:px-10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="lg:hidden w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <LayoutDashboard size={18} className="text-white" />
            </div>
            <h1 className="text-lg font-bold lg:hidden">Intelligence</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-primary transition-colors p-2 hover:bg-slate-50 rounded-xl">
              <Bell size={20} />
            </button>
            <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden ring-1 ring-border-subtle">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRpJy6sPadKcrVI8XR3hHGifGse2R41pawNlMURgRufw90HyC50jjDlEBGKsdkU5AWUOrNECh6290r8pOhJM7SR2boFIZchcGmQi5ECg5gIIovrDRQhm_vxhasRTDt5FNm94b-ZhKps9HAWBjduGRNWhtrbDPw8NIXp1ou0lhzSHKUSJUKfBsaYo2sJUb9W0rRXzLDYdFdVritCJPceWhL00rvHk8_ql_SBKN8z2owczlahbcP_ch_t-434q7kI9aIaX7iKhuPydA" 
                alt="Account"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        {/* Main Section */}
        <main className="p-6 lg:p-10 max-w-7xl mx-auto w-full">
          {dbError && (
            <div className="mb-8 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700">
              <AlertCircle size={20} />
              <div className="text-sm">
                <p className="font-semibold">Database Setup Required</p>
                <p className="opacity-90">To enable persistent storage, add your <code className="bg-rose-100 px-1 rounded">POSTGRES_URL</code> to the project secrets in AI Studio.</p>
              </div>
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {activeTab === 'stats' && (
                <StatsPage 
                  entries={entries} 
                  targets={targets} 
                  onUpdateTarget={handleUpdateTarget} 
                />
              )}
              {activeTab === 'entry' && <EntryPage onSave={handleSaveEntry} />}
              {activeTab === 'funnel' && <FunnelPage entries={entries} />}
              {activeTab === 'settings' && <SettingsPage entries={entries} />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Nav - Mobile Only */}
        <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-border-subtle h-16 flex justify-around items-center px-6 z-50">
          <button 
            onClick={() => setActiveTab('stats')}
            className={cn("p-2 rounded-xl transition-all", activeTab === 'stats' ? "text-primary bg-slate-100" : "text-slate-400")}
          >
            <LayoutDashboard size={24} />
          </button>
          <button 
            onClick={() => setActiveTab('entry')}
            className={cn("p-2 rounded-xl transition-all", activeTab === 'entry' ? "text-primary bg-slate-100" : "text-slate-400")}
          >
            <Edit3 size={24} />
          </button>
          <button 
            onClick={() => setActiveTab('funnel')}
            className={cn("p-2 rounded-xl transition-all", activeTab === 'funnel' ? "text-primary bg-slate-100" : "text-slate-400")}
          >
            <TrendingUp size={24} />
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={cn("p-2 rounded-xl transition-all", activeTab === 'settings' ? "text-primary bg-slate-100" : "text-slate-400")}
          >
            <Settings size={24} />
          </button>
        </nav>
      </div>
    </div>
  );
}
