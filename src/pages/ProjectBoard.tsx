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
  MoreHorizontal
} from "lucide-react";
import { useState } from "react";
import TaskChat from "@/components/TaskChat";
// Removed DropdownMenu imports
import { useClerk } from "@clerk/clerk-react";
import { useUser } from "@clerk/clerk-react";

const avatarMap: { [key: string]: string } = {
  JD: "https://randomuser.me/api/portraits/men/11.jpg",
  SM: "https://randomuser.me/api/portraits/women/12.jpg",
  AL: "https://randomuser.me/api/portraits/men/13.jpg",
  BK: "https://randomuser.me/api/portraits/women/14.jpg",
  CL: "https://randomuser.me/api/portraits/men/15.jpg",
  DM: "https://randomuser.me/api/portraits/women/16.jpg",
  EF: "https://randomuser.me/api/portraits/men/17.jpg",
  GH: "https://randomuser.me/api/portraits/women/18.jpg",
  IJ: "https://randomuser.me/api/portraits/men/19.jpg",
  KL: "https://randomuser.me/api/portraits/women/20.jpg",
  MN: "https://randomuser.me/api/portraits/men/21.jpg",
  OP: "https://randomuser.me/api/portraits/women/22.jpg",
  QR: "https://randomuser.me/api/portraits/men/23.jpg",
  ST: "https://randomuser.me/api/portraits/women/24.jpg",
  UV: "https://randomuser.me/api/portraits/men/25.jpg",
  WX: "https://randomuser.me/api/portraits/women/26.jpg",
  YZ: "https://randomuser.me/api/portraits/men/27.jpg",
  AB: "https://randomuser.me/api/portraits/women/28.jpg",
  CD: "https://randomuser.me/api/portraits/men/29.jpg",
  MB: "https://randomuser.me/api/portraits/men/30.jpg",
  AI: "https://randomuser.me/api/portraits/women/31.jpg",
};

const ProjectBoard = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState("");
  const { user } = useUser();
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "Thoughts™ Landing Page",
      tasks: [
        { name: "Identify Target Audience", status: "On-going", progress: 80, avatars: ["JD", "SM"] },
        { name: "Analyze Competitors", status: "On-going", progress: 70, avatars: ["AL", "BK"] },
        { name: "Conduct User Surveys", status: "On-going", progress: 60, avatars: ["CL", "DM"] },
        { name: "Perform SEO Analysis", status: "To-do", progress: 0, avatars: ["EF", "GH"] },
        { name: "Create Wireframes", status: "On-going", progress: 85, avatars: ["IJ", "KL"] },
        { name: "Develop Style Guide", status: "On-going", progress: 25, avatars: ["MN", "OP"] },
        { name: "Design Mockups", status: "To-do", progress: 0, avatars: ["QR", "ST"] },
        { name: "Set Up Development Environment", status: "To-do", progress: 0, avatars: ["UV", "WX"] },
        { name: "Code the Structure", status: "To-do", progress: 0, avatars: ["YZ", "AB"] },
        { name: "Create User Personas", status: "On-going", progress: 80, avatars: ["CD", "EF"] }
      ]
    },
    {
      id: 2,
      name: "GoodWriter™ Web Development",
      tasks: [
        { name: "Plan Visual Hierarchy", status: "On-going", progress: 90, avatars: ["GH", "IJ"] },
        { name: "Create Interactive Elements", status: "In-review", progress: 100, avatars: ["KL", "MN"] },
        { name: "Optimize for Mobile", status: "On-going", progress: 15, avatars: ["OP", "QR"] },
        { name: "Ensure Responsiveness", status: "On-going", progress: 60, avatars: ["ST", "UV"] },
        { name: "Integrate Interactive Elements", status: "To-do", progress: 0, avatars: ["WX", "YZ"] },
        { name: "Test Functionality", status: "On-going", progress: 75, avatars: ["AB", "CD"] }
      ]
    },
    {
      id: 3,
      name: "Paper.so Style Research",
      tasks: [
        { name: "Review Analytics Data", status: "On-going", progress: 90, avatars: ["EF", "GH"] },
        { name: "Understand Client's Goals", status: "On-going", progress: 10, avatars: ["IJ", "KL"] },
        { name: "Investigate Industry Trends", status: "On-going", progress: 0, avatars: ["MN", "OP"] },
        { name: "Create Custom Illustrations", status: "On-going", progress: 90, avatars: ["QR", "ST"] },
        { name: "Plan A/B Testing Variants", status: "On-going", progress: 0, avatars: ["UV", "WX"] }
      ]
    }
  ]);

  const { signOut } = useClerk();

  const getProgressColor = (progress: number) => {
    return "text-green-400";
  };

  const handleTaskClick = (taskName: string) => {
    setSelectedTask(taskName);
    setChatOpen(true);
  };

  const handleCreateTask = (taskName: string, projectName: string) => {
    const projectIndex = projects.findIndex(p => p.name.includes(projectName)) || 0;
    const newTask = {
      name: taskName,
      status: "To-do",
      progress: 0,
      avatars: ["MB", "AI"]
    };

    setProjects(prevProjects => {
      const updatedProjects = [...prevProjects];
      updatedProjects[projectIndex] = {
        ...updatedProjects[projectIndex],
        tasks: [...updatedProjects[projectIndex].tasks, newTask]
      };
      return updatedProjects;
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Task Chat Overlay */}
      <TaskChat
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        taskName={selectedTask}
        onCreateTask={handleCreateTask}
      />

      {/* Sidebar */}
      <div className={`w-64 bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">O</span>
            </div>
            <span className="font-semibold text-gray-800">Orbital</span>
          </div>
        </div>

        {/* Navigation */}
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

        {/* User Profile */}
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

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${chatOpen ? 'mr-96' : ''}`}>
        {/* Header */}
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
            {/* Log out button on top right */}
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

        {/* Productivity Banner */}
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

        {/* Quick Actions */}
        <div className="px-6 py-4 bg-white border-b border-gray-200">
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setChatOpen(true);
                setSelectedTask("Create new task");
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Create new task</p>
                  <p className="text-xs text-gray-500">New task in your project</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setChatOpen(true);
                setSelectedTask("Create new project");
              }}
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
                setSelectedTask("Create new folder");
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
                setSelectedTask("Create new doc");
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

        {/* Project Boards */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="h-fit">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <CardTitle className="text-sm font-medium">{project.name}</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-2"></div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2 mb-4">
                    <Badge variant="secondary" className="text-xs">DESIGN</Badge>
                    <Badge variant="secondary" className="text-xs">IN REVIEW</Badge>
                    <Badge variant="secondary" className="text-xs">TO-DO</Badge>
                    <Badge variant="secondary" className="text-xs">COMPLETED</Badge>
                    <Button variant="ghost" size="sm">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </div>
                  {project.tasks.map((task, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-2 cursor-pointer"
                      onClick={() => handleTaskClick(task.name)}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                        <span className="text-sm text-gray-700">{task.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-medium ${getProgressColor(task.progress)}`}>
                          {task.progress}%
                        </span>
                        <div className="flex -space-x-1">
                          {task.avatars.map((avatar, avatarIndex) => (
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
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectBoard;