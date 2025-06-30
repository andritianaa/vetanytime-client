"use client";
import { Paperclip } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { createTask } from '@/actions/task.actions';
import { ClientTaskList } from '@/components/task/client-task-list';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CreateTaskDto } from '@/types/task';
import { TaskPriority, TaskType } from '@prisma/client';

export type TaskFormProps = {
  children: ReactNode;
};

export function TaskForm(props: TaskFormProps) {
  const { control, handleSubmit, reset, watch } = useForm<CreateTaskDto>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTab, setSelectedTab] = useState("submit");
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const watchedType = watch("type");

  const onSubmit = async (data: CreateTaskDto) => {
    setIsSubmitting(true);
    try {
      let priority: TaskPriority = TaskPriority.LOW;
      if (data.type == TaskType.BUG) {
        priority = TaskPriority.CRITICAL;
      } else if (data.type == TaskType.SUGGESTION) {
        priority = TaskPriority.MEDIUM;
      }
      await createTask(data.type, data.title, data.description, priority, true);

      // Handle file uploads if applicable
      if (files.length > 0) {
        // Implement file upload logic here
        console.log("Files to upload:", files);
      }

      toast({
        title: "Task submitted",
        description: "Thank you for your task! We'll review it shortly.",
      });
      reset();
      setFiles([]);
      setSelectedTab("list");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit task. Please try again.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  // Suggestion helper for different task types
  const getPlaceholderByType = () => {
    switch (watchedType) {
      case TaskType.BUG:
        return "Please describe what happened, what you expected to happen, and steps to reproduce...";
      case TaskType.SUGGESTION:
        return "Please describe your idea and how it would improve your experience...";
      case TaskType.FEEDBACK:
        return "Tell us what you enjoyed or found particularly useful. Your feedback, whether positive or negative, helps us improve!";
      default:
        return "Please provide detailed information...";
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Task</DialogTitle>
          <DialogDescription>
            Nous valorisons vos retours pour nous améliorer et pour corriger ce
            qui ne va pas pour vous !
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="submit">Submit Task</TabsTrigger>
            <TabsTrigger value="list">Your Task</TabsTrigger>
          </TabsList>

          <TabsContent value="submit" className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="type"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value={TaskType.BUG}>Bug</SelectItem>
                          <SelectItem value={TaskType.SUGGESTION}>
                            Suggestion
                          </SelectItem>
                          <SelectItem value={TaskType.FEEDBACK}>
                            Feedback
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() =>
                      document.getElementById("file-upload")?.click()
                    }
                  >
                    <Paperclip size={16} />
                    Attach Files
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {files.length > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {files.length} file(s) selected
                    </span>
                  )}
                </div>
              </div>

              <Controller
                name="title"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Input {...field} placeholder="Title" required />
                )}
              />

              <Controller
                name="description"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder={getPlaceholderByType()}
                    required
                    className="min-h-32"
                  />
                )}
              />

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Submitting..." : "Submit Task"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="list">
            <ClientTaskList />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
