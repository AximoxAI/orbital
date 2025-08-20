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
  Search,
  Filter,
  MoreHorizontal,
  EllipsisVertical,
} from "lucide-react";
import { useState, useEffect } from "react";
import TaskChat from "@/components/taskChatComponents/TaskChat";
import { useClerk, useUser, useAuth } from "@clerk/clerk-react";
import { Configuration, ProjectsApi } from "@/api-client";
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

const avatarMap: { [key: string]: string } = {
  'JS': 'https://avatars.githubusercontent.com/u/1?v=4',
  'AW': 'https://avatars.githubusercontent.com/u/2?v=4',
  'SM': 'https://avatars.githubusercontent.com/u/3?v=4',
  'JD': "https://randomuser.me/api/portraits/men/11.jpg",
  'AL': "https://randomuser.me/api/portraits/men/13.jpg",
  'BK': "https://randomuser.me/api/portraits/women/14.jpg",
  'CL': "https://randomuser.me/api/portraits/men/15.jpg",
  'DM': "https://randomuser.me/api/portraits/women/16.jpg",
  'EF': "https://randomuser.me/api/portraits/men/17.jpg",
  'GH': "https://randomuser.me/api/portraits/women/18.jpg",
  'IJ': "https://randomuser.me/api/portraits/men/19.jpg",
  'KL': "https://randomuser.me/api/portraits/women/20.jpg",
  'MN': "https://randomuser.me/api/portraits/men/21.jpg",
  'OP': "https://randomuser.me/api/portraits/women/22.jpg",
  'QR': "https://randomuser.me/api/portraits/men/23.jpg",
  'ST': "https://randomuser.me/api/portraits/women/24.jpg",
  'UV': "https://randomuser.me/api/portraits/men/25.jpg",
  'WX': "https://randomuser.me/api/portraits/women/26.jpg",
  'YZ': "https://randomuser.me/api/portraits/men/27.jpg",
  'AB': "https://randomuser.me/api/portraits/women/28.jpg",
  'CD': "https://randomuser.me/api/portraits/men/29.jpg",
  'MB': "https://randomuser.me/api/portraits/men/30.jpg",
  'AI': "https://randomuser.me/api/portraits/women/31.jpg",
};

const getProgressColor = (progress: number): string => {
  return 'text-green-300';
};

function ProjectsList({
  projects,
  loading,
  error,
  onTaskClick,
  avatarMap,
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
                          Create new task
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onGenerateRequirements(project.id)}
                        >
                          Generate Requirements
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
                          {task.avatars && task.avatars.map((avatar: any, avatarIndex: number) => (
                            <Avatar key={avatarIndex} className="w-6 h-6 border-2 border-white">
                              <AvatarImage src={avatarMap[avatar]} alt={avatar} />
                              <AvatarFallback className="text-xs bg-blue-500 text-white">
                                {avatar}
                              </AvatarFallback>
                            </Avatar>
                          ))}
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

  const { user } = useUser();
  const { signOut } = useClerk();
  const { getToken } = useAuth(); // Add this hook
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Get the auth token from Clerk
        const sessionToken = await getToken();
        // Create configuration with auth header
        const configuration = new Configuration({
          basePath: import.meta.env.VITE_BACKEND_API_KEY,
          accessToken: sessionToken || undefined, // Pass the token
        });

        const projectsApi = new ProjectsApi(configuration);
        const response: any = await projectsApi.projectsControllerFindAll();
        const projectsData = response.data || response;
        const projectsWithAvatars = projectsData.map((project: any) => ({
          ...project,
          tasks: project.tasks.map((task: any) => ({
            ...task,
            avatars: task.avatars && task.avatars.length > 0 ? task.avatars : ['JS', 'AW'],
          }))
        }));
        setProjects(projectsWithAvatars);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [getToken]); // Add getToken to dependencies

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
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            avatars: ["MB", "AI"]
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

  // Handler for maximizing chat (navigating to fullscreen)
  const handleMaximizeChat = (taskId: string, taskTitle: string) => {
    navigate(`/tasks/${taskId}`, { state: { taskName: taskTitle } });
  };

  // Callback for successfully creating a project
  const handleProjectCreated = () => {
    setShowCreateProjectModal(false);
    // Reload handled in CreateProject, but you could also reload here if needed
    // window.location.reload();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Side-panel TaskChat (not fullscreen, just a panel) */}
      <TaskChat
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        taskName={selectedTask?.title ?? ""}
        taskId={selectedTask?.id ?? ""}
        onCreateTask={handleCreateTask}
        // You may want to pass handleMaximizeChat to TaskChat,
        // or you can add maximize button logic inside TaskChat itself.
      />

      <div className={`w-64 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 overflow-y-scroll`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">O</span>
            </div>
            <span className="font-semibold text-gray-800">Orbital</span>
          </div>
        </div>
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <a href="#" className="flex items-center space-x-3 text-gray-700 hover:bg-gray-100 rounded-lg p-2">
              <Home className="w-5 h-5" />
              <span>Home</span>
            </a>
            <a href="#" className="flex items-center space-x-3 text-gray-700 hover:bg-gray-100 rounded-lg p-2">
              <Bell className="w-5 h-5" />
              <span>Updates</span>
            </a>
            <a href="#" className="flex items-center space-x-3 text-gray-700 hover:bg-gray-100 rounded-lg p-2">
              <Inbox className="w-5 h-5" />
              <span>Inbox</span>
            </a>
            <a href="#" className="flex items-center space-x-3 text-gray-700 hover:bg-gray-100 rounded-lg p-2">
              <CheckSquare className="w-5 h-5" />
              <span>Your tasks</span>
            </a>
          </div>
          <div className="mt-8">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">WORKSPACE</h3>
            <div className="space-y-2">
              <a href="#" className="flex items-center space-x-3 text-gray-900 bg-gray-100 rounded-lg p-2 font-medium">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Project board</span>
              </a>
              <a href="#" className="flex items-center space-x-3 text-gray-700 hover:bg-gray-100 rounded-lg p-2">
                <Calendar className="w-5 h-5" />
                <span>Upcoming</span>
              </a>
              <a href="#" className="flex items-center space-x-3 text-gray-700 hover:bg-gray-100 rounded-lg p-2">
                <FileText className="w-5 h-5" />
                <span>Templates</span>
              </a>
              <a href="#" className="flex items-center space-x-3 text-gray-700 hover:bg-gray-100 rounded-lg p-2">
                <FileText className="w-5 h-5" />
                <span>Views</span>
              </a>
              <a href="#" className="flex items-center space-x-3 text-gray-700 hover:bg-gray-100 rounded-lg p-2">
                <Users className="w-5 h-5" />
                <span>Teams</span>
              </a>
            </div>
          </div>
          <div className="mt-8">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">SPACES</h3>
            <div className="space-y-2">
              <a href="#" className="flex items-center space-x-3 text-gray-700 hover:bg-gray-100 rounded-lg p-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Paper.so</span>
              </a>
              <a href="#" className="flex items-center space-x-3 text-gray-700 hover:bg-gray-100 rounded-lg p-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>GoodWriter™</span>
              </a>
              <a href="#" className="flex items-center space-x-3 text-gray-700 hover:bg-gray-100 rounded-lg p-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Thoughts™</span>
              </a>
              <button className="flex items-center space-x-3 text-gray-500 hover:bg-gray-100 rounded-lg p-2 w-full">
                <Plus className="w-4 h-4" />
                <span>Add new space</span>
              </button>
            </div>
          </div>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src="https://randomuser.me/api/portraits/men/40.jpg" alt="Louis Nguyen" />
              <AvatarFallback className="bg-orange-500 text-white">LN</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{user?.username || "Unknown User"}</p>
            </div>
          </div>
        </div>
      </div>
      <div className={`flex-1 flex flex-col transition-all duration-300 ${chatOpen ? '' : ''}`}>
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                signOut();
              }}
            >
              Log out
            </Button>
          </div>
        </header>
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
            // For maximizing to fullscreen, you could call handleMaximizeChat(taskId, taskTitle) here if desired
            // Or provide a maximize button in TaskChat that calls
            // navigate(`/tasks/${taskId}`, { state: { taskName: taskTitle } });
          }}
          avatarMap={avatarMap}
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