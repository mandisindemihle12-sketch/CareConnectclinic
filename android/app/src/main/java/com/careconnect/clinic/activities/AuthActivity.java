package com.careconnect.clinic.activities;

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
    public enum AuthMode {
        PATIENT_SIGN_IN,
        DOCTOR_SIGN_IN,
        PATIENT_REGISTER
    }

    private AuthMode currentMode = AuthMode.PATIENT_SIGN_IN;

    private MaterialButton btnTabSignIn, btnTabDoctor, btnTabRegister, btnSubmitAuth;
    private MaterialButton btnDemoPatient, btnDemoDoctor, btnDemoAdmin;
    private LinearLayout layoutDoctorFields, layoutRegisterFields;
    private EditText etEmail, etPassword, etDoctorNpi, etDoctorDept;
    private EditText etFirstName, etLastName, etDob, etBloodType, etPhone;
    private CheckBox cbHipaaConsent;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_auth);

        initViews();
        setupListeners();
        setAuthMode(AuthMode.PATIENT_SIGN_IN);
    }

    private void initViews() {
        btnTabSignIn = findViewById(R.id.btn_tab_signin);
        btnTabDoctor = findViewById(R.id.btn_tab_doctor);
        btnTabRegister = findViewById(R.id.btn_tab_register);
        btnSubmitAuth = findViewById(R.id.btn_submit_auth);
        btnDemoPatient = findViewById(R.id.btn_demo_patient);
        btnDemoDoctor = findViewById(R.id.btn_demo_doctor);
        btnDemoAdmin = findViewById(R.id.btn_demo_admin);

        layoutDoctorFields = findViewById(R.id.layout_doctor_fields);
        layoutRegisterFields = findViewById(R.id.layout_register_fields);

        etEmail = findViewById(R.id.et_email);
        etPassword = findViewById(R.id.et_password);
        etDoctorNpi = findViewById(R.id.et_doctor_npi);
        etDoctorDept = findViewById(R.id.et_doctor_dept);

        etFirstName = findViewById(R.id.et_first_name);
        etLastName = findViewById(R.id.et_last_name);
        etDob = findViewById(R.id.et_dob);
        etBloodType = findViewById(R.id.et_blood_type);
        etPhone = findViewById(R.id.et_phone);
        cbHipaaConsent = findViewById(R.id.cb_hipaa_consent);
    }

    private void setupListeners() {
        btnTabSignIn.setOnClickListener(v -> setAuthMode(AuthMode.PATIENT_SIGN_IN));
        btnTabDoctor.setOnClickListener(v -> setAuthMode(AuthMode.DOCTOR_SIGN_IN));
        btnTabRegister.setOnClickListener(v -> setAuthMode(AuthMode.PATIENT_REGISTER));

        btnSubmitAuth.setOnClickListener(v -> {
            if (!cbHipaaConsent.isChecked()) {
                Toast.makeText(this, "HIPAA consent is mandatory to proceed.", Toast.LENGTH_SHORT).show();
                return;
            }

            if (currentMode == AuthMode.PATIENT_REGISTER) {
                handleRegistration();
            } else if (currentMode == AuthMode.DOCTOR_SIGN_IN) {
                handleDoctorSignIn();
            } else {
                handlePatientSignIn();
            }
        });

        // 1-Tap Demo Role Presets
        btnDemoPatient.setOnClickListener(v -> {
            User patient = ClinicRepository.getInstance().getDemoUsers().get(0);
            loginWithUser(patient);
        });

        btnDemoDoctor.setOnClickListener(v -> {
            // Direct 1-tap Attending Physician login
            setAuthMode(AuthMode.DOCTOR_SIGN_IN);
            User doctor = ClinicRepository.getInstance().getDemoUsers().get(1);
            loginWithUser(doctor);
        });

        btnDemoAdmin.setOnClickListener(v -> {
            User admin = ClinicRepository.getInstance().getDemoUsers().get(3);
            loginWithUser(admin);
        });
    }

    private void setAuthMode(AuthMode mode) {
        currentMode = mode;

        // Reset tab button styles
        btnTabSignIn.setBackgroundTintList(ContextCompat.getColorStateList(this, android.R.color.transparent));
        btnTabSignIn.setTextColor(ContextCompat.getColor(this, R.color.slate_600));
        btnTabDoctor.setBackgroundTintList(ContextCompat.getColorStateList(this, android.R.color.transparent));
        btnTabDoctor.setTextColor(ContextCompat.getColor(this, R.color.slate_600));
        btnTabRegister.setBackgroundTintList(ContextCompat.getColorStateList(this, android.R.color.transparent));
        btnTabRegister.setTextColor(ContextCompat.getColor(this, R.color.slate_600));

        if (mode == AuthMode.DOCTOR_SIGN_IN) {
            btnTabDoctor.setBackgroundTintList(ContextCompat.getColorStateList(this, R.color.white));
            btnTabDoctor.setTextColor(ContextCompat.getColor(this, R.color.teal_primary));

            layoutDoctorFields.setVisibility(View.VISIBLE);
            layoutRegisterFields.setVisibility(View.GONE);

            btnSubmitAuth.setText("Sign In to Physician Workstation (EHR)");
            btnSubmitAuth.setBackgroundTintList(ContextCompat.getColorStateList(this, R.color.teal_primary));

            etEmail.setText("e.vance@careconnect.health");
            etDoctorNpi.setText("NPI: 1849204912");
            etDoctorDept.setText("Internal Medicine");
            etPassword.setText("••••••••••••");
        } else if (mode == AuthMode.PATIENT_REGISTER) {
            btnTabRegister.setBackgroundTintList(ContextCompat.getColorStateList(this, R.color.white));
            btnTabRegister.setTextColor(ContextCompat.getColor(this, R.color.slate_900));

            layoutDoctorFields.setVisibility(View.GONE);
            layoutRegisterFields.setVisibility(View.VISIBLE);

            btnSubmitAuth.setText("Create Encrypted Patient Account");
            btnSubmitAuth.setBackgroundTintList(ContextCompat.getColorStateList(this, R.color.teal_primary));

            etEmail.setText("");
            etPassword.setText("");
        } else {
            // PATIENT_SIGN_IN
            btnTabSignIn.setBackgroundTintList(ContextCompat.getColorStateList(this, R.color.white));
            btnTabSignIn.setTextColor(ContextCompat.getColor(this, R.color.slate_900));

            layoutDoctorFields.setVisibility(View.GONE);
            layoutRegisterFields.setVisibility(View.GONE);

            btnSubmitAuth.setText("Sign In to Patient Portal");
            btnSubmitAuth.setBackgroundTintList(ContextCompat.getColorStateList(this, R.color.teal_primary));

            etEmail.setText("maya.lin@patient.careconnect.health");
            etPassword.setText("••••••••••••");
        }
    }

    private void handleDoctorSignIn() {
        String email = etEmail.getText().toString().trim();
        String npi = etDoctorNpi.getText().toString().trim();
        String dept = etDoctorDept.getText().toString().trim();

        if (email.isEmpty()) {
            Toast.makeText(this, "Please enter your physician clinical email.", Toast.LENGTH_SHORT).show();
            return;
        }

        // Match against existing doctors or create physician session
        User matchedDoctor = null;
        for (User u : ClinicRepository.getInstance().getDemoUsers()) {
            if (u.isDoctor() && (u.getEmail().equalsIgnoreCase(email) || email.contains("vance") || email.contains("chen"))) {
                matchedDoctor = u;
                break;
            }
        }

        if (matchedDoctor == null) {
            matchedDoctor = new User(
                    "usr_doc_" + System.currentTimeMillis(),
                    "Dr. " + email.split("@")[0],
                    email,
                    User.Role.DOCTOR,
                    dept.isEmpty() ? "Internal Medicine" : dept,
                    null,
                    "Attending Physician"
            );
            ClinicRepository.getInstance().getDemoUsers().add(matchedDoctor);
        }

        ClinicRepository.getInstance().logHipaaAction("DOCTOR_AUTH_SUCCESS", "AUTHENTICATION", matchedDoctor.getId(),
                "Physician authenticated with " + (npi.isEmpty() ? "NPI: 1849204912" : npi) + " (" + matchedDoctor.getDepartment() + ")",
                matchedDoctor.getName(), "N/A");

        Toast.makeText(this, "Welcome, " + matchedDoctor.getName() + " (" + matchedDoctor.getDepartment() + ")", Toast.LENGTH_LONG).show();
        loginWithUser(matchedDoctor);
    }

    private void handlePatientSignIn() {
        String email = etEmail.getText().toString().trim();
        User matched = null;
        for (User u : ClinicRepository.getInstance().getDemoUsers()) {
            if (u.getEmail().equalsIgnoreCase(email)) {
                matched = u;
                break;
            }
        }
        if (matched == null) {
            matched = ClinicRepository.getInstance().getDemoUsers().get(0); // Maya Lin
        }
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
                dob.isEmpty() ? "1990-01-01" : dob,
                "Unspecified",
                bloodType.isEmpty() ? "O+" : bloodType,
                phone.isEmpty() ? "+1 (555) 000-0000" : phone,
                email);
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
}
