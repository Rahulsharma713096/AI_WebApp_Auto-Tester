import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.database import Base


class TestRun(Base):
    __tablename__ = "test_runs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    url = Column(Text, nullable=False)
    status = Column(String(50), default="pending")
    profile = Column(String(50), default="basic")
    score = Column(Integer, nullable=True)
    duration = Column(Float, nullable=True)
    summary = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    pages = relationship("Page", back_populates="test_run", cascade="all, delete-orphan")
    issues = relationship("Issue", back_populates="test_run", cascade="all, delete-orphan")
    test_cases = relationship("TestCase", back_populates="test_run", cascade="all, delete-orphan")


class Page(Base):
    __tablename__ = "pages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    test_run_id = Column(String(36), ForeignKey("test_runs.id"), nullable=False)
    url = Column(Text, nullable=False)
    title = Column(String(500), nullable=True)
    screenshot_url = Column(Text, nullable=True)
    html_snapshot = Column(Text, nullable=True)
    console_logs = Column(JSON, nullable=True)
    network_requests = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    test_run = relationship("TestRun", back_populates="pages")


class Issue(Base):
    __tablename__ = "issues"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    test_run_id = Column(String(36), ForeignKey("test_runs.id"), nullable=False)
    page_id = Column(String(36), ForeignKey("pages.id"), nullable=True)
    severity = Column(String(20), default="medium")
    category = Column(String(50), nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    recommendation = Column(Text, nullable=True)
    element_selector = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    test_run = relationship("TestRun", back_populates="issues")


class TestCase(Base):
    __tablename__ = "test_cases"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    test_run_id = Column(String(36), ForeignKey("test_runs.id"), nullable=False)
    title = Column(String(500), nullable=False)
    status = Column(String(20), default="pending")
    type = Column(String(50), default="functional")
    duration = Column(Float, nullable=True)
    logs = Column(Text, nullable=True)
    error = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    test_run = relationship("TestRun", back_populates="test_cases")
