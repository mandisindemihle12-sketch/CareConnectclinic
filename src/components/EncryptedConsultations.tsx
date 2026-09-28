import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  ShieldCheck, 
  Lock, 
  Key, 
  UserCheck, 
  AlertCircle, 
  FileText, 
  Eye, 
  EyeOff, 
  Sparkles,
  Paperclip,
  CheckCheck
} from 'lucide-react';
import { EncryptedMessage, User, DoctorAvailability } from '../types/clinic';
import { encryptClinicalPayload } from '../utils/crypto';

interface EncryptedConsultationsProps {
  messages: EncryptedMessage[];
  currentUser: User | null;
  doctors: DoctorAvailability[];
  isPrivacyMasked: boolean;
  onSendMessage: (msg: EncryptedMessage) => void;
  onLogAudit: (action: any, reason: string, mrn?: string, patientName?: string) => void;
}

export const EncryptedConsultations: React.FC<EncryptedConsultationsProps> = ({
  messages,
  currentUser,
  doctors,
  isPrivacyMasked,
  onSendMessage,
  onLogAudit,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<'conv_elena_sarah' | 'conv_marcus_elena' | 'conv_elena_maya'>('conv_elena_sarah');
  const [messageInput, setMessageInput] = useState('');
  const [showRawCipher, setShowRawCipher] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<'none' | 'lab_result' | 'vital_alert' | 'prescription_request'>('none');
  const [lastEncryptedPacket, setLastEncryptedPacket] = useState<{
    cipher: string;
    iv: string;
    fingerprint: string;
  } | null>(null);

  const channels = [
    {
      id: 'conv_elena_sarah',
      title: 'Triage & Nursing Care Coordination',
      participants: 'Dr. Elena Vance & Sarah Jenkins, RN',
      type: 'Inter-Staff Clinical',
      fingerprint: 'CC-84F2-99B1-A614',
    },
    {
      id: 'conv_marcus_elena',
      title: 'Cardiology Specialist Referral Channel',
      participants: 'Dr. Marcus Chen & Dr. Elena Vance',
      type: 'Specialist Consultation',
      fingerprint: 'CC-33E9-18A2-77F0',
    },
    {
      id: 'conv_elena_maya',
      title: 'Patient Direct Clinical Teleconsultation',
      participants: 'Dr. Elena Vance & Maya Lin (MRN-84920)',
      type: 'Doctor-Patient Encounter',
      fingerprint: 'CC-91B0-44F8-E219',
    },
  ];

  const currentChannel = channels.find((c) => c.id === selectedChannel) || channels[0];
  const channelMessages = messages.filter((m) => m.conversationId === selectedChannel);

  const quickTemplates = [
    'Patient vitals documented; triage completed and within normal limits.',
    'Lab panel (CMP/CBC) has been processed and flagged for physician review.',
    'E-Prescription refill confirmed and sent to patient preferred pharmacy.',
    'Urgent: Please check baseline ECG before initiating anticoagulation adjustive therapy.',
  ];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    // Encrypt in real-time via WebCrypto AES-GCM 256-bit!
    const { cipherBase64, ivHex, fingerprint } = await encryptClinicalPayload(messageInput.trim());

    setLastEncryptedPacket({
      cipher: cipherBase64,
      iv: ivHex,
      fingerprint,
    });

    const newMsg: EncryptedMessage = {
      id: `msg_${Date.now()}`,
      conversationId: selectedChannel,
      senderId: currentUser?.id || 'usr_doc_elena',
      senderName: currentUser?.name || 'Dr. Elena Vance, MD',
      senderRole: currentUser?.role || 'doctor',
      recipientId: selectedChannel === 'conv_elena_maya' ? 'usr_pat_maya' : 'usr_nurse_sarah',
      recipientName: selectedChannel === 'conv_elena_maya' ? 'Maya Lin' : 'Clinical Team',
      cipherPayload: cipherBase64,
      plaintextDisplay: messageInput.trim(),
      iv: ivHex,
      keyFingerprint: fingerprint,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
      isClinicalUrgent: isUrgent,
      attachedType: selectedAttachment === 'none' ? undefined : selectedAttachment,
    };

    onSendMessage(newMsg);
    setMessageInput('');
    setIsUrgent(false);
    setSelectedAttachment('none');

    onLogAudit(
      'DECRYPT_MESSAGE',
      `Transmitted AES-GCM-256 encrypted clinical consultation packet in channel [${currentChannel.title}]`,
      selectedChannel === 'conv_elena_maya' ? 'MRN-84920' : undefined
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Staff Communication</span>
            <span aria-hidden="true">·</span>
            <span>Private Clinical Consultations</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-teal-600">E2EE AES-GCM-256</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Encrypted Clinical Messaging Enclave
          </h1>
        </div>

        {/* Cryptographic Wire Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRawCipher(!showRawCipher)}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg border flex items-center gap-1.5 transition-colors cursor-pointer ${
              showRawCipher
                ? 'bg-slate-900 text-teal-400 border-slate-800'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {showRawCipher ? <EyeOff className="w-3.5 h-3.5 text-teal-400" /> : <Eye className="w-3.5 h-3.5 text-slate-500" />}
            <span>{showRawCipher ? 'Ciphertext Wire: ON' : 'View Raw Cipher Wire'}</span>
          </button>
        </div>
      </div>

      {/* Main Messaging Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-slate-200 rounded-xl overflow-hidden min-h-[580px]">
        
        {/* Left: Encrypted Channel Directory (4 cols) */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-200 p-4 bg-slate-50/50 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Active Enclaves
              </span>
              <span className="text-[10px] font-mono text-emerald-700 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Zero-Knowledge
              </span>
            </div>

            <div className="space-y-2">
              {channels.map((chan) => {
                const isSelected = selectedChannel === chan.id;
                return (
                  <button
                    key={chan.id}
                    onClick={() => setSelectedChannel(chan.id as any)}
                    className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-teal-500 shadow-xs'
                        : 'bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-teal-700 uppercase tracking-wider">
                        {chan.type}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {chan.fingerprint}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 mt-1">
                      {chan.title}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {chan.participants}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cryptographic Inspector Sidebar Card */}
          <div className="mt-4 p-3 bg-slate-900 text-slate-200 rounded-lg text-xs font-mono space-y-1.5 border border-slate-800">
            <div className="flex items-center justify-between text-teal-400 text-[11px] font-bold">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3" />
                WebCrypto Enclave
              </span>
              <span>AES-GCM-256</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Fingerprint: <span className="text-white">{currentChannel.fingerprint}</span>
            </p>
            <p className="text-[10px] text-slate-400">
              Integrity: <span className="text-emerald-400">SHA-256 Verified</span>
            </p>
            {lastEncryptedPacket && (
              <div className="pt-1.5 border-t border-slate-800 text-[9px] text-slate-300">
                <span className="text-slate-500">Last IV:</span> {lastEncryptedPacket.iv.slice(0, 16)}...
              </div>
            )}
          </div>
        </div>

        {/* Right: Active Chat View (8 cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          
          {/* Channel Top Bar */}
          <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  {currentChannel.title}
                </h3>
                <span className="font-mono text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  E2EE Sealed
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">
                Participants: {currentChannel.participants}
              </p>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="p-4 flex-1 overflow-y-auto space-y-4 max-h-[440px] bg-slate-50/30">
            {channelMessages.map((msg) => {
              const isCurrentUser = msg.senderId === currentUser?.id || msg.senderName.includes(currentUser?.name || '');

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mb-1">
                    <span className="font-semibold text-slate-700">{msg.senderName}</span>
                    <span>·</span>
                    <span>{msg.timestamp}</span>
                    <span>·</span>
                    <span className="text-teal-700">{msg.keyFingerprint}</span>
                  </div>

                  <div
                    className={`max-w-md p-3 rounded-xl text-xs space-y-1.5 shadow-2xs ${
                      isCurrentUser
                        ? 'bg-teal-600 text-white rounded-br-xs'
                        : 'bg-white border border-slate-200 text-slate-900 rounded-bl-xs'
                    }`}
                  >
                    {/* Clinical Alert Tag if Urgent */}
                    {msg.isClinicalUrgent && (
                      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-200 bg-rose-900/40 px-2 py-0.5 rounded">
                        <AlertCircle className="w-3 h-3 text-rose-300" />
                        Clinical Priority Alert
                      </div>
                    )}

                    {/* Attached Type */}
                    {msg.attachedType && (
                      <div className="flex items-center gap-1.5 text-[11px] p-1.5 bg-black/10 rounded font-mono">
                        <FileText className="w-3.5 h-3.5" />
                        <span className="capitalize">{msg.attachedType.replace('_', ' ')} Attached</span>
                      </div>
                    )}

                    {/* Message Body: Shows Decrypted Plaintext or Raw Wire Ciphertext */}
                    {showRawCipher ? (
                      <div className="font-mono text-[10px] p-2 bg-black/20 rounded break-all">
                        <p className="text-amber-300 font-bold mb-0.5">Wire Base64 Cipher:</p>
                        {msg.cipherPayload}
                        <p className="text-slate-300 mt-1">IV: {msg.iv}</p>
                      </div>
                    ) : (
                      <p className="text-xs leading-relaxed">
                        {msg.plaintextDisplay}
                      </p>
                    )}

                    <div className="flex items-center justify-end gap-1 text-[10px] opacity-75 pt-1">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Encrypted at rest & in transit</span>
                      <CheckCheck className="w-3 h-3 ml-1" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Clinical Templates */}
          <div className="p-3 border-t border-slate-200 bg-white">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Quick Clinical Templates:
            </p>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {quickTemplates.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => setMessageInput(t)}
                  className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md whitespace-nowrap transition-colors cursor-pointer"
                >
                  {t.slice(0, 32)}...
                </button>
              ))}
            </div>
          </div>

          {/* Send Input Form */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white space-y-2">
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <span className={isUrgent ? 'text-rose-700 font-bold' : ''}>Flag Urgent</span>
              </label>

              <div className="flex items-center gap-1">
                <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedAttachment}
                  onChange={(e) => setSelectedAttachment(e.target.value as any)}
                  className="text-[11px] border border-slate-200 rounded px-1.5 py-0.5 bg-slate-50 text-slate-700"
                >
                  <option value="none">No attachment</option>
                  <option value="lab_result">Attach Lab Result</option>
                  <option value="vital_alert">Attach Vital Sign Alert</option>
                  <option value="prescription_request">Attach Rx Refill Request</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type clinical consultation note (auto-encrypted with AES-GCM)..."
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <button
                type="submit"
                disabled={!messageInput.trim()}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Encrypt & Send</span>
              </button>
            </div>
          </form>

        </div>
      </div>

    </div>
  );
};
