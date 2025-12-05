import React, { useRef, useState } from "react"
import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/Topbar"
import { Folder, File as FileIcon, ChevronDown, ChevronRight, Plus, Trash2, Download, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import FileUploadDialog from "@/components/taskChatComponents/FileUploadDialog"

type ItemType = "file" | "folder"

interface Item {
  id: string
  name: string
  type: ItemType
  size?: number
  url?: string
  createdAt?: string
  // client-side only children for folders
  children?: Item[]
}

const formatSize = (bytes?: number) => {
  if (!bytes) return ""
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * FilesManager
 * - UI-only file manager for your page (no backend)
 * - Single list + folders
 * - Add files (native picker) and folders (modal/input)
 * - Folder menu (3 dots) with "Add file inside" and "Delete folder" options
 * - Uses shadcn-style DropdownMenu components and the existing FileUploadDialog for file selection
 */
export default function Files() {
  const [items, setItems] = useState<Item[]>([
    // example seed items (optional)
    { id: "f-1", name: "notes.txt", type: "file", size: 4096, createdAt: new Date().toISOString(), url: undefined },
    { id: "d-1", name: "Project Assets", type: "folder", children: [] },
  ])
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [search, setSearch] = useState("")
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // When adding a file to a specific folder, we'll open the existing FileUploadDialog
  const [folderUploadTargetId, setFolderUploadTargetId] = useState<string | null>(null)
  const [showFolderUploadDialog, setShowFolderUploadDialog] = useState(false)

  // Helpers
  const uid = (p = "") => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}${p}`

  const toggle = (id: string) => setExpanded((s) => ({ ...s, [id]: !s[id] }))

  const addFolder = () => {
    const name = newFolderName.trim()
    if (!name) return
    const folder: Item = { id: uid("d"), name, type: "folder", children: [], createdAt: new Date().toISOString() }
    setItems((p) => [folder, ...p])
    setNewFolderName("")
    setShowNewFolder(false)
  }

  // Top-level native file input (adds files to root list)
  const handleFileInput = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const picked: Item[] = []
    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      const url = URL.createObjectURL(f)
      picked.push({
        id: uid("f"),
        name: f.name,
        type: "file",
        size: f.size,
        url,
        createdAt: new Date().toISOString(),
      })
    }
    setItems((p) => [...picked, ...p])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const removeItem = (id: string) => {
    const removeRec = (list: Item[]): Item[] =>
      list
        .filter((it) => it.id !== id)
        .map((it) =>
          it.type === "folder" && it.children && it.children.length
            ? { ...it, children: removeRec(it.children) }
            : it,
        )
    setItems((p) => removeRec(p))
  }

  // Add file(s) into a folder (client-side). Accepts File[] from FileUploadDialog.
  const addFilesToFolderFromArray = (folderId: string, files: File[]) => {
    if (!files || files.length === 0) return
    const added: Item[] = files.map((f) => ({
      id: uid("f"),
      name: f.name,
      type: "file",
      size: f.size,
      url: URL.createObjectURL(f),
      createdAt: new Date().toISOString(),
    }))

    const mapRec = (list: Item[]): Item[] =>
      list.map((it) => {
        if (it.id === folderId && it.type === "folder") {
          return { ...it, children: [...(it.children || []), ...added] }
        }
        if (it.type === "folder" && it.children && it.children.length) {
          return { ...it, children: mapRec(it.children) }
        }
        return it
      })
    setItems((p) => mapRec(p))
  }

  // Render list (folders show children)
  const renderList = (list: Item[], depth = 0) =>
    list.map((it) => {
      const isFolder = it.type === "folder"
      const isExpanded = !!expanded[it.id]
      // search filter: simple name check; folders allowed if children match
      if (search && !it.name.toLowerCase().includes(search.toLowerCase())) {
        if (isFolder && it.children && it.children.some((c) => c.name.toLowerCase().includes(search.toLowerCase()))) {
          // keep
        } else {
          return null
        }
      }

      return (
        <div key={it.id} className="group">
          <div
            className="flex items-center justify-between px-4 py-2 hover:bg-slate-50 rounded-md"
            style={{ paddingLeft: 16 + depth * 12 }}
          >
            <div className="flex items-center gap-3 min-w-0">
              {isFolder ? (
                <button onClick={() => toggle(it.id)} className="w-6 flex items-center justify-center">
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                </button>
              ) : (
                <div style={{ width: 24 }} />
              )}

              {isFolder ? <Folder className="w-5 h-5 text-slate-600" /> : <FileIcon className="w-5 h-5 text-slate-400" />}

              <div className="truncate min-w-0">
                <div className="text-sm text-slate-900 truncate">{it.name}</div>
                {it.type === "file" && it.size != null && (
                  <div className="text-xs text-slate-400 mt-0.5">{formatSize(it.size)}</div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2   transition-opacity">
              {isFolder && (
                <>
                  {/* Dropdown (3 dots) for folder actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="p-1">
                        <MoreVertical className="w-4 h-4 text-slate-600" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          // open our existing FileUploadDialog and target this folder
                          setFolderUploadTargetId(it.id)
                          setShowFolderUploadDialog(true)
                        }}
                      >
                        Add file inside
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          removeItem(it.id)
                        }}
                      >
                        Delete folder
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}

              {it.type === "file" && it.url && (
                <button onClick={() => window.open(it.url, "_blank")} className="p-1 hover:bg-slate-100 rounded">
                  <Download className="w-4 h-4 text-slate-600" />
                </button>
              )}

              {/* delete for files */}
              {it.type === "file" && (
                <button onClick={() => removeItem(it.id)} className="p-1 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4 text-slate-600" />
                </button>
              )}
            </div>
          </div>

          {isFolder && isExpanded && (
            <div>
              {(it.children && it.children.length > 0) ? (
                renderList(it.children, depth + 1)
              ) : (
                <div className="px-4 py-2 text-sm text-slate-400 italic" style={{ paddingLeft: 16 + (depth + 1) * 12 }}>
                  Empty folder
                </div>
              )}
            </div>
          )}
        </div>
      )
    })

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <TopBar searchValue={search} setSearchValue={setSearch} placeholder="Search files..." showLogout />

        <div className="max-w-6xl mx-auto w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Documents</h2>
            
            </div>

            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  handleFileInput(e.target.files)
                }}
              />
              <Button onClick={() => fileInputRef.current?.click()} className="bg-slate-800 text-white hover:bg-slate-900">
                <Plus className="w-4 h-4 mr-2" /> Add file
              </Button>

              <Button variant="outline" onClick={() => setShowNewFolder(true)} className="border-slate-200 text-slate-800">
                <Folder className="w-4 h-4 mr-2" /> New folder
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="p-4">{items.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                No files or folders yet. Use "Add file" or "New folder".
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {renderList(items)}
              </div>
            )}</div>
          </div>
        </div>
      </div>

      {/* FileUploadDialog used for adding files inside a folder (UI-only selection) */}
      <FileUploadDialog
        open={showFolderUploadDialog}
        onOpenChange={(open) => {
          if (!open) {
            setFolderUploadTargetId(null)
          }
          setShowFolderUploadDialog(open)
        }}
        onFilesSelect={(files) => {
          if (folderUploadTargetId) {
            // files is an array of File objects from the dialog
            addFilesToFolderFromArray(folderUploadTargetId, files)
          }
          setShowFolderUploadDialog(false)
          setFolderUploadTargetId(null)
        }}
      />

      {/* New folder modal (simple inline modal) */}
      {showNewFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-medium text-slate-900">Create new folder</h3>
              <button onClick={() => { setShowNewFolder(false); setNewFolderName("") }} className="text-slate-400">×</button>
            </div>

            <div className="mt-4">
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                onKeyDown={(e) => {
                  if (e.key === "Enter") addFolder()
                  if (e.key === "Escape") { setShowNewFolder(false); setNewFolderName("") }
                }}
                autoFocus
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setShowNewFolder(false); setNewFolderName("") }}>
                Cancel
              </Button>
              <Button onClick={addFolder} className="bg-slate-800 text-white hover:bg-slate-900">
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}