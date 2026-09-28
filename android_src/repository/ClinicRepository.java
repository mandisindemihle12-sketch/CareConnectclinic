package com.careconnect.clinic.repository;

import com.careconnect.clinic.models.Appointment;
import com.careconnect.clinic.models.AppointmentReminder;
import com.careconnect.clinic.models.DoctorAvailability;
import com.careconnect.clinic.models.EncryptedMessage;
import com.careconnect.clinic.models.HipaaAuditLog;
import com.careconnect.clinic.models.MedicalRecord;
import com.careconnect.clinic.models.Patient;
import com.careconnect.clinic.models.User;
import com.careconnect.clinic.security.CryptoManager;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

public class ClinicRepository {
    private static ClinicRepository instance;

    private final List<User> demoUsers = new ArrayList<>();
    private final List<Patient> patients = new ArrayList<>();
    private final List<Appointment> appointments = new ArrayList<>();
    private final List<AppointmentReminder> reminders = new ArrayList<>();
    private final List<MedicalRecord> medicalRecords = new ArrayList<>();
    private final List<DoctorAvailability> doctorAvailabilities = new ArrayList<>();
    private final List<EncryptedMessage> encryptedMessages = new ArrayList<>();
    private final List<HipaaAuditLog> auditLogs = new ArrayList<>();

    private ClinicRepository() {
        seedInitialData();
    }

    public static synchronized ClinicRepository getInstance() {
        if (instance == null) {
            instance = new ClinicRepository();
        }
        return instance;
    }

    private void seedInitialData() {
        // 1. Seed Users
        User patientUser = new User("usr_p1", "Maya Lin", "maya.lin@patient.careconnect.health",
                User.Role.PATIENT, "General Medicine", "MRN-882194", "Patient");
        User doctorUser = new User("usr_d1", "Dr. Elena Vance, MD", "e.vance@careconnect.health",
                User.Role.DOCTOR, "Internal Medicine", null, "Attending Physician");
        User nurseUser = new User("usr_n1", "Sarah Jenkins, RN", "s.jenkins@careconnect.health",
                User.Role.NURSE, "Emergency & Triage", null, "Triage Charge Nurse");
        User adminUser = new User("usr_a1", "David Sterling", "d.sterling@careconnect.health",
                User.Role.ADMIN, "Clinical Operations", null, "Lead Administrator");

        demoUsers.addAll(Arrays.asList(patientUser, doctorUser, nurseUser, adminUser));

        // 2. Seed Patients
        Patient p1 = new Patient("p1", "MRN-882194", "Maya", "Lin", "1988-04-12", "Female",
                "A+", "+1 (555) 234-5678", "maya.lin@patient.careconnect.health");
        p1.setAllergies(Arrays.asList("Penicillin (Severe)", "Latex"));
        p1.setActiveMedications(Arrays.asList("Lisinopril 10mg PO Daily", "Metformin 500mg BID"));
        p1.setBloodPressure("118/76 mmHg");
        p1.setHeartRate(72);
        p1.setTemperature(98.4);
        p1.setOxygenSaturation(99);
        p1.setStatus(Patient.ClinicStatus.WAITING);
        p1.setAssignedDoctor("Dr. Elena Vance, MD");
        p1.setRoomNumber("Exam Room 3B");

        Patient p2 = new Patient("p2", "MRN-739102", "Robert", "Kowalski", "1962-11-23", "Male",
                "O-", "+1 (555) 876-5432", "r.kowalski@email.com");
        p2.setAllergies(Arrays.asList("Sulfa Drugs", "Contrast Dye"));
        p2.setActiveMedications(Arrays.asList("Atorvastatin 20mg", "Amlodipine 5mg"));
        p2.setBloodPressure("134/86 mmHg");
        p2.setHeartRate(81);
        p2.setTemperature(98.7);
        p2.setOxygenSaturation(97);
        p2.setStatus(Patient.ClinicStatus.WITH_DOCTOR);
        p2.setAssignedDoctor("Dr. Marcus Chen, MD");
        p2.setRoomNumber("Room 101");

        Patient p3 = new Patient("p3", "MRN-994012", "Chloe", "Bennett", "1995-08-30", "Female",
                "B+", "+1 (555) 345-6789", "c.bennett@email.com");
        p3.setAllergies(Arrays.asList("None Known (NKDA)"));
        p3.setActiveMedications(Arrays.asList("Albuterol Inhaler PRN"));
        p3.setBloodPressure("112/72 mmHg");
        p3.setHeartRate(68);
        p3.setTemperature(98.2);
        p3.setOxygenSaturation(99);
        p3.setStatus(Patient.ClinicStatus.IN_TRIAGE);
        p3.setAssignedDoctor("Dr. Elena Vance, MD");
        p3.setRoomNumber("Triage Bay A");

        patients.addAll(Arrays.asList(p1, p2, p3));

        // 3. Seed Appointments
        Appointment a1 = new Appointment("apt_1", p1.getId(), p1.getFullName(), p1.getMrn(),
                doctorUser.getId(), doctorUser.getName(), "Internal Medicine",
                "Tomorrow", "09:30 AM", Appointment.Type.IN_PERSON, "Comprehensive Annual Physical & Lab Review");
        a1.setRoomNumber("Exam Room 3B");
        a1.setConfirmedByPatient(true);

        Appointment a2 = new Appointment("apt_2", p1.getId(), p1.getFullName(), p1.getMrn(),
                doctorUser.getId(), doctorUser.getName(), "Cardiology Follow-Up",
                "Oct 05, 2026", "02:00 PM", Appointment.Type.TELEHEALTH, "Hypertension & Vitals Telehealth Consult");
        a2.setConfirmedByPatient(false);

        appointments.addAll(Arrays.asList(a1, a2));

        // 4. Seed Reminders
        AppointmentReminder r1 = new AppointmentReminder("rem_1", a1.getId(), p1.getId(), p1.getMrn(),
                doctorUser.getName(), "Internal Medicine", "Tomorrow", "09:30 AM", "in-person", 18);
        r1.setInstructions(Arrays.asList(
                "Fasting required for 8 hours prior to lipid panel",
                "Bring current medication bottles and photo ID",
                "Arrive 10 minutes early for check-in and vitals"
        ));
        r1.setAcknowledged(false);
        r1.setSmsSent(true);
        r1.setEmailSent(true);

        AppointmentReminder r2 = new AppointmentReminder("rem_2", a2.getId(), p1.getId(), p1.getMrn(),
                "Dr. Marcus Chen, MD", "Cardiology", "Oct 05, 2026", "02:00 PM", "telehealth", 168);
        r2.setInstructions(Arrays.asList(
                "Ensure quiet room and stable internet connection",
                "Have your recent home blood pressure readings ready"
        ));
        reminders.addAll(Arrays.asList(r1, r2));

        // 5. Seed Medical Records (EHR)
        MedicalRecord mr1 = new MedicalRecord("ehr_1", p1.getId(), p1.getMrn(), "2026-08-15",
                "Comprehensive Consultation", doctorUser.getName(), "Internal Medicine",
                "Essential Primary Hypertension, Well Controlled (ICD-10 I10)",
                "S: Patient presents for routine monitoring. Reports good medication compliance.\n" +
                "O: BP 118/76, HR 72, BMI 23.4. Heart regular rate and rhythm.\n" +
                "A: Hypertension stable on Lisinopril 10mg daily.\n" +
                "P: Continue current regimen. Repeat CMP and Lipid Panel in 6 months.");
        mr1.setPrescriptions(Arrays.asList("Lisinopril 10mg - 1 tab PO daily (Refills: 3)"));
        mr1.setVitalsSummary("BP 118/76 | HR 72 bpm | SpO2 99%");

        MedicalRecord mr2 = new MedicalRecord("ehr_2", p1.getId(), p1.getMrn(), "2026-05-10",
                "Diagnostic Cardiology ECG", "Dr. Marcus Chen, MD", "Cardiology",
                "Normal Sinus Rhythm, No ST Changes",
                "Standard 12-lead ECG demonstrated normal intervals. PR: 154ms, QRS: 88ms, QTc: 412ms.");
        mr2.setVitalsSummary("BP 122/80 | HR 68 bpm");

        medicalRecords.addAll(Arrays.asList(mr1, mr2));

        // 6. Seed Doctor Availability
        DoctorAvailability doc1 = new DoctorAvailability("da_1", doctorUser.getId(), doctorUser.getName(),
                "Internal Medicine", "Outpatient Clinic", DoctorAvailability.AvailabilityStatus.AVAILABLE,
                "09:30 AM", 4, "Room 3B");
        DoctorAvailability doc2 = new DoctorAvailability("da_2", "doc_marcus", "Dr. Marcus Chen, MD",
                "Cardiology", "Cardiovascular Suite", DoctorAvailability.AvailabilityStatus.IN_CONSULTATION,
                "11:15 AM", 6, "Suite 410");
        DoctorAvailability doc3 = new DoctorAvailability("da_3", "doc_sarah_ped", "Dr. Sarah Al-Mansoor, MD",
                "Pediatrics", "Pediatric Wing", DoctorAvailability.AvailabilityStatus.AVAILABLE,
                "10:00 AM", 2, "Room 12A");
        doctorAvailabilities.addAll(Arrays.asList(doc1, doc2, doc3));

        // 7. Seed Encrypted Messages
        CryptoManager crypto = CryptoManager.getInstance();
        CryptoManager.EncryptedResult enc1 = crypto.encrypt("Patient Maya Lin arrived for vitals check in triage bay. BP stable at 118/76.");
        EncryptedMessage msg1 = new EncryptedMessage("msg_1", "ch_triage", nurseUser.getId(), nurseUser.getName(),
                "Triage Nurse", doctorUser.getId(), doctorUser.getName(), "Patient Maya Lin arrived for vitals check in triage bay. BP stable at 118/76.");
        msg1.setEncryptedCiphertext(enc1.ciphertextBase64);
        msg1.setIv(enc1.ivBase64);

        CryptoManager.EncryptedResult enc2 = crypto.encrypt("Understood Sarah. I am finishing the consultation in Room 3B and will see her in 5 minutes.");
        EncryptedMessage msg2 = new EncryptedMessage("msg_2", "ch_triage", doctorUser.getId(), doctorUser.getName(),
                "Attending Physician", nurseUser.getId(), nurseUser.getName(), "Understood Sarah. I am finishing the consultation in Room 3B and will see her in 5 minutes.");
        msg2.setEncryptedCiphertext(enc2.ciphertextBase64);
        msg2.setIv(enc2.ivBase64);

        encryptedMessages.addAll(Arrays.asList(msg1, msg2));

        // 8. Seed HIPAA Audit Logs
        logHipaaAction("AUTH_INIT", "SECURITY", "SYSTEM", "CareConnect Mobile Enclave initialized with AES-256 GCM encryption", "SYSTEM", "N/A");
        logHipaaAction("LOGIN_SUCCESS", "AUTH", patientUser.getId(), "Patient authenticated successfully via 2FA", patientUser.getName(), p1.getMrn());
        logHipaaAction("EHR_ACCESS", "PATIENT_RECORD", mr1.getId(), "Clinical record accessed by authorized attending provider", doctorUser.getName(), p1.getMrn());
    }

    public synchronized void logHipaaAction(String action, String resourceType, String resourceId,
                                            String details, String actorName, String patientMrn) {
        String id = "LOG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        long timestamp = System.currentTimeMillis();
        String rawData = id + "|" + timestamp + "|" + action + "|" + resourceType + "|" + resourceId + "|" + details;
        String checksum = CryptoManager.computeSha256(rawData);

        HipaaAuditLog log = new HipaaAuditLog(id, "ACTOR", actorName, "CLINICAL", action,
                resourceType, resourceId, patientMrn, details, checksum);
        auditLogs.add(0, log);
    }

    // Getters and Mutators
    public List<User> getDemoUsers() { return demoUsers; }
    public List<Patient> getPatients() { return patients; }
    public List<Appointment> getAppointments() { return appointments; }
    public List<AppointmentReminder> getReminders() { return reminders; }
    public List<MedicalRecord> getMedicalRecords() { return medicalRecords; }
    public List<DoctorAvailability> getDoctorAvailabilities() { return doctorAvailabilities; }
    public List<EncryptedMessage> getEncryptedMessages() { return encryptedMessages; }
    public List<HipaaAuditLog> getAuditLogs() { return auditLogs; }

    public void addAppointment(Appointment appointment) {
        appointments.add(0, appointment);
        logHipaaAction("CREATE_APPOINTMENT", "APPOINTMENT", appointment.getId(),
                "New appointment booked for " + appointment.getDate() + " at " + appointment.getTime(),
                appointment.getPatientName(), appointment.getPatientMrn());
    }

    public void addPatient(Patient patient) {
        patients.add(patient);
        logHipaaAction("REGISTER_PATIENT", "PATIENT_PROFILE", patient.getId(),
                "New patient enrolled: " + patient.getFullName() + ", MRN: " + patient.getMrn(),
                patient.getFullName(), patient.getMrn());
    }

    public void addEncryptedMessage(EncryptedMessage message) {
        encryptedMessages.add(message);
        logHipaaAction("SECURE_MSG_SENT", "CONSULTATION_MESSAGE", message.getId(),
                "Encrypted message sent via channel " + message.getChannelId(),
                message.getSenderName(), "N/A");
    }

    public void acknowledgeReminder(String reminderId) {
        for (AppointmentReminder r : reminders) {
            if (r.getId().equals(reminderId)) {
                r.setAcknowledged(true);
                logHipaaAction("CONFIRM_ATTENDANCE", "REMINDER", reminderId,
                        "Patient confirmed attendance for " + r.getAppointmentDate(),
                        "Maya Lin", r.getPatientMrn());
                break;
            }
        }
    }
}
