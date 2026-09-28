package com.careconnect.clinic.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.careconnect.clinic.R;
import com.careconnect.clinic.adapters.ChatMessageAdapter;
import com.careconnect.clinic.models.EncryptedMessage;
import com.careconnect.clinic.models.User;
import com.careconnect.clinic.repository.ClinicRepository;
import com.careconnect.clinic.security.CryptoManager;
import com.careconnect.clinic.security.SessionManager;
import java.util.List;
import java.util.UUID;

public class EncryptedChatFragment extends Fragment {
    private RecyclerView rvMessages;
    private ChatMessageAdapter adapter;
    private EditText etInput;
    private ImageButton btnSend;
    private TextView tvChannelTitle;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_encrypted_chat, container, false);
        initViews(view);
        setupChat();
        return view;
    }

    private void initViews(View view) {
        rvMessages = view.findViewById(R.id.rv_chat_messages);
        etInput = view.findViewById(R.id.et_chat_input);
        btnSend = view.findViewById(R.id.btn_send_chat);
        tvChannelTitle = view.findViewById(R.id.tv_active_channel_title);

        btnSend.setOnClickListener(v -> sendMessage());
    }

    private void setupChat() {
        adapter = new ChatMessageAdapter();
        User currentUser = SessionManager.getInstance().getCurrentUser();
        String currentId = currentUser != null ? currentUser.getId() : "usr_d1";
        adapter.setCurrentUserId(currentId);

        rvMessages.setLayoutManager(new LinearLayoutManager(getContext()));
        rvMessages.setAdapter(adapter);

        List<EncryptedMessage> messages = ClinicRepository.getInstance().getEncryptedMessages();
        adapter.setMessages(messages);
        if (!messages.isEmpty()) {
            rvMessages.scrollToPosition(messages.size() - 1);
        }
    }

    private void sendMessage() {
        String text = etInput.getText().toString().trim();
        if (text.isEmpty()) return;

        User user = SessionManager.getInstance().getCurrentUser();
        String senderId = user != null ? user.getId() : "usr_d1";
        String senderName = user != null ? user.getName() : "Dr. Elena Vance, MD";
        String senderRole = user != null ? user.getRole().name() : "DOCTOR";

        // Encrypt message using AES-256 GCM in memory
        CryptoManager crypto = CryptoManager.getInstance();
        CryptoManager.EncryptedResult enc = crypto.encrypt(text);

        EncryptedMessage msg = new EncryptedMessage(
                "msg_" + UUID.randomUUID().toString().substring(0, 6),
                "ch_triage", senderId, senderName, senderRole,
                "usr_n1", "Sarah Jenkins, RN", text);
        msg.setEncryptedCiphertext(enc.ciphertextBase64);
        msg.setIv(enc.ivBase64);

        ClinicRepository.getInstance().addEncryptedMessage(msg);

        adapter.setMessages(ClinicRepository.getInstance().getEncryptedMessages());
        rvMessages.scrollToPosition(ClinicRepository.getInstance().getEncryptedMessages().size() - 1);
        etInput.setText("");

        Toast.makeText(getContext(), "Message AES-256 GCM Encrypted & Sent", Toast.LENGTH_SHORT).show();
    }
}
