import React, { useState } from "react"
import { Search, ChevronDown, MoreHorizontal, Book, ChevronLeft, ChevronRight, Github, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AgentMCPManager from "../settings/global-settings"

interface LeftPanelProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

const LeftPanel: React.FC<LeftPanelProps> = ({ collapsed, onToggleCollapse }) => {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className="relative flex flex-col h-full bg-white border-r border-gray-200">
      {/* Main LeftPanel Content */}
      <div className={`flex flex-col h-full transition-all duration-300 ease-in-out ${collapsed ? "w-16" : "w-80"}`}>
        {/* Header with logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">O</span>
            </div>
            {!collapsed && <span className="font-semibold text-gray-800 truncate">Orbital</span>}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 flex flex-col p-4 space-y-6 overflow-hidden">
          {/* Search bar */}
          {!collapsed && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
                placeholder="Search for repos or tasks"
              />
            </div>
          )}

          {/* Recent tasks section */}
          <div className="space-y-3">
            <div className={`flex items-center gap-2 ${collapsed ? "justify-center" : ""}`}>
              {!collapsed && (
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Recent tasks</span>
              )}
              <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </div>

            <div className={`flex items-center bg-gray-50 rounded-lg p-3 gap-3 ${collapsed ? "justify-center" : ""}`}>
              <div className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-indigo-400 bg-white flex-shrink-0">
                <svg height={12} width={12} viewBox="0 0 20 20" className="text-indigo-500">
                  <circle cx={10} cy={10} r={8} stroke="currentColor" strokeWidth={2} fill="none" />
                  <path d="M5 10l3 3 6-6" stroke="currentColor" strokeWidth={2} fill="none" />
                </svg>
              </div>
              {!collapsed && (
                <>
                  <span className="flex-1 text-sm text-gray-800 truncate min-w-0">give me sim... code lo...</span>
                  <MoreHorizontal className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 flex-shrink-0" />
                </>
              )}
            </div>
          </div>

          {/* Codebases section */}
          <div className="space-y-3">
            <div className={`flex items-center gap-2 ${collapsed ? "justify-center" : ""}`}>
              {!collapsed && (
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Codebases</span>
              )}
              <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </div>

            <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
              <Github className="w-5 h-5 text-gray-700 flex-shrink-0" />
              {!collapsed && <span className="text-sm text-gray-700 truncate min-w-0">pranav-94/AlarmClock</span>}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 ">
          <div className={`flex flex-col gap-2`}>
            <Button
              variant="outline"
              className={`flex items-center gap-2 text-indigo-600 border-gray-200 hover:bg-indigo-50 ${collapsed ? "px-0 justify-center" : "flex-1 justify-center"}`}
            >
              <Book className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>Docs</span>}
            </Button>
            <Button
              variant="outline"
              className={`flex items-center gap-2 text-gray-600 border-gray-200 hover:bg-gray-50 ${collapsed ? "px-0 justify-center" : "flex-1 justify-center"}`}
              onClick={() => setShowSettings(true)}
            >
              <Settings className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>Settings</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* Toggle button - positioned outside the main container */}
      {!showSettings && (
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleCollapse}
          className="absolute -right-3 top-6 z-10 w-6 h-6 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-shadow"
          aria-label={collapsed ? "Expand panel" : "Collapse panel"}
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3 text-gray-500" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-gray-500" />
          )}
        </Button>
      )}

      {/* Overlay the Settings Panel */}
      {showSettings && (
        <div
          className="absolute inset-0 z-50 bg-white bg-opacity-95 flex items-center justify-center"
          style={{ minWidth: collapsed ? 64 : 320 }}
        >
          <AgentMCPManager onClose={() => setShowSettings(false)} />
        </div>
      )}
    </div>
  )
}

export default LeftPanel