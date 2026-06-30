// TypeScript Data Models for Schmidt Construction Estimating System
// Location: src/lib/types.ts

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  created_at: string;
}

export type ProjectType =
  | 'retaining wall'
  | 'concrete'
  | 'drainage'
  | 'kitchen remodel'
  | 'bathroom remodel'
  | 'commercial'
  | 'other';

export type ProjectStatus = 'Planning' | 'Active' | 'Completed' | 'Cancelled';

export interface Project {
  id: string;
  client_id: string;
  name: string;
  type: ProjectType;
  job_site_address: string;
  description: string;
  desired_start_date: string;
  status: ProjectStatus;
  created_at: string;
}

export type ProposalStatus =
  | 'Draft'
  | 'Sent'
  | 'Viewed'
  | 'Revised'
  | 'Accepted'
  | 'Rejected'
  | 'Expired';

export interface Proposal {
  id: string;
  project_id: string;
  proposal_number: string;
  current_version_id: string | null;
  status: ProposalStatus;
  share_token: string;
  expiration_date: string; // Expiration tracking
  created_by?: string;
  created_at: string;
}

export interface ProposalVersion {
  id: string;
  proposal_id: string;
  version_number: number;
  title: string;
  scope_of_work: string;
  assumptions: string;
  exclusions: string;
  timeline: string;
  payment_terms: string;
  warranty_notes: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  internal_notes: string; // Hidden from client
  client_message: string; // Accompanying note
  created_at: string;
}

export interface ProposalLineItem {
  id: string;
  proposal_version_id: string;
  category: string;
  description: string;
  quantity: number;
  unit: string; // LF, SF, CY, EA, Days, Hours, etc.
  unit_cost: number;
  markup_percent: number;
  line_total: number;
  optional: boolean;
}

export type SenderType = 'owner' | 'client' | 'system';

export interface NegotiationEvent {
  id: string;
  proposal_id: string;
  proposal_version_id: string | null;
  sender_type: SenderType;
  message: string;
  requested_changes: string;
  created_at: string;
}

// User context role helper
export type UserRole = 'admin' | 'estimator' | 'client';
export interface UserSession {
  role: UserRole;
  name: string;
  email?: string;
}

export interface AuditLog {
  id: string;
  proposal_id: string;
  user_id: string | null;
  action: string;
  details: string;
  created_at: string;
}
