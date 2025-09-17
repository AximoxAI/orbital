
import { useState } from "react"
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

const templates = [
  {
    id: "agile",
    icon: <RotateCcw className="w-6 h-6 text-indigo-500 bg-indigo-100 rounded-md p-1" />,
    title: "Agile Sprint Board",
    description: "Manage tasks through sprints with a Kanban-style board for backlog, in-progress, and completed work.",
    version: "1.2",
    systemPrompt: "You are a project manager AI. Structure the following tasks into a sprint plan.",
    userPrompt: "Tasks for next sprint: User authentication feature, API documentation, fix login bug.",
  },
  {
    id: "waterfall",
    icon: <FileText className="w-6 h-6 text-blue-500 bg-blue-100 rounded-md p-1" />,
    title: "Waterfall Project Plan",
    description: "A sequential project plan for traditional SDLC, covering phases from requirements to deployment.",
    version: "1.0",
    systemPrompt: "You are an SDLC assistant AI. Organize requirements through deployment as a waterfall plan.",
    userPrompt: "Requirements: Login, onboarding, product listing, checkout, deployment.",
  },
  {
    id: "bug",
    icon: <Bug className="w-6 h-6 text-red-500 bg-red-100 rounded-md p-1" />,
    title: "Bug Tracking",
    description: "Prioritize, assign, and track software bugs from report to resolution with this dedicated template.",
    version: "1.1",
    systemPrompt: "You are a bug tracking AI. Help triage, assign, and track bugs.",
    userPrompt: "Bugs: Login fails on Safari, search crashes, missing translations.",
  },
  {
    id: "spec",
    icon: <FileCode className="w-6 h-6 text-green-600 bg-green-100 rounded-md p-1" />,
    title: "Technical Specification",
    description: "Outline the architecture, data models, and implementation details for a new feature or system.",
    version: "1.0",
    systemPrompt: "You are a technical spec AI. Outline architecture, data models, and implementation details.",
    userPrompt: "Feature: Real-time notifications. Stack: React, Node.js, WebSocket.",
  },
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
  const [popupTemplate, setPopupTemplate] = useState<null | typeof templates[0]>(null)
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

  const filteredTemplates = templates.filter((tpl) => {
    const matchesCategory =
      selectedCategory === "all" ||
      tpl.title.toLowerCase().includes(selectedCategory) ||
      tpl.description.toLowerCase().includes(selectedCategory)
    const matchesSearch =
      tpl.title.toLowerCase().includes(search.toLowerCase()) ||
      tpl.description.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Handles opening the popup and sets default values for the prompts
  const handleUseTemplate = (tpl: typeof templates[0]) => {
    setPopupTemplate(tpl)
    setSystemPrompt(tpl.systemPrompt)
    setUserPrompt(tpl.userPrompt)
  }

  // Controlled create template dialog field changes
  const handleCreateTemplateChange = (field: string, val: string) => {
    setCreateTemplateFields((prev) => ({
      ...prev,
      [field]: val,
    }))
  }

  // Simulated API-save for new template (replace with real API later)
  const handleCreateTemplateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowCreateTemplate(false)
    // TODO: call API to save template
    setCreateTemplateFields({
      title: "",
      version: "1.0",
      description: "",
      systemPrompt: "",
      userPrompt: "",
    })
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
          {/* Header + Create button in same row */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">SDLC Templates</h1>
            <Button
              className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700"
              onClick={() => setShowCreateTemplate(true)}
              data-testid="create-template-btn"
            >
              + Create New Template
            </Button>
          </div>
          {/* Search bar, category buttons */}
          <div className="flex items-center justify-between mb-8">
            <Input
              className="w-72"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex items-center gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat.key}
                  variant={selectedCategory === cat.key ? "default" : "outline"}
                  className={`px-4 py-1 text-sm rounded-full ${selectedCategory === cat.key ? "bg-indigo-600 text-white" : ""}`}
                  onClick={() => setSelectedCategory(cat.key)}
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredTemplates.map((tpl) => (
              <Card
                key={tpl.id}
                className="px-6 py-7 flex flex-col items-start rounded-xl shadow-sm bg-white hover:shadow-md transition-shadow"
              >
                <div className="mb-4">{tpl.icon}</div>
                <div className="font-semibold text-gray-900 mb-2 text-[17px]">{tpl.title}</div>
                <div className="mb-6 text-gray-600 text-sm">{tpl.description}</div>
                <Button
                  variant="outline"
                  className="w-full font-medium bg-transparent"
                  onClick={() => handleUseTemplate(tpl)}
                >
                  Use Template
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Edit Template Dialog */}
        <Dialog open={!!popupTemplate} onOpenChange={(open) => !open && setPopupTemplate(null)}>
          <DialogContent className="max-w-xl w-full p-0">
            {popupTemplate && (
              <form
                onSubmit={e => {
                  e.preventDefault()
                  // handle save here
                  setPopupTemplate(null)
                }}
              >
                <DialogHeader className="px-6 pt-6">
                  <DialogTitle className="text-xl font-semibold mb-1">
                    Edit: {popupTemplate.title}
                  </DialogTitle>
                  <div className="text-sm text-gray-500 mb-2">
                    Version {popupTemplate.version}
                  </div>
                </DialogHeader>
                <div className="px-6 pb-2">
                  <div className="mb-4">
                    <div className="font-medium text-sm mb-1">System Prompt</div>
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
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">
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
            <form
              onSubmit={handleCreateTemplateSubmit}
            >
              <DialogHeader className="px-6 pt-6">
                <DialogTitle className="text-xl font-semibold mb-1">
                  Create New Template
                </DialogTitle>
                <div className="text-sm text-gray-500 mb-2">
                  Fill in the details to create a new template.
                </div>
              </DialogHeader>
              <div className="px-6 pb-2">
                <div className="mb-4">
                  <div className="font-medium text-sm mb-1">Template Name</div>
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
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">
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