import { LayoutDashboard, Banknote, User, LogOut, TimerIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/shared_components/button";
import { ConfirmationModal } from "@/components/shared_components/ConfirmationModal";
import { useState } from "react";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Last Pay", url: "/lastpay", icon: Banknote },
  { title: "Timesheet Uploading", url: "/timesheet-uploading", icon: TimerIcon },
  { title: "Access Rights", url: "/access-rights", icon: User, requiresSuperAdmin: true },
];

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out
          w-72 lg:w-80
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          bg-white border-r border-slate-200 flex flex-col h-screen shadow-[4px_0_6px_-1px_rgba(0,0,0,0.1)]
        `}
      >
        <nav className="flex-1 p-3 space-y-1 overflow-auto mt-14">
          {navItems
            .filter(item => !item.requiresSuperAdmin || user?.role === 'superadmin')
            .map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-md transition-colors ${
                  isActive
                    ? "bg-gray-200 text-black text-md font-medium shadow-md"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium">{item.title}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 px-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="flex items-center gap-4" >
            <User className="h-8 w-8 bg-gray-50 rounded-full cursor-pointer" />
            <div className="flex flex-col flex-1 ">
              <p className="font-medium">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogoutClick}
              className="p-2 h-8 w-8"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to sign in again to access your account."
        onConfirm={handleLogoutConfirm}
        variant="destructive"
      />
    </>
  );
}
