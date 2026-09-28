import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  UserCheck, 
  Calendar, 
  Bell, 
  FileText, 
  Activity, 
  CheckCircle2, 
  Stethoscope, 
  Building, 
  HeartPulse, 
  User as UserIcon,
  ArrowRight,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { User, UserRole } from '../types/clinic';
import { DEMO_USERS, CLINIC_HERO_IMAGE } from '../data/mockData';

interface AuthLandingProps {
  onLoginSuccess: (user: User) => void;
  onRegisterPatient: (patientData: any) => void;
}

export const AuthLanding: React.FC<AuthLandingProps> = ({
  onLoginSuccess,
  onRegisterPatient,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Patient Registration fields
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regDob, setRegDob] = useState('1992-06-14');
  const [regGender, setRegGender] = useState<'Female' | 'Male' | 'Other'>('Female');
  const [regBloodType, setRegBloodType] = useState('O+');
  const [regPhone, setRegPhone] = useState('+1 (555) 014-9923');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regEmergencyName, setRegEmergencyName] = useState('Kenneth Lin');
  const [regEmergencyPhone, setRegEmergencyPhone] = useState('+1 (555) 014-9924');
  const [regHipaaConsent, setRegHipaaConsent] = useState(true);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const matchedUser = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (matchedUser) {
      setSuccessMsg(`Authenticated as ${matchedUser.name}`);
      setTimeout(() => {
        onLoginSuccess(matchedUser);
      }, 400);
    } else if (email.trim().length > 0) {
      const customUser: User = {
        id: `usr_${Date.now()}`,
        name: email.split('@')[0],
        email: email.trim(),
        role: 'patient',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256',
        title: 'Registered Patient',
        phone: '+1 (555) 014-9923',
        mrn: `MRN-${Math.floor(10000 + Math.random() * 90000)}`,
      };
      onLoginSuccess(customUser);
    } else {
      setErrorMsg('Please enter your email or choose a 1-click test account below.');
    }
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    const demo = DEMO_USERS.find((u) => u.role === role);
    if (demo) {
      onLoginSuccess(demo);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFirstName || !regLastName || !regEmail) {
      setErrorMsg('Please complete all required demographic fields.');
      return;
    }
    if (!regHipaaConsent) {
      setErrorMsg('HIPAA Privacy & Data Protection Consent is required.');
      return;
    }

    const assignedMrn = `MRN-${Math.floor(10000 + Math.random() * 90000)}`;
    const newPatient = {
      id: `pat_${Date.now()}`,
      mrn: assignedMrn,
      ssnLast4: Math.floor(1000 + Math.random() * 9000).toString(),
      firstName: regFirstName,
      lastName: regLastName,
      dob: regDob,
      gender: regGender,
      bloodType: regBloodType,
      phone: regPhone,
      email: regEmail,
      emergencyContact: {
        name: regEmergencyName,
        relationship: 'Primary Emergency Contact',
        phone: regEmergencyPhone,
      },
    };

    onRegisterPatient(newPatient);

    const registeredUser: User = {
      id: `usr_${Date.now()}`,
      name: `${regFirstName} ${regLastName}`,
      email: regEmail,
      role: 'patient',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256',
      title: 'Enrolled Patient',
      phone: regPhone,
      mrn: assignedMrn,
    };

    setSuccessMsg(`Registration complete! Your Medical Record Number is ${assignedMrn}`);
    setTimeout(() => {
      onLoginSuccess(registeredUser);
    }, 600);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-6 px-4 sm:px-6 lg:px-8">
      
      {/* Brand Header */}
      <div className="max-w-6xl mx-auto w-full mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 justify-center sm:justify-start">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-mono font-bold text-lg shadow-sm">
            C
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              CareConnect Clinic
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              HIPAA Security Rule § 164.312 Certified Healthcare Portal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-center font-mono text-xs text-slate-500">
          <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            AES-256 Enclave Active
          </span>
          <span className="hidden sm:inline">·</span>
          <span className="text-teal-700 font-medium">24/7 Patient Self-Service</span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Visual Hero, Feature Highlights & Security Trust */}
        <div className="lg:col-span-6 space-y-6">
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md aspect-video sm:aspect-16/10">
            <img
              src={CLINIC_HERO_IMAGE}
              alt="CareConnect Consultation Suite"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent flex flex-col justify-end p-6 text-white">
              <div className="flex items-center gap-1.5 text-teal-400 text-xs font-mono font-semibold uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                Next-Generation Patient Experience
              </div>
              <h2 className="text-xl sm:text-2xl font-bold leading-tight">
                Seamless Patient Care, Secure Booking & Encrypted Health Records
              </h2>
              <p className="text-xs text-slate-300 mt-2 max-w-lg leading-relaxed">
                Connect directly with certified physicians, track appointment schedules with automated reminders, and access your full electronic health history.
              </p>
            </div>
          </div>

          {/* Value Prop Badges */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Direct Scheduling</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Book in-person & telehealth visits instantly</p>
              </div>
            </div>

            <div className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Automated Reminders</p>
                <p className="text-[11px] text-slate-500 mt-0.5">SMS & email preparation alerts before visits</p>
              </div>
            </div>

            <div className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Complete EHR Records</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Review vitals, doctor notes & lab diagnostics</p>
              </div>
            </div>

            <div className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">HIPAA Compliant</p>
                <p className="text-[11px] text-slate-500 mt-0.5">AES-256 at-rest and encrypted chat</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: High-Grade Registration & Login Container */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
          
          {/* Segmented Auth Selector */}
          <div className="flex border-b border-slate-200 bg-slate-100/70 p-1.5">
            <button
              onClick={() => {
                setAuthMode('register');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              New Patient Registration
            </button>
            <button
              onClick={() => {
                setAuthMode('signin');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In (Patient & Staff)
            </button>
          </div>

          <div className="p-6">
            
            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* TAB 1: NEW PATIENT REGISTRATION */}
            {authMode === 'register' ? (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Create Your Patient Health Account
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upon registering, you'll receive your unique Medical Record Number (MRN) and access to appointment scheduling.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={regFirstName}
                      onChange={(e) => setRegFirstName(e.target.value)}
                      placeholder="Maya"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={regLastName}
                      onChange={(e) => setRegLastName(e.target.value)}
                      placeholder="Lin"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      required
                      value={regDob}
                      onChange={(e) => setRegDob(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Gender *
                    </label>
                    <select
                      value={regGender}
                      onChange={(e) => setRegGender(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Blood Type
                    </label>
                    <select
                      value={regBloodType}
                      onChange={(e) => setRegBloodType(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="O+">O+</option>
                      <option value="A+">A+</option>
                      <option value="B+">B+</option>
                      <option value="AB+">AB+</option>
                      <option value="O-">O-</option>
                      <option value="A-">A-</option>
                      <option value="B-">B-</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mobile Phone (for SMS Reminders) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+1 (555) 014-9923"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="maya.lin@email.com"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Create Enclave Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="hipaaAgreement"
                      checked={regHipaaConsent}
                      onChange={(e) => setRegHipaaConsent(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                    />
                    <label htmlFor="hipaaAgreement" className="text-slate-600 text-[11px] leading-relaxed cursor-pointer">
                      I agree to the <strong>HIPAA Notice of Privacy Practices (45 CFR § 164.520)</strong>. All health records, vitals, and consultation messages are encrypted under AES-GCM-256.
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Complete Registration & Open Patient Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              /* TAB 2: SIGN IN */
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Sign In to CareConnect
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Access your appointments, medical records, reminders, and clinical communications.
                  </p>
                </div>

                {/* Instant 1-Click Role Logins */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Instant 1-Click Test Sign-In:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('patient')}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-left transition-all cursor-pointer flex items-center gap-2.5 group"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-teal-700 truncate">
                          Maya Lin
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">Patient Portal</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('doctor')}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-left transition-all cursor-pointer flex items-center gap-2.5 group"
                    >
                      <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                        <Stethoscope className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-teal-700 truncate">
                          Dr. Elena Vance
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">Attending Physician</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('admin')}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-left transition-all cursor-pointer flex items-center gap-2.5 group"
                    >
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <Building className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-teal-700 truncate">
                          Dr. Arthur Sterling
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">Admin & HIPAA Lead</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('nurse')}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-left transition-all cursor-pointer flex items-center gap-2.5 group"
                    >
                      <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
                        <HeartPulse className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-teal-700 truncate">
                          Sarah Jenkins, RN
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">Triage Coordinator</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white text-slate-400">or sign in with credentials</span>
                  </div>
                </div>

                <form onSubmit={handleSignIn} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Account Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="maya.lin@email.com or doctor@careconnect.health"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Account Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Authenticate & Access Health Enclave</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* Bottom Footer Safeguard */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-teal-600" />
                Zero-Knowledge Transport
              </span>
              <span>NIST SP 800-66</span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
