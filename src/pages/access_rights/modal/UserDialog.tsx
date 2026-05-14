import { useState } from "react";
import { Button } from "@/components/shared_components/button";
import { Input } from "@/components/shared_components/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/shared_components/dialog";
import {
  Users,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

// Types
interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  emp_id: string;
  role: "superadmin" | "finance" | "hr" | "manager";
  password: string;
  confirmPassword: string;
}

interface User {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  emp_id: string;
  role: "superadmin" | "finance" | "hr" | "manager";
  lastLogin?: string;
  system_password?: string;
}

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: User | null;
  formData: UserFormData;
  setFormData: (formData: UserFormData) => void;
  onSubmit: () => void;
  onRoleChange: (role: "superadmin" | "finance" | "hr" | "manager") => void;
  isActionLoading: boolean;
}

export const UserDialog = ({
  open,
  onOpenChange,
  editingUser,
  formData,
  setFormData,
  onSubmit,
  onRoleChange,
  isActionLoading,
}: UserDialogProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="w-[95vw] max-w-2xl p-4 sm:p-6 mx-auto rounded-md max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                {editingUser ? "Edit User" : "Add New User"}
              </DialogTitle>
              <p className="text-sm text-slate-500 mt-1">
                {editingUser
                  ? "Modify user information"
                  : "Create a new user account"}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Users className="h-4 w-4 text-slate-600" />
              <h3 className="text-sm font-semibold text-slate-800">
                User Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Employee ID
                </label>
                <Input
                  value={formData.emp_id}
                  onChange={(e) =>
                    setFormData({ ...formData, emp_id: e.target.value })
                  }
                  placeholder="Auto-generated..."
                  className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    onRoleChange(
                      e.target.value as
                        | "superadmin"
                        | "finance"
                        | "hr"
                        | "manager",
                    )
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="superadmin">Super Admin</option>
                  <option value="finance">Finance</option>
                  <option value="hr">HR</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  First Name
                </label>
                <Input
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  placeholder="Enter first name"
                  className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Last Name
                </label>
                <Input
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  placeholder="Enter last name"
                  className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="user@company.com"
                  className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingUser ? "Enter new password" : "Enter password"}
                    className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder={editingUser ? "Confirm new password" : "Confirm password"}
                    className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-3 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
            disabled={isActionLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={isActionLoading}
          >
            {isActionLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {editingUser ? "Updating..." : "Creating..."}
              </>
            ) : editingUser ? (
              "Update User"
            ) : (
              "Create User"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDialog;
