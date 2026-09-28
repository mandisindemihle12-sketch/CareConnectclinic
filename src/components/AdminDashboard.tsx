import React, { useState } from 'react';
import { 
  Activity, 
  Users, 
  Stethoscope, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  DoorOpen, 
  Send, 
  ChevronRight,
  RefreshCw,
  PhoneCall,
  UserCheck
} from 'lucide-react';
import { 
  Patient, 
  DoctorAvailability, 
  PatientStatus, 
  DoctorStatus,
  User
} from '../types/clinic';
import { maskPhi } from '../utils/crypto';

interface AdminDashboardProps {
  patients: Patient[];
  doctors: DoctorAvailability[];
  currentUser: User | null;
  isPrivacyMasked: boolean;
  onUpdatePatientStatus: (patientId: string, newStatus: PatientStatus, room?: string) => void;
  onUpdateDoctorStatus: (doctorId: string, newStatus: DoctorStatus) => void;
  onSelectPatient: (patient: Patient) => void;
  onStartConsultationWithDoctor: (doctor: DoctorAvailability) => void;
  onNavigateToTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  patients,
  doctors,
  currentUser,
  isPrivacyMasked,
  onUpdatePatientStatus,
  onUpdateDoctorStatus,
  onSelectPatient,
  onStartConsultationWithDoctor,
  onNavigateToTab,
}) => {
  const [selectedStation, setSelectedStation] = useState<string>('all');
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now');

  // Status mapping definitions
  const statusColumns: { id: PatientStatus; label: string; location: string }[] = [
    { id: 'waiting_room', label: 'Waiting Room', location: 'Lobby Zone A/B' },
    { id: 'triage', label: 'Triage Station', location: 'Bay 1 & 2' },
    { id: 'exam_room_1', label: 'Exam Room 1', location: 'Internal Med' },
    { id: 'exam_room_2', label: 'Exam Room 2', location: 'Cardiology' },
    { id: 'in_labs', label: 'Diagnostics & Labs', location: 'Core Lab Suite' },
    { id: 'discharge_ready', label: 'Discharge Ready', location: 'Checkout Desk' },
  ];

  // Derived metrics
  const activePatientsCount = patients.filter(p => p.currentStatus !== 'completed').length;
  const inExamCount = patients.filter(p => p.currentStatus.startsWith('exam_room')).length;
  const availableDoctorsCount = doctors.filter(d => d.status === 'available').length;
  const inConsultDoctorsCount = doctors.filter(d => d.status === 'in-consultation').length;

  const handleRefresh = () => {
    const now = new Date();
    setLastRefreshed(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Breadcrumb & Overview Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Clinic Operations</span>
            <span aria-hidden="true">·</span>
            <span>Real-Time Clinical Telemetry</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-teal-600">Updated {lastRefreshed}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Clinical Command & Patient Flow Center
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Sync Telemetry</span>
          </button>
          
          <button
            onClick={() => onNavigateToTab('scheduler')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          >
            <span>+ Schedule Appointment</span>
          </button>
        </div>
      </div>

      {/* Primary Clinical KPIs (Clean 4-column metric grid with tabular figures) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Active In-Clinic Patients</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono tabular-nums">
            {activePatientsCount}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <span className="text-emerald-700 font-medium">5 checked-in today</span>
            <span>·</span>
            <span>Avg Wait: 12m</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Exam Rooms Occupied</span>
            <DoorOpen className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono tabular-nums">
            {inExamCount} <span className="text-sm font-normal text-slate-400">/ 4 suites</span>
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <span className="text-teal-700 font-medium">50% Occupancy</span>
            <span>·</span>
            <span>2 Suites Open</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Physicians On Duty</span>
            <Stethoscope className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono tabular-nums">
            {doctors.length} <span className="text-sm font-normal text-slate-400">active</span>
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <span className="text-emerald-700 font-medium">{availableDoctorsCount} available</span>
            <span>·</span>
            <span>{inConsultDoctorsCount} in consult</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>HIPAA Enclave Status</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono tabular-nums">
            100% <span className="text-sm font-normal text-slate-400">nominal</span>
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <span className="text-emerald-700 font-medium">AES-256 At-Rest</span>
            <span>·</span>
            <span>Zero breaches</span>
          </div>
        </div>
      </div>

      {/* Section 1: Real-Time Patient Status Tracking Board */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Real-Time Patient Flow & Location Tracking
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status tracking across clinical stations. Move patients seamlessly between care checkpoints.
            </p>
          </div>

          {/* Station Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg text-xs">
            <button
              onClick={() => setSelectedStation('all')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                selectedStation === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Zones
            </button>
            <button
              onClick={() => setSelectedStation('waiting')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                selectedStation === 'waiting'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lobby & Triage
            </button>
            <button
              onClick={() => setSelectedStation('exam')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                selectedStation === 'exam'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Exam Suites
            </button>
          </div>
        </div>

        {/* Status Grid Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-slate-200">
          {statusColumns
            .filter((col) => {
              if (selectedStation === 'waiting') return col.id === 'waiting_room' || col.id === 'triage';
              if (selectedStation === 'exam') return col.id.startsWith('exam_room') || col.id === 'in_labs';
              return true;
            })
            .map((column) => {
              const patientsInStation = patients.filter((p) => p.currentStatus === column.id);

              return (
                <div key={column.id} className="bg-white p-4 flex flex-col min-h-[220px]">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        {column.label}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {column.location}
                      </p>
                    </div>
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {patientsInStation.length}
                    </span>
                  </div>

                  {/* Patient List in this Station */}
                  <div className="mt-3 space-y-2.5 flex-1">
                    {patientsInStation.length === 0 ? (
                      <div className="h-full flex items-center justify-center p-4 text-center">
                        <p className="text-xs text-slate-400 italic">No patients currently in this zone</p>
                      </div>
                    ) : (
                      patientsInStation.map((patient) => {
                        const displayName = isPrivacyMasked 
                          ? maskPhi(`${patient.firstName} ${patient.lastName}`, 'name')
                          : `${patient.firstName} ${patient.lastName}`;
                        const displayMrn = isPrivacyMasked 
                          ? maskPhi(patient.mrn, 'mrn')
                          : patient.mrn;

                        return (
                          <div
                            key={patient.id}
                            className="p-3 border border-slate-200 rounded-lg hover:border-teal-500 hover:shadow-xs transition-all bg-white"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <button
                                  onClick={() => onSelectPatient(patient)}
                                  className="text-xs font-bold text-slate-900 hover:text-teal-700 text-left transition-colors cursor-pointer"
                                >
                                  {displayName}
                                </button>
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono mt-0.5">
                                  <span>{displayMrn}</span>
                                  <span>·</span>
                                  <span>{patient.bloodType}</span>
                                </div>
                              </div>

                              <span
                                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                  patient.triagePriority === 'Urgent'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {patient.triagePriority}
                              </span>
                            </div>

                            {/* Vitals Summary if available */}
                            {patient.vitalsHistory.length > 0 && (
                              <div className="mt-2 text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded flex items-center justify-between font-mono">
                                <span>BP: {patient.vitalsHistory[0].bloodPressure}</span>
                                <span>HR: {patient.vitalsHistory[0].heartRate} bpm</span>
                                <span>SpO2: {patient.vitalsHistory[0].spO2}%</span>
                              </div>
                            )}

                            {/* Clinical Station Action Bar */}
                            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                              <button
                                onClick={() => onSelectPatient(patient)}
                                className="text-teal-700 hover:text-teal-800 font-medium text-[11px] cursor-pointer flex items-center gap-1"
                              >
                                <span>Open EHR Chart</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>

                              {/* Quick Move Dropdown */}
                              <select
                                value={patient.currentStatus}
                                onChange={(e) => onUpdatePatientStatus(patient.id, e.target.value as PatientStatus)}
                                className="text-[11px] border border-slate-200 rounded px-1.5 py-0.5 bg-white text-slate-700 cursor-pointer focus:ring-1 focus:ring-teal-500"
                              >
                                <option value="waiting_room">Move: Waiting</option>
                                <option value="triage">Move: Triage</option>
                                <option value="exam_room_1">Move: Exam 1</option>
                                <option value="exam_room_2">Move: Exam 2</option>
                                <option value="in_labs">Move: Labs</option>
                                <option value="discharge_ready">Move: Discharge</option>
                                <option value="completed">Complete & Archive</option>
                              </select>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Section 2: Doctor Availability Dashboards */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Physician Availability & Roster Dashboard
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live clinician availability, station assignments, shift hours, and direct encrypted consultation dispatch.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Available
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> In Consult
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-400" /> Break / Off
            </span>
          </div>
        </div>

        {/* Doctor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
          {doctors.map((doctor) => {
            const isSelf = currentUser?.id === doctor.doctorId;

            return (
              <div
                key={doctor.doctorId}
                className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3">
                    <img
                      src={doctor.avatar}
                      alt={doctor.doctorName}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200 bg-slate-100"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {doctor.doctorName}
                        </h4>
                      </div>
                      <p className="text-[11px] text-teal-700 font-medium truncate">
                        {doctor.specialty}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {doctor.phoneExt}
                      </p>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="mt-3.5 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Current Status:</span>
                      <span
                        className={`font-semibold capitalize text-[11px] ${
                          doctor.status === 'available'
                            ? 'text-emerald-700'
                            : doctor.status === 'in-consultation'
                            ? 'text-amber-700'
                            : 'text-slate-600'
                        }`}
                      >
                        {doctor.status.replace('-', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Assigned Suite:</span>
                      <span className="font-mono text-[11px] font-medium text-slate-800">
                        {doctor.currentRoom}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Queue Load:</span>
                      <span className="font-mono tabular-nums text-[11px] font-semibold text-slate-800">
                        {doctor.queueCount} patients
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Shift Hours:</span>
                      <span className="font-mono text-slate-600 truncate max-w-[130px]">
                        {doctor.shiftHours.split(' ')[0]}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onStartConsultationWithDoctor(doctor)}
                      className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>Encrypted Chat</span>
                    </button>
                  </div>

                  {/* Status Override for clinician or admin */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400">Set:</span>
                    <select
                      value={doctor.status}
                      onChange={(e) => onUpdateDoctorStatus(doctor.doctorId, e.target.value as DoctorStatus)}
                      className="flex-1 text-[10px] border border-slate-200 rounded px-1 py-0.5 bg-slate-50 text-slate-700 cursor-pointer"
                    >
                      <option value="available">Available</option>
                      <option value="in-consultation">In Consultation</option>
                      <option value="on-call">On-Call</option>
                      <option value="break">Staff Break</option>
                      <option value="off-duty">Off Duty</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
