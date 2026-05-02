import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { BrainCircuit, AlertTriangle, CheckCircle2, AlertCircle, ArrowRight, Target, TrendingUp, TrendingDown, Lightbulb, Activity } from 'lucide-react';
import { FunnelEntry } from './ComparisonTable';
import { cn } from '../lib/utils';

interface AiSalesAnalystPageProps {
  entries: FunnelEntry[];
}

const FUNNEL_STAGES = [
  { name: 'Direct Outreach', key: 'dms' },
  { name: 'Initial Qualification', key: 'calls' },
  { name: 'Appointment Secured', key: 'appointments' },
  { name: 'Solution Presentation', key: 'meetings' },
  { name: 'Value Proposal', key: 'negotiations' },
  { name: 'Contract Closing (KGI)', key: 'orders' },
];

const TARGET_KGI = 100000;
const AVG_DEAL_VALUE = 2500;

export const AiSalesAnalystPage = ({ entries }: AiSalesAnalystPageProps) => {
  // 1. Compute totals
  const totals = useMemo(() => {
    const sums: Record<string, number> = {
      dms: 0, calls: 0, appointments: 0, meetings: 0, negotiations: 0, orders: 0
    };
    entries.forEach(e => {
      sums.dms += Number(e.dms || 0);
      sums.calls += Number(e.calls || 0);
      sums.appointments += Number(e.appointments || 0);
      sums.meetings += Number(e.meetings || 0);
      sums.negotiations += Number(e.negotiations || 0);
      sums.orders += Number(e.orders || 0);
    });
    
    // Fallback mock data if there are no entries
    if (sums.dms === 0) {
      return { dms: 500, calls: 150, appointments: 80, meetings: 40, negotiations: 11, orders: 3 };
    }
    return sums;
  }, [entries]);

  // 2. Compute funnel stages and metrics
  const stageMetrics = useMemo(() => {
    return FUNNEL_STAGES.map((stage, idx) => {
      const currentCount = totals[stage.key];
      const nextStage = FUNNEL_STAGES[idx + 1];
      const nextCount = nextStage ? totals[nextStage.key] : null;
      
      let conversionRate = 0;
      if (nextCount !== null && currentCount > 0) {
        conversionRate = nextCount / currentCount;
      }
      
      const dropOffRate = nextCount !== null ? 1 - conversionRate : 0;
      
      let status: 'Healthy' | 'Warning' | 'Critical' | 'N/A' = 'N/A';
      if (nextCount !== null) {
        if (conversionRate >= 0.5) status = 'Healthy';
        else if (conversionRate >= 0.3) status = 'Warning';
        else status = 'Critical';
      }

      return {
        ...stage,
        count: currentCount,
        nextStageName: nextStage ? nextStage.name : null,
        conversionRate,
        dropOffRate,
        status
      };
    });
  }, [totals]);

  // 3. Identify Bottleneck
  const transitions = stageMetrics.filter(m => m.nextStageName !== null);
  const bottleneck = transitions.reduce((worst, current) => {
    if (!worst || current.conversionRate < worst.conversionRate) return current;
    return worst;
  }, transitions[0]);

  // 4. KGI Projections
  const currentKGI = totals.orders * AVG_DEAL_VALUE;
  const kgiGap = Math.max(0, TARGET_KGI - currentKGI);
  const kgiGapPercentage = (kgiGap / TARGET_KGI) * 100;
  const kgiStatus = currentKGI >= TARGET_KGI ? 'On Track' : 'Off Track';

  // 5. What-If Control State
  const [improvedConvRate, setImprovedConvRate] = useState<number>(
    bottleneck ? Math.round(bottleneck.conversionRate * 100) + 5 : 0
  );

  const whatIfProjectedKgi = useMemo(() => {
    if (!bottleneck) return currentKGI;
    // Calculate new target based on the improved conversion rate
    // We basically ripple the effect down the funnel.
    const bottleneckIdx = stageMetrics.findIndex(s => s.key === bottleneck.key);
    
    // Copy the counts
    const simCounts = [...stageMetrics.map(s => s.count)];
    
    // Apply new conversion rate for the bottleneck
    simCounts[bottleneckIdx + 1] = Math.round(simCounts[bottleneckIdx] * (improvedConvRate / 100));
    
    // Ripple down the rest of the funnel using original conversion rates
    for (let i = bottleneckIdx + 1; i < stageMetrics.length - 1; i++) {
      const origConvRate = stageMetrics[i].conversionRate;
      simCounts[i + 1] = Math.round(simCounts[i] * origConvRate);
    }
    
    const simOrders = simCounts[simCounts.length - 1];
    return simOrders * AVG_DEAL_VALUE;
  }, [bottleneck, improvedConvRate, stageMetrics, currentKGI]);

  const projectedImpact = whatIfProjectedKgi - currentKGI;

  return (
    <div className="space-y-8 pb-10 pt-4 animate-in fade-in duration-500">
      
      {/* 1. Header */}
      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <BrainCircuit className="text-indigo-600" size={24} />
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-primary">AI Sales Analyst</h2>
        </div>
        <p className="text-secondary mt-1 max-w-2xl">
          Identify funnel bottlenecks, understand your KGI gap, and get recommended actions.
        </p>
      </header>

      {/* 2. Top Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="clean-panel p-5 space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Target size={14} /> KGI Status
          </p>
          <p className={cn(
            "text-2xl font-bold tracking-tight",
            kgiStatus === 'Off Track' ? "text-rose-500" : "text-emerald-500"
          )}>
            {kgiStatus}
          </p>
        </div>
        
        <div className="clean-panel p-5 space-y-2 border-l-4 border-l-indigo-500">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Activity size={14} /> Main Bottleneck
          </p>
          <p className="text-lg font-bold tracking-tight text-primary leading-tight">
            {bottleneck?.name} <ArrowRight className="inline mx-1 text-slate-300" size={16} /> {bottleneck?.nextStageName?.split(' ')[0]}
          </p>
        </div>

        <div className="clean-panel p-5 space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <TrendingDown size={14} /> Biggest Drop-Off
          </p>
          <p className="text-2xl font-bold tracking-tight text-rose-500">
            {bottleneck ? Math.round(bottleneck.dropOffRate * 100) : 0}%
          </p>
        </div>

        <div className="clean-panel p-5 space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Lightbulb size={14} /> Recommended Focus
          </p>
          <p className="text-sm font-bold tracking-tight text-primary">
            Improve {bottleneck?.name?.toLowerCase()} conversion
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Left Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 4. AI Diagnosis Box */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <BrainCircuit size={120} />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2 text-indigo-700 font-bold uppercase tracking-wider text-xs">
                <BrainCircuit size={16} />
                Analyst Insight
              </div>
              <p className="text-slate-700 leading-relaxed text-sm md:text-base max-w-3xl">
                The biggest bottleneck is <strong className="text-indigo-900">{bottleneck?.name} &rarr; {bottleneck?.nextStageName}</strong>. 
                Only <strong className="text-rose-600">{Math.round((bottleneck?.conversionRate || 0) * 100)}%</strong> of opportunities are moving to the next stage, 
                which creates a major gap before the final KGI. This suggests that the value may not be clearly established in this phase, 
                creating friction and causing prospects to drop out before the close.
              </p>
            </div>
          </div>

          {/* 3. Funnel Breakdown */}
          <div className="clean-panel overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-border-subtle">
              <h3 className="font-bold text-sm">Funnel Stage Analysis</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-white border-b border-border-subtle">
                    <th className="px-6 py-3 font-semibold text-slate-500 w-1/3">Stage</th>
                    <th className="px-6 py-3 font-semibold text-slate-500 text-right">Count</th>
                    <th className="px-6 py-3 font-semibold text-slate-500 text-center">Conv. Rate</th>
                    <th className="px-6 py-3 font-semibold text-slate-500 text-center">Drop-Off</th>
                    <th className="px-6 py-3 font-semibold text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {stageMetrics.map((stage, idx) => (
                    <tr key={stage.key} className={cn(
                      "group hover:bg-slate-50/50 transition-colors",
                      stage.key === bottleneck?.key && "bg-rose-50/30"
                    )}>
                      <td className="px-6 py-4 font-medium text-primary">
                        {stage.name}
                        {stage.key === bottleneck?.key && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-rose-100 text-rose-700">
                            Bottleneck
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-right tabular-nums">{stage.count}</td>
                      <td className="px-6 py-4 text-center tabular-nums font-medium text-slate-600">
                        {stage.nextStageName ? `${Math.round(stage.conversionRate * 100)}%` : '—'}
                      </td>
                      <td className="px-6 py-4 text-center tabular-nums font-medium text-slate-500">
                        {stage.nextStageName ? `${Math.round(stage.dropOffRate * 100)}%` : '—'}
                      </td>
                      <td className="px-6 py-4">
                        {stage.status === 'Healthy' && (
                          <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                            <CheckCircle2 size={14} /> Healthy
                          </div>
                        )}
                        {stage.status === 'Warning' && (
                          <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold">
                            <AlertTriangle size={14} /> Warning
                          </div>
                        )}
                        {stage.status === 'Critical' && (
                          <div className="flex items-center gap-1.5 text-rose-500 text-xs font-bold">
                            <AlertCircle size={14} /> Critical
                          </div>
                        )}
                        {stage.status === 'N/A' && (
                          <span className="text-slate-400 text-xs font-medium">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 7. What-If Control */}
          <div className="clean-panel p-6 bg-gradient-to-br from-white to-slate-50">
            <h3 className="font-bold text-sm mb-6 flex items-center gap-2">
              <TrendingUp size={16} className="text-indigo-500" />
              What if we improve the bottleneck conversion rate?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-slate-600">Current Conversion</span>
                    <span className="text-sm font-bold">{Math.round((bottleneck?.conversionRate || 0) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-slate-400 h-2 rounded-full" 
                      style={{ width: `${Math.round((bottleneck?.conversionRate || 0) * 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-indigo-600">Improved Conversion</span>
                    <span className="text-sm font-bold text-indigo-700">{improvedConvRate}%</span>
                  </div>
                  <input 
                    type="range" 
                    min={Math.round((bottleneck?.conversionRate || 0) * 100)} 
                    max="100" 
                    value={improvedConvRate}
                    onChange={(e) => setImprovedConvRate(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1 bg-indigo-500 h-full" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Projected KGI</p>
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-bold tracking-tight">€{whatIfProjectedKgi.toLocaleString()}</span>
                  {projectedImpact > 0 && (
                    <span className="text-sm font-bold text-emerald-500 mb-1 flex items-center">
                      +{Math.round((projectedImpact / currentKGI) * 100)}%
                    </span>
                  )}
                </div>
                {projectedImpact > 0 ? (
                  <p className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg inline-block">
                    Impact: +€{projectedImpact.toLocaleString()}
                  </p>
                ) : (
                  <p className="text-sm font-medium text-slate-400">No change</p>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          
          {/* 5. KGI Gap Summary */}
          <div className="clean-panel p-6 bg-slate-900 text-white">
            <h3 className="font-bold text-sm mb-6 flex items-center gap-2 text-slate-300">
              <Target size={16} /> KGI Gap Summary
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <span className="text-slate-400 text-sm">Target KGI</span>
                <span className="font-bold tabular-nums">€{TARGET_KGI.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <span className="text-slate-400 text-sm">Projected KGI</span>
                <span className="font-bold tabular-nums">€{currentKGI.toLocaleString()}</span>
              </div>
              
              <div className="pt-2">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-rose-400 font-medium">Gap</span>
                  <div className="text-right">
                    <span className="block font-bold text-xl tabular-nums text-rose-400">
                      €{kgiGap.toLocaleString()}
                    </span>
                    <span className="text-xs font-medium text-rose-500/80">
                      {Math.round(kgiGapPercentage)}% deficit
                    </span>
                  </div>
                </div>
                
                <div className="mt-6 p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Main Driver</span>
                  <span className="text-sm text-slate-200 font-medium">
                    {bottleneck?.name} drop-off rate ({Math.round((bottleneck?.dropOffRate || 0) * 100)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Top 3 Recommendations */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm px-1">Recommended Actions</h3>
            
            <div className="clean-panel p-5 space-y-3 relative overflow-hidden border-l-4 border-l-rose-500">
              <div className="flex justify-between items-start">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 uppercase tracking-wider">
                  Priority: High
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Problem:</p>
                <p className="text-sm font-medium">{bottleneck?.name} &rarr; {bottleneck?.nextStageName} conversion is too low.</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Action:</p>
                <p className="text-sm font-bold text-primary">Review the {bottleneck?.name?.toLowerCase()} structure and add a clear next-step CTA before ending each interaction.</p>
              </div>
              <div className="pt-2 border-t border-slate-100 mt-2">
                <p className="text-xs font-semibold text-emerald-600">Expected Impact: High</p>
              </div>
            </div>

            <div className="clean-panel p-5 space-y-3 border-l-4 border-l-amber-500">
              <div className="flex justify-between items-start">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wider">
                  Priority: Medium
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Problem:</p>
                <p className="text-sm font-medium">Pipeline volume at top of funnel.</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Action:</p>
                <p className="text-sm font-bold text-primary">Increase Direct Outreach volume by 15% to offset downstream conversion leaks.</p>
              </div>
              <div className="pt-2 border-t border-slate-100 mt-2">
                <p className="text-xs font-semibold text-emerald-600">Expected Impact: Medium</p>
              </div>
            </div>

            <div className="clean-panel p-5 space-y-3 border-l-4 border-l-emerald-500">
              <div className="flex justify-between items-start">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wider">
                  Priority: Medium
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Problem:</p>
                <p className="text-sm font-medium">Qualification quality may be slipping.</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Action:</p>
                <p className="text-sm font-bold text-primary">Implement a stricter BANT criteria check during Initial Qualification.</p>
              </div>
              <div className="pt-2 border-t border-slate-100 mt-2">
                <p className="text-xs font-semibold text-emerald-600">Expected Impact: Medium</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
