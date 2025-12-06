import { useState } from "react"
import { ChevronDown, ChevronRight, File, Folder, MoreVertical } from "lucide-react"

interface SidebarFileItemBase {
  id: string
  name: string
  url: string
  size?: string
}

export interface ProjectSidebarEntry {
  projectId: string
  projectName: string
  // for now we only show project-level files;
  // later we can extend each file with task info for "task files"
  files: SidebarFileItemBase[]
}

interface SidebarFilesSectionProps {
  globalFiles: SidebarFileItemBase[]
  projects: ProjectSidebarEntry[]
}

const SidebarFilesSection = ({ globalFiles, projects }: SidebarFilesSectionProps) => {
  const [globalOpen, setGlobalOpen] = useState(true)
  const [openProjects, setOpenProjects] = useState<Record<string, boolean>>({})

  const handleOpen = (url: string) => {
    if (!url) return
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const hasAnyProjectFiles = projects.some((p) => p.files.length > 0)

  const toggleProject = (id: string) => {
    setOpenProjects((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="mt-8">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        FILES
      </h3>

      <div className="space-y-1 text-sm text-slate-700">
        {/* GLOBAL FILES (top level) */}
        <div>
          <button
            type="button"
            onClick={() => setGlobalOpen((o) => !o)}
            className="flex items-center justify-between w-full rounded-lg py-1.5 pr-2 hover:bg-slate-50"
          >
            <div className="flex items-center space-x-2 min-w-0">
              {globalOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              )}
              <Folder className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <span className="truncate max-w-[140px] text-[13px] font-semibold">
                Global files
              </span>
            </div>
            <div className="flex items-center space-x-1 text-[11px] text-slate-500 flex-shrink-0">
              <span>
                {globalFiles.length} file{globalFiles.length !== 1 ? "s" : ""}
              </span>
            </div>
          </button>

          {globalOpen && globalFiles.length > 0 && (
            <div className="ml-5 mt-1 space-y-1">
              {globalFiles.slice(0, 6).map((file) => (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => handleOpen(file.url)}
                  className="flex items-center justify-between w-full rounded-lg py-1.5 pr-2 hover:bg-slate-50"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <File className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="truncate max-w-[140px] text-[13px]">
                      {file.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-[11px] text-slate-500 flex-shrink-0">
                    {file.size && <span>{file.size}</span>}
                    <MoreVertical className="w-3 h-3" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* PROJECT FILES (nested under global section visually) */}
        {hasAnyProjectFiles && (
          <div className="mt-2 pt-2 border-t border-slate-200">
            <div className="mb-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Project files
            </div>

            {projects.map((project) =>
              project.files.length > 0 ? (
                <div key={project.projectId} className="mb-1">
                  <button
                    type="button"
                    onClick={() => toggleProject(project.projectId)}
                    className="flex items-center justify-between w-full rounded-lg py-1.5 pr-2 hover:bg-slate-50"
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      {openProjects[project.projectId] ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      )}
                      <Folder className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <span className="truncate max-w-[140px] text-[13px]">
                        {project.projectName || "Project"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-[11px] text-slate-500 flex-shrink-0">
                      <span>
                        {project.files.length} file
                        {project.files.length > 1 ? "s" : ""}
                      </span>
                      <MoreVertical className="w-3 h-3" />
                    </div>
                  </button>

                  {openProjects[project.projectId] && (
                    <div className="ml-5 mt-1 space-y-1">
                      {project.files.slice(0, 4).map((file) => (
                        <button
                          key={file.id}
                          type="button"
                          onClick={() => handleOpen(file.url)}
                          className="flex items-center justify-between w-full rounded-lg py-1.5 pr-2 hover:bg-slate-50"
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            <File className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <span className="truncate max-w-[130px] text-[13px]">
                              {file.name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 text-[11px] text-slate-500 flex-shrink-0">
                            {file.size && <span>{file.size}</span>}
                            <MoreVertical className="w-3 h-3" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : null,
            )}
          </div>
        )}

        {!hasAnyProjectFiles && globalFiles.length === 0 && (
          <p className="text-xs text-slate-400 mt-1">No files yet</p>
        )}
      </div>
    </div>
  )
}

export default SidebarFilesSection