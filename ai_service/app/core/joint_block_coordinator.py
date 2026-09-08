class JointBlockCoordinator:
    @staticmethod
    def identify_and_merge_joint_blocks(tasks: list, assets: list) -> list:
        """
        Groups maintenance tasks by corridor and time window.
        Merges tasks from multiple departments (Engineering, Traction, Signal)
        into unified Joint Blocks.
        """
        # Map asset to corridor
        asset_corridor_map = {a['id']: a.get('corridorId', 'c-01') for a in assets}

        corridor_groups = {}
        for t in tasks:
            asset_id = t.get('assetId')
            corridor_id = asset_corridor_map.get(asset_id, 'c-01')
            if corridor_id not in corridor_groups:
                corridor_groups[corridor_id] = []
            corridor_groups[corridor_id].append(t)

        joint_coordinations = []

        for c_id, c_tasks in corridor_groups.items():
            depts = list(set([t.get('department') for t in c_tasks]))
            if len(depts) > 1:
                joint_coordinations.append({
                    'corridorId': c_id,
                    'isJointBlock': True,
                    'coordinatingDepts': depts,
                    'taskIds': [t.get('id') for t in c_tasks],
                    'taskCodes': [t.get('taskId') for t in c_tasks],
                    'downtimeSavedMinutes': (len(c_tasks) - 1) * 90, # Est. saved setup/teardown time
                    'rationale': f"Combined {len(depts)} departments ({', '.join(depts)}) into a single joint corridor block."
                })

        return joint_coordinations
