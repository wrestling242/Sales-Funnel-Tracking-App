import { useState, useEffect } from 'react';
import { Database, AlertCircle, Smartphone, Download } from 'lucide-react';
import { FunnelEntry } from './ComparisonTable';

interface SettingsPageProps {
  entries: FunnelEntry[];
}

export const SettingsPage = ({ entries }: SettingsPageProps) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="space-y-8 pb-10 max-w-3xl mx-auto">
      <header>
        <h2 className="text-3xl font-semibold tracking-tight text-primary">Configuration</h2>
        <p className="text-sm font-medium text-slate-500">Sales Performance Dashboard</p>
        <p className="text-secondary mt-1">System parameters and database connectivity profiles.</p>
      </header>

      {/* App & Mobility Section */}
      <div className="bg-white border border-border-subtle rounded-[16px] overflow-hidden">
        <div className="p-6 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Smartphone size={20} className="text-slate-400" />
            <div>
              <p className="font-semibold text-sm">App & Mobility</p>
              <p className="text-xs text-slate-400">PWA installation and mobile optimization.</p>
            </div>
          </div>
          {isInstalled ? (
            <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full border border-emerald-100">
              INSTALLED
            </div>
          ) : (
            <div className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full border border-blue-100">
              PWA READY
            </div>
          )}
        </div>
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Install to Device</p>
              <p className="text-xs text-slate-500">Run as a standalone app for better performance and quick access.</p>
            </div>
            <button
              disabled={!deferredPrompt || isInstalled}
              onClick={handleInstallClick}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={14} />
              {isInstalled ? 'Installed' : 'Install App'}
            </button>
          </div>
          
          <div className="pt-6 border-t border-border-subtle">
            <div className="p-4 bg-slate-50 rounded-xl border border-border-subtle border-dashed flex items-center gap-4">
              <AlertCircle className="text-slate-400" size={20} />
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mobile Tip</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  On iOS, tap the <span className="font-semibold">Share</span> icon and select <span className="font-semibold">"Add to Home Screen"</span> for the best experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Database Section */}
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
};
