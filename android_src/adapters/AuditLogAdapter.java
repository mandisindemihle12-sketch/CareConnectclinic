package com.careconnect.clinic.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.careconnect.clinic.R;
import com.careconnect.clinic.models.HipaaAuditLog;
import com.careconnect.clinic.security.CryptoManager;
import com.careconnect.clinic.security.SessionManager;
import java.util.ArrayList;
import java.util.List;

public class AuditLogAdapter extends RecyclerView.Adapter<AuditLogAdapter.ViewHolder> {
    private List<HipaaAuditLog> logs = new ArrayList<>();

    public void setLogs(List<HipaaAuditLog> logs) {
        this.logs = logs;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_audit_log, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        HipaaAuditLog log = logs.get(position);
        boolean isMasked = SessionManager.getInstance().isPrivacyMasked();

        holder.tvActionBadge.setText(log.getAction());
        holder.tvActorName.setText(log.getActorName());
        holder.tvPatientMrn.setText(CryptoManager.maskMrn(log.getPatientMrn(), isMasked));
        holder.tvDetails.setText(log.getDetails());
        holder.tvLogId.setText("ID: " + log.getId());
        holder.tvChecksum.setText("SHA-256: " + log.getSha256Checksum());
    }

    @Override
    public int getItemCount() {
        return logs.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvActionBadge, tvActorName, tvPatientMrn, tvDetails, tvLogId, tvChecksum;

        ViewHolder(View itemView) {
            super(itemView);
            tvActionBadge = itemView.findViewById(R.id.tv_action_badge);
            tvActorName = itemView.findViewById(R.id.tv_actor_name);
            tvPatientMrn = itemView.findViewById(R.id.tv_patient_mrn);
            tvDetails = itemView.findViewById(R.id.tv_details);
            tvLogId = itemView.findViewById(R.id.tv_log_id);
            tvChecksum = itemView.findViewById(R.id.tv_checksum);
        }
    }
}
