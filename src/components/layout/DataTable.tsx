import React, { useMemo, useCallback, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  GridReadyEvent,
  SelectionChangedEvent,
} from "ag-grid-community";

// Constants
const DEFAULT_PAGE_SIZE = 25;
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const ROW_HEIGHT = 48;
const HEADER_HEIGHT = 80;
const MAX_VISIBLE_ROWS = 20;

const THEME_CLASSES = {
  legacy: "",
  "ag-theme-alpine": "ag-theme-alpine",
  "ag-theme-balham": "ag-theme-balham",
  "ag-theme-material": "ag-theme-material",
} as const;

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  minWidth?: number;
  render?: (value: string, row: T) => React.ReactNode;

  // AG Grid specific
  sortable?: boolean;
  filter?:
    | boolean
    | "agTextColumnFilter"
    | "agNumberColumnFilter"
    | "agDateColumnFilter";
  pinned?: "left" | "right" | null;
  resizable?: boolean;
  editable?: boolean;
  width?: number;
  flex?: number;
}

export interface DataTableProps<T extends Record<string, unknown>> {
  data: T[];
  idField?: keyof T;
  columns: Column<T>[];
  className?: string;
  maxHeight?: string;
  emptyMessage?: string;

  // AG Grid - minimal set
  enableSorting?: boolean;
  enableFilter?: boolean;
  paginationPageSize?: number;
  rowSelection?: "single" | "multiple";
  theme?:
    | "legacy"
    | "ag-theme-alpine"
    | "ag-theme-balham"
    | "ag-theme-material";
  onGridReady?: (params: GridReadyEvent) => void;
  onSelectionChanged?: (event: SelectionChangedEvent<T, T>) => void;
}

export const DataTable = <T extends Record<string, unknown>>({
  data,
  idField,
  columns,
  className = "",
  maxHeight,
  emptyMessage = "No data available",

  enableSorting = true,
  enableFilter = true,
  paginationPageSize = DEFAULT_PAGE_SIZE,
  theme = "legacy",
  onGridReady,
  onSelectionChanged,
  rowSelection = "single",
}: DataTableProps<T>) => {
  // Use the provided page size or default
  const effectivePageSize = useMemo(() => {
    return paginationPageSize || DEFAULT_PAGE_SIZE;
  }, [paginationPageSize]);

  // Single source for height calculation
  const gridHeight = useMemo(() => {
    if (maxHeight) return maxHeight;
    if (!effectivePageSize) return "400px";
    return `${Math.min(effectivePageSize, MAX_VISIBLE_ROWS) * ROW_HEIGHT + HEADER_HEIGHT}px`;
  }, [maxHeight, effectivePageSize]);

  const paginationPageSizeSelector = PAGE_SIZE_OPTIONS;

  const columnDefs = useMemo<ColDef[]>(
    () =>
      columns.map(
        ({
          key,
          header,
          minWidth,
          width,
          flex,
          sortable,
          filter,
          pinned,
          resizable,
          editable,
          render,
          className,
        }) => ({
          field: key,
          headerName: header,
          minWidth: minWidth ?? 120,
          width,
          flex,
          sortable: enableSorting && sortable !== false,
          filter:
            enableFilter && filter !== false
              ? (filter ?? "agTextColumnFilter")
              : false,
          pinned,
          resizable: resizable ?? true,
          editable: editable ?? false,
          cellRenderer: render
            ? ({ value, data }: { value: unknown; data: T }) =>
                render(String(value), data)
            : undefined,
          cellClass: className,
        }),
      ),
    [columns, enableSorting, enableFilter],
  );
  const gridApiRef = useRef<GridReadyEvent["api"] | null>(null);
  // Handle grid ready and selection
  const handleGridReady = useCallback(
    (params: GridReadyEvent) => {
      onGridReady?.(params);
      gridApiRef.current = params.api;

      // Defer sizeColumnsToFit until the container has a non-zero width.
      // This prevents crashes when the grid is mounted inside a hidden sidebar.
      const el = (params.api as GridReadyEvent["api"] & {
        gridBodyCtrl?: {
          eBodyViewport?: {
            closest: (selector: string) => HTMLElement | undefined;
          };
        };
      }).gridBodyCtrl?.eBodyViewport?.closest(
        ".ag-root-wrapper",
      ) as HTMLElement | undefined;

      const tryFit = () => {
        if ((el?.offsetWidth ?? 0) > 0) {
          params.api.sizeColumnsToFit();
        } else {
          requestAnimationFrame(tryFit);
        }
      };
      requestAnimationFrame(tryFit);

      // Refit whenever the container is resized (e.g. sidebar opens/closes)
      if (el && typeof ResizeObserver !== "undefined") {
        const ro = new ResizeObserver(() => {
          if ((el.offsetWidth ?? 0) > 0) {
            params.api.sizeColumnsToFit();
          }
        });
        ro.observe(el);
        params.api.addEventListener("gridPreDestroyed", () => ro.disconnect());
      }
    },
    [onGridReady],
  );

  const handleSelectionChanged = useCallback(
    (event: SelectionChangedEvent<T, T>) => {
      onSelectionChanged?.(event);
    },
    [onSelectionChanged],
  );

  return (
    <div
      className={`shadow-md ${className} ${THEME_CLASSES[theme]}`}
      style={{ maxHeight: gridHeight }}
    >
      <style>{`
        .ag-header-cell-label {
          font-weight: 500 !important;
        }
        
        .ag-paging-page-size {
          display: flex !important;
          align-items: center !important;
          gap: 0.5rem !important;
        }
        
        .ag-picker-field-wrapper {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          min-width: 60px !important;
        }
        
        .ag-paging-row-count {
          display: flex !important;
          align-items: center !important;
        }
        
        .ag-paging-button {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        .ag-cell {
          display: flex !important;
          align-items: center !important;
        }
      `}</style>

      <AgGridReact
        columnDefs={columnDefs}
        rowData={data}
        getRowId={(params) => String(params.data[idField])}
        overlayNoRowsTemplate={emptyMessage}
        suppressNoRowsOverlay={false}
        onGridReady={handleGridReady}
        onSelectionChanged={handleSelectionChanged}
        rowSelection={rowSelection}
        pagination={true}
        paginationPageSize={effectivePageSize}
        paginationPageSizeSelector={paginationPageSizeSelector}
        animateRows={true}
        theme={theme === "legacy" ? "legacy" : undefined}
        defaultColDef={{
          sortable: enableSorting,
          resizable: true,
          filter: enableFilter,
        }}
      />
    </div>
  );
};
