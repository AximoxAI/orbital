import React from "react";
import { useForm } from "react-hook-form";
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { TasksApi, Configuration } from "@/api-client";

const api = new TasksApi(new Configuration({ basePath: "http://localhost:3000" }));

export function CreateTask() {
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      projectId: "",
      title: "",
      description: "",
      status: "design",
      priority: "low",
      assignees: "",
      estimated_hours: 1,
    },
  });

  const onSubmit = async (values: any) => {
    if (!values.projectId) {
      toast({
        title: "Project ID is required",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      ...values,
      assignees: values.assignees
        .split(",")
        .map((id: string) => id.trim())
        .filter((id: string) => id !== ""),
    };

    try {
      await api.tasksControllerCreate(values.projectId, payload);
      toast({ title: "Task created successfully!" });
      form.reset();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 h-[450px] overflow-y-scroll max-w-xl">

        {/* Project ID */}
        <FormField
          name="projectId"
          control={form.control}
          rules={{ required: "Project ID is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project ID</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter project ID" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Title */}
        <FormField
          name="title"
          control={form.control}
          rules={{ required: "Title is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl><Input {...field} placeholder="Task title" /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Optional description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status */}
        <FormField
          name="status"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <Select defaultValue={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />
        
        {/* Priority */}
        <FormField
          name="priority"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <FormControl>
                <Select defaultValue={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />

        {/* Assignees (comma separated) */}
        <FormField
          name="assignees"
          control={form.control}
          rules={{ required: "Please enter at least one assignee ID" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assignees</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g. user1,user2"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Estimated Hours */}
        <FormField
          name="estimated_hours"
          control={form.control}
          rules={{ required: "Estimated hours required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Hours</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Create Task</Button>
      </form>
    </Form>
  );
}
