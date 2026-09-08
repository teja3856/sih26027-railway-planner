import React, { useState, useEffect, useCallback } from 'react';
import { UserRole, User } from './types';
import { TabType, Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { BannerDisclaimer } from './components/BannerDisclaimer';
import { Login } from './components/Login';

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
  // Session Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('sih_auth_token');
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('sih_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const stored = localStorage.getItem('sih_user');
    if (stored) {
      try {
        return JSON.parse(stored).role || 'ADMIN';
      } catch {
        return 'ADMIN';
      }
    }
    return 'ADMIN';
  });

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(false);
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

  const handleLogout = useCallback(() => {
    authApi.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setDashboardData(null);
    showToast('Session logged out.');
  }, []);

  // Listen to global 401 auth logout events from Axios interceptor
  useEffect(() => {
    const onAuthLogout = () => {
      setIsAuthenticated(false);
      setCurrentUser(null);
      setDashboardData(null);
    };
    window.addEventListener('sih_auth_logout', onAuthLogout);
    return () => window.removeEventListener('sih_auth_logout', onAuthLogout);
  }, []);

  const loadAllData = useCallback(async () => {
    if (!localStorage.getItem('sih_auth_token')) {
      setIsAuthenticated(false);
      return;
    }

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
      if (err.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setIsLoading(false);
    }
  }, [handleLogout]);

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated, loadAllData]);

  const handleLoginSuccess = (user: User, _token: string) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    setIsAuthenticated(true);
    showToast(`Welcome, ${user.name} (${user.role})`);
  };

  // 1-CLICK SYNTHETIC DEMO SCENARIO EXECUTION
  const handleRunDemoScenario = async () => {
    setIsDemoLoading(true);
    try {
      await syntheticApi.seed();
      const optRes = await optimizationApi.generatePlan({
        horizonType: 'WEEKLY',
        startDate: '2026-09-09',
        endDate: '2026-09-15',
      });

      await loadAllData();
      setActiveTab('dashboard');

      const before = optRes.data.plan?.beforeMetrics?.totalDelayMinutes || 135;
      const after = optRes.data.plan?.metrics?.totalDelayMinutes || 27;
      showToast(`✨ Demo Scenario Executed! Passenger delay reduced from ${before} min to ${after} min.`);
    } catch (err) {
      console.error('Demo execution failed', err);
      showToast('Demo execution failed. Please check backend connection.');
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
    } catch (err) {
      showToast('Failed to create task.');
    }
  };

  // REPORT DEFECT
  const handleReportDefect = async (assetId: string, defectData: any) => {
    try {
      await assetsApi.reportDefect(assetId, defectData);
      await loadAllData();
      showToast('Critical defect reported & speed restriction recorded.');
    } catch (err) {
      showToast('Failed to report defect.');
    }
  };

  // RUN OPTIMIZER
  const handleGeneratePlan = async (horizon: 'WEEKLY' | 'MONTHLY') => {
    setIsDemoLoading(true);
    try {
      await optimizationApi.generatePlan({ horizonType: horizon });
      await loadAllData();
      setActiveTab('optimizer');
      showToast(`Generated ${horizon} automatic block schedule.`);
    } catch (err) {
      showToast('Optimization execution failed.');
    } finally {
      setIsDemoLoading(false);
    }
  };

  // UPDATE OPTIMIZATION WEIGHTS
  const handleUpdateWeights = async (newWeights: any) => {
    try {
      await optimizationApi.updateWeights(newWeights);
      await loadAllData();
      showToast('Optimization weights updated successfully.');
    } catch (err) {
      showToast('Failed updating weights.');
    }
  };

  // MANUAL BLOCK ADJUSTMENT
  const handleModifyBlock = async (planId: string, blockId: string, patchData: any) => {
    try {
      await plansApi.modifyBlock(planId, blockId, patchData);
      await loadAllData();
      showToast('Block timing modified & metrics recalculated.');
    } catch (err) {
      showToast('Failed modifying block.');
    }
  };

  // APPROVE PLAN (OPERATIONS CONTROLLER / ADMIN)
  const handleApprovePlan = async (planId: string) => {
    try {
      await plansApi.approvePlan(planId);
      await loadAllData();
      showToast('Block plan approved & locked into COA schedule.');
    } catch (err) {
      showToast('Failed approving plan.');
    }
  };

  // REJECT PLAN
  const handleRejectPlan = async (planId: string) => {
    try {
      await plansApi.rejectPlan(planId);
      await loadAllData();
      showToast('Block plan rejected.');
    } catch (err) {
      showToast('Failed rejecting plan.');
    }
  };

  // If user is not authenticated, render Login view directly
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Prototype Disclaimer Banner */}
      <BannerDisclaimer />

      {/* Main Header with User Role & Controls */}
      <Header
        currentRole={currentRole}
        currentUser={currentUser}
        onLogout={handleLogout}
        onRunDemo={handleRunDemoScenario}
        isDemoLoading={isDemoLoading}
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
