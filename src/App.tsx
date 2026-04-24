/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
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
  dms: number;
  calls: number;
  appointments: number;
  meetings: number;
  negotiations: number;
  orders: number;
}

// --- Components ---

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

const StatsPage = ({ entries }: { entries: FunnelEntry[] }) => {
  const activityData = [
    { day: 'MON', calls: 45, dms: 60 },
    { day: 'TUE', calls: 55, dms: 75 },
    { day: 'WED', calls: 85, dms: 65 },
    { day: 'THU', calls: 40, dms: 90 },
    { day: 'FRI', calls: 95, dms: 80 },
  ];

  const totalDMs = entries.reduce((acc, curr) => acc + (curr.dms || 0), 0);
  const totalCalls = entries.reduce((acc, curr) => acc + (curr.calls || 0), 0);
  const totalMeetings = entries.reduce((acc, curr) => acc + (curr.meetings || 0), 0);

  return (
    <div className="space-y-8 pb-10">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-primary">Overview</h2>
          <p className="text-secondary mt-1">Welcome back. Here's your performance summary.</p>
        </div>
        <div className="flex bg-slate-200/50 p-1 rounded-xl">
          <button className="px-4 py-1.5 text-xs font-semibold bg-white text-primary rounded-lg border border-border-subtle shadow-sm">WEEKLY</button>
          <button className="px-4 py-1.5 text-xs font-semibold text-secondary hover:text-primary rounded-lg transition-colors">MONTHLY</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard title="Direct Messages" value={totalDMs} trend="2.4%" isPositive={true} />
        <SummaryCard title="Outbound Calls" value={totalCalls} trend="8.1%" isPositive={true} />
        <SummaryCard title="Meetings Held" value={totalMeetings} trend="12.1%" isPositive={false} />
        <SummaryCard title="Pipeline Value" value="$2.4M" trend="24.5%" isPositive={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-border-subtle rounded-[16px] p-6">
          <h3 className="text-base font-semibold text-primary mb-6">Activity Velocity</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 500, fill: '#9CA3AF' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 500, fill: '#9CA3AF' }}
                />
                <Tooltip 
                  cursor={{ fill: '#F9FAFB' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="calls" fill="#111827" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="dms" fill="#E5E7EB" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-border-subtle rounded-[16px] p-6 flex flex-col">
          <h3 className="text-base font-semibold text-primary mb-6">Execution Force Feed</h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {entries.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No entries recorded yet.</p>
            ) : (
              entries.map((row, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-border-subtle hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-primary">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Data Sync</div>
                      <div className="text-xs text-slate-400">{new Date(row.created_at!).toLocaleDateString()} • {row.meetings} sessions</div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold tabular-nums">
                    CAL: {row.calls}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-auto pt-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-border-subtle flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg border border-border-subtle flex items-center justify-center text-primary shadow-sm">
                <Award size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Efficiency Node</p>
                <p className="text-sm font-semibold">Active Pipeline Deployment</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EntryPage = ({ onSave }: { onSave: (data: FunnelEntry) => Promise<void> }) => {
  const [formData, setFormData] = useState<FunnelEntry>({
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
    await onSave(formData);
    setIsSaving(false);
    setFormData({ dms: 0, calls: 0, appointments: 0, meetings: 0, negotiations: 0, orders: 0 });
  };

  const handleChange = (field: keyof FunnelEntry, value: string) => {
    setFormData(prev => ({ ...prev, [field]: parseInt(value) || 0 }));
  };

  return (
    <div className="space-y-8 pb-10 max-w-5xl mx-auto">
      <header>
        <h2 className="text-3xl font-semibold tracking-tight text-primary">Intelligence Node</h2>
        <p className="text-secondary mt-1">Manual data entry for funnel activity metrics.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 bg-white border border-border-subtle rounded-[16px] p-8">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-base font-semibold text-primary">Funnel Metrics</h3>
            <span className="text-xs font-medium text-slate-400">INPUT SEQUENCE</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            {[
              { label: 'Direct Messages', field: 'dms' },
              { label: 'Phone Calls', field: 'calls' },
              { label: 'Appointments', field: 'appointments' },
              { label: 'Meetings', field: 'meetings' },
            ].map((item) => (
              <div key={item.field} className="group">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 group-focus-within:text-primary">
                  {item.label}
                </label>
                <input 
                  type="number" 
                  value={formData[item.field as keyof FunnelEntry] || ''}
                  onChange={(e) => handleChange(item.field as keyof FunnelEntry, e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-border-subtle rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:bg-white text-sm transition-all"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-4 bg-white border border-border-subtle rounded-[16px] p-8 flex flex-col">
          <h3 className="text-base font-semibold text-primary mb-6">Target Logic</h3>
          <div className="space-y-4 flex-1">
            <div className="p-4 rounded-xl bg-slate-50 border border-border-subtle">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Current Node Quota</p>
              <p className="text-2xl font-bold text-primary tabular-nums">$124,500</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-border-subtle">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Temporal Offset</p>
              <p className="text-2xl font-bold text-primary tabular-nums">07 Days</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-12 bg-white border border-border-subtle rounded-[16px] p-8">
          <h3 className="text-base font-semibold text-primary mb-8">Pipeline Finalization</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 mb-10">
            {[
              { label: 'Negotiations', field: 'negotiations' },
              { label: 'Confirmed Orders', field: 'orders' },
            ].map((item) => (
              <div key={item.field} className="group">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 group-focus-within:text-primary">
                  {item.label}
                </label>
                <input 
                  type="number"
                  value={formData[item.field as keyof FunnelEntry] || ''}
                  onChange={(e) => handleChange(item.field as keyof FunnelEntry, e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-border-subtle rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:bg-white text-sm transition-all"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3">
            <button 
              onClick={() => setFormData({ dms: 0, calls: 0, appointments: 0, meetings: 0, negotiations: 0, orders: 0 })}
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

const SettingsPage = () => (
  <div className="space-y-8 pb-10 max-w-3xl mx-auto">
    <header>
      <h2 className="text-3xl font-semibold tracking-tight text-primary">Configuration</h2>
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
  const [activeTab, setActiveTab] = useState<'entry' | 'stats' | 'settings'>('stats');
  const [entries, setEntries] = useState<FunnelEntry[]>([]);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await fetch('/api/entries');
      const data = await res.json();
      
      if (!res.ok) {
        setDbError(data.message || data.error || 'API connection failure');
        return;
      }
      
      setEntries(data);
      setDbError(null);
    } catch (err: any) {
      console.error('Error fetching entries:', err);
      setDbError('Failed to connect to backend server.');
    }
  };

  const handleSaveEntry = async (formData: FunnelEntry) => {
    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error('Failed to save to database');
      const savedEntry = await res.json();
      setEntries(prev => [savedEntry, ...prev]);
      alert('Data successfully deployed to node.');
    } catch (err) {
      console.error('Error saving entry:', err);
      alert('Sync failure. Verify database configuration.');
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
          <NavItem icon={Wallet} label="Pipeline" />
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
              {activeTab === 'stats' && <StatsPage entries={entries} />}
              {activeTab === 'entry' && <EntryPage onSave={handleSaveEntry} />}
              {activeTab === 'settings' && <SettingsPage />}
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
