import { ChevronLeft, Menu } from "lucide-react";
import { Button } from "@/components/shared_components/button";

interface NavbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function Navbar({ isSidebarOpen, onToggleSidebar }: NavbarProps) {

  return (
    <header className="bg-white px-3 border-b border-slate-200 shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="flex h-14 items-center">
        {/* Left side - Mobile menu & Title */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="p-2 h-8 w-8"
          >
            {isSidebarOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
          
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="font-bold text-slate-900 text-3xl hover:text-slate-700 transition-colors"
          >
           WePay
          </button>
        </div>
      </div>
    </header>
  );
}
