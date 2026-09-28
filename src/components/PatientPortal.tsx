import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Bell, 
  FileText, 
  Heart, 
  Pill, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Plus, 
  Send, 
  Check, 
  ChevronRight, 
  Phone, 
  Mail, 
  CalendarPlus, 
  Stethoscope, 
  UserCheck, 
  Sparkles,
  Info
} from 'lucide-react';
import { 
  Appointment, 
  Patient, 
  DoctorAvailability, 
  User, 
  AppointmentReminder 
} from '../types/clinic';
import { maskPhi } from '../utils/crypto';

interface PatientPortalProps {
  currentUser: User;
  patientRecord: Patient;
  appointments: Appointment[];
  doctors: DoctorAvailability[];
  reminders: AppointmentReminder[];
  isPrivacyMasked: boolean;
  onBookAppointment: (appointment: Appointment) => void;
  onUpdateAppointmentStatus: (appointmentId: string, status: any, room?: string) => void;
  onAcknowledgeReminder: (reminderId: string) => void;
  onNavigateToTab: (tab: string) => void;
  onLogAudit: (action: any, reason: string, mrn?: string, patientName?: string) => void;
}

export const PatientPortal: React.FC<PatientPortalProps> = ({
  currentUser,
  patientRecord,
  appointments,
  doctors,
  reminders,
  isPrivacyMasked,
  onBookAppointment,
  onUpdateAppointmentStatus,
  onAcknowledgeReminder,
  onNavigateToTab,
  onLogAudit,
}) => {
  const [activePortalTab, setActivePortalTab] = useState<'appointments' | 'book' | 'records' | 'reminders'>('appointments');
  
  // Notification / Reminder settings state
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [leadTimeHours, setLeadTimeHours] = useState<number>(24);
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  // Booking Wizard Form state
  const [bookDoctorId, setBookDoctorId] = useState(doctors[0]?.doctorId || '');
  const [bookDate, setBookDate] = useState('2026-09-29');
  const [bookTime, setBookTime] = useState('10:00 AM');
  const [bookType, setBookType] = useState<'in-person' | 'telehealth'>('in-person');
  const [bookReason, setBookReason] = useState('');
  const [bookNotes, setBookNotes] = useState('');
  const [bookingSuccessModal, setBookingSuccessModal] = useState<Appointment | null>(null);

  // Refill request state
  const [refillSuccessMsg, setRefillSuccessMsg] = useState<string | null>(null);

  // Filter patient's own appointments
  const myAppointments = appointments.filter(
    (a) => a.patientId === patientRecord.id || a.patientMrn === patientRecord.mrn
  );

  // Patient's own reminders
  const myReminders = reminders.filter(
    (r) => r.patientId === patientRecord.id || r.patientMrn === patientRecord.mrn
  );
  const unreadReminder = myReminders.find((r) => !r.acknowledged);

  const timeSlots = [
    '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', 
    '10:30 AM', '11:00 AM', '11:30 AM', '01:00 PM', 
    '01:30 PM', '02:00 PM', '02:30 PM', '03:30 PM'
  ];

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const doc = doctors.find((d) => d.doctorId === bookDoctorId);
    if (!doc) return;

    const newApt: Appointment = {
      id: `apt_${Date.now()}`,
      patientId: patientRecord.id,
      patientName: `${patientRecord.firstName} ${patientRecord.lastName}`,
      patientMrn: patientRecord.mrn,
      doctorId: doc.doctorId,
      doctorName: doc.doctorName,
      specialty: doc.specialty,
      date: bookDate,
      timeSlot: bookTime,
      type: bookType,
      reason: bookReason || 'Routine clinical consultation & health checkup',
      status: 'scheduled',
      durationMinutes: 30,
      notes: bookNotes,
      room: bookType === 'in-person' ? 'Main Clinic Reception' : 'Virtual WebRTC Suite',
    };

    onBookAppointment(newApt);
    setBookingSuccessModal(newApt);
    setBookReason('');
    setBookNotes('');

    onLogAudit(
      'SCHEDULE_APPT',
      `Patient self-scheduled ${bookType} appointment for ${bookTime} on ${bookDate} with ${doc.doctorName}`,
      patientRecord.mrn,
      `${patientRecord.firstName} ${patientRecord.lastName}`
    );
  };

  const handleDownloadCalendar = (apt: Appointment) => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CareConnect Clinic//Patient Portal//EN',
      'BEGIN:VEVENT',
      `SUMMARY:CareConnect: ${apt.reason} with ${apt.doctorName}`,
      `DESCRIPTION:Clinical appointment with ${apt.doctorName} (${apt.specialty}). Location: ${apt.room || 'Clinic Suite'}. Notes: ${apt.notes || 'None'}`,
      `LOCATION:${apt.type === 'telehealth' ? 'CareConnect Secure Telehealth Room' : 'CareConnect Clinic, Austin, TX'}`,
      `DTSTART:20260928T140000Z`,
      `DTEND:20260928T143000Z`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CareConnect_Appointment_${apt.date}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRequestRefill = (medName: string) => {
    setRefillSuccessMsg(`Refill request for ${medName} submitted directly to Dr. Elena Vance's clinical queue.`);
    setTimeout(() => setRefillSuccessMsg(null), 5000);
    onLogAudit(
      'EDIT_RECORD',
      `Patient requested medication refill: ${medName}`,
      patientRecord.mrn,
      `${patientRecord.firstName} ${patientRecord.lastName}`
    );
  };

  const handleSendTestReminder = () => {
    setReminderToast(`SMS & Email reminder delivered to ${patientRecord.phone} and ${patientRecord.email}: "CareConnect Reminder: You have an upcoming appointment scheduled."`);
    setTimeout(() => setReminderToast(null), 6000);
  };

  const displayName = isPrivacyMasked 
    ? maskPhi(`${patientRecord.firstName} ${patientRecord.lastName}`, 'name')
    : `${patientRecord.firstName} ${patientRecord.lastName}`;

  const displayMrn = isPrivacyMasked 
    ? maskPhi(patientRecord.mrn, 'mrn')
    : patientRecord.mrn;

  return (
    <div className="space-y-6">
      
      {/* Toast Reminder Alert */}
      {reminderToast && (
        <div className="p-3.5 bg-teal-900 text-teal-100 rounded-xl shadow-lg border border-teal-700 flex items-center justify-between text-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-teal-300 shrink-0" />
            <span>{reminderToast}</span>
          </div>
          <button 
            onClick={() => setReminderToast(null)}
            className="text-teal-400 hover:text-white font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Hero Welcome & Patient Identity Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white font-bold flex items-center justify-center font-mono text-xl shadow-sm shrink-0">
              {patientRecord.firstName[0]}{patientRecord.lastName[0]}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Welcome back, {displayName}
                </h1>
                <span className="font-mono text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                  {displayMrn}
                </span>
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  HIPAA Verified Enclave
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 font-mono mt-1.5 flex-wrap">
                <span>DOB: {patientRecord.dob}</span>
                <span>·</span>
                <span>Blood: {patientRecord.bloodType}</span>
                <span>·</span>
                <span>Attending: {patientRecord.assignedDoctorName}</span>
                <span>·</span>
                <span>Phone: {isPrivacyMasked ? '••••••••' : patientRecord.phone}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Button to Book */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActivePortalTab('book')}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
          </div>
        </div>

        {/* Prominent Active Appointment Reminder Banner */}
        {unreadReminder && (
          <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-4 h-4 text-amber-700 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">
                    Appointment Reminder
                  </span>
                  <span className="text-xs font-bold text-slate-900 font-mono">
                    {unreadReminder.appointmentTime} · {unreadReminder.appointmentDate}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 mt-1">
                  {unreadReminder.title}
                </h4>
                <ul className="text-xs text-slate-600 mt-1 space-y-0.5 list-disc list-inside">
                  {unreadReminder.instructions.map((inst, idx) => (
                    <li key={idx}>{inst}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                onClick={() => {
                  onAcknowledgeReminder(unreadReminder.id);
                  setReminderToast('Thank you! Attendance confirmed. Clinic triage staff has been notified.');
                }}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm Attendance</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs for Patient Portal */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
        <button
          onClick={() => setActivePortalTab('appointments')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activePortalTab === 'appointments'
              ? 'border-teal-600 text-teal-800 bg-teal-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>My Appointments ({myAppointments.length})</span>
        </button>

        <button
          onClick={() => setActivePortalTab('book')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activePortalTab === 'book'
              ? 'border-teal-600 text-teal-800 bg-teal-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>

        <button
          onClick={() => setActivePortalTab('records')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activePortalTab === 'records'
              ? 'border-teal-600 text-teal-800 bg-teal-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>My Medical Records (EHR)</span>
        </button>

        <button
          onClick={() => setActivePortalTab('reminders')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activePortalTab === 'reminders'
              ? 'border-teal-600 text-teal-800 bg-teal-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Reminders & Notifications</span>
          {myReminders.filter(r => !r.acknowledged).length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>
      </div>

      {/* SECTION 1: MY APPOINTMENTS */}
      {activePortalTab === 'appointments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Scheduled Clinical Consultations
            </h2>
            <button
              onClick={() => setActivePortalTab('book')}
              className="text-xs text-teal-700 hover:text-teal-800 font-semibold cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Another Visit</span>
            </button>
          </div>

          <div className="space-y-3">
            {myAppointments.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-800">
                  No appointments currently on file.
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Ready to see a doctor? Schedule your in-person or telehealth visit now.
                </p>
                <button
                  onClick={() => setActivePortalTab('book')}
                  className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 transition-colors shadow-sm cursor-pointer"
                >
                  Book Your First Appointment
                </button>
              </div>
            ) : (
              myAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-20 text-center py-2.5 px-1 bg-slate-50 border border-slate-200 rounded-xl shrink-0">
                      <p className="text-xs font-bold font-mono text-slate-900 tabular-nums">
                        {apt.timeSlot}
                      </p>
                      <p className="text-[10px] text-teal-700 font-mono mt-0.5 font-semibold">
                        {apt.date}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900">
                          {apt.doctorName}
                        </span>
                        <span className="text-xs text-slate-500">
                          ({apt.specialty})
                        </span>
                        {apt.type === 'telehealth' ? (
                          <span className="flex items-center gap-1 text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-medium">
                            <Video className="w-3 h-3 text-teal-600" />
                            <span>Telehealth</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-medium">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            <span>{apt.room || 'Clinic Suite'}</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-700 mt-1.5 font-medium">
                        Reason: {apt.reason}
                      </p>

                      {apt.notes && (
                        <p className="text-[11px] text-slate-500 mt-1">
                          Instructions: {apt.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex items-center gap-2 shrink-0 justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded capitalize font-mono ${
                        apt.status === 'in-progress'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : apt.status === 'checked-in'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : apt.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {apt.status.replace('-', ' ')}
                    </span>

                    {/* Add to Calendar (.ics) */}
                    <button
                      onClick={() => handleDownloadCalendar(apt)}
                      title="Add to Google Calendar / Apple Calendar"
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                    >
                      <CalendarPlus className="w-4 h-4 text-slate-500" />
                    </button>

                    {apt.status === 'scheduled' && (
                      <button
                        onClick={() => {
                          onUpdateAppointmentStatus(apt.id, 'checked-in', 'Lobby Zone A');
                          setReminderToast(`You are checked in! Please proceed to the CareConnect reception lobby.`);
                        }}
                        className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Self Check-In
                      </button>
                    )}

                    {apt.type === 'telehealth' && apt.status !== 'completed' && (
                      <button
                        onClick={() => onNavigateToTab('scheduler')}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Room</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: BOOK NEW APPOINTMENT */}
      {activePortalTab === 'book' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs max-w-3xl mx-auto">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              Schedule a Clinical Appointment
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select your consultation type, doctor, date, and preferred time slot. You will receive an instant confirmation and automated SMS/Email reminders.
            </p>
          </div>

          <form onSubmit={handleBookSubmit} className="space-y-5">
            {/* Consultation Mode */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. Select Consultation Mode *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBookType('in-person')}
                  className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                    bookType === 'in-person'
                      ? 'border-teal-500 bg-teal-50/70 text-teal-950 font-semibold shadow-xs'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-teal-600" />
                    <span className="text-xs font-bold">In-Person Clinic Visit</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Austin Main Medical Center · Exam Rooms 1-4
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setBookType('telehealth')}
                  className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                    bookType === 'telehealth'
                      ? 'border-teal-500 bg-teal-50/70 text-teal-950 font-semibold shadow-xs'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-teal-600" />
                    <span className="text-xs font-bold">Encrypted Telehealth</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Secure 256-bit WebRTC Video from your mobile or PC
                  </p>
                </button>
              </div>
            </div>

            {/* Select Doctor */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                2. Choose Attending Physician *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {doctors.map((doc) => {
                  const isSelected = bookDoctorId === doc.doctorId;
                  return (
                    <button
                      key={doc.doctorId}
                      type="button"
                      onClick={() => setBookDoctorId(doc.doctorId)}
                      className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50/50 shadow-xs ring-1 ring-teal-500'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <img
                        src={doc.avatar}
                        alt={doc.doctorName}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {doc.doctorName}
                        </p>
                        <p className="text-[11px] text-teal-700 font-medium truncate">
                          {doc.specialty}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Next Slot: {doc.nextAvailableSlot}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  3. Select Date *
                </label>
                <input
                  type="date"
                  required
                  value={bookDate}
                  onChange={(e) => setBookDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  4. Select Time Slot *
                </label>
                <select
                  value={bookTime}
                  onChange={(e) => setBookTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot} (30 mins)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                5. Reason for Consultation / Symptoms *
              </label>
              <input
                type="text"
                required
                value={bookReason}
                onChange={(e) => setBookReason(e.target.value)}
                placeholder="e.g. 6-Month Blood Pressure follow-up, asthma checkup, prescription renewal"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Additional Notes for Doctor (Optional)
              </label>
              <textarea
                rows={2}
                value={bookNotes}
                onChange={(e) => setBookNotes(e.target.value)}
                placeholder="Any current symptoms, allergies, or questions you would like addressed..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                Automatic 24h & 2h Reminder Activated
              </span>

              <button
                type="submit"
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Confirm & Book Appointment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SECTION 3: MY MEDICAL RECORDS (EHR) */}
      {activePortalTab === 'records' && (
        <div className="space-y-6">
          
          {refillSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{refillSuccessMsg}</span>
            </div>
          )}

          {/* Vitals Summary Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-bold text-slate-900">
                  Latest Recorded Vital Signs
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Last checked: {patientRecord.vitalsHistory[0]?.timestamp || 'N/A'}
              </span>
            </div>

            {patientRecord.vitalsHistory.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[11px] text-slate-500">Blood Pressure</p>
                  <p className="text-lg font-bold font-mono text-slate-900 mt-1">
                    {patientRecord.vitalsHistory[0].bloodPressure}
                  </p>
                  <p className="text-[10px] text-emerald-700 font-medium">Normal / Controlled</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[11px] text-slate-500">Heart Rate</p>
                  <p className="text-lg font-bold font-mono text-slate-900 mt-1">
                    {patientRecord.vitalsHistory[0].heartRate} <span className="text-xs font-normal text-slate-400">bpm</span>
                  </p>
                  <p className="text-[10px] text-emerald-700 font-medium">Regular Sinus</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[11px] text-slate-500">Oxygen (SpO2)</p>
                  <p className="text-lg font-bold font-mono text-slate-900 mt-1">
                    {patientRecord.vitalsHistory[0].spO2}%
                  </p>
                  <p className="text-[10px] text-emerald-700 font-medium">Optimal Saturation</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[11px] text-slate-500">Temperature</p>
                  <p className="text-lg font-bold font-mono text-slate-900 mt-1">
                    {patientRecord.vitalsHistory[0].temperature}°F
                  </p>
                  <p className="text-[10px] text-emerald-700 font-medium">Afebrile</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No vitals on file yet.</p>
            )}
          </div>

          {/* Active Medications & Refills */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Active Prescriptions & Refill Management
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {patientRecord.medications.map((med) => (
                <div
                  key={med.id}
                  className="p-3.5 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{med.name}</span>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {med.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Dosage: {med.dosage} · {med.frequency}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">
                      Prescribed by: {med.prescribedBy} · Started {med.startDate}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRequestRefill(med.name)}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:border-teal-500 text-teal-700 hover:text-teal-800 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                  >
                    Request 90-Day Refill
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Encounter SOAP Notes */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Doctor's Clinical Visit Notes
                </h3>
              </div>
            </div>

            {patientRecord.soapNotes.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No previous encounter notes recorded.</p>
            ) : (
              <div className="space-y-3">
                {patientRecord.soapNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between font-mono pb-2 border-b border-slate-200">
                      <span className="font-bold text-slate-900">
                        Visit Date: {note.date}
                      </span>
                      <span className="text-teal-700 font-medium">
                        {note.doctorName} ({note.doctorRole})
                      </span>
                    </div>

                    <div className="space-y-1.5 text-slate-700">
                      <p><strong className="text-slate-900">Assessment:</strong> {note.assessment}</p>
                      <p><strong className="text-slate-900">Care Plan:</strong> {note.plan}</p>
                    </div>

                    {note.diagnoses && (
                      <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                        <span>Diagnoses:</span>
                        {note.diagnoses.map((d, i) => (
                          <span key={i} className="text-slate-800 font-semibold">{d}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Diagnostic Lab Reports */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Diagnostic Lab & Imaging Reports
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {patientRecord.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 border border-slate-200 rounded-xl flex items-center justify-between hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-teal-600" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{doc.title}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {doc.category} · {doc.date} · {doc.fileSize}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => alert(`Simulated secure preview of: ${doc.title}`)}
                    className="text-xs text-teal-700 hover:text-teal-800 font-medium cursor-pointer"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: APPOINTMENT REMINDERS & NOTIFICATION PREFERENCES */}
      {activePortalTab === 'reminders' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="border-b border-slate-100 pb-4 mb-5">
              <h2 className="text-base font-bold text-slate-900">
                Automated Appointment Reminders & Alerts
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure your reminder delivery preferences. CareConnect automatically dispatches encrypted notices before upcoming visits to prevent missed appointments.
              </p>
            </div>

            {/* Notification Channels Toggle */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-teal-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">SMS Text Message Reminders</p>
                    <p className="text-[11px] text-slate-500">
                      Delivered to {isPrivacyMasked ? '••••••••' : patientRecord.phone}
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={smsEnabled}
                  onChange={(e) => setSmsEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-teal-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Email Calendar & Preparation Notices</p>
                    <p className="text-[11px] text-slate-500">
                      Delivered to {patientRecord.email}
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailEnabled}
                  onChange={(e) => setEmailEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Lead Time Selection */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Reminder Lead Time Window
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setLeadTimeHours(48)}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border text-center cursor-pointer ${
                    leadTimeHours === 48
                      ? 'border-teal-500 bg-teal-50 text-teal-900 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  48 Hours Prior
                </button>
                <button
                  type="button"
                  onClick={() => setLeadTimeHours(24)}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border text-center cursor-pointer ${
                    leadTimeHours === 24
                      ? 'border-teal-500 bg-teal-50 text-teal-900 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  24 Hours Prior (Standard)
                </button>
                <button
                  type="button"
                  onClick={() => setLeadTimeHours(2)}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border text-center cursor-pointer ${
                    leadTimeHours === 2
                      ? 'border-teal-500 bg-teal-50 text-teal-900 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  2 Hours Prior (Urgent)
                </button>
              </div>
            </div>

            {/* Test Simulation Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">
                HIPAA § 164.522 Confidential Communications
              </span>
              <button
                onClick={handleSendTestReminder}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Send Test Reminder Now
              </button>
            </div>
          </div>

          {/* List of Recent Reminder Notices */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Reminder Dispatch Log
            </h3>
            <div className="space-y-2.5">
              {myReminders.map((rem) => (
                <div
                  key={rem.id}
                  className="p-3 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{rem.title}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        For: {rem.appointmentDate} at {rem.appointmentTime} with {rem.doctorName}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                      rem.acknowledged
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {rem.acknowledged ? 'Confirmed by Patient' : 'Awaiting Confirmation'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Booking Success Confirmation Modal */}
      {bookingSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              Appointment Confirmed!
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Your consultation has been securely scheduled and registered with the clinic.
            </p>

            <div className="my-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1.5 font-mono">
              <p><strong className="text-slate-800">Doctor:</strong> {bookingSuccessModal.doctorName}</p>
              <p><strong className="text-slate-800">Specialty:</strong> {bookingSuccessModal.specialty}</p>
              <p><strong className="text-slate-800">Date & Time:</strong> {bookingSuccessModal.date} at {bookingSuccessModal.timeSlot}</p>
              <p><strong className="text-slate-800">Mode:</strong> {bookingSuccessModal.type.toUpperCase()}</p>
              <p><strong className="text-slate-800">Reason:</strong> {bookingSuccessModal.reason}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownloadCalendar(bookingSuccessModal)}
                className="flex-1 py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>Add to Calendar</span>
              </button>
              <button
                onClick={() => {
                  setBookingSuccessModal(null);
                  setActivePortalTab('appointments');
                }}
                className="flex-1 py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                View in Appointments
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
