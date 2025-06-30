import type { TaskWithRelations } from "@/types/task";
import { Draggable, Droppable } from '@hello-pangea/dnd';

import { TaskCard } from './task-card';

import type React from "react";
interface KanbanColumnProps {
  status: string;
  label: string;
  tasks: TaskWithRelations[];
  onTaskClick: (task: TaskWithRelations) => void;
  dragHandleProps?: any;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  label,
  tasks,
  onTaskClick,
  dragHandleProps,
}) => {
  return (
    <div className="flex flex-col h-full w-96">
      <div
        className="flex items-center justify-between px-4 py-3 bg-sidebar  border mb-2 border-border ounded-t-lg cursor-move rounded"
        {...dragHandleProps}
      >
        <h2 className="text-lg font-semibold text-sidebar-foreground">
          {label}
        </h2>
        <span className="inline-flex items-center justify-center w-6 h-6 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-full">
          {tasks.length}
        </span>
      </div>
      <Droppable droppableId={status}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex-1 bg-sidebar rounded p-2 min-h-[500px]"
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="mb-2"
                  >
                    <TaskCard task={task} onClick={() => onTaskClick(task)} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};
