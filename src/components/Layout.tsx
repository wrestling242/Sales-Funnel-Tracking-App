import { LayoutDashboard, Edit3, TrendingUp, Settings, BrainCircuit, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavItemProps {
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavItem = ({ icon: Icon, label, active, onClick }: NavItemProps) => (
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

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  dbError?: string | null;
  isOnline?: boolean;
  isSyncing?: boolean;
}

export const Layout = ({ children, activeTab, setActiveTab, dbError, isOnline = true, isSyncing = false }: LayoutProps) => {
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
          <NavItem 
            icon={TrendingUp} 
            label="Funnel" 
            active={activeTab === 'funnel'}
            onClick={() => setActiveTab('funnel')}
          />
          <NavItem 
            icon={BrainCircuit} 
            label="AI Analyst" 
            active={activeTab === 'ai-analyst'}
            onClick={() => setActiveTab('ai-analyst')}
          />
          <NavItem 
            icon={Settings} 
            label="Settings" 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')}
          />
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-border-subtle h-16 lg:h-20 sticky top-0 z-40 px-4 lg:px-10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="lg:hidden w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <LayoutDashboard size={18} className="text-white" />
            </div>
            <h1 className="text-lg font-bold lg:hidden">Intelligence</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
              isSyncing ? "bg-blue-50 text-blue-600 animate-pulse" :
              !isOnline ? "bg-amber-50 text-amber-600" : 
              "bg-emerald-50 text-emerald-600"
            )}>
              {isSyncing ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span className="hidden sm:inline">Syncing...</span>
                </>
              ) : !isOnline ? (
                <>
                  <WifiOff size={14} />
                  <span className="hidden sm:inline">Offline Mode</span>
                </>
              ) : (
                <>
                  <Wifi size={14} />
                  <span className="hidden sm:inline">Online</span>
                </>
              )}
            </div>

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
        <main className="px-4 py-6 lg:p-10 max-w-7xl mx-auto w-full">
          {children}
        </main>

        {/* Bottom Nav - Mobile Only */}
        <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-border-subtle h-16 flex justify-around items-stretch px-2 z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <button 
            onClick={() => setActiveTab('stats')}
            className={cn("flex-1 flex items-center justify-center transition-all", activeTab === 'stats' ? "text-primary" : "text-slate-400")}
            aria-label="Dashboard"
          >
            <div className={cn("p-2.5 rounded-xl", activeTab === 'stats' && "bg-slate-100")}>
              <LayoutDashboard size={24} />
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('entry')}
            className={cn("flex-1 flex items-center justify-center transition-all", activeTab === 'entry' ? "text-primary" : "text-slate-400")}
            aria-label="Daily Entry"
          >
            <div className={cn("p-2.5 rounded-xl", activeTab === 'entry' && "bg-slate-100")}>
              <Edit3 size={24} />
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('funnel')}
            className={cn("flex-1 flex items-center justify-center transition-all", activeTab === 'funnel' ? "text-primary" : "text-slate-400")}
            aria-label="Funnel"
          >
            <div className={cn("p-2.5 rounded-xl", activeTab === 'funnel' && "bg-slate-100")}>
              <TrendingUp size={24} />
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('ai-analyst')}
            className={cn("flex-1 flex items-center justify-center transition-all", activeTab === 'ai-analyst' ? "text-primary" : "text-slate-400")}
            aria-label="AI Analyst"
          >
            <div className={cn("p-2.5 rounded-xl", activeTab === 'ai-analyst' && "bg-slate-100")}>
              <BrainCircuit size={24} />
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={cn("flex-1 flex items-center justify-center transition-all", activeTab === 'settings' ? "text-primary" : "text-slate-400")}
            aria-label="Settings"
          >
            <div className={cn("p-2.5 rounded-xl", activeTab === 'settings' && "bg-slate-100")}>
              <Settings size={24} />
            </div>
          </button>
        </nav>
      </div>
    </div>
  );
};
