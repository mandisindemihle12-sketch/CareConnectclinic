export type UserRole = 'admin' | 'doctor' | 'nurse' | 'patient';

export type PatientStatus = 
  | 'waiting_room' 
  | 'triage' 
  | 'exam_room_1' 
  | 'exam_room_2' 
  | 'exam_room_3' 
  | 'exam_room_4' 
  | 'in_labs' 
  | 'discharge_ready' 
  | 'completed';

export type DoctorStatus = 
  | 'available' 
  | 'in-consultation' 
  | 'on-call' 
  | 'break' 
  | 'off-duty';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  title: string;
  department?: string;
  specialty?: string;
  phone: string;
  mrn?: string; // If patient
  licenseNumber?: string; // If clinician
}

export interface VitalRecord {
  id: string;
  timestamp: string;
  bloodPressure: string; // e.g. "120/80"
  heartRate: number; // bpm
  spO2: number; // %
  temperature: number; // °F
  respiratoryRate: number; // breaths/min
  recordedBy: string;
}

export interface SoapNote {
  id: string;
  date: string;
  doctorName: string;
  doctorRole: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  diagnoses: string[];
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  startDate: string;
  status: 'active' | 'discontinued';
}

export interface ClinicalDocument {
  id: string;
  title: string;
  category: 'Lab Report' | 'Imaging' | 'Referral' | 'Discharge Summary';
  date: string;
  fileSize: string;
  doctorName: string;
}

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number
  ssnLast4: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: 'Female' | 'Male' | 'Other';
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  phone: string;
  email: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  allergies: string[];
  conditions: string[];
  medications: Medication[];
  vitalsHistory: VitalRecord[];
  soapNotes: SoapNote[];
  documents: ClinicalDocument[];
  currentStatus: PatientStatus;
  assignedDoctorId: string;
  assignedDoctorName: string;
  assignedRoom?: string;
  triagePriority: 'Routine' | 'Urgent' | 'Immediate';
  lastVisitDate: string;
  nextAppointmentDate?: string;
  isRestrictedPhi?: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  timeSlot: string;
  type: 'in-person' | 'telehealth';
  reason: string;
  status: 'scheduled' | 'checked-in' | 'in-progress' | 'completed' | 'cancelled';
  room?: string;
  notes?: string;
  durationMinutes: number;
}

export interface DoctorAvailability {
  doctorId: string;
  doctorName: string;
  specialty: string;
  status: DoctorStatus;
  currentRoom: string;
  activePatientMrn?: string;
  queueCount: number;
  shiftHours: string;
  avatar: string;
  phoneExt: string;
  nextAvailableSlot: string;
}

export interface EncryptedMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId: string;
  recipientName: string;
  cipherPayload: string; // Base64 encrypted text
  plaintextDisplay: string; // Decrypted for current authorized viewer
  iv: string; // Initialization vector for AES-GCM
  keyFingerprint: string; // SHA-256 short fingerprint
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  isClinicalUrgent?: boolean;
  attachedType?: 'lab_result' | 'vital_alert' | 'prescription_request';
}

export interface AppointmentReminder {
  id: string;
  appointmentId: string;
  patientId: string;
  patientMrn: string;
  doctorName: string;
  specialty: string;
  appointmentDate: string;
  appointmentTime: string;
  type: 'in-person' | 'telehealth';
  room?: string;
  title: string;
  instructions: string[];
  acknowledged: boolean;
  smsSent: boolean;
  emailSent: boolean;
  scheduledSendHoursBefore: number;
}

export interface HipaaAuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: 'VIEW_PHI' | 'EDIT_RECORD' | 'EXPORT_RECORD' | 'SCHEDULE_APPT' | 'BREAK_GLASS_ACCESS' | 'DECRYPT_MESSAGE' | 'LOGIN' | 'LOGOUT' | 'STATUS_CHANGE';
  targetMrn?: string;
  targetPatientName?: string;
  ipAddress: string;
  reason: string;
  encryptionChecksum: string;
}
