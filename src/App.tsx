/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * App.tsx
 * 应用程序的根组件，负责全局路由配置、角色权限控制和页面布局的渲染。
 * 根据用户角色（工人、工头、老板、管理员）动态加载对应的路由和布局（移动端或Web端）。
 */
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import MobileShell from '@/components/MobileShell';
import WebAdminLayout from '@/components/WebAdminLayout';

// Shared Pages
import MobileWorkbench from '@/pages/shared/Workbench';
import DailyReport from '@/pages/shared/DailyReport';
import Reimbursement from '@/pages/shared/Reimbursement';

// Worker Pages
import WorkerHome from '@/pages/worker/Home';
import WorkerAttendance from '@/pages/worker/Attendance';
import WorkerStats from '@/pages/worker/Stats';

// Foreman Pages
import ForemanWorkbench from '@/pages/foreman/Workbench';
import ForemanExceptions from '@/pages/foreman/Exceptions';
import ForemanSite from '@/pages/foreman/Site';

// Admin Pages
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminProjects from '@/pages/admin/Projects';
import AdminEmployees from '@/pages/admin/Employees';

// Boss Pages
import BossHome from '@/pages/boss/Home';
import BossAttendance from '@/pages/boss/Attendance';
import BossEmployeeAttendance from '@/pages/boss/EmployeeAttendance';
import BossEmployeeDetail from '@/pages/boss/EmployeeDetail';
import BossProjectAttendanceDetail from '@/pages/boss/ProjectAttendanceDetail';
import BossContracts from '@/pages/boss/Contracts';
import BossIncomeSettlement from '@/pages/boss/IncomeSettlement';
import BossProjectList from '@/pages/boss/ProjectList';
import BossReimbursementOverview from '@/pages/boss/ReimbursementOverview';
import BossProjectReimbursementDetail from '@/pages/boss/ProjectReimbursementDetail';
import BossProjectCost from '@/pages/boss/ProjectCost';

function RoleSync() {
  const { setRole } = useAppStore();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const role = params.get('role');
    if (role === 'worker' || role === 'foreman' || role === 'boss') {
      setRole(role);
    }
  }, [location.search, setRole]);

  return null;
}

function AdminRoutes() {
  return (
    <WebAdminLayout>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/projects" element={<AdminProjects />} />
        <Route path="/employees" element={<AdminEmployees />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </WebAdminLayout>
  );
}

function MobileRoutes() {
  const { role } = useAppStore();
  
  return (
    <MobileShell>
      <Routes>
        {role === 'worker' ? (
          <>
            <Route path="/" element={<WorkerHome />} />
            <Route path="/attendance" element={<WorkerAttendance />} />
            <Route path="/stats" element={<WorkerStats />} />
            <Route path="/workbench" element={<MobileWorkbench />} />
            <Route path="/daily-report" element={<DailyReport />} />
            <Route path="/reimbursement" element={<Reimbursement />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : role === 'foreman' ? (
          <>
            <Route path="/" element={<ForemanWorkbench />} />
            <Route path="/exceptions" element={<ForemanExceptions />} />
            <Route path="/site" element={<ForemanSite />} />
            <Route path="/workbench" element={<MobileWorkbench />} />
            <Route path="/daily-report" element={<DailyReport />} />
            <Route path="/reimbursement" element={<Reimbursement />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            <Route path="/" element={<BossHome />} />
            <Route path="/attendance" element={<BossAttendance />} />
            <Route path="/employee-attendance" element={<BossEmployeeAttendance />} />
            <Route path="/employee-detail/:id" element={<BossEmployeeDetail />} />
            <Route path="/project-attendance/:name" element={<BossProjectAttendanceDetail />} />
            <Route path="/boss/contracts" element={<BossContracts />} />
            <Route path="/boss/income-settlement" element={<BossIncomeSettlement />} />
            <Route path="/boss/projects" element={<BossProjectList />} />
            <Route path="/boss/reimbursement-overview" element={<BossReimbursementOverview />} />
            <Route path="/boss/reimbursement-project/:projectName" element={<BossProjectReimbursementDetail />} />
            <Route path="/boss/project-cost" element={<BossProjectCost />} />
            <Route path="/workbench" element={<MobileWorkbench />} />
            <Route path="/daily-report" element={<DailyReport />} />
            <Route path="/reimbursement" element={<Reimbursement />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </MobileShell>
  );
}

export default function App() {
  return (
    <Router>
      <RoleSync />
      <Routes>
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/*" element={<MobileRoutes />} />
      </Routes>
    </Router>
  );
}
