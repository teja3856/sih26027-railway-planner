class ConflictDetector:
    @staticmethod
    def detect_all_conflicts(blocks: list, schedules: list, freight_forecasts: list, corridor_availabilities: list) -> list:
        conflicts = []

        for b in blocks:
            corridor_id = b.get('corridorId')
            b_start = b.get('scheduledStartTime', '').split(' ')[-1] if ' ' in b.get('scheduledStartTime', '') else b.get('scheduledStartTime', '')
            b_end = b.get('scheduledEndTime', '').split(' ')[-1] if ' ' in b.get('scheduledEndTime', '') else b.get('scheduledEndTime', '')

            # 1. Train vs Block Conflict Check
            for s in schedules:
                if s.get('corridorId') == corridor_id:
                    dep_time = s.get('departureTime', '')
                    if b_start <= dep_time <= b_end:
                        train_type = s.get('trainType', 'PASSENGER')
                        conflicts.append({
                            'id': f"cnf-trn-{b.get('id')}-{s.get('trainNumber')}",
                            'blockId': b.get('id'),
                            'conflictType': 'TRAIN_VS_BLOCK',
                            'severity': 'CRITICAL' if train_type == 'SUPERFAST' else 'HIGH',
                            'description': f"Passenger Train {s.get('trainNumber')} ({s.get('trainName')}) scheduled at {dep_time} conflicts with maintenance block window ({b_start}-{b_end}).",
                            'affectedEntity': s.get('trainNumber')
                        })

            # 2. Goods Train Forecast Conflict Check
            for f in freight_forecasts:
                if f.get('corridorId') == corridor_id:
                    if f.get('trafficLevel') in ['HIGH', 'CRITICAL'] and b_start >= '08:00' and b_end <= '20:00':
                        conflicts.append({
                            'id': f"cnf-fgt-{b.get('id')}-{f.get('id')}",
                            'blockId': b.get('id'),
                            'conflictType': 'GOODS_VS_BLOCK',
                            'severity': 'HIGH',
                            'description': f"High goods train movement forecast ({f.get('expectedTrainsCount')} rakes) on corridor {corridor_id} during block slot {f.get('timeSlot')}.",
                            'affectedEntity': f.get('corridorId')
                        })

            # 3. Corridor Capacity Status Check
            for ca in corridor_availabilities:
                if ca.get('corridorId') == corridor_id:
                    if ca.get('status') == 'BUSY' and not (b_start >= '01:00' and b_end <= '04:00'):
                        conflicts.append({
                            'id': f"cnf-cap-{b.get('id')}",
                            'blockId': b.get('id'),
                            'conflictType': 'CORRIDOR_CAPACITY',
                            'severity': 'MEDIUM',
                            'description': f"Corridor {corridor_id} COA status is BUSY during daytime slot {b_start}-{b_end}.",
                            'affectedEntity': corridor_id
                        })

        return conflicts
