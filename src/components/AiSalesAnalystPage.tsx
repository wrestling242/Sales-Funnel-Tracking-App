import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { BrainCircuit, AlertTriangle, CheckCircle2, AlertCircle, ArrowRight, Target, TrendingUp, TrendingDown, Lightbulb, Activity, Info, BarChart3 } from 'lucide-react';
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
  const [isUsingMockData, setIsUsingMockData] = useState(false);

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
      setIsUsingMockData(true);
      return { dms: 500, calls: 150, appointments: 80, meetings: 40, negotiations: 11, orders: 3 };
    }
    setIsUsingMockData(false);
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
  const kgiStatus = currentKGI >= (TARGET_KGI * 0.8) ? (currentKGI >= TARGET_KGI ? 'On Track' : 'At Risk') : 'Critical Deficit';

  // 5. What-If Control State
  const [improvedConvRate, setImprovedConvRate] = useState<number>(
    bottleneck ? Math.round(bottleneck.conversionRate * 100) + 10 : 0
  );

  const whatIfProjectedKgi = useMemo(() => {
    if (!bottleneck) return currentKGI;
    const bottleneckIdx = stageMetrics.findIndex(s => s.key === bottleneck.key);
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
      
      {/* 1. Executive Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <BrainCircuit className="text-white" size={24} />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-primary">AI Sales Analyst</h2>
          </div>
          <p className="text-secondary mt-1 max-w-2xl font-medium">
            Executive-level intelligence identifying structural funnel optimizations.
          </p>
        </div>
        
        {isUsingMockData && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-wider">
            <Info size={14} /> Mock Data Active
          </div>
        )}
      </header>

      {/* 2. Intelligence Summary Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="clean-panel p-5 space-y-2 border-t-4 border-t-indigo-500 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
            <Activity size={14} className="text-indigo-500" /> Operational Health
          </p>
          <div className="flex items-baseline gap-2">
            <p className={cn(
              "text-2xl font-bold tracking-tight",
              kgiStatus === 'Critical Deficit' ? "text-rose-600" : kgiStatus === 'At Risk' ? "text-amber-500" : "text-emerald-500"
            )}>
              {kgiStatus}
            </p>
          </div>
        </div>
        
        <div className="clean-panel p-5 space-y-2 border-t-4 border-t-rose-500 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
            <AlertTriangle size={14} className="text-rose-500" /> Primary Bottleneck
          </p>
          <p className="text-lg font-bold tracking-tight text-primary leading-tight">
            {bottleneck?.name}
          </p>
          <p className="text-xs font-medium text-secondary">
            Drops by {Math.round(bottleneck?.dropOffRate * 100)}%
          </p>
        </div>

        <div className="clean-panel p-5 space-y-2 border-t-4 border-t-slate-800 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
            <Target size={14} className="text-slate-800" /> KGI Achievement
          </p>
          <p className="text-2xl font-bold tracking-tight text-primary">
            {Math.round((currentKGI / TARGET_KGI) * 100)}%
          </p>
          <p className="text-xs font-medium text-rose-500">
            Deficit: €{kgiGap.toLocaleString()}
          </p>
        </div>

        <div className="clean-panel p-5 space-y-2 border-t-4 border-t-emerald-500 shadow-sm bg-emerald-50/10">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
            <TrendingUp size={14} className="text-emerald-500" /> Optimization Lift
          </p>
          <p className="text-2xl font-bold tracking-tight text-emerald-600">
            +€{projectedImpact.toLocaleString()}
          </p>
          <p className="text-xs font-medium text-emerald-700">
            Potential growth identified
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Left Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Executive Summary Insight */}
          <div className="bg-slate-900 text-white rounded-[24px] p-6 md:p-8 relative overflow-hidden shadow-xl shadow-slate-200">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <BrainCircuit size={160} />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold uppercase tracking-widest text-[10px]">
                <Activity size={12} /> Intelligence Briefing
              </div>
              <h3 className="text-2xl font-bold">Executive Summary</h3>
              <p className="text-slate-300 leading-relaxed text-lg max-w-2xl font-medium">
                The analysis indicates a structural conversion failure at the <span className="text-white font-bold underline decoration-rose-500 decoration-2 underline-offset-4">{bottleneck?.name}</span> stage. 
                With a <span className="text-rose-400 font-bold">{Math.round((bottleneck?.dropOffRate || 0) * 100)}% leakage rate</span>, the funnel is failing to capitalize on upstream outreach volume. 
                Stabilizing this stage is the highest-leverage path to closing the €{kgiGap.toLocaleString()} KGI gap.
              </p>
            </div>
          </div>

          {/* Funnel Breakdown Table */}
          <div className="clean-panel overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-slate-50/50 border-b border-border-subtle flex justify-between items-center">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <BarChart3 size={14} /> Full Funnel Attribution Analysis
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-white border-b border-border-subtle">
                    <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest text-[10px] w-[30%]">Conversion Node</th>
                    <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest text-[10px] text-right">Volume</th>
                    <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest text-[10px] text-center">Conversion</th>
                    <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest text-[10px] text-center">Leakage</th>
                    <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {stageMetrics.map((stage, idx) => (
                    <tr key={stage.key} className={cn(
                      "group hover:bg-slate-50/50 transition-colors",
                      stage.key === bottleneck?.key && "bg-rose-50/40"
                    )}>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-primary">{stage.name}</span>
                          {stage.key === bottleneck?.key && (
                            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-tighter mt-1">
                              Primary Efficiency Leak
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 font-bold text-right tabular-nums text-slate-700">{stage.count.toLocaleString()}</td>
                      <td className="px-6 py-5 text-center tabular-nums font-bold">
                        {stage.nextStageName ? (
                          <span className={cn(
                            stage.status === 'Healthy' ? "text-emerald-500" : stage.status === 'Warning' ? "text-amber-500" : "text-rose-500"
                          )}>
                            {Math.round(stage.conversionRate * 100)}%
                          </span>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-6 py-5 text-center tabular-nums font-medium text-slate-400">
                        {stage.nextStageName ? `${Math.round(stage.dropOffRate * 100)}%` : '—'}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            stage.status === 'Healthy' ? "bg-emerald-500" : stage.status === 'Warning' ? "bg-amber-400" : stage.status === 'Critical' ? "bg-rose-500" : "bg-slate-200"
                          )} />
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider",
                            stage.status === 'Healthy' ? "text-emerald-700" : stage.status === 'Warning' ? "text-amber-600" : stage.status === 'Critical' ? "text-rose-700" : "text-slate-400"
                          )}>
                            {stage.status === 'N/A' ? 'Terminal' : stage.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Strategic Simulation (What-if) */}
          <div className="clean-panel p-8 bg-gradient-to-br from-indigo-50 to-white border-indigo-100 shadow-md">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div>
                <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                  Strategic Sensitivity Analysis
                </h3>
                <p className="text-sm font-medium text-indigo-600/80 mt-1">Simulate the revenue impact of structural optimizations.</p>
              </div>
              <div className="bg-white px-4 py-2 rounded-xl border border-indigo-100 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase block leading-none mb-1">Impact Node</span>
                <span className="text-sm font-bold text-indigo-700">{bottleneck?.name}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between mb-4">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Optimization Level</span>
                    <span className="text-2xl font-black text-indigo-600">{improvedConvRate}% <span className="text-xs font-medium text-slate-400">Target</span></span>
                  </div>
                  <input 
                    type="range" 
                    min={Math.round((bottleneck?.conversionRate || 0) * 100)} 
                    max="100" 
                    value={improvedConvRate}
                    onChange={(e) => setImprovedConvRate(Number(e.target.value))}
                    className="w-full h-6 md:h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 my-2"
                  />
                  <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Current ({Math.round((bottleneck?.conversionRate || 0) * 100)}%)</span>
                    <span>Optimized (100%)</span>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-white/60 rounded-2xl border border-white/80">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Projected Revenue Growth</p>
                    <p className="text-lg font-bold text-primary">+€{projectedImpact.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                <div className="relative z-10 space-y-4">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">New Projected KGI</p>
                  <div className="flex flex-col">
                    <span className="text-5xl font-black text-white tracking-tighter">€{whatIfProjectedKgi.toLocaleString()}</span>
                    <div className="flex items-center gap-2 mt-4">
                      <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1.5 border border-emerald-500/20">
                        <TrendingUp size={14} /> +{Math.round((projectedImpact / (currentKGI || 1)) * 100)}% Lift
                      </div>
                      <div className="px-3 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-bold border border-white/5">
                        vs Current
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column - KGI Gap & Recommendations */}
        <div className="space-y-8">
          
          {/* KGI Gap Detailed Analysis */}
          <div className="clean-panel p-5 md:p-6 bg-white shadow-sm border-l-8 border-l-slate-900">
            <h3 className="font-bold text-xs uppercase tracking-widest mb-6 flex items-center gap-2 text-slate-500">
              <Target size={16} className="text-slate-900" /> KGI Gap Summary
            </h3>
            
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Gap to Target</span>
                  <p className="text-3xl font-black text-rose-600 tracking-tighter">€{kgiGap.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className="block text-rose-500 font-bold text-sm">-{Math.round(kgiGapPercentage)}%</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deficit</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-slate-900 h-full rounded-full" 
                    style={{ width: `${Math.min(100, (currentKGI / TARGET_KGI) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                  <span>Current: €{currentKGI.toLocaleString()}</span>
                  <span>Target: €{TARGET_KGI.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Diagnostic Result</span>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  Revenue is currently capped by <span className="text-primary font-bold">{bottleneck?.name}</span> inefficiencies. outreach volume is sufficient, but conversion velocity is too low to meet quarterly targets.
                </p>
              </div>
            </div>
          </div>

          {/* Strategic Recommendations - EXACTLY 3 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-bold text-xs uppercase tracking-widest text-slate-500">Strategic Recommendations</h3>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Priority Sorted</span>
            </div>
            
            {/* Recommendation 1 */}
            <div className="clean-panel p-5 md:p-6 space-y-4 relative overflow-hidden border-l-4 border-l-rose-500 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center">
                <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                  <Lightbulb size={18} />
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 uppercase tracking-wider">
                  Critical
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Problem Node</p>
                  <p className="text-sm font-bold text-primary">{bottleneck?.name} Conversion</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Strategic Action</p>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">Implement a standardized <span className="text-primary font-bold">"Value Lock"</span> protocol to ensure next-stage commitments are secured before conclusion.</p>
                </div>
                <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Impact: High</span>
                  <TrendingUp size={14} className="text-emerald-500" />
                </div>
              </div>
            </div>

            {/* Recommendation 2 */}
            <div className="clean-panel p-5 md:p-6 space-y-4 border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                  <Activity size={18} />
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wider">
                  Operational
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Efficiency Gap</p>
                  <p className="text-sm font-bold text-primary">Qualification Quality</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Strategic Action</p>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">Deploy stricter BANT qualification scoring to reduce downstream drop-off and focus resources on high-intent prospects.</p>
                </div>
                <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-600 uppercase">Impact: Medium</span>
                  <TrendingDown size={14} className="text-amber-500" />
                </div>
              </div>
            </div>

            {/* Recommendation 3 */}
            <div className="clean-panel p-5 md:p-6 space-y-4 border-l-4 border-l-indigo-500 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <TrendingUp size={18} />
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 uppercase tracking-wider">
                  Expansion
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Volume Constraint</p>
                  <p className="text-sm font-bold text-primary">Outreach Scaling</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Strategic Action</p>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">Increase top-of-funnel Outreach volume by 15% using automated sequencing to buffer against conversion variance.</p>
                </div>
                <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase">Impact: Medium</span>
                  <BarChart3 size={14} className="text-indigo-500" />
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
