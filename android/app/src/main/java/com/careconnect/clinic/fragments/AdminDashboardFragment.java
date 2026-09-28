package com.careconnect.clinic.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.careconnect.clinic.R;
import com.careconnect.clinic.adapters.DoctorStatusAdapter;
import com.careconnect.clinic.adapters.PatientFlowAdapter;
import com.careconnect.clinic.models.DoctorAvailability;
import com.careconnect.clinic.models.Patient;
import com.careconnect.clinic.models.User;
import com.careconnect.clinic.repository.ClinicRepository;
import com.careconnect.clinic.security.SessionManager;
import java.util.List;

public class AdminDashboardFragment extends Fragment {
    private TextView tvActivePatients, tvDoctorsOnDuty;
    private RecyclerView rvDoctors, rvPatients;
    private DoctorStatusAdapter doctorAdapter;
    private PatientFlowAdapter patientAdapter;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_admin_dashboard, container, false);
        initViews(view);
        setupDoctorBoard();
        setupPatientFlow();
        return view;
    }

    private void initViews(View view) {
        tvActivePatients = view.findViewById(R.id.tv_active_patients_count);
        tvDoctorsOnDuty = view.findViewById(R.id.tv_doctors_on_duty_count);
        rvDoctors = view.findViewById(R.id.rv_doctor_status);
        rvPatients = view.findViewById(R.id.rv_patient_flow);

        List<Patient> patients = ClinicRepository.getInstance().getPatients();
        tvActivePatients.setText(patients.size() + " Patients");

        List<DoctorAvailability> docs = ClinicRepository.getInstance().getDoctorAvailabilities();
        tvDoctorsOnDuty.setText(docs.size() + " Active");
    }

    private void setupDoctorBoard() {
        doctorAdapter = new DoctorStatusAdapter();
        rvDoctors.setLayoutManager(new LinearLayoutManager(getContext()));
        rvDoctors.setAdapter(doctorAdapter);

        doctorAdapter.setDoctors(ClinicRepository.getInstance().getDoctorAvailabilities());
        doctorAdapter.setOnStatusToggleListener(doc -> {
            if (doc.getStatus() == DoctorAvailability.AvailabilityStatus.AVAILABLE) {
                doc.setStatus(DoctorAvailability.AvailabilityStatus.IN_CONSULTATION);
            } else if (doc.getStatus() == DoctorAvailability.AvailabilityStatus.IN_CONSULTATION) {
                doc.setStatus(DoctorAvailability.AvailabilityStatus.ON_BREAK);
            } else {
                doc.setStatus(DoctorAvailability.AvailabilityStatus.AVAILABLE);
            }
            doctorAdapter.notifyDataSetChanged();

            User current = SessionManager.getInstance().getCurrentUser();
            String actorName = current != null ? current.getName() : "Operations Admin";
            ClinicRepository.getInstance().logHipaaAction("DOCTOR_STATUS_UPDATE", "STAFF_ROSTER", doc.getId(),
                    doc.getDoctorName() + " status toggled to " + doc.getStatus().name(),
                    actorName, "N/A");

            Toast.makeText(getContext(), doc.getDoctorName() + ": " + doc.getStatus().name(), Toast.LENGTH_SHORT).show();
        });
    }

    private void setupPatientFlow() {
        patientAdapter = new PatientFlowAdapter();
        rvPatients.setLayoutManager(new LinearLayoutManager(getContext()));
        rvPatients.setAdapter(patientAdapter);

        patientAdapter.setPatients(ClinicRepository.getInstance().getPatients());
        patientAdapter.setOnPatientStatusChangeListener(patient -> {
            // Advance patient stage
            switch (patient.getStatus()) {
                case WAITING:
                    patient.setStatus(Patient.ClinicStatus.IN_TRIAGE);
                    patient.setRoomNumber("Triage Bay A");
                    break;
                case IN_TRIAGE:
                    patient.setStatus(Patient.ClinicStatus.WITH_DOCTOR);
                    patient.setRoomNumber("Exam Room 3B");
                    break;
                case WITH_DOCTOR:
                    patient.setStatus(Patient.ClinicStatus.LAB_IMAGING);
                    patient.setRoomNumber("Lab 2 / Radiology");
                    break;
                case LAB_IMAGING:
                    patient.setStatus(Patient.ClinicStatus.DISCHARGED);
                    patient.setRoomNumber("Discharge Lounge");
                    break;
                case DISCHARGED:
                    patient.setStatus(Patient.ClinicStatus.WAITING);
                    patient.setRoomNumber("Waiting Lobby");
                    break;
            }
            patientAdapter.notifyDataSetChanged();

            User current = SessionManager.getInstance().getCurrentUser();
            String actorName = current != null ? current.getName() : "Triage Nurse";
            ClinicRepository.getInstance().logHipaaAction("PATIENT_FLOW_UPDATE", "PATIENT_STATUS", patient.getId(),
                    patient.getFullName() + " transitioned to " + patient.getStatus().name(),
                    actorName, patient.getMrn());

            Toast.makeText(getContext(), patient.getFullName() + " -> " + patient.getStatus().name(), Toast.LENGTH_SHORT).show();
        });
    }

    public void refreshPrivacyMask() {
        if (patientAdapter != null) {
            patientAdapter.notifyDataSetChanged();
        }
    }
}
