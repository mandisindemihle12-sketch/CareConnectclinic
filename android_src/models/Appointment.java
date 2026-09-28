package com.careconnect.clinic.models;

import java.io.Serializable;

public class Appointment implements Serializable {
    public enum Type {
        IN_PERSON,
        TELEHEALTH,
        FOLLOW_UP,
        URGENT
    }

    public enum Status {
        CONFIRMED,
        PENDING,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED
    }

    private String id;
    private String patientId;
    private String patientName;
    private String patientMrn;
    private String doctorId;
    private String doctorName;
    private String specialty;
    private String date; // YYYY-MM-DD
    private String time; // HH:mm
    private int durationMinutes;
    private Type type;
    private Status status;
    private String reason;
    private String roomNumber;
    private String notes;
    private boolean confirmedByPatient;

    public Appointment() {
        this.status = Status.CONFIRMED;
        this.durationMinutes = 30;
        this.type = Type.IN_PERSON;
    }

    public Appointment(String id, String patientId, String patientName, String patientMrn,
                       String doctorId, String doctorName, String specialty,
                       String date, String time, Type type, String reason) {
        this();
        this.id = id;
        this.patientId = patientId;
        this.patientName = patientName;
        this.patientMrn = patientMrn;
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.specialty = specialty;
        this.date = date;
        this.time = time;
        this.type = type;
        this.reason = reason;
        this.confirmedByPatient = false;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getPatientMrn() { return patientMrn; }
    public void setPatientMrn(String patientMrn) { this.patientMrn = patientMrn; }

    public String getDoctorId() { return doctorId; }
    public void setDoctorId(String doctorId) { this.doctorId = doctorId; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public int getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }

    public Type getType() { return type; }
    public void setType(Type type) { this.type = type; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public boolean isConfirmedByPatient() { return confirmedByPatient; }
    public void setConfirmedByPatient(boolean confirmedByPatient) { this.confirmedByPatient = confirmedByPatient; }
}
