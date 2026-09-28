package com.careconnect.clinic.fragments;

import android.app.Dialog;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.careconnect.clinic.R;
import com.careconnect.clinic.adapters.AppointmentAdapter;
import com.careconnect.clinic.models.Appointment;
import com.careconnect.clinic.models.AppointmentReminder;
import com.careconnect.clinic.models.DoctorAvailability;
import com.careconnect.clinic.models.Patient;
import com.careconnect.clinic.models.User;
import com.careconnect.clinic.repository.ClinicRepository;
import com.careconnect.clinic.security.SessionManager;
import com.google.android.material.button.MaterialButton;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class PatientPortalFragment extends Fragment {
    private FrameLayout containerReminderCard;
    private TextView tvPortalBp, tvPortalHr, tvPortalBloodType;
    private MaterialButton btnQuickBook;
    private RecyclerView rvAppointments;
    private AppointmentAdapter appointmentAdapter;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_patient_portal, container, false);
        initViews(view);
        setupReminderBanner();
        setupVitals();
        setupAppointments();
        return view;
    }

    private void initViews(View view) {
        containerReminderCard = view.findViewById(R.id.container_reminder_card);
        tvPortalBp = view.findViewById(R.id.tv_portal_bp);
        tvPortalHr = view.findViewById(R.id.tv_portal_hr);
        tvPortalBloodType = view.findViewById(R.id.tv_portal_blood_type);
        btnQuickBook = view.findViewById(R.id.btn_quick_book);
        rvAppointments = view.findViewById(R.id.rv_portal_appointments);

        btnQuickBook.setOnClickListener(v -> showBookAppointmentDialog());
    }

    private void setupReminderBanner() {
        List<AppointmentReminder> reminders = ClinicRepository.getInstance().getReminders();
        if (reminders.isEmpty()) {
            containerReminderCard.setVisibility(View.GONE);
            return;
        }

        AppointmentReminder activeReminder = reminders.get(0);
        View reminderView = LayoutInflater.from(getContext()).inflate(R.layout.item_reminder_card, containerReminderCard, false);

        TextView tvTitle = reminderView.findViewById(R.id.tv_reminder_title);
        TextView tvTime = reminderView.findViewById(R.id.tv_reminder_time);
        TextView tvInstructions = reminderView.findViewById(R.id.tv_instructions);
        TextView tvCountdown = reminderView.findViewById(R.id.tv_countdown);
        MaterialButton btnConfirm = reminderView.findViewById(R.id.btn_confirm_attendance);
        TextView tvConfirmed = reminderView.findViewById(R.id.tv_confirmed_status);

        tvTitle.setText("Visit with " + activeReminder.getDoctorName());
        tvTime.setText(activeReminder.getAppointmentDate() + " at " + activeReminder.getAppointmentTime() + " (" + activeReminder.getType() + ")");
        tvCountdown.setText("In " + activeReminder.getHoursRemaining() + " hours");

        StringBuilder sb = new StringBuilder();
        for (String ins : activeReminder.getInstructions()) {
            sb.append("• ").append(ins).append("\n");
        }
        tvInstructions.setText(sb.toString().trim());

        if (activeReminder.isAcknowledged()) {
            btnConfirm.setVisibility(View.GONE);
            tvConfirmed.setVisibility(View.VISIBLE);
        } else {
            btnConfirm.setOnClickListener(v -> {
                ClinicRepository.getInstance().acknowledgeReminder(activeReminder.getId());
                btnConfirm.setVisibility(View.GONE);
                tvConfirmed.setVisibility(View.VISIBLE);
                Toast.makeText(getContext(), "Attendance confirmed! SMS reminder sent.", Toast.LENGTH_SHORT).show();
            });
        }

        containerReminderCard.removeAllViews();
        containerReminderCard.addView(reminderView);
        containerReminderCard.setVisibility(View.VISIBLE);
    }

    private void setupVitals() {
        List<Patient> patients = ClinicRepository.getInstance().getPatients();
        if (!patients.isEmpty()) {
            Patient p = patients.get(0);
            tvPortalBp.setText(p.getBloodPressure() != null ? p.getBloodPressure().replace(" mmHg", "") : "118/76");
            tvPortalHr.setText(p.getHeartRate() + " bpm");
            tvPortalBloodType.setText(p.getBloodType());
        }
    }

    private void setupAppointments() {
        appointmentAdapter = new AppointmentAdapter();
        rvAppointments.setLayoutManager(new LinearLayoutManager(getContext()));
        rvAppointments.setAdapter(appointmentAdapter);

        appointmentAdapter.setAppointments(ClinicRepository.getInstance().getAppointments());
        appointmentAdapter.setOnAppointmentClickListener(apt -> {
            Toast.makeText(getContext(), "Appointment: " + apt.getReason() + " with " + apt.getDoctorName(), Toast.LENGTH_SHORT).show();
        });
    }

    private void showBookAppointmentDialog() {
        Dialog dialog = new Dialog(requireContext());
        dialog.setContentView(R.layout.dialog_book_appointment);
        dialog.getWindow().setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);

        Spinner spDoctor = dialog.findViewById(R.id.sp_doctor);
        EditText etDate = dialog.findViewById(R.id.et_appointment_date);
        RadioGroup rgSlots = dialog.findViewById(R.id.rg_time_slots);
        RadioGroup rgModality = dialog.findViewById(R.id.rg_visit_type);
        EditText etReason = dialog.findViewById(R.id.et_reason);
        MaterialButton btnConfirm = dialog.findViewById(R.id.btn_confirm_booking);

        List<DoctorAvailability> docs = ClinicRepository.getInstance().getDoctorAvailabilities();
        List<String> docNames = new ArrayList<>();
        for (DoctorAvailability d : docs) {
            docNames.add(d.getDoctorName() + " (" + d.getSpecialty() + ")");
        }
        ArrayAdapter<String> spinnerAdapter = new ArrayAdapter<>(requireContext(),
                android.R.layout.simple_spinner_dropdown_item, docNames);
        spDoctor.setAdapter(spinnerAdapter);

        btnConfirm.setOnClickListener(v -> {
            String reason = etReason.getText().toString().trim();
            if (reason.isEmpty()) {
                reason = "General Clinical Consultation";
            }
            int selectedDocIdx = spDoctor.getSelectedItemPosition();
            DoctorAvailability doc = docs.get(selectedDocIdx);

            String time = "09:30 AM";
            int slotId = rgSlots.getCheckedRadioButtonId();
            if (slotId == R.id.rb_slot_afternoon) time = "02:00 PM";
            else if (slotId == R.id.rb_slot_evening) time = "04:30 PM";

            Appointment.Type type = (rgModality.getCheckedRadioButtonId() == R.id.rb_telehealth)
                    ? Appointment.Type.TELEHEALTH : Appointment.Type.IN_PERSON;

            User current = SessionManager.getInstance().getCurrentUser();
            String patientName = (current != null) ? current.getName() : "Maya Lin";
            String patientMrn = (current != null && current.getMrn() != null) ? current.getMrn() : "MRN-882194";

            Appointment newApt = new Appointment("apt_" + UUID.randomUUID().toString().substring(0, 6),
                    "p1", patientName, patientMrn, doc.getDoctorId(), doc.getDoctorName(), doc.getSpecialty(),
                    etDate.getText().toString().isEmpty() ? "Oct 08, 2026" : etDate.getText().toString(),
                    time, type, reason);

            ClinicRepository.getInstance().addAppointment(newApt);
            appointmentAdapter.setAppointments(ClinicRepository.getInstance().getAppointments());

            dialog.dismiss();
            Toast.makeText(getContext(), "Appointment Confirmed! Encrypted record stored.", Toast.LENGTH_LONG).show();
        });

        dialog.show();
    }
}
