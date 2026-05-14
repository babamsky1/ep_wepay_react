import { useState, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/layout/DataTable";
import { Button } from "@/components/shared_components/button";
import { StatusBadge } from "@/components/shared_components/StatusBadge";
import { LoadingState } from "@/components/shared_components/LoadingState";
import { useAccessRights, type User } from "@/hooks/access_rights/useAccessRights";
import { useTableFilters } from "@/hooks/table_filters/useTableFilters";
import { useEmployeeActionLogLazy } from "@/hooks/action_log/useActionLog";
import { useAllEmployees } from "@/hooks/data_fetching/employees/useEmployees";
import { ActionLogTable } from "@/components/shared_components/ActionLogTable";
import { Input } from "@/components/shared_components/input";
import { ConfirmationModal } from "@/components/shared_components/ConfirmationModal";
import { UserDialog } from "./modal/UserDialog";
import {
  Filter,
  X,
  AlertCircle,
  UserPlus,
  Edit,
  History,
  Trash2,
} from "lucide-react";

// Constants
const FILTER_FIELDS = [
    {
    key: "emp_id",
    label: "Employee ID",
    placeholder: "e.g., EMP-0001",
  },
  {
    key: "emp_name",
    label: "Employee Name",
    placeholder: "e.g., Juan Dela Cruz",
  },
  { key: "role", label: "Role", placeholder: "e.g., HR, Finance" },
] as const;

// Action Buttons Component
const ActionButtons = ({
  user,
  onEdit,
  onDelete,
}: {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}) => (
  <div className="flex gap-1 items-center">
    <Button variant="outline" size="sm" onClick={() => onEdit(user)}>
      <Edit className="h-2 w-2" />
      <span className="text-xs">Edit</span>
    </Button>
    <Button variant="destructive" size="sm" onClick={() => onDelete(user)}>
      <Trash2 className="h-2 w-2" />
      <span className="text-xs">Delete</span>
    </Button>
  </div>
);


// Main Component
const AccessRights = () => {
  const queryClient = useQueryClient();
  const {
    createUser,
    updateUser,
    deleteUser,
    isLoading: isActionLoading,
    clearError,
    users,
  } = useAccessRights();
  const { isLoading: isDataLoading } = useAllEmployees();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [actionLogOpen, setActionLogOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const { actionLogEntries, formatDateTime } = useEmployeeActionLogLazy(actionLogOpen);

  const initialFilters = {
    emp_id: "",
    emp_name: "",
    role: "",
  };

  const {
    inputFilters,
    appliedFilters,
    updateFilter,
    applyFilters,
    clearFilters,
    filterFields,
  } = useTableFilters(FILTER_FIELDS, initialFilters);
  const [formData, setFormData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    emp_id: string;
    role: "superadmin" | "finance" | "hr" | "manager";
    password: string;
    confirmPassword: string;
  }>({
    firstName: "",
    lastName: "",
    email: "",
    emp_id: "",
    role: "hr",
    password: "",
    confirmPassword: "",
  });

  // Remove users mapping since it's now handled in the hook

  // Define handlers before using them in useMemo
  const handleEditUser = useCallback((user: User) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email,
      emp_id: user.emp_id,
      role: user.role,
      password: user.system_password || "",
      confirmPassword: user.system_password || "",
    });
    setDialogOpen(true);
  }, []);

  // Columns definition
  const COLUMNS = [
    { key: "emp_id", header: "Employee ID", flex: 1, minWidth: 120 },
    { key: "firstName", header: "First Name", flex: 1, minWidth: 120 },
    { key: "lastName", header: "Last Name", flex: 1, minWidth: 120 },
    { key: "email", header: "Email", flex: 1, minWidth: 200 },
    {
      key: "role",
      header: "Role",
      flex: 1,
      minWidth: 120,
      render: (v: string) => <StatusBadge value={v} type="role" />,
    },
    {
      key: "actions",
      header: "Actions",
      flex: 1,
      minWidth: 150,
      sortable: false,
      filter: false,
      render: (_v: unknown, row: User) => (
        <ActionButtons
          user={row}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
        />
      ),
    },
  ];

  // Filter users based on applied filters - optimized with single pass
  const filteredUsers = useMemo(() => {
    if (!appliedFilters.emp_id && !appliedFilters.emp_name && !appliedFilters.role) {
      return users; // Early return if no filters
    }
    
    return users.filter((user) => {
      const idMatch = !appliedFilters.emp_id || 
        user.emp_id.toLowerCase().includes(appliedFilters.emp_id.toLowerCase());
      const nameMatch = !appliedFilters.emp_name || 
        user.name.toLowerCase().includes(appliedFilters.emp_name.toLowerCase());
      const roleMatch = !appliedFilters.role || 
        user.role.toLowerCase().includes(appliedFilters.role.toLowerCase());

      return idMatch && nameMatch && roleMatch;
    });
  }, [users, appliedFilters.emp_id, appliedFilters.emp_name, appliedFilters.role]);

  // Convert to table data format - simplified since data is already in correct format
  const tableData = useMemo(() => filteredUsers, [filteredUsers]);

  // Handle loading and error states
  if (isDataLoading) {
    return <LoadingState message="Loading users..." />;
  }

  // Open dialog for adding new user
  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      emp_id: "",
      role: "hr",
      password: "",
      confirmPassword: "",
    });
    setDialogOpen(true);
  };

  // Handle form submission - show confirmation modal
  const handleSubmit = () => {
    clearError();
    setIsConfirmModalOpen(true);
  };

  // Handle confirmed submission
  const handleConfirmedSubmit = async () => {
    if (editingUser) {
      const result = await updateUser(formData);
      if (result.success) {
        setDialogOpen(false);
        setIsConfirmModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ["employees"] });
        queryClient.invalidateQueries({ queryKey: ["actionLog", "Employee"] });
      } else {
        alert(result.error || "Failed to update user");
        setIsConfirmModalOpen(false);
      }
    } else {
      const result = await createUser(formData);
      if (result.success) {
        setDialogOpen(false);
        setIsConfirmModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ["employees"] });
        queryClient.invalidateQueries({ queryKey: ["actionLog", "Employee"] });
      } else {
        alert(result.error || "Failed to create user");
        setIsConfirmModalOpen(false);
      }
    }
  };

  // Handle delete user
  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  // Handle confirmed delete
  const handleConfirmedDelete = async () => {
    if (!userToDelete) return;

    const result = await deleteUser(userToDelete.emp_id);
    if (result.success) {
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["actionLog", "Employee"] });
    } else {
      alert(result.error || "Failed to delete user");
      setIsDeleteModalOpen(false);
    }
  };

  // Handle role change
  const handleRoleChange = (
    newRole: "superadmin" | "finance" | "hr" | "manager",
  ) => {
    setFormData({
      ...formData,
      role: newRole,
    });
  };

  return (
      <div className="h-full bg-white flex flex-col overflow-hidden px-4 sm:px-10 lg:px-20 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-0 sm:px-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Access Rights
        </h1>
        <div className="flex gap-2">
          <Button
            onClick={() => setActionLogOpen(true)}
            variant="outline"
            size="lg"
            className="gap-2 text-sm sm:text-base px-3 sm:px-4"
          >
            <History className="h-4 w-4 shrink-0" />
            <span>Action Log</span>
          </Button>
          <Button
            onClick={handleAddUser}
            variant="default"
            size="lg"
            className="gap-2 text-sm sm:text-base px-3 sm:px-4"
          >
            <UserPlus className="h-4 w-4 shrink-0" />
            <span>Add User</span>
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="border border-gray-200 rounded-md shadow-sm overflow-hidden">
        {/* Filter Inputs */}
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filterFields.map(({ key, label, placeholder }) => {
              const filterKey = key as keyof typeof initialFilters;
              const isActive = !!appliedFilters[filterKey];
              return (
                <div key={key}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <p className="text-sm font-medium text-slate-700">
                      {label}
                    </p>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      placeholder={placeholder}
                      value={inputFilters[filterKey]}
                      onChange={(e) => updateFilter(filterKey, e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                      className={`bg-white rounded-md shadow-md h-10 placeholder:font-thin text-sm pr-8 transition-colors duration-200 ${
                        isActive
                          ? "border-emerald-400 ring-1 ring-emerald-300"
                          : "border-border"
                      }`}
                    />
                    {isActive && (
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-500" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <Button
              onClick={applyFilters}
              variant="secondary"
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <Filter className="h-4 w-4 mr-1" /> Filter
            </Button>
            <Button
              onClick={clearFilters}
              variant="destructive"
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block min-h-[590px] max-h-[590px]">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full bg-white rounded-lg border">
            <AlertCircle className="h-8 w-8 text-amber-600 mb-4" />
            <p className="text-sm text-slate-600 mb-2">No users found</p>
            <p className="text-xs text-slate-500">Try adjusting your filters</p>
          </div>
        ) : (
          <DataTable
            data={tableData}
            idField="id"
            columns={COLUMNS}
            emptyMessage="No users found"
            className="h-full"
            enableSorting
            enableFilter
            theme="ag-theme-alpine"
            paginationPageSize={25}
          />
        )}
      </div>

      {/* User Dialog */}
      <UserDialog
        open={dialogOpen}
        onOpenChange={(open: boolean) => !open && setDialogOpen(false)}
        editingUser={editingUser}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        onRoleChange={handleRoleChange}
        isActionLoading={isActionLoading}
      />

      {/* Action Log Dialog */}
      <ActionLogTable
        isOpen={actionLogOpen}
        onClose={() => setActionLogOpen(false)}
        actionLogEntries={actionLogEntries}
        formatDateTime={formatDateTime}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title={editingUser ? "Update User" : "Create User"}
        message={`Are you sure you want to ${editingUser ? "update" : "create"} the account for ${formData.firstName} ${formData.lastName}?`}
        onConfirm={handleConfirmedSubmit}
        variant="success"
        isLoading={isActionLoading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.firstName} ${userToDelete?.lastName}'s account? This action will revoke their system access.`}
        onConfirm={handleConfirmedDelete}
        variant="destructive"
        isLoading={isActionLoading}
      />
    </div>
  );
};

export default AccessRights;
