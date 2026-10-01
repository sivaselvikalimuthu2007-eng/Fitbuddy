from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

DATABASE_URL = "sqlite:///fitness_app.db"

engine = create_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False)
    weight = Column(Float, nullable=False)
    goal = Column(String(50), nullable=False)
    intensity = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    plans = relationship("Plan", back_populates="user", cascade="all, delete-orphan")

class Plan(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    original_plan = Column(Text, nullable=False)
    updated_plan = Column(Text, nullable=True)
    nutrition_tip = Column(Text, nullable=True)
    last_feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="plans")

# Create tables
Base.metadata.create_all(bind=engine)

def save_user(user_id: int, name: str, age: int, weight: float, goal: str, intensity: str):
    """
    Saves new user information or updates an existing record.
    """
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.name = name
            user.age = int(age)
            user.weight = float(weight)
            user.goal = goal
            user.intensity = intensity
        else:
            user = User(
                id=int(user_id),
                name=name,
                age=int(age),
                weight=float(weight),
                goal=goal,
                intensity=intensity
            )
            db.add(user)
        db.commit()
        db.refresh(user)
        return user
    finally:
        db.close()

def save_plan(user_id: int, original_plan: str, nutrition_tip: str = None):
    """
    Saves or resets the original workout plan for a user.
    """
    db = SessionLocal()
    try:
        plan = db.query(Plan).filter(Plan.user_id == user_id).first()
        if plan:
            plan.original_plan = original_plan
            plan.updated_plan = None
            plan.nutrition_tip = nutrition_tip
            plan.last_feedback = None
            plan.updated_at = datetime.utcnow()
        else:
            plan = Plan(
                user_id=int(user_id),
                original_plan=original_plan,
                updated_plan=None,
                nutrition_tip=nutrition_tip
            )
            db.add(plan)
        db.commit()
        return plan
    finally:
        db.close()

def update_plan(user_id: int, updated_plan: str, feedback: str = None):
    """
    Saves the feedback-based revised workout plan into updated_plan
    without overwriting the original_plan.
    """
    db = SessionLocal()
    try:
        plan = db.query(Plan).filter(Plan.user_id == user_id).first()
        if plan:
            plan.updated_plan = updated_plan
            if feedback:
                plan.last_feedback = feedback
            plan.updated_at = datetime.utcnow()
            db.commit()
            return plan
        return None
    finally:
        db.close()

def get_original_plan(user_id: int) -> str:
    """
    Retrieves the original workout plan for a given user ID.
    """
    db = SessionLocal()
    try:
        plan = db.query(Plan).filter(Plan.user_id == user_id).first()
        return plan.original_plan if plan else None
    finally:
        db.close()

def get_user(user_id: int):
    """
    Retrieves user profile details by user ID.
    """
    db = SessionLocal()
    try:
        return db.query(User).filter(User.id == user_id).first()
    finally:
        db.close()

def get_all_users():
    """
    Retrieves all users along with their plans for the Admin View.
    """
    db = SessionLocal()
    try:
        users = db.query(User).all()
        result = []
        for u in users:
            plan = db.query(Plan).filter(Plan.user_id == u.id).first()
            result.append({
                "id": u.id,
                "name": u.name,
                "age": u.age,
                "weight": u.weight,
                "goal": u.goal,
                "intensity": u.intensity,
                "original_plan": plan.original_plan if plan else None,
                "updated_plan": plan.updated_plan if plan else None,
                "nutrition_tip": plan.nutrition_tip if plan else None,
                "last_feedback": plan.last_feedback if plan else None,
                "updated_at": plan.updated_at.strftime("%Y-%m-%d %H:%M") if plan and plan.updated_at else None
            })
        return result
    finally:
        db.close()
