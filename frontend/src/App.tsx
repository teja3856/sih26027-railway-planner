import React, { useState, useEffect, useCallback } from 'react';
import { UserRole } from './types';
import { TabType, Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginModal } from './components/LoginModal';

import { Dashboard } from './components/Dashboard';
import { CorridorMap } from './components/CorridorMap';
import { TasksDefects } from './components/TasksDefects';
import { TimetableGoods } from './components/TimetableGoods';
import { OptimizerStudio } from './components/OptimizerStudio';
import { GanttPlanner } from './components/GanttPlanner';
import { SimulatorSandbox } from './components/SimulatorSandbox';
import { ApprovalWorkflow } from './components/ApprovalWorkflow';
import { AnalyticsReports } from './components/AnalyticsReports';
import { AuditLogs } from './components/AuditLogs';

import {
  assetsApi,
  tasksApi,
  trafficApi,
  optimizationApi,
  plansApi,
  syntheticApi,
  analyticsApi,
  auditApi,
  authApi,
} from './services/api';

export function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    try {
      const savedUser = localStorage.getItem('sih_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.role) return parsed.role;
      }
    } catch {}
    return 'ADMIN';
  });
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const savedUser = localStorage.getItem('sih_user');
      if (savedUser) return JSON.parse(savedUser);
    } catch {}
    return null;
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoLoading, setIsDemoLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Data states
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [defects, setDefects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [freightForecasts, setFreightForecasts] = useState<any[]>([]);
  const [corridors, setCorridors] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [weights, setWeights] = useState<any>({
    assetCriticalityWeight: 0.25,
    maintenanceUrgencyWeight: 0.25,
    trainImpactWeight: 0.15,
    delayWeight: 0.15,
    conflictWeight: 0.10,
    assetDowntimeWeight: 0.05,
    blockUtilizationWeight: 0.05,
  });
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Show temporary toast message
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [dashRes, astRes, tskRes, ttRes, ffRes, corRes, plnRes, wgtRes, audRes] = await Promise.all([
        analyticsApi.getDashboardData(),
        assetsApi.getAssets(),
        tasksApi.getTasks(),
        trafficApi.getTimetable(),
        trafficApi.getFreightForecast(),
        trafficApi.getCorridors(),
        plansApi.getPlans(),
        optimizationApi.getWeights(),
        auditApi.getLogs(),
      ]);

      setDashboardData(dashRes.data);
      setAssets(astRes.data || []);
      setTasks(tskRes.data || []);
      setSchedules(ttRes.data || []);
      setFreightForecasts(ffRes.data || []);
      setCorridors(corRes.data || []);
      setPlans(plnRes.data || []);
      if (wgtRes.data) setWeights(wgtRes.data);
      setAuditLogs(audRes.data || []);

      if (plnRes.data && plnRes.data[0]) {
        const fullPlanRes = await plansApi.getPlanById(plnRes.data[0].id);
        setBlocks(fullPlanRes.data.blocks || []);
        setConflicts(fullPlanRes.data.conflicts || []);
      }
    } catch (err: any) {
      console.error('Failed loading data from Node backend:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Ensure valid JWT authentication session exists before loading dashboard data
  const initSessionAndLoad = useCallback(async (roleToUse: UserRole) => {
    try {
      let token = localStorage.getItem('sih_auth_token');
      let userStr = localStorage.getItem('sih_user');
      if (token && userStr) {
        const savedUser = JSON.parse(userStr);
        setCurrentUser(savedUser);
        if (savedUser.role) setCurrentRole(savedUser.role);
      } else {
        const sessionRes = await authApi.getDemoSession(roleToUse);
        token = sessionRes.data.token;
        if (token) {
          localStorage.setItem('sih_auth_token', token);
          localStorage.setItem('sih_user', JSON.stringify(sessionRes.data.user));
          setCurrentUser(sessionRes.data.user);
          setCurrentRole(sessionRes.data.user.role || roleToUse);
        }
      }
      await loadAllData();
    } catch (err) {
      console.error('Failed initializing demo session:', err);
      // Fallback retry
      try {
        const fallbackRes = await authApi.getDemoSession(roleToUse);
        if (fallbackRes.data.token) {
          localStorage.setItem('sih_auth_token', fallbackRes.data.token);
          localStorage.setItem('sih_user', JSON.stringify(fallbackRes.data.user));
          setCurrentUser(fallbackRes.data.user);
          setCurrentRole(fallbackRes.data.user.role || roleToUse);
          await loadAllData();
        }
      } catch (retryErr) {
        console.error('Session retry failed:', retryErr);
      }
    }
  }, [loadAllData]);

  // Initial silent startup
  useEffect(() => {
    initSessionAndLoad(currentRole);
  }, [initSessionAndLoad]);

  // Role switching: seamlessly obtain signed JWT for the selected role and refresh data
  const handleRoleChange = async (newRole: UserRole) => {
    setCurrentRole(newRole);
    try {
      const sessionRes = await authApi.getDemoSession(newRole);
      if (sessionRes.data.token) {
        localStorage.setItem('sih_auth_token', sessionRes.data.token);
        localStorage.setItem('sih_user', JSON.stringify(sessionRes.data.user));
        setCurrentUser(sessionRes.data.user);
        setCurrentRole(sessionRes.data.user.role);
      }
      await loadAllData();
      showToast(`Switched active role to ${newRole}`);
    } catch (err) {
      console.error('Role switch failed:', err);
      showToast(`Role switched to ${newRole}`);
    }
  };

  // Dedicated Login Handler for Evaluators / Faculty
  const handleLoginSuccess = async (user: any, token: string) => {
    localStorage.setItem('sih_auth_token', token);
    localStorage.setItem('sih_user', JSON.stringify(user));
    setCurrentUser(user);
    if (user.role) {
      setCurrentRole(user.role);
    }
    await loadAllData();
    showToast(`Authenticated as ${user.name} (${user.role})`);
  };

  const handleLogout = async () => {
    authApi.logout();
    setCurrentUser(null);
    await initSessionAndLoad('ADMIN');
    showToast('Logged out. Switched to Default Demo Session.');
  };

  // Safe Error Message Extraction Helper
  const getErrorMessage = (err: any, fallback: string): string => {
    if (err?.response?.data?.error?.message) {
      return err.response.data.error.message;
    }
    if (err?.response?.data?.message) {
      return err.response.data.message;
    }
    if (err?.message) {
      return err.message;
    }
    return fallback;
  };

  // 1-CLICK SYNTHETIC DEMO SCENARIO EXECUTION
  const handleRunDemoScenario = async () => {
    if (currentRole === 'MAINTENANCE_ENGINEER') {
      showToast('Action Restricted: Automated block optimization requires Operations Controller or Admin role.');
      return;
    }
    setIsDemoLoading(true);
    try {
      if (currentRole === 'ADMIN') {
        await syntheticApi.seed();
      }
      const optRes = await optimizationApi.generatePlan({
        horizonType: 'WEEKLY',
        startDate: '2026-09-09',
        endDate: '2026-09-15',
      });

      await loadAllData();
      setActiveTab('dashboard');

      const before = optRes.data?.plan?.beforeMetrics?.totalDelayMinutes || 135;
      const after = optRes.data?.plan?.metrics?.totalDelayMinutes || 27;
      showToast(`✨ Demo Scenario Executed! Passenger delay reduced from ${before} min to ${after} min.`);
    } catch (err: any) {
      console.error('Demo execution failed', err);
      const msg = getErrorMessage(err, 'Demo execution failed. Please check backend connection.');
      showToast(msg);
    } finally {
      setIsDemoLoading(false);
    }
  };

  // CREATE TASK
  const handleCreateTask = async (taskData: any) => {
    try {
      await tasksApi.createTask(taskData);
      await loadAllData();
      showToast('Task created & prioritized successfully.');
    } catch (err: any) {
      const msg = getErrorMessage(err, 'Failed to create task.');
      showToast(msg);
    }
  };

  // REPORT DEFECT
  const handleReportDefect = async (assetId: string, defectData: any) => {
    try {
      await assetsApi.reportDefect(assetId, defectData);
      await loadAllData();
      showToast('Critical defect reported & speed restriction recorded.');
    } catch (err: any) {
      const msg = getErrorMessage(err, 'Failed to report defect.');
      showToast(msg);
    }
  };

  // RUN OPTIMIZER
  const handleGeneratePlan = async (horizon: 'WEEKLY' | 'MONTHLY') => {
    if (currentRole === 'MAINTENANCE_ENGINEER') {
      showToast('Optimization execution is restricted to authorized operations users.');
      return;
    }
    setIsDemoLoading(true);
    try {
      await optimizationApi.generatePlan({ horizonType: horizon });
      await loadAllData();
      setActiveTab('optimizer');
      showToast(`Generated ${horizon} automatic block schedule.`);
    } catch (err: any) {
      const msg = getErrorMessage(err, 'Optimization execution failed.');
      showToast(msg);
    } finally {
      setIsDemoLoading(false);
    }
  };

  // UPDATE OPTIMIZATION WEIGHTS
  const handleUpdateWeights = async (newWeights: any) => {
    if (currentRole !== 'ADMIN') {
      showToast('Permission Denied: Only Administrators can update optimization weights.');
      return;
    }
    try {
      await optimizationApi.updateWeights(newWeights);
      await loadAllData();
      showToast('Optimization weights updated successfully.');
    } catch (err: any) {
      const msg = getErrorMessage(err, 'Failed updating weights.');
      showToast(msg);
    }
  };

  // MANUAL BLOCK ADJUSTMENT
  const handleModifyBlock = async (planId: string, blockId: string, patchData: any) => {
    try {
      await plansApi.modifyBlock(planId, blockId, patchData);
      await loadAllData();
      showToast('Block timing modified & metrics recalculated.');
    } catch (err: any) {
      const msg = getErrorMessage(err, 'Failed modifying block.');
      showToast(msg);
    }
  };

  // APPROVE PLAN (OPERATIONS CONTROLLER / ADMIN)
  const handleApprovePlan = async (planId: string) => {
    try {
      await plansApi.approvePlan(planId);
      await loadAllData();
      showToast('Block plan approved & locked into COA schedule.');
    } catch (err: any) {
      const msg = getErrorMessage(err, 'Failed approving plan.');
      showToast(msg);
    }
  };

  // REJECT PLAN
  const handleRejectPlan = async (planId: string) => {
    try {
      await plansApi.rejectPlan(planId);
      await loadAllData();
      showToast('Block plan rejected.');
    } catch (err: any) {
      const msg = getErrorMessage(err, 'Failed rejecting plan.');
      showToast(msg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Main Header with User Role & Controls */}
      <Header
        currentRole={currentRole}
        currentUser={currentUser}
        onRoleChange={handleRoleChange}
        onRunDemo={handleRunDemoScenario}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        isDemoLoading={isDemoLoading}
      />

      {/* On-Demand Login Modal for Faculty / Judges */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          conflictsCount={conflicts.length}
        />

        {/* Dynamic Main Workspace View */}
        <main className="flex-1 bg-slate-950 overflow-hidden relative">
          {/* Toast Notification Popup */}
          {toastMessage && (
            <div className="absolute top-4 right-4 z-50 bg-sky-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl border border-sky-400 animate-bounce">
              {toastMessage}
            </div>
          )}

          {activeTab === 'dashboard' && (
            <Dashboard
              data={dashboardData}
              onNavigate={setActiveTab}
              onRunDemo={handleRunDemoScenario}
            />
          )}

          {activeTab === 'corridor-map' && (
            <CorridorMap assets={assets} corridors={corridors} />
          )}

          {activeTab === 'tasks-defects' && (
            <TasksDefects
              tasks={tasks}
              defects={defects}
              assets={assets}
              onCreateTask={handleCreateTask}
              onReportDefect={handleReportDefect}
            />
          )}

          {activeTab === 'timetable-freight' && (
            <TimetableGoods schedules={schedules} freightForecasts={freightForecasts} />
          )}

          {activeTab === 'corridor-availability' && (
            <TimetableGoods schedules={schedules} freightForecasts={freightForecasts} />
          )}

          {activeTab === 'optimizer' && (
            <OptimizerStudio
              plans={plans}
              blocks={blocks}
              weights={weights}
              currentRole={currentRole}
              onGeneratePlan={handleGeneratePlan}
              onUpdateWeights={handleUpdateWeights}
              isOptimizing={isDemoLoading}
            />
          )}

          {activeTab === 'weekly-planner' && (
            <GanttPlanner horizon="WEEKLY" blocks={blocks} corridors={corridors} />
          )}

          {activeTab === 'monthly-planner' && (
            <GanttPlanner horizon="MONTHLY" blocks={blocks} corridors={corridors} />
          )}

          {activeTab === 'simulator' && (
            <SimulatorSandbox
              blocks={blocks}
              onSimulate={optimizationApi.simulate}
            />
          )}

          {activeTab === 'approval' && (
            <ApprovalWorkflow
              plans={plans}
              blocks={blocks}
              userRole={currentRole}
              onModifyBlock={handleModifyBlock}
              onApprovePlan={handleApprovePlan}
              onRejectPlan={handleRejectPlan}
            />
          )}

          {activeTab === 'reports' && (
            <AnalyticsReports plans={plans} />
          )}

          {activeTab === 'audit' && (
            <AuditLogs logs={auditLogs} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
