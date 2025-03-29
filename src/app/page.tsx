import KanbanBoard from "@/components/kanban-board";
import React from "react";

const page = () => {
  return (
    <div className="flex justify-center items-center h-screen max-w-7xl mx-auto overflow-x-auto">
      <KanbanBoard />
    </div>
  );
};

export default page;
