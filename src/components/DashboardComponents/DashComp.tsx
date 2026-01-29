"use client"
import type React from "react"
import { useState, useEffect } from "react"
import {
  LayoutGrid,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  Layers,
  GitCommit,
  Play,
  Bot,
  GitBranch,
  BarChart3,
  LayoutList,
  ArrowRight
} from "lucide-react"

import MetricCard from "./MetricCard"
import {
  DuplicationChart,
  CoverageChart,
  VelocityChart,
  HotspotHeatmap,
  DependencyPieChart,
  RiskTrendChart,
  PrChart,
} from "./Charts"
import MeasuresChart from "./MeasuresChart"
import { KPIS, MIGRATION_DATA, HOTSPOTS } from "@/constants"
import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/Topbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import OrbitalPanel from "@/components/orbitalPanelComponents/OrbitalPanel"
import OrbitalRepoGraph from "../taskChatComponents/Preview"

import { AgentShowcase, AgentDetailView } from "./AgentComponents"

const DashComponent: React.FC = () => {
  const [showOrbitalPanel, setShowOrbitalPanel] = useState(false)
  // FIX: Changed to <string> to prevent type errors blocking the Refactoring tab
  const [activePage, setActivePage] = useState<string>("dashboard")
  const [search, setSearch] = useState("")
  
  const [selectedAgent, setSelectedAgent] = useState<any>(null)
  const [agentViewMode, setAgentViewMode] = useState<'grid' | 'table'>('grid')

  useEffect(() => {
    document.documentElement.classList.remove("dark")
  }, [])

  const handlePageChange = (page: string) => {
    setActivePage(page)
    setSelectedAgent(null)
  }

  const renderContent = () => {
    switch (activePage) {
      case "agents":
        if (selectedAgent) {
          return (
            <AgentDetailView 
              agent={selectedAgent} 
              onBack={() => setSelectedAgent(null)} 
            />
          )
        }
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard 
                name="Total Spent (24h)" 
                value={145.9} 
                previousValue={110} 
                change={32} 
                unit="$" 
                inverse 
              />
              <MetricCard 
                name="Avg Success Rate" 
                value={86.2} 
                previousValue={82} 
                change={4.2} 
                unit="%" 
              />
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">Active Anomalies</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-rose-600">3</span>
                    <span className="text-xs text-rose-500 font-medium bg-rose-50 px-2 py-1 rounded-full">
                      Review Needed
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-2">1 Loop detected, 2 High Latency</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-rose-50 flex items-center justify-center">
                  <AlertTriangle className="text-rose-500" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-slate-50/50 rounded-xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-semibold text-lg text-slate-900">Agent Showcase</h3>
                  <p className="text-sm text-slate-500">Real-time monitoring of your active fleet</p>
                </div>
                <div className="flex gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                   <Button 
                     variant="ghost" 
                     size="sm" 
                     onClick={() => setAgentViewMode('grid')}
                     className={`h-8 px-3 text-xs font-medium ${agentViewMode === 'grid' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                   >
                     <LayoutGrid size={14} className="mr-2" /> Grid
                   </Button>
                   <Button 
                     variant="ghost" 
                     size="sm" 
                     onClick={() => setAgentViewMode('table')}
                     className={`h-8 px-3 text-xs font-medium ${agentViewMode === 'table' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                   >
                     <LayoutList size={14} className="mr-2" /> Table
                   </Button>
                </div>
              </div>
              <AgentShowcase 
                onAgentClick={(agent) => setSelectedAgent(agent)} 
                viewMode={agentViewMode}
              />
            </div>
          </div>
        )

      case "dashboard":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {KPIS.map((kpi, idx) => (
                <MetricCard key={idx} {...kpi} inverse={kpi.name.includes("Debt")} />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-lg text-slate-900">Code Duplication Trends</h3>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100">
                    Monthly View
                  </Badge>
                </div>
                <DuplicationChart />
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col shadow-sm">
                <h3 className="font-semibold text-lg text-slate-900 mb-6">Migration Milestones</h3>
                <div className="flex-1 space-y-6">
                  {MIGRATION_DATA.map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600 font-medium">{item.name}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            item.status === "Completed"
                              ? "bg-emerald-50 text-emerald-600"
                              : item.status === "In Progress"
                                ? "bg-blue-50 text-blue-600"
                                : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            item.status === "Completed" ? "bg-emerald-500" : "bg-blue-500"
                          }`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-lg text-slate-900">Test Coverage Evolution</h3>
                </div>
                <CoverageChart />
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-lg text-slate-900">Legacy Hotspots & Churn</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-2 h-2 rounded-full bg-rose-500"></div> Critical
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div> Warning
                  </div>
                </div>
                <HotspotHeatmap />
              </div>
            </div>
          </>
        )

      case "refactoring":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MetricCard name="Refactoring Velocity" value={24} previousValue={15} change={60} unit="tickets" />
              <MetricCard name="Tech Debt Repaid" value={120} previousValue={80} change={50} unit="hrs" />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-lg text-slate-900">Refactoring Velocity</h3>
                <p className="text-sm text-slate-500">Comparing Human vs AI contributions</p>
              </div>
              <div className="h-72">
                <VelocityChart />
              </div>
            </div>
            <Card className="p-6 bg-white border-slate-200 shadow-sm">
              <h3 className="font-semibold text-lg text-slate-900 mb-4">Top Candidates for Refactoring</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500">
                      <th className="pb-3 pl-2 font-medium">Module</th>
                      <th className="pb-3 font-medium">Complexity</th>
                      <th className="pb-3 font-medium">Coverage</th>
                      <th className="pb-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {HOTSPOTS.filter((h) => h.complexity > 60).map((h, i) => (
                      <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 pl-2 font-medium text-slate-900">{h.name}</td>
                        <td className="py-3 text-rose-600 font-semibold">{h.complexity}</td>
                        <td className="py-3 text-slate-600">{h.coverage}%</td>
                        <td className="py-3">
                          <button
                            onClick={() => setShowOrbitalPanel(true)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Refactor <ArrowRight size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )

      case "dependencies":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-lg text-slate-900 mb-6">Dependency Health Breakdown</h3>
                <DependencyPieChart />
              </div>
              <div className="space-y-6">
                <MetricCard name="Critical Vulnerabilities" value={5} previousValue={8} change={-37.5} inverse />
                <div className="bg-white border border-slate-200 rounded-xl p-6 flex-1 shadow-sm">
                  <h3 className="font-semibold text-lg text-slate-900 mb-4">Outdated Packages</h3>
                  <ul className="space-y-3">
                    {["react-router-dom", "lodash", "moment", "axios"].map((pkg) => (
                      <li
                        key={pkg}
                        className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100"
                      >
                        <span className="text-slate-700 font-medium">{pkg}</span>
                        <span className="text-xs text-amber-600 bg-amber-50 border border-amber-100 px-2 py-1 rounded">
                          Update Available
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )

      case "coverage":
        return (
          <div className="space-y-6">
            <MetricCard name="Global Test Coverage" value={78.4} previousValue={65.2} change={20.24} unit="%" />
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-lg text-slate-900 mb-6">Coverage Evolution</h3>
              <CoverageChart />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-lg text-slate-900 mb-4">Low Coverage Hotspots</h3>
              <p className="text-sm text-slate-500 mb-4">
                Modules with high churn and low coverage require immediate attention.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {HOTSPOTS.filter((h) => h.coverage < 50).map((h, i) => (
                  <div
                    key={i}
                    className="p-4 bg-slate-50 border border-rose-100 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{h.name}</p>
                      <p className="text-xs text-slate-500">Churn: {h.churn}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-rose-600">{h.coverage}%</p>
                      <p className="text-xs text-slate-500">Coverage</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case "measures":
        return (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
                    Reliability & Security Rating
                    <span className="text-slate-400 hover:text-slate-600 cursor-help text-xs bg-slate-100 rounded-full w-5 h-5 flex items-center justify-center" title="Visualizes files by Tech Debt vs Coverage. Size = Lines of Code.">?</span>
                  </h3>
                  <p className="text-sm text-slate-500">Color: Reliability Rating (A-E) | Size: Lines of Code</p>
                </div>
              </div>
              
              <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                <MeasuresChart />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-white shadow-sm border-slate-200">
                <h4 className="font-medium text-slate-900 mb-2">Total Technical Debt</h4>
                <div className="text-2xl font-bold text-slate-800">12d 4h</div>
                <p className="text-xs text-slate-500 mt-1">Accumulated over 3 months</p>
              </Card>
              <Card className="p-6 bg-white shadow-sm border-slate-200">
                <h4 className="font-medium text-slate-900 mb-2">High Risk Files</h4>
                <div className="text-2xl font-bold text-rose-600">2</div>
                <p className="text-xs text-slate-500 mt-1">Rated 'E' with low coverage</p>
              </Card>
              <Card className="p-6 bg-white shadow-sm border-slate-200">
                <h4 className="font-medium text-slate-900 mb-2">New Code Coverage</h4>
                <div className="text-2xl font-bold text-emerald-500">92.4%</div>
                <p className="text-xs text-slate-500 mt-1">Above target (80%)</p>
              </Card>
            </div>
          </div>
        )

      case "risk":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MetricCard name="Rollback Rate" value={1.2} previousValue={2.5} change={-52} unit="%" inverse />
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-slate-500 text-sm font-medium mb-2 uppercase tracking-wider">
                  AI Code Risk Profile
                </h3>
                <div className="flex items-end justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-slate-900">0.5%</span>
                    <span className="text-slate-500 text-lg">Bug Rate</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <span>Low Risk</span>
                  </div>
                </div>
                <p className="text-slate-400 text-xs mt-3">
                  AI-generated code has <span className="text-slate-700 font-semibold">60% fewer bugs</span> than human
                  baseline.
                </p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-lg text-slate-900 mb-6">Incident & Rollback Trends (Human vs AI)</h3>
              <RiskTrendChart />
            </div>
          </div>
        )

      case "prs":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard name="Open PRs" value={18} previousValue={12} change={50} inverse />
              <MetricCard name="Avg Review Time" value={4.5} previousValue={6} change={-25} unit="hrs" inverse />
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-slate-500 text-sm font-medium mb-2 uppercase tracking-wider">AI Contribution</h3>
                <div className="flex items-end justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-slate-900">35%</span>
                    <span className="text-slate-500 text-lg">of Total PRs</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full bg-purple-50 text-purple-600 border border-purple-100">
                    <Bot size={14} />
                    <span>Rising</span>
                  </div>
                </div>
                <p className="text-slate-400 text-xs mt-3">Merged automatically by AI Agents</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg text-slate-900">PR Throughput by Source</h3>
                <div className="flex items-center gap-4 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-sm"></div> Human Open
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-sm"></div> AI Open
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> Human Merged
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-300 rounded-sm"></div> AI Merged
                  </div>
                </div>
              </div>
              <PrChart />
            </div>
          </div>
        )

      case "graph":
        return (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-lg text-slate-900 mb-6">Repository Graph Visualization</h3>
              <p className="text-sm text-slate-500 mb-4">
                Interactive visualization of your codebase structure, components, and dependencies.
              </p>
              <div className="h-[600px] border border-slate-200 rounded-lg overflow-hidden">
                <OrbitalRepoGraph />
              </div>
            </div>
          </div>
        )

      default:
        return <div>Page not found</div>
    }
  }

  const getPageTitle = () => {
    switch (activePage) {
      case "dashboard": return "Overview"
      case "agents": return selectedAgent ? `Agents > ${selectedAgent.name}` : "Agent Command Center"
      case "refactoring": return "Refactoring Metrics"
      case "dependencies": return "Dependency Management"
      case "coverage": return "Test Coverage Analysis"
      case "measures": return "Measures"
      case "risk": return "Risk & Quality Assurance"
      case "prs": return "Pull Request Insights"
      case "graph": return "Repository Graph"
      default: return ""
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar searchValue={search} setSearchValue={setSearch} placeholder="Search metrics..." showLogout />

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <div className="flex flex-col gap-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">{getPageTitle()}</h1>
                <p className="text-sm text-slate-500">Live metrics from your codebase</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm text-xs font-medium text-slate-600 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  System Online
                </div>
                <Button
                  onClick={() => setShowOrbitalPanel(true)}
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-lg shadow-slate-900/10"
                >
                  <Play size={16} className="mr-2 fill-current" />
                  Ask Orbital
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-fit overflow-x-auto max-w-full">
              <NavTab active={activePage === "dashboard"} onClick={() => handlePageChange("dashboard")} icon={<LayoutGrid size={16} />} label="Overview" />
              <NavTab active={activePage === "agents"} onClick={() => handlePageChange("agents")} icon={<Bot size={16} />} label="Agents" />
              <div className="w-px h-6 bg-slate-200 mx-1"></div>
              <NavTab active={activePage === "refactoring"} onClick={() => handlePageChange("refactoring")} icon={<RefreshCw size={16} />} label="Refactoring" />
              <NavTab active={activePage === "dependencies"} onClick={() => handlePageChange("dependencies")} icon={<Layers size={16} />} label="Dependencies" />
              <div className="w-px h-6 bg-slate-200 mx-1"></div>
              <NavTab active={activePage === "coverage"} onClick={() => handlePageChange("coverage")} icon={<ShieldCheck size={16} />} label="Coverage" />
              <NavTab active={activePage === "measures"} onClick={() => handlePageChange("measures")} icon={<BarChart3 size={16} />} label="Measures" />
              <div className="w-px h-6 bg-slate-200 mx-1"></div>
              <NavTab active={activePage === "risk"} onClick={() => handlePageChange("risk")} icon={<AlertTriangle size={16} />} label="Risk" />
              <NavTab active={activePage === "prs"} onClick={() => handlePageChange("prs")} icon={<GitCommit size={16} />} label="PRs" />
              <div className="w-px h-6 bg-slate-200 mx-1"></div>
              <NavTab active={activePage === "graph"} onClick={() => handlePageChange("graph")} icon={<GitBranch size={16} />} label="Graph" />
            </div>
          </div>

          {renderContent()}
        </div>
      </div>

      <OrbitalPanel isOpen={showOrbitalPanel} onClose={() => setShowOrbitalPanel(false)} />
    </div>
  )
}

const NavTab = ({
  icon,
  label,
  active = false,
  onClick,
}: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
      active ? "bg-slate-100 text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
)

export default DashComponent