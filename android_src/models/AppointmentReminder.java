package com.careconnect.clinic.models;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class AppointmentReminder implements Serializable {
    private String id;
    private String appointmentId;
    private String patientId;
    private String patientMrn;
    private String doctorName;
    private String specialty;
    private String appointmentDate;
    private String appointmentTime;
    private String type; // in-person | telehealth
    private int hoursRemaining;
    private List<String> instructions;
    private boolean acknowledged;
    private boolean smsSent;
    private boolean emailSent;

    public AppointmentReminder() {
        this.instructions = new ArrayList<>();
    }

    public AppointmentReminder(String id, String appointmentId, String patientId, String patientMrn,
                               String doctorName, String specialty, String appointmentDate, String appointmentTime,
                               String type, int hoursRemaining) {
        this();
        this.id = id;
        this.appointmentId = appointmentId;
        this.patientId = patientId;
        this.patientMrn = patientMrn;
        this.doctorName = doctorName;
        this.specialty = specialty;
        this.appointmentDate = appointmentDate;
        this.appointmentTime = appointmentTime;
        this.type = type;
        this.hoursRemaining = hoursRemaining;
        this.acknowledged = false;
        this.smsSent = true;
        this.emailSent = true;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getAppointmentId() { return appointmentId; }
    public void setAppointmentId(String appointmentId) { this.appointmentId = appointmentId; }

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getPatientMrn() { return patientMrn; }
    public void setPatientMrn(String patientMrn) { this.patientMrn = patientMrn; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }

    public String getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(String appointmentDate) { this.appointmentDate = appointmentDate; }

    public String getAppointmentTime() { return appointmentTime; }
    public void setAppointmentTime(String appointmentTime) { this.appointmentTime = appointmentTime; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public int getHoursRemaining() { return hoursRemaining; }
    public void setHoursRemaining(int hoursRemaining) { this.hoursRemaining = hoursRemaining; }

    public List<String> getInstructions() { return instructions; }
    public void setInstructions(List<String> instructions) { this.instructions = instructions; }

    public boolean isAcknowledged() { return acknowledged; }
    public void setAcknowledged(boolean acknowledged) { this.acknowledged = acknowledged; }

    public boolean isSmsSent() { return smsSent; }
    public void setSmsSent(boolean smsSent) { this.smsSent = smsSent; }

    public boolean isEmailSent() { return emailSent; }
    public void setEmailSent(boolean emailSent) { this.emailSent = emailSent; }
}
