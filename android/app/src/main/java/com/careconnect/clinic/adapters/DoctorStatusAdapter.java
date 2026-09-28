package com.careconnect.clinic.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;
import com.careconnect.clinic.R;
import com.careconnect.clinic.models.DoctorAvailability;
import java.util.ArrayList;
import java.util.List;

public class DoctorStatusAdapter extends RecyclerView.Adapter<DoctorStatusAdapter.ViewHolder> {
    private List<DoctorAvailability> doctors = new ArrayList<>();
    private OnStatusToggleListener listener;

    public interface OnStatusToggleListener {
        void onToggleStatus(DoctorAvailability doctor);
    }

    public void setOnStatusToggleListener(OnStatusToggleListener listener) {
        this.listener = listener;
    }

    public void setDoctors(List<DoctorAvailability> doctors) {
        this.doctors = doctors;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_doctor_status, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        DoctorAvailability doc = doctors.get(position);
        holder.tvDocName.setText(doc.getDoctorName());
        holder.tvSpecialty.setText(doc.getSpecialty() + " • " + doc.getRoomNumber());
        holder.tvNextSlot.setText("Next: " + doc.getNextAvailableSlot());
        holder.tvActivePatients.setText("Active Queue: " + doc.getActivePatients() + " patients scheduled");

        switch (doc.getStatus()) {
            case AVAILABLE:
                holder.tvDocStatusBadge.setText("AVAILABLE");
                holder.tvDocStatusBadge.setBackgroundResource(R.drawable.bg_badge_emerald);
                holder.tvDocStatusBadge.setTextColor(ContextCompat.getColor(holder.itemView.getContext(), R.color.emerald_600));
                break;
            case IN_CONSULTATION:
                holder.tvDocStatusBadge.setText("IN CONSULTATION");
                holder.tvDocStatusBadge.setBackgroundResource(R.drawable.bg_badge_amber);
                holder.tvDocStatusBadge.setTextColor(ContextCompat.getColor(holder.itemView.getContext(), R.color.amber_600));
                break;
            case ON_BREAK:
            case OFF_DUTY:
                holder.tvDocStatusBadge.setText("OFF DUTY");
                holder.tvDocStatusBadge.setBackgroundResource(R.drawable.bg_badge_rose);
                holder.tvDocStatusBadge.setTextColor(ContextCompat.getColor(holder.itemView.getContext(), R.color.rose_600));
                break;
        }

        holder.itemView.setOnClickListener(v -> {
            if (listener != null) {
                listener.onToggleStatus(doc);
            }
        });
    }

    @Override
    public int getItemCount() {
        return doctors.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvDocName, tvDocStatusBadge, tvSpecialty, tvNextSlot, tvActivePatients;

        ViewHolder(View itemView) {
            super(itemView);
            tvDocName = itemView.findViewById(R.id.tv_doc_name);
            tvDocStatusBadge = itemView.findViewById(R.id.tv_doc_status_badge);
            tvSpecialty = itemView.findViewById(R.id.tv_specialty);
            tvNextSlot = itemView.findViewById(R.id.tv_next_slot);
            tvActivePatients = itemView.findViewById(R.id.tv_active_patients);
        }
    }
}
