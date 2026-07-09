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

// Phase 3: multiple contacts per client
export interface ClientContact {
  id: string;
  client_id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  is_primary: boolean;
  receives_proposals: boolean;
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
  expiration_date: string;
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
  internal_notes: string;
  client_message: string;
  created_at: string;
  // Phase 4 additions
  remarks?: string;
  deposit_percentage?: number;
  deposit_amount?: number;
  balance_due_text?: string;
  acceptance_language?: string;
  // Phase 5 additions
  wall_sections?: WallSection[];
}

// ============================================================
// PHASE 5: WALL DIMENSIONS & SAVED OPTIONS
// ============================================================

export interface WallSection {
  id: string;
  label: string;
  length_ft: number;
  height_ft: number;
  area_sf: number;
  notes?: string;
  include_in_total: boolean;
}

export interface SavedProposalOption {
  id: string;
  name: string;
  description?: string;
  category?: string;
  default_price: number;
  default_unit: string;
  default_quantity: number;
  default_markup_percent: number;
  line_item_type: LineItemType;
  client_selectable: boolean;
  selected_by_default: boolean;
  created_at: string;
  updated_at: string;
}

export type LineItemType = 'required' | 'optional' | 'phase' | 'alternate';

export interface ProposalLineItem {
  id: string;
  proposal_version_id: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  unit_cost: number;
  markup_percent: number;
  line_total: number;
  optional: boolean;
  // Phase 4 additions
  line_item_type?: LineItemType;
  client_selectable?: boolean;
  selected_by_default?: boolean;
  sort_order?: number;
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

// ============================================================
// PHASE 3: CATALOG SYSTEM
// ============================================================

export type CatalogItemType = 'material' | 'labor' | 'equipment' | 'assembly' | 'snippet' | 'template';

export interface CatalogCategory {
  id: string;
  parent_id: string | null;
  name: string;
  type: CatalogItemType;
  sort_order: number;
  created_at: string;
}

export interface CatalogItem {
  id: string;
  category_id: string | null;
  type: CatalogItemType;
  name: string;
  description: string;
  search_tags: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
  // Joined detail (populated on fetch)
  material?: MaterialDetail;
  labor?: LaborDetail;
  equipment?: EquipmentDetail;
  assembly?: AssemblyDetail;
  snippet?: SnippetDetail;
  category?: CatalogCategory;
}

export interface MaterialDetail {
  id: string;
  catalog_item_id: string;
  unit: string;
  unit_cost: number;
  default_markup: number;
  taxable: boolean;
  supplier_id: string | null;
  last_price_date: string | null;
}

export interface LaborDetail {
  id: string;
  catalog_item_id: string;
  skill_type: string;
  rate_per_hour: number;
  burden_rate: number;
  default_markup: number;
}

export interface EquipmentDetail {
  id: string;
  catalog_item_id: string;
  rate_type: 'hourly' | 'daily' | 'weekly';
  hourly_rate: number | null;
  daily_rate: number | null;
  weekly_rate: number | null;
  default_markup: number;
}

export interface AssemblyDetail {
  id: string;
  catalog_item_id: string;
  notes: string;
  components: AssemblyComponent[];
}

export interface AssemblyComponent {
  id: string;
  assembly_id: string;
  component_id: string;
  quantity: number;
  quantity_unit: string;
  quantity_formula: string | null;
  sort_order: number;
  // Joined
  component?: CatalogItem;
}

export interface SnippetDetail {
  id: string;
  catalog_item_id: string;
  content: string;
  insert_target: 'scope_of_work' | 'assumptions' | 'exclusions' | 'payment_terms' | 'warranty_notes';
}

export interface Supplier {
  id: string;
  name: string;
  contact_name: string;
  phone: string;
  email: string;
  account_num: string;
  notes: string;
  created_at: string;
}

// ============================================================
// PHASE 3: MEASUREMENT CALCULATORS
// ============================================================

export type MeasurementJobType = 'retaining_wall' | 'concrete_slab' | 'french_drain' | 'bathroom_remodel' | 'kitchen_remodel';

export interface MeasurementInput {
  key: string;
  label: string;
  unit: string;
  type: 'number' | 'select';
  options?: { label: string; value: number }[];
  default?: number;
}

export interface MeasurementResult {
  catalogItemName: string;
  quantity: number;
  unit: string;
  description: string;
  category: string;
}

export interface MeasurementTemplate {
  jobType: MeasurementJobType;
  name: string;
  icon: string;
  inputs: MeasurementInput[];
  calculate: (inputs: Record<string, number>) => MeasurementResult[];
}

// Result of inserting from catalog picker into the proposal editor
export interface CatalogInsertResult {
  type: 'line_items' | 'snippet';
  // For line_items (materials, labor, equipment, assemblies)
  lineItems?: Omit<ProposalLineItem, 'id' | 'proposal_version_id' | 'optional'>[];
  // For snippets
  snippetContent?: string;
  snippetTarget?: SnippetDetail['insert_target'];
}

// ============================================================
// PHASE 7: EMPLOYEE TIME CLOCK
// ============================================================

export type EmployeeRole = 'employee' | 'admin';

export interface Employee {
  id: string;
  user_id: string | null; // Supabase Auth user link
  name: string;
  email: string;
  role: EmployeeRole;
  hourly_rate: number;
  active: boolean;
  created_at: string;
}

export interface TimeEntry {
  id: string;
  employee_id: string;
  clock_in: string;          // ISO timestamp
  clock_out: string | null;  // null while shift is open (currently clocked in)
  break_minutes: number;
  project_id: string | null; // optional job-costing link
  notes: string;
  created_at: string;
}

// A single entry with its computed worked hours (net of break).
export interface TimeEntryWithHours extends TimeEntry {
  worked_hours: number; // (clock_out - clock_in) - break, in hours; 0 if still open
  is_open: boolean;
}

// Payroll rollup for one employee over a date range (e.g. a pay period or week).
export interface TimesheetSummary {
  employee_id: string;
  employee_name: string;
  hourly_rate: number;
  total_hours: number;
  regular_hours: number;   // capped at 40/week across the range
  overtime_hours: number;  // hours beyond 40 in any ISO week
  regular_pay: number;
  overtime_pay: number;    // paid at 1.5x
  total_pay: number;
  entries: TimeEntryWithHours[];
}
