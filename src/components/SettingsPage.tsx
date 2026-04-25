import { Database, AlertCircle } from 'lucide-react';
import { FunnelEntry } from './ComparisonTable';

interface SettingsPageProps {
  entries: FunnelEntry[];
}

export const SettingsPage = ({ entries }: SettingsPageProps) => (
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
