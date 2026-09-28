import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User as UserIcon, 
  Video, 
  MapPin, 
  Plus, 
  Check, 
  X, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  Stethoscope,
  Building,
  ShieldCheck
} from 'lucide-react';
import { 
  Appointment, 
  Patient, 
  DoctorAvailability, 
  User 
} from '../types/clinic';
import { maskPhi } from '../utils/crypto';

interface AppointmentSchedulerProps {
  appointments: Appointment[];
  patients: Patient[];
  doctors: DoctorAvailability[];
  currentUser: User | null;
  isPrivacyMasked: boolean;
  onBookAppointment: (appointment: Appointment) => void;
  onUpdateAppointmentStatus: (appointmentId: string, newStatus: any, room?: string) => void;
  onLogAudit: (action: any, reason: string, mrn?: string, patientName?: string) => void;
}

export const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({
  appointments,
  patients,
  doctors,
  currentUser,
  isPrivacyMasked,
  onBookAppointment,
  onUpdateAppointmentStatus,
  onLogAudit,
}) => {
  const [selectedDate, setSelectedDate] = useState('2026-09-28');
  const [filterType, setFilterType] = useState<'all' | 'in-person' | 'telehealth'>('all');
  const [filterDoctor, setFilterDoctor] = useState<string>('all');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [telehealthActiveModal, setTelehealthActiveModal] = useState<Appointment | null>(null);

  // New Booking Form State
  const [selectedPatientId, setSelectedPatientId] = useState(
    currentUser?.role === 'patient' && currentUser.mrn 
      ? patients.find(p => p.mrn === currentUser.mrn)?.id || patients[0]?.id
      : patients[0]?.id || ''
  );
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?.doctorId || '');
  const [bookingDate, setBookingDate] = useState('2026-09-29');
  const [bookingTime, setBookingTime] = useState('10:00 AM');
  const [bookingType, setBookingType] = useState<'in-person' | 'telehealth'>('in-person');
  const [bookingReason, setBookingReason] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');

  const timeSlots = [
    '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', 
    '10:30 AM', '11:00 AM', '11:30 AM', '01:00 PM', 
    '01:30 PM', '02:00 PM', '02:30 PM', '03:30 PM'
  ];

  const filteredAppointments = appointments.filter((apt) => {
    const matchesDate = apt.date === selectedDate;
    const matchesType = filterType === 'all' || apt.type === filterType;
    const matchesDoc = filterDoctor === 'all' || apt.doctorId === filterDoctor;
    return matchesDate && matchesType && matchesDoc;
  });

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === selectedPatientId);
    const doc = doctors.find((d) => d.doctorId === selectedDoctorId);

    if (!pat || !doc) return;

    const newApt: Appointment = {
      id: `apt_${Date.now()}`,
      patientId: pat.id,
      patientName: `${pat.firstName} ${pat.lastName}`,
      patientMrn: pat.mrn,
      doctorId: doc.doctorId,
      doctorName: doc.doctorName,
      specialty: doc.specialty,
      date: bookingDate,
      timeSlot: bookingTime,
      type: bookingType,
      reason: bookingReason || 'General clinical consultation',
      status: 'scheduled',
      durationMinutes: 30,
      notes: bookingNotes,
      room: bookingType === 'in-person' ? 'Pending check-in' : 'Virtual Suite',
    };

    onBookAppointment(newApt);
    setIsBookModalOpen(false);
    setSelectedDate(bookingDate);

    onLogAudit(
      'SCHEDULE_APPT',
      `Scheduled ${bookingType} appointment for ${bookingTime} on ${bookingDate}`,
      pat.mrn,
      `${pat.firstName} ${pat.lastName}`
    );
  };

  const handleCheckIn = (apt: Appointment) => {
    onUpdateAppointmentStatus(apt.id, 'checked-in', 'Lobby Waiting Zone A');
    onLogAudit(
      'STATUS_CHANGE',
      `Patient checked in for appointment ${apt.timeSlot}`,
      apt.patientMrn,
      apt.patientName
    );
  };

  const handleStartConsult = (apt: Appointment) => {
    if (apt.type === 'telehealth') {
      setTelehealthActiveModal(apt);
    } else {
      onUpdateAppointmentStatus(apt.id, 'in-progress', 'Exam Room 1');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Clinical Care</span>
            <span aria-hidden="true">·</span>
            <span>Secure Appointment Scheduling</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-teal-600">Telehealth & In-Person</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Clinical Calendar & Appointments
          </h1>
        </div>

        <button
          onClick={() => setIsBookModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Appointment</span>
        </button>
      </div>

      {/* Date Navigation & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-xl">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setSelectedDate('2026-09-28')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                selectedDate === '2026-09-28'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Today (Sep 28)
            </button>
            <button
              onClick={() => setSelectedDate('2026-09-29')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                selectedDate === '2026-09-29'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tomorrow (Sep 29)
            </button>
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg text-slate-700 font-mono"
          />
        </div>

        {/* Doctor and Type Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterDoctor}
            onChange={(e) => setFilterDoctor(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 cursor-pointer"
          >
            <option value="all">All Attending Doctors</option>
            {doctors.map((d) => (
              <option key={d.doctorId} value={d.doctorId}>
                {d.doctorName}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                filterType === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setFilterType('in-person')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                filterType === 'in-person'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              In-Person
            </button>
            <button
              onClick={() => setFilterType('telehealth')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                filterType === 'telehealth'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Telehealth
            </button>
          </div>
        </div>
      </div>

      {/* Appointments List View */}
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">
              No appointments scheduled for {selectedDate}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Select a different date or schedule a new consultation.
            </p>
            <button
              onClick={() => setIsBookModalOpen(true)}
              className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition-colors shadow-sm cursor-pointer"
            >
              + Schedule Slot
            </button>
          </div>
        ) : (
          filteredAppointments.map((apt) => {
            const displayPatName = isPrivacyMasked 
              ? maskPhi(apt.patientName, 'name')
              : apt.patientName;
            const displayMrn = isPrivacyMasked 
              ? maskPhi(apt.patientMrn, 'mrn')
              : apt.patientMrn;

            return (
              <div
                key={apt.id}
                className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Time & Type Block */}
                <div className="flex items-center gap-4">
                  <div className="w-20 text-center py-2 px-1 bg-slate-50 border border-slate-200 rounded-lg shrink-0">
                    <p className="text-xs font-bold font-mono text-slate-900 tabular-nums">
                      {apt.timeSlot}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {apt.durationMinutes} mins
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {displayPatName}
                      </span>
                      <span className="font-mono text-xs text-slate-500">
                        {displayMrn}
                      </span>
                      {apt.type === 'telehealth' ? (
                        <span className="flex items-center gap-1 text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-medium">
                          <Video className="w-3 h-3 text-teal-600" />
                          <span>Telehealth</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-medium">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>In-Person ({apt.room || 'Clinic'})</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-700 mt-1 font-medium">
                      {apt.reason}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-1">
                      <span>Attending: {apt.doctorName}</span>
                      <span>·</span>
                      <span>{apt.specialty}</span>
                      {apt.notes && (
                        <>
                          <span>·</span>
                          <span className="text-slate-400 truncate max-w-[200px]">
                            Note: {apt.notes}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
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

                  {apt.status === 'scheduled' && (
                    <button
                      onClick={() => handleCheckIn(apt)}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Check In Patient
                    </button>
                  )}

                  {apt.status === 'checked-in' && (
                    <button
                      onClick={() => handleStartConsult(apt)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      {apt.type === 'telehealth' ? 'Join Video Call' : 'Begin Exam'}
                    </button>
                  )}

                  {apt.status === 'in-progress' && (
                    <button
                      onClick={() => onUpdateAppointmentStatus(apt.id, 'completed', 'Discharge Complete')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Complete Visit
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Book Appointment Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-lg w-full p-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Schedule Clinical Appointment
              </h3>
              <button
                onClick={() => setIsBookModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-4">
              {/* Select Patient */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Select Patient Record *
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-teal-500"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} ({p.mrn}) · DOB: {p.dob}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Doctor */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Select Attending Physician *
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-teal-500"
                >
                  {doctors.map((d) => (
                    <option key={d.doctorId} value={d.doctorId}>
                      {d.doctorName} ({d.specialty}) · Status: {d.status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Appointment Type */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Consultation Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingType('in-person')}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-left flex items-center gap-2 cursor-pointer ${
                      bookingType === 'in-person'
                        ? 'border-teal-500 bg-teal-50 text-teal-900 font-semibold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Building className="w-4 h-4 text-teal-600" />
                    <span>In-Person Clinic</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookingType('telehealth')}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-left flex items-center gap-2 cursor-pointer ${
                      bookingType === 'telehealth'
                        ? 'border-teal-500 bg-teal-50 text-teal-900 font-semibold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Video className="w-4 h-4 text-teal-600" />
                    <span>Encrypted Telehealth</span>
                  </button>
                </div>
              </div>

              {/* Date & Time Slot Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Appointment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Time Slot *
                  </label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-teal-500"
                  >
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Reason for Visit / Chief Complaint *
                </label>
                <input
                  type="text"
                  required
                  value={bookingReason}
                  onChange={(e) => setBookingReason(e.target.value)}
                  placeholder="e.g. Hypertension management checkup, persistent cough, lab follow-up"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Clinical Intake Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="Additional patient notes, requested tests or symptoms..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  Confirm & Schedule Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulated Telehealth WebRTC Room Modal */}
      {telehealthActiveModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full p-6 text-white flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                  HIPAA WebRTC Encrypted Telehealth Session Active
                </span>
              </div>
              <button
                onClick={() => setTelehealthActiveModal(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="aspect-video bg-slate-800 rounded-xl relative overflow-hidden flex items-center justify-center border border-slate-700">
                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256'}
                  alt="Doctor"
                  className="w-20 h-20 rounded-full object-cover border-2 border-teal-500/50"
                />
                <span className="absolute bottom-2 left-2 bg-slate-900/80 px-2 py-0.5 rounded text-[11px] font-mono">
                  {currentUser?.name || 'Local Clinician'} (Audio/Video Active)
                </span>
              </div>

              <div className="aspect-video bg-slate-800 rounded-xl relative overflow-hidden flex items-center justify-center border border-slate-700">
                <div className="text-center p-4">
                  <div className="w-16 h-16 rounded-full bg-teal-900 text-teal-200 flex items-center justify-center font-mono font-bold text-xl mx-auto mb-2">
                    {telehealthActiveModal.patientName[0]}
                  </div>
                  <p className="font-bold text-sm">{telehealthActiveModal.patientName}</p>
                  <p className="text-xs text-slate-400 font-mono">{telehealthActiveModal.patientMrn}</p>
                </div>
                <span className="absolute bottom-2 left-2 bg-slate-900/80 px-2 py-0.5 rounded text-[11px] font-mono">
                  Patient Terminal (E2EE 256-bit SRTP)
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 flex items-center justify-between text-xs font-mono text-slate-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>Session Key: CC-TEL-8921-X99B (DTLS-SRTP AES-256)</span>
              </div>
              <span>Encounter: {telehealthActiveModal.reason}</span>
            </div>

            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                onClick={() => {
                  onUpdateAppointmentStatus(telehealthActiveModal.id, 'completed', 'Telehealth Finished');
                  setTelehealthActiveModal(null);
                }}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
              >
                End & Complete Clinical Telehealth Visit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
