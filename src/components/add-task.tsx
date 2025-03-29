"use client";

import type React from "react";
import { useState, memo } from "react";
import { Plus, X } from "lucide-react";

interface AddTaskFormProps {
  columnId: string;
  onAddTask: (columnId: string, content: string) => boolean;
}

export const AddTaskForm = memo(function AddTaskForm({
  columnId,
  onAddTask,
}: AddTaskFormProps) {
  const [content, setContent] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (content.trim() === "") {
      setError("Task content cannot be empty");
      return;
    }

    const success = onAddTask(columnId, content);
    if (success) {
      setContent("");
      setIsFormVisible(false);
    }
  };

  return (
    <div>
      {isFormVisible ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div>
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setError("");
              }}
              placeholder="Enter task content"
              className={`w-full p-2 border ${
                error ? "border-red-500" : "border-zinc-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm sm:text-base bg-white`}
              rows={3}
              autoFocus
              aria-label="New task content"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700 transition-colors text-sm flex-1 sm:flex-none"
              aria-label="Add task"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setIsFormVisible(false);
                setError("");
                setContent("");
              }}
              className="text-zinc-500 hover:text-zinc-700 transition-colors p-1 hover:bg-zinc-200 rounded-md"
              aria-label="Cancel"
            >
              <X size={16} />
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsFormVisible(true)}
          className="flex items-center gap-1 text-purple-700 hover:text-purple-900 transition-colors text-sm w-full justify-center sm:justify-start hover:bg-zinc-200 p-2 rounded-md"
          aria-label="Add new task"
        >
          <Plus size={16} />
          Add Task
        </button>
      )}
    </div>
  );
});
