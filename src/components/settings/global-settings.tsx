import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Edit3, Plus, X } from 'lucide-react';

const AgentMCPManager = () => {
  const [agents, setAgents] = useState([
    {
      id: 1,
      name: 'Orbital CLI',
      icon: '🚀',
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
      icon: '🤖',
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
      icon: '💎',
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
    deepwiki: { name: 'DeepWiki', icon: '🧩', color: 'bg-purple-500' },
    github: { name: 'GitHub', icon: '⚫', color: 'bg-gray-800' },
    gmail: { name: 'Gmail', icon: '📧', color: 'bg-red-500' },
    postgres: { name: 'Postgres', icon: '🐘', color: 'bg-blue-700' },
    mongodb: { name: 'MongoDB', icon: '🍃', color: 'bg-green-600' },
    azure: { name: 'Azure', icon: '☁️', color: 'bg-blue-500' },
    neo4j: { name: 'Neo4j', icon: '🔗', color: 'bg-teal-600' }
  };

  const toggleAgent = (agentId) => {
    setAgents(agents.map(agent => 
      agent.id === agentId ? { ...agent, expanded: !agent.expanded } : agent
    ));
  };

  const toggleServerForAgent = (agentId, serverKey) => {
    setAgents(agents.map(agent => 
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
    ));
  };

  const getEnabledCount = (agent) => {
    return Object.values(agent.servers).filter(server => server.enabled).length;
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-100 px-4 py-3 flex items-center justify-between border-b">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-400 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">📎</span>
          </div>
          <span className="font-semibold text-gray-800">Settings</span>
        </div>
        <button className="text-gray-500 hover:text-gray-700">
          <X size={20} />
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b bg-gray-50">
        <button className="flex-1 px-4 py-3 text-sm font-medium text-gray-900 border-b-2 border-blue-500 bg-white">
          Agents
        </button>
        <button className="flex-1 px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700">
          Global Settings
        </button>
      </div>

      {/* Agents Section Header */}
      <div className="px-4 py-3 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">AI Agents</h2>
          <button className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
            <Plus size={16} />
            <span>Add Agent</span>
          </button>
        </div>
      </div>

      {/* Agent List */}
      <div className="max-h-96 overflow-y-auto">
        {agents.map((agent) => (
          <div key={agent.id} className="border-b border-gray-100">
            {/* Agent Header */}
            <div className="px-4 py-3 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => toggleAgent(agent.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {agent.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  <div className={`w-6 h-6 ${agent.color} rounded flex items-center justify-center`}>
                    <span className="text-white text-xs">{agent.icon}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{agent.name}</div>
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

            {/* MCP Servers for this Agent */}
            {agent.expanded && (
              <div className="bg-gray-50">
                {Object.entries(serverConfigs).map(([serverKey, serverConfig]) => (
                  <div key={serverKey} className="px-8 py-2 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 ${serverConfig.color} rounded flex items-center justify-center`}>
                          <span className="text-white text-xs">{serverConfig.icon}</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-800">{serverConfig.name}</div>
                          {agent.servers[serverKey].tools > 0 && (
                            <div className="text-xs text-gray-500">
                              Tools: {agent.servers[serverKey].tools}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {/* Toggle Switch */}
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