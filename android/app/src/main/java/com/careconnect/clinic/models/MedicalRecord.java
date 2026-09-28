package com.careconnect.clinic.models;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class MedicalRecord implements Serializable {
    private String id;
    private String patientId;
    private String patientMrn;
    private String date;
    private String type; // Consultation, Lab Results, Imaging, Cardiology, Follow-Up
    private String doctorName;
    private String department;
    private String diagnosis;
    private String clinicalNotes; // SOAP notes
    private List<String> prescriptions;
    private String vitalsSummary;
    private boolean isConfidential;
    private boolean breakGlassUnlocked;

    public MedicalRecord() {
        this.prescriptions = new ArrayList<>();
    }

    public MedicalRecord(String id, String patientId, String patientMrn, String date, String type,
                         String doctorName, String department, String diagnosis, String clinicalNotes) {
        this();
        this.id = id;
        this.patientId = patientId;
        this.patientMrn = patientMrn;
        this.date = date;
        this.type = type;
        this.doctorName = doctorName;
        this.department = department;
        this.diagnosis = diagnosis;
        this.clinicalNotes = clinicalNotes;
        this.isConfidential = false;
        this.breakGlassUnlocked = false;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getPatientMrn() { return patientMrn; }
    public void setPatientMrn(String patientMrn) { this.patientMrn = patientMrn; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }

    public String getClinicalNotes() { return clinicalNotes; }
    public void setClinicalNotes(String clinicalNotes) { this.clinicalNotes = clinicalNotes; }

    public List<String> getPrescriptions() { return prescriptions; }
    public void setPrescriptions(List<String> prescriptions) { this.prescriptions = prescriptions; }

    public String getVitalsSummary() { return vitalsSummary; }
    public void setVitalsSummary(String vitalsSummary) { this.vitalsSummary = vitalsSummary; }

    public boolean isConfidential() { return isConfidential; }
    public void setConfidential(boolean confidential) { isConfidential = confidential; }

    public boolean isBreakGlassUnlocked() { return breakGlassUnlocked; }
    public void setBreakGlassUnlocked(boolean breakGlassUnlocked) { this.breakGlassUnlocked = breakGlassUnlocked; }
}
