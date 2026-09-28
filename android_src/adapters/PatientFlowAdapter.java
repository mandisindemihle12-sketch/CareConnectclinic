package com.careconnect.clinic.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;
import com.careconnect.clinic.R;
import com.careconnect.clinic.models.Patient;
import com.careconnect.clinic.security.CryptoManager;
import com.careconnect.clinic.security.SessionManager;
import java.util.ArrayList;
import java.util.List;

public class PatientFlowAdapter extends RecyclerView.Adapter<PatientFlowAdapter.ViewHolder> {
    private List<Patient> patients = new ArrayList<>();
    private OnPatientStatusChangeListener listener;

    public interface OnPatientStatusChangeListener {
        void onStatusChange(Patient patient);
    }

    public void setOnPatientStatusChangeListener(OnPatientStatusChangeListener listener) {
        this.listener = listener;
    }

    public void setPatients(List<Patient> patients) {
        this.patients = patients;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_patient_tracker, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Patient patient = patients.get(position);
        boolean isMasked = SessionManager.getInstance().isPrivacyMasked();

        holder.tvPatientName.setText(CryptoManager.maskName(patient.getFullName(), isMasked));
        holder.tvPatientMrn.setText(CryptoManager.maskMrn(patient.getMrn(), isMasked));
        holder.tvAssignedDoc.setText(patient.getAssignedDoctor() != null ? patient.getAssignedDoctor() : "Unassigned");
        holder.tvRoom.setText(patient.getRoomNumber() != null ? patient.getRoomNumber() : "Waiting Lobby");
        holder.tvVitalsSummary.setText("BP " + patient.getBloodPressure() + " | HR " + patient.getHeartRate() + " bpm | SpO2 " + patient.getOxygenSaturation() + "%");

        switch (patient.getStatus()) {
            case WAITING:
                holder.tvStatusChip.setText("WAITING");
                holder.tvStatusChip.setBackgroundResource(R.drawable.bg_badge_amber);
                holder.tvStatusChip.setTextColor(ContextCompat.getColor(holder.itemView.getContext(), R.color.amber_600));
                break;
            case IN_TRIAGE:
                holder.tvStatusChip.setText("IN TRIAGE");
                holder.tvStatusChip.setBackgroundResource(R.drawable.bg_badge_teal);
                holder.tvStatusChip.setTextColor(ContextCompat.getColor(holder.itemView.getContext(), R.color.teal_dark));
                break;
            case WITH_DOCTOR:
                holder.tvStatusChip.setText("WITH DOCTOR");
                holder.tvStatusChip.setBackgroundResource(R.drawable.bg_badge_emerald);
                holder.tvStatusChip.setTextColor(ContextCompat.getColor(holder.itemView.getContext(), R.color.emerald_600));
                break;
            case LAB_IMAGING:
                holder.tvStatusChip.setText("LAB / IMAGING");
                holder.tvStatusChip.setBackgroundResource(R.drawable.bg_badge_rose);
                holder.tvStatusChip.setTextColor(ContextCompat.getColor(holder.itemView.getContext(), R.color.rose_600));
                break;
            case DISCHARGED:
                holder.tvStatusChip.setText("DISCHARGED");
                holder.tvStatusChip.setBackgroundResource(R.drawable.bg_badge_teal);
                holder.tvStatusChip.setTextColor(ContextCompat.getColor(holder.itemView.getContext(), R.color.slate_600));
                break;
        }

        holder.itemView.setOnClickListener(v -> {
            if (listener != null) {
                listener.onStatusChange(patient);
            }
        });
    }

    @Override
    public int getItemCount() {
        return patients.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvPatientName, tvPatientMrn, tvStatusChip, tvAssignedDoc, tvRoom, tvVitalsSummary;

        ViewHolder(View itemView) {
            super(itemView);
            tvPatientName = itemView.findViewById(R.id.tv_patient_name);
            tvPatientMrn = itemView.findViewById(R.id.tv_patient_mrn);
            tvStatusChip = itemView.findViewById(R.id.tv_status_chip);
            tvAssignedDoc = itemView.findViewById(R.id.tv_assigned_doc);
            tvRoom = itemView.findViewById(R.id.tv_room);
            tvVitalsSummary = itemView.findViewById(R.id.tv_vitals_summary);
        }
    }
}
