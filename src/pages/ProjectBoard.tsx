import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EllipsisVertical, Filter, FileText, X } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import TaskChat from "@/components/taskChatComponents/TaskChat"
import { useUser, useAuth } from "@clerk/clerk-react"
import { Configuration, ProjectsApi, TasksApi, UploadsApi } from "@/api-client"
import CreateProject from "@/components/apiComponents/CreateProject"
import GenerateRequirements from "@/components/apiComponents/GenerateRequirements"
import { CreateTask } from "@/components/apiComponents/CreateTask"
import FileUploadDialog from "@/components/taskChatComponents/FileUploadDialog"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/Topbar"
import { useNavigate } from "react-router-dom"

const getInitials = (name: string) => {
  if (!name) return "??"
  const parts = name.trim().split(" ")
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

interface UploadedFile {
  name: string
  size: number
  type: string
  uploadedAt: string
  id: string
  url: string
}

type ProjectDocsMap = Record<string, UploadedFile[]>

interface ProjectsListInnerProps {
  projects: any[]
  loading: boolean
  error: Error | null
  onTaskClick: (taskId: string, taskTitle: string) => void
  onGenerateRequirements: (projectId: string) => void
  onShowCreateTaskModal: (projectId: string) => void
  projectDocs: ProjectDocsMap
  onUploadProjectFiles: (projectId: string) => void
}

function ProjectsList({
  projects,
  loading,
  error,
  onTaskClick,
  onGenerateRequirements,
  onShowCreateTaskModal,
  projectDocs,
  onUploadProjectFiles,
}: ProjectsListInnerProps) {
  if (loading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading projects...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center text-red-500">
        <p className="text-lg">
          Error fetching projects: <strong>{error.message}</strong>. Please try again later.
        </p>
      </div>
    )
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
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <CardTitle className="text-sm font-medium">{project.name}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <EllipsisVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onShowCreateTaskModal(project.id)}>
                        New task
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onGenerateRequirements(project.id)}>
                        Generate Tasks
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onUploadProjectFiles(project.id)}>
                        Add project docs
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <span>{project.type}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 mb-3 overflow-x-auto pb-2">
                  <Badge variant="secondary" className="text-xs cursor-pointer">
                    Design
                  </Badge>
                  <Badge variant="secondary" className="text-xs cursor-pointer">
                    In Review
                  </Badge>
                  <Badge variant="secondary" className="text-xs cursor-pointer">
                    To-Do
                  </Badge>
                  <Badge variant="secondary" className="text-xs cursor-pointer">
                    Completed
                  </Badge>
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
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-4 h-4 border-2 border-gray-300 rounded" />
                        <span className="text-sm text-gray-700 truncate max-w-[180px] block">
                          {task.title}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex justify-end flex-row-reverse min-w-[70px]">
                          {task.assignees &&
                          task.assignees.length > 0 &&
                          task.assignees.some((assignee: any) => assignee.avatar)
                            ? task.assignees.map((assignee: any, avatarIndex: number) =>
                                assignee.avatar ? (
                                  <Avatar
                                    key={assignee.id || avatarIndex}
                                    className="w-6 h-6 border-2 border-white -ml-2"
                                  >
                                    <AvatarImage
                                      src={assignee.avatar}
                                      alt={assignee.name || "User"}
                                    />
                                    <AvatarFallback>
                                      {getInitials(assignee.name || assignee.email || "")}
                                    </AvatarFallback>
                                  </Avatar>
                                ) : null,
                              )
                            : null}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center">
                    No tasks for this project yet.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

const ProjectBoard = () => {
  const [chatOpen, setChatOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<{ id: string; title: string } | null>(
    null,
  )
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false)
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false)
  const [showRequirementsModal, setShowRequirementsModal] = useState(false)
  const [showFileUploadDialog, setShowFileUploadDialog] = useState(false)
  const [requirementsProjectId, setRequirementsProjectId] = useState("")
  const [createTaskProjectId, setCreateTaskProjectId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]) // global docs
  const [projectDocs, setProjectDocs] = useState<ProjectDocsMap>({})
  const [projectUploadTargetId, setProjectUploadTargetId] = useState<string | null>(null)

  const { user } = useUser()
  const { getToken } = useAuth()
  const navigate = useNavigate()

  const fetchUploadedFiles = async () => {
    try {
      const sessionToken = await getToken()
      const configuration = new Configuration({
        basePath: import.meta.env.VITE_BACKEND_API_KEY,
        accessToken: sessionToken || undefined,
      })
      const uploadsApi = new UploadsApi(configuration)
      // TODO: if you add a backend endpoint for global files, call it here.
      setUploadedFiles((prev) => prev)
    } catch {
    }
  }

  useEffect(() => {
    const fetchProjectsAndTasksAndDocs = async () => {
      setLoading(true)
      try {
        const sessionToken = await getToken()
        const configuration = new Configuration({
          basePath: import.meta.env.VITE_BACKEND_API_KEY,
          accessToken: sessionToken || undefined,
        })

        const projectsApi = new ProjectsApi(configuration)
        const tasksApi = new TasksApi(configuration)

        const response: any = await projectsApi.projectsControllerFindAll()
        const projectsData = response.data || response

        const tasksByProject: Record<string, any[]> = {}
        const docsByProject: ProjectDocsMap = {}

        await Promise.all(
          projectsData.map(async (project: any) => {
            if (!project.id) return

            // tasks
            try {
              const res = await tasksApi.tasksControllerFindAllByProject(project.id, "")
              tasksByProject[project.id] = res.data || res || []
            } catch {
              tasksByProject[project.id] = []
            }

            // project docs via GET /api/v1/projects/{id}/files
            try {
              const filesRes = await projectsApi.projectsControllerGetProjectFiles(project.id)
              const files = filesRes.data || filesRes || []
              docsByProject[project.id] = files.map((f: any) => ({
                id: f.fileId,
                name: f.filename,
                url: f.view_url,
                uploadedAt: f.created_at,
                size: 0,
                type: "",
              }))
            } catch {
              docsByProject[project.id] = docsByProject[project.id] || []
            }
          }),
        )

        const projectsWithTasks = projectsData.map((project: any) => ({
          ...project,
          tasks: tasksByProject[project.id] || [],
        }))

        setProjects(projectsWithTasks)
        setProjectDocs(docsByProject)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjectsAndTasksAndDocs()
    fetchUploadedFiles()
  }, [getToken])

  const uploadFiles = async (files: File[], projectId?: string) => {
    const sessionToken = await getToken()
    const configuration = new Configuration({
      basePath: import.meta.env.VITE_BACKEND_API_KEY,
      accessToken: sessionToken || undefined,
    })
    const uploadsApi = new UploadsApi(configuration)

    const uploaded: UploadedFile[] = []

    for (const f of files) {
      const presignRes = await uploadsApi.uploadControllerPresign({
        filename: f.name,
        contentType: (f.type || "application/octet-stream") as any,
        projectId, // if provided => project file; otherwise global
      })

      const presignData = presignRes.data

      await fetch(presignData.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": f.type || "application/octet-stream",
        },
        body: f,
      })

      uploaded.push({
        name: f.name,
        size: f.size,
        type: f.type,
        uploadedAt: new Date().toISOString(),
        id: presignData.fileId,
        url: presignData.viewUrl,
      })
    }

    if (projectId) {
      setProjectDocs((prev) => ({
        ...prev,
        [projectId]: [...(prev[projectId] || []), ...uploaded],
      }))
    } else {
      setUploadedFiles((prev) => [...prev, ...uploaded])
    }
  }

  const handleFilesSelect = async (files: File[]) => {
    try {
      await uploadFiles(files, projectUploadTargetId || undefined)
    } catch {
    }
  }

  const handleRemoveFile = async (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const handleCreateTask = (taskName: string, projectName: string) => {
    setProjects((prevProjects) => {
      const updatedProjects = prevProjects.map((project) => {
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
          }
          return {
            ...project,
            tasks: [...project.tasks, newTask],
          }
        }
        return project
      })
      return updatedProjects
    })
  }

  const handleShowCreateTaskModal = (projectId: string) => {
    setCreateTaskProjectId(projectId)
    setShowCreateTaskModal(true)
  }

  const handleShowRequirementsModal = (projectId: string) => {
    setRequirementsProjectId(projectId)
    setShowRequirementsModal(true)
  }

  const handleProjectCreated = () => {
    setShowCreateProjectModal(false)
  }

  const selectedProjectDocs = useMemo(() => {
    if (!selectedTask) return []
    const project = projects.find((p) =>
      p.tasks?.some((t: any) => t.id === selectedTask.id),
    )
    if (!project) return []
    return projectDocs[project.id] || []
  }, [selectedTask, projects, projectDocs])

  const globalSidebarFiles = uploadedFiles.map((f) => ({
    id: f.id,
    name: f.name,
    url: f.url,
    size: undefined as string | undefined,
  }))

  const projectSidebarEntries = projects.map((p) => ({
    projectId: p.id,
    projectName: p.name,
    files: (projectDocs[p.id] || []).map((f) => ({
      id: f.id,
      name: f.name,
      url: f.url,
      size: undefined as string | undefined,
    })),
  }))

  return (
    <div className="flex h-screen bg-gray-50">
      <TaskChat
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        taskName={selectedTask?.title ?? ""}
        taskId={selectedTask?.id ?? ""}
        onCreateTask={handleCreateTask}
        globalDocs={uploadedFiles}
        projectDocs={selectedProjectDocs}
      />

      {/* Sidebar no longer receives files as props */}
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar
          searchValue={search}
          setSearchValue={setSearch}
          placeholder="Search"
          showLogout={true}
        />

        {uploadedFiles.length > 0 && (
          <div className="px-6 py-4 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-800"> Documents</h4>
              <span className="text-xs text-gray-500">
                {uploadedFiles.length} file
                {uploadedFiles.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {uploadedFiles.map((file) => (
                <Badge
                  key={file.id}
                  variant="secondary"
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                  onClick={() => window.open(file.url, "_blank")}
                >
                  <FileText className="w-3 h-3 text-slate-600" />
                  <span className="text-xs text-gray-700">{file.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveFile(file.id)
                    }}
                    className="ml-1 text-gray-500 hover:text-red-600 transition-colors"
                    aria-label="Remove file"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="px-6 py-4 bg-white border-b border-gray-200">
          <div className="grid grid-cols-3 gap-4">
            <Card
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
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
            <Card
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                // open Files page when creating a new folder
                navigate("/files")
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
            <Card
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                // open Files page when creating a new doc
                navigate("/files")
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
            setSelectedTask({ id: taskId, title: taskTitle })
            setChatOpen(true)
          }}
          onGenerateRequirements={handleShowRequirementsModal}
          onShowCreateTaskModal={handleShowCreateTaskModal}
          projectDocs={projectDocs}
          onUploadProjectFiles={(projectId: string) => {
            setProjectUploadTargetId(projectId)
            setShowFileUploadDialog(true)
          }}
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
              <CreateProject onSuccess={handleProjectCreated} />
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
              <CreateTask defaultProjectId={createTaskProjectId} />
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

        {showFileUploadDialog && (
          <FileUploadDialog
            open={showFileUploadDialog}
            onOpenChange={(open) => {
              if (!open) setProjectUploadTargetId(null)
              setShowFileUploadDialog(open)
            }}
            onFilesSelect={handleFilesSelect}
          />
        )}
      </div>
    </div>
  )
}

export default ProjectBoard