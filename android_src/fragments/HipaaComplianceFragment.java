package com.careconnect.clinic.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.careconnect.clinic.R;
import com.careconnect.clinic.adapters.AuditLogAdapter;
import com.careconnect.clinic.models.HipaaAuditLog;
import com.careconnect.clinic.repository.ClinicRepository;
import java.util.List;

public class HipaaComplianceFragment extends Fragment {
    private RecyclerView rvAuditLogs;
    private AuditLogAdapter adapter;
    private TextView tvLogsCount;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_hipaa_compliance, container, false);
        initViews(view);
        setupAuditLogs();
        return view;
    }

    private void initViews(View view) {
        rvAuditLogs = view.findViewById(R.id.rv_audit_logs);
        tvLogsCount = view.findViewById(R.id.tv_total_logs_count);
    }

    private void setupAuditLogs() {
        adapter = new AuditLogAdapter();
        rvAuditLogs.setLayoutManager(new LinearLayoutManager(getContext()));
        rvAuditLogs.setAdapter(adapter);

        List<HipaaAuditLog> logs = ClinicRepository.getInstance().getAuditLogs();
        adapter.setLogs(logs);
        tvLogsCount.setText(logs.size() + " Verified Events");
    }

    public void refreshLogs() {
        if (adapter != null) {
            List<HipaaAuditLog> logs = ClinicRepository.getInstance().getAuditLogs();
            adapter.setLogs(logs);
            if (tvLogsCount != null) {
                tvLogsCount.setText(logs.size() + " Verified Events");
            }
        }
    }
}
