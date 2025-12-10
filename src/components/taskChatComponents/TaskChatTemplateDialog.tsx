import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { TemplatesApi, Configuration } from "@/api-client"

const BACKEND_API_URL =
  import.meta.env. VITE_BACKEND_API_KEY || "https://your-backend-url.com/api"

const TaskChatTemplateDialog = ({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (templateId: string, templateName: string) => void
}) => {
  const [templates, setTemplates] = useState<Array<any>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (! open) return
    setLoading(true)
    setError(null)
    const api = new TemplatesApi(new Configuration({ basePath: BACKEND_API_URL }))
    api
      . templatesControllerFindAll()
      .then((res) => setTemplates(res.data))
      .catch((err) => setError(err?. message || "Failed to load templates"))
      .finally(() => setLoading(false))
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full p-0">
        <DialogHeader className="px-6 pt-8 pb-2">
          <DialogTitle className="text-2xl font-semibold">
            Select a Template
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 py-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {loading && (
            <div className="col-span-2 text-gray-500 text-center">
              Loading templates...
            </div>
          )}
          {error && (
            <div className="col-span-2 text-red-600 text-center">
              {error}
            </div>
          )}
          {! loading && !error && templates.length === 0 && (
            <div className="col-span-2 text-gray-400 text-center">
              No templates found. 
            </div>
          )}
          {templates.map((tpl) => (
            <Card
              key={tpl.id}
              onClick={() => onSelect(tpl. id, tpl.title || tpl.name || "Template")}
              className="cursor-pointer p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
              tabIndex={0}
            >
              <div className="font-semibold text-gray-900 mb-1">
                {tpl.title}
              </div>
              <div className="text-gray-600 text-sm">{tpl.description}</div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TaskChatTemplateDialog