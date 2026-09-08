import { store } from '../db/store';

function runUnitTests() {
  console.log('------------------------------------------------------------');
  console.log('🧪 RUNNING AUTOMATED ENGINE UNIT TESTS FOR SIH26027');
  console.log('------------------------------------------------------------');

  let passed = 0;
  let failed = 0;

  // Test 1: Task Prioritizer Scoring Math
  try {
    const criticalTask = store.tasks.find(t => t.criticality === 'CRITICAL');
    if (criticalTask && criticalTask.priorityScore >= 80) {
      console.log('✅ PASS: Critical task priority score properly weighted (Score >= 80)');
      passed++;
    } else {
      console.log('❌ FAIL: Critical task priority score weighting failed');
      failed++;
    }
  } catch (err) {
    console.log('❌ FAIL: Task prioritizer test error', err);
    failed++;
  }

  // Test 2: Joint Block Merger Logic
  try {
    const jointBlocks = store.blocks.filter(b => b.isJointBlock);
    if (jointBlocks.length > 0) {
      console.log(`✅ PASS: Joint Block Coordinator successfully merged multi-department tasks (${jointBlocks.length} joint blocks active)`);
      passed++;
    } else {
      console.log('❌ FAIL: Joint Block Coordinator failed to identify multi-department overlap');
      failed++;
    }
  } catch (err) {
    console.log('❌ FAIL: Joint block test error', err);
    failed++;
  }

  // Test 3: Optimization Score Improvement Calculation
  try {
    const currentPlan = store.plans[0];
    if (currentPlan && currentPlan.metrics.totalDelayMinutes < currentPlan.beforeMetrics!.totalDelayMinutes) {
      const delaySaved = currentPlan.beforeMetrics!.totalDelayMinutes - currentPlan.metrics.totalDelayMinutes;
      console.log(`✅ PASS: Automatic Optimizer achieved measurable passenger delay reduction (Saved ${delaySaved} delay minutes)`);
      passed++;
    } else {
      console.log('❌ FAIL: Optimization metric delta calculation failed');
      failed++;
    }
  } catch (err) {
    console.log('❌ FAIL: Optimizer metrics test error', err);
    failed++;
  }

  console.log('------------------------------------------------------------');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('------------------------------------------------------------');
}

runUnitTests();
