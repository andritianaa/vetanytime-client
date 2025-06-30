import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { priorityColors, typeColors } from './constants';

import type React from "react";

import type { TaskWithRelations } from "@/types/task";
interface TaskDetailDialogProps {
  task: TaskWithRelations | null;
  onClose: () => void;
}

export const TaskDetailDialog: React.FC<TaskDetailDialogProps> = ({
  task,
  onClose,
}) => {
  if (!task) return null;

  return (
    <Dialog open={!!task} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            <div className="flex items-center gap-2">
              <Badge className={typeColors[task.type]}>{task.type}</Badge>
              <span>{task.title}</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage
                  src={task.client.image}
                  alt={task.client.username}
                />
                <AvatarFallback>
                  {task.client.username.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">
                  {task.client.fullname || task.client.username}
                </div>
                <div className="text-sm text-slate-500">
                  @{task.client.username}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-slate-500">Created on</div>
              <div>{new Date(task.createdAt).toLocaleDateString()}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              Priority:{" "}
              <span
                className={`rounded-full w-2 h-2 ${
                  priorityColors[task.priority]
                }`}
              ></span>{" "}
              {task.priority}
            </Badge>

            <Badge variant="outline">Status: {task.status}</Badge>

            {task.isHidden && <Badge variant="destructive">Hidden</Badge>}
          </div>

          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Description</h4>
            <p className="whitespace-pre-line">{task.description}</p>
          </div>

          {task.attachments.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Attachments</h4>
              <div className="flex flex-wrap gap-2">
                {task.attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-100 p-2 rounded flex items-center gap-1 text-sm hover:bg-slate-200"
                  >
                    <span>{attachment.filename}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {task.isHidden && task.moderator && (
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 text-red-800">Moderation</h4>
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={task.moderator.image}
                    alt={task.moderator.username}
                  />
                  <AvatarFallback>
                    {task.moderator.username.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">
                  Moderated by @{task.moderator.username}
                </span>
              </div>
              <p className="text-sm text-red-700">{task.moderationReason}</p>
            </div>
          )}

          {task.comments.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">
                Comments ({task.comments.length})
              </h4>
              <div className="space-y-3">
                {task.comments.map((comment) => (
                  <div key={comment.id} className="bg-slate-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={comment.client.image}
                          alt={comment.client.username}
                        />
                        <AvatarFallback>
                          {comment.client.username.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">
                        @{comment.client.username}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm pl-8">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
