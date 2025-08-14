export interface TaskExecutionLog {
    id: string
    timestamp: string
    type: string
    status: string
    content: string
  }
  
  export interface TaskSuggestionType {
    name: string
    priority: string
    project: string
  }
  
  export interface MessageType {
    id: string
    timestamp?: string
    type: "ai" | "human" | "system"
    content: string
    status?: string
    isCode?: boolean
    taskSuggestion?: TaskSuggestionType
  }