import { hashPasswordSync } from '../utils/password';

import {
  User, Asset, AssetDefect, MaintenanceTask, MaintenanceHistory,
  Train, TrainSchedule, GoodsTrainForecast, Corridor, CorridorAvailability,
  MaintenanceBlock, BlockConflict, BlockPlan, OptimizationWeight,
  Notification, AuditLog
} from '../types';

class DataStore {
  public users: User[] = [];
  public assets: Asset[] = [];
  public defects: AssetDefect[] = [];
  public tasks: MaintenanceTask[] = [];
  public history: MaintenanceHistory[] = [];
  public trains: Train[] = [];
  public schedules: TrainSchedule[] = [];
  public freightForecasts: GoodsTrainForecast[] = [];
  public corridors: Corridor[] = [];
  public corridorAvailabilities: CorridorAvailability[] = [];
  public blocks: MaintenanceBlock[] = [];
  public conflicts: BlockConflict[] = [];
  public plans: BlockPlan[] = [];
  public weights: OptimizationWeight[] = [];
  public notifications: Notification[] = [];
  public auditLogs: AuditLog[] = [];

  constructor() {
    this.seedData();
  }

  public seedData(): void {
    // 1. Users (Passwords hashed using bcrypt salt 10)
    this.users = [
      {
        id: 'usr-1',
        username: 'admin',
        name: 'Rajesh Kumar (Chief Administrator)',
        email: 'admin@railnet.gov.in',
        passwordHash: hashPasswordSync('admin123'),
        role: 'ADMIN',
        department: 'OPERATIONS',
      },
      {
        id: 'usr-2',
        username: 'controller',
        name: 'Priya Sharma (Chief Operations Controller)',
        email: 'controller@railnet.gov.in',
        passwordHash: hashPasswordSync('control123'),
        role: 'OPERATIONS_CONTROLLER',
        department: 'OPERATIONS',
      },
      {
        id: 'usr-3',
        username: 'engineer_eng',
        name: 'Vikram Singh (Sr. Section Engineer - Track)',
        email: 'sse_track@railnet.gov.in',
        passwordHash: hashPasswordSync('eng123'),
        role: 'MAINTENANCE_ENGINEER',
        department: 'ENGINEERING',
      },
      {
        id: 'usr-4',
        username: 'engineer_td',
        name: 'Anil Verma (Sr. Section Engineer - OHE)',
        email: 'sse_ohe@railnet.gov.in',
        passwordHash: hashPasswordSync('ohe123'),
        role: 'MAINTENANCE_ENGINEER',
        department: 'TRACTION_DISTRIBUTION',
      },
      {
        id: 'usr-5',
        username: 'engineer_st',
        name: 'Deepak Patel (Sr. Section Engineer - Telecom)',
        email: 'sse_sig@railnet.gov.in',
        passwordHash: hashPasswordSync('sig123'),
        role: 'MAINTENANCE_ENGINEER',
        department: 'SIGNAL_TELECOM',
      },
    ];

    // 2. Corridors (10 Corridors)
    this.corridors = [
      { id: 'c-01', code: 'C001', name: 'New Delhi - Kanpur Central (NDLS-CNB Main Line)', startStation: 'New Delhi (NDLS)', endStation: 'Kanpur Central (CNB)', lengthKm: 440, totalTracks: 4 },
      { id: 'c-02', code: 'C002', name: 'Kanpur Central - Prayagraj (CNB-PRYJ Line)', startStation: 'Kanpur Central (CNB)', endStation: 'Prayagraj Junction (PRYJ)', lengthKm: 194, totalTracks: 3 },
      { id: 'c-03', code: 'C003', name: 'Prayagraj - Pt. Deen Dayal Upadhyaya (PRYJ-DDU Cord)', startStation: 'Prayagraj Junction (PRYJ)', endStation: 'Pt. Deen Dayal Upadhyaya (DDU)', lengthKm: 153, totalTracks: 4 },
      { id: 'c-04', code: 'C004', name: 'New Delhi - Ambala Cantt (NDLS-UMB Line)', startStation: 'New Delhi (NDLS)', endStation: 'Ambala Cantt (UMB)', lengthKm: 198, totalTracks: 2 },
      { id: 'c-05', code: 'C005', name: 'Lucknow Charbagh - Gorakhpur (LKO-GKP Branch)', startStation: 'Lucknow Charbagh (LKO)', endStation: 'Gorakhpur Junction (GKP)', lengthKm: 276, totalTracks: 2 },
      { id: 'c-06', code: 'C006', name: 'Varanasi - Deen Dayal Upadhyaya (BSB-DDU Link)', startStation: 'Varanasi Junction (BSB)', endStation: 'Pt. Deen Dayal Upadhyaya (DDU)', lengthKm: 18, totalTracks: 2 },
      { id: 'c-07', code: 'C007', name: 'Jhansi - Kanpur Central (VGLJ-CNB Section)', startStation: 'VGL Jhansi (VGLJ)', endStation: 'Kanpur Central (CNB)', lengthKm: 220, totalTracks: 2 },
      { id: 'c-08', code: 'C008', name: 'Moradabad - Lucknow (MB-LKO Main Line)', startStation: 'Moradabad (MB)', endStation: 'Lucknow Charbagh (LKO)', lengthKm: 325, totalTracks: 2 },
      { id: 'c-09', code: 'C009', name: 'Agra Cantt - Jhansi (AGC-VGLJ Section)', startStation: 'Agra Cantt (AGC)', endStation: 'VGL Jhansi (VGLJ)', lengthKm: 215, totalTracks: 3 },
      { id: 'c-10', code: 'C010', name: 'Ghaziabad - Meerut City (GZB-MTC Line)', startStation: 'Ghaziabad (GZB)', endStation: 'Meerut City (MTC)', lengthKm: 48, totalTracks: 2 },
    ];

    // 3. Assets (24 Assets across ENG, TD, ST)
    this.assets = [
      // Engineering Track Assets
      { id: 'ast-101', assetCode: 'TRK-101', name: 'Main Line Track Up Line Km 142/12-145/00', assetType: 'TRACK', department: 'ENGINEERING', corridorId: 'c-01', location: 'Km 142/12 - 145/00 (Aligarh Sec)', criticality: 'CRITICAL', conditionScore: 42, availability: 94.2, lastMaintenanceDate: '2026-07-15', nextDueDate: '2026-09-10', hasDefect: true },
      { id: 'ast-102', assetCode: 'TRK-102', name: 'Main Line Track Down Line Km 210/00-214/10', assetType: 'TRACK', department: 'ENGINEERING', corridorId: 'c-01', location: 'Km 210/00 - 214/10 (Tundla Sec)', criticality: 'HIGH', conditionScore: 65, availability: 97.5, lastMaintenanceDate: '2026-08-01', nextDueDate: '2026-09-15', hasDefect: false },
      { id: 'ast-103', assetCode: 'TRK-103', name: '3rd Line Rail Joints Km 88/00-92/00', assetType: 'TRACK', department: 'ENGINEERING', corridorId: 'c-02', location: 'Km 88/00 - 92/00 (Fatehpur Sec)', criticality: 'HIGH', conditionScore: 38, availability: 91.0, lastMaintenanceDate: '2026-06-20', nextDueDate: '2026-09-08', hasDefect: true },
      { id: 'ast-104', assetCode: 'SWT-201', name: 'High Speed Turnout Switch 1:12 No 44B', assetType: 'SWITCH', department: 'ENGINEERING', corridorId: 'c-01', location: 'CNB West Yard Switch 44B', criticality: 'CRITICAL', conditionScore: 35, availability: 89.4, lastMaintenanceDate: '2026-06-10', nextDueDate: '2026-09-05', hasDefect: true },
      { id: 'ast-105', assetCode: 'BRG-301', name: 'Yamuna Girder Bridge No 18 Track Span 4', assetType: 'BRIDGE', department: 'ENGINEERING', corridorId: 'c-03', location: 'PRYJ North Yamuna Bridge', criticality: 'HIGH', conditionScore: 72, availability: 98.1, lastMaintenanceDate: '2026-07-28', nextDueDate: '2026-09-25', hasDefect: false },
      { id: 'ast-106', assetCode: 'CRS-202', name: 'Diamond Crossing No 12A Kanpur Central', assetType: 'CROSSING', department: 'ENGINEERING', corridorId: 'c-02', location: 'CNB East Yard Crossing 12A', criticality: 'MEDIUM', conditionScore: 58, availability: 96.0, lastMaintenanceDate: '2026-07-10', nextDueDate: '2026-09-12', hasDefect: false },
      { id: 'ast-107', assetCode: 'TRK-104', name: 'Main Line Track Up Km 45/10-48/00', assetType: 'TRACK', department: 'ENGINEERING', corridorId: 'c-04', location: 'Km 45/10 - 48/00 (Panipat Sec)', criticality: 'MEDIUM', conditionScore: 78, availability: 99.0, lastMaintenanceDate: '2026-08-10', nextDueDate: '2026-09-30', hasDefect: false },
      { id: 'ast-108', assetCode: 'TRK-105', name: 'Gorakhpur Yard Curved Rail Section Km 21/00', assetType: 'TRACK', department: 'ENGINEERING', corridorId: 'c-05', location: 'Km 21/00 (GKP Entry)', criticality: 'HIGH', conditionScore: 48, availability: 93.8, lastMaintenanceDate: '2026-07-02', nextDueDate: '2026-09-09', hasDefect: true },

      // Traction Distribution (OHE) Assets
      { id: 'ast-201', assetCode: 'OHE-401', name: '25kV AC Catenary Line Section Km 142-146', assetType: 'OHE_LINE', department: 'TRACTION_DISTRIBUTION', corridorId: 'c-01', location: 'Km 142 - 146 Catenary Up Line', criticality: 'CRITICAL', conditionScore: 40, availability: 93.5, lastMaintenanceDate: '2026-06-30', nextDueDate: '2026-09-09', hasDefect: true },
      { id: 'ast-202', assetCode: 'OHE-402', name: 'Section Insulator & Cantilever Assembly SI-14', assetType: 'OHE_LINE', department: 'TRACTION_DISTRIBUTION', corridorId: 'c-02', location: 'CNB Substation Feeder 2', criticality: 'HIGH', conditionScore: 68, availability: 97.9, lastMaintenanceDate: '2026-08-05', nextDueDate: '2026-09-20', hasDefect: false },
      { id: 'ast-203', assetCode: 'OHE-403', name: 'Traction Substation 132/25kV Transformer T2', assetType: 'OHE_LINE', department: 'TRACTION_DISTRIBUTION', corridorId: 'c-03', location: 'PRYJ Substation Yard', criticality: 'CRITICAL', conditionScore: 45, availability: 92.0, lastMaintenanceDate: '2026-06-18', nextDueDate: '2026-09-11', hasDefect: true },
      { id: 'ast-204', assetCode: 'OHE-404', name: 'Overhead Contact Wire Km 88-92 Fatehpur', assetType: 'OHE_LINE', department: 'TRACTION_DISTRIBUTION', corridorId: 'c-02', location: 'Km 88 - 92 Contact Wire', criticality: 'HIGH', conditionScore: 50, availability: 94.0, lastMaintenanceDate: '2026-07-05', nextDueDate: '2026-09-08', hasDefect: true },
      { id: 'ast-205', assetCode: 'OHE-405', name: 'Neutral Section Isolation Switch NS-04', assetType: 'OHE_LINE', department: 'TRACTION_DISTRIBUTION', corridorId: 'c-04', location: 'Km 110/00 Ambala Sec', criticality: 'MEDIUM', conditionScore: 82, availability: 99.2, lastMaintenanceDate: '2026-08-12', nextDueDate: '2026-10-05', hasDefect: false },
      { id: 'ast-206', assetCode: 'OHE-406', name: 'Catenary Wire Span Km 310/00 Moradabad', assetType: 'OHE_LINE', department: 'TRACTION_DISTRIBUTION', corridorId: 'c-08', location: 'Km 310/00 MB Line', criticality: 'MEDIUM', conditionScore: 70, availability: 98.0, lastMaintenanceDate: '2026-07-22', nextDueDate: '2026-09-22', hasDefect: false },

      // Signal & Telecommunication Assets
      { id: 'ast-301', assetCode: 'SIG-501', name: 'Electronic Interlocking (EI) Rack Aligarh Junction', assetType: 'SIGNAL', department: 'SIGNAL_TELECOM', corridorId: 'c-01', location: 'Aligarh Jn Signal Relay Room', criticality: 'CRITICAL', conditionScore: 36, availability: 90.5, lastMaintenanceDate: '2026-06-25', nextDueDate: '2026-09-07', hasDefect: true },
      { id: 'ast-302', assetCode: 'SIG-502', name: 'Automatic Block Signal Aspect S-142 Up', assetType: 'SIGNAL', department: 'SIGNAL_TELECOM', corridorId: 'c-01', location: 'Km 143/08 Signal S-142', criticality: 'HIGH', conditionScore: 44, availability: 93.0, lastMaintenanceDate: '2026-07-12', nextDueDate: '2026-09-10', hasDefect: true },
      { id: 'ast-303', assetCode: 'TEL-601', name: 'OFC Cable Loop & Transceiver Node 08', assetType: 'TELECOM', department: 'SIGNAL_TELECOM', corridorId: 'c-01', location: 'Km 142/00 - 150/00 OFC Cable', criticality: 'HIGH', conditionScore: 62, availability: 96.8, lastMaintenanceDate: '2026-07-20', nextDueDate: '2026-09-18', hasDefect: false },
      { id: 'ast-304', assetCode: 'SIG-503', name: 'Axle Counter System (Dual DPD) Fatehpur Sec', assetType: 'SIGNAL', department: 'SIGNAL_TELECOM', corridorId: 'c-02', location: 'Km 90/00 Axle Counter Track', criticality: 'CRITICAL', conditionScore: 41, availability: 91.8, lastMaintenanceDate: '2026-06-28', nextDueDate: '2026-09-08', hasDefect: true },
      { id: 'ast-305', assetCode: 'SIG-504', name: 'Point Machine Motor Drive PM-18B', assetType: 'SIGNAL', department: 'SIGNAL_TELECOM', corridorId: 'c-03', location: 'PRYJ Junction Point 18B', criticality: 'HIGH', conditionScore: 75, availability: 98.4, lastMaintenanceDate: '2026-08-08', nextDueDate: '2026-09-28', hasDefect: false },
      { id: 'ast-306', assetCode: 'TEL-602', name: 'MTRC GSM-R Base Transceiver Station BTS-12', assetType: 'TELECOM', department: 'SIGNAL_TELECOM', corridorId: 'c-02', location: 'Fatehpur Tower Site BTS-12', criticality: 'MEDIUM', conditionScore: 85, availability: 99.5, lastMaintenanceDate: '2026-08-15', nextDueDate: '2026-10-10', hasDefect: false },
      { id: 'ast-307', assetCode: 'SIG-505', name: 'Track Circuit Relay Box TC-42 Up Line', assetType: 'SIGNAL', department: 'SIGNAL_TELECOM', corridorId: 'c-05', location: 'GKP Sec Km 20/12', criticality: 'HIGH', conditionScore: 49, availability: 94.1, lastMaintenanceDate: '2026-07-08', nextDueDate: '2026-09-10', hasDefect: true },
      { id: 'ast-308', assetCode: 'TEL-603', name: 'VHF Emergency Control Communication Unit', assetType: 'TELECOM', department: 'SIGNAL_TELECOM', corridorId: 'c-07', location: 'VGLJ Control Room Unit', criticality: 'LOW', conditionScore: 90, availability: 99.9, lastMaintenanceDate: '2026-08-20', nextDueDate: '2026-10-20', hasDefect: false },
    ];

    // 4. Asset Defects (10 Active Synthetic Defects)
    this.defects = [
      { id: 'def-1', assetId: 'ast-101', defectType: 'Ultrasonic Flaw Defect (USFD) - Rail Weld Fracture Threat', description: 'Major transverse fatigue crack detected near rail weld at Km 143/18. Speed restricted to 30 km/h.', severity: 'CRITICAL', speedRestrictionKmh: 30, reportedAt: '2026-09-02 08:30', reportedBy: 'USFD Inspector Team 4', isResolved: false },
      { id: 'def-2', assetId: 'ast-103', defectType: 'Fishplate Wear & Joint Gap Expansion', description: 'Fishplate bolt elongation and severe gap exceeding 12mm under heavy load.', severity: 'SEVERE', speedRestrictionKmh: 45, reportedAt: '2026-09-03 11:15', reportedBy: 'Track Maintainer Gang 12', isResolved: false },
      { id: 'def-3', assetId: 'ast-104', defectType: 'Switch Point Blade Clearance & Wear', description: 'Switch blade 44B gap > 4mm in locked position causing turnout vibration.', severity: 'CRITICAL', speedRestrictionKmh: 20, reportedAt: '2026-09-01 14:20', reportedBy: 'SSE Track CNB', isResolved: false },
      { id: 'def-4', assetId: 'ast-201', defectType: 'OHE Contact Wire Diameter Wear & Sparking', description: 'Contact wire diameter reduced to 8.2mm (limit 8.5mm) causing pantograph arc arcing.', severity: 'CRITICAL', speedRestrictionKmh: 50, reportedAt: '2026-09-04 09:40', reportedBy: 'OHE Inspection Car 02', isResolved: false },
      { id: 'def-5', assetId: 'ast-203', defectType: 'Traction Transformer Oil Leak & Thermal Anomaly', description: 'Transformer T2 temperature rise of 18°C above threshold with minor bushing leak.', severity: 'SEVERE', speedRestrictionKmh: 0, reportedAt: '2026-09-05 16:00', reportedBy: 'Substation SCADA Alert', isResolved: false },
      { id: 'def-6', assetId: 'ast-204', defectType: 'Dropper Wire Snap & Cantilever Sag', description: 'Two dropper wires snapped at Km 91/04 causing contact wire sag of 45mm.', severity: 'MAJOR', speedRestrictionKmh: 60, reportedAt: '2026-09-03 17:30', reportedBy: 'Tower Wagon Patrol', isResolved: false },
      { id: 'def-7', assetId: 'ast-301', defectType: 'Electronic Interlocking Power Supply Ripple Voltage', description: 'DC-DC converter card 2 producing high ripple voltage, risk of total station signal blanking.', severity: 'CRITICAL', speedRestrictionKmh: 0, reportedAt: '2026-09-04 10:10', reportedBy: 'SMMS Automated Monitoring', isResolved: false },
      { id: 'def-8', assetId: 'ast-302', defectType: 'Aspect LED Array Partial Burnout', description: 'Red aspect LED array 30% unlit on Signal S-142.', severity: 'MAJOR', speedRestrictionKmh: 0, reportedAt: '2026-09-05 12:45', reportedBy: 'Loco Pilot Report 12301', isResolved: false },
      { id: 'def-9', assetId: 'ast-304', defectType: 'Axle Counter Wheel Sensor Signal Degradation', description: 'Channel B amplitude drop below 1.2V causing intermittent track section occupancy false alarms.', severity: 'CRITICAL', speedRestrictionKmh: 30, reportedAt: '2026-09-04 18:20', reportedBy: 'Signal Inspector PRYJ', isResolved: false },
      { id: 'def-10', assetId: 'ast-108', defectType: 'Curve Rail Gauge Widening & Ballast Deficiency', description: 'Gauge widened by +10mm on 3-degree curve at Km 21/00 GKP entry.', severity: 'SEVERE', speedRestrictionKmh: 40, reportedAt: '2026-09-03 07:50', reportedBy: 'Track Recording Car (TRC)', isResolved: false },
    ];

    // 5. Maintenance Tasks (22 Tasks across ENG, TD, ST)
    this.tasks = [
      { id: 'tsk-001', taskId: 'MT-001', assetId: 'ast-101', department: 'ENGINEERING', maintenanceType: 'DEFECT_RECTIFICATION', description: 'Deep tamping & rail weld replacement at Km 143/18 (USFD Defect Rectification)', defectId: 'def-1', priorityScore: 96, criticality: 'CRITICAL', urgency: 'CRITICAL', estimatedDurationMinutes: 180, requiredResources: ['Tamper-Machine-CSM', 'Power-Block', 'Track-Gang-12'], preferredWindowStart: '01:00', preferredWindowEnd: '04:30', deadline: '2026-09-10', status: 'PENDING', createdAt: '2026-09-05' },
      { id: 'tsk-002', taskId: 'MT-002', assetId: 'ast-201', department: 'TRACTION_DISTRIBUTION', maintenanceType: 'DEFECT_RECTIFICATION', description: 'OHE Contact Wire replacement & tension adjustment Km 142-146', defectId: 'def-4', priorityScore: 92, criticality: 'CRITICAL', urgency: 'CRITICAL', estimatedDurationMinutes: 150, requiredResources: ['Tower-Wagon-TW04', 'OHE-Power-Block', 'Wiring-Gang-2'], preferredWindowStart: '01:30', preferredWindowEnd: '04:30', deadline: '2026-09-10', status: 'PENDING', createdAt: '2026-09-05' },
      { id: 'tsk-003', taskId: 'MT-003', assetId: 'ast-301', department: 'SIGNAL_TELECOM', maintenanceType: 'DEFECT_RECTIFICATION', description: 'Electronic Interlocking DC Converter Card replacement & relay testing Aligarh', defectId: 'def-7', priorityScore: 94, criticality: 'CRITICAL', urgency: 'CRITICAL', estimatedDurationMinutes: 90, requiredResources: ['Signal-Disconnection', 'EI-Specialist-Team'], preferredWindowStart: '02:00', preferredWindowEnd: '04:00', deadline: '2026-09-09', status: 'PENDING', createdAt: '2026-09-05' },
      { id: 'tsk-004', taskId: 'MT-004', assetId: 'ast-104', department: 'ENGINEERING', maintenanceType: 'CORRECTIVE', description: 'Turnout Switch 44B Point overhaul & nose grinding CNB West Yard', defectId: 'def-3', priorityScore: 88, criticality: 'CRITICAL', urgency: 'HIGH', estimatedDurationMinutes: 120, requiredResources: ['Point-Grinder', 'Track-Gang-4'], preferredWindowStart: '02:00', preferredWindowEnd: '05:00', deadline: '2026-09-11', status: 'PENDING', createdAt: '2026-09-06' },
      { id: 'tsk-005', taskId: 'MT-005', assetId: 'ast-103', department: 'ENGINEERING', maintenanceType: 'DEFECT_RECTIFICATION', description: 'Fishplate replacement & rail joint tightening Km 88-92 Fatehpur', defectId: 'def-2', priorityScore: 85, criticality: 'HIGH', urgency: 'HIGH', estimatedDurationMinutes: 120, requiredResources: ['Hydraulic-Wrench', 'Track-Gang-12'], preferredWindowStart: '01:00', preferredWindowEnd: '04:00', deadline: '2026-09-11', status: 'PENDING', createdAt: '2026-09-06' },
      { id: 'tsk-006', taskId: 'MT-006', assetId: 'ast-204', department: 'TRACTION_DISTRIBUTION', maintenanceType: 'DEFECT_RECTIFICATION', description: 'Dropper wire re-stringing & cantilever alignment Km 88-92 Fatehpur', defectId: 'def-6', priorityScore: 83, criticality: 'HIGH', urgency: 'HIGH', estimatedDurationMinutes: 120, requiredResources: ['Tower-Wagon-TW02', 'OHE-Power-Block'], preferredWindowStart: '01:00', preferredWindowEnd: '04:00', deadline: '2026-09-11', status: 'PENDING', createdAt: '2026-09-06' },
      { id: 'tsk-007', taskId: 'MT-007', assetId: 'ast-304', department: 'SIGNAL_TELECOM', maintenanceType: 'DEFECT_RECTIFICATION', description: 'Axle Counter Wheel Sensor replacement & tuning Km 90 Fatehpur', defectId: 'def-9', priorityScore: 86, criticality: 'CRITICAL', urgency: 'HIGH', estimatedDurationMinutes: 75, requiredResources: ['Signal-Disconnection', 'S&T-Gang-1'], preferredWindowStart: '01:30', preferredWindowEnd: '03:30', deadline: '2026-09-10', status: 'PENDING', createdAt: '2026-09-06' },
      { id: 'tsk-008', taskId: 'MT-008', assetId: 'ast-203', department: 'TRACTION_DISTRIBUTION', maintenanceType: 'CORRECTIVE', description: 'Traction Substation Transformer T2 Bushing replacement PRYJ', defectId: 'def-5', priorityScore: 89, criticality: 'CRITICAL', urgency: 'HIGH', estimatedDurationMinutes: 210, requiredResources: ['Transformer-Crane', 'Substation-Power-Block'], preferredWindowStart: '00:00', preferredWindowEnd: '05:00', deadline: '2026-09-12', status: 'PENDING', createdAt: '2026-09-06' },
      { id: 'tsk-009', taskId: 'MT-009', assetId: 'ast-108', department: 'ENGINEERING', maintenanceType: 'CORRECTIVE', description: 'Curve re-alignment & ballast regulating Km 21/00 GKP Entry', defectId: 'def-10', priorityScore: 81, criticality: 'HIGH', urgency: 'HIGH', estimatedDurationMinutes: 180, requiredResources: ['Ballast-Regulator', 'Tamper-Machine-CSM'], preferredWindowStart: '11:00', preferredWindowEnd: '15:00', deadline: '2026-09-12', status: 'PENDING', createdAt: '2026-09-06' },
      { id: 'tsk-010', taskId: 'MT-010', assetId: 'ast-307', department: 'SIGNAL_TELECOM', maintenanceType: 'CORRECTIVE', description: 'Track Circuit Relay Box TC-42 wiring overhaul GKP Entry', defectId: 'def-8', priorityScore: 78, criticality: 'HIGH', urgency: 'MEDIUM', estimatedDurationMinutes: 90, requiredResources: ['S&T-Gang-3'], preferredWindowStart: '11:30', preferredWindowEnd: '14:30', deadline: '2026-09-13', status: 'PENDING', createdAt: '2026-09-06' },

      // Preventive Routine Tasks
      { id: 'tsk-011', taskId: 'MT-011', assetId: 'ast-102', department: 'ENGINEERING', maintenanceType: 'PREVENTIVE', description: 'Routine Track Tamping & Joint Inspection Km 210-214 Tundla', priorityScore: 65, criticality: 'HIGH', urgency: 'MEDIUM', estimatedDurationMinutes: 150, requiredResources: ['Tamper-Machine-CSM'], preferredWindowStart: '01:00', preferredWindowEnd: '04:00', deadline: '2026-09-16', status: 'PENDING', createdAt: '2026-09-07' },
      { id: 'tsk-012', taskId: 'MT-012', assetId: 'ast-202', department: 'TRACTION_DISTRIBUTION', maintenanceType: 'PREVENTIVE', description: 'Annual Section Insulator Inspection SI-14 CNB Substation', priorityScore: 60, criticality: 'HIGH', urgency: 'MEDIUM', estimatedDurationMinutes: 120, requiredResources: ['Tower-Wagon-TW01'], preferredWindowStart: '01:00', preferredWindowEnd: '04:00', deadline: '2026-09-18', status: 'PENDING', createdAt: '2026-09-07' },
      { id: 'tsk-013', taskId: 'MT-013', assetId: 'ast-302', department: 'SIGNAL_TELECOM', maintenanceType: 'DEFECT_RECTIFICATION', description: 'Aspect LED Array replacement Signal S-142 Up', priorityScore: 70, criticality: 'HIGH', urgency: 'MEDIUM', estimatedDurationMinutes: 60, requiredResources: ['Signal-Gang-2'], preferredWindowStart: '02:00', preferredWindowEnd: '03:30', deadline: '2026-09-14', status: 'PENDING', createdAt: '2026-09-07' },
      { id: 'tsk-014', taskId: 'MT-014', assetId: 'ast-105', department: 'ENGINEERING', maintenanceType: 'PREVENTIVE', description: 'Yamuna Bridge Span 4 Expansion Joint Lubrication & Rivet Check', priorityScore: 55, criticality: 'HIGH', urgency: 'LOW', estimatedDurationMinutes: 180, requiredResources: ['Bridge-Gang-1'], preferredWindowStart: '10:00', preferredWindowEnd: '14:00', deadline: '2026-09-22', status: 'PENDING', createdAt: '2026-09-07' },
      { id: 'tsk-015', taskId: 'MT-015', assetId: 'ast-305', department: 'SIGNAL_TELECOM', maintenanceType: 'PREVENTIVE', description: 'Point Machine Motor Drive PM-18B Lubrication & Friction Test', priorityScore: 52, criticality: 'HIGH', urgency: 'LOW', estimatedDurationMinutes: 60, requiredResources: ['S&T-Gang-2'], preferredWindowStart: '02:00', preferredWindowEnd: '04:00', deadline: '2026-09-24', status: 'PENDING', createdAt: '2026-09-07' },
      { id: 'tsk-016', taskId: 'MT-016', assetId: 'ast-205', department: 'TRACTION_DISTRIBUTION', maintenanceType: 'PREVENTIVE', description: 'Neutral Section Isolation Switch NS-04 Maintenance Panipat Sec', priorityScore: 48, criticality: 'MEDIUM', urgency: 'LOW', estimatedDurationMinutes: 90, requiredResources: ['Tower-Wagon-TW03'], preferredWindowStart: '01:30', preferredWindowEnd: '03:30', deadline: '2026-09-28', status: 'PENDING', createdAt: '2026-09-07' },
      { id: 'tsk-017', taskId: 'MT-017', assetId: 'ast-107', department: 'ENGINEERING', maintenanceType: 'PREVENTIVE', description: 'Shoulder Ballast Cleaning Km 45-48 Panipat Section', priorityScore: 45, criticality: 'MEDIUM', urgency: 'LOW', estimatedDurationMinutes: 240, requiredResources: ['Ballast-Cleaner-FRM'], preferredWindowStart: '11:00', preferredWindowEnd: '15:00', deadline: '2026-09-29', status: 'PENDING', createdAt: '2026-09-07' },
      { id: 'tsk-018', taskId: 'MT-018', assetId: 'ast-303', department: 'SIGNAL_TELECOM', maintenanceType: 'PREVENTIVE', description: 'OFC Cable Optical Time Domain Reflectometer (OTDR) Testing Km 142-150', priorityScore: 42, criticality: 'HIGH', urgency: 'LOW', estimatedDurationMinutes: 90, requiredResources: ['Telecom-Gang-1'], preferredWindowStart: '10:00', preferredWindowEnd: '12:00', deadline: '2026-09-25', status: 'PENDING', createdAt: '2026-09-07' },
      { id: 'tsk-019', taskId: 'MT-019', assetId: 'ast-206', department: 'TRACTION_DISTRIBUTION', maintenanceType: 'PREVENTIVE', description: 'Moradabad Catenary Wire Height & Stagger Survey Km 310', priorityScore: 40, criticality: 'MEDIUM', urgency: 'LOW', estimatedDurationMinutes: 120, requiredResources: ['Tower-Wagon-TW05'], preferredWindowStart: '01:00', preferredWindowEnd: '03:30', deadline: '2026-09-26', status: 'PENDING', createdAt: '2026-09-07' },
      { id: 'tsk-020', taskId: 'MT-020', assetId: 'ast-106', department: 'ENGINEERING', maintenanceType: 'PREVENTIVE', description: 'Diamond Crossing 12A Check Rail Clearance Measurement CNB', priorityScore: 50, criticality: 'MEDIUM', urgency: 'LOW', estimatedDurationMinutes: 90, requiredResources: ['Track-Gang-3'], preferredWindowStart: '02:00', preferredWindowEnd: '04:00', deadline: '2026-09-20', status: 'PENDING', createdAt: '2026-09-07' },
      { id: 'tsk-021', taskId: 'MT-021', assetId: 'ast-306', department: 'SIGNAL_TELECOM', maintenanceType: 'PREVENTIVE', description: 'MTRC GSM-R Base Station Antenna Tilt Check & Battery Testing', priorityScore: 35, criticality: 'MEDIUM', urgency: 'LOW', estimatedDurationMinutes: 60, requiredResources: ['Telecom-Gang-2'], preferredWindowStart: '09:00', preferredWindowEnd: '11:00', deadline: '2026-09-30', status: 'PENDING', createdAt: '2026-09-07' },
      { id: 'tsk-022', taskId: 'MT-022', assetId: 'ast-308', department: 'SIGNAL_TELECOM', maintenanceType: 'PREVENTIVE', description: 'VHF Emergency Control Console Calibration Jhansi', priorityScore: 30, criticality: 'LOW', urgency: 'LOW', estimatedDurationMinutes: 45, requiredResources: ['Telecom-Gang-3'], preferredWindowStart: '14:00', preferredWindowEnd: '16:00', deadline: '2026-10-05', status: 'PENDING', createdAt: '2026-09-07' },
    ];

    // 6. Trains (32 Synthetic Trains)
    this.trains = [
      { id: 'trn-12301', trainNumber: '12301', trainName: 'Howrah Rajdhani Express', trainType: 'SUPERFAST', priorityRank: 1 },
      { id: 'trn-12302', trainNumber: '12302', trainName: 'New Delhi Rajdhani Express', trainType: 'SUPERFAST', priorityRank: 1 },
      { id: 'trn-12004', trainNumber: '12004', trainName: 'Lucknow Swarna Shatabdi Express', trainType: 'SUPERFAST', priorityRank: 1 },
      { id: 'trn-22436', trainNumber: '22436', trainName: 'Vande Bharat Express (NDLS-BSB)', trainType: 'SUPERFAST', priorityRank: 1 },
      { id: 'trn-12582', trainNumber: '12582', trainName: 'New Delhi - Banaras SF Express', trainType: 'SUPERFAST', priorityRank: 1 },
      { id: 'trn-12393', trainNumber: '12393', trainName: 'Sampoorna Kranti Express', trainType: 'SUPERFAST', priorityRank: 1 },
      { id: 'trn-12801', trainNumber: '12801', trainName: 'Purushottam Express', trainType: 'EXPRESS', priorityRank: 2 },
      { id: 'trn-12417', trainNumber: '12417', trainName: 'Prayagraj Express', trainType: 'EXPRESS', priorityRank: 2 },
      { id: 'trn-12451', trainNumber: '12451', trainName: 'Shram Shakti Express', trainType: 'EXPRESS', priorityRank: 2 },
      { id: 'trn-12555', trainNumber: '12555', trainName: 'Gorakhdham Express', trainType: 'EXPRESS', priorityRank: 2 },
      { id: 'trn-14163', trainNumber: '14163', trainName: 'Sangam Express', trainType: 'EXPRESS', priorityRank: 2 },
      { id: 'trn-12175', trainNumber: '12175', trainName: 'Chambal Express', trainType: 'EXPRESS', priorityRank: 2 },
      { id: 'trn-04135', trainNumber: '04135', trainName: 'CNB - ALJN Passenger', trainType: 'PASSENGER', priorityRank: 3 },
      { id: 'trn-04141', trainNumber: '04141', trainName: 'NDLS - ALJN MEMU Special', trainType: 'PASSENGER', priorityRank: 3 },
      { id: 'trn-04201', trainNumber: '04201', trainName: 'LKO - GKP Passenger', trainType: 'PASSENGER', priorityRank: 3 },
      { id: 'trn-04305', trainNumber: '04305', trainName: 'MB - LKO Passenger', trainType: 'PASSENGER', priorityRank: 3 },
      { id: 'trn-FGT-101', trainNumber: 'BOXN-881', trainName: 'Coal Rake Container Freight (DDU-NDLS)', trainType: 'FREIGHT', priorityRank: 4 },
      { id: 'trn-FGT-102', trainNumber: 'BCNA-402', trainName: 'Food Grain Rake (Punjab-Bihar)', trainType: 'FREIGHT', priorityRank: 4 },
      { id: 'trn-FGT-103', trainNumber: 'BTPN-901', trainName: 'Petroleum Tank Rake (IOCL-Kanpur)', trainType: 'FREIGHT', priorityRank: 4 },
      { id: 'trn-FGT-104', trainNumber: 'CONCOR-311', trainName: 'Container Express (Dadri DFC Link)', trainType: 'FREIGHT', priorityRank: 4 },
    ];

    // 7. Train Schedules (30+ Timetable Schedules across Corridors)
    this.schedules = [
      // Corridor C001 (NDLS-CNB)
      { id: 'sch-1', trainId: 'trn-12301', trainNumber: '12301', trainName: 'Howrah Rajdhani Express', trainType: 'SUPERFAST', corridorId: 'c-01', origin: 'NDLS', destination: 'HWH', arrivalTime: '16:55', departureTime: '17:00', dayOfWeek: 'DAILY', isDaily: true },
      { id: 'sch-2', trainId: 'trn-22436', trainNumber: '22436', trainName: 'Vande Bharat Express', trainType: 'SUPERFAST', corridorId: 'c-01', origin: 'NDLS', destination: 'BSB', arrivalTime: '06:00', departureTime: '06:05', dayOfWeek: 'DAILY', isDaily: true },
      { id: 'sch-3', trainId: 'trn-12004', trainNumber: '12004', trainName: 'Lucknow Shatabdi Express', trainType: 'SUPERFAST', corridorId: 'c-01', origin: 'NDLS', destination: 'LKO', arrivalTime: '06:10', departureTime: '06:15', dayOfWeek: 'DAILY', isDaily: true },
      { id: 'sch-4', trainId: 'trn-12451', trainNumber: '12451', trainName: 'Shram Shakti Express', trainType: 'EXPRESS', corridorId: 'c-01', origin: 'CNB', destination: 'NDLS', arrivalTime: '23:55', departureTime: '00:05', dayOfWeek: 'DAILY', isDaily: true },
      { id: 'sch-5', trainId: 'trn-12393', trainNumber: '12393', trainName: 'Sampoorna Kranti Express', trainType: 'SUPERFAST', corridorId: 'c-01', origin: 'PNBE', destination: 'NDLS', arrivalTime: '07:20', departureTime: '07:25', dayOfWeek: 'DAILY', isDaily: true },
      { id: 'sch-6', trainId: 'trn-04141', trainNumber: '04141', trainName: 'NDLS - ALJN MEMU Special', trainType: 'PASSENGER', corridorId: 'c-01', origin: 'NDLS', destination: 'ALJN', arrivalTime: '08:30', departureTime: '08:35', dayOfWeek: 'DAILY', isDaily: true },
      { id: 'sch-7', trainId: 'trn-04135', trainNumber: '04135', trainName: 'CNB - ALJN Passenger', trainType: 'PASSENGER', corridorId: 'c-01', origin: 'CNB', destination: 'ALJN', arrivalTime: '15:10', departureTime: '15:15', dayOfWeek: 'DAILY', isDaily: true },
      { id: 'sch-8', trainId: 'trn-12417', trainNumber: '12417', trainName: 'Prayagraj Express', trainType: 'EXPRESS', corridorId: 'c-01', origin: 'PRYJ', destination: 'NDLS', arrivalTime: '00:30', departureTime: '00:35', dayOfWeek: 'DAILY', isDaily: true },

      // Corridor C002 (CNB-PRYJ)
      { id: 'sch-9', trainId: 'trn-12801', trainNumber: '12801', trainName: 'Purushottam Express', trainType: 'EXPRESS', corridorId: 'c-02', origin: 'PURI', destination: 'NDLS', arrivalTime: '02:15', departureTime: '02:20', dayOfWeek: 'DAILY', isDaily: true },
      { id: 'sch-10', trainId: 'trn-12582', trainNumber: '12582', trainName: 'NDLS - BSB SF Express', trainType: 'SUPERFAST', corridorId: 'c-02', origin: 'NDLS', destination: 'BSB', arrivalTime: '03:40', departureTime: '03:45', dayOfWeek: 'DAILY', isDaily: true },
      { id: 'sch-11', trainId: 'trn-14163', trainNumber: '14163', trainName: 'Sangam Express', trainType: 'EXPRESS', corridorId: 'c-02', origin: 'MTC', destination: 'PRYJ', arrivalTime: '05:45', departureTime: '05:50', dayOfWeek: 'DAILY', isDaily: true },

      // Corridor C005 (LKO-GKP)
      { id: 'sch-12', trainId: 'trn-12555', trainNumber: '12555', trainName: 'Gorakhdham Express', trainType: 'EXPRESS', corridorId: 'c-05', origin: 'BTI', destination: 'GKP', arrivalTime: '12:30', departureTime: '12:35', dayOfWeek: 'DAILY', isDaily: true },
      { id: 'sch-13', trainId: 'trn-04201', trainNumber: '04201', trainName: 'LKO - GKP Passenger', trainType: 'PASSENGER', corridorId: 'c-05', origin: 'LKO', destination: 'GKP', arrivalTime: '13:15', departureTime: '13:20', dayOfWeek: 'DAILY', isDaily: true },
    ];

    // 8. Goods Train Forecast (Freight Traffic Levels across Corridors)
    this.freightForecasts = [
      { id: 'fgf-1', corridorId: 'c-01', forecastDate: '2026-09-08', timeSlot: '00:00-04:00', expectedTrainsCount: 2, trafficLevel: 'LOW' },
      { id: 'fgf-2', corridorId: 'c-01', forecastDate: '2026-09-08', timeSlot: '04:00-08:00', expectedTrainsCount: 7, trafficLevel: 'HIGH' },
      { id: 'fgf-3', corridorId: 'c-01', forecastDate: '2026-09-08', timeSlot: '08:00-12:00', expectedTrainsCount: 9, trafficLevel: 'CRITICAL' },
      { id: 'fgf-4', corridorId: 'c-01', forecastDate: '2026-09-08', timeSlot: '12:00-16:00', expectedTrainsCount: 6, trafficLevel: 'HIGH' },
      { id: 'fgf-5', corridorId: 'c-01', forecastDate: '2026-09-08', timeSlot: '16:00-20:00', expectedTrainsCount: 8, trafficLevel: 'HIGH' },
      { id: 'fgf-6', corridorId: 'c-01', forecastDate: '2026-09-08', timeSlot: '20:00-24:00', expectedTrainsCount: 4, trafficLevel: 'MEDIUM' },
      { id: 'fgf-7', corridorId: 'c-02', forecastDate: '2026-09-08', timeSlot: '01:00-05:00', expectedTrainsCount: 1, trafficLevel: 'LOW' },
      { id: 'fgf-8', corridorId: 'c-02', forecastDate: '2026-09-08', timeSlot: '09:00-13:00', expectedTrainsCount: 6, trafficLevel: 'HIGH' },
      { id: 'fgf-9', corridorId: 'c-05', forecastDate: '2026-09-08', timeSlot: '11:00-15:00', expectedTrainsCount: 5, trafficLevel: 'HIGH' },
    ];

    // 9. Corridor Availability (COA System Data)
    this.corridorAvailabilities = [
      { id: 'ca-1', corridorId: 'c-01', timeSlot: '00:00-01:00', status: 'RESTRICTED', trafficDensity: 'MEDIUM' },
      { id: 'ca-2', corridorId: 'c-01', timeSlot: '01:00-04:00', status: 'AVAILABLE', trafficDensity: 'LOW' },
      { id: 'ca-3', corridorId: 'c-01', timeSlot: '04:00-09:00', status: 'BUSY', trafficDensity: 'HIGH' },
      { id: 'ca-4', corridorId: 'c-01', timeSlot: '09:00-12:00', status: 'BUSY', trafficDensity: 'CRITICAL' },
      { id: 'ca-5', corridorId: 'c-01', timeSlot: '12:00-16:00', status: 'RESTRICTED', trafficDensity: 'HIGH' },
      { id: 'ca-6', corridorId: 'c-01', timeSlot: '16:00-20:00', status: 'BUSY', trafficDensity: 'HIGH' },
      { id: 'ca-7', corridorId: 'c-01', timeSlot: '20:00-24:00', status: 'AVAILABLE', trafficDensity: 'MEDIUM' },
      { id: 'ca-8', corridorId: 'c-02', timeSlot: '01:00-05:00', status: 'AVAILABLE', trafficDensity: 'LOW' },
      { id: 'ca-9', corridorId: 'c-05', timeSlot: '11:00-15:00', status: 'RESTRICTED', trafficDensity: 'HIGH' },
    ];

    // 10. Optimization Weights (Configurable by Admin)
    this.weights = [
      {
        id: 'opt-w-default',
        assetCriticalityWeight: 0.25,
        maintenanceUrgencyWeight: 0.25,
        trainImpactWeight: 0.15,
        delayWeight: 0.15,
        conflictWeight: 0.10,
        assetDowntimeWeight: 0.05,
        blockUtilizationWeight: 0.05,
        isDefault: true,
      },
    ];

    // 11. Initial Notifications
    this.notifications = [
      { id: 'ntf-1', title: 'Critical USFD Defect Detected', message: 'Asset TRK-101 (NDLS-CNB Main Line) reported critical rail weld crack. Speed restricted to 30 km/h.', type: 'DEFECT', isRead: false, createdAt: '2026-09-08 09:00' },
      { id: 'ntf-2', title: 'Overdue OHE Inspection Task', message: 'OHE Section Km 142-146 maintenance is overdue by 2 days.', type: 'DEFECT', isRead: false, createdAt: '2026-09-08 10:15' },
      { id: 'ntf-3', title: 'New Conflict Warning', message: 'Uncoordinated maintenance on Track & OHE requested for 08-Sep 02:00.', type: 'CONFLICT', isRead: false, createdAt: '2026-09-08 11:30' },
    ];

    // 12. Initial Audit Logs
    this.auditLogs = [
      { id: 'aud-1', userId: 'usr-1', username: 'admin', userRole: 'ADMIN', action: 'SYSTEM_INITIALIZATION', entityType: 'SYSTEM', entityId: 'sys-01', details: 'Synthetic demo data loaded for TMS, SMMS, TDMS, COA, and Train Timetable.', timestamp: '2026-09-08 08:00:00' },
    ];

    // 13. Generate Benchmark Initial Block Plan (With Naive vs Optimized metrics!)
    this.generateDefaultPlans();
  }

  private generateDefaultPlans(): void {
    // Generate a default weekly plan demo
    const planId = 'pln-weekly-01';
    
    // Joint Block 1: Merged Track (MT-001) + OHE (MT-002) + Signal (MT-003) on Corridor C001
    const block1: MaintenanceBlock = {
      id: 'blk-101',
      planId,
      taskId: 'tsk-001',
      corridorId: 'c-01',
      scheduledStartTime: '2026-09-09 01:00',
      scheduledEndTime: '2026-09-09 04:00',
      durationMinutes: 180,
      isJointBlock: true,
      coordinatingDepts: ['ENGINEERING', 'TRACTION_DISTRIBUTION', 'SIGNAL_TELECOM'],
      affectedPassengerTrains: 0,
      affectedGoodsTrains: 0,
      expectedDelayMinutes: 0,
      assetCriticality: 'CRITICAL',
      urgency: 'CRITICAL',
      conflictsCount: 0,
      optimizationScore: 98,
      recommendationReason: 'Selected 01:00-04:00 window because corridor traffic is low, no passenger trains scheduled, freight forecast is LOW, and combined 3 departments into a single Joint Block saving 2.5 hours of track closure time.',
      approvalStatus: 'APPROVED',
    };

    const block2: MaintenanceBlock = {
      id: 'blk-102',
      planId,
      taskId: 'tsk-005',
      corridorId: 'c-02',
      scheduledStartTime: '2026-09-09 01:30',
      scheduledEndTime: '2026-09-09 03:30',
      durationMinutes: 120,
      isJointBlock: true,
      coordinatingDepts: ['ENGINEERING', 'TRACTION_DISTRIBUTION', 'SIGNAL_TELECOM'],
      affectedPassengerTrains: 1,
      affectedGoodsTrains: 0,
      expectedDelayMinutes: 12,
      assetCriticality: 'HIGH',
      urgency: 'HIGH',
      conflictsCount: 0,
      optimizationScore: 94,
      recommendationReason: '01:30-03:30 selected during lowest density window on CNB-PRYJ line. Coordinated track fishplate repair with OHE dropper fixing and axle counter sensor swap.',
      approvalStatus: 'APPROVED',
    };

    const block3: MaintenanceBlock = {
      id: 'blk-103',
      planId,
      taskId: 'tsk-009',
      corridorId: 'c-05',
      scheduledStartTime: '2026-09-09 11:30',
      scheduledEndTime: '2026-09-09 14:30',
      durationMinutes: 180,
      isJointBlock: true,
      coordinatingDepts: ['ENGINEERING', 'SIGNAL_TELECOM'],
      affectedPassengerTrains: 1,
      affectedGoodsTrains: 1,
      expectedDelayMinutes: 15,
      assetCriticality: 'HIGH',
      urgency: 'HIGH',
      conflictsCount: 0,
      optimizationScore: 89,
      recommendationReason: 'Scheduled in afternoon daylight window required for heavy curve re-alignment and relay box overhaul. Minor passenger regulation applied.',
      approvalStatus: 'PROPOSED',
    };

    this.blocks = [block1, block2, block3];

    this.plans = [
      {
        id: planId,
        planName: 'Weekly Corridor Maintenance Schedule (09-Sep to 15-Sep 2026)',
        horizonType: 'WEEKLY',
        startDate: '2026-09-09',
        endDate: '2026-09-15',
        status: 'OPTIMIZED',
        totalOptimizationScore: 94,
        metrics: {
          totalBlocks: 3,
          jointBlocksCount: 3,
          affectedTrainsCount: 2,
          totalDelayMinutes: 27,
          assetDowntimeHours: 8.0,
          conflictCount: 0,
          blockUtilizationPercent: 91.5,
          assetAvailabilityPercent: 97.4,
        },
        beforeMetrics: {
          totalBlocks: 7,
          affectedTrainsCount: 9,
          totalDelayMinutes: 135,
          assetDowntimeHours: 16.5,
          conflictCount: 6,
          blockUtilizationPercent: 52.0,
          assetAvailabilityPercent: 88.1,
        },
        createdAt: '2026-09-08 08:30:00',
        updatedAt: '2026-09-08 08:30:00',
      },
    ];
  }
}

export const store = new DataStore();
