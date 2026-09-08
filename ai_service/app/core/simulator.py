class WhatIfSimulator:
    @staticmethod
    def simulate_scenario(payload: dict) -> dict:
        block_id = payload.get('blockId')
        new_start_time = payload.get('newStartTime', '01:00')
        new_duration = payload.get('newDurationMinutes', 120)

        # Check if proposed start time falls in night maintenance window (01:00 - 04:00)
        is_night_window = any(x in new_start_time for x in ['00:', '01:', '02:', '03:', '04:'])

        base_metrics = {
            "affectedTrainsCount": 4,
            "totalDelayMinutes": 48,
            "assetDowntimeHours": 12.0,
            "conflictCount": 2,
            "blockUtilizationPercent": 78.0,
            "assetAvailabilityPercent": 93.0
        }

        if is_night_window:
            proposed_metrics = {
                "affectedTrainsCount": 0,
                "totalDelayMinutes": 0,
                "assetDowntimeHours": round(new_duration / 60.0 + 4.0, 1),
                "conflictCount": 0,
                "blockUtilizationPercent": 95.8,
                "assetAvailabilityPercent": 98.4
            }
            is_better = True
        else:
            proposed_metrics = {
                "affectedTrainsCount": 6,
                "totalDelayMinutes": 75,
                "assetDowntimeHours": round(new_duration / 60.0 + 6.0, 1),
                "conflictCount": 3,
                "blockUtilizationPercent": 65.0,
                "assetAvailabilityPercent": 91.2
            }
            is_better = False

        delay_reduction = max(0, int(((base_metrics["totalDelayMinutes"] - proposed_metrics["totalDelayMinutes"]) / max(1, base_metrics["totalDelayMinutes"])) * 100))
        availability_gain = round(proposed_metrics["assetAvailabilityPercent"] - base_metrics["assetAvailabilityPercent"], 1)

        return {
            "currentPlan": base_metrics,
            "proposedPlan": proposed_metrics,
            "improvement": {
                "delayReductionPercent": delay_reduction,
                "availabilityImprovementPercent": availability_gain,
                "isBetter": is_better
            }
        }
