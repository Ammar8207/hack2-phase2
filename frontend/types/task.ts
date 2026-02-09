export interface Task {
  id: number;
  user_id: string;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
  priority?: "high" | "medium" | "low";
  due_date?: string;
}

export interface TaskCreate {
  title: string;
  description: string;
  priority?: "high" | "medium" | "low";
  due_date?: string;
}

export interface TaskUpdate {
  title: string;
  description: string;
  completed: boolean;
  priority?: "high" | "medium" | "low";
  due_date?: string;
}
