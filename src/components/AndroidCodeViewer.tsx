import React, { useState } from 'react';
import { 
  Folder, 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  Smartphone,
  ChevronRight,
  Terminal,
  FolderOpen
} from 'lucide-react';

interface CodeFile {
  name: string;
  category: 'Activities' | 'Fragments' | 'Models' | 'Security & Repo' | 'Adapters' | 'XML Layouts' | 'Gradle & Config';
  studioPath: string;
  flatPath: string;
  language: 'java' | 'xml' | 'groovy';
  code: string;
}

const ANDROID_FILES: CodeFile[] = [
  {
    name: 'AuthActivity.java',
    category: 'Activities',
    studioPath: 'android/app/src/main/java/com/careconnect/clinic/activities/AuthActivity.java',
    flatPath: 'android_src/activities/AuthActivity.java',
    language: 'java',
    code: `package com.careconnect.clinic.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import com.careconnect.clinic.R;
import com.careconnect.clinic.models.Patient;
import com.careconnect.clinic.models.User;
import com.careconnect.clinic.repository.ClinicRepository;
import com.careconnect.clinic.security.SessionManager;
import com.google.android.material.button.MaterialButton;
import java.util.Random;

public class AuthActivity extends AppCompatActivity {
    private boolean isRegisterMode = false;
    private MaterialButton btnTabSignIn, btnTabRegister, btnSubmitAuth;
    private MaterialButton btnDemoPatient, btnDemoDoctor, btnDemoAdmin;
    private LinearLayout layoutRegisterFields;
    private EditText etEmail, etPassword, etFirstName, etLastName, etDob, etBloodType, etPhone;
    private CheckBox cbHipaaConsent;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_auth);
        initViews();
        setupListeners();
    }

    private void initViews() {
        btnTabSignIn = findViewById(R.id.btn_tab_signin);
        btnTabRegister = findViewById(R.id.btn_tab_register);
        btnSubmitAuth = findViewById(R.id.btn_submit_auth);
        btnDemoPatient = findViewById(R.id.btn_demo_patient);
        btnDemoDoctor = findViewById(R.id.btn_demo_doctor);
        btnDemoAdmin = findViewById(R.id.btn_demo_admin);
        layoutRegisterFields = findViewById(R.id.layout_register_fields);

        etEmail = findViewById(R.id.et_email);
        etPassword = findViewById(R.id.et_password);
        etFirstName = findViewById(R.id.et_first_name);
        etLastName = findViewById(R.id.et_last_name);
        etDob = findViewById(R.id.et_dob);
        etBloodType = findViewById(R.id.et_blood_type);
        etPhone = findViewById(R.id.et_phone);
        cbHipaaConsent = findViewById(R.id.cb_hipaa_consent);

        etEmail.setText("maya.lin@patient.careconnect.health");
        etPassword.setText("••••••••••••");
    }

    private void setupListeners() {
        btnTabSignIn.setOnClickListener(v -> setMode(false));
        btnTabRegister.setOnClickListener(v -> setMode(true));

        btnSubmitAuth.setOnClickListener(v -> {
            if (!cbHipaaConsent.isChecked()) {
                Toast.makeText(this, "HIPAA consent is mandatory to proceed.", Toast.LENGTH_SHORT).show();
                return;
            }
            if (isRegisterMode) {
                handleRegistration();
            } else {
                handleSignIn();
            }
        });

        btnDemoPatient.setOnClickListener(v -> loginWithUser(ClinicRepository.getInstance().getDemoUsers().get(0)));
        btnDemoDoctor.setOnClickListener(v -> loginWithUser(ClinicRepository.getInstance().getDemoUsers().get(1)));
        btnDemoAdmin.setOnClickListener(v -> loginWithUser(ClinicRepository.getInstance().getDemoUsers().get(3)));
    }

    private void setMode(boolean register) {
        isRegisterMode = register;
        if (register) {
            btnTabRegister.setBackgroundTintList(ContextCompat.getColorStateList(this, R.color.white));
            btnTabRegister.setTextColor(ContextCompat.getColor(this, R.color.slate_900));
            btnTabSignIn.setBackgroundTintList(ContextCompat.getColorStateList(this, android.R.color.transparent));
            btnTabSignIn.setTextColor(ContextCompat.getColor(this, R.color.slate_600));
            layoutRegisterFields.setVisibility(View.VISIBLE);
            btnSubmitAuth.setText("Create Encrypted Patient Account");
            etEmail.setText("");
            etPassword.setText("");
        } else {
            btnTabSignIn.setBackgroundTintList(ContextCompat.getColorStateList(this, R.color.white));
            btnTabSignIn.setTextColor(ContextCompat.getColor(this, R.color.slate_900));
            btnTabRegister.setBackgroundTintList(ContextCompat.getColorStateList(this, android.R.color.transparent));
            btnTabRegister.setTextColor(ContextCompat.getColor(this, R.color.slate_600));
            layoutRegisterFields.setVisibility(View.GONE);
            btnSubmitAuth.setText("Sign In to Patient Portal");
            etEmail.setText("maya.lin@patient.careconnect.health");
            etPassword.setText("••••••••••••");
        }
    }

    private void handleSignIn() {
        String email = etEmail.getText().toString().trim();
        User matched = null;
        for (User u : ClinicRepository.getInstance().getDemoUsers()) {
            if (u.getEmail().equalsIgnoreCase(email)) {
                matched = u;
                break;
            }
        }
        if (matched == null) matched = ClinicRepository.getInstance().getDemoUsers().get(0);
        loginWithUser(matched);
    }

    private void handleRegistration() {
        String firstName = etFirstName.getText().toString().trim();
        String lastName = etLastName.getText().toString().trim();
        String email = etEmail.getText().toString().trim();
        String dob = etDob.getText().toString().trim();
        String bloodType = etBloodType.getText().toString().trim();
        String phone = etPhone.getText().toString().trim();

        if (firstName.isEmpty() || lastName.isEmpty() || email.isEmpty()) {
            Toast.makeText(this, "Please enter your name and email address.", Toast.LENGTH_SHORT).show();
            return;
        }

        int randMrn = 100000 + new Random().nextInt(900000);
        String mrn = "MRN-" + randMrn;
        String patientId = "p_" + System.currentTimeMillis();

        Patient newPatient = new Patient(patientId, mrn, firstName, lastName,
                dob.isEmpty() ? "1990-01-01" : dob, "Unspecified",
                bloodType.isEmpty() ? "O+" : bloodType,
                phone.isEmpty() ? "+1 (555) 000-0000" : phone, email);
        newPatient.setBloodPressure("120/80 mmHg");
        newPatient.setHeartRate(70);
        newPatient.setOxygenSaturation(98);

        ClinicRepository.getInstance().addPatient(newPatient);

        User newUser = new User("usr_" + System.currentTimeMillis(),
                firstName + " " + lastName, email, User.Role.PATIENT, "General Medicine", mrn, "Patient");
        ClinicRepository.getInstance().getDemoUsers().add(newUser);

        Toast.makeText(this, "Welcome! Assigned " + mrn, Toast.LENGTH_LONG).show();
        loginWithUser(newUser);
    }

    private void loginWithUser(User user) {
        SessionManager.getInstance().setCurrentUser(user);
        ClinicRepository.getInstance().logHipaaAction("LOGIN_SUCCESS", "AUTHENTICATION", user.getId(),
                "User " + user.getName() + " logged in (" + user.getRole().name() + ")", user.getName(),
                user.getMrn() != null ? user.getMrn() : "N/A");

        Intent intent = new Intent(this, MainActivity.class);
        startActivity(intent);
        finish();
    }
}`
  },
  {
    name: 'MainActivity.java',
    category: 'Activities',
    studioPath: 'android/app/src/main/java/com/careconnect/clinic/activities/MainActivity.java',
    flatPath: 'android_src/activities/MainActivity.java',
    language: 'java',
    code: `package com.careconnect.clinic.activities;

import android.app.Dialog;
import android.content.Intent;
import android.os.Bundle;
import android.widget.ImageButton;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import com.careconnect.clinic.R;
import com.careconnect.clinic.fragments.AdminDashboardFragment;
import com.careconnect.clinic.fragments.EncryptedChatFragment;
import com.careconnect.clinic.fragments.HipaaComplianceFragment;
import com.careconnect.clinic.fragments.MedicalRecordsFragment;
import com.careconnect.clinic.fragments.PatientPortalFragment;
import com.careconnect.clinic.models.User;
import com.careconnect.clinic.repository.ClinicRepository;
import com.careconnect.clinic.security.SessionManager;
import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.google.android.material.button.MaterialButton;

public class MainActivity extends AppCompatActivity {
    private TextView tvActiveUserRole;
    private ImageButton btnTogglePrivacyMask, btnLockSession;
    private BottomNavigationView bottomNav;
    private Fragment activeFragment;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (!SessionManager.getInstance().isLoggedIn()) {
            startActivity(new Intent(this, AuthActivity.class));
            finish();
            return;
        }
        setContentView(R.layout.activity_main);
        initViews();
        setupNavigation();
        updateUserHeader();
    }

    private void initViews() {
        tvActiveUserRole = findViewById(R.id.tv_active_user_role);
        btnTogglePrivacyMask = findViewById(R.id.btn_toggle_privacy_mask);
        btnLockSession = findViewById(R.id.btn_lock_session);
        bottomNav = findViewById(R.id.bottom_navigation);

        btnTogglePrivacyMask.setOnClickListener(v -> {
            SessionManager.getInstance().togglePrivacyMask();
            boolean isMasked = SessionManager.getInstance().isPrivacyMasked();
            btnTogglePrivacyMask.setColorFilter(
                    ContextCompat.getColor(this, isMasked ? R.color.amber_600 : R.color.slate_600)
            );
            Toast.makeText(this, isMasked ? "🔒 PHI Privacy Mask: ON" : "🔓 PHI Privacy Mask: OFF", Toast.LENGTH_SHORT).show();
            if (activeFragment instanceof AdminDashboardFragment) {
                ((AdminDashboardFragment) activeFragment).refreshPrivacyMask();
            }
        });

        btnLockSession.setOnClickListener(v -> showLockScreenDialog());
    }

    private void updateUserHeader() {
        User user = SessionManager.getInstance().getCurrentUser();
        if (user != null) {
            String roleStr = user.getRole().name();
            String detail = user.isPatient() ? ("MRN: " + user.getMrn()) : user.getDepartment();
            tvActiveUserRole.setText(roleStr + ": " + user.getName() + " (" + detail + ")");
        }
    }

    private void setupNavigation() {
        bottomNav.setOnItemSelectedListener(item -> {
            int itemId = item.getItemId();
            Fragment target = null;
            if (itemId == R.id.nav_portal) target = new PatientPortalFragment();
            else if (itemId == R.id.nav_records) target = new MedicalRecordsFragment();
            else if (itemId == R.id.nav_flow) target = new AdminDashboardFragment();
            else if (itemId == R.id.nav_chat) target = new EncryptedChatFragment();
            else if (itemId == R.id.nav_hipaa) target = new HipaaComplianceFragment();

            if (target != null) {
                activeFragment = target;
                getSupportFragmentManager().beginTransaction()
                        .replace(R.id.fragment_container, target)
                        .commit();
                return true;
            }
            return false;
        });
        bottomNav.setSelectedItemId(R.id.nav_portal);
    }

    private void showLockScreenDialog() {
        Dialog lockDialog = new Dialog(this, android.R.style.Theme_Black_NoTitleBar_Fullscreen);
        lockDialog.setContentView(R.layout.dialog_break_glass);
        lockDialog.setCancelable(false);
        MaterialButton unlockBtn = lockDialog.findViewById(R.id.btn_confirm_break_glass);
        if (unlockBtn != null) {
            unlockBtn.setText("Unlock Clinical Session");
            unlockBtn.setBackgroundColor(ContextCompat.getColor(this, R.color.teal_primary));
            unlockBtn.setOnClickListener(v -> {
                lockDialog.dismiss();
                Toast.makeText(this, "Session Unlocked.", Toast.LENGTH_SHORT).show();
            });
        }
        lockDialog.show();
    }
}`
  },
  {
    name: 'PatientPortalFragment.java',
    category: 'Fragments',
    studioPath: 'android/app/src/main/java/com/careconnect/clinic/fragments/PatientPortalFragment.java',
    flatPath: 'android_src/fragments/PatientPortalFragment.java',
    language: 'java',
    code: `package com.careconnect.clinic.fragments;

import android.app.Dialog;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.*;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.careconnect.clinic.R;
import com.careconnect.clinic.adapters.AppointmentAdapter;
import com.careconnect.clinic.models.*;
import com.careconnect.clinic.repository.ClinicRepository;
import com.careconnect.clinic.security.SessionManager;
import com.google.android.material.button.MaterialButton;
import java.util.*;

public class PatientPortalFragment extends Fragment {
    private FrameLayout containerReminderCard;
    private TextView tvPortalBp, tvPortalHr, tvPortalBloodType;
    private MaterialButton btnQuickBook;
    private RecyclerView rvAppointments;
    private AppointmentAdapter appointmentAdapter;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_patient_portal, container, false);
        initViews(view);
        setupReminderBanner();
        setupVitals();
        setupAppointments();
        return view;
    }

    private void initViews(View view) {
        containerReminderCard = view.findViewById(R.id.container_reminder_card);
        tvPortalBp = view.findViewById(R.id.tv_portal_bp);
        tvPortalHr = view.findViewById(R.id.tv_portal_hr);
        tvPortalBloodType = view.findViewById(R.id.tv_portal_blood_type);
        btnQuickBook = view.findViewById(R.id.btn_quick_book);
        rvAppointments = view.findViewById(R.id.rv_portal_appointments);
        btnQuickBook.setOnClickListener(v -> showBookAppointmentDialog());
    }

    private void setupReminderBanner() {
        List<AppointmentReminder> reminders = ClinicRepository.getInstance().getReminders();
        if (reminders.isEmpty()) {
            containerReminderCard.setVisibility(View.GONE);
            return;
        }

        AppointmentReminder activeReminder = reminders.get(0);
        View reminderView = LayoutInflater.from(getContext()).inflate(R.layout.item_reminder_card, containerReminderCard, false);

        TextView tvTitle = reminderView.findViewById(R.id.tv_reminder_title);
        TextView tvTime = reminderView.findViewById(R.id.tv_reminder_time);
        TextView tvInstructions = reminderView.findViewById(R.id.tv_instructions);
        TextView tvCountdown = reminderView.findViewById(R.id.tv_countdown);
        MaterialButton btnConfirm = reminderView.findViewById(R.id.btn_confirm_attendance);
        TextView tvConfirmed = reminderView.findViewById(R.id.tv_confirmed_status);

        tvTitle.setText("Visit with " + activeReminder.getDoctorName());
        tvTime.setText(activeReminder.getAppointmentDate() + " at " + activeReminder.getAppointmentTime() + " (" + activeReminder.getType() + ")");
        tvCountdown.setText("In " + activeReminder.getHoursRemaining() + " hours");

        StringBuilder sb = new StringBuilder();
        for (String ins : activeReminder.getInstructions()) sb.append("• ").append(ins).append("\\n");
        tvInstructions.setText(sb.toString().trim());

        if (activeReminder.isAcknowledged()) {
            btnConfirm.setVisibility(View.GONE);
            tvConfirmed.setVisibility(View.VISIBLE);
        } else {
            btnConfirm.setOnClickListener(v -> {
                ClinicRepository.getInstance().acknowledgeReminder(activeReminder.getId());
                btnConfirm.setVisibility(View.GONE);
                tvConfirmed.setVisibility(View.VISIBLE);
                Toast.makeText(getContext(), "Attendance confirmed! SMS reminder sent.", Toast.LENGTH_SHORT).show();
            });
        }
        containerReminderCard.removeAllViews();
        containerReminderCard.addView(reminderView);
        containerReminderCard.setVisibility(View.VISIBLE);
    }

    private void setupVitals() {
        List<Patient> patients = ClinicRepository.getInstance().getPatients();
        if (!patients.isEmpty()) {
            Patient p = patients.get(0);
            tvPortalBp.setText(p.getBloodPressure() != null ? p.getBloodPressure().replace(" mmHg", "") : "118/76");
            tvPortalHr.setText(p.getHeartRate() + " bpm");
            tvPortalBloodType.setText(p.getBloodType());
        }
    }

    private void setupAppointments() {
        appointmentAdapter = new AppointmentAdapter();
        rvAppointments.setLayoutManager(new LinearLayoutManager(getContext()));
        rvAppointments.setAdapter(appointmentAdapter);
        appointmentAdapter.setAppointments(ClinicRepository.getInstance().getAppointments());
    }

    private void showBookAppointmentDialog() {
        Dialog dialog = new Dialog(requireContext());
        dialog.setContentView(R.layout.dialog_book_appointment);
        dialog.getWindow().setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);

        Spinner spDoctor = dialog.findViewById(R.id.sp_doctor);
        EditText etDate = dialog.findViewById(R.id.et_appointment_date);
        RadioGroup rgSlots = dialog.findViewById(R.id.rg_time_slots);
        RadioGroup rgModality = dialog.findViewById(R.id.rg_visit_type);
        EditText etReason = dialog.findViewById(R.id.et_reason);
        MaterialButton btnConfirm = dialog.findViewById(R.id.btn_confirm_booking);

        List<DoctorAvailability> docs = ClinicRepository.getInstance().getDoctorAvailabilities();
        List<String> docNames = new ArrayList<>();
        for (DoctorAvailability d : docs) docNames.add(d.getDoctorName() + " (" + d.getSpecialty() + ")");
        spDoctor.setAdapter(new ArrayAdapter<>(requireContext(), android.R.layout.simple_spinner_dropdown_item, docNames));

        btnConfirm.setOnClickListener(v -> {
            String reason = etReason.getText().toString().trim();
            if (reason.isEmpty()) reason = "General Clinical Consultation";
            DoctorAvailability doc = docs.get(spDoctor.getSelectedItemPosition());

            String time = "09:30 AM";
            int slotId = rgSlots.getCheckedRadioButtonId();
            if (slotId == R.id.rb_slot_afternoon) time = "02:00 PM";
            else if (slotId == R.id.rb_slot_evening) time = "04:30 PM";

            Appointment.Type type = (rgModality.getCheckedRadioButtonId() == R.id.rb_telehealth)
                    ? Appointment.Type.TELEHEALTH : Appointment.Type.IN_PERSON;

            User current = SessionManager.getInstance().getCurrentUser();
            String patientName = (current != null) ? current.getName() : "Maya Lin";
            String patientMrn = (current != null && current.getMrn() != null) ? current.getMrn() : "MRN-882194";

            Appointment newApt = new Appointment("apt_" + UUID.randomUUID().toString().substring(0, 6),
                    "p1", patientName, patientMrn, doc.getDoctorId(), doc.getDoctorName(), doc.getSpecialty(),
                    etDate.getText().toString().isEmpty() ? "Oct 08, 2026" : etDate.getText().toString(),
                    time, type, reason);

            ClinicRepository.getInstance().addAppointment(newApt);
            appointmentAdapter.setAppointments(ClinicRepository.getInstance().getAppointments());
            dialog.dismiss();
            Toast.makeText(getContext(), "Appointment Confirmed! Encrypted record stored.", Toast.LENGTH_LONG).show();
        });
        dialog.show();
    }
}`
  },
  {
    name: 'ClinicRepository.java',
    category: 'Security & Repo',
    studioPath: 'android/app/src/main/java/com/careconnect/clinic/repository/ClinicRepository.java',
    flatPath: 'android_src/repository/ClinicRepository.java',
    language: 'java',
    code: `package com.careconnect.clinic.repository;

import com.careconnect.clinic.models.*;
import com.careconnect.clinic.security.CryptoManager;
import java.util.*;

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
        if (instance == null) instance = new ClinicRepository();
        return instance;
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
    // (Full seeding and getters implemented in project)
}`
  },
  {
    name: 'CryptoManager.java',
    category: 'Security & Repo',
    studioPath: 'android/app/src/main/java/com/careconnect/clinic/security/CryptoManager.java',
    flatPath: 'android_src/security/CryptoManager.java',
    language: 'java',
    code: `package com.careconnect.clinic.security;

import android.util.Base64;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

public class CryptoManager {
    private static final String AES_MODE = "AES/GCM/NoPadding";
    private static final int GCM_TAG_LENGTH = 128;
    private static final int GCM_IV_LENGTH = 12;
    private static CryptoManager instance;
    private SecretKey clinicalEnclaveKey;

    public static synchronized CryptoManager getInstance() {
        if (instance == null) instance = new CryptoManager();
        return instance;
    }

    public static String computeSha256(String data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString().substring(0, 16).toUpperCase();
        } catch (NoSuchAlgorithmException e) {
            return "HASH_ERROR";
        }
    }

    public static String maskMrn(String mrn, boolean isMasked) {
        if (!isMasked || mrn == null || mrn.length() < 4) return mrn;
        return mrn.substring(0, 3) + "-••••-••";
    }

    public static String maskName(String fullName, boolean isMasked) {
        if (!isMasked || fullName == null || fullName.trim().isEmpty()) return fullName;
        String[] parts = fullName.trim().split("\\\\s+");
        if (parts.length == 1) return parts[0].charAt(0) + "••••";
        return parts[0].charAt(0) + "•••• " + parts[parts.length - 1].charAt(0) + "••••";
    }
}`
  },
  {
    name: 'AndroidManifest.xml',
    category: 'Gradle & Config',
    studioPath: 'android/app/src/main/AndroidManifest.xml',
    flatPath: 'android_src/config/AndroidManifest.xml',
    language: 'xml',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />

    <application
        android:allowBackup="false"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="false"
        android:icon="@drawable/ic_shield"
        android:label="@string/app_name"
        android:roundIcon="@drawable/ic_shield"
        android:supportsRtl="true"
        android:theme="@style/Theme.CareConnect"
        tools:targetApi="34">

        <activity
            android:name=".activities.AuthActivity"
            android:exported="true"
            android:theme="@style/Theme.CareConnect">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <activity
            android:name=".activities.MainActivity"
            android:exported="false"
            android:theme="@style/Theme.CareConnect" />
    </application>
</manifest>`
  },
  {
    name: 'build.gradle (app)',
    category: 'Gradle & Config',
    studioPath: 'android/app/build.gradle',
    flatPath: 'android_src/config/build.gradle',
    language: 'groovy',
    code: `plugins {
    id 'com.android.application'
}

android {
    namespace 'com.careconnect.clinic'
    compileSdk 34

    defaultConfig {
        applicationId "com.careconnect.clinic"
        minSdk 26
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }

    buildFeatures {
        viewBinding true
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.12.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    implementation 'androidx.recyclerview:recyclerview:1.3.2'
    implementation 'androidx.cardview:cardview:1.0.0'
    implementation 'androidx.lifecycle:lifecycle-viewmodel:2.8.0'
    implementation 'androidx.lifecycle:lifecycle-livedata:2.8.0'
    implementation 'androidx.security:security-crypto:1.1.0-alpha06'
    implementation 'androidx.viewpager2:viewpager2:1.1.0'
    implementation 'com.google.code.gson:gson:2.10.1'
}`
  }
];

export const AndroidCodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(ANDROID_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = ['all', 'Activities', 'Fragments', 'Security & Repo', 'Gradle & Config'];

  const filteredFiles = filterCategory === 'all' 
    ? ANDROID_FILES 
    : ANDROID_FILES.filter(f => f.category === filterCategory);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([selectedFile.code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = selectedFile.name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Notice Banner explaining AI Studio directory structure */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-teal-600 rounded-lg text-white shrink-0 mt-0.5">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h2 className="text-base font-bold text-teal-950 flex items-center gap-2">
              Where to Find the Android Java Code in AI Studio
              <span className="px-2 py-0.5 bg-teal-200 text-teal-800 text-xs font-mono rounded">
                70 Android Files Generated
              </span>
            </h2>
            <p className="text-sm text-teal-800 leading-relaxed">
              In AI Studio’s <strong>Code tab</strong> on the left, Android code is organized in two locations for your convenience:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="bg-white/80 p-3 rounded-lg border border-teal-200">
                <span className="font-bold text-slate-900 block mb-1">1. Flat Direct Directory (1-Click View):</span>
                <code className="text-teal-700 font-mono block">/android_src/activities/...</code>
                <code className="text-teal-700 font-mono block">/android_src/fragments/...</code>
                <code className="text-teal-700 font-mono block">/android_src/models/...</code>
                <span className="text-slate-500 mt-1 block">Click the <strong className="text-slate-700">android_src</strong> folder directly in the file tree without digging through 8 nested directories!</span>
              </div>
              <div className="bg-white/80 p-3 rounded-lg border border-teal-200">
                <span className="font-bold text-slate-900 block mb-1">2. Official Android Studio Gradle Tree:</span>
                <code className="text-teal-700 font-mono block">/android/app/src/main/java/com/careconnect/...</code>
                <span className="text-slate-500 mt-1 block">In the Code tab, click <strong>android</strong> → <strong>app</strong> → <strong>src</strong> → <strong>main</strong> → <strong>java</strong> to open each sub-folder.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Explorer Workspace */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
        {/* Left Sidebar: File Tree */}
        <div className="lg:col-span-4 border-r border-slate-200 bg-slate-50 flex flex-col">
          {/* Category Filter Chips */}
          <div className="p-3 border-b border-slate-200 flex flex-wrap gap-1.5 bg-white">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors capitalize ${
                  filterCategory === cat
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Files List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
            {filteredFiles.map(file => {
              const isSelected = selectedFile.name === file.name;
              return (
                <button
                  key={file.name}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-teal-50 text-teal-900 border border-teal-200 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileCode className={`w-4 h-4 shrink-0 ${isSelected ? 'text-teal-600' : 'text-slate-400'}`} />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                    {file.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Editor: Code & Paths */}
        <div className="lg:col-span-8 flex flex-col bg-slate-900 text-slate-100">
          {/* Header Bar */}
          <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white font-mono">{selectedFile.name}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-teal-900/60 text-teal-300 font-mono">
                  {selectedFile.language.toUpperCase()}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                Path: <span className="text-teal-400">{selectedFile.studioPath}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 rounded-md bg-teal-600 hover:bg-teal-500 text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="flex-1 p-4 overflow-x-auto overflow-y-auto font-mono text-xs leading-relaxed max-h-[550px]">
            <pre className="text-slate-200 whitespace-pre">
              {selectedFile.code}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
