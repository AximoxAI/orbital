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
import { Loader2, CheckCircle2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function CreateTask({ defaultProjectId }: { defaultProjectId: string | null }) {
  const { toast } = useToast();
  const { getToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      status: "design",
      priority: "medium",
      assignees: "",
      estimated_hours: 1,
    },
  });

  const onSubmit = async (values: any) => {
    setIsSubmitting(true);
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
      const sessionToken = await getToken();
      const api = new TasksApi(
        new Configuration({
          basePath: import.meta.env.VITE_BACKEND_API_KEY,
          accessToken: sessionToken || undefined,
        })
      );
      await api.tasksControllerCreate(defaultProjectId, payload);
      
      toast({ 
        title: "Success!",
        description: "Task created successfully",
      });
      
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border bg-muted/30">
        <h2 className="text-xl font-semibold text-foreground">Create New Task</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Add a new task to your project and assign team members
        </p>
      </div>

      {/* Form Content */}
      <ScrollArea className="h-[450px]">
        <div className="px-6 py-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Title */}
              <FormField
                name="title"
                control={form.control}
                rules={{ required: "Title is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Task Title <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="e.g. Design landing page mockup" 
                        className="h-10"
                      />
                    </FormControl>
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
                    <FormLabel className="text-sm font-medium">Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Provide additional details about this task..."
                        className="min-h-[100px] resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status and Priority Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status */}
                <FormField
                  name="status"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Status</FormLabel>
                      <Select defaultValue={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="design">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-purple-500" />
                              Design
                            </div>
                          </SelectItem>
                          <SelectItem value="to_do">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500" />
                              To-Do
                            </div>
                          </SelectItem>
                          <SelectItem value="in_review">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-amber-500" />
                              In Review
                            </div>
                          </SelectItem>
                          <SelectItem value="completed">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500" />
                              Completed
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Priority */}
                <FormField
                  name="priority"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Priority</FormLabel>
                      <Select defaultValue={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-slate-400" />
                              Low
                            </div>
                          </SelectItem>
                          <SelectItem value="medium">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-yellow-500" />
                              Medium
                            </div>
                          </SelectItem>
                          <SelectItem value="high">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-500" />
                              High
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Estimated Hours and Assignees Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Estimated Hours */}
                <FormField
                  name="estimated_hours"
                  control={form.control}
                  rules={{ required: "Estimated hours required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Estimated Hours <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={999}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="h-10"
                          placeholder="e.g. 8"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Assignees */}
                <FormField
                  name="assignees"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Assignees
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="user1, user2"
                          className="h-10"
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        Comma-separated user IDs (optional)
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

            </form>
          </Form>
        </div>
      </ScrollArea>

      {/* Footer with Actions */}
      <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-end gap-3">
        <Button 
          variant="outline" 
          type="button"
          onClick={() => form.reset()}
          disabled={isSubmitting}
        >
          Reset
        </Button>
        <Button 
          type="submit"
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="min-w-[120px] bg-slate-800"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Create Task
            </>
          )}
        </Button>
      </div>
    </div>
  );
}