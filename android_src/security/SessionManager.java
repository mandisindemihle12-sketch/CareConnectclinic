package com.careconnect.clinic.security;

import android.content.Context;
import com.careconnect.clinic.models.User;

public class SessionManager {
    private static SessionManager instance;
    private User currentUser;
    private boolean isPrivacyMasked = false;
    private boolean isLocked = false;
    private long lastInteractionTime = System.currentTimeMillis();
    private static final long INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 mins HIPAA timeout

    private SessionManager() {
    }

    public static synchronized SessionManager getInstance() {
        if (instance == null) {
            instance = new SessionManager();
        }
        return instance;
    }

    public void setCurrentUser(User user) {
        this.currentUser = user;
        this.lastInteractionTime = System.currentTimeMillis();
        this.isLocked = false;
    }

    public User getCurrentUser() {
        return currentUser;
    }

    public boolean isLoggedIn() {
        return currentUser != null;
    }

    public void logout() {
        this.currentUser = null;
        this.isLocked = false;
    }

    public boolean isPrivacyMasked() {
        return isPrivacyMasked;
    }

    public void setPrivacyMasked(boolean privacyMasked) {
        isPrivacyMasked = privacyMasked;
    }

    public void togglePrivacyMask() {
        this.isPrivacyMasked = !this.isPrivacyMasked;
    }

    public boolean isLocked() {
        return isLocked;
    }

    public void setLocked(boolean locked) {
        isLocked = locked;
    }

    public void touchActivity() {
        this.lastInteractionTime = System.currentTimeMillis();
    }

    public boolean checkInactivityTimeout() {
        if (System.currentTimeMillis() - lastInteractionTime > INACTIVITY_TIMEOUT_MS) {
            this.isLocked = true;
            return true;
        }
        return false;
    }
}
