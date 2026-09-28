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

        // Pre-fill demo patient
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

        // 1-Tap Demo Role Presets
        btnDemoPatient.setOnClickListener(v -> {
            User patient = ClinicRepository.getInstance().getDemoUsers().get(0);
            loginWithUser(patient);
        });

        btnDemoDoctor.setOnClickListener(v -> {
            User doctor = ClinicRepository.getInstance().getDemoUsers().get(1);
            loginWithUser(doctor);
        });

        btnDemoAdmin.setOnClickListener(v -> {
            User admin = ClinicRepository.getInstance().getDemoUsers().get(3);
            loginWithUser(admin);
        });
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
        // Match against existing users or fallback to primary patient
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
