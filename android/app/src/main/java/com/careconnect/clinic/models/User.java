package com.careconnect.clinic.models;

import java.io.Serializable;

public class User implements Serializable {
    public enum Role {
        PATIENT,
        DOCTOR,
        NURSE,
        ADMIN
    }

    private String id;
    private String name;
    private String email;
    private Role role;
    private String department;
    private String mrn; // Medical Record Number (for patients)
    private String title;

    public User() {
    }

    public User(String id, String name, String email, Role role, String department, String mrn, String title) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.department = department;
        this.mrn = mrn;
        this.title = title;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getMrn() {
        return mrn;
    }

    public void setMrn(String mrn) {
        this.mrn = mrn;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public boolean isPatient() {
        return role == Role.PATIENT;
    }

    public boolean isDoctor() {
        return role == Role.DOCTOR;
    }

    public boolean isAdmin() {
        return role == Role.ADMIN;
    }
}
