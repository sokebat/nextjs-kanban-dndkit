"use client";

import { useState, useCallback, useMemo } from "react";
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

import { v4 as uuidv4 } from "uuid";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { AddColumnForm } from "./add-column";
import { Column } from "./column";
import toast from "react-hot-toast";

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

export type Task = {
  id: string;
  content: string;
};

export type ColumnType = {
  id: string;
  title: string;
  tasks: Task[];
};

export default function KanbanBoard() {
  const [columns, setColumns] = useState<ColumnType[]>([
    { id: "todo", title: "To Do", tasks: [] },
    { id: "wip", title: "Work in Progress", tasks: [] },
    { id: "done", title: "Done", tasks: [] },
  ]);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<ColumnType | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);

  // Optimize sensor to reduce unnecessary drag events
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: isTouchDevice() ? 10 : 5, // Increased threshold for touch devices
        delay: isTouchDevice() ? 100 : 0, // Small delay for touch to distinguish from scroll
        tolerance: 5, // Add some tolerance for jittery touches
      },
    })
  );

  // Memoize column IDs to prevent unnecessary re-renders
  const columnIds = useMemo(() => columns.map((col) => col.id), [columns]);

  // Check if column title already exists
  const isColumnTitleDuplicate = useCallback(
    (title: string) => {
      return columns.some(
        (col) => col.title.toLowerCase() === title.toLowerCase()
      );
    },
    [columns]
  );

  // Check if task content already exists in a column
  const isTaskContentDuplicate = useCallback(
    (columnId: string, content: string) => {
      const column = columns.find((col) => col.id === columnId);
      if (!column) return false;

      return column.tasks.some(
        (task) => task.content.toLowerCase() === content.toLowerCase()
      );
    },
    [columns]
  );

  const addColumn = useCallback(
    (title: string) => {
      // Validate column title
      if (title.trim() === "") {
        toast.error("Column title cannot be empty");
        return false;
      }

      // Check for duplicate column title
      if (isColumnTitleDuplicate(title)) {
        toast.error("A column with this title already exists");
        return false;
      }

      const newColumn: ColumnType = {
        id: uuidv4(),
        title,
        tasks: [],
      };
      setColumns((prev) => [...prev, newColumn]);

      toast.success(`Column "${title}" has been added`);
      return true;
    },
    [isColumnTitleDuplicate]
  );

  const addTask = useCallback(
    (columnId: string, content: string) => {
      // Validate task content
      if (content.trim() === "") {
        toast.error("Task content cannot be empty");
        return false;
      }

      // Check for duplicate task content in the same column
      if (isTaskContentDuplicate(columnId, content)) {
        toast.error("A task with this content already exists in this column");
        return false;
      }

      const newTask: Task = {
        id: uuidv4(),
        content,
      };

      setColumns((prev) =>
        prev.map((col) => {
          if (col.id === columnId) {
            return {
              ...col,
              tasks: [...col.tasks, newTask],
            };
          }
          return col;
        })
      );

      toast.success("Task has been added");
      return true;
    },
    [isTaskContentDuplicate]
  );

  const deleteColumn = useCallback(
    (id: string) => {
      const columnToDelete = columns.find((col) => col.id === id);
      if (!columnToDelete) return;

      setColumns((prev) => prev.filter((col) => col.id !== id));

      toast.success(`"${columnToDelete.title}" column has been removed`, {
        icon: "🗑️",
      });
    },
    [columns]
  );

  const deleteTask = useCallback(
    (columnId: string, taskId: string) => {
      const column = columns.find((col) => col.id === columnId);
      if (!column) return;

      const taskToDelete = column.tasks.find((task) => task.id === taskId);
      if (!taskToDelete) return;

      setColumns((prev) =>
        prev.map((col) => {
          if (col.id === columnId) {
            return {
              ...col,
              tasks: col.tasks.filter((task) => task.id !== taskId),
            };
          }
          return col;
        })
      );

      toast.success(`Task has been removed`, {
        icon: "🗑️",
      });
    },
    [columns]
  );

  const onDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const activeId = active.id as string;

      // Handle task drag start
      if (active.data.current?.type === "Task") {
        const task = columns
          .flatMap((col) => col.tasks)
          .find((task) => task.id === activeId);

        if (task) {
          setActiveTask(task);
          setActiveColumnId(active.data.current.columnId);

          // Visual feedback for dragging
          document.body.classList.add("dragging-task");
        }
      }

      // Handle column drag start
      if (active.data.current?.type === "Column") {
        const column = columns.find((col) => col.id === activeId);
        if (column) {
          setActiveColumn(column);

          // Visual feedback for dragging
          document.body.classList.add("dragging-column");
        }
      }
    },
    [columns]
  );

  const onDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;

      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // Only handle task dragging over columns
      if (active.data.current?.type !== "Task") return;

      // Find the source and destination columns
      const activeColumnId = active.data.current.columnId;
      const activeColumnIndex = columns.findIndex(
        (col) => col.id === activeColumnId
      );

      // Find the destination column - could be a column or a task in a column
      const isOverColumn = over.data.current?.type === "Column";
      const overColumnId = isOverColumn ? overId : over.data.current?.columnId;
      const overColumnIndex = columns.findIndex(
        (col) => col.id === overColumnId
      );

      // If no column is found or they're the same, return
      if (
        activeColumnIndex === -1 ||
        overColumnIndex === -1 ||
        activeColumnIndex === overColumnIndex
      )
        return;

      // Check if the task content already exists in the destination column
      if (activeTask) {
        const overColumn = columns[overColumnIndex];
        const isDuplicate = overColumn.tasks.some(
          (task) =>
            task.content.toLowerCase() === activeTask.content.toLowerCase()
        );

        if (isDuplicate) {
          // Provide visual feedback but don't move the task
          toast.error(
            "A task with the same content already exists in the destination column",
            {
              id: "duplicate-task-error",
            }
          );
          return;
        }
      }

      setColumns((prev) => {
        const newColumns = [...prev];

        // Get the active task
        const activeColumn = newColumns[activeColumnIndex];
        const taskIndex = activeColumn.tasks.findIndex(
          (task) => task.id === activeId
        );

        if (taskIndex === -1) return prev;

        // Remove the task from the active column
        const [task] = activeColumn.tasks.splice(taskIndex, 1);

        // Add the task to the over column
        newColumns[overColumnIndex].tasks.push(task);

        return newColumns;
      });
    },
    [columns, activeTask]
  );

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      // Remove visual feedback classes
      document.body.classList.remove("dragging-task", "dragging-column");

      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // Handle column reordering
      if (active.data.current?.type === "Column") {
        const activeIndex = columns.findIndex((col) => col.id === activeId);
        const overIndex = columns.findIndex((col) => col.id === overId);

        if (activeIndex !== overIndex) {
          setColumns(arrayMove(columns, activeIndex, overIndex));

          // Notify about column reordering
          if (activeColumn) {
            toast.success(`"${activeColumn.title}" column has been reordered`, {
              icon: "🔄",
            });
          }
        }
      }

      // Handle task reordering within the same column
      if (
        active.data.current?.type === "Task" &&
        active.data.current?.columnId === over.data.current?.columnId
      ) {
        const columnId = active.data.current.columnId;
        const columnIndex = columns.findIndex((col) => col.id === columnId);

        if (columnIndex === -1) return;

        const column = columns[columnIndex];
        const activeTaskIndex = column.tasks.findIndex(
          (task) => task.id === activeId
        );
        const overTaskIndex = column.tasks.findIndex(
          (task) => task.id === overId
        );

        if (activeTaskIndex !== overTaskIndex) {
          const newColumns = [...columns];
          newColumns[columnIndex].tasks = arrayMove(
            column.tasks,
            activeTaskIndex,
            overTaskIndex
          );
          setColumns(newColumns);
        }
      } else if (
        active.data.current?.type === "Task" &&
        activeTask &&
        activeColumnId
      ) {
        // Notify about task movement between columns
        const sourceColumn = columns.find((col) => col.id === activeColumnId);
        const destColumn = columns.find((col) =>
          col.tasks.some((task) => task.id === activeTask.id)
        );

        if (sourceColumn && destColumn && sourceColumn.id !== destColumn.id) {
          toast.success(
            `Task moved from "${sourceColumn.title}" to "${destColumn.title}"`,
            {
              icon: "📋",
            }
          );
        }
      }

      setActiveTask(null);
      setActiveColumn(null);
      setActiveColumnId(null);
    },
    [columns, activeTask, activeColumn, activeColumnId]
  );

  return (
    <div className="w-full max-w-7xl">
      <div className="mb-6">
        <AddColumnForm onAddColumn={addColumn} />
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        collisionDetection={closestCorners}
        modifiers={[restrictToWindowEdges]}
      >
        <div
          className="flex flex-col md:flex-row gap-4 pb-4 w-full"
          role="region"
          aria-label="Kanban board"
        >
          <SortableContext
            items={columnIds}
            strategy={horizontalListSortingStrategy}
          >
            {columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                deleteColumn={deleteColumn}
                deleteTask={deleteTask}
                addTask={addTask}
                isActive={activeColumn?.id === column.id}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>
    </div>
  );
}
