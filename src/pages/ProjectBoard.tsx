import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  EllipsisVertical,
  Filter,
  FileText,
  X,
  Plus,
  FolderPlus,
  FilePlus,
  Layout,
  Search,
  Sparkles,
  Loader2,
  Check
} from "lucide-react"
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
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/Topbar"
import { useNavigate } from "react-router-dom"
import OrbitalPanel from "@/components/orbitalPanelComponents/OrbitalPanel"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

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

// Map display names to backend status values
const STATUS_MAP: Record<string, string> = {
  "Design": "design",
  "In Review": "in_review",
  "To-Do": "to_do",
  "Completed": "completed"
}

const STATUS_STYLES: Record<string, string> = {
  "Design": "bg-purple-100 hover:bg-purple-200 text-purple-700 border-purple-200",
  "In Review": "bg-amber-100 hover:bg-amber-200 text-amber-700 border-amber-200",
  "To-Do": "bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-200",
  "Completed": "bg-green-100 hover:bg-green-200 text-green-700 border-green-200"
}

interface ProjectsListInnerProps {
  projects: any[]
  loading: boolean
  error: Error | null
  onTaskClick: (taskId: string, taskTitle: string) => void
  onGenerateRequirements: (projectId: string) => void
  onShowCreateTaskModal: (projectId: string) => void
  projectDocs: ProjectDocsMap
  onUploadProjectFiles: (projectId: string) => void
  selectedTaskId: string | null
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
  selectedTaskId,
}: ProjectsListInnerProps) {
  const [statusFilters, setStatusFilters] = useState<Record<string, string | null>>({})

  const handleStatusFilter = (projectId: string, statusLabel: string) => {
    setStatusFilters(prev => ({
      ...prev,
      [projectId]: prev[projectId] === statusLabel ? null : statusLabel
    }))
  }

  const getFilteredTasks = (projectId: string, tasks: any[]) => {
    const activeFilter = statusFilters[projectId]
    if (!activeFilter) return tasks
    
    const backendStatus = STATUS_MAP[activeFilter]
    return tasks.filter(task => task.status === backendStatus)
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary/60 mb-4" />
        <p className="text-sm text-muted-foreground">Syncing your workspace...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-red-500">
        <div className="bg-red-50 p-4 rounded-lg border border-red-100 max-w-md text-center">
          <p className="font-semibold mb-1">Unable to load projects</p>
          <p className="text-sm opacity-90">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1">
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-xl">
          <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Layout className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No projects yet</h3>
          <p className="text-sm text-slate-500 max-w-sm text-center mt-2 mb-6">
            Get started by creating a new project to track your tasks and requirements.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-6 pb-20">
          {projects.map((project: any) => {
            const filteredTasks = getFilteredTasks(project.id, project.tasks || [])
            const activeFilter = statusFilters[project.id]
            
            return (
              <Card 
                key={project.id} 
                className="group flex flex-col w-full md:w-[calc(50%-0.75rem)] xl:w-[calc(33.333%-1rem)] h-[400px] border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <CardHeader className="pb-3 border-b border-slate-50 bg-slate-50/30">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 bg-slate-500 rounded-full shadow-sm ring-2 ring-white" />
                        <CardTitle className="text-base font-semibold text-slate-800 leading-none">
                          {project.name}
                        </CardTitle>
                      </div>
                      <p className="text-xs text-slate-500 font-medium pl-[18px]">
                        {project.type || "General Project"}
                      </p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-slate-400 hover:text-slate-700">
                          <EllipsisVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onShowCreateTaskModal(project.id)}>
                          <Plus className="mr-2 h-4 w-4" /> New task
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onGenerateRequirements(project.id)}>
                          <Sparkles className="mr-2 h-4 w-4" /> AI Generate Tasks
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onUploadProjectFiles(project.id)}>
                          <FileText className="mr-2 h-4 w-4" /> Add project docs
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <div className="px-4 py-3 bg-white border-b border-slate-100">
                  <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex space-x-2 pl-2 items-center">
                      {Object.keys(STATUS_MAP).map((status) => {
                        const isActive = activeFilter === status
                        const taskCount = (project.tasks || []).filter(
                          (task: any) => task.status === STATUS_MAP[status]
                        ).length
                        
                        return (
                          <Badge 
                            key={status} 
                            variant="secondary" 
                            onClick={() => handleStatusFilter(project.id, status)}
                            className={cn(
                              "text-[10px] font-medium px-2 py-0.5 cursor-pointer transition-all relative",
                              isActive 
                                ? STATUS_STYLES[status] + " ring-2 ring-offset-1" 
                                : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200/60"
                            )}
                          >
                            {status}
                            {taskCount > 0 && (
                              <span className="ml-1 opacity-70">({taskCount})</span>
                            )}
                          </Badge>
                        )
                      })}
                      
                      {activeFilter && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 rounded-full hover:bg-slate-100"
                          onClick={() => setStatusFilters(prev => ({ ...prev, [project.id]: null }))}
                          title="Clear filter"
                        >
                          <X className="w-3 h-3 text-slate-600" />
                        </Button>
                      )}
                    </div>
                    <ScrollBar orientation="horizontal" className="h-1.5" />
                  </ScrollArea>
                </div>

                <CardContent className="flex-1 p-0 overflow-hidden relative bg-white">
                  <ScrollArea className="h-full">
                    <div className="p-3 space-y-1">
                      {filteredTasks.length > 0 ? (
                        filteredTasks.map((task: any) => {
                          const isSelected = selectedTaskId === task.id
                          return (
                            <div
                              key={task.id}
                              className="group/task flex items-center justify-between p-2.5 rounded-md hover:bg-slate-50 border border-transparent hover:border-slate-100 cursor-pointer transition-all duration-150"
                              onClick={() => onTaskClick(task.id, task.title)}
                            >
                              <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <div className={cn(
                                  "w-3.5 h-3.5 border-2 rounded-sm transition-all duration-200 flex items-center justify-center",
                                  isSelected 
                                    ? "bg-slate-500 border-slate-500" 
                                    : "border-slate-300 group-hover/task:border-slate-400"
                                )}>
                                  {isSelected && (
                                    <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                                  )}
                                </div>
                                <span className="text-sm font-medium text-slate-700 truncate block">
                                  {task.title}
                                </span>
                              </div>
                              
                              <div className="pl-2 flex items-center">
                                {task.assignees &&
                                task.assignees.length > 0 &&
                                task.assignees.some((assignee: any) => assignee.avatar) ? (
                                  <div className="flex -space-x-2 overflow-hidden">
                                    {task.assignees.map((assignee: any, avatarIndex: number) =>
                                      assignee.avatar ? (
                                        <Avatar
                                          key={assignee.id || avatarIndex}
                                          className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                                        >
                                          <AvatarImage
                                            src={assignee.avatar}
                                            alt={assignee.name || "User"}
                                          />
                                          <AvatarFallback className="text-[9px] bg-slate-100 text-slate-600">
                                            {getInitials(assignee.name || assignee.email || "")}
                                          </AvatarFallback>
                                        </Avatar>
                                      ) : null,
                                    )}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="flex flex-col items-center justify-center h-40 text-center px-4">
                          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                            <Layout className="w-5 h-5 text-slate-300" />
                          </div>
                          <p className="text-sm text-slate-500">
                            {activeFilter ? `No ${activeFilter.toLowerCase()} tasks` : "No tasks created yet."}
                          </p>
                          {activeFilter && (
                            <Button
                              variant="link"
                              size="sm"
                              className="mt-2 text-xs"
                              onClick={() => setStatusFilters(prev => ({ ...prev, [project.id]: null }))}
                            >
                              Clear filter
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

const ProjectBoard = () => {
  const [chatOpen, setChatOpen] = useState(false)
  const [showOrbitalPanel, setShowOrbitalPanel] = useState(false)
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
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
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

            try {
              const res = await tasksApi.tasksControllerFindAllByProject(project.id, "")
              tasksByProject[project.id] = res.data || res || []
            } catch {
              tasksByProject[project.id] = []
            }

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
        projectId,
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

  return (
    <div className="flex h-screen bg-slate-50/50">
      <TaskChat
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        taskName={selectedTask?.title ?? ""}
        taskId={selectedTask?.id ?? ""}
        onCallStart={() => {}}
        onCallEnd={() => {}}
        globalDocs={uploadedFiles}
        projectDocs={selectedProjectDocs}
      />

      <OrbitalPanel
        isOpen={showOrbitalPanel}
        onClose={() => setShowOrbitalPanel(false)}
      />

      <Sidebar />
      
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <TopBar
          searchValue={search}
          setSearchValue={setSearch}
          placeholder="Search projects & tasks..."
          showLogout={true}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto p-6 md:p-8 space-y-8">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Welcome back, {user?.username || "User"}
                </h1>
                <p className="text-slate-500 mt-1">
                  Manage your projects, track tasks, and collaborate with your team.
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                 <Button 
                   onClick={() => setShowCreateProjectModal(true)}
                   className="bg-slate-600 hover:bg-slate-700 text-white shadow-sm transition-all"
                 >
                   <Plus className="w-4 h-4 mr-2" />
                   New Project
                 </Button>
                 
                 <div className="h-6 w-px bg-slate-200 mx-1 hidden md:block" />

                 <Button 
                    variant="outline" 
                    className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-600"
                    onClick={() => navigate("/files")}
                 >
                    <FolderPlus className="w-4 h-4 mr-2" />
                    New Folder
                 </Button>
                 
                 <Button 
                    variant="outline" 
                    className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-600"
                    onClick={() => navigate("/files")}
                 >
                    <FilePlus className="w-4 h-4 mr-2" />
                    New Doc
                 </Button>
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <FileText className="w-4 h-4 text-slate-500" />
                     <h4 className="text-sm font-semibold text-slate-700">Quick Access Documents</h4>
                   </div>
                   <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                     {uploadedFiles.length}
                   </span>
                </div>
                <div className="p-3">
                  <div className="flex flex-wrap gap-2">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        onClick={() => window.open(file.url, "_blank")}
                        className="group flex items-center gap-2 pl-3 pr-2 py-1.5 bg-white border border-slate-200 rounded-md hover:border-slate-300 hover:shadow-sm cursor-pointer transition-all"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-500" />
                        <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900 max-w-[150px] truncate">
                          {file.name}
                        </span>
                        <div className="w-px h-3 bg-slate-200 mx-1" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveFile(file.id)
                          }}
                          className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded p-0.5 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-4">
                 <h2 className="text-lg font-semibold text-slate-800">Your Projects</h2>
                 <div className="text-sm text-slate-500">
                    Total: <span className="font-medium text-slate-900">{projects.length}</span>
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
                selectedTaskId={selectedTask?.id || null}
              />
            </div>
          </div>
        </main>

        <CreateProject 
          open={showCreateProjectModal}
          onOpenChange={setShowCreateProjectModal}
          onSuccess={handleProjectCreated} 
        />

        {showCreateTaskModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden relative animate-in fade-in zoom-in duration-200">
              <button
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors z-10"
                onClick={() => setShowCreateTaskModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
              <div className="p-1">
                 <CreateTask defaultProjectId={createTaskProjectId} />
              </div>
            </div>
          </div>
        )}

        {showRequirementsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden relative animate-in fade-in zoom-in duration-200">
              <button
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors z-10"
                onClick={() => setShowRequirementsModal(false)}
              >
                <X className="w-5 h-5" />
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

        {!chatOpen && !showOrbitalPanel && (
          <Button
            size="default"
            className="fixed bottom-24 right-6 z-50 shadow-xl bg-slate-800 hover:bg-slate-800 text-white rounded-lg w-auto h-10 px-4 flex items-center justify-center text-sm font-medium transition-all"
            onClick={() => {
              setShowOrbitalPanel(true)
            }}
          >
            Ask Orbital
          </Button>
        )}
      </div>
    </div>
  )
}

export default ProjectBoard