import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  Smartphone, 
  LogOut, 
  User as UserIcon,
  Activity,
  Calendar,
  Users,
  MessageSquare,
  FileText,
  Stethoscope
} from 'lucide-react';
import { User, UserRole } from '../types/clinic';

interface NavbarProps {
  currentUser: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isPrivacyMasked: boolean;
  setIsPrivacyMasked: (val: boolean) => void;
  isAndroidFrame: boolean;
  setIsAndroidFrame: (val: boolean) => void;
  lockCountdownSeconds: number;
  onManualLock: () => void;
  onOpenAuthModal: () => void;
  onSwitchUser: (role: UserRole) => void;
  onLogout: () => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  isPrivacyMasked,
  setIsPrivacyMasked,
  isAndroidFrame,
  setIsAndroidFrame,
  lockCountdownSeconds,
  onManualLock,
  onOpenAuthModal,
  onSwitchUser,
  onLogout,
  unreadCount = 2,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const navLinks = [
    { id: 'portal', label: currentUser?.role === 'patient' ? 'My Care Portal' : 'Patient View', icon: UserIcon, roles: ['admin', 'doctor', 'nurse', 'patient'] },
    { id: 'dashboard', label: 'Operations & Flow', icon: Activity, roles: ['admin', 'doctor', 'nurse'] },
    { id: 'patients', label: 'EHR Records', icon: Users, roles: ['admin', 'doctor', 'nurse'] },
    { id: 'scheduler', label: 'Clinic Calendar', icon: Calendar, roles: ['admin', 'doctor', 'nurse'] },
    { id: 'consultations', label: 'Encrypted Chat', icon: MessageSquare, roles: ['admin', 'doctor', 'nurse', 'patient'], badge: unreadCount },
    { id: 'hipaa', label: 'HIPAA Vault', icon: ShieldCheck, roles: ['admin', 'doctor', 'nurse'] },
    { id: 'android_code', label: 'Android Java Source', icon: FileText, roles: ['admin', 'doctor', 'nurse', 'patient'] },
  ];

  const visibleLinks = navLinks.filter(
    (link) => !currentUser || link.roles.includes(currentUser.role)
  );

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => setActiveTab(currentUser?.role === 'patient' ? 'portal' : 'dashboard')} 
            className="flex items-center gap-2 group text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
              <span className="font-mono">C</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
              CareConnect
            </span>
          </button>
          <span className="hidden sm:inline-block text-xs text-slate-400 font-mono">
            v2.6·HIPAA
          </span>
        </div>

        {/* Zone 2: Navigation Links (Clean text links with hover underline / active indicator) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {visibleLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors relative cursor-pointer ${
                  isActive
                    ? 'text-teal-700 bg-teal-50/80 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                <span className="whitespace-nowrap">{link.label}</span>
                {link.badge && link.badge > 0 ? (
                  <span className="w-2 h-2 rounded-full bg-teal-500" aria-label="Unread updates" />
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Security & Session Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Privacy Shield PHI Mask toggle */}
          <button
            onClick={() => setIsPrivacyMasked(!isPrivacyMasked)}
            title={isPrivacyMasked ? 'Privacy Shield Active: PHI is masked' : 'Toggle PHI Screen Shield'}
            className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              isPrivacyMasked
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {isPrivacyMasked ? (
              <>
                <EyeOff className="w-4 h-4 text-amber-600" />
                <span className="hidden md:inline text-xs font-medium">Shield ON</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 text-slate-500" />
                <span className="hidden md:inline text-xs font-medium">Shield</span>
              </>
            )}
          </button>

          {/* Android Frame Mode Toggle */}
          <button
            onClick={() => setIsAndroidFrame(!isAndroidFrame)}
            title="Toggle Android Device Preview"
            className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              isAndroidFrame
                ? 'bg-teal-50 border-teal-200 text-teal-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Smartphone className="w-4 h-4 text-teal-600" />
            <span className="hidden md:inline text-xs">Android View</span>
          </button>

          {/* HIPAA Session Countdown & Quick Lock */}
          {currentUser && (
            <button
              onClick={onManualLock}
              title="Click to instantly lock clinical session (HIPAA 45 CFR § 164.312)"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-mono transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span className="tabular-nums">{formatTime(lockCountdownSeconds)}</span>
            </button>
          )}

          {/* User Account / Role Switcher */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
              <div className="relative group">
                <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 bg-slate-100"
                    onError={(e) => {
                      // Fallback avatar container
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="hidden sm:block text-left leading-tight">
                    <p className="text-xs font-semibold text-slate-900 truncate max-w-[120px]">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-teal-600 capitalize font-medium">
                      {currentUser.role}
                    </p>
                  </div>
                </button>

                {/* Dropdown Menu for Quick Role Switch (Demonstration & HIPAA RBAC testing) */}
                <div className="absolute right-0 mt-1 w-56 bg-white border border-slate-200 rounded-lg shadow-lg py-1 hidden group-hover:block hover:block z-50">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-800">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500">{currentUser.title}</p>
                    {currentUser.mrn && (
                      <p className="text-[10px] font-mono text-teal-600 mt-0.5">
                        {isPrivacyMasked ? 'MRN-••••84920' : currentUser.mrn}
                      </p>
                    )}
                  </div>

                  <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Switch Test Role (RBAC)
                  </div>
                  <button
                    onClick={() => onSwitchUser('doctor')}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                      currentUser.role === 'doctor' ? 'text-teal-600 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <span>Dr. Elena Vance (MD)</span>
                    <span className="text-[10px] text-slate-400">Doctor</span>
                  </button>
                  <button
                    onClick={() => onSwitchUser('admin')}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                      currentUser.role === 'admin' ? 'text-teal-600 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <span>Dr. Arthur Sterling</span>
                    <span className="text-[10px] text-slate-400">Admin/HIPAA</span>
                  </button>
                  <button
                    onClick={() => onSwitchUser('nurse')}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                      currentUser.role === 'nurse' ? 'text-teal-600 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <span>Sarah Jenkins (RN)</span>
                    <span className="text-[10px] text-slate-400">Triage</span>
                  </button>
                  <button
                    onClick={() => onSwitchUser('patient')}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                      currentUser.role === 'patient' ? 'text-teal-600 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <span>Maya Lin</span>
                    <span className="text-[10px] text-slate-400">Patient</span>
                  </button>

                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out Session</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuthModal}
                className="px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                <span>Doctor Login</span>
              </button>
              <button
                onClick={onOpenAuthModal}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
              >
                Patient Sign In
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
