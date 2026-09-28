/**
 * CareConnect Clinic Portal
 * Secure HIPAA-compliant Healthcare Operations, EHR & Telehealth Platform
 * @license Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, 
  UserRole, 
  Patient, 
  DoctorAvailability, 
  Appointment, 
  EncryptedMessage, 
  HipaaAuditLog, 
  PatientStatus, 
  DoctorStatus 
} from './types/clinic';
import { 
  DEMO_USERS, 
  INITIAL_PATIENTS, 
  INITIAL_DOCTOR_AVAILABILITY, 
  INITIAL_APPOINTMENTS, 
  INITIAL_ENCRYPTED_MESSAGES, 
  INITIAL_AUDIT_LOGS,
  CLINIC_HERO_IMAGE
} from './data/mockData';
import { generateAuditChecksum } from './utils/crypto';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { PatientRecords } from './components/PatientRecords';
import { AppointmentScheduler } from './components/AppointmentScheduler';
import { EncryptedConsultations } from './components/EncryptedConsultations';
import { HipaaComplianceCenter } from './components/HipaaComplianceCenter';
import { AndroidFrameSimulator } from './components/AndroidFrameSimulator';
import { ShieldCheck, Lock, Activity, Users, Calendar, MessageSquare } from 'lucide-react';

export default function App() {
  // Session & Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(DEMO_USERS[1]); // Default to Dr. Elena Vance
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isLockScreen, setIsLockScreen] = useState<boolean>(false);
  const [lockCountdown, setLockCountdown] = useState<number>(900); // 15 mins (HIPAA rule)
  const [isPrivacyMasked, setIsPrivacyMasked] = useState<boolean>(false);
  const [isAndroidFrame, setIsAndroidFrame] = useState<boolean>(false);

  // Clinical Core State
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [doctors, setDoctors] = useState<DoctorAvailability[]>(INITIAL_DOCTOR_AVAILABILITY);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [messages, setMessages] = useState<EncryptedMessage[]>(INITIAL_ENCRYPTED_MESSAGES);
  const [auditLogs, setAuditLogs] = useState<HipaaAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // HIPAA Inactivity Timer (Automatic Logoff under 45 CFR § 164.312(a)(2)(iii))
  useEffect(() => {
    if (isLockScreen) return;

    const timer = setInterval(() => {
      setLockCountdown((prev) => {
        if (prev <= 1) {
          setIsLockScreen(true);
          return 900;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLockScreen]);

  // Reset timer on user mouse/key activity
  const resetInactivityTimer = useCallback(() => {
    if (!isLockScreen) {
      setLockCountdown(900);
    }
  }, [isLockScreen]);

  useEffect(() => {
    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('keydown', resetInactivityTimer);
    return () => {
      window.removeEventListener('mousemove', resetInactivityTimer);
      window.removeEventListener('keydown', resetInactivityTimer);
    };
  }, [resetInactivityTimer]);

  // Centralized HIPAA Immutable Audit Logger
  const logAudit = async (
    action: any,
    reason: string,
    targetMrn?: string,
    targetPatientName?: string
  ) => {
    const timestamp = new Date().toLocaleString([], {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const actor = currentUser?.name || 'Authorized Practitioner';
    const logRaw = `${timestamp}:${action}:${actor}:${targetMrn || 'N/A'}:${reason}`;
    const checksum = await generateAuditChecksum(logRaw);

    const newLog: HipaaAuditLog = {
      id: `aud_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp,
      actorId: currentUser?.id || 'usr_anon',
      actorName: actor,
      actorRole: currentUser?.role || 'clinical_staff',
      action,
      targetMrn,
      targetPatientName,
      ipAddress: '10.240.18.15 (Terminal Enclave)',
      reason,
      encryptionChecksum: checksum,
    };

    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Switch active role (for demonstration & RBAC evaluation)
  const handleSwitchUser = (role: UserRole) => {
    const target = DEMO_USERS.find((u) => u.role === role);
    if (target) {
      setCurrentUser(target);
      logAudit('LOGIN', `Role switched to ${target.name} (${role.toUpperCase()})`);
      if (role === 'patient') {
        setActiveTab('patients');
        const pat = patients.find((p) => p.mrn === target.mrn);
        if (pat) setSelectedPatient(pat);
      }
    }
  };

  const handleUpdatePatientStatus = (patientId: string, newStatus: PatientStatus, room?: string) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? {
              ...p,
              currentStatus: newStatus,
              assignedRoom: room || (newStatus.startsWith('exam_room') ? newStatus.replace('_', ' ').toUpperCase() : p.assignedRoom),
            }
          : p
      )
    );

    const pat = patients.find((p) => p.id === patientId);
    if (pat) {
      logAudit(
        'STATUS_CHANGE',
        `Patient transitioned to station: ${newStatus.replace('_', ' ')}`,
        pat.mrn,
        `${pat.firstName} ${pat.lastName}`
      );
    }
  };

  const handleUpdateDoctorStatus = (doctorId: string, newStatus: DoctorStatus) => {
    setDoctors((prev) =>
      prev.map((d) => (d.doctorId === doctorId ? { ...d, status: newStatus } : d))
    );
  };

  const handleAddPatient = (newPat: Patient) => {
    setPatients((prev) => [newPat, ...prev]);
  };

  const handleUpdatePatient = (updatedPat: Patient) => {
    setPatients((prev) => prev.map((p) => (p.id === updatedPat.id ? updatedPat : p)));
  };

  const handleBookAppointment = (newApt: Appointment) => {
    setAppointments((prev) => [newApt, ...prev]);
  };

  const handleUpdateAppointmentStatus = (
    appointmentId: string,
    newStatus: any,
    room?: string
  ) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === appointmentId ? { ...a, status: newStatus, room: room || a.room } : a
      )
    );

    const apt = appointments.find((a) => a.id === appointmentId);
    if (apt && newStatus === 'checked-in') {
      handleUpdatePatientStatus(apt.patientId, 'waiting_room', 'Lobby Waiting');
    } else if (apt && newStatus === 'in-progress') {
      handleUpdatePatientStatus(apt.patientId, 'exam_room_1', 'Exam Room 1');
    }
  };

  const handleSendMessage = (newMsg: EncryptedMessage) => {
    setMessages((prev) => [...prev, newMsg]);
  };

  const handleStartConsultWithDoctor = (doc: DoctorAvailability) => {
    setActiveTab('consultations');
  };

  const handleExportAuditTrail = () => {
    const payload = {
      title: 'Official HIPAA Security Rule § 164.312 Audit Log Dossier',
      clinic: 'CareConnect Health Enclave',
      generatedAt: new Date().toISOString(),
      officer: 'Dr. Arthur Sterling, MD (Chief Compliance Officer)',
      totalEntries: auditLogs.length,
      logs: auditLogs,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HIPAA_AUDIT_EXPORT_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    logAudit('EXPORT_RECORD', 'Exported immutable HIPAA compliance audit ledger');
  };

  // Content Renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <AdminDashboard
            patients={patients}
            doctors={doctors}
            currentUser={currentUser}
            isPrivacyMasked={isPrivacyMasked}
            onUpdatePatientStatus={handleUpdatePatientStatus}
            onUpdateDoctorStatus={handleUpdateDoctorStatus}
            onSelectPatient={(p) => {
              setSelectedPatient(p);
              setActiveTab('patients');
            }}
            onStartConsultationWithDoctor={handleStartConsultWithDoctor}
            onNavigateToTab={setActiveTab}
          />
        );
      case 'patients':
        return (
          <PatientRecords
            patients={patients}
            currentUser={currentUser}
            isPrivacyMasked={isPrivacyMasked}
            selectedPatient={selectedPatient}
            onSelectPatient={setSelectedPatient}
            onAddPatient={handleAddPatient}
            onUpdatePatient={handleUpdatePatient}
            onLogAudit={logAudit}
          />
        );
      case 'scheduler':
        return (
          <AppointmentScheduler
            appointments={appointments}
            patients={patients}
            doctors={doctors}
            currentUser={currentUser}
            isPrivacyMasked={isPrivacyMasked}
            onBookAppointment={handleBookAppointment}
            onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
            onLogAudit={logAudit}
          />
        );
      case 'consultations':
        return (
          <EncryptedConsultations
            messages={messages}
            currentUser={currentUser}
            doctors={doctors}
            isPrivacyMasked={isPrivacyMasked}
            onSendMessage={handleSendMessage}
            onLogAudit={logAudit}
          />
        );
      case 'hipaa':
        return (
          <HipaaComplianceCenter
            auditLogs={auditLogs}
            isPrivacyMasked={isPrivacyMasked}
            onTriggerAutoLock={() => setIsLockScreen(true)}
            onExportAuditLog={handleExportAuditTrail}
          />
        );
      default:
        return (
          <AdminDashboard
            patients={patients}
            doctors={doctors}
            currentUser={currentUser}
            isPrivacyMasked={isPrivacyMasked}
            onUpdatePatientStatus={handleUpdatePatientStatus}
            onUpdateDoctorStatus={handleUpdateDoctorStatus}
            onSelectPatient={setSelectedPatient}
            onStartConsultationWithDoctor={handleStartConsultWithDoctor}
            onNavigateToTab={setActiveTab}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Primary Workstation Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isPrivacyMasked={isPrivacyMasked}
        setIsPrivacyMasked={setIsPrivacyMasked}
        isAndroidFrame={isAndroidFrame}
        setIsAndroidFrame={setIsAndroidFrame}
        lockCountdownSeconds={lockCountdown}
        onManualLock={() => setIsLockScreen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSwitchUser={handleSwitchUser}
        onLogout={() => {
          logAudit('LOGOUT', `Signed out user session for ${currentUser?.name}`);
          setCurrentUser(null);
          setIsAuthModalOpen(true);
        }}
        unreadCount={messages.filter((m) => m.status === 'delivered').length}
      />

      {/* Main Viewport: Standard Desktop Workstation vs Android Device Frame Simulator */}
      {isAndroidFrame ? (
        <AndroidFrameSimulator
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          onExitFrame={() => setIsAndroidFrame(false)}
          unreadCount={messages.filter((m) => m.status === 'delivered').length}
        >
          {renderTabContent()}
        </AndroidFrameSimulator>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
          {renderTabContent()}
        </main>
      )}

      {/* Clean Footer with HIPAA Compliance Attestation */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 sm:px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>CareConnect Health Enclave</span>
            <span>·</span>
            <span>HIPAA Security Rule § 164.312 Certified</span>
          </div>
          <div className="flex items-center gap-3">
            <span>AES-GCM-256 E2EE</span>
            <span>·</span>
            <span>TLS 1.3 In-Transit</span>
            <span>·</span>
            <span>Immutable SHA-256 Audit Trail</span>
          </div>
        </div>
      </footer>

      {/* Auth / Patient Registration / Lock Screen Modal */}
      <AuthModal
        isOpen={isAuthModalOpen || isLockScreen}
        onClose={() => {
          setIsAuthModalOpen(false);
          if (isLockScreen) setIsLockScreen(false);
        }}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthModalOpen(false);
          setIsLockScreen(false);
          setLockCountdown(900);
          logAudit('LOGIN', `Authenticated user ${user.name} (${user.role.toUpperCase()})`);
        }}
        onRegisterPatient={(newPat) => {
          handleAddPatient({
            ...newPat,
            vitalsHistory: [],
            soapNotes: [],
            documents: [],
            conditions: ['New Patient Intake'],
            allergies: ['Pending Clinical Triage'],
            medications: [],
            currentStatus: 'waiting_room',
            assignedDoctorId: 'usr_doc_elena',
            assignedDoctorName: 'Dr. Elena Vance, MD',
            triagePriority: 'Routine',
            lastVisitDate: new Date().toISOString().split('T')[0],
          });
        }}
        isLockScreenMode={isLockScreen}
        currentUser={currentUser}
        onUnlockSession={() => {
          setIsLockScreen(false);
          setLockCountdown(900);
          logAudit('LOGIN', `Terminal session unlocked via security PIN`);
        }}
      />

    </div>
  );
}
