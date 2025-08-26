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
import { useAuth } from "@clerk/clerk-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export function CreateTask({ defaultProjectId }) {
  const { toast } = useToast();
  const { getToken } = useAuth();

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      status: "design",
      priority: "low",
      assignees: "",
      estimated_hours: 1,
    },
  });

  const onSubmit = async (values: any) => {
    const payload = {
      ...values,
      assignees: values.assignees
        ? values.assignees
            .split(",")
            .map((id: string) => id.trim())
            .filter((id: string) => id !== "")
        : [],
    };

    try {
      // Get the session token for authentication
      const sessionToken = await getToken();
      // Create API instance with auth header
      const api = new TasksApi(
        new Configuration({
          basePath: import.meta.env.VITE_BACKEND_API_KEY,
          accessToken: sessionToken || undefined,
        })
      );
      await api.tasksControllerCreate(defaultProjectId, payload);
      toast({ title: "Task created successfully!" });
      form.reset();
      setTimeout(() => {
        window.location.reload();
      }, 400);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="max-w-lg mx-auto mt-4 p-4">
      <CardHeader>
        <CardTitle>Create a New Task</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 max-h-80 p-2 overflow-y-auto"
            style={{ maxHeight: 320, overflowY: "auto" }} // fallback for non-tailwind
          >
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

            {/* Assignees (comma separated, optional) */}
            <FormField
              name="assignees"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignees</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. user1,user2 (optional)"
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

            <Button variant="default" type="submit" className="w-[100%] bg-slate-800 hover:bg-slate-600">Create Task</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}