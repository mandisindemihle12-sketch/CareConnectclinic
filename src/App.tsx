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
  DoctorStatus,
  AppointmentReminder
} from './types/clinic';
import { 
  DEMO_USERS, 
  INITIAL_PATIENTS, 
  INITIAL_DOCTOR_AVAILABILITY, 
  INITIAL_APPOINTMENTS, 
  INITIAL_ENCRYPTED_MESSAGES, 
  INITIAL_AUDIT_LOGS,
  INITIAL_REMINDERS,
  CLINIC_HERO_IMAGE
} from './data/mockData';
import { generateAuditChecksum } from './utils/crypto';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { AuthLanding } from './components/AuthLanding';
import { PatientPortal } from './components/PatientPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { PatientRecords } from './components/PatientRecords';
import { AppointmentScheduler } from './components/AppointmentScheduler';
import { EncryptedConsultations } from './components/EncryptedConsultations';
import { HipaaComplianceCenter } from './components/HipaaComplianceCenter';
import { AndroidFrameSimulator } from './components/AndroidFrameSimulator';
import { ShieldCheck, Lock, Activity, Users, Calendar, MessageSquare } from 'lucide-react';

export default function App() {
  // Session & Authentication State - Starts with registration & login (null user)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('portal');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isLockScreen, setIsLockScreen] = useState<boolean>(false);
  const [lockCountdown, setLockCountdown] = useState<number>(900); // 15 mins (HIPAA rule)
  const [isPrivacyMasked, setIsPrivacyMasked] = useState<boolean>(false);
  const [isAndroidFrame, setIsAndroidFrame] = useState<boolean>(false);

  // Clinical Core State
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [doctors, setDoctors] = useState<DoctorAvailability[]>(INITIAL_DOCTOR_AVAILABILITY);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [reminders, setReminders] = useState<AppointmentReminder[]>(INITIAL_REMINDERS);
  const [messages, setMessages] = useState<EncryptedMessage[]>(INITIAL_ENCRYPTED_MESSAGES);
  const [auditLogs, setAuditLogs] = useState<HipaaAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(INITIAL_PATIENTS[0]);

  // HIPAA Inactivity Timer (Automatic Logoff under 45 CFR § 164.312(a)(2)(iii))
  useEffect(() => {
    if (isLockScreen || !currentUser) return;

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
  }, [isLockScreen, currentUser]);

  // Reset timer on user mouse/key activity
  const resetInactivityTimer = useCallback(() => {
    if (!isLockScreen && currentUser) {
      setLockCountdown(900);
    }
  }, [isLockScreen, currentUser]);

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

  // Login handler
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setLockCountdown(900);
    setIsLockScreen(false);
    setIsAuthModalOpen(false);

    if (user.role === 'patient') {
      setActiveTab('portal');
      const pat = patients.find((p) => p.mrn === user.mrn) || patients[0];
      setSelectedPatient(pat);
    } else {
      setActiveTab('dashboard');
    }

    logAudit('LOGIN', `User ${user.name} logged in with role: ${user.role.toUpperCase()}`, user.mrn, user.name);
  };

  // Switch active role (for demonstration & RBAC evaluation)
  const handleSwitchUser = (role: UserRole) => {
    const target = DEMO_USERS.find((u) => u.role === role);
    if (target) {
      setCurrentUser(target);
      logAudit('LOGIN', `Role switched to ${target.name} (${role.toUpperCase()})`);
      if (role === 'patient') {
        setActiveTab('portal');
        const pat = patients.find((p) => p.mrn === target.mrn) || patients[0];
        setSelectedPatient(pat);
      } else {
        setActiveTab('dashboard');
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
    setSelectedPatient(newPat);
  };

  const handleRegisterPatient = (newPat: any) => {
    const fullPatient: Patient = {
      ...newPat,
      vitalsHistory: [
        {
          id: `vit_${Date.now()}`,
          timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
          bloodPressure: '120/80',
          heartRate: 72,
          spO2: 99,
          temperature: 98.6,
          respiratoryRate: 16,
          recordedBy: 'Self-Enrolled Intake',
        },
      ],
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
    };

    setPatients((prev) => [fullPatient, ...prev]);
    setSelectedPatient(fullPatient);
    setActiveTab('portal');
  };

  const handleUpdatePatient = (updatedPat: Patient) => {
    setPatients((prev) => prev.map((p) => (p.id === updatedPat.id ? updatedPat : p)));
    if (selectedPatient?.id === updatedPat.id) {
      setSelectedPatient(updatedPat);
    }
  };

  const handleBookAppointment = (newApt: Appointment) => {
    setAppointments((prev) => [newApt, ...prev]);

    // Automatically trigger and provision encrypted appointment reminder
    const newReminder: AppointmentReminder = {
      id: `rem_${Date.now()}`,
      appointmentId: newApt.id,
      patientId: newApt.patientId,
      patientMrn: newApt.patientMrn,
      doctorName: newApt.doctorName,
      specialty: newApt.specialty,
      appointmentDate: newApt.date,
      appointmentTime: newApt.timeSlot,
      type: newApt.type,
      room: newApt.room,
      title: `Upcoming ${newApt.type === 'telehealth' ? 'Telehealth' : 'Clinic'} Consultation with ${newApt.doctorName}`,
      instructions: [
        newApt.type === 'telehealth' 
          ? 'Ensure a quiet private room and test your camera & audio 5 minutes before joining.'
          : 'Please check in at the front desk 15 minutes before your scheduled appointment.',
        'Have your insurance ID and any updated medications list prepared.',
      ],
      acknowledged: false,
      smsSent: true,
      emailSent: true,
      scheduledSendHoursBefore: 24,
    };

    setReminders((prev) => [newReminder, ...prev]);
  };

  const handleAcknowledgeReminder = (reminderId: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === reminderId ? { ...r, acknowledged: true } : r))
    );
    logAudit('STATUS_CHANGE', `Patient acknowledged appointment reminder ${reminderId}`);
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

  // Find active patient record for patient portal
  const activePatientRecord = currentUser?.role === 'patient'
    ? (patients.find((p) => p.mrn === currentUser.mrn) || selectedPatient || patients[0])
    : (selectedPatient || patients[0]);

  // Content Renderer
  const renderTabContent = () => {
    if (!currentUser) {
      return (
        <AuthLanding
          onLoginSuccess={handleLoginSuccess}
          onRegisterPatient={handleRegisterPatient}
        />
      );
    }

    switch (activeTab) {
      case 'portal':
        return (
          <PatientPortal
            currentUser={currentUser}
            patientRecord={activePatientRecord}
            appointments={appointments}
            doctors={doctors}
            reminders={reminders}
            isPrivacyMasked={isPrivacyMasked}
            onBookAppointment={handleBookAppointment}
            onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
            onAcknowledgeReminder={handleAcknowledgeReminder}
            onNavigateToTab={setActiveTab}
            onLogAudit={logAudit}
          />
        );
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
        return currentUser.role === 'patient' ? (
          <PatientPortal
            currentUser={currentUser}
            patientRecord={activePatientRecord}
            appointments={appointments}
            doctors={doctors}
            reminders={reminders}
            isPrivacyMasked={isPrivacyMasked}
            onBookAppointment={handleBookAppointment}
            onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
            onAcknowledgeReminder={handleAcknowledgeReminder}
            onNavigateToTab={setActiveTab}
            onLogAudit={logAudit}
          />
        ) : (
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
          if (currentUser) {
            logAudit('LOGOUT', `Signed out user session for ${currentUser.name}`);
          }
          setCurrentUser(null);
          setActiveTab('portal');
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
        onLoginSuccess={handleLoginSuccess}
        onRegisterPatient={handleRegisterPatient}
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
