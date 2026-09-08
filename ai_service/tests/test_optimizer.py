import unittest
from app.core.prioritizer import TaskPrioritizer
from app.core.joint_block_coordinator import JointBlockCoordinator
from app.core.conflict_detector import ConflictDetector
from app.core.optimizer import BlockPlanningOptimizer

class TestAutomaticBlockPlanner(unittest.TestCase):
    def test_prioritizer_critical_task(self):
        task = {"criticality": "CRITICAL", "urgency": "CRITICAL"}
        asset = {"conditionScore": 35}
        defect = {"severity": "CRITICAL", "speedRestrictionKmh": 30}
        
        score = TaskPrioritizer.calculate_priority_score(task, asset, defect)
        self.assertGreaterEqual(score, 85.0)

    def test_joint_block_coordination(self):
        tasks = [
            {"id": "tsk-1", "department": "ENGINEERING", "assetId": "ast-1"},
            {"id": "tsk-2", "department": "TRACTION_DISTRIBUTION", "assetId": "ast-2"}
        ]
        assets = [
            {"id": "ast-1", "corridorId": "c-01"},
            {"id": "ast-2", "corridorId": "c-01"}
        ]
        joint = JointBlockCoordinator.identify_and_merge_joint_blocks(tasks, assets)
        self.assertEqual(len(joint), 1)
        self.assertTrue(joint[0]['isJointBlock'])
        self.assertIn("ENGINEERING", joint[0]['coordinatingDepts'])
        self.assertIn("TRACTION_DISTRIBUTION", joint[0]['coordinatingDepts'])

    def test_optimizer_execution(self):
        tasks = [{"id": "tsk-1", "assetId": "ast-1", "department": "ENGINEERING", "estimatedDurationMinutes": 120}]
        assets = [{"id": "ast-1", "corridorId": "c-01"}]
        res = BlockPlanningOptimizer.optimize_schedule("WEEKLY", "2026-09-09", "2026-09-15", tasks, assets, [], [], [], [])
        
        self.assertIn('plan', res)
        self.assertIn('blocks', res)
        self.assertGreater(len(res['blocks']), 0)
        self.assertGreaterEqual(res['plan']['totalOptimizationScore'], 90)

if __name__ == '__main__':
    unittest.main()
