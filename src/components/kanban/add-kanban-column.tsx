import { Plus } from 'lucide-react';

export const AddKanbanColumn = () => {
  return (
    <div className="flex flex-col h-full min-w-80">
      <div className="flex items-center justify-between px-4 py-3 bg-sidebar  border mb-2 border-border ounded-t-lg cursor-move rounded">
        <h2 className="text-lg font-semibold text-sidebar-foreground">
          Add a new column
        </h2>
        <Plus size={24} className="cursor-pointer" />
      </div>

      <div className="flex-1 bg-sidebar rounded p-2 min-h-[500px]"></div>
    </div>
  );
};
