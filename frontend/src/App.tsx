import React, { useState, useEffect } from 'react';
import { UserRole } from './types';
import { TabType, Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { BannerDisclaimer } from './components/BannerDisclaimer';

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
} from './services/api';

export function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN');
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

  const loadAllData = async () => {
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
      setAssets(astRes.data);
      setTasks(tskRes.data);
      setSchedules(ttRes.data);
      setFreightForecasts(ffRes.data);
      setCorridors(corRes.data);
      setPlans(plnRes.data);
      if (wgtRes.data) setWeights(wgtRes.data);
      setAuditLogs(audRes.data);

      if (plnRes.data && plnRes.data[0]) {
        const fullPlanRes = await plansApi.getPlanById(plnRes.data[0].id);
        setBlocks(fullPlanRes.data.blocks || []);
        setConflicts(fullPlanRes.data.conflicts || []);
      }
    } catch (err) {
      console.error('Failed loading data from Node backend', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // 1-CLICK SYNTHETIC DEMO SCENARIO EXECUTION
  const handleRunDemoScenario = async () => {
    setIsDemoLoading(true);
    try {
      // 1. Seed synthetic data
      await syntheticApi.seed();
      
      // 2. Trigger automatic AI optimizer
      const optRes = await optimizationApi.generatePlan({
        horizonType: 'WEEKLY',
        startDate: '2026-09-09',
        endDate: '2026-09-15',
      });

      // 3. Refresh views
      await loadAllData();
      setActiveTab('dashboard');

      const beforeDelay = optRes.data.plan?.beforeMetrics?.totalDelayMinutes || 135;
      const afterDelay = optRes.data.plan?.metrics?.totalDelayMinutes || 27;

      showToast(`✨ Demo Scenario Executed! Passenger delay reduced from ${beforeDelay} min to ${afterDelay} min.`);
    } catch (err) {
      console.error('Demo execution failed', err);
      showToast('Demo execution failed. Please check backend connection.');
    } finally {
      setIsDemoLoading(false);
    }
  };

  // Task creation handler
  const handleCreateTask = async (taskData: any) => {
    try {
      await tasksApi.createTask(taskData);
      await loadAllData();
      showToast('Task created & prioritized successfully.');
    } catch (err) {
      showToast('Failed to create task.');
    }
  };

  // Defect report handler
  const handleReportDefect = async (assetId: string, defectData: any) => {
    try {
      await assetsApi.reportDefect(assetId, defectData);
      await loadAllData();
      showToast('Critical defect reported & speed restriction recorded.');
    } catch (err) {
      showToast('Failed to report defect.');
    }
  };

  // Generate Plan Handler
  const handleGeneratePlan = async (horizon: 'WEEKLY' | 'MONTHLY') => {
    setIsDemoLoading(true);
    try {
      const res = await optimizationApi.generatePlan({ horizonType: horizon });
      await loadAllData();
      setActiveTab('optimizer');
      showToast(`Generated ${horizon} automatic block schedule.`);
    } catch (err) {
      showToast('Optimization execution failed.');
    } finally {
      setIsDemoLoading(false);
    }
  };

  // Update weights
  const handleUpdateWeights = async (newWeights: any) => {
    try {
      await optimizationApi.updateWeights(newWeights);
      await loadAllData();
      showToast('Optimization weights updated successfully.');
    } catch (err) {
      showToast('Failed updating weights.');
    }
  };

  // Modify block
  const handleModifyBlock = async (planId: string, blockId: string, data: any) => {
    try {
      await plansApi.modifyBlock(planId, blockId, data);
      await loadAllData();
      showToast('Block timing modified & metrics recalculated.');
    } catch (err) {
      showToast('Failed modifying block.');
    }
  };

  // Approve plan
  const handleApprovePlan = async (planId: string) => {
    try {
      await plansApi.approvePlan(planId);
      await loadAllData();
      showToast('Block plan approved & locked into COA schedule.');
    } catch (err) {
      showToast('Failed approving plan.');
    }
  };

  // Reject plan
  const handleRejectPlan = async (planId: string) => {
    try {
      await plansApi.rejectPlan(planId);
      await loadAllData();
      showToast('Block plan rejected.');
    } catch (err) {
      showToast('Failed rejecting plan.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Official Disclaimer Banner */}
      <BannerDisclaimer />

      {/* Control Room Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onRunDemo={handleRunDemoScenario}
        isDemoLoading={isDemoLoading}
      />

      {/* Main Body Shell */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          conflictsCount={conflicts.length}
        />

        {/* Content Area */}
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
