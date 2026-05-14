import React, { useState, createContext, useContext } from "react";
import { AppSidebar } from "./AppSidebar";
import { Navbar } from "./Navbar";
import { useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface SidebarContextType {
  isOpen: boolean;
}

const SidebarContext = createContext<SidebarContextType>({
  isOpen: false,
});

export const useSidebarState = () => useContext(SidebarContext);

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const location = useLocation();

  const hideLayout =
    location.pathname === "/login" || location.pathname === "/register";

  if (hideLayout) return children;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const contextValue = {
    isOpen: isSidebarOpen,
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      <div className="flex min-h-screen w-full bg-slate-50 relative overflow-hidden">
        {/* Sidebar */}
        <AppSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

        {/* Main Content - Auto-adjusts for sidebar */}
        <div
          className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-80" : "ml-0"
          }`}
        >
          {/* Navbar - Show in mobile but with fixed height */}
          <Navbar
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={toggleSidebar}
          />

          {/* Page Content - Full available space */}
          <main className="flex-1 overflow-hidden pt-14">
            <div className="h-full w-full overflow-hidden">{children}</div>
          </main>
        </div>

        {/* Toast notifications - above sidebar and modals */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          style={{ zIndex: 9999 }}
        />
      </div>
    </SidebarContext.Provider>
  );
}