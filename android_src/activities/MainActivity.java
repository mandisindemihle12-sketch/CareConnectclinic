package com.careconnect.clinic.activities;

import android.app.Dialog;
import android.content.Intent;
import android.os.Bundle;
import android.view.ViewGroup;
import android.widget.EditText;
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
            Toast.makeText(this, isMasked ? "🔒 PHI Privacy Mask: ON (Public Mode)" : "🔓 PHI Privacy Mask: OFF", Toast.LENGTH_SHORT).show();

            // Refresh current fragment if it implements privacy masking
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
            if (itemId == R.id.nav_portal) {
                target = new PatientPortalFragment();
            } else if (itemId == R.id.nav_records) {
                target = new MedicalRecordsFragment();
            } else if (itemId == R.id.nav_flow) {
                target = new AdminDashboardFragment();
            } else if (itemId == R.id.nav_chat) {
                target = new EncryptedChatFragment();
            } else if (itemId == R.id.nav_hipaa) {
                target = new HipaaComplianceFragment();
            }

            if (target != null) {
                activeFragment = target;
                getSupportFragmentManager().beginTransaction()
                        .replace(R.id.fragment_container, target)
                        .commit();
                return true;
            }
            return false;
        });

        // Default to Patient Portal
        bottomNav.setSelectedItemId(R.id.nav_portal);
    }

    private void showLockScreenDialog() {
        Dialog lockDialog = new Dialog(this, android.R.style.Theme_Black_NoTitleBar_Fullscreen);
        lockDialog.setContentView(R.layout.dialog_break_glass); // reuse security dialog style
        lockDialog.setCancelable(false);

        // Customize lock dialog view
        TextView title = lockDialog.findViewById(R.id.et_break_glass_reason);
        if (title != null) {
            title.setHint("Enter 4-digit PIN or password to resume session...");
        }
        MaterialButton unlockBtn = lockDialog.findViewById(R.id.btn_confirm_break_glass);
        if (unlockBtn != null) {
            unlockBtn.setText("Unlock Clinical Session");
            unlockBtn.setBackgroundColor(ContextCompat.getColor(this, R.color.teal_primary));
            unlockBtn.setOnClickListener(v -> {
                lockDialog.dismiss();
                ClinicRepository.getInstance().logHipaaAction("SESSION_UNLOCK", "AUTHENTICATION",
                        "CLI_LOCK", "Clinical session resumed by authorized user",
                        SessionManager.getInstance().getCurrentUser().getName(), "N/A");
                Toast.makeText(this, "Session Unlocked.", Toast.LENGTH_SHORT).show();
            });
        }
        lockDialog.show();
    }
}
