import { useState, Fragment } from 'react';
import { Edit3 } from 'lucide-react';
import { cn } from '../lib/utils';
import { FunnelEntry, FUNNEL_STAGES } from './ComparisonTable';

export interface FunnelTarget {
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

interface StatsPageProps {
  entries: FunnelEntry[];
  targets: FunnelTarget[];
  onUpdateTarget: (target: FunnelTarget) => Promise<void>;
}

export const StatsPage = ({ entries, targets, onUpdateTarget }: StatsPageProps) => {
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

  const todayEntries = entries.filter(e => e.created_at && new Date(e.created_at).toDateString() === now.toDateString());
  const monthEntries = entries.filter(e => {
    if (!e.created_at) return false;
    const d = new Date(e.created_at);
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
        <td className="px-4 py-4 border-r border-border-subtle">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className={cn("text-xs font-bold", isConversion ? "text-secondary" : "text-primary")}>{title}</span>
              {isEditable && !isEditing && (
                <button 
                  onClick={() => setEditingTarget(targetType === 'monthly' ? monthlyTarget : dailyTarget)}
                  className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-primary transition-colors lg:opacity-0 lg:group-hover:opacity-100"
                >
                  <Edit3 size={16} />
                </button>
              )}
              {isEditing && (
                <button 
                  onClick={handleSaveTarget}
                  className="px-3 py-1.5 rounded-lg bg-primary text-white text-[10px] font-bold hover:bg-slate-800 transition-colors shadow-sm"
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
                className="w-full h-10 bg-white border border-border-subtle rounded-lg px-2 text-center font-bold text-primary focus:outline-none focus:border-primary text-sm shadow-sm"
              />
            );
          } else {
            display = val.toLocaleString(undefined, { maximumFractionDigits: 2 });
          }

          return (
            <td key={i} className="px-2 py-4 text-center border-r border-border-subtle last:border-r-0">
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
    <div className="space-y-6 md:space-y-8 pb-24 md:pb-10">
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
        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left border-collapse min-w-full">
            <thead>
              <tr className="bg-slate-50/50 border-b border-border-subtle">
                <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-r border-border-subtle w-32 md:w-48">Intelligence Layer</th>
                {FUNNEL_STAGES.map((s, i) => {
                  const shortName = s.name
                    .replace('Direct Outreach', 'Outreach')
                    .replace('Initial Qualification', 'Qualify')
                    .replace('Appointment Secured', 'Appoint')
                    .replace('Solution Presentation', 'Present')
                    .replace('Value Proposal', 'Proposal')
                    .replace('Contract Closing (KGI)', 'Closing');
                  return (
                    <th key={i} className="px-2 py-4 text-[10px] font-bold text-slate-600 uppercase tracking-wider text-center border-r border-border-subtle last:border-r-0">
                      {shortName}
                    </th>
                  );
                })}
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
              {[...monthEntries].sort((a, b) => {
                const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                return dateA - dateB;
              }).slice(0, 5).map((entry, idx) => {
                const date = entry.created_at ? new Date(entry.created_at) : new Date();
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
