package com.careconnect.clinic.fragments;

import android.app.Dialog;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.careconnect.clinic.R;
import com.careconnect.clinic.adapters.MedicalRecordAdapter;
import com.careconnect.clinic.models.MedicalRecord;
import com.careconnect.clinic.models.User;
import com.careconnect.clinic.repository.ClinicRepository;
import com.careconnect.clinic.security.SessionManager;
import com.google.android.material.button.MaterialButton;
import java.util.ArrayList;
import java.util.List;

public class MedicalRecordsFragment extends Fragment {
    private RecyclerView rvRecords;
    private MedicalRecordAdapter adapter;
    private EditText etSearch;
    private MaterialButton btnBreakGlass;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_medical_records, container, false);
        initViews(view);
        setupSearch();
        setupList();
        return view;
    }

    private void initViews(View view) {
        rvRecords = view.findViewById(R.id.rv_medical_records);
        etSearch = view.findViewById(R.id.et_search_records);
        btnBreakGlass = view.findViewById(R.id.btn_trigger_break_glass);

        btnBreakGlass.setOnClickListener(v -> showBreakGlassDialog());
    }

    private void setupList() {
        adapter = new MedicalRecordAdapter();
        rvRecords.setLayoutManager(new LinearLayoutManager(getContext()));
        rvRecords.setAdapter(adapter);

        List<MedicalRecord> all = ClinicRepository.getInstance().getMedicalRecords();
        adapter.setRecords(all);

        adapter.setOnRecordClickListener(record -> {
            User current = SessionManager.getInstance().getCurrentUser();
            String actorName = current != null ? current.getName() : "Clinical Provider";
            ClinicRepository.getInstance().logHipaaAction("VIEW_EHR_DETAIL", "PATIENT_RECORD", record.getId(),
                    "Clinical EHR opened: " + record.getDiagnosis(), actorName, record.getPatientMrn());
            Toast.makeText(getContext(), "EHR: " + record.getDiagnosis() + " (Logged § 164.312)", Toast.LENGTH_SHORT).show();
        });
    }

    private void setupSearch() {
        etSearch.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                filterRecords(s.toString());
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });
    }

    private void filterRecords(String query) {
        if (query.trim().isEmpty()) {
            adapter.setRecords(ClinicRepository.getInstance().getMedicalRecords());
            return;
        }
        String q = query.toLowerCase();
        List<MedicalRecord> filtered = new ArrayList<>();
        for (MedicalRecord r : ClinicRepository.getInstance().getMedicalRecords()) {
            if (r.getDiagnosis().toLowerCase().contains(q) ||
                r.getDoctorName().toLowerCase().contains(q) ||
                r.getClinicalNotes().toLowerCase().contains(q) ||
                r.getType().toLowerCase().contains(q)) {
                filtered.add(r);
            }
        }
        adapter.setRecords(filtered);
    }

    private void showBreakGlassDialog() {
        Dialog dialog = new Dialog(requireContext());
        dialog.setContentView(R.layout.dialog_break_glass);
        dialog.getWindow().setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);

        EditText etReason = dialog.findViewById(R.id.et_break_glass_reason);
        MaterialButton btnConfirm = dialog.findViewById(R.id.btn_confirm_break_glass);

        btnConfirm.setOnClickListener(v -> {
            String reason = etReason.getText().toString().trim();
            if (reason.isEmpty()) {
                Toast.makeText(getContext(), "Clinical justification is required for emergency override.", Toast.LENGTH_SHORT).show();
                return;
            }

            User current = SessionManager.getInstance().getCurrentUser();
            String actorName = current != null ? current.getName() : "Attending Physician";

            ClinicRepository.getInstance().logHipaaAction("BREAK_GLASS_OVERRIDE", "EMERGENCY_AUDIT",
                    "BG_" + System.currentTimeMillis(),
                    "Emergency Access Justification: " + reason, actorName, "MRN-882194");

            dialog.dismiss();
            Toast.makeText(getContext(), "🚨 Emergency Break-Glass Unlocked & Logged to HIPAA Audit Trail.", Toast.LENGTH_LONG).show();
        });

        dialog.show();
    }
}
