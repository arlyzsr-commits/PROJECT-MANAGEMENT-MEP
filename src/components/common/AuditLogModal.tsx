import React, { useState } from 'react';
import { X, ShieldAlert, Clock, User, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose }) => {
  const { auditLogs, t } = useProject();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterAction, setFilterAction] = useState<string>('ALL');

  if (!isOpen) return null;

  const filteredLogs = auditLogs.filter(
    (log) => filterAction === 'ALL' || log.actionType === filterAction
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-4xl max-h-[85vh] flex flex-col rounded-2xl bg-[#142238] border border-[#00E5FF]/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#1f3556] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F3F7FF]">{t('nav_audit')}</h3>
              <p className="text-xs text-[#94A8C2]">
                Immutable system audit trail: user actions, before/after states & approvals
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
            >
              <option value="ALL">All Actions</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="APPROVE">APPROVE</option>
              <option value="REJECT">REJECT</option>
            </select>
            <button
              onClick={onClose}
              className="text-[#94A8C2] hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-16 text-[#94A8C2] text-xs">
              No audit records matching criteria. Any master data or progress edits are logged here automatically.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isExpanded = expandedId === log.id;
              const actionColors: Record<string, string> = {
                CREATE: 'bg-[#00D8B4]/15 text-[#00D8B4] border-[#00D8B4]/30',
                UPDATE: 'bg-[#2979FF]/15 text-[#2979FF] border-[#2979FF]/30',
                DELETE: 'bg-[#FF526B]/15 text-[#FF526B] border-[#FF526B]/30',
                APPROVE: 'bg-[#00E5FF]/15 text-[#00E5FF] border-[#00E5FF]/30',
                REJECT: 'bg-[#FFB74D]/15 text-[#FFB74D] border-[#FFB74D]/30',
              };

              return (
                <div
                  key={log.id}
                  className="rounded-xl bg-[#101B2E] border border-[#1f3556] p-3.5 hover:border-[#00E5FF]/40 transition"
                >
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          actionColors[log.actionType] || 'bg-gray-500/20 text-gray-300'
                        }`}
                      >
                        {log.actionType}
                      </span>
                      <span className="text-xs font-semibold text-[#F3F7FF]">{log.details}</span>
                      <span className="text-[11px] text-[#94A8C2] bg-[#142238] px-2 py-0.5 rounded">
                        {log.collection}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-[#94A8C2]">
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#00E5FF]" />
                        <span>{log.userEmail.split('@')[0]}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-[#00E5FF]" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (log.beforeData || log.afterData) && (
                    <div className="mt-4 pt-3 border-t border-[#1f3556] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {log.beforeData && (
                        <div className="rounded-lg bg-[#080F1D] p-3 border border-red-500/20">
                          <p className="text-[10px] font-bold text-[#FF526B] uppercase mb-1.5 flex items-center gap-1">
                            <FileText className="w-3 h-3" /> Before State
                          </p>
                          <pre className="text-[11px] text-[#94A8C2] whitespace-pre-wrap overflow-x-auto font-mono">
                            {JSON.stringify(JSON.parse(log.beforeData), null, 2)}
                          </pre>
                        </div>
                      )}
                      {log.afterData && (
                        <div className="rounded-lg bg-[#080F1D] p-3 border border-emerald-500/20">
                          <p className="text-[10px] font-bold text-[#00D8B4] uppercase mb-1.5 flex items-center gap-1">
                            <FileText className="w-3 h-3" /> After State
                          </p>
                          <pre className="text-[11px] text-[#94A8C2] whitespace-pre-wrap overflow-x-auto font-mono">
                            {JSON.stringify(JSON.parse(log.afterData), null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
