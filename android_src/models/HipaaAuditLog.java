package com.careconnect.clinic.models;

import java.io.Serializable;

public class HipaaAuditLog implements Serializable {
    private String id;
    private long timestamp;
    private String actorId;
    private String actorName;
    private String actorRole;
    private String action; // E.g., VIEW_PHI, EXPORT_RECORD, BREAK_GLASS_OVERRIDE, CREATE_APPOINTMENT
    private String resourceType; // PATIENT_RECORD, APPOINTMENT, MESSAGING
    private String resourceId;
    private String patientMrn;
    private String details;
    private String ipAddress;
    private String sha256Checksum;

    public HipaaAuditLog() {
        this.timestamp = System.currentTimeMillis();
        this.ipAddress = "10.0.2.15 (Clinical Enclave)";
    }

    public HipaaAuditLog(String id, String actorId, String actorName, String actorRole,
                         String action, String resourceType, String resourceId,
                         String patientMrn, String details, String sha256Checksum) {
        this();
        this.id = id;
        this.actorId = actorId;
        this.actorName = actorName;
        this.actorRole = actorRole;
        this.action = action;
        this.resourceType = resourceType;
        this.resourceId = resourceId;
        this.patientMrn = patientMrn;
        this.details = details;
        this.sha256Checksum = sha256Checksum;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public long getTimestamp() { return timestamp; }
    public void setTimestamp(long timestamp) { this.timestamp = timestamp; }

    public String getActorId() { return actorId; }
    public void setActorId(String actorId) { this.actorId = actorId; }

    public String getActorName() { return actorName; }
    public void setActorName(String actorName) { this.actorName = actorName; }

    public String getActorRole() { return actorRole; }
    public void setActorRole(String actorRole) { this.actorRole = actorRole; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getResourceType() { return resourceType; }
    public void setResourceType(String resourceType) { this.resourceType = resourceType; }

    public String getResourceId() { return resourceId; }
    public void setResourceId(String resourceId) { this.resourceId = resourceId; }

    public String getPatientMrn() { return patientMrn; }
    public void setPatientMrn(String patientMrn) { this.patientMrn = patientMrn; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getSha256Checksum() { return sha256Checksum; }
    public void setSha256Checksum(String sha256Checksum) { this.sha256Checksum = sha256Checksum; }
}
