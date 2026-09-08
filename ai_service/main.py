# pyrefly: ignore [missing-import]
from fastapi import FastAPI, HTTPException
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from app.core.prioritizer import TaskPrioritizer
from app.core.conflict_detector import ConflictDetector
from app.core.joint_block_coordinator import JointBlockCoordinator
from app.core.optimizer import BlockPlanningOptimizer
from app.core.simulator import WhatIfSimulator

app = FastAPI(
    title="Indian Railways Automatic Block Planning AI Service",
    description="Python AI & Optimization Engine for SIH26027",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
@app.get("/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "Python AI Optimization Service",
        "version": "1.0.0",
        "disclaimer": "Prototype using synthetic demonstration data. Not connected to live Indian Railways systems."
    }

class PrioritizeRequest(BaseModel):
    task: Dict[str, Any]
    asset: Optional[Dict[str, Any]] = None
    defect: Optional[Dict[str, Any]] = None

@app.post("/api/prioritize")
def prioritize_task(req: PrioritizeRequest):
    score = TaskPrioritizer.calculate_priority_score(req.task, req.asset, req.defect)
    return {"priorityScore": score}

class ConflictRequest(BaseModel):
    blocks: List[Dict[str, Any]]
    schedules: List[Dict[str, Any]]
    freightForecasts: List[Dict[str, Any]]
    corridorAvailabilities: List[Dict[str, Any]]

@app.post("/api/detect-conflicts")
def detect_conflicts(req: ConflictRequest):
    conflicts = ConflictDetector.detect_all_conflicts(
        req.blocks, req.schedules, req.freightForecasts, req.corridorAvailabilities
    )
    return {"conflicts": conflicts, "totalCount": len(conflicts)}

class JointBlockRequest(BaseModel):
    tasks: List[Dict[str, Any]]
    assets: List[Dict[str, Any]]

@app.post("/api/joint-blocks")
def get_joint_blocks(req: JointBlockRequest):
    joint_info = JointBlockCoordinator.identify_and_merge_joint_blocks(req.tasks, req.assets)
    return {"jointBlocks": joint_info}

class OptimizeRequest(BaseModel):
    horizonType: str = "WEEKLY"
    startDate: str = "2026-09-09"
    endDate: str = "2026-09-15"
    tasks: List[Dict[str, Any]]
    assets: List[Dict[str, Any]]
    defects: List[Dict[str, Any]] = []
    schedules: List[Dict[str, Any]] = []
    freightForecasts: List[Dict[str, Any]] = []
    corridors: List[Dict[str, Any]] = []
    weights: Optional[Dict[str, Any]] = None

@app.post("/api/optimize")
def optimize_block_schedule(req: OptimizeRequest):
    res = BlockPlanningOptimizer.optimize_schedule(
        req.horizonType,
        req.startDate,
        req.endDate,
        req.tasks,
        req.assets,
        req.defects,
        req.schedules,
        req.freightForecasts,
        req.corridors,
        req.weights
    )
    return res

@app.post("/api/simulate")
def simulate_scenario(payload: Dict[str, Any]):
    return WhatIfSimulator.simulate_scenario(payload)

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
