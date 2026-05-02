import { Fragment, useState, useMemo } from 'react';
import { cn } from '../lib/utils';

export interface FunnelEntry {
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

export const FUNNEL_STAGES = [
  { name: 'Direct Outreach', key: 'dms' },
  { name: 'Initial Qualification', key: 'calls' },
  { name: 'Appointment Secured', key: 'appointments' },
  { name: 'Solution Presentation', key: 'meetings' },
  { name: 'Value Proposal', key: 'negotiations' },
  { name: 'Contract Closing (KGI)', key: 'orders' },
];

interface ComparisonTableProps {
  title: string;
  entries: FunnelEntry[];
  label: string;
}

export const ComparisonTable = ({ title, entries, label }: ComparisonTableProps) => {
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');

  const displayEntries = useMemo(() => {
    if (viewMode === 'daily') return entries;

    const weeklyMap = new Map<string, any>();
    
    entries.forEach(entry => {
      if (!entry.created_at) return;
      const d = new Date(entry.created_at);
      // Get Monday of the current week
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      monday.setHours(0,0,0,0);
      const weekKey = monday.toISOString();
      
      if (!weeklyMap.has(weekKey)) {
        weeklyMap.set(weekKey, {
          id: weekKey,
          created_at: weekKey,
          period: 'weekly',
          dms: 0,
          calls: 0,
          appointments: 0,
          meetings: 0,
          negotiations: 0,
          orders: 0
        });
      }
      const weeklyData = weeklyMap.get(weekKey);
      weeklyData.dms += Number(entry.dms || 0);
      weeklyData.calls += Number(entry.calls || 0);
      weeklyData.appointments += Number(entry.appointments || 0);
      weeklyData.meetings += Number(entry.meetings || 0);
      weeklyData.negotiations += Number(entry.negotiations || 0);
      weeklyData.orders += Number(entry.orders || 0);
    });
    
    return Array.from(weeklyMap.values()).sort((a, b) => {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, [entries, viewMode]);

  return (
    <div className="bg-white border border-border-subtle rounded-[24px] overflow-hidden shadow-sm">
      <div className="px-8 py-5 bg-slate-50 border-b border-border-subtle flex justify-between items-center">
        <div className="flex items-center gap-6">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{title}</h3>
          
          <div className="flex bg-slate-200/50 p-0.5 rounded-md">
            <button
              onClick={() => setViewMode('daily')}
              className={cn(
                "px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all",
                viewMode === 'daily' ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Daily
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={cn(
                "px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all",
                viewMode === 'weekly' ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Weekly
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-bold text-slate-400">NODE {label}</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-full">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-3 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-r border-border-subtle bg-slate-50/30 w-24">Date</th>
              <th className="px-3 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-r border-border-subtle bg-slate-50/30 w-32">Intel Type</th>
              {FUNNEL_STAGES.map((p, i) => {
                // Shorten names for the header to save space
                const shortName = p.name
                  .replace('Direct Outreach', 'Outreach')
                  .replace('Initial Qualification', 'Qualify')
                  .replace('Appointment Secured', 'Appoint')
                  .replace('Solution Presentation', 'Present')
                  .replace('Value Proposal', 'Proposal')
                  .replace('Contract Closing (KGI)', 'Closing');

                return (
                  <th key={i} className={cn(
                    "px-2 py-5 text-[10px] font-bold text-slate-600 uppercase tracking-wider text-center border-r border-border-subtle last:border-r-0 min-w-[80px]",
                    i === 0 && "bg-slate-50/10"
                  )}>
                    <div className="flex flex-col items-center">
                      <span>{shortName}</span>
                      <span className="text-[8px] text-slate-400 font-medium normal-case tracking-normal mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {p.name.includes('(') ? p.name.split('(')[0] : ''}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {displayEntries.length === 0 ? (
              <tr>
                <td colSpan={FUNNEL_STAGES.length + 2} className="px-8 py-20 text-center text-slate-400 text-sm font-medium italic">
                  No operational data deployed to node.
                </td>
              </tr>
            ) : (
              displayEntries.map((entry, entryIndex) => {
                let dateStr = 'N/A';
                if (entry.created_at) {
                  const d = new Date(entry.created_at);
                  if (viewMode === 'weekly') {
                    dateStr = `Wk ${d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}`;
                  } else {
                    dateStr = d.toLocaleDateString('en-US', { 
                      month: 'numeric', 
                      day: 'numeric'
                    });
                  }
                }

                return (
                  <Fragment key={entry.id || entryIndex}>
                    {/* Frequency Row */}
                    <tr className="group hover:bg-slate-50/30 transition-colors">
                      <td rowSpan={2} className="px-3 py-4 text-[11px] font-bold text-slate-500 border-r border-border-subtle bg-slate-50/20 text-center">
                        {dateStr}
                      </td>
                      <td className="px-3 py-4 text-[11px] font-bold text-primary border-r border-border-subtle bg-slate-50/10">Frequency</td>
                      {FUNNEL_STAGES.map((p, i) => (
                        <td key={i} className="px-2 py-4 text-sm tabular-nums text-center font-bold text-primary border-r border-border-subtle last:border-r-0 bg-white group-hover:bg-transparent">
                          {(entry as any)[p.key]}
                        </td>
                      ))}
                    </tr>
                    {/* Conversion Row */}
                    <tr className="group hover:bg-slate-50/30 transition-colors border-b-2 border-slate-100 last:border-b-0">
                      <td className="px-3 py-4 text-[11px] font-semibold text-secondary border-r border-border-subtle">Yield %</td>
                      {FUNNEL_STAGES.map((p, i) => {
                        const currentVal = (entry as any)[p.key];
                        const prevPhase = FUNNEL_STAGES[i - 1];
                        const prevVal = prevPhase ? (entry as any)[prevPhase.key] : null;
                        const conversion = prevVal !== null && prevVal > 0 
                          ? (currentVal / prevVal) * 100 
                          : 0;
                        
                        return (
                          <td key={i} className="px-2 py-4 text-sm tabular-nums text-center text-slate-500 border-r border-border-subtle last:border-r-0">
                            {prevPhase ? (
                              <div className="flex flex-col items-center gap-0">
                                <span className={cn(
                                  "font-bold",
                                  conversion > 50 ? "text-emerald-500" : conversion > 20 ? "text-primary" : "text-slate-400"
                                )}>
                                  {conversion.toFixed(1)}%
                                </span>
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
