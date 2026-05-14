import { useAuth } from '@/contexts/AuthContext';
import { AdditionalsType } from '@/types/lastPayTypes';

export const usePermissions = () => {
  const { user } = useAuth();
  const role = user?.role;

  const isSuperAdmin = role === 'superadmin';
  const isFinance = role === 'finance';
  const isHR = role === 'hr';
  const isManager = role === 'manager';

  const canGenerateQuitClaim = isSuperAdmin || isHR;
  const canModify = isSuperAdmin || isHR || isFinance || isManager;
  const canCancel = isSuperAdmin || isHR || isFinance || isManager;
  const canSave = isSuperAdmin || isHR || isFinance || isManager;
  const canFinalize = isSuperAdmin || isHR;
  const canDelete = isSuperAdmin || isHR;
  const canApprove = isSuperAdmin || isFinance;
  const canDisapprove = isSuperAdmin || isFinance;
  const canRelease = isSuperAdmin || isFinance || isManager;

  const canSetConfidential = isSuperAdmin || isManager;

  const canEditItem = (item: AdditionalsType, currentUser: string): boolean => {
    if (isSuperAdmin) return true;
    return item.created_by === currentUser;
  };

  const canToggleConfidential = (item: AdditionalsType, currentUser: string): boolean => {
    if (isSuperAdmin) return true;
    return isManager && item.created_by === currentUser;
  };

  const canViewItem = (item: AdditionalsType): boolean => {
    if (isSuperAdmin) return true;
    if (item.is_confidential === "Y") {
      return isManager;
    }
    return true;
  };

  const filterItemsByRole = (items: AdditionalsType[]): AdditionalsType[] => {
    if (isSuperAdmin) return items;
    return items.filter((item) => {
      if (item.is_confidential === "Y") {
        return isManager;
      }
      return true;
    });
  };

  return {
    role,
    canGenerateQuitClaim,
    canModify,
    canCancel,
    canSave,
    canFinalize,
    canDelete,
    canApprove,
    canDisapprove,
    canRelease,
    canAccessAll: isSuperAdmin,
    canSetConfidential,
    canEditItem,
    canToggleConfidential,
    canViewItem,
    filterItemsByRole,
  };
};
