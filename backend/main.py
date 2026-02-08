from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from models import Task
from schemas import TaskCreate, TaskUpdate
from auth import verify_jwt, enforce_ownership
from database import init_db, get_session

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/api/{user_id}/tasks")
def get_tasks(user_id: str, token_user_id: str = Depends(verify_jwt), session: Session = Depends(get_session)):
    enforce_ownership(token_user_id, user_id)
    tasks = session.exec(select(Task).where(Task.user_id == user_id)).all()
    return tasks

@app.post("/api/{user_id}/tasks")
def create_task(user_id: str, task: TaskCreate, token_user_id: str = Depends(verify_jwt), session: Session = Depends(get_session)):
    enforce_ownership(token_user_id, user_id)
    db_task = Task(user_id=user_id, title=task.title, description=task.description)
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task

@app.put("/api/{user_id}/tasks/{id}")
def update_task(user_id: str, id: int, task: TaskUpdate, token_user_id: str = Depends(verify_jwt), session: Session = Depends(get_session)):
    enforce_ownership(token_user_id, user_id)
    db_task = session.get(Task, id)
    if not db_task or db_task.user_id != user_id:
        raise HTTPException(status_code=404, detail="Task not found")
    db_task.title = task.title
    db_task.description = task.description
    db_task.completed = task.completed
    db_task.updated_at = datetime.utcnow()
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task

@app.delete("/api/{user_id}/tasks/{id}")
def delete_task(user_id: str, id: int, token_user_id: str = Depends(verify_jwt), session: Session = Depends(get_session)):
    enforce_ownership(token_user_id, user_id)
    db_task = session.get(Task, id)
    if not db_task or db_task.user_id != user_id:
        raise HTTPException(status_code=404, detail="Task not found")
    session.delete(db_task)
    session.commit()
    return {"ok": True}

@app.patch("/api/{user_id}/tasks/{id}/complete")
def complete_task(user_id: str, id: int, token_user_id: str = Depends(verify_jwt), session: Session = Depends(get_session)):
    enforce_ownership(token_user_id, user_id)
    db_task = session.get(Task, id)
    if not db_task or db_task.user_id != user_id:
        raise HTTPException(status_code=404, detail="Task not found")
    db_task.completed = True
    db_task.updated_at = datetime.utcnow()
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task
