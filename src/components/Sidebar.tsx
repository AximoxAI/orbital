import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Home,
  Inbox,
  CheckSquare,
  Calendar,
  FileText,
  Users,
  Plus,
  Activity,
} from "lucide-react"
import { useUser } from "@clerk/clerk-react"
import { useNavigate } from "react-router-dom"

const sidebarLinks = [
  { label: "Dashboard", icon: Home, to: "/home" },
  { label: "Files", icon: FileText, to: "/files" },
  { label: "Profile", icon: Users, to: "/profile" },
  { label: "Inbox", icon: Inbox, to: "/inbox" },
  { label: "Your tasks", icon: CheckSquare, to: "/tasks" },
  { label: "Activity", icon: Activity, to: "/activity" },
]

const workspaceLinks = [
  { label: "Project board", icon: null, to: "/project-board", color: "bg-blue-500" },
  { label: "Upcoming", icon: Calendar, to: "#" },
  { label: "Workflows", icon: FileText, to: "/Workflows" },
  { label: "Pipelines", icon: FileText, to: "#" },
  { label: "Teams", icon: Users, to: "#" },
]

const spaceLinks = [
  { label: "API Discussion", color: "bg-purple-500" },
  { label: "DB Design", color: "bg-green-500" },
  { label: "AI Engineer", color: "bg-blue-500" },
]

interface SidebarProps {}

const Sidebar = ({}: SidebarProps) => {
  const { user } = useUser()
  const navigate = useNavigate()

  const handleSidebarNav = (to: string) => {
    if (to === "#") return
    navigate(to)
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 overflow-y-scroll">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">O</span>
          </div>
          <span className="font-semibold text-gray-800">Orbital</span>
        </div>
      </div>

      <nav className="flex-1 p-4">
        {/* MAIN NAV */}
        <div className="space-y-2">
          {sidebarLinks.map((item) => (
            <button
              key={item.label}
              onClick={() => handleSidebarNav(item.to)}
              className={`flex items-center space-x-3 w-full text-left rounded-lg p-2 transition
                ${
                  window.location.pathname === item.to
                    ? "text-gray-900 bg-gray-100 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              type="button"
            >
              {item.icon && <item.icon className="w-5 h-5" />}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* WORKSPACE */}
        <div className="mt-8">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            WORKSPACE
          </h3>
          <div className="space-y-2">
            {workspaceLinks.map((item) =>
              item.icon ? (
                <button
                  key={item.label}
                  onClick={() => handleSidebarNav(item.to)}
                  className={`flex items-center space-x-3 w-full text-left rounded-lg p-2 transition
                    ${
                      window.location.pathname === item.to
                        ? "text-gray-900 bg-gray-100 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  type="button"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ) : (
                <button
                  key={item.label}
                  onClick={() => handleSidebarNav(item.to)}
                  className={`flex items-center space-x-3 w-full text-left rounded-lg p-2 transition
                    ${
                      window.location.pathname === item.to
                        ? "text-gray-900 bg-gray-100 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  type="button"
                >
                  <div className={`w-2 h-2 ${item.color} rounded-full`} />
                  <span>{item.label}</span>
                </button>
              ),
            )}
          </div>
        </div>

        {/* SPACES */}
        <div className="mt-8">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            SPACES
          </h3>
          <div className="space-y-2">
            {spaceLinks.map((item) => (
              <button
                key={item.label}
                className="flex items-center space-x-3 text-gray-700 hover:bg-gray-100 rounded-lg p-2 w-full"
                type="button"
              >
                <div className={`w-2 h-2 ${item.color} rounded-full`} />
                <span>{item.label}</span>
              </button>
            ))}
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
            <AvatarImage src={user?.imageUrl || ""} alt={user?.username || "User"} />
            <AvatarFallback />
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {user?.username || "Unknown User"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar