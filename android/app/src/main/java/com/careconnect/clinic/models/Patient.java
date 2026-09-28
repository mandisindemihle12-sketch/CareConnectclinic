package com.careconnect.clinic.models;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class Patient implements Serializable {
    public enum ClinicStatus {
        WAITING,
        IN_TRIAGE,
        WITH_DOCTOR,
        LAB_IMAGING,
        DISCHARGED
    }

    private String id;
    private String mrn;
    private String firstName;
    private String lastName;
    private String dob;
    private String gender;
    private String bloodType;
    private String phone;
    private String email;
    private List<String> allergies;
    private List<String> activeMedications;
    private String bloodPressure;
    private int heartRate;
    private double temperature;
    private int oxygenSaturation;
    private ClinicStatus status;
    private String assignedDoctor;
    private String roomNumber;
    private long checkInTime;

    public Patient() {
        this.allergies = new ArrayList<>();
        this.activeMedications = new ArrayList<>();
        this.status = ClinicStatus.WAITING;
    }

    public Patient(String id, String mrn, String firstName, String lastName, String dob, String gender,
                   String bloodType, String phone, String email) {
        this();
        this.id = id;
        this.mrn = mrn;
        this.firstName = firstName;
        this.lastName = lastName;
        this.dob = dob;
        this.gender = gender;
        this.bloodType = bloodType;
        this.phone = phone;
        this.email = email;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getMrn() { return mrn; }
    public void setMrn(String mrn) { this.mrn = mrn; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getFullName() { return firstName + " " + lastName; }

    public String getDob() { return dob; }
    public void setDob(String dob) { this.dob = dob; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getBloodType() { return bloodType; }
    public void setBloodType(String bloodType) { this.bloodType = bloodType; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public List<String> getAllergies() { return allergies; }
    public void setAllergies(List<String> allergies) { this.allergies = allergies; }

    public List<String> getActiveMedications() { return activeMedications; }
    public void setActiveMedications(List<String> activeMedications) { this.activeMedications = activeMedications; }

    public String getBloodPressure() { return bloodPressure; }
    public void setBloodPressure(String bloodPressure) { this.bloodPressure = bloodPressure; }

    public int getHeartRate() { return heartRate; }
    public void setHeartRate(int heartRate) { this.heartRate = heartRate; }

    public double getTemperature() { return temperature; }
    public void setTemperature(double temperature) { this.temperature = temperature; }

    public int getOxygenSaturation() { return oxygenSaturation; }
    public void setOxygenSaturation(int oxygenSaturation) { this.oxygenSaturation = oxygenSaturation; }

    public ClinicStatus getStatus() { return status; }
    public void setStatus(ClinicStatus status) { this.status = status; }

    public String getAssignedDoctor() { return assignedDoctor; }
    public void setAssignedDoctor(String assignedDoctor) { this.assignedDoctor = assignedDoctor; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public long getCheckInTime() { return checkInTime; }
    public void setCheckInTime(long checkInTime) { this.checkInTime = checkInTime; }
}
