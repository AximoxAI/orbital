import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Home,
  Bell,
  Inbox,
  CheckSquare,
  Calendar,
  FileText,
  Users,
  Plus,
  Filter,
  MoreHorizontal,
  EllipsisVertical,
} from "lucide-react";
import { useState, useEffect } from "react";
import TaskChat from "@/components/taskChatComponents/TaskChat";
import { useClerk, useUser, useAuth } from "@clerk/clerk-react";
import { Configuration, ProjectsApi, TasksApi } from "@/api-client";
import CreateProject from "@/components/apiComponents/CreateProject";
import GenerateRequirements from "@/components/apiComponents/GenerateRequirements";
import { CreateTask } from "@/components/apiComponents/CreateTask";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/Topbar";

// Dummy fallback for missing avatars
const getInitials = (name: string) => {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const getProgressColor = (progress: number): string => {
  return 'text-green-300';
};

function ProjectsList({
  projects,
  loading,
  error,
  onTaskClick,
  onGenerateRequirements,
  onShowCreateTaskModal,
}: any) {
  if (loading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center text-red-500">
        <p className="text-lg">Error fetching projects: <strong>{error.message}</strong>. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      {projects.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          <p>No projects found. Start by creating a new project!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: any) => (
            <Card key={project.id} className="h-fit">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <CardTitle className="text-sm font-medium">{project.name}</CardTitle>
                  </div>
                  <div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <EllipsisVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onShowCreateTaskModal(project.id)}
                        >
                           New task
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onGenerateRequirements(project.id)}
                        >
                          Generate Tasks
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <span>{project.type}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 mb-4 overflow-x-auto pb-2">
                  <Badge variant="secondary" className="text-xs cursor-pointer">DESIGN</Badge>
                  <Badge variant="secondary" className="text-xs cursor-pointer">IN REVIEW</Badge>
                  <Badge variant="secondary" className="text-xs cursor-pointer">TO-DO</Badge>
                  <Badge variant="secondary" className="text-xs cursor-pointer">COMPLETED</Badge>
                  <Button variant="ghost" size="sm" className="flex-shrink-0">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
                {project.tasks && project.tasks.length > 0 ? (
                  project.tasks.map((task: any) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-2 cursor-pointer"
                      onClick={() => onTaskClick(task.id, task.title)}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                        <span className="text-sm text-gray-700">{task.title}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-medium ${getProgressColor(task.progress)}`}>
                          {task.progress}%
                        </span>
                        <div className="flex -space-x-1">
                          {task.assignees && task.assignees.length > 0 ? (
                            task.assignees.map((assignee: any, avatarIndex: number) => (
                              <Avatar key={assignee.id || avatarIndex} className="w-6 h-6 border-2 border-white">
                                {assignee.avatar ? (
                                  <AvatarImage src={assignee.avatar} alt={assignee.name || "User"} />
                                ) : (
                                  <AvatarFallback className="text-xs bg-blue-500 text-white">
                                    {getInitials(assignee.name)}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                            ))
                          ) : (
                            <Avatar className="w-6 h-6 border-2 border-white">
                              <AvatarFallback className="text-xs bg-gray-300 text-white">?</AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center">No tasks for this project yet.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Main ProjectBoard Component ---
const ProjectBoard = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<{ id: string, title: string } | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showRequirementsModal, setShowRequirementsModal] = useState(false);
  const [requirementsProjectId, setRequirementsProjectId] = useState("");
  const [createTaskProjectId, setCreateTaskProjectId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjectsAndTasks = async () => {
      setLoading(true);
      try {
        // Get the auth token from Clerk
        const sessionToken = await getToken();
        // Create configuration with auth header
        const configuration = new Configuration({
          basePath: import.meta.env.VITE_BACKEND_API_KEY,
          accessToken: sessionToken || undefined,
        });

        const projectsApi = new ProjectsApi(configuration);
        const tasksApi = new TasksApi(configuration);
        const response: any = await projectsApi.projectsControllerFindAll();
        const projectsData = response.data || response;

        // Gather all task IDs
        const allTaskIds: string[] = [];
        projectsData.forEach((project: any) => {
          if (Array.isArray(project.tasks)) {
            project.tasks.forEach((task: any) => {
              if (typeof task === "string") {
                allTaskIds.push(task);
              } else if (task && task.id) {
                allTaskIds.push(task.id);
              }
            });
          }
        });

        // Fetch task data for each task ID (in parallel)
        const taskFetches: Promise<any>[] = allTaskIds.map((taskId) =>
          tasksApi.tasksControllerFindOne(taskId).then(res => res.data || res).catch(() => null)
        );
        const allTasksData: any[] = await Promise.all(taskFetches);

        // Build a map for quick lookup
        const taskDataMap: Record<string, any> = {};
        allTasksData.forEach(task => {
          if (task && task.id) {
            taskDataMap[task.id] = task;
          }
        });

        // Replace project.tasks with the actual tasks fetched (with assignees as objects)
        const projectsWithTasks = projectsData.map((project: any) => ({
          ...project,
          tasks: Array.isArray(project.tasks)
            ? project.tasks
                .map((task: any) => {
                  let taskId = typeof task === "string" ? task : (task && task.id ? task.id : null);
                  if (!taskId) return null;
                  const realTask = taskDataMap[taskId];
                  if (!realTask) return null;
                  // Ensure assignees is always an array of objects
                  return {
                    ...realTask,
                    assignees: Array.isArray(realTask.assignees)
                      ? realTask.assignees
                      : [],
                  };
                }).filter(Boolean)
            : [],
        }));

        setProjects(projectsWithTasks);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectsAndTasks();
  }, [getToken]);

  const handleCreateTask = (taskName: string, projectName: string) => {
    setProjects(prevProjects => {
      const updatedProjects = prevProjects.map(project => {
        if (project.name.includes(projectName)) {
          const newTask = {
            id: `task-${Date.now()}-${Math.random()}`,
            project_id: project.id,
            title: taskName,
            description: "",
            status: "design",
            priority: "medium",
            progress: 0,
            estimated_hours: null,
            due_date: null,
            ai_generated: false,
            ai_confidence: null,
            assignees: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          return {
            ...project,
            tasks: [...project.tasks, newTask]
          };
        }
        return project;
      });
      return updatedProjects;
    });
  };

  const handleShowCreateTaskModal = (projectId: string) => {
    setCreateTaskProjectId(projectId);
    setShowCreateTaskModal(true);
  };

  const handleShowRequirementsModal = (projectId: string) => {
    setRequirementsProjectId(projectId);
    setShowRequirementsModal(true);
  };

  // Callback for successfully creating a project
  const handleProjectCreated = () => {
    setShowCreateProjectModal(false);
    // Reload handled in CreateProject, but you could also reload here if needed
    // window.location.reload();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <TaskChat
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        taskName={selectedTask?.title ?? ""}
        taskId={selectedTask?.id ?? ""}
        onCreateTask={handleCreateTask}
      />

      <Sidebar />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${chatOpen ? '' : ''}`}>
        <TopBar
          searchValue={search}
          setSearchValue={setSearch}
          placeholder="Search"
          showLogout={true}
        />
        <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-white bg-opacity-20 rounded flex items-center justify-center">
                <span className="text-xs">⚡</span>
              </div>
              <span className="text-sm">
                <strong>Boost Your Productivity with Pro!</strong> - Unlock advanced features and supercharge your workflow for only $12/month.
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white hover:bg-opacity-20">
                Hide
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white hover:bg-opacity-20">
                Upgrade
              </Button>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-white border-b border-gray-200">
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setShowCreateProjectModal(true)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Create new project</p>
                  <p className="text-xs text-gray-500">New project in your space</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setChatOpen(true);
                setSelectedTask({ id: "folder", title: "Create new folder" });
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Create new folder</p>
                  <p className="text-xs text-gray-500">New folder in your project</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setChatOpen(true);
                setSelectedTask({ id: "doc", title: "Create new doc" });
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Create new doc</p>
                  <p className="text-xs text-gray-500">New docs in your folder</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
        <ProjectsList
          projects={projects}
          loading={loading}
          error={error}
          onTaskClick={(taskId: string, taskTitle: string) => {
            setSelectedTask({ id: taskId, title: taskTitle });
            setChatOpen(true);
          }}
          onGenerateRequirements={handleShowRequirementsModal}
          onShowCreateTaskModal={handleShowCreateTaskModal}
        />
        {showCreateProjectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 relative max-w-lg w-full">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
                onClick={() => setShowCreateProjectModal(false)}
              >
                ×
              </button>
              <CreateProject onSuccess={handleProjectCreated}/>
            </div>
          </div>
        )}
        {showCreateTaskModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 relative max-w-lg w-full">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
                onClick={() => setShowCreateTaskModal(false)}
              >
                ×
              </button>
              <CreateTask defaultProjectId={createTaskProjectId}/>
            </div>
          </div>
        )}
        {showRequirementsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 relative max-w-xl w-full">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
                onClick={() => setShowRequirementsModal(false)}
              >
                ×
              </button>
              <GenerateRequirements defaultProjectId={requirementsProjectId} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectBoard;