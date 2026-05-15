export interface Employee {
  emp_id: string;
  emp_name: string;
  first_name?: string;
  last_name?: string;
  emp_type: EmployeeType;
  comp_id: string;
  comp_name?: string;
  dept_name?: string;
  position: string;
  emp_status: EmploymentStatus;
  bank_id: string;
  basic_pay: number | null;
  employee_start_date: string;
  employee_end_date: string | null;
  marital_stat?: string;
  birth_date?: string;
  sex?: string;
  // Log fields for context-based action logs
  audit_logs?: GeneralLog[];
  status_logs?: GeneralLog[];
}

export interface EmployeeLastPayHistory {
  emp_id: string;
  records: LastPayRecord[];
}

export type QuitClaimStatus =
  | "PENDING"
  | "FINALIZED"
  | "RELEASED"
  | "APPROVED"
  | "DISAPPROVED"
  | "DRAFT";
export type EmploymentStatus =
  | "Regular"
  | "Probationary"
  | "Contractual"
  | "Project-based"
  | "Part-time"
  | "Internship";
export type Company =
  | "EXXEL PRIME INT'L TRADING INC."
  | "EXXEL INTERNATIONAL TRADING INC"
  | "OMG NAIL COSMETICS"
  | "ORO SOCKS"
  | "MMC";
export type EmployeeType = "In-house" | "Promodiser";
export type AdditionalsTypeCode = "P" | "D"; // P = Payable, D = Deduction

// ─── Database Table Interfaces ─────────────────────────────────────────────────────

export interface GeneralLog {
  log_id: string;
  table_id: string;
  table_name: string; // "LastPayRecord", "AdditionalsType", etc.
  action: string; // CREATE, UPDATE, DELETE, STATUS_CHANGE, etc.
  details: Record<string, any>; // JSON column with specific change details
  performed_by: string;
  performed_at: string;
}

export interface LastPayRecord {
  remaining_days: number;
  last_pay_record_id: string;
  ref_no: string;
  lp_status: QuitClaimStatus;
  emp_id: string;
  emp_name: string;
  emp_type: string; // Required with default "Regular"
  comp_id: string;
  comp_name?: string; // Company name from LEFT JOIN
  department_id: string;
  dept_name?: string; // Department name from LEFT JOIN
  position: string;
  emp_status: string; // Will be abbreviated like 'Reg', 'Prob', etc.
  bank_id: string;
  basic_pay: number | null;
  last_pay: number;
  daily_rate: number;
  employee_start_date: string; // ISO date string
  employee_end_date: string; // ISO date string
  total_days_worked: number;
  cut_off_start_date: string; // ISO date string
  cut_off_end_date: string; // ISO date string
  lp_total_allowance?: number | null;
  lp_total_absents?: number;
  lp_total_late_amt?: number;
  lp_total_ut_amt?: number;
  lp_total_payables?: number;
  lp_total_deductions?: number;
  lp_total_loan_balance?: number | null; // Updated from lp_total_loans
  lp_total_ot?: number | null;
  lp_total_leave?: number | null;
  lp_total_tm: number;
  net_pay: number;
  released_at: string | null; // ISO datetime string
  released_by: string | null;
  created_by: string | null;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
  update_by: string | null;
  finalized_by: string | null;
  finalized_at: string | null; // ISO datetime string
  approved_by: string | null;
  approved_at: string | null; // ISO datetime string
  disapproved_by: string | null;
  disapproved_at: string | null; // ISO datetime string
  disapprove_remark?: string | null;

  // Backend computed properties from services.py - computed at runtime
  total_payables_computed: number;
  total_deductions_computed: number;
  computed_month13_remaining_balance?: number; // Computed 13th month balance
  computed_month13_daily_rate?: number; // Computed daily rate for 13th month
  total_loan_balance_computed: number;
  gross_amount_computed: number;
  accumulated_13th_month_computed: number;
  absent_days_computed: number;
  total_working_days_amount_computed: number;

  // Nested relations (for read operations)
  month13_salary_periods: Month13SalaryPeriod[];
  leave_monthly_breakdown?: LeaveMonthlyBreakdown[];
  payables?: AdditionalsType[];
  deductions?: AdditionalsType[];
  loans?: Loan[];
  allowances?: Allowances[];
  overtime?: Overtime[];
  audit_logs?: GeneralLog[];
  status_logs?: GeneralLog[];
}

export interface Allowances {
  allowance_id: string;
  last_pay_record_id?: string;
  allowance_desc: string;
  amount: number;
}

export interface AdditionalsType {
  ad_type_id: string;
  last_pay_record_id?: string;
  is_confidential?: "Y" | "N" | null;
  addtl_type: AdditionalsTypeCode;
  description: string;
  amount: number;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  created_by_role?: number | null; // Track which role created this item (1: superadmin, 2: finance, 3: hr, 4: manager)
}

export interface Month13SalaryPeriod {
  tm_id: string;
  last_pay_record_id?: string;
  month: number;  // 1-12 (January-December)
  total_amt: number;
  days_absent: number;
  year?: number; // Year for the month13 period
  period_start_date?: string; // Payroll period start date from serializer
  period_end_date?: string; // Payroll period end date from serializer
}

export interface LeaveMonthlyBreakdown {
  leave_id: string;
  last_pay_record_id?: string;
  coverage_month: number;  // 1-12 (January-December)
  days_used: number;  // integer (0-999)
  remaining: number;
}

export interface Loan {
  loan_id: string;
  last_pay_record_id?: string;
  loan_description: string;
  loan_amt: number;
  paid_amt: number | null;
  balance_amt: number; // Persisted DB field, auto-computed on save
}

export interface Overtime {
  overtime_id: string;
  last_pay_record_id?: string;
  date_granted: string;
  hours: number;
  rate: number;
  amount: number;
  description: string | null;
  ot_type: string;
}

export interface TimesheetRecord {
  timesheet_id: string;
  emp_id: string;
  emp_name: string;
  dept_name: string;
  comp_name: string;
  position?: string;
  uploaded_at?: string;
  uploaded_by?: string;
  updated_at?: string;
  updated_by?: string;
  total_days_worked?: number;
  total_absent_worked?: number;
  // Log fields for context-based action logs
  audit_logs?: GeneralLog[];
  status_logs?: GeneralLog[];
}


