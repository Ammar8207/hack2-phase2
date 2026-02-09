"use client";

import { useState } from "react";
import { Task } from "@/types/task";
import { completeTask, deleteTask } from "@/lib/api";

interface TaskItemProps {
  task: Task;
  userId: string;
  onUpdate: () => void;
  onEdit: (task: Task) => void;
}

const priorityColors = {
  high: "bg-red-500 text-white",
  medium: "bg-amber-400 text-gray-900",
  low: "bg-green-500 text-white",
};

export default function TaskItem({ task, userId, onUpdate, onEdit }: TaskItemProps) {
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    try {
      await completeTask(userId, task.id);
      onUpdate();
    } catch (error) {
      alert("Failed to complete task");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this task?")) return;
    setLoading(true);
    try {
      await deleteTask(userId, task.id);
      onUpdate();
    } catch (error) {
      alert("Failed to delete task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 ${task.completed ? "opacity-70" : ""} transform hover:-translate-y-1`}>
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.completed ? "bg-green-500 border-green-500" : "border-gray-300 group-hover:border-indigo-400"}`}>
              {task.completed && <span className="text-white text-sm">✓</span>}
            </div>
            <h3 className={`text-lg font-semibold ${task.completed ? "line-through text-gray-400" : "text-gray-800"}`}>
              {task.title}
            </h3>
            {task.priority && (
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${priorityColors[task.priority]}`}>
                {task.priority.toUpperCase()}
              </span>
            )}
          </div>
          {task.description && (
            <p className={`text-sm ml-9 mb-3 ${task.completed ? "line-through text-gray-400" : "text-gray-600"}`}>
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-4 ml-9 text-xs text-gray-500">
            {task.due_date && (
              <span className="flex items-center gap-1">
                📅 {new Date(task.due_date).toLocaleDateString()}
              </span>
            )}
            <span className="flex items-center gap-1">
              🕐 {new Date(task.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {!task.completed && (
            <button
              onClick={handleComplete}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 cursor-pointer"
              title="Complete"
            >
              ✓ Done
            </button>
          )}
          <button
            onClick={() => onEdit(task)}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 cursor-pointer"
            title="Edit"
          >
            ✎ Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 cursor-pointer"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
