import React from "react"
import { Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TaskSuggestionType } from "./types"

export const TaskSuggestion = ({ taskSuggestion, isFullPage }: { taskSuggestion: TaskSuggestionType; isFullPage: boolean }) => (
  <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <h4 className="text-sm font-semibold text-blue-900 mb-1 font-inter">Task Suggestion</h4>
        <p className="text-sm text-blue-800 font-medium mb-2 font-inter">{taskSuggestion.name}</p>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="text-xs bg-white border-blue-300 text-blue-700 font-medium font-inter">
            {taskSuggestion.priority} priority
          </Badge>
          <span className="text-xs text-blue-600 font-medium font-inter">{taskSuggestion.project}</span>
        </div>
      </div>
      <Button
        size="sm"
        className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-md transition-all duration-200 font-medium font-inter"
      >
        <Plus className="w-4 h-4 mr-1" />
        Create
      </Button>
    </div>
  </div>
)