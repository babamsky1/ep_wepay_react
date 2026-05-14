import { createContext, useContext, ReactNode } from "react";
import { LastPayRecord, AdditionalsType } from "@/types/lastPayTypes";

// Context data shape
interface LastPayContextValue {
  record: LastPayRecord;
  activePayables?: AdditionalsType[];
  activeDeductions?: AdditionalsType[];
  disapproveRemark: string | null;
}

// Create context
const LastPayContext = createContext<LastPayContextValue | null>(null);

// Provider props
interface LastPayProviderProps {
  children: ReactNode;
  record: LastPayRecord;
  activePayables?: AdditionalsType[];
  activeDeductions?: AdditionalsType[];
  disapproveRemark: string | null;
}

// Context provider component
export const LastPayProvider = ({
  children,
  record,
  activePayables,
  activeDeductions,
  disapproveRemark,
}: LastPayProviderProps) => {
  return (
    <LastPayContext.Provider
      value={{ record, activePayables, activeDeductions, disapproveRemark }}
    >
      {children}
    </LastPayContext.Provider>
  );
};

// Hook to use context
export const useLastPayContext = () => {
  const context = useContext(LastPayContext);
  if (!context) {
    throw new Error("useLastPayContext must be used within LastPayProvider");
  }
  return context;
};
