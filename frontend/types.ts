
export type UserRole = 'STUDENT' | 'WRITER' | 'ADMIN';

export enum AssignmentStatus {
  PENDING = 'PENDING',
  PENDING_REVIEW = 'PENDING_REVIEW', // Writer submitted a quote, awaiting student decision
  ASSIGNED = 'ASSIGNED',             // Student accepted quote, writer is assigned
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  COMPLETED = 'COMPLETED',
  REVISION = 'REVISION',
  PENDING_WRITER_ACCEPTANCE = 'PENDING_WRITER_ACCEPTANCE', // Direct hire pending
  REJECTED = 'REJECTED', // Direct hire rejected
  CANCELLED = 'CANCELLED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string; // New: Added for checking registered username
  role: UserRole;
  avatar?: string;
  balance?: number; // Simulated wallet
  lastActive?: string; // ISO timestamp
  handwriting_samples?: string[];
  address?: string; // New
  availability_status?: 'ONLINE' | 'BUSY' | 'OFFLINE'; // New
  average_rating?: number;
  is_verified?: boolean; // For verification system
  handwriting_style?: string;
  handwriting_confidence?: number;
  handwriting_sample_url?: string;
  qr_code_url?: string; // New - For direct payments
  pricePerPage?: number; // Writer's rate per page in INR
  distance_km?: number | string; // Distance from current user
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  studentId: string;
  writerId?: string;
  deadline: string;
  status: AssignmentStatus;
  subject: string;
  budget: number;
  files: string[];
  submission?: string;
  feedback?: string;
  createdAt: string;
  paymentStatus: 'UNPAID' | 'ESCROW' | 'RELEASED' | 'PAID';
  quoted_amount?: number; // Writer's negotiated price
  revision_count?: number;
  quoteComment?: string; // Writer's pitch message with the quote
  quotingWriterId?: string; // Writer who submitted the quote (not yet assigned)
  provider?: User; // New - to match backend structure if needed
  rejectedBy?: string[]; // New - IDs of writers who rejected this
  attachment?: string | null; // New - URL/Path to attached file
  pages?: number; // New - Number of pages
  platform_fee?: number; // New - Platform fee deducted
  net_earnings?: number; // New - Writer's earnings after fee
  cancelledBy?: string; // New - For cancellation
  cancelledAt?: string; // New - For cancellation
  cancellationReason?: string; // New - For cancellation
  assignedWriterId?: string; // New - For direct hires
  assignmentType?: 'DIRECT' | 'MARKETPLACE' | 'PUBLIC'; // New - For direct hires
  preferredHandwritingStyles?: string[]; // New - e.g. 'NEAT', 'CURSIVE', etc.
  visibility?: 'ALL_WRITERS' | 'SELECTED_STYLES'; // New
}


export interface ChatMessage {
  id: string;
  assignmentId: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  replyTo?: {
    id: string;
    text: string;
    senderId: string;
  };
  attachment?: {
    name: string;
    url: string;
    type: string;
    size?: number;
    file?: File;
  };
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type?: 'ASSIGNMENT_CANCELLED' | string;
  title?: string;
  assignmentId?: string;
  studentId?: string;
  writerId?: string;
}
