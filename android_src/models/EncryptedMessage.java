package com.careconnect.clinic.models;

import java.io.Serializable;

public class EncryptedMessage implements Serializable {
    private String id;
    private String channelId;
    private String senderId;
    private String senderName;
    private String senderRole;
    private String recipientId;
    private String recipientName;
    private String encryptedCiphertext; // Base64 AES-256-GCM ciphertext
    private String iv;                  // Base64 Initialization Vector
    private String authTag;             // Base64 Authentication Tag
    private String decryptedContent;    // Plaintext in memory when unlocked in enclave
    private long timestamp;
    private boolean isEncrypted;
    private String messageType;         // text, vital_alert, consultation_referral

    public EncryptedMessage() {
        this.isEncrypted = true;
        this.timestamp = System.currentTimeMillis();
        this.messageType = "text";
    }

    public EncryptedMessage(String id, String channelId, String senderId, String senderName,
                            String senderRole, String recipientId, String recipientName,
                            String decryptedContent) {
        this();
        this.id = id;
        this.channelId = channelId;
        this.senderId = senderId;
        this.senderName = senderName;
        this.senderRole = senderRole;
        this.recipientId = recipientId;
        this.recipientName = recipientName;
        this.decryptedContent = decryptedContent;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getChannelId() { return channelId; }
    public void setChannelId(String channelId) { this.channelId = channelId; }

    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getSenderRole() { return senderRole; }
    public void setSenderRole(String senderRole) { this.senderRole = senderRole; }

    public String getRecipientId() { return recipientId; }
    public void setRecipientId(String recipientId) { this.recipientId = recipientId; }

    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }

    public String getEncryptedCiphertext() { return encryptedCiphertext; }
    public void setEncryptedCiphertext(String encryptedCiphertext) { this.encryptedCiphertext = encryptedCiphertext; }

    public String getIv() { return iv; }
    public void setIv(String iv) { this.iv = iv; }

    public String getAuthTag() { return authTag; }
    public void setAuthTag(String authTag) { this.authTag = authTag; }

    public String getDecryptedContent() { return decryptedContent; }
    public void setDecryptedContent(String decryptedContent) { this.decryptedContent = decryptedContent; }

    public long getTimestamp() { return timestamp; }
    public void setTimestamp(long timestamp) { this.timestamp = timestamp; }

    public boolean isEncrypted() { return isEncrypted; }
    public void setEncrypted(boolean encrypted) { isEncrypted = encrypted; }

    public String getMessageType() { return messageType; }
    public void setMessageType(String messageType) { this.messageType = messageType; }
}
