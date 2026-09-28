package com.careconnect.clinic.adapters;

import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.careconnect.clinic.R;
import com.careconnect.clinic.models.EncryptedMessage;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class ChatMessageAdapter extends RecyclerView.Adapter<ChatMessageAdapter.ViewHolder> {
    private List<EncryptedMessage> messages = new ArrayList<>();
    private String currentUserId = "";

    public void setCurrentUserId(String currentUserId) {
        this.currentUserId = currentUserId;
    }

    public void setMessages(List<EncryptedMessage> messages) {
        this.messages = messages;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_chat_message, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        EncryptedMessage msg = messages.get(position);
        holder.tvSenderName.setText(msg.getSenderName());
        holder.tvMessageText.setText(msg.getDecryptedContent());

        SimpleDateFormat sdf = new SimpleDateFormat("hh:mm a", Locale.getDefault());
        holder.tvTime.setText(sdf.format(new Date(msg.getTimestamp())));

        boolean isMe = msg.getSenderId().equals(currentUserId);
        LinearLayout.LayoutParams params = (LinearLayout.LayoutParams) holder.layoutBubble.getLayoutParams();
        if (isMe) {
            params.gravity = Gravity.END;
            holder.layoutBubble.setBackgroundResource(R.drawable.bg_badge_teal);
            holder.tvSenderName.setText("You (" + msg.getSenderRole() + ")");
        } else {
            params.gravity = Gravity.START;
            holder.layoutBubble.setBackgroundResource(R.drawable.bg_rounded_card);
        }
        holder.layoutBubble.setLayoutParams(params);
    }

    @Override
    public int getItemCount() {
        return messages.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        LinearLayout layoutBubble;
        TextView tvSenderName, tvEnclaveTag, tvMessageText, tvTime;

        ViewHolder(View itemView) {
            super(itemView);
            layoutBubble = itemView.findViewById(R.id.layout_message_bubble);
            tvSenderName = itemView.findViewById(R.id.tv_sender_name);
            tvEnclaveTag = itemView.findViewById(R.id.tv_enclave_tag);
            tvMessageText = itemView.findViewById(R.id.tv_message_text);
            tvTime = itemView.findViewById(R.id.tv_time);
        }
    }
}
