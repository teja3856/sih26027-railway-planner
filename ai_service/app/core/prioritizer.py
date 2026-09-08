class TaskPrioritizer:
    @staticmethod
    def calculate_priority_score(task: dict, asset: dict = None, defect: dict = None) -> float:
        """
        Calculates deterministic priority score (0.0 to 100.0) based on:
        - Criticality (Critical=35, High=25, Medium=15, Low=5)
        - Urgency / Deadline proximity (Critical=30, High=20, Medium=10, Low=5)
        - Asset Condition Score (<40 = +15 pts, <60 = +10 pts)
        - Defect Presence & Speed Restrictions (Critical defect = +20 pts)
        """
        score = 0.0
        
        # 1. Criticality Contribution
        crit = task.get('criticality', 'MEDIUM')
        crit_map = {'CRITICAL': 35.0, 'HIGH': 25.0, 'MEDIUM': 15.0, 'LOW': 5.0}
        score += crit_map.get(crit, 15.0)

        # 2. Urgency Contribution
        urgency = task.get('urgency', 'MEDIUM')
        urgency_map = {'CRITICAL': 30.0, 'HIGH': 20.0, 'MEDIUM': 10.0, 'LOW': 5.0}
        score += urgency_map.get(urgency, 10.0)

        # 3. Asset Condition Contribution
        if asset:
            cond = asset.get('conditionScore', 100)
            if cond < 40:
                score += 15.0
            elif cond < 60:
                score += 10.0

        # 4. Defect Severity Contribution
        if defect:
            severity = defect.get('severity', 'MINOR')
            sev_map = {'CRITICAL': 20.0, 'SEVERE': 15.0, 'MAJOR': 10.0, 'MINOR': 5.0}
            score += sev_map.get(severity, 5.0)

            # Extra weight if speed restriction is imposed
            if defect.get('speedRestrictionKmh', 0) > 0 and defect.get('speedRestrictionKmh', 110) <= 40:
                score += 10.0

        return min(100.0, round(score, 1))
