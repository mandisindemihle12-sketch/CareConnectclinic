import React from 'react';
import { 
  Wifi, 
  Battery, 
  Signal, 
  ChevronLeft, 
  Home, 
  Square,
  Activity,
  Users,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { User } from '../types/clinic';

interface AndroidFrameSimulatorProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  onExitFrame: () => void;
  unreadCount?: number;
}

export const AndroidFrameSimulator: React.FC<AndroidFrameSimulatorProps> = ({
  children,
  activeTab,
  setActiveTab,
  currentUser,
  onExitFrame,
  unreadCount = 2,
}) => {
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  const navItems = [
    { id: 'dashboard', label: 'Flow', icon: Activity },
    { id: 'patients', label: 'EHR', icon: Users },
    { id: 'scheduler', label: 'Visits', icon: Calendar },
    { id: 'consultations', label: 'Chat', icon: MessageSquare, badge: unreadCount },
    { id: 'hipaa', label: 'HIPAA', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-slate-900 py-6 px-2 flex flex-col items-center justify-center">
      
      {/* Device Toolbar / Controls */}
      <div className="w-full max-w-sm sm:max-w-md mb-3 flex items-center justify-between text-xs text-slate-300 px-2 font-mono">
        <span className="flex items-center gap-1.5 text-teal-400">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          Android Studio Preview (Pixel 9 Pro · API 35)
        </span>
        <button
          onClick={onExitFrame}
          className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-1 rounded-md transition-colors cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Exit to Workstation</span>
        </button>
      </div>

      {/* Android Device Outer Bezel */}
      <div className="relative w-full max-w-sm sm:max-w-md bg-black rounded-[48px] p-3 shadow-2xl border-4 border-slate-700 flex flex-col overflow-hidden h-[840px]">
        
        {/* Device Camera Punch Hole / Dynamic Island */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
        </div>

        {/* Android Screen Container */}
        <div className="w-full h-full bg-slate-50 rounded-[40px] overflow-hidden flex flex-col relative">
          
          {/* Android Status Bar */}
          <div className="h-9 px-6 bg-white/90 backdrop-blur-xs flex items-center justify-between text-[11px] font-mono font-medium text-slate-800 shrink-0 z-40 border-b border-slate-100">
            <span>{currentTime}</span>
            <div className="flex items-center gap-1.5 text-slate-600">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Android App Main Body */}
          <div className="flex-1 overflow-y-auto p-3">
            {children}
          </div>

          {/* Android Material Bottom Navigation Bar */}
          <div className="h-14 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 flex items-center justify-around shrink-0 z-40">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center justify-center gap-0.5 relative py-1 px-2 rounded-lg transition-colors cursor-pointer ${
                    isActive ? 'text-teal-700' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                    {item.label}
                  </span>
                  {item.badge && item.badge > 0 ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 absolute top-1 right-2" />
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Android Bottom Home Gesture Pill Bar */}
          <div className="h-4 bg-white flex items-center justify-center shrink-0">
            <div className="w-28 h-1 bg-slate-300 rounded-full" />
          </div>

        </div>

      </div>

    </div>
  );
};
