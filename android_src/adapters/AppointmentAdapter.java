package com.careconnect.clinic.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.careconnect.clinic.R;
import com.careconnect.clinic.models.Appointment;
import java.util.ArrayList;
import java.util.List;

public class AppointmentAdapter extends RecyclerView.Adapter<AppointmentAdapter.ViewHolder> {
    private List<Appointment> appointments = new ArrayList<>();
    private OnAppointmentClickListener listener;

    public interface OnAppointmentClickListener {
        void onAppointmentClick(Appointment appointment);
    }

    public void setOnAppointmentClickListener(OnAppointmentClickListener listener) {
        this.listener = listener;
    }

    public void setAppointments(List<Appointment> appointments) {
        this.appointments = appointments;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_appointment, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Appointment apt = appointments.get(position);
        holder.tvSpecialty.setText(apt.getSpecialty());
        holder.tvDoctorName.setText(apt.getDoctorName());
        holder.tvReason.setText(apt.getReason());
        holder.tvDatetime.setText(apt.getDate() + " • " + apt.getTime());
        holder.tvRoom.setText(apt.getRoomNumber() != null ? apt.getRoomNumber() : "Telehealth Room");
        holder.tvStatusBadge.setText(apt.getStatus().name());

        holder.itemView.setOnClickListener(v -> {
            if (listener != null) {
                listener.onAppointmentClick(apt);
            }
        });
    }

    @Override
    public int getItemCount() {
        return appointments.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvSpecialty, tvStatusBadge, tvDoctorName, tvReason, tvDatetime, tvRoom;

        ViewHolder(View itemView) {
            super(itemView);
            tvSpecialty = itemView.findViewById(R.id.tv_specialty);
            tvStatusBadge = itemView.findViewById(R.id.tv_status_badge);
            tvDoctorName = itemView.findViewById(R.id.tv_doctor_name);
            tvReason = itemView.findViewById(R.id.tv_reason);
            tvDatetime = itemView.findViewById(R.id.tv_datetime);
            tvRoom = itemView.findViewById(R.id.tv_room);
        }
    }
}
