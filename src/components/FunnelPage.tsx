import { ComparisonTable, FunnelEntry } from './ComparisonTable';

interface FunnelPageProps {
  entries: FunnelEntry[];
}

export const FunnelPage = ({ entries }: FunnelPageProps) => {
  const dailyEntries = [...entries]
    .filter(e => e.period === 'daily')
    .sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateA - dateB;
    });

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
