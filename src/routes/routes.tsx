import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "@/pages/dashboard/Dashboard";
import LastPay from "@/pages/last_pay/lastpay/LastPay";
import RecordDetail from "@/pages/last_pay/recorddetail/RecordDetail";
import NotFound from "@/pages/not_found/NotFound";
import Login from "@/pages/login/Login";
import AccessRights from "@/pages/access_rights/AccessRights";
import TimesheetUploading from "@/pages/timesheet_uploading/Timesheet";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { SuperAdminRoute } from "@/routes/SuperAdminRoute";
import { MainLayout } from "@/components/layout/MainLayout";

export const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="*" element={
      <ProtectedRoute>
        <MainLayout>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/lastpay" element={<LastPay />} />
            <Route path="/lastpay/:ref_no" element={<RecordDetail />} />
            <Route path="/access-rights" element={
              <SuperAdminRoute>
                <AccessRights />
              </SuperAdminRoute>
            } />
            <Route path="/timesheet-uploading" element={<TimesheetUploading />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
      </ProtectedRoute>
    } />
  </Routes>
);
