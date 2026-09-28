package com.careconnect.clinic.models;

import java.io.Serializable;

public class DoctorAvailability implements Serializable {
    public enum AvailabilityStatus {
        AVAILABLE,
        IN_CONSULTATION,
        IN_PROCEDURE,
        ON_BREAK,
        OFF_DUTY
    }

    private String id;
    private String doctorId;
    private String doctorName;
    private String specialty;
    private String department;
    private AvailabilityStatus status;
    private String nextAvailableSlot;
    private int activePatients;
    private String roomNumber;

    public DoctorAvailability() {
        this.status = AvailabilityStatus.AVAILABLE;
    }

    public DoctorAvailability(String id, String doctorId, String doctorName, String specialty,
                              String department, AvailabilityStatus status, String nextAvailableSlot,
                              int activePatients, String roomNumber) {
        this.id = id;
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.specialty = specialty;
        this.department = department;
        this.status = status;
        this.nextAvailableSlot = nextAvailableSlot;
        this.activePatients = activePatients;
        this.roomNumber = roomNumber;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDoctorId() { return doctorId; }
    public void setDoctorId(String doctorId) { this.doctorId = doctorId; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public AvailabilityStatus getStatus() { return status; }
    public void setStatus(AvailabilityStatus status) { this.status = status; }

    public String getNextAvailableSlot() { return nextAvailableSlot; }
    public void setNextAvailableSlot(String nextAvailableSlot) { this.nextAvailableSlot = nextAvailableSlot; }

    public int getActivePatients() { return activePatients; }
    public void setActivePatients(int activePatients) { this.activePatients = activePatients; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
}
