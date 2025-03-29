"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "./kanban-board";
import { Trash2, GripVertical } from "lucide-react";
import { memo, useState } from "react";

interface TaskItemProps {
  task: Task;
  columnId: string;
  deleteTask: (columnId: string, taskId: string) => void;
}

export const TaskItem = memo(function TaskItem({
  task,
  columnId,
  deleteTask,
}: TaskItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
      columnId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white p-2 sm:p-3 mb-2 rounded-md shadow-sm border border-zinc-200 flex justify-between items-start group hover:border-purple-300 hover:shadow-md transition-all touch-manipulation ${
        isDragging ? "ring-2 ring-purple-500" : ""
      }`}
      aria-roledescription="Draggable task"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-2 w-full">
        <div
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing text-zinc-400 hover:text-purple-500 touch-manipulation p-1"
          aria-label="Drag to reorder task"
        >
          <GripVertical size={16} />
        </div>
        <p className="text-zinc-800 flex-1 text-sm sm:text-base">
          {task.content}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteTask(columnId, task.id);
          }}
          className={`text-zinc-400 hover:text-red-500 transition-colors p-1 ${
            isHovered ? "opacity-100" : "sm:opacity-0 opacity-100"
          } sm:group-hover:opacity-100`}
          aria-label="Delete task"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
});
