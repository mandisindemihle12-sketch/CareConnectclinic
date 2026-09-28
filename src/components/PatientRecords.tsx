import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  FileText, 
  AlertTriangle, 
  Heart, 
  Activity, 
  Calendar, 
  Download, 
  ShieldAlert, 
  X, 
  ChevronRight, 
  Check, 
  Lock, 
  Pill,
  Clock,
  UserCheck
} from 'lucide-react';
import { 
  Patient, 
  User, 
  VitalRecord, 
  SoapNote, 
  Medication 
} from '../types/clinic';
import { maskPhi } from '../utils/crypto';

interface PatientRecordsProps {
  patients: Patient[];
  currentUser: User | null;
  isPrivacyMasked: boolean;
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient | null) => void;
  onAddPatient: (newPatient: Patient) => void;
  onUpdatePatient: (updatedPatient: Patient) => void;
  onLogAudit: (action: any, reason: string, mrn?: string, patientName?: string) => void;
}

export const PatientRecords: React.FC<PatientRecordsProps> = ({
  patients,
  currentUser,
  isPrivacyMasked,
  selectedPatient,
  onSelectPatient,
  onAddPatient,
  onUpdatePatient,
  onLogAudit,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isAddVitalsOpen, setIsAddVitalsOpen] = useState(false);
  const [isAddSoapOpen, setIsAddSoapOpen] = useState(false);
  const [isBreakGlassActive, setIsBreakGlassActive] = useState(false);
  const [breakGlassRationale, setBreakGlassRationale] = useState('');
  const [showBreakGlassModal, setShowBreakGlassModal] = useState(false);

  // New Vitals state
  const [newBp, setNewBp] = useState('120/80');
  const [newHr, setNewHr] = useState(72);
  const [newSpo2, setNewSpo2] = useState(99);
  const [newTemp, setNewTemp] = useState(98.6);
  const [newResp, setNewResp] = useState(16);

  // New SOAP state
  const [newSoapSubjective, setNewSoapSubjective] = useState('');
  const [newSoapObjective, setNewSoapObjective] = useState('');
  const [newSoapAssessment, setNewSoapAssessment] = useState('');
  const [newSoapPlan, setNewSoapPlan] = useState('');
  const [newSoapDiagnosis, setNewSoapDiagnosis] = useState('');

  // New Patient Form state
  const [newPatFirst, setNewPatFirst] = useState('');
  const [newPatLast, setNewPatLast] = useState('');
  const [newPatDob, setNewPatDob] = useState('1990-01-01');
  const [newPatGender, setNewPatGender] = useState<'Female' | 'Male' | 'Other'>('Female');
  const [newPatBlood, setNewPatBlood] = useState<'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'>('O+');
  const [newPatPhone, setNewPatPhone] = useState('+1 (555) 019-3321');
  const [newPatEmail, setNewPatEmail] = useState('');
  const [newPatAddress, setNewPatAddress] = useState('702 Colorado St, Austin, TX');
  const [newPatAllergies, setNewPatAllergies] = useState('NKDA (No Known Drug Allergies)');
  const [newPatConditions, setNewPatConditions] = useState('Hypertension');

  // Filter patients based on query and priority
  const filteredPatients = patients.filter((patient) => {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    const mrn = patient.mrn.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || mrn.includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'all' || patient.triagePriority.toLowerCase() === filterPriority.toLowerCase();
    return matchesSearch && matchesPriority;
  });

  const handleOpenPatientChart = (patient: Patient) => {
    onSelectPatient(patient);
    onLogAudit(
      'VIEW_PHI',
      `Authorized clinical record access by ${currentUser?.name || 'Practitioner'}`,
      patient.mrn,
      `${patient.firstName} ${patient.lastName}`
    );
  };

  const handleBreakGlassConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!breakGlassRationale.trim()) return;

    if (selectedPatient) {
      onLogAudit(
        'BREAK_GLASS_ACCESS',
        `EMERGENCY OVERRIDE: ${breakGlassRationale}`,
        selectedPatient.mrn,
        `${selectedPatient.firstName} ${selectedPatient.lastName}`
      );
    }
    setIsBreakGlassActive(true);
    setShowBreakGlassModal(false);
  };

  const handleSaveVitals = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const newVital: VitalRecord = {
      id: `vit_${Date.now()}`,
      timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      bloodPressure: newBp,
      heartRate: Number(newHr),
      spO2: Number(newSpo2),
      temperature: Number(newTemp),
      respiratoryRate: Number(newResp),
      recordedBy: currentUser?.name || 'Clinical Staff',
    };

    const updated: Patient = {
      ...selectedPatient,
      vitalsHistory: [newVital, ...selectedPatient.vitalsHistory],
    };

    onUpdatePatient(updated);
    onSelectPatient(updated);
    setIsAddVitalsOpen(false);

    onLogAudit(
      'EDIT_RECORD',
      `Recorded vital signs (${newBp}, HR ${newHr})`,
      selectedPatient.mrn,
      `${selectedPatient.firstName} ${selectedPatient.lastName}`
    );
  };

  const handleSaveSoap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const newSoap: SoapNote = {
      id: `soap_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      doctorName: currentUser?.name || 'Dr. Elena Vance, MD',
      doctorRole: currentUser?.title || 'Attending Physician',
      subjective: newSoapSubjective || 'Patient reports stable condition without acute distress.',
      objective: newSoapObjective || `Vitals reviewed. General appearance: alert, oriented x3.`,
      assessment: newSoapAssessment || 'Chronic conditions stable.',
      plan: newSoapPlan || 'Continue current therapeutic regimen.',
      diagnoses: newSoapDiagnosis ? [newSoapDiagnosis] : ['General clinical review'],
    };

    const updated: Patient = {
      ...selectedPatient,
      soapNotes: [newSoap, ...selectedPatient.soapNotes],
    };

    onUpdatePatient(updated);
    onSelectPatient(updated);
    setIsAddSoapOpen(false);
    setNewSoapSubjective('');
    setNewSoapObjective('');
    setNewSoapAssessment('');
    setNewSoapPlan('');
    setNewSoapDiagnosis('');

    onLogAudit(
      'EDIT_RECORD',
      `Documented clinical encounter SOAP Note`,
      selectedPatient.mrn,
      `${selectedPatient.firstName} ${selectedPatient.lastName}`
    );
  };

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatFirst || !newPatLast) return;

    const createdMrn = `MRN-${Math.floor(10000 + Math.random() * 90000)}`;
    const newPatient: Patient = {
      id: `pat_${Date.now()}`,
      mrn: createdMrn,
      ssnLast4: Math.floor(1000 + Math.random() * 9000).toString(),
      firstName: newPatFirst,
      lastName: newPatLast,
      dob: newPatDob,
      gender: newPatGender,
      bloodType: newPatBlood,
      phone: newPatPhone,
      email: newPatEmail || `${newPatFirst.toLowerCase()}@careconnect.health`,
      address: newPatAddress,
      emergencyContact: {
        name: 'Family Primary Contact',
        relationship: 'Spouse',
        phone: newPatPhone,
      },
      allergies: newPatAllergies.split(',').map((s) => s.trim()),
      conditions: newPatConditions.split(',').map((s) => s.trim()),
      medications: [],
      vitalsHistory: [
        {
          id: `vit_${Date.now()}`,
          timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
          bloodPressure: '120/80',
          heartRate: 72,
          spO2: 99,
          temperature: 98.6,
          respiratoryRate: 16,
          recordedBy: currentUser?.name || 'Triage Intake',
        },
      ],
      soapNotes: [],
      documents: [],
      currentStatus: 'waiting_room',
      assignedDoctorId: 'usr_doc_elena',
      assignedDoctorName: 'Dr. Elena Vance, MD',
      triagePriority: 'Routine',
      lastVisitDate: new Date().toISOString().split('T')[0],
    };

    onAddPatient(newPatient);
    setIsAddPatientOpen(false);
    onSelectPatient(newPatient);

    onLogAudit(
      'EDIT_RECORD',
      `Created new patient record and initialized clinical chart`,
      createdMrn,
      `${newPatFirst} ${newPatLast}`
    );
  };

  const handleExportEhr = () => {
    if (!selectedPatient) return;

    const exportPayload = {
      standard: 'HIPAA 45 CFR § 164.524 Individual Right of Access',
      clinic: 'CareConnect Health Enclave',
      timestamp: new Date().toISOString(),
      patient: selectedPatient,
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EHR_EXPORT_${selectedPatient.mrn}_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    onLogAudit(
      'EXPORT_RECORD',
      `Exported full electronic health record dossier`,
      selectedPatient.mrn,
      `${selectedPatient.firstName} ${selectedPatient.lastName}`
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Clinical Records</span>
            <span aria-hidden="true">·</span>
            <span>Electronic Health Records (EHR)</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-teal-600">HIPAA Protected PHI</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Patient Records Management
          </h1>
        </div>

        <button
          onClick={() => setIsAddPatientOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>New Patient Record</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by patient name, MRN, phone..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50/50"
          />
        </div>

        {/* Priority Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs w-full sm:w-auto">
          <button
            onClick={() => setFilterPriority('all')}
            className={`flex-1 sm:flex-initial px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
              filterPriority === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Priorities
          </button>
          <button
            onClick={() => setFilterPriority('routine')}
            className={`flex-1 sm:flex-initial px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
              filterPriority === 'routine'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Routine
          </button>
          <button
            onClick={() => setFilterPriority('urgent')}
            className={`flex-1 sm:flex-initial px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
              filterPriority === 'urgent'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Urgent Triage
          </button>
        </div>
      </div>

      {/* Patient Table with High-Density Clinical Grid */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Patient Name & MRN</th>
                <th className="py-3 px-4">Demographics</th>
                <th className="py-3 px-4">Allergies & Alerts</th>
                <th className="py-3 px-4">Latest Vitals</th>
                <th className="py-3 px-4">Attending Doctor</th>
                <th className="py-3 px-4">Current Station</th>
                <th className="py-3 px-4 text-right">EHR Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No matching patient records found.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => {
                  const displayName = isPrivacyMasked 
                    ? maskPhi(`${patient.firstName} ${patient.lastName}`, 'name')
                    : `${patient.firstName} ${patient.lastName}`;
                  const displayMrn = isPrivacyMasked 
                    ? maskPhi(patient.mrn, 'mrn')
                    : patient.mrn;
                  const latestVital = patient.vitalsHistory[0];

                  return (
                    <tr
                      key={patient.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Name & MRN */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleOpenPatientChart(patient)}
                          className="font-bold text-slate-900 group-hover:text-teal-700 text-left cursor-pointer transition-colors block"
                        >
                          {displayName}
                        </button>
                        <span className="font-mono text-[11px] text-slate-500">
                          {displayMrn}
                        </span>
                      </td>

                      {/* Demographics (Unboxed metadata with separators) */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
                          <span>{patient.gender[0]}</span>
                          <span>·</span>
                          <span>{patient.bloodType}</span>
                          <span>·</span>
                          <span className="tabular-nums">DOB: {patient.dob}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
                          {isPrivacyMasked ? '•••• Austin, TX' : patient.address}
                        </p>
                      </td>

                      {/* Allergies & Alerts */}
                      <td className="py-3 px-4">
                        {patient.allergies.some((a) => a.toLowerCase().includes('anaphylaxis') || a.toLowerCase().includes('severe')) ? (
                          <span className="text-[11px] text-rose-700 font-medium flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span className="truncate max-w-[180px]">{patient.allergies[0]}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-600 truncate max-w-[180px] block">
                            {patient.allergies.join(', ')}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 truncate max-w-[180px] block mt-0.5">
                          {patient.conditions.join(', ')}
                        </span>
                      </td>

                      {/* Latest Vitals */}
                      <td className="py-3 px-4">
                        {latestVital ? (
                          <div className="font-mono text-[11px] text-slate-700 tabular-nums">
                            <p className="font-semibold text-slate-900">
                              {latestVital.bloodPressure} <span className="text-[10px] font-normal text-slate-500">mmHg</span>
                            </p>
                            <p className="text-[10px] text-slate-500">
                              HR {latestVital.heartRate} · SpO2 {latestVital.spO2}%
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">No vitals</span>
                        )}
                      </td>

                      {/* Attending Doctor */}
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-800 text-[11px]">
                          {patient.assignedDoctorName}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Next: {patient.nextAppointmentDate || 'None'}
                        </p>
                      </td>

                      {/* Current Station */}
                      <td className="py-3 px-4">
                        <span className="text-[11px] capitalize text-slate-700 font-medium">
                          {patient.currentStatus.replace('_', ' ')}
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          {patient.assignedRoom || 'Lobby Waiting'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenPatientChart(patient)}
                          className="px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-md transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>Open Chart</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Detail Modal / Electronic Health Record (EHR Drawer) */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden my-4">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center font-mono text-base">
                  {selectedPatient.firstName[0]}
                  {selectedPatient.lastName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">
                      {isPrivacyMasked 
                        ? maskPhi(`${selectedPatient.firstName} ${selectedPatient.lastName}`, 'name')
                        : `${selectedPatient.firstName} ${selectedPatient.lastName}`}
                    </h3>
                    <span className="font-mono text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {isPrivacyMasked ? maskPhi(selectedPatient.mrn, 'mrn') : selectedPatient.mrn}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-0.5">
                    <span>DOB: {selectedPatient.dob}</span>
                    <span>·</span>
                    <span>Blood: {selectedPatient.bloodType}</span>
                    <span>·</span>
                    <span>Gender: {selectedPatient.gender}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportEhr}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Export Official HIPAA Clinical Record"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export EHR</span>
                </button>

                <button
                  onClick={() => setShowBreakGlassModal(true)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isBreakGlassActive
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-white text-rose-600 border-rose-200 hover:bg-rose-50'
                  }`}
                  title="Emergency PHI Access Override (HIPAA § 164.510)"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{isBreakGlassActive ? 'Break-Glass ACTIVE' : 'Break-Glass'}</span>
                </button>

                <button
                  onClick={() => onSelectPatient(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Clinical Warnings / Allergies Banner */}
              {selectedPatient.allergies.length > 0 && (
                <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Clinical Alerts & Allergies
                    </h4>
                    <p className="text-xs text-amber-800 mt-0.5">
                      {selectedPatient.allergies.join(' · ')}
                    </p>
                    <p className="text-[11px] text-amber-700 mt-1">
                      Chronic Diagnoses: {selectedPatient.conditions.join(', ')}
                    </p>
                  </div>
                </div>
              )}

              {/* Grid: Vitals & Medications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Vitals History */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span>Vital Signs Log</span>
                    </h4>
                    <button
                      onClick={() => setIsAddVitalsOpen(true)}
                      className="text-xs text-teal-700 hover:text-teal-800 font-semibold cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Record Vitals</span>
                    </button>
                  </div>

                  <div className="mt-3 space-y-2.5">
                    {selectedPatient.vitalsHistory.map((vital) => (
                      <div
                        key={vital.id}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-mono">
                          <span className="font-bold text-slate-900 text-sm">
                            {vital.bloodPressure} <span className="text-[10px] text-slate-500 font-normal">mmHg</span>
                          </span>
                          <span className="text-[11px] text-slate-500">{vital.timestamp}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-600 font-mono">
                          <span>HR: {vital.heartRate} bpm</span>
                          <span>·</span>
                          <span>SpO2: {vital.spO2}%</span>
                          <span>·</span>
                          <span>Temp: {vital.temperature}°F</span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Recorded by: {vital.recordedBy}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Medications */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Pill className="w-4 h-4 text-teal-600" />
                      <span>Current Active Medications</span>
                    </h4>
                  </div>

                  <div className="mt-3 space-y-2.5">
                    {selectedPatient.medications.length === 0 ? (
                      <p className="text-xs text-slate-400 italic p-3 text-center">
                        No active prescriptions documented
                      </p>
                    ) : (
                      selectedPatient.medications.map((med) => (
                        <div
                          key={med.id}
                          className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{med.name}</span>
                            <span className="text-[10px] font-mono font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              {med.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            Dosage: {med.dosage} ({med.frequency})
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1 font-mono">
                            Rx: {med.prescribedBy} · Started {med.startDate}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* SOAP Clinical Encounter Notes */}
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-teal-600" />
                      <span>Clinical Encounter Notes (SOAP Protocol)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Standardized Subjective, Objective, Assessment & Plan documentation.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddSoapOpen(true)}
                    className="px-3 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add SOAP Note</span>
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  {selectedPatient.soapNotes.length === 0 ? (
                    <p className="text-xs text-slate-400 italic p-4 text-center">
                      No clinical notes recorded yet for this patient.
                    </p>
                  ) : (
                    selectedPatient.soapNotes.map((note) => (
                      <div
                        key={note.id}
                        className="p-4 border border-slate-200 rounded-lg bg-slate-50/50 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200 font-mono">
                          <span className="font-bold text-slate-900">
                            Encounter Date: {note.date}
                          </span>
                          <span className="text-[11px] text-teal-700">
                            {note.doctorName} ({note.doctorRole})
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <div>
                            <span className="font-bold text-slate-800">[S] Subjective: </span>
                            <span className="text-slate-700">{note.subjective}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-800">[O] Objective: </span>
                            <span className="text-slate-700">{note.objective}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-800">[A] Assessment: </span>
                            <span className="text-slate-700 whitespace-pre-line">{note.assessment}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-800">[P] Plan: </span>
                            <span className="text-slate-700 whitespace-pre-line">{note.plan}</span>
                          </div>
                        </div>

                        {note.diagnoses && note.diagnoses.length > 0 && (
                          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                            <span>ICD-10 Diagnoses:</span>
                            {note.diagnoses.map((d, i) => (
                              <span key={i} className="text-slate-800 font-semibold">
                                {d}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Clinical Documents / Diagnostics */}
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Diagnostic Reports & Lab Attachments
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedPatient.documents.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No lab documents attached</p>
                  ) : (
                    selectedPatient.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 border border-slate-200 rounded-lg bg-white flex items-center justify-between hover:border-slate-300 transition-colors"
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
                          onClick={() => alert(`Simulated secure preview of: ${doc.title} (${doc.fileSize})`)}
                          className="text-xs text-teal-700 hover:text-teal-800 font-medium cursor-pointer"
                        >
                          View
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono">
                HIPAA Audit ID: CC-{selectedPatient.mrn.slice(-4)}-{Date.now().toString().slice(-4)}
              </span>
              <button
                onClick={() => onSelectPatient(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium cursor-pointer"
              >
                Close EHR
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Add Vitals Modal */}
      {isAddVitalsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">Record Vital Signs</h3>
            <p className="text-xs text-slate-500 mb-4 font-mono">
              Patient: {selectedPatient?.firstName} {selectedPatient?.lastName} ({selectedPatient?.mrn})
            </p>

            <form onSubmit={handleSaveVitals} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Blood Pressure (mmHg)
                  </label>
                  <input
                    type="text"
                    required
                    value={newBp}
                    onChange={(e) => setNewBp(e.target.value)}
                    placeholder="120/80"
                    className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Heart Rate (bpm)
                  </label>
                  <input
                    type="number"
                    required
                    value={newHr}
                    onChange={(e) => setNewHr(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    SpO2 (%)
                  </label>
                  <input
                    type="number"
                    required
                    value={newSpo2}
                    onChange={(e) => setNewSpo2(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Temp (°F)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newTemp}
                    onChange={(e) => setNewTemp(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Resp Rate
                  </label>
                  <input
                    type="number"
                    required
                    value={newResp}
                    onChange={(e) => setNewResp(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddVitalsOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
                >
                  Save & Sign Vitals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add SOAP Note Modal */}
      {isAddSoapOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">Add Clinical SOAP Note</h3>
            <p className="text-xs text-slate-500 mb-4 font-mono">
              Patient: {selectedPatient?.firstName} {selectedPatient?.lastName} ({selectedPatient?.mrn})
            </p>

            <form onSubmit={handleSaveSoap} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  [S] Subjective (Chief complaint & patient-reported history)
                </label>
                <textarea
                  rows={2}
                  value={newSoapSubjective}
                  onChange={(e) => setNewSoapSubjective(e.target.value)}
                  placeholder="Patient reports mild cough and headache for 3 days..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  [O] Objective (Physical exam, physical findings)
                </label>
                <textarea
                  rows={2}
                  value={newSoapObjective}
                  onChange={(e) => setNewSoapObjective(e.target.value)}
                  placeholder="HEENT normocephalic, lungs clear bilaterally, vitals reviewed..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  [A] Assessment (Clinical judgment & differential diagnosis)
                </label>
                <textarea
                  rows={2}
                  value={newSoapAssessment}
                  onChange={(e) => setNewSoapAssessment(e.target.value)}
                  placeholder="1. Viral upper respiratory infection..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  [P] Plan (Medications, labs, patient education, follow-up)
                </label>
                <textarea
                  rows={2}
                  value={newSoapPlan}
                  onChange={(e) => setNewSoapPlan(e.target.value)}
                  placeholder="Supportive care, hydration, OTC acetaminophen PRN..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Primary ICD-10 Diagnosis code & label
                </label>
                <input
                  type="text"
                  value={newSoapDiagnosis}
                  onChange={(e) => setNewSoapDiagnosis(e.target.value)}
                  placeholder="e.g. J06.9 - Acute upper respiratory infection, unspecified"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-teal-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddSoapOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
                >
                  Sign & Seal Clinical Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Break-Glass Emergency Modal */}
      {showBreakGlassModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-rose-300 rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-base font-bold">Emergency Break-Glass Access</h3>
            </div>
            
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Under <strong>HIPAA 45 CFR § 164.510(b)</strong>, breaking glass overrides standard confidentiality safeguards in emergency or life-safety scenarios. This access is logged permanently in the cryptographic compliance audit ledger.
            </p>

            <form onSubmit={handleBreakGlassConfirm} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Clinical Emergency Justification *
                </label>
                <textarea
                  required
                  rows={3}
                  value={breakGlassRationale}
                  onChange={(e) => setBreakGlassRationale(e.target.value)}
                  placeholder="Specify immediate clinical emergency (e.g., Acute anaphylaxis, unresponsive patient in trauma room)..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-rose-500 focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBreakGlassModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  Confirm & Log Emergency Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Patient Record Modal */}
      {isAddPatientOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-lg w-full p-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Register New Patient Record
              </h3>
              <button
                onClick={() => setIsAddPatientOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={newPatFirst}
                    onChange={(e) => setNewPatFirst(e.target.value)}
                    placeholder="Liam"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={newPatLast}
                    onChange={(e) => setNewPatLast(e.target.value)}
                    placeholder="Walker"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">DOB *</label>
                  <input
                    type="date"
                    required
                    value={newPatDob}
                    onChange={(e) => setNewPatDob(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Gender</label>
                  <select
                    value={newPatGender}
                    onChange={(e) => setNewPatGender(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-teal-500"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Blood Type</label>
                  <select
                    value={newPatBlood}
                    onChange={(e) => setNewPatBlood(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-teal-500 font-mono"
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
                  <label className="block text-xs font-medium text-slate-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={newPatPhone}
                    onChange={(e) => setNewPatPhone(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newPatEmail}
                    onChange={(e) => setNewPatEmail(e.target.value)}
                    placeholder="patient@careconnect.health"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Known Allergies</label>
                <input
                  type="text"
                  value={newPatAllergies}
                  onChange={(e) => setNewPatAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Aspirin or NKDA"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Primary Conditions</label>
                <input
                  type="text"
                  value={newPatConditions}
                  onChange={(e) => setNewPatConditions(e.target.value)}
                  placeholder="e.g. Type 2 Diabetes, Hypertension"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddPatientOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  Create Medical Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
