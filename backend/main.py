from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from pydantic import BaseModel
from dotenv import load_dotenv
from models import Task
from schemas import TaskCreate, TaskUpdate
from auth import verify_jwt, enforce_ownership
from database import init_db, get_session
import os
from groq import Groq

load_dotenv("../.env")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class ChatRequest(BaseModel):
    message: str

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

@app.post("/api/{user_id}/chat")
def chat(user_id: str, req: ChatRequest, token_user_id: str = Depends(verify_jwt), session: Session = Depends(get_session)):
    enforce_ownership(token_user_id, user_id)
    tasks = session.exec(select(Task).where(Task.user_id == user_id)).all()
    
    try:
        tools = [
            {
                "type": "function",
                "function": {
                    "name": "add_task",
                    "description": "Create a new task",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "title": {"type": "string", "description": "Task title"},
                            "description": {"type": "string", "description": "Task description"}
                        },
                        "required": ["title"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "list_tasks",
                    "description": "List tasks by status",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "status": {"type": "string", "enum": ["all", "pending", "completed"], "description": "Filter tasks"}
                        },
                        "required": ["status"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "complete_task",
                    "description": "Mark a task as complete",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_id": {"type": "integer", "description": "Task ID"}
                        },
                        "required": ["task_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "delete_task",
                    "description": "Delete a task",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_id": {"type": "integer", "description": "Task ID"}
                        },
                        "required": ["task_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "update_task",
                    "description": "Update task title or description",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_id": {"type": "integer", "description": "Task ID"},
                            "title": {"type": "string", "description": "New title"},
                            "description": {"type": "string", "description": "New description"}
                        },
                        "required": ["task_id"]
                    }
                }
            }
        ]
        
        task_list = "\n".join([f"ID {t.id}: {t.title} ({'completed' if t.completed else 'pending'})" for t in tasks])
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": f"You are a task management assistant. Current tasks:\n{task_list}"},
                {"role": "user", "content": req.message}
            ],
            tools=tools,
            max_tokens=150
        )
        
        message = response.choices[0].message
        
        if message.tool_calls:
            import json
            result = ""
            modified = False
            
            for tool_call in message.tool_calls:
                args = json.loads(tool_call.function.arguments)
                
                if tool_call.function.name == "add_task":
                    new_task = Task(user_id=user_id, title=args["title"], description=args.get("description", ""))
                    session.add(new_task)
                    session.commit()
                    result = f"✓ Added: {args['title']}"
                    modified = True
                    
                elif tool_call.function.name == "list_tasks":
                    status = args["status"]
                    filtered = tasks if status == "all" else [t for t in tasks if (t.completed if status == "completed" else not t.completed)]
                    result = "\n".join([f"• {t.title} ({'✓' if t.completed else '○'})" for t in filtered]) or "No tasks found"
                    
                elif tool_call.function.name == "complete_task":
                    task = session.get(Task, args["task_id"])
                    if task and task.user_id == user_id:
                        task.completed = True
                        task.updated_at = datetime.utcnow()
                        session.commit()
                        result = f"✓ Completed: {task.title}"
                        modified = True
                    else:
                        result = "Task not found"
                        
                elif tool_call.function.name == "delete_task":
                    task = session.get(Task, args["task_id"])
                    if task and task.user_id == user_id:
                        session.delete(task)
                        session.commit()
                        result = f"✓ Deleted: {task.title}"
                        modified = True
                    else:
                        result = "Task not found"
                        
                elif tool_call.function.name == "update_task":
                    task = session.get(Task, args["task_id"])
                    if task and task.user_id == user_id:
                        if "title" in args:
                            task.title = args["title"]
                        if "description" in args:
                            task.description = args["description"]
                        task.updated_at = datetime.utcnow()
                        session.commit()
                        result = f"✓ Updated: {task.title}"
                        modified = True
                    else:
                        result = "Task not found"
            
            return {"response": result, "modified": modified}
        
        return {"response": message.content or "How can I help?"}
    except Exception as e:
        print(f"Groq API Error: {str(e)}")
        return {"response": "Sorry, I encountered an error."}
