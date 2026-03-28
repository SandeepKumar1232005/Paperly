import React from 'react';
import { AssignmentStatus } from '../types';

interface StatusBadgeProps {
  status: AssignmentStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles: Record<AssignmentStatus, string> = {
<<<<<<< HEAD
    [AssignmentStatus.PENDING]: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    [AssignmentStatus.PENDING_REVIEW]: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    [AssignmentStatus.QUOTED]: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    [AssignmentStatus.CONFIRMED]: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    [AssignmentStatus.ASSIGNED]: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    [AssignmentStatus.IN_PROGRESS]: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    [AssignmentStatus.SUBMITTED]: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    [AssignmentStatus.COMPLETED]: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    [AssignmentStatus.REVISION]: 'bg-red-500/10 text-red-400 border-red-500/20',
    [AssignmentStatus.CANCELLED]: 'bg-white/10 text-white/40 border-white/20',
  };

  return (
    <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${styles[status]}`}>
=======
    [AssignmentStatus.PENDING]: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    [AssignmentStatus.PENDING_REVIEW]: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    [AssignmentStatus.QUOTED]: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    [AssignmentStatus.CONFIRMED]: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    [AssignmentStatus.ASSIGNED]: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    [AssignmentStatus.IN_PROGRESS]: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    [AssignmentStatus.SUBMITTED]: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    [AssignmentStatus.COMPLETED]: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    [AssignmentStatus.REVISION]: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    [AssignmentStatus.CANCELLED]: 'bg-[var(--surface)] text-[var(--text-tertiary)] border-[var(--border)]',
  };

  const dotColors: Record<AssignmentStatus, string> = {
    [AssignmentStatus.PENDING]: 'bg-amber-500',
    [AssignmentStatus.PENDING_REVIEW]: 'bg-amber-500',
    [AssignmentStatus.QUOTED]: 'bg-cyan-500',
    [AssignmentStatus.CONFIRMED]: 'bg-sky-500',
    [AssignmentStatus.ASSIGNED]: 'bg-blue-500',
    [AssignmentStatus.IN_PROGRESS]: 'bg-rose-500 animate-pulse',
    [AssignmentStatus.SUBMITTED]: 'bg-purple-500',
    [AssignmentStatus.COMPLETED]: 'bg-emerald-500',
    [AssignmentStatus.REVISION]: 'bg-red-500',
    [AssignmentStatus.CANCELLED]: 'bg-gray-400',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wide ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[status]}`} />
>>>>>>> master
      {status.replace('_', ' ')}
    </span>
  );
};

export default StatusBadge;
<<<<<<< HEAD



=======
>>>>>>> master
