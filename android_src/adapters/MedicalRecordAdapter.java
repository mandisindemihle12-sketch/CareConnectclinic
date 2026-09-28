package com.careconnect.clinic.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.careconnect.clinic.R;
import com.careconnect.clinic.models.MedicalRecord;
import java.util.ArrayList;
import java.util.List;

public class MedicalRecordAdapter extends RecyclerView.Adapter<MedicalRecordAdapter.ViewHolder> {
    private List<MedicalRecord> records = new ArrayList<>();
    private OnRecordClickListener listener;

    public interface OnRecordClickListener {
        void onRecordClick(MedicalRecord record);
    }

    public void setOnRecordClickListener(OnRecordClickListener listener) {
        this.listener = listener;
    }

    public void setRecords(List<MedicalRecord> records) {
        this.records = records;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_medical_record, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        MedicalRecord record = records.get(position);
        holder.tvRecordType.setText(record.getType());
        holder.tvRecordDate.setText(record.getDate());
        holder.tvDiagnosis.setText(record.getDiagnosis());
        holder.tvProvider.setText("Provider: " + record.getDoctorName() + " (" + record.getDepartment() + ")");
        holder.tvSoapNotes.setText(record.getClinicalNotes());

        if (record.getPrescriptions() != null && !record.getPrescriptions().isEmpty()) {
            holder.tvPrescriptions.setVisibility(View.VISIBLE);
            holder.tvPrescriptions.setText("Rx: " + String.join(", ", record.getPrescriptions()));
        } else {
            holder.tvPrescriptions.setVisibility(View.GONE);
        }

        holder.itemView.setOnClickListener(v -> {
            if (listener != null) {
                listener.onRecordClick(record);
            }
        });
    }

    @Override
    public int getItemCount() {
        return records.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvRecordType, tvRecordDate, tvDiagnosis, tvProvider, tvSoapNotes, tvPrescriptions;

        ViewHolder(View itemView) {
            super(itemView);
            tvRecordType = itemView.findViewById(R.id.tv_record_type);
            tvRecordDate = itemView.findViewById(R.id.tv_record_date);
            tvDiagnosis = itemView.findViewById(R.id.tv_diagnosis);
            tvProvider = itemView.findViewById(R.id.tv_provider);
            tvSoapNotes = itemView.findViewById(R.id.tv_soap_notes);
            tvPrescriptions = itemView.findViewById(R.id.tv_prescriptions);
        }
    }
}
