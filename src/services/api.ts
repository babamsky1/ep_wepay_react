import type {
  AdditionalsType, Allowances, Employee, LastPayRecord,
  LeaveMonthlyBreakdown, Loan, Month13SalaryPeriod, Overtime, GeneralLog,
  TimesheetRecord,
} from "@/types/lastPayTypes";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
type ApiResponse<T> = { data: T };
type LastPayGenerationResponse = LastPayRecord & { error?: string };

// Full CRUD endpoints - para sa GET, POST, PUT, DELETE
type FullEndpoints<T> = {
  list: (params?: Record<string, string | number | boolean | undefined>, signal?: AbortSignal) => Promise<ApiResponse<T[]>>;
  getByRef: (ref_no: string, signal?: AbortSignal) => Promise<ApiResponse<T>>;
  create: (data: T) => Promise<ApiResponse<T>>;
  update: (data: T) => Promise<ApiResponse<T>>;
  delete: (id: string | number, performedBy?: string) => Promise<ApiResponse<void>>;
};

// Read-only endpoints - para sa mga GET lang
type ReadOnlyEndpoints<T> = {
  list: (params?: Record<string, string | number | boolean | undefined>, signal?: AbortSignal) => Promise<ApiResponse<T[]>>;
  getByRef: (ref_no: string, signal?: AbortSignal) => Promise<ApiResponse<T>>;
};

// API type definitions - kung ano ang laman ng bawat endpoint
type Api = {
  lastPayRecords: FullEndpoints<LastPayRecord>;
  additionalsType: FullEndpoints<AdditionalsType>;
  employees: FullEndpoints<Employee>;

  // Read-only lang - walang create/edit/delete
  loanDetails: ReadOnlyEndpoints<Loan>;
  leaveMonthlyDetails: ReadOnlyEndpoints<LeaveMonthlyBreakdown>;
  month13SalaryDetails: ReadOnlyEndpoints<Month13SalaryPeriod>;
  overtimeDetails: ReadOnlyEndpoints<Overtime>;
  allowanceTable: ReadOnlyEndpoints<Allowances>;
  timesheetRecords: FullEndpoints<TimesheetRecord>;

  // General logs endpoint
  generalLogs: ReadOnlyEndpoints<GeneralLog>;

  // Business logic endpoints - para sa quit claim actions
  quitClaimActions: {
    updateStatus: (recordId: string, status: string, remark?: string, updatedBy?: string) => Promise<ApiResponse<LastPayRecord>>;
    reopen: (recordId: string, updatedBy?: string) => Promise<ApiResponse<LastPayRecord>>;
  };

  // Last Pay Generation endpoints
  lastPayGeneration: {
    generate: (params: { emp_id: string; active_user?: string; timesheet_id: string }) => Promise<ApiResponse<LastPayGenerationResponse>>;
  };

  // Timesheet specific endpoints
  timesheet: {
    upload: (formData: FormData) => Promise<ApiResponse<TimesheetRecord>>;
    update: (formData: FormData) => Promise<ApiResponse<TimesheetRecord>>;
    delete: (emp_id: string, performedBy?: string) => Promise<ApiResponse<void>>;
  };
};

// lahat ng API calls dadaan dito
const apiFetch = async <T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
  const url = new URL(`${API_BASE_URL}${endpoint}`);

  // Handle GET parameters
  if (options.method === "GET" && options.body && typeof options.body === "string") {
    const params = JSON.parse(options.body);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    delete options.body;
  }

  const res = await fetch(url.toString(), {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || body?.message || `Request failed with status ${res.status}`);
  }

  const response = await res.json();

  if (response.result === "success" && response.data) {
    return { data: response.data };
  }

  if (response.success !== undefined && response.data !== undefined) {
    return response;
  }

  return { data: response };
};

// Generic GET method with parameters
const apiGet = async <T>(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>
): Promise<ApiResponse<T>> => {
  return apiFetch<T>(endpoint, {
    method: "GET",
    body: params ? JSON.stringify(params) : undefined,
  });
};

// Full CRUD endpoints
const createFullEndpoints = <T>(baseUrl: string, idField?: string): FullEndpoints<T> => ({
  list: (params) => apiGet(`${baseUrl}/`, params),
  getByRef: (ref_no, signal) => apiFetch(`${baseUrl}/${ref_no}/`, { signal }),
  create: (data) => apiFetch(`${baseUrl}/create/`, { method: "POST", body: JSON.stringify(data) }),
  update: (data) => apiFetch(`${baseUrl}/edit/`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id, performedBy) => {
    const fieldName = idField || (baseUrl === "/additionals-type" ? "ad_type_id" : "last_pay_record_id");

    const body = performedBy
      ? { [fieldName]: id, performed_by: performedBy }
      : { [fieldName]: id };

    return apiFetch(`${baseUrl}/delete/`, {
      method: "DELETE",
      body: JSON.stringify(body),
    });
  },
});

// Read-only endpoints
const createReadOnlyEndpoints = <T>(baseUrl: string): ReadOnlyEndpoints<T> => ({
  list: (params) => apiGet(`${baseUrl}/`, params),
  getByRef: (ref_no, signal) => apiFetch(`${baseUrl}/${ref_no}/`, { signal }),
});

// Exported API
export const api: Api = {
  lastPayRecords: createFullEndpoints("/last-pay-records"),
  additionalsType: createFullEndpoints("/additionals-type"),
  employees: createFullEndpoints("/employees", "emp_id"),

  loanDetails: createReadOnlyEndpoints("/loan-details"),
  leaveMonthlyDetails: createReadOnlyEndpoints("/leave-monthly-details"),
  month13SalaryDetails: createReadOnlyEndpoints("/month13-salary-details"),
  overtimeDetails: createReadOnlyEndpoints("/overtime-details"),
  allowanceTable: createReadOnlyEndpoints("/allowances"),
  timesheetRecords: createFullEndpoints("/timesheet/records"),
  generalLogs: createReadOnlyEndpoints("/general-logs"),

  quitClaimActions: {
    updateStatus: (recordId, status, remark, updatedBy) =>
      apiFetch("/quit-claim/update-status/", {
        method: "PUT",
        body: JSON.stringify({
          last_pay_record_id: recordId,
          status,
          remark,
          updated_by: updatedBy ?? "system",
        }),
      }),

    reopen: (recordId, updatedBy) =>
      apiFetch("/quit-claim/reopen/", {
        method: "PUT",
        body: JSON.stringify({
          last_pay_record_id: recordId,
          updated_by: updatedBy ?? "system",
        }),
      }),
  },

  lastPayGeneration: {
    generate: async (params) => {
      const queryParams = new URLSearchParams({
        emp_id: params.emp_id,
        active_user: params.active_user || "system",
        timesheet_id: params.timesheet_id,
      });

      return await apiFetch<LastPayGenerationResponse>(
        `/generate-last-pay/?${queryParams}`,
        { method: "GET" }
      );
    },
  },

  timesheet: {
    upload: async (formData: FormData) => {
      const response = await fetch(`${API_BASE_URL}/timesheet/upload/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      if (!responseText) {
        throw new Error("Empty response from server");
      }

      const responseData = JSON.parse(responseText);
      if (responseData?.error) {
        throw new Error(responseData.error);
      }

      return { data: responseData.data };
    },

    update: async (formData: FormData) => {
      const response = await fetch(`${API_BASE_URL}/timesheet/update/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      if (!responseText) {
        throw new Error("Empty response from server");
      }

      const responseData = JSON.parse(responseText);
      if (responseData?.error) {
        throw new Error(responseData.error);
      }

      return { data: responseData.data };
    },

    delete: (emp_id: string, performedBy?: string) =>
      apiFetch(`/timesheet/delete/${emp_id}/`, {
        method: "DELETE",
        body: performedBy ? JSON.stringify({ performed_by: performedBy }) : undefined,
      }),
  },
};