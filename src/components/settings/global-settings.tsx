import React, { useState } from 'react';
import { ChevronDown, Settings, ChevronRight, Edit3, Plus, X } from 'lucide-react';

interface AgentMCPManagerProps {
  onClose?: () => void;
}

const AgentMCPManager: React.FC<AgentMCPManagerProps> = ({ onClose }) => {
  const [agents, setAgents] = useState([
    {
      id: 1,
      name: 'Orbital CLI',
      icon: 'O',
      color: 'bg-purple-600',
      expanded: true,
      servers: {
        deepwiki: { enabled: true, tools: 3 },
        github: { enabled: false, tools: 0 },
        gmail: { enabled: true, tools: 8 },
        postgres: { enabled: false, tools: 0 },
        mongodb: { enabled: false, tools: 0 },
        azure: { enabled: false, tools: 0 },
        neo4j: { enabled: false, tools: 0 }
      }
    },
    {
      id: 2,
      name: 'Goose',
      icon: '🪿',
      color: 'bg-orange-500',
      expanded: false,
      servers: {
        deepwiki: { enabled: false, tools: 3 },
        github: { enabled: true, tools: 0 },
        gmail: { enabled: false, tools: 8 },
        postgres: { enabled: true, tools: 0 },
        mongodb: { enabled: false, tools: 0 },
        azure: { enabled: false, tools: 0 },
        neo4j: { enabled: false, tools: 0 }
      }
    },
    {
      id: 3,
      name: 'Claude Code',
      icon: (
        <img
          src="/icons/claude.webp"
          alt="Claude"
          className="w-4 h-4 object-contain"
        />
      ),
      color: 'bg-blue-600',
      expanded: false,
      servers: {
        deepwiki: { enabled: false, tools: 3 },
        github: { enabled: true, tools: 0 },
        gmail: { enabled: false, tools: 8 },
        postgres: { enabled: false, tools: 0 },
        mongodb: { enabled: true, tools: 0 },
        azure: { enabled: true, tools: 0 },
        neo4j: { enabled: false, tools: 0 }
      }
    },
    {
      id: 4,
      name: 'Gemini CLI',
      icon: (
        <img
          src="/icons/google.webp"
          alt="Gemini"
          className="w-4 h-4 object-contain"
        />
      ),
      color: 'bg-green-600',
      expanded: false,
      servers: {
        deepwiki: { enabled: false, tools: 3 },
        github: { enabled: false, tools: 0 },
        gmail: { enabled: true, tools: 8 },
        postgres: { enabled: false, tools: 0 },
        mongodb: { enabled: false, tools: 0 },
        azure: { enabled: false, tools: 0 },
        neo4j: { enabled: true, tools: 0 }
      }
    }
  ]);

  const serverConfigs = {
    deepwiki: {
      name: 'DeepWiki',
      icon: <img src="/icons/deepwiki.png" alt="DeepWiki" className="w-4 h-4 object-contain" />
    },
    github: {
      name: 'GitHub',
      icon: (
        <img
          src="/icons/github-original.svg"
          alt="GitHub"
          className="w-4 h-4 object-contain"
        />
      )
    },
    gmail: {
      name: 'Gmail',
      icon: (
        <img
          src="/icons/google.webp"
          alt="Gmail"
          className="w-4 h-4 object-contain"
        />
      )
    },
    postgres: {
      name: 'Postgres',
      icon: (
        <img
          src="/icons/postgresql-original.svg"
          alt="Postgres"
          className="w-4 h-4 object-contain"
        />
      )
    },
    mongodb: {
      name: 'MongoDB',
      icon: (
        <img
          src="/icons/mongodb-original.svg"
          alt="MongoDB"
          className="w-4 h-4 object-contain"
        />
      )
    },
    azure: {
      name: 'Azure',
      icon: (
        <img
          src="/icons/azure-original.svg"
          alt="Azure"
          className="w-4 h-4 object-contain"
        />
      )
    },
    neo4j: {
      name: 'Neo4j',
      icon: (
        <img
          src="/icons/neo4j.png"
          alt="Neo4j"
          className="w-4 h-4 object-contain"
        />
      )
    }
  };

  const toggleAgent = (agentId: number) => {
    setAgents((agents) =>
      agents.map((agent) =>
        agent.id === agentId ? { ...agent, expanded: !agent.expanded } : agent
      )
    );
  };

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
                  enabled: !agent.servers[serverKey].enabled
                }
              }
            }
          : agent
      )
    );
  };

  const getEnabledCount = (agent: typeof agents[0]) => {
    return Object.values(agent.servers).filter((server: any) => server.enabled).length;
  };

  return (
    <div className="absolute inset-0 flex flex-col h-full w-full bg-white rounded-none shadow-none z-50">
      <div className="bg-gray-100 px-4 py-2 flex items-center justify-between border-b flex-shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-400 rounded flex items-center justify-center border border-gray-300">
            <Settings className="w-4 h-4 flex-shrink-0" />
          </div>
          {/* Changed font-semibold to font-medium and added text-sm */}
          <span className="font-medium text-sm text-gray-800">MCP Agent Manager</span>
        </div>
        <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className="flex border-b bg-gray-50 flex-shrink-0">
        {/* Changed text-sm to text-xs, font-medium to font-normal, py-3 to py-2 */}
        <button className="flex-1 px-4 py-2 text-xs font-normal text-gray-900 border-b-2 border-blue-500 bg-white">
          Agents
        </button>
        {/* Changed text-sm to text-xs, font-medium to font-normal, py-3 to py-2 */}
        <button className="flex-1 px-4 py-2 text-xs font-normal text-gray-500 hover:text-gray-700">
          Global Settings
        </button>
      </div>

      <div className="px-4 py-3 border-b bg-gray-50 flex-shrink-0">
        <div className="flex items-center justify-between">
          {/* Changed text-lg to text-base and font-semibold to font-medium */}
          <h2 className="text-base font-medium text-gray-900">AI Agents</h2>
          {/* Changed text-sm to text-xs and font-medium to font-normal */}
          <button className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 font-normal">
            <Plus size={14} /> {/* Reduced icon size to match font */}
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
                  <button
                    onClick={() => toggleAgent(agent.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {agent.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  <div className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-300">
                    <span className="text-xs">{agent.icon}</span>
                  </div>
                  <div>
                    {/* Changed font-medium to font-normal and added text-sm */}
                    <div className="font-normal text-sm text-gray-900">{agent.name}</div>
                    <div className="text-xs text-gray-500">
                      {getEnabledCount(agent)} MCP servers enabled
                    </div>
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
                          {/* Changed text-sm to text-xs and font-medium to font-normal */}
                          <div className="text-xs font-normal text-gray-800">{serverConfig.name}</div>
                          {agent.servers[serverKey].tools > 0 && (
                            <div className="text-xs text-gray-500">
                              Tools: {agent.servers[serverKey].tools}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleServerForAgent(agent.id, serverKey)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            agent.servers[serverKey].enabled ? 'bg-black' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                              agent.servers[serverKey].enabled ? 'translate-x-5' : 'translate-x-1'
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
    </div>
  );
};

export default AgentMCPManager;
