import React from "react";
import { useLastPayContext } from "@/contexts/LastPayContext";
import { formatCurrency } from "@/helpers/currency";

// ─────────────────────────────────────────────────────────────────────────────
// TOTAL COLUMNS IN THE GRID
// Change this if you need more or fewer columns.
// ─────────────────────────────────────────────────────────────────────────────
const TOTAL_COLS = 12;

// ─────────────────────────────────────────────────────────────────────────────
// CELL STYLE
// Shared base style for every cell.
// ─────────────────────────────────────────────────────────────────────────────
const baseCell: React.CSSProperties = {
  border: "none",
  padding: "1px 2px",
  height: "16px",
  overflow: "hidden",
  whiteSpace: "nowrap",
  boxSizing: "border-box",
};

const bold: React.CSSProperties = { fontWeight: "bold" };

// ─────────────────────────────────────────────────────────────────────────────
// ROW CONFIG TYPE
//
// Each row is an array of CellConfig objects.
// A row's total colSpan values should add up to TOTAL_COLS.
//
// CellConfig fields:
//   span    – how many columns this cell spans (default: 1)
//   content – text/node to render (default: empty)
//   bold    – whether to bold the text (default: false)
//   dynamic – key into the DynamicValues map (evaluated at render time)
// ─────────────────────────────────────────────────────────────────────────────
type CellConfig = {
  span?: number;
  content?: React.ReactNode;
  bold?: boolean;
  dynamic?: string; // key in DynamicValues
};

type RowConfig = CellConfig[];

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: empty row
// Produces a single cell that spans all columns.
// ─────────────────────────────────────────────────────────────────────────────
const emptyRow = (): RowConfig => [{ span: TOTAL_COLS }];

// ─────────────────────────────────────────────────────────────────────────────
// STATIC LAYOUT CONFIG
//
// Edit THIS section to change labels, column widths, or row order.
// Use `dynamic` keys to reference live data (resolved below in getDynamicValues).
//
// Layout anatomy (12 columns):
//   Col 0-1   : left margin
//   Col 2-7   : label area (span 6)
//   Col 8     : primary value
//   Col 9-10  : secondary value / blank
//   Col 11    : far-right value
// ─────────────────────────────────────────────────────────────────────────────
const STATIC_ROWS: RowConfig[] = [
  // ── Rows 1–5: top blank spacer ──────────────────────────────────────────
  emptyRow(),
  emptyRow(),
  emptyRow(),
  emptyRow(),
  emptyRow(),

  // ── Row 6: Employee name ─────────────────────────────────────────────────
  [
    { span: 2 },
    { span: 6, bold: true, dynamic: "emp_name" },
    { span: 1 },
    { span: 1 },
    { span: 1 },
    { span: 1 },
  ],

  // ── Row 7: End date (far right) ──────────────────────────────────────────
  [
    { span: 11 },
    { bold: true, dynamic: "employee_end_date" },
  ],

  // ── Rows 8–10: blank spacer ───────────────────────────────────────────────
  emptyRow(),
  emptyRow(),
  emptyRow(),

  // ── Row 11: Salaries & Wages ──────────────────────────────────────────────
  [
    { span: 2 },
    { span: 6, bold: true, content: "SALARIES & WAGES" },
    { bold: true, dynamic: "last_pay" },
    { span: 3 },
  ],

  // ── Row 12: 13th month pay ────────────────────────────────────────────────
  [
    { span: 2 },
    { span: 6, bold: true, content: "13th month pay" },
    { bold: true, dynamic: "lp_total_tm" },
    { span: 3 },
  ],

  // NOTE: deductions and loans are rendered dynamically below (see SpreadsheetGrid)

  // ── Last & Final Monetary Claim label ─────────────────────────────────────
  [
    { span: 2 },
    { span: 6, bold: true, content: "LAST & FINAL MONETARY CLAIM" },
    { span: 4 },
  ],

  // ── Separation date label ─────────────────────────────────────────────────
  [
    { span: 2 },
    // ✏️ Edit the separation date here:
    { span: 6, bold: true, content: "separated on 3/2/2026" },
    { span: 4 },
  ],

  // ── Cash in bank ──────────────────────────────────────────────────────────
  [
    { span: 3 },
    { span: 7, bold: true, content: "cash in bank" },
    { span: 1 },
    { bold: true, dynamic: "net_pay" },
  ],

  // ── TOTAL row ─────────────────────────────────────────────────────────────
  [
    { span: 3 },
    { span: 4, bold: true, content: "TOTAL" },
    { span: 1 },
    { bold: true, dynamic: "gross_total" },
    { span: 1 },
    { span: 1 },
    { bold: true, dynamic: "gross_total" }, // repeated in col 11
  ],

  // ── Net pay (written out) ─────────────────────────────────────────────────
  [
    { span: 3 },
    { span: 9, bold: true, dynamic: "net_pay" },
  ],

  // ── Rows: bottom spacer ───────────────────────────────────────────────────
  emptyRow(),
  emptyRow(),
  emptyRow(),
  emptyRow(),
  emptyRow(),
  emptyRow(),

  // ── Signatories ───────────────────────────────────────────────────────────
  // ✏️ Edit signatory names here:
  [
    { span: 1 },
    { span: 2, bold: true, content: "MARY JOY" },
    { span: 3, bold: true, content: "SIR MIKE" },
    { span: 6 },
  ],
];

// ─────────────────────────────────────────────────────────────────────────────
// DYNAMIC VALUES RESOLVER
//
// Maps `dynamic` keys → formatted values derived from `data`.
// Add new keys here when you add new dynamic cells above.
// ─────────────────────────────────────────────────────────────────────────────
function getDynamicValues(data: any): Record<string, React.ReactNode> {
  const lastPay = Number(data.last_pay ?? 0);
  const thirteenthMonth = Number(data.lp_total_tm ?? 0);
  const additionalPayables =
    data?.payables?.reduce(
      (sum: number, p: any) => sum + (Number(p.amount) || 0),
      0
    ) || 0;
  const grossTotal = lastPay + thirteenthMonth + additionalPayables;

  return {
    emp_name: data.emp_name,
    employee_end_date: data.employee_end_date,
    last_pay: formatCurrency(lastPay),
    lp_total_tm: formatCurrency(thirteenthMonth),
    net_pay: formatCurrency(Number(data.net_pay)),
    gross_total: formatCurrency(grossTotal),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// RENDER HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function renderCell(
  cell: CellConfig,
  index: number,
  dynamicValues: Record<string, React.ReactNode>
) {
  const style: React.CSSProperties = {
    ...baseCell,
    ...(cell.bold ? bold : {}),
  };
  const content = cell.dynamic
    ? dynamicValues[cell.dynamic] ?? ""
    : cell.content ?? "";

  return (
    <td key={index} style={style} colSpan={cell.span ?? 1}>
      {content}
    </td>
  );
}

function renderRow(row: RowConfig, rowIndex: number, dynamicValues: Record<string, React.ReactNode>) {
  return (
    <tr key={rowIndex}>
      {row.map((cell, colIndex) => renderCell(cell, colIndex, dynamicValues))}
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DYNAMIC ROW BUILDERS
// These rows depend on variable-length arrays (deductions, loans).
// ─────────────────────────────────────────────────────────────────────────────

function DeductionRows({ deductions }: { deductions: any[] }) {
  return (
    <>
      {deductions?.map((deduction: any, index: number) => (
        <tr key={`deduction-${index}`}>
          <td style={baseCell} colSpan={3} />
          <td style={{ ...baseCell, ...bold }} colSpan={7}>
            {/* ✏️ Change description field name if your API uses a different key */}
            {deduction.description || "Deduction"}
          </td>
          <td style={baseCell} />
          <td style={{ ...baseCell, ...bold }}>
            {formatCurrency(Number(deduction.amount || 0))}
          </td>
        </tr>
      ))}
    </>
  );
}

function LoanRows({ loans }: { loans: any[] }) {
  return (
    <>
      {loans?.map((loan: any, index: number) => (
        <tr key={`loan-${index}`}>
          <td style={baseCell} colSpan={3} />
          <td style={{ ...baseCell, ...bold }} colSpan={7}>
            {/* ✏️ Change description/balance field names if your API uses different keys */}
            {loan.description || "Loan"}
          </td>
          <td style={baseCell} />
          <td style={{ ...baseCell, ...bold }}>
            {formatCurrency(Number(loan.loan_balance || 0))}
          </td>
        </tr>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SPLIT INDEX: rows before and after the dynamic section
//
// STATIC_ROWS indices:
//   0–11  → top section (up to and including 13th month pay)
//   12+   → bottom section (after loans/deductions)
//
// ✏️ Adjust DYNAMIC_SPLIT_INDEX if you add/remove rows above the deductions.
// ─────────────────────────────────────────────────────────────────────────────
const DYNAMIC_SPLIT_INDEX = 12;

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const SpreadsheetGrid: React.FC = () => {
  const { record: data } = useLastPayContext();
  const dynamicValues = getDynamicValues(data);

  const topRows = STATIC_ROWS.slice(0, DYNAMIC_SPLIT_INDEX);
  const bottomRows = STATIC_ROWS.slice(DYNAMIC_SPLIT_INDEX);

  return (
    <div style={{ padding: "8px", fontFamily: "Arial, sans-serif" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "11px",
          tableLayout: "fixed",
        }}
      >
        <tbody>
          {topRows.map((row, i) => renderRow(row, i, dynamicValues))}
          <DeductionRows deductions={data?.deductions ?? []} />
          <LoanRows loans={data?.loans ?? []} />
          {bottomRows.map((row, i) =>
            renderRow(row, DYNAMIC_SPLIT_INDEX + i, dynamicValues)
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SpreadsheetGrid;