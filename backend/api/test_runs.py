import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.models.test_run import Issue, Page, TestCase, TestRun

router = APIRouter(prefix="/api/test-runs", tags=["test-runs"])


@router.post("")
async def create_test_run(url: str, profile: str = "basic", db: AsyncSession = Depends(get_db)):
    test_run = TestRun(
        id=str(uuid.uuid4()),
        url=url,
        profile=profile,
        status="pending",
        created_at=datetime.utcnow(),
    )
    db.add(test_run)
    await db.commit()
    await db.refresh(test_run)
    return test_run


@router.get("")
async def list_test_runs(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    offset = (page - 1) * per_page
    count_q = select(func.count(TestRun.id))
    total = (await db.execute(count_q)).scalar()
    q = select(TestRun).order_by(TestRun.created_at.desc()).offset(offset).limit(per_page)
    results = (await db.execute(q)).scalars().all()
    return {"total": total, "page": page, "per_page": per_page, "items": results}


@router.get("/{test_run_id}")
async def get_test_run(test_run_id: str, db: AsyncSession = Depends(get_db)):
    q = select(TestRun).where(TestRun.id == test_run_id)
    test_run = (await db.execute(q)).scalar_one_or_none()
    if not test_run:
        raise HTTPException(status_code=404, detail="Test run not found")
    return test_run


@router.delete("/{test_run_id}")
async def delete_test_run(test_run_id: str, db: AsyncSession = Depends(get_db)):
    q = select(TestRun).where(TestRun.id == test_run_id)
    test_run = (await db.execute(q)).scalar_one_or_none()
    if not test_run:
        raise HTTPException(status_code=404, detail="Test run not found")
    await db.delete(test_run)
    await db.commit()
    return {"message": "Test run deleted"}


@router.get("/{test_run_id}/issues")
async def get_test_run_issues(test_run_id: str, db: AsyncSession = Depends(get_db)):
    q = select(Issue).where(Issue.test_run_id == test_run_id)
    results = (await db.execute(q)).scalars().all()
    return results


@router.get("/{test_run_id}/pages")
async def get_test_run_pages(test_run_id: str, db: AsyncSession = Depends(get_db)):
    q = select(Page).where(Page.test_run_id == test_run_id)
    results = (await db.execute(q)).scalars().all()
    return results


@router.get("/{test_run_id}/test-cases")
async def get_test_run_test_cases(test_run_id: str, db: AsyncSession = Depends(get_db)):
    q = select(TestCase).where(TestCase.test_run_id == test_run_id)
    results = (await db.execute(q)).scalars().all()
    return results
