import json
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy import select
from backend.database import async_session, get_db
from backend.models.test_run import TestRun, TestCase, Issue

router = APIRouter()


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, test_run_id: str, websocket: WebSocket):
        await websocket.accept()
        if test_run_id not in self.active_connections:
            self.active_connections[test_run_id] = []
        self.active_connections[test_run_id].append(websocket)

    def disconnect(self, test_run_id: str, websocket: WebSocket):
        if test_run_id in self.active_connections:
            self.active_connections[test_run_id].remove(websocket)
            if not self.active_connections[test_run_id]:
                del self.active_connections[test_run_id]

    async def send_log(self, test_run_id: str, message: dict):
        if test_run_id in self.active_connections:
            for conn in self.active_connections[test_run_id]:
                try:
                    await conn.send_json(message)
                except Exception:
                    pass

    async def broadcast_progress(self, test_run_id: str, progress: int, status: str, message: str = ""):
        await self.send_log(test_run_id, {
            "type": "progress",
            "progress": progress,
            "status": status,
            "message": message,
        })

    async def broadcast_issue(self, test_run_id: str, issue: dict):
        await self.send_log(test_run_id, {
            "type": "issue",
            "issue": issue,
        })


manager = ConnectionManager()


@router.websocket("/ws/test-run/{test_run_id}")
async def websocket_endpoint(websocket: WebSocket, test_run_id: str):
    await manager.connect(test_run_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            if msg.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(test_run_id, websocket)
