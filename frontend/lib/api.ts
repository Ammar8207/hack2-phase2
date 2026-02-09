import { Task, TaskCreate, TaskUpdate } from "@/types/task";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAuthHeaders() {
  const token = localStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getTasks(userId: string): Promise<Task[]> {
  const res = await fetch(`${API_URL}/api/${userId}/tasks`, {
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

export async function createTask(userId: string, task: TaskCreate): Promise<Task> {
  const res = await fetch(`${API_URL}/api/${userId}/tasks`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error("Failed to create task");
  return res.json();
}

export async function updateTask(userId: string, id: number, task: TaskUpdate): Promise<Task> {
  const res = await fetch(`${API_URL}/api/${userId}/tasks/${id}`, {
    method: "PUT",
    headers: await getAuthHeaders(),
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error("Failed to update task");
  return res.json();
}

export async function deleteTask(userId: string, id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/${userId}/tasks/${id}`, {
    method: "DELETE",
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete task");
}

export async function completeTask(userId: string, id: number): Promise<Task> {
  const res = await fetch(`${API_URL}/api/${userId}/tasks/${id}/complete`, {
    method: "PATCH",
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to complete task");
  return res.json();
}
