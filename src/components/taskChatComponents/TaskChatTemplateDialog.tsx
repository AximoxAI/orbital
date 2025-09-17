import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"

const templates = [
  {
    id: "agile",
    title: "Agile Sprint Board",
    description: "Manage tasks through sprints with a Kanban-style board.",
  },
  {
    id: "waterfall",
    title: "Waterfall Project Plan",
    description: "A sequential project plan for traditional SDLC.",
  },
  {
    id: "bug",
    title: "Bug Tracking",
    description: "Prioritize, assign, and track software bugs.",
  },
  {
    id: "spec",
    title: "Technical Specification",
    description:
      "Outline the architecture, data models, and implementation details.",
  },
]

/**
 * Props:
 * - open: boolean
 * - onOpenChange: (open: boolean) => void
 * - onSelect: (templateId: string) => void
 */
const TaskChatTemplateDialog = ({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (templateId: string) => void
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full p-0">
        <DialogHeader className="px-6 pt-8 pb-2">
          <DialogTitle className="text-lg font-semibold">
            Select a Template
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 py-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {templates.map((tpl) => (
            <Card
              key={tpl.id}
              onClick={() => onSelect(tpl.id)}
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