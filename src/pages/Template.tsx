import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "@/components/Sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { RotateCcw, FileText, Bug, FileCode } from "lucide-react"
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

const Template = () => {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const [templates, setTemplates] = useState<Array<any>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [popupTemplate, setPopupTemplate] = useState<null | any>(null)
  const [systemPrompt, setSystemPrompt] = useState("")
  const [userPrompt, setUserPrompt] = useState("")
  const [showCreateTemplate, setShowCreateTemplate] = useState(false)
  const [createTemplateFields, setCreateTemplateFields] = useState({
    title: "",
    version: "1.0",
    description: "",
    systemPrompt: "",
    userPrompt: "",
  })
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

  const filteredTemplates = templates.filter((tpl) => {
    const lowerCat = selectedCategory.toLowerCase()
    const matchesCategory =
      selectedCategory === "all" ||
      tpl.title?.toLowerCase().includes(lowerCat) ||
      tpl.description?.toLowerCase().includes(lowerCat)
    const matchesSearch =
      tpl.title?.toLowerCase().includes(bottomSearch.toLowerCase()) ||
      tpl.description?.toLowerCase().includes(bottomSearch.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleUseTemplate = (tpl: any) => {
    setPopupTemplate(tpl)
    setSystemPrompt(tpl.systemPrompt)
    setUserPrompt(tpl.userPrompt)
  }

  const handleCreateTemplateChange = (field: string, val: string) => {
    setCreateTemplateFields((prev) => ({
      ...prev,
      [field]: val,
    }))
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
      })
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
        systemPrompt,
        userPrompt,
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
            <h1 className="text-2xl font-bold text-gray-900">SDLC Templates</h1>
            <Button
              className="font-semibold px-4 py-2 rounded-lg shadow-sm bg-slate-700 text-white hover:bg-slate-800"
              onClick={() => setShowCreateTemplate(true)}
              data-testid="create-template-btn"
            >
              + Create New Template
            </Button>
          </div>
          <div className="flex items-center justify-between mb-8">
            <Input
              className="w-72"
              placeholder="Search templates..."
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
            <div className="flex justify-center items-center h-32 text-gray-700">Loading templates...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {filteredTemplates.map((tpl, idx) => (
                <Card
                  key={tpl.id}
                  className="px-6 py-7 flex flex-col items-start rounded-xl shadow-sm bg-white hover:shadow-md transition-shadow"
                >
                  <div className="mb-4">
                    {/* Pick icon and color by index, cycles through ICONS and ICON_COLORS arrays */}
                    <span className={`w-8 h-8 flex items-center justify-center rounded-md shadow-sm text-base ${ICON_COLORS[idx % ICON_COLORS.length]}`}>
                      {ICONS[idx % ICONS.length]}
                    </span>
                  </div>
                  <div className="font-semibold text-gray-900 mb-2 text-[17px]">{tpl.title}</div>
                  <div className="mb-6 text-gray-600 text-sm">{tpl.description}</div>
                  <Button
                    variant="outline"
                    className="w-full font-medium bg-transparent "
                    onClick={() => handleUseTemplate(tpl)}
                  >
                    Edit Template
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Edit Template Dialog */}
        <Dialog open={!!popupTemplate} onOpenChange={(open) => !open && setPopupTemplate(null)}>
          <DialogContent className="max-w-xl w-full p-0">
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
                    <div className="font-medium text-sm mb-8">System Prompt</div>
                    <Textarea
                      value={systemPrompt}
                      onChange={e => setSystemPrompt(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                  <div>
                    <div className="font-medium text-sm mb-1">User Prompt</div>
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

        {/* Create New Template Dialog */}
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
                    required
                  />
                </div>
                <div className="mb-4">
                  <div className="font-medium text-sm mb-1">Description</div>
                  <Textarea
                    value={createTemplateFields.description}
                    onChange={e => handleCreateTemplateChange("description", e.target.value)}
                    rows={2}
                    required
                  />
                </div>
                <div className="mb-4">
                  <div className="font-medium text-sm mb-1">System Prompt</div>
                  <Textarea
                    value={createTemplateFields.systemPrompt}
                    onChange={e => handleCreateTemplateChange("systemPrompt", e.target.value)}
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <div className="font-medium text-sm mb-1">User Prompt</div>
                  <Textarea
                    value={createTemplateFields.userPrompt}
                    onChange={e => handleCreateTemplateChange("userPrompt", e.target.value)}
                    rows={2}
                    required
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

export default Template