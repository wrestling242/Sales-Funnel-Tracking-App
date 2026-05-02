import { useState } from 'react';
import { FunnelEntry, FUNNEL_STAGES } from './ComparisonTable';

interface EntryPageProps {
  onSave: (data: FunnelEntry) => Promise<void>;
}

export const EntryPage = ({ onSave }: EntryPageProps) => {
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
    <div className="space-y-6 md:space-y-8 pb-32 md:pb-10 max-w-5xl mx-auto">
      <header className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-primary">Intelligence Node</h2>
          <p className="text-sm font-medium text-slate-500">Sales Performance Dashboard</p>
          <p className="text-secondary mt-1">Manual data entry for funnel activity metrics.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white border border-border-subtle rounded-[16px] p-6 md:p-8">
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
                  className="w-full h-12 bg-slate-50 border border-border-subtle rounded-xl px-4 focus:outline-none focus:border-primary focus:bg-white text-sm transition-all"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="fixed md:relative bottom-16 md:bottom-auto left-0 w-full md:w-auto bg-white/80 backdrop-blur-md md:bg-white border-t md:border border-border-subtle md:rounded-[16px] p-4 md:p-8 z-40">
          <div className="flex flex-row gap-3 max-w-5xl mx-auto">
            <button 
              onClick={() => setFormData({ period: 'daily', dms: 0, calls: 0, appointments: 0, meetings: 0, negotiations: 0, orders: 0 })}
              className="flex-1 md:flex-none px-6 h-12 rounded-xl border border-border-subtle font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              Flush
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isSaving}
              className="flex-[2] md:flex-none px-10 h-12 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? 'Syncing...' : 'Deploy Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
