"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/simple-auth";
import { Task } from "@/types/task";
import { getTasks } from "@/lib/api";
import TaskItem from "@/components/TaskItem";
import TaskForm from "@/components/TaskForm";
import AuthForm from "@/components/AuthForm";
import ChatBot from "@/components/ChatBot";

export default function Home() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState<Task | undefined>();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const loadTasks = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await getTasks(user.id);
      setTasks(data);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadTasks();
    }
  }, [user]);

  const handleSuccess = () => {
    setShowForm(false);
    setEditTask(undefined);
    loadTasks();
  };

  const handleEdit = (task: Task) => {
    setEditTask(task);
    setShowForm(true);
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600 text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-gray-100 to-amber-100 flex items-center justify-center p-4">
        <AuthForm />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-indigo-100">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  My Tasks
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-600">Welcome back,</span>
                  <span className="text-sm font-semibold text-indigo-600">{user.name}</span>
                  <span className="text-sm">👋</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  setEditTask(undefined);
                }}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
              >
                {showForm ? "✕ Cancel" : "✨ New Task"}
              </button>
              <button
                onClick={signOut}
                className="px-6 py-3 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg border border-gray-200 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Task Form */}
        {showForm && (
          <div className="mb-8 animate-fadeIn">
            <TaskForm
              userId={user.id}
              task={editTask}
              onSuccess={handleSuccess}
              onCancel={() => {
                setShowForm(false);
                setEditTask(undefined);
              }}
            />
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-6 py-3 rounded-xl font-medium transition-all cursor-pointer transform hover:scale-105 ${
              filter === "all"
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50 shadow-md border border-gray-200"
            }`}
          >
            All <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-sm">{tasks.length}</span>
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-6 py-3 rounded-xl font-medium transition-all cursor-pointer transform hover:scale-105 ${
              filter === "active"
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50 shadow-md border border-gray-200"
            }`}
          >
            Active <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-sm">{tasks.filter((t) => !t.completed).length}</span>
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-6 py-3 rounded-xl font-medium transition-all cursor-pointer transform hover:scale-105 ${
              filter === "completed"
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50 shadow-md border border-gray-200"
            }`}
          >
            Completed <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-sm">{tasks.filter((t) => t.completed).length}</span>
          </button>
        </div>

        {/* Task List */}
        {loading ? (
          <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"></div>
            <p className="text-gray-600 mt-4 font-medium">Loading your tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-20 bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100">
            <div className="text-7xl mb-4 animate-bounce">📝</div>
            <p className="text-gray-700 text-2xl font-semibold mb-2">No tasks found</p>
            <p className="text-gray-500 text-base">
              {filter !== "all" ? "Try changing the filter above" : "Click '✨ New Task' to get started"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task, index) => (
              <div key={task.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-fadeIn">
                <TaskItem
                  task={task}
                  userId={user.id}
                  onUpdate={loadTasks}
                  onEdit={handleEdit}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* AI Chatbot */}
      <ChatBot userId={user.id} />
    </div>
  );
}
