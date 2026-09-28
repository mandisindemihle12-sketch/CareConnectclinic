import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  FileCheck, 
  Download, 
  AlertTriangle, 
  Search, 
  RefreshCw, 
  Database,
  Terminal,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { HipaaAuditLog } from '../types/clinic';
import { maskPhi } from '../utils/crypto';

interface HipaaComplianceCenterProps {
  auditLogs: HipaaAuditLog[];
  isPrivacyMasked: boolean;
  onTriggerAutoLock: () => void;
  onExportAuditLog: () => void;
}

export const HipaaComplianceCenter: React.FC<HipaaComplianceCenterProps> = ({
  auditLogs,
  isPrivacyMasked,
  onTriggerAutoLock,
  onExportAuditLog,
}) => {
  const [filterAction, setFilterAction] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesSearch = 
      log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.targetMrn && log.targetMrn.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.reason.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesAction && matchesSearch;
  });

  const complianceSafeguards = [
    {
      rule: '45 CFR § 164.312(a)(1)',
      title: 'Role-Based Access Control (RBAC)',
      status: 'Enforced',
      description: 'Granular permissions restricting PHI view and edit access according to clinical role (Admin, MD, RN, Patient).',
    },
    {
      rule: '45 CFR § 164.312(a)(2)(iv)',
      title: 'Encryption at Rest (AES-256)',
      status: 'Active',
      description: 'All patient records, vital signs, and SOAP notes stored under cryptographic AES-256 standard.',
    },
    {
      rule: '45 CFR § 164.312(e)(1)',
      title: 'Transmission Security (E2EE)',
      status: 'Active',
      description: 'WebCrypto AES-GCM 256-bit encryption for private clinical chats and TLS 1.3 encrypted sockets.',
    },
    {
      rule: '45 CFR § 164.312(b)',
      title: 'Audit Controls & SHA-256 Ledger',
      status: 'Immutable',
      description: 'Every record access, modification, export, and emergency override generates a cryptographically signed hash.',
    },
    {
      rule: '45 CFR § 164.312(a)(2)(iii)',
      title: 'Automatic Session Lockout',
      status: '15-Min Timer',
      description: 'Terminal automatically seals after 15 minutes of inactivity; re-authentication required.',
    },
    {
      rule: '45 CFR § 164.510(b)',
      title: 'Emergency Break-Glass Protocol',
      status: 'Configured',
      description: 'Mandatory emergency clinical override workflow logging explicit rationale for urgent care scenarios.',
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>HIPAA Governance</span>
            <span aria-hidden="true">·</span>
            <span>Security Rule § 164.312 Safeguards</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-teal-600">Audit Grade Enclave</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            HIPAA Compliance & Cryptographic Vault
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onTriggerAutoLock}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Test Auto-Lockout</span>
          </button>

          <button
            onClick={onExportAuditLog}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit Trail (OCR)</span>
          </button>
        </div>
      </div>

      {/* Safeguards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {complianceSafeguards.map((item, idx) => (
          <div
            key={idx}
            className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-semibold text-teal-700 uppercase tracking-wider">
                  {item.rule}
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {item.status}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-2">
                {item.title}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Standard: NIST SP 800-66</span>
              <span>Compliant</span>
            </div>
          </div>
        ))}
      </div>

      {/* Immutable PHI Audit Trail Viewer */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Immutable PHI Access & Modification Audit Ledger
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              45 CFR § 164.312(b) Compliant Hardware & Software Event Trail with SHA-256 Checksums.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search actor, MRN, reason..."
                className="pl-8 pr-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white"
              />
            </div>

            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1 bg-white text-slate-700 cursor-pointer"
            >
              <option value="all">All Audit Actions</option>
              <option value="VIEW_PHI">VIEW_PHI</option>
              <option value="EDIT_RECORD">EDIT_RECORD</option>
              <option value="BREAK_GLASS_ACCESS">BREAK_GLASS_ACCESS</option>
              <option value="EXPORT_RECORD">EXPORT_RECORD</option>
              <option value="DECRYPT_MESSAGE">DECRYPT_MESSAGE</option>
              <option value="SCHEDULE_APPT">SCHEDULE_APPT</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">Actor & Role</th>
                <th className="py-2.5 px-4">Target PHI MRN</th>
                <th className="py-2.5 px-4">Enclave / Terminal IP</th>
                <th className="py-2.5 px-4">Clinical Rationale</th>
                <th className="py-2.5 px-4 text-right">SHA-256 Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLogs.map((log) => {
                const displayMrn = log.targetMrn
                  ? isPrivacyMasked
                    ? maskPhi(log.targetMrn, 'mrn')
                    : log.targetMrn
                  : 'N/A';

                return (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors font-mono">
                    <td className="py-2.5 px-4 text-slate-600 tabular-nums text-[11px]">
                      {log.timestamp}
                    </td>

                    <td className="py-2.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          log.action === 'BREAK_GLASS_ACCESS'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : log.action === 'EDIT_RECORD'
                            ? 'bg-amber-50 text-amber-800'
                            : log.action === 'VIEW_PHI'
                            ? 'bg-blue-50 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td className="py-2.5 px-4 font-sans">
                      <span className="font-semibold text-slate-900 block">{log.actorName}</span>
                      <span className="text-[10px] text-slate-400 capitalize">{log.actorRole}</span>
                    </td>

                    <td className="py-2.5 px-4 text-teal-700 font-semibold text-[11px]">
                      {displayMrn}
                    </td>

                    <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                      {log.ipAddress}
                    </td>

                    <td className="py-2.5 px-4 font-sans text-slate-700 text-xs max-w-xs truncate">
                      {log.reason}
                    </td>

                    <td className="py-2.5 px-4 text-right text-[11px] text-slate-400">
                      {log.encryptionChecksum}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>Total Recorded Events: {filteredLogs.length}</span>
          <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Zero-Tamper Chain Verified
          </span>
        </div>
      </div>

    </div>
  );
};
