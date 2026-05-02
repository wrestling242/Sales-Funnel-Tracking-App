import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle } from 'lucide-react';
import { Layout } from './components/Layout';
import { StatsPage, FunnelTarget } from './components/StatsPage';
import { EntryPage } from './components/EntryPage';
import { FunnelPage } from './components/FunnelPage';
import { SettingsPage } from './components/SettingsPage';
import { FunnelEntry } from './components/ComparisonTable';
import { AiSalesAnalystPage } from './components/AiSalesAnalystPage';

export default function App() {
  const getTabFromPath = () => {
    const path = window.location.pathname.replace(/^\//, '');
    if (['entry', 'stats', 'funnel', 'ai-analyst', 'settings'].includes(path)) {
      return path as any;
    }
    return 'stats';
  };

  const [activeTab, setActiveTab] = useState<'entry' | 'stats' | 'funnel' | 'ai-analyst' | 'settings'>(getTabFromPath());
  const [entries, setEntries] = useState<FunnelEntry[]>([]);
  const [targets, setTargets] = useState<FunnelTarget[]>([]);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchEntries();
    fetchTargets();

    const handlePopState = () => {
      setActiveTab(getTabFromPath());
    };

    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncOfflineData = async () => {
    const unsynced = localStorage.getItem('unsynced_entries');
    if (!unsynced || isSyncing) return;

    const items: FunnelEntry[] = JSON.parse(unsynced);
    if (items.length === 0) return;

    setIsSyncing(true);
    console.log(`Syncing ${items.length} offline entries...`);

    const remainingItems = [];
    for (const item of items) {
      try {
        const res = await fetch('/api/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
        if (!res.ok) throw new Error('Failed to sync item');
      } catch (err) {
        console.error('Failed to sync item, keeping in queue:', err);
        remainingItems.push(item);
      }
    }

    if (remainingItems.length === 0) {
      localStorage.removeItem('unsynced_entries');
    } else {
      localStorage.setItem('unsynced_entries', JSON.stringify(remainingItems));
    }
    
    setIsSyncing(false);
    fetchEntries(); // Refresh to get the latest IDs from DB
  };

  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    window.history.pushState({}, '', `/${tab === 'stats' ? '' : tab}`);
  };

  const fetchEntries = async () => {
    try {
      const res = await fetch('/api/entries');
      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
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
      console.warn('API error fetching entries, falling back to localStorage:', err);
      const saved = localStorage.getItem('sales_entries');
      const unsynced = localStorage.getItem('unsynced_entries');
      
      let allEntries = saved ? JSON.parse(saved) : [];
      if (unsynced) {
        const unsyncedItems = JSON.parse(unsynced);
        // Avoid duplicates if we can
        allEntries = [...unsyncedItems, ...allEntries.filter((se: any) => !unsyncedItems.find((ue: any) => ue.id === se.id))];
      }
      
      setEntries(allEntries);
      setDbError('Backend not connected. Using local storage.');
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
      } else {
        throw new Error('Failed to fetch targets');
      }
    } catch (err) {
      console.warn('API error fetching targets, falling back to localStorage:', err);
      const saved = localStorage.getItem('sales_targets');
      if (saved) {
        setTargets(JSON.parse(saved));
      } else {
        setTargets([
          { type: 'daily', dms: 50, calls: 20, appointments: 5, meetings: 3, negotiations: 2, orders: 1 },
          { type: 'monthly', dms: 1000, calls: 400, appointments: 100, meetings: 60, negotiations: 40, orders: 20 }
        ]);
      }
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
      } else {
        throw new Error('API update failed');
      }
    } catch (err) {
      console.warn('API error updating target, updating localStorage:', err);
      const updatedTargets = targets.map(t => t.type === target.type ? target : t);
      setTargets(updatedTargets);
      localStorage.setItem('sales_targets', JSON.stringify(updatedTargets));
    }
  };

  const handleSaveEntry = async (formData: FunnelEntry) => {
    // Generate a temporary ID for local tracking
    const newEntry = { ...formData, id: crypto.randomUUID() };
    
    // Always update local state immediately for UX
    setEntries(prev => [newEntry, ...prev]);

    if (!isOnline) {
      console.log('Offline: Queuing entry for sync.');
      const unsynced = JSON.parse(localStorage.getItem('unsynced_entries') || '[]');
      localStorage.setItem('unsynced_entries', JSON.stringify([newEntry, ...unsynced]));
      return;
    }

    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) {
        throw new Error('Failed to save to database');
      }
      
      // Successfully saved, we can replace the local entry with the server one if needed
      // (though they should be mostly identical except for ID)
      const savedEntry = await res.json();
      setEntries(prev => prev.map(e => e.id === newEntry.id ? savedEntry : e));
    } catch (err: any) {
      console.warn('Sync failure, queuing for later:', err);
      const unsynced = JSON.parse(localStorage.getItem('unsynced_entries') || '[]');
      localStorage.setItem('unsynced_entries', JSON.stringify([newEntry, ...unsynced]));
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={handleTabChange} 
      dbError={dbError}
      isOnline={isOnline}
      isSyncing={isSyncing}
    >
      {dbError && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-700">
          <AlertCircle size={20} />
          <div className="text-sm">
            <p className="font-semibold">Local Mode Active</p>
            <p className="opacity-90">{dbError} Connect to Vercel Postgres for permanent sync.</p>
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
          {activeTab === 'ai-analyst' && <AiSalesAnalystPage entries={entries} />}
          {activeTab === 'settings' && <SettingsPage entries={entries} />}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}
