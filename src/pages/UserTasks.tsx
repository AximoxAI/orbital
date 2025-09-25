"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/Topbar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UsersApi, Configuration, TaskResponseDto, UserResponseDto } from "@/api-client"
import { useUser, useAuth } from "@clerk/clerk-react"

const statusOptions = [
  { value: "all", label: "All" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "to_do", label: "To-do" },
  { value: "in_review", label: "In Review" },
  { value: "draft", label: "Draft" },
  { value: "design", label: "Design" },
]

const getStatusBadge = (status: string) => {
  const baseClasses = "px-3 py-1 rounded-full text-xs font-medium"
  switch (status) {
    case "in_progress":
      return `${baseClasses} bg-blue-100 text-blue-700`
    case "completed":
      return `${baseClasses} bg-green-100 text-green-700`
    case "to_do":
      return `${baseClasses} bg-gray-100 text-gray-700`
    case "in_review":
      return `${baseClasses} bg-yellow-100 text-yellow-700`
    case "draft":
      return `${baseClasses} bg-pink-50 text-pink-600`
    case "design":
      return `${baseClasses} bg-purple-50 text-purple-600`
    default:
      return `${baseClasses} bg-gray-100 text-gray-700`
  }
}

export default function YourTasks() {
  const [search, setSearch] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [tasks, setTasks] = useState<TaskResponseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, isSignedIn, isLoaded } = useUser()
  const { getToken } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchTasks() {
      setLoading(true)
      setError(null)
      try {
        if (!isLoaded || !isSignedIn) {
          setError("User not authenticated")
          setTasks([])
          setLoading(false)
          return
        }
        const sessionToken = await getToken()
        if (!sessionToken) {
          setError("Session token not found")
          setTasks([])
          setLoading(false)
          return
        }
        const config = new Configuration({
          basePath: import.meta.env.VITE_BACKEND_API_KEY,
          accessToken: sessionToken,
        })
        const api = new UsersApi(config)
        const usersResp = await api.usersControllerFindAll()
        const matchedUser: UserResponseDto | undefined = usersResp.data.find(
          (u: UserResponseDto) => u.auth_id === user.id
        )

        if (!matchedUser) {
          setError("User not found in backend")
          setTasks([])
          setLoading(false)
          return
        }

        const resp = await api.usersControllerGetUserTasks(matchedUser.id)
        setTasks(Array.isArray(resp.data) ? resp.data : [])
      } catch (err: any) {
        setError("Failed to load tasks. " + (err.message || ""))
        setTasks([])
      }
      setLoading(false)
    }
    fetchTasks()
  }, [isLoaded, isSignedIn, user?.id, getToken])

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      (task.project_id && task.project_id.toLowerCase().includes(search.toLowerCase())) ||
      (task.description && task.description.toLowerCase().includes(search.toLowerCase()))
    const matchesStatus =
      selectedStatus === "all" || (task.status && task.status.toLowerCase() === selectedStatus)
    return matchesSearch && matchesStatus
  })

  console.log(filteredTasks)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar
          searchValue={search}
          setSearchValue={setSearch}
          placeholder="Search tasks..."
          showLogout={true}
          className="mb-4"
        />
        <div className="flex flex-col flex-1 max-w-7xl mx-auto w-full pt-4 px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Your Tasks</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Status:</span>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      TASK
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      PROJECT
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      CREATED AT
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      STATUS
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-400">
                        Loading tasks...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-red-500">
                        {error}
                      </td>
                    </tr>
                  ) : filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-gray-500 text-sm">
                        No tasks found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((task) => (
                      <tr
                        key={task.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/tasks/${task.id}`, { state: { taskName: task.title } })}


                        style={{ cursor: "pointer" }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{task.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{task.project_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {task.created_at ? task.created_at.slice(0, 10) : "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusBadge(task.status)}>{task.status.replace(/_/g, " ")}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}