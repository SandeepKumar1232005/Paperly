import React from 'react';
import { AssignmentStatus } from '../types';

interface StatusBadgeProps {
  status: AssignmentStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles: Record<string, string> = {
    [AssignmentStatus.PENDING]: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    [AssignmentStatus.PENDING_REVIEW]: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    [AssignmentStatus.ASSIGNED]: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    [AssignmentStatus.IN_PROGRESS]: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    [AssignmentStatus.SUBMITTED]: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    [AssignmentStatus.COMPLETED]: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    [AssignmentStatus.REVISION]: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    [AssignmentStatus.PENDING_WRITER_ACCEPTANCE]: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    [AssignmentStatus.REJECTED]: 'bg-red-500/10 text-red-400 border-red-500/20',
    [AssignmentStatus.CANCELLED]: 'bg-[var(--surface)] text-[var(--text-tertiary)] border-[var(--border)]',
  };

  const dotColors: Record<string, string> = {
    [AssignmentStatus.PENDING]: 'bg-amber-500 animate-pulse',
    [AssignmentStatus.PENDING_REVIEW]: 'bg-blue-500 animate-pulse',
    [AssignmentStatus.ASSIGNED]: 'bg-violet-500',
    [AssignmentStatus.IN_PROGRESS]: 'bg-purple-500 animate-pulse',
    [AssignmentStatus.SUBMITTED]: 'bg-cyan-500',
    [AssignmentStatus.COMPLETED]: 'bg-emerald-500',
    [AssignmentStatus.REVISION]: 'bg-orange-500 animate-pulse',
    [AssignmentStatus.PENDING_WRITER_ACCEPTANCE]: 'bg-amber-500 animate-pulse',
    [AssignmentStatus.REJECTED]: 'bg-red-500',
    [AssignmentStatus.CANCELLED]: 'bg-gray-400',
  };

  const labels: Record<string, string> = {
    [AssignmentStatus.PENDING]: 'AWAITING WRITER',
    [AssignmentStatus.PENDING_REVIEW]: 'QUOTE RECEIVED',
    [AssignmentStatus.ASSIGNED]: 'ACCEPTED — STARTING',
    [AssignmentStatus.IN_PROGRESS]: 'IN PROGRESS',
    [AssignmentStatus.SUBMITTED]: 'SUBMITTED FOR REVIEW',
    [AssignmentStatus.COMPLETED]: 'COMPLETED',
    [AssignmentStatus.REVISION]: 'REVISION REQUESTED',
    [AssignmentStatus.PENDING_WRITER_ACCEPTANCE]: 'AWAITING WRITER',
    [AssignmentStatus.REJECTED]: 'REJECTED',
    [AssignmentStatus.CANCELLED]: 'CANCELLED',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wide ${styles[status] || ''}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[status] || 'bg-gray-400'}`} />
      {labels[status] || status.replace('_', ' ')}
    </span>
  );
};

export default StatusBadge;
