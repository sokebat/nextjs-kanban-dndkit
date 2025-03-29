"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ColumnType } from "./kanban-board";
import { TaskItem } from "./task-item";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { AddTaskForm } from "./add-task";
import { Trash2, GripVertical } from "lucide-react";
import { memo, useMemo } from "react";

interface ColumnProps {
  column: ColumnType;
  deleteColumn: (id: string) => void;
  deleteTask: (columnId: string, taskId: string) => void;
  addTask: (columnId: string, content: string) => boolean;
  isActive?: boolean;
}

export const Column = memo(function Column({
  column,
  deleteColumn,
  deleteTask,
  addTask,
  isActive = false,
}: ColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  // Memoize task IDs to prevent unnecessary re-renders
  const taskIds = useMemo(
    () => column.tasks.map((task) => task.id),
    [column.tasks]
  );

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
      className={`flex flex-col bg-zinc-50 rounded-lg shadow-md w-full md:w-80 min-h-[300px] md:min-h-[500px] max-h-[500px] md:max-h-[80vh] mb-4 md:mb-0 border border-zinc-200 ${
        isActive ? "ring-2 ring-purple-500" : ""
      }`}
      aria-label={`${column.title} column with ${column.tasks.length} tasks`}
    >
      <div className="bg-purple-600 p-3 font-bold text-white rounded-t-lg flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing touch-manipulation p-1 hover:bg-purple-500 rounded"
            aria-label="Drag to reorder column"
          >
            <GripVertical size={18} />
          </div>
          <h2 className="text-base sm:text-lg">{column.title}</h2>
        </div>
        <button
          onClick={() => deleteColumn(column.id)}
          className="text-white hover:text-red-300 transition-colors p-1 hover:bg-purple-500 rounded"
          aria-label={`Delete ${column.title} column`}
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="flex-1 p-2 sm:p-3 overflow-y-auto bg-zinc-50">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {column.tasks.length > 0 ? (
            column.tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                columnId={column.id}
                deleteTask={deleteTask}
              />
            ))
          ) : (
            <div className="text-center py-8 text-zinc-400 italic text-sm sm:text-base">
              No tasks yet. Add one below.
            </div>
          )}
        </SortableContext>
      </div>

      <div className="p-2 sm:p-3 border-t border-zinc-200 bg-zinc-100 rounded-b-lg">
        <AddTaskForm columnId={column.id} onAddTask={addTask} />
      </div>
    </div>
  );
});
