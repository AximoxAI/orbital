import type React from "react"
import { useState, useEffect } from "react"
import { ChevronDown, Settings, ChevronRight, Edit3, Plus, X } from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

interface AgentMCPManagerProps {
  onClose?: () => void
}

interface ModelConfig {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  temperature: number
  topP: number
  maxTokens: number
  version: string
}

interface AgentConfig {
  id: number
  name: string
  icon: React.ReactNode
  color: string
  expanded: boolean
  servers: {
    deepwiki: { enabled: boolean; tools: number }
    github: { enabled: boolean; tools: number }
    gmail: { enabled: boolean; tools: number }
    postgres: { enabled: boolean; tools: number }
    mongodb: { enabled: boolean; tools: number }
    azure: { enabled: boolean; tools: number }
    neo4j: { enabled: boolean; tools: number }
  }
}

const AgentMCPManager: React.FC<AgentMCPManagerProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<"agents" | "settings">("agents")
  const [selectedModel, setSelectedModel] = useState<string>("chatgpt")
  const [selectedAgent, setSelectedAgent] = useState<number>(1)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setHasChanges(false)
  }, [selectedModel])

  const [agents, setAgents] = useState<AgentConfig[]>([
    {
      id: 1,
      name: "Orbital CLI",
      icon: "O",
      color: "bg-purple-600",
      expanded: true,
      servers: {
        deepwiki: { enabled: true, tools: 3 },
        github: { enabled: false, tools: 0 },
        gmail: { enabled: true, tools: 8 },
        postgres: { enabled: false, tools: 0 },
        mongodb: { enabled: false, tools: 0 },
        azure: { enabled: false, tools: 0 },
        neo4j: { enabled: false, tools: 0 },
      },
    },
    {
      id: 2,
      name: "Goose",
      icon: "🪿",
      color: "bg-orange-500",
      expanded: false,
      servers: {
        deepwiki: { enabled: false, tools: 3 },
        github: { enabled: true, tools: 0 },
        gmail: { enabled: false, tools: 8 },
        postgres: { enabled: true, tools: 0 },
        mongodb: { enabled: false, tools: 0 },
        azure: { enabled: false, tools: 0 },
        neo4j: { enabled: false, tools: 0 },
      },
    },
    {
      id: 3,
      name: "Claude Code",
      icon: <img src="/icons/claude.webp" alt="Claude" className="w-4 h-4 object-contain" />,
      color: "bg-blue-600",
      expanded: false,
      servers: {
        deepwiki: { enabled: false, tools: 3 },
        github: { enabled: true, tools: 0 },
        gmail: { enabled: false, tools: 8 },
        postgres: { enabled: false, tools: 0 },
        mongodb: { enabled: true, tools: 0 },
        azure: { enabled: true, tools: 0 },
        neo4j: { enabled: false, tools: 0 },
      },
    },
    {
      id: 4,
      name: "Gemini CLI",
      icon: <img src="/icons/google.webp" alt="Gemini" className="w-4 h-4 object-contain" />,
      color: "bg-green-600",
      expanded: false,
      servers: {
        deepwiki: { enabled: false, tools: 3 },
        github: { enabled: false, tools: 0 },
        gmail: { enabled: true, tools: 8 },
        postgres: { enabled: false, tools: 0 },
        mongodb: { enabled: false, tools: 0 },
        azure: { enabled: false, tools: 0 },
        neo4j: { enabled: true, tools: 0 },
      },
    },
  ])

  const [models, setModels] = useState<ModelConfig[]>([
    {
      id: "chatgpt",
      name: "ChatGPT",
      icon: <img src="/icons/openai.avif" alt="ChatGPT" className="w-6 h-6 object-contain" />,
      color: "bg-green-600",
      temperature: 0.7,
      topP: 1,
      maxTokens: 2048,
      version: "gpt-4-turbo",
    },
    {
      id: "claude",
      name: "Claude",
      icon: <img src="/icons/claude.webp" alt="Claude" className="w-6 h-6 object-contain" />,
      color: "bg-blue-600",
      temperature: 0.7,
      topP: 0.9,
      maxTokens: 4096,
      version: "claude-3-opus",
    },
    {
      id: "gemini",
      name: "Gemini",
      icon: <img src="/icons/google.webp" alt="Gemini" className="w-6 h-6 object-contain" />,
      color: "bg-yellow-500",
      temperature: 0.7,
      topP: 0.95,
      maxTokens: 4000,
      version: "gemini-2.0-flash",
    },
  ])

  const serverConfigs = {
    deepwiki: {
      name: "DeepWiki",
      icon: <img src="/icons/deepwiki.png" alt="DeepWiki" className="w-4 h-4 object-contain" />,
    },
    github: {
      name: "GitHub",
      icon: <img src="/icons/github-original.svg" alt="GitHub" className="w-4 h-4 object-contain" />,
    },
    gmail: {
      name: "Gmail",
      icon: <img src="/icons/google.webp" alt="Gmail" className="w-4 h-4 object-contain" />,
    },
    postgres: {
      name: "Postgres",
      icon: <img src="/icons/postgresql-original.svg" alt="Postgres" className="w-4 h-4 object-contain" />,
    },
    mongodb: {
      name: "MongoDB",
      icon: <img src="/icons/mongodb-original.svg" alt="MongoDB" className="w-4 h-4 object-contain" />,
    },
    azure: {
      name: "Azure",
      icon: <img src="/icons/azure-original.svg" alt="Azure" className="w-4 h-4 object-contain" />,
    },
    neo4j: {
      name: "Neo4j",
      icon: <img src="/icons/neo4j.png" alt="Neo4j" className="w-4 h-4 object-contain" />,
    },
  }

  const toggleAgent = (agentId: number) => {
    setAgents((agents) =>
      agents.map((agent) => (agent.id === agentId ? { ...agent, expanded: !agent.expanded } : agent)),
    )
  }

  const toggleServerForAgent = (agentId: number, serverKey: string) => {
    setAgents((agents) =>
      agents.map((agent) =>
        agent.id === agentId
          ? {
              ...agent,
              servers: {
                ...agent.servers,
                [serverKey]: {
                  ...agent.servers[serverKey],
                  enabled: !agent.servers[serverKey].enabled,
                },
              },
            }
          : agent,
      ),
    )
  }

  const updateModelConfig = <K extends keyof Omit<ModelConfig, "id" | "name" | "icon" | "color">>(
    modelId: string,
    field: K,
    value: ModelConfig[K],
  ) => {
    setHasChanges(true)
    setModels((models) => models.map((model) => (model.id === modelId ? { ...model, [field]: value } : model)))
  }

  const getEnabledCount = (agent: AgentConfig) => {
    return Object.values(agent.servers).filter((server: { enabled: boolean; tools: number }) => server.enabled).length
  }

  const currentModel = models.find((model) => model.id === selectedModel)
  const currentAgent = agents.find((agent) => agent.id === selectedAgent)

  const handleApplyChanges = () => {
    setHasChanges(false)
  }

  return (
    <div className="absolute inset-0 flex flex-col h-full w-full bg-white rounded-none shadow-none z-50">
      <div className="bg-gray-100 px-4 py-2 flex items-center justify-between border-b flex-shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-400 rounded flex items-center justify-center border border-gray-300">
            <Settings className="w-4 h-4 flex-shrink-0" />
          </div>
          <span className="font-medium text-sm text-gray-800">MCP Agent Manager</span>
        </div>
        <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className="flex border-b bg-gray-50 flex-shrink-0">
        <button
          onClick={() => setActiveTab("agents")}
          className={`flex-1 px-4 py-2 text-xs font-normal ${activeTab === "agents" ? "text-gray-900 border-b-2 border-blue-500 bg-white" : "text-gray-500 hover:text-gray-700"}`}
        >
          Agents
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 px-4 py-2 text-xs font-normal ${activeTab === "settings" ? "text-gray-900 border-b-2 border-blue-500 bg-white" : "text-gray-500 hover:text-gray-700"}`}
        >
          Global Settings
        </button>
      </div>

      {activeTab === "agents" ? (
        <>
          <div className="px-4 py-3 border-b bg-gray-50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium text-gray-900">AI Agents</h2>
              <button className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 font-normal">
                <Plus size={14} />
                <span>Add Agent</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {agents.map((agent) => (
              <div key={agent.id} className="border-b border-gray-100">
                <div className="px-4 py-3 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button onClick={() => toggleAgent(agent.id)} className="text-gray-400 hover:text-gray-600">
                        {agent.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                      <div className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-300">
                        <span className="text-xs">{agent.icon}</span>
                      </div>
                      <div>
                        <div className="font-normal text-sm text-gray-900">{agent.name}</div>
                        <div className="text-xs text-gray-500">{getEnabledCount(agent)} MCP servers enabled</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button className="text-gray-400 hover:text-gray-600">
                        <Edit3 size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {agent.expanded && (
                  <div className="bg-gray-50">
                    {Object.entries(serverConfigs).map(([serverKey, serverConfig]) => (
                      <div key={serverKey} className="px-8 py-2 border-b border-gray-200 last:border-b-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-5 h-5 flex items-center justify-center rounded-full border border-gray-300">
                              {serverConfig.icon}
                            </div>
                            <div>
                              <div className="text-xs font-normal text-gray-800">{serverConfig.name}</div>
                              {agent.servers[serverKey].tools > 0 && (
                                <div className="text-xs text-gray-500">Tools: {agent.servers[serverKey].tools}</div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => toggleServerForAgent(agent.id, serverKey)}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                agent.servers[serverKey].enabled ? "bg-black" : "bg-gray-300"
                              }`}
                            >
                              <span
                                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                  agent.servers[serverKey].enabled ? "translate-x-5" : "translate-x-1"
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="px-4 py-3 border-b bg-gray-50 flex-shrink-0">
            <h2 className="text-base font-medium text-gray-900">Model Configuration</h2>
          </div>

          <div className="px-4 pt-3 pb-3 border-b bg-white flex-shrink-0">
            <label className="block text-xs font-medium text-gray-700 mb-2">Select Agent</label>
            <Select value={String(selectedAgent)} onValueChange={v => setSelectedAgent(Number(v))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent>
                {agents.map(agent => (
                  <SelectItem value={String(agent.id)} key={agent.id}>
                    <div className="flex items-center space-x-2">
                      <span className="w-7 h-6">{agent.icon}</span>
                      <span>{agent.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="px-4 py-6 border-b bg-white flex-shrink-0">
            <label className="block text-xs font-medium text-gray-700 mb-2">Select Model</label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem value={model.id} key={model.id}>
                    <div className="flex items-center space-x-2">
                      <span className="w-7 h-6">{model.icon}</span>
                      <span>{model.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 overflow-y-auto">
            {currentModel && (
              <div className="px-4 py-3">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Model Version</label>
                    <input
                      type="text"
                      value={currentModel.version}
                      onChange={(e) => updateModelConfig(currentModel.id, "version", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., gpt-4-turbo"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label
                        className="text-xs font-medium text-gray-700"
                        id="temperature-label"
                      >
                        Temperature
                      </label>
                      <span
                        className="text-xs font-semibold text-gray-900 bg-gray-100 px-2.5 py-1 rounded"
                        aria-live="polite"
                        aria-atomic="true"
                      >
                        {currentModel.temperature.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={currentModel.temperature}
                      aria-labelledby="temperature-label"
                      onChange={(e) =>
                        updateModelConfig(currentModel.id, "temperature", Number.parseFloat(e.target.value))
                      }
                      className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-xs text-gray-500 mt-2">
                      Controls randomness: 0 is deterministic, 2 is maximum random
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label
                        className="text-xs font-medium text-gray-700"
                        id="top-p-label"
                      >
                        Top P (Nucleus Sampling)
                      </label>
                      <span
                        className="text-xs font-semibold text-gray-900 bg-gray-100 px-2.5 py-1 rounded"
                        aria-live="polite"
                        aria-atomic="true"
                      >
                        {currentModel.topP.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={currentModel.topP}
                      aria-labelledby="top-p-label"
                      onChange={(e) => updateModelConfig(currentModel.id, "topP", Number.parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-xs text-gray-500 mt-2">
                      Controls diversity: 1 means all options, lower values are more focused
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Max Tokens</label>
                    <input
                      type="number"
                      min="1"
                      value={currentModel.maxTokens}
                      onChange={(e) => {
                        const value = Number.parseInt(e.target.value)
                        updateModelConfig(currentModel.id, "maxTokens", value > 0 ? value : 1)
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 2048"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-4 py-3 border-t bg-gray-50 flex-shrink-0">
            <button
              onClick={handleApplyChanges}
              disabled={!hasChanges}
              className={`w-full px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                hasChanges ? "bg-slate-600 text-white hover:bg-slate-700" : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              Apply Changes
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default AgentMCPManager