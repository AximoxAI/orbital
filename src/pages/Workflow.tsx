import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "@/components/Sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { RotateCcw, FileText, Bug, FileCode, X } from "lucide-react"
import TopBar from "@/components/Topbar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { TemplatesApi, Configuration } from "@/api-client"

const BACKEND_API_URL =
  import.meta.env.VITE_BACKEND_API_KEY

const ICON_COLORS = [
  "bg-indigo-100 text-indigo-500",
  "bg-green-100 text-green-600",
  "bg-orange-100 text-orange-600",
  "bg-pink-100 text-pink-500",
]

const ICONS = [
  <RotateCcw className="w-5 h-5" />,
  <FileText className="w-5 h-5" />,
  <Bug className="w-5 h-5" />,
  <FileCode className="w-5 h-5" />,
]

const categories = [
  { key: "all", label: "All" },
  { key: "agile", label: "Agile" },
  { key: "waterfall", label: "Waterfall" },
  { key: "devops", label: "DevOps" },
  { key: "qa", label: "QA" },
]

const Workflow = () => {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [templates, setTemplates] = useState<Array<any>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [popupTemplate, setPopupTemplate] = useState<null | any>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editVersion, setEditVersion] = useState("1.0")
  const [editDescription, setEditDescription] = useState("")
  const [systemPrompt, setSystemPrompt] = useState("")
  const [userPrompt, setUserPrompt] = useState("")
  const [editTags, setEditTags] = useState<string[]>([])
  const [editTagsInput, setEditTagsInput] = useState("")
  const [showCreateTemplate, setShowCreateTemplate] = useState(false)
  const [createTemplateFields, setCreateTemplateFields] = useState({
    title: "",
    version: "1.0",
    description: "",
    systemPrompt: "",
    userPrompt: "",
    tags: [] as string[],
  })
  const [tagsInput, setTagsInput] = useState("")
  const navigate = useNavigate()
  const [bottomSearch, setBottomSearch] = useState("")

  useEffect(() => {
    setLoading(true)
    setError(null)
    const api = new TemplatesApi(
      new Configuration({ basePath: BACKEND_API_URL })
    )
    api
      .templatesControllerFindAll()
      .then(res => setTemplates(res.data))
      .catch(e => setError(e?.message || "Failed to load templates"))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (popupTemplate) {
      setEditTags(popupTemplate.tags || [])
      setEditTagsInput("")
      setSystemPrompt(popupTemplate.systemPrompt)
      setUserPrompt(popupTemplate.userPrompt)
      setEditTitle(popupTemplate.title || "")
      setEditVersion(popupTemplate.version || "1.0")
      setEditDescription(popupTemplate.description || "")
    }
  }, [popupTemplate])

  const filteredTemplates = templates.filter((tpl) => {
    const lowerCat = selectedCategory.toLowerCase();
    let matchesCategory =
      selectedCategory === "all" ||
      (tpl.tags && tpl.tags.some((tag: string) => tag.toLowerCase() === lowerCat));
    let matchesSearch =
      !bottomSearch ||
      (tpl.tags && tpl.tags.some((tag: string) => tag.toLowerCase().includes(bottomSearch.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  const handleUseTemplate = (tpl: any) => {
    setPopupTemplate(tpl)
  }

  const handleCreateTemplateChange = (field: string, val: string) => {
    setCreateTemplateFields((prev) => ({
      ...prev,
      [field]: val,
    }))
  }

  const handleAddTag = () => {
    const tagsArray = tagsInput.split(",").map(t => t.trim()).filter(t => t)
    if (tagsArray.length) {
      setCreateTemplateFields(prev => ({
        ...prev,
        tags: Array.from(new Set([...prev.tags, ...tagsArray]))
      }))
      setTagsInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setCreateTemplateFields(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const handleEditTagAdd = () => {
    const tagsArray = editTagsInput.split(",").map(t => t.trim()).filter(t => t)
    if (tagsArray.length) {
      setEditTags(prev => Array.from(new Set([...prev, ...tagsArray])))
      setEditTagsInput("")
    }
  }

  const handleEditTagRemove = (tag: string) => {
    setEditTags(prev => prev.filter(t => t !== tag))
  }

  const handleCreateTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const api = new TemplatesApi(
        new Configuration({ basePath: BACKEND_API_URL })
      )
      const payload = { ...createTemplateFields }
      await api.templatesControllerCreate(payload)
      const res = await api.templatesControllerFindAll()
      setTemplates(res.data)
      setShowCreateTemplate(false)
      setCreateTemplateFields({
        title: "",
        version: "1.0",
        description: "",
        systemPrompt: "",
        userPrompt: "",
        tags: [],
      })
      setTagsInput("")
    } catch (err: any) {
      setError(err?.message || "Failed to create template")
    } finally {
      setLoading(false)
    }
  }

  const handleEditTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!popupTemplate) return
    setLoading(true)
    setError(null)
    try {
      const api = new TemplatesApi(
        new Configuration({ basePath: BACKEND_API_URL })
      )
      await api.templatesControllerUpdate(popupTemplate.id, {
        title: editTitle,
        version: editVersion,
        description: editDescription,
        systemPrompt,
        userPrompt,
        tags: editTags,
      })
      const res = await api.templatesControllerFindAll()
      setTemplates(res.data)
      setPopupTemplate(null)
    } catch (err: any) {
      setError(err?.message || "Failed to update template")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar
          searchValue={search}
          setSearchValue={setSearch}
          placeholder="Search"
          showLogout={true}
          className="mb-4"
        />
        <div className="flex flex-col flex-1 max-w-7xl mx-auto w-full pt-4 px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Workflows</h1>
            <Button
              className="font-semibold px-4 py-2 rounded-lg shadow-sm bg-slate-700 text-white hover:bg-slate-800"
              onClick={() => setShowCreateTemplate(true)}
              data-testid="create-template-btn"
            >
              + Workflow
            </Button>
          </div>
          <div className="flex items-center justify-between mb-8">
            <Input
              className="w-72"
              placeholder="Search templates by tag..."
              value={bottomSearch}
              onChange={(e) => setBottomSearch(e.target.value)}
            />
            <div className="flex items-center gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat.key}
                  variant={selectedCategory === cat.key ? "default" : "outline"}
                  className={`px-4 py-1 text-sm rounded-full ${selectedCategory === cat.key ? "bg-slate-700 text-white hover:bg-slate-800" : ""}`}
                  onClick={() => setSelectedCategory(cat.key)}
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>
          {error && <div className="mb-4 text-red-500">{error}</div>}
          {loading ? (
            <div className="flex justify-center items-center h-32 text-gray-700">Loading Workflows...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {filteredTemplates.map((tpl, idx) => (
                <Card
                  key={tpl.id}
                  className="px-6 py-7 flex flex-col items-start rounded-xl shadow-sm bg-white hover:shadow-md transition-shadow"
                >
                  <div className="mb-4">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-md shadow-sm text-base ${ICON_COLORS[idx % ICON_COLORS.length]}`}>
                      {ICONS[idx % ICONS.length]}
                    </span>
                  </div>
                  <div className="font-semibold text-gray-900 mb-2 text-[17px]">{tpl.title}</div>
                  <div className="mb-2 text-gray-600 text-sm">{tpl.description}</div>
                  {tpl.tags && tpl.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-5">
                      {tpl.tags.map((tag: string) => (
                        <span key={tag} className="bg-gray-200 text-xs px-2 py-1 rounded">{tag}</span>
                      ))}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full font-medium bg-transparent "
                    onClick={() => handleUseTemplate(tpl)}
                  >
                    Edit Workflow
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
        <Dialog open={!!popupTemplate} onOpenChange={(open) => !open && setPopupTemplate(null)}>
          <DialogContent className="max-w-xl w-full p-0 max-h-[500px] overflow-y-scroll">
            {popupTemplate && (
              <form onSubmit={handleEditTemplateSubmit}>
                <DialogHeader className="px-6 pt-8">
                  <DialogTitle className="text-xl font-semibold mb-1">
                    Edit: {popupTemplate.title}
                  </DialogTitle>
                  <div className="text-sm text-gray-500 mb-2 mt-2">
                    Version {popupTemplate.version}
                  </div>
                </DialogHeader>
                <div className="px-6 pb-2">
                  <div className="mb-4">
                    <div className="font-medium text-sm mb-1">Template Name</div>
                    <Input
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <div className="font-medium text-sm mb-1">Version</div>
                    <Input
                      value={editVersion}
                      onChange={e => setEditVersion(e.target.value)}
                    />
                  </div>
                  <div className="mb-4">
                    <div className="font-medium text-sm mb-1">Description</div>
                    <Textarea
                      value={editDescription}
                      onChange={e => setEditDescription(e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {editTags.map((tag) => (
                      <span key={tag} className="bg-gray-200 px-2 py-1 rounded flex items-center text-sm">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleEditTagRemove(tag)}
                          className="ml-1 text-gray-500 "
                        ><X size={14}/></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Add tags (comma separated)"
                      value={editTagsInput}
                      onChange={e => setEditTagsInput(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="button" onClick={handleEditTagAdd} className="bg-slate-50 hover:bg-slate-50 border-[2px] text-slate-800">Add</Button>
                  </div>
                  <div>
                    <div className="font-medium text-sm mb-1"> Prompt</div>
                    <Textarea
                      value={userPrompt}
                      onChange={e => setUserPrompt(e.target.value)}
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                </div>
                <DialogFooter className="px-6 pb-6 flex justify-end gap-2">
                  <DialogClose asChild>
                    <Button type="button" variant="outline" className=" text-slate-800">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" className="bg-slate-800 text-white hover:bg-slate-900">
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
        <Dialog open={showCreateTemplate} onOpenChange={setShowCreateTemplate}>
          <DialogContent className="max-w-xl overflow-y-scroll w-full max-h-[500px] p-0">
            <form onSubmit={handleCreateTemplateSubmit}>
              <DialogHeader className="px-6 pt-6">
                <DialogTitle className="text-xl font-semibold mb-1">
                  Create New Template
                </DialogTitle>
                <div className="text-sm text-gray-500 mb-2 mt-2">
                  Fill in the details to create a new template.
                </div>
              </DialogHeader>
              <div className="px-6 pb-2">
                <div className="mb-4">
                  <div className="font-medium text-sm mb-6">Template Name</div>
                  <Input
                    value={createTemplateFields.title}
                    onChange={e => handleCreateTemplateChange("title", e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <div className="font-medium text-sm mb-1">Version</div>
                  <Input
                    value={createTemplateFields.version}
                    onChange={e => handleCreateTemplateChange("version", e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <div className="font-medium text-sm mb-1">Description</div>
                  <Textarea
                    value={createTemplateFields.description}
                    onChange={e => handleCreateTemplateChange("description", e.target.value)}
                    rows={2}
                  />
                </div>
                
                <div className="mb-4">
                  <div className="font-medium text-sm mb-1"> Prompt</div>
                  <Textarea
                    value={createTemplateFields.userPrompt}
                    onChange={e => handleCreateTemplateChange("userPrompt", e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="mb-4">
                  <div className="font-medium text-sm mb-1">Tags</div>
                  <div className="flex gap-2 flex-wrap mb-2">
                    {createTemplateFields.tags.map(tag => (
                      <span key={tag} className="bg-gray-200 px-2 py-1 rounded flex items-center text-sm">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-gray-500 "
                        ><X size={14}/></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tags (comma separated)"
                      value={tagsInput}
                      onChange={e => setTagsInput(e.target.value)}
                      className="flex-1"
                      data-testid="tags-input"
                    />
                    <Button type="button" className="bg-slate-50 hover:bg-slate-50 border-[2px] text-slate-800" onClick={handleAddTag}>Add</Button>
                  </div>
                </div>
              </div>
              <DialogFooter className="px-6 pb-6 flex justify-end gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline" className=" text-slate-800">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" className="bg-slate-800 text-white hover:bg-slate-900">
                  Create Template
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default Workflow