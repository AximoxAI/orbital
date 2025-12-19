import React, { useState, useEffect, useCallback } from 'react';
import { Activity, EntityType, ActivityCategory, Insight, Role } from '../../types';
import { MOCK_ACTIVITIES } from '../constants';
import ActivityCard from '../components/ActivityComponets/ActivityCard';
import InsightsPanel from '../components/ActivityComponets/InsightsPanel';
import ActivityDetailModal from '../components/ActivityComponets/ActivityDetailModal';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/Topbar';
import { Button } from "@/components/ui/button";
import { Play, Activity as ActivityIcon } from "lucide-react";
import OrbitalPanel from "@/components/OrbitalPanelComponents/OrbitalPanel";
import { FunnelIcon } from '@heroicons/react/24/outline';

const ActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>(MOCK_ACTIVITIES);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>(MOCK_ACTIVITIES);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showOrbitalPanel, setShowOrbitalPanel] = useState(false);

  useEffect(() => {
    let result = activities;
    if (filterType !== 'ALL') {
      result = result.filter(a => a.entityType === filterType);
    }
    if (searchQuery) {
      result = result.filter(a => 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.entityName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredActivities(result);
  }, [filterType, activities, searchQuery]);

  const addRandomActivity = () => {
    const newId = (activities.length + 100).toString();
    const categories = Object.values(ActivityCategory);
    const roles = Object.values(Role);
    const types = Object.values(EntityType);
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const newActivity: Activity = {
      id: newId,
      timestamp: new Date().toISOString(),
      entityName: type === EntityType.AGENT ? `Agent-${Math.floor(Math.random() * 100)}` : `Engineer-${Math.floor(Math.random() * 100)}`,
      entityType: type,
      role: type === EntityType.AGENT ? Role.AI_AGENT : roles[Math.floor(Math.random() * (roles.length - 1))],
      category: cat,
      title: `Action: ${cat} Event Captured`,
      description: `Discovered and resolved a critical ${cat.toLowerCase()} event in the main production workspace.`,
      longDescription: `Automated capture reflecting high-impact event within the ${cat.toLowerCase()} domain. Full system logs attached for audit.`,
      logs: [
        `[${new Date().toLocaleTimeString()}] Event detection triggered.`,
        `[${new Date().toLocaleTimeString()}] Analyzing ${cat} node state...`,
        `[${new Date().toLocaleTimeString()}] Resolution applied successfully.`,
      ],
      metadata: { 
        traceId: `tr-${Math.random().toString(36).substr(2, 9)}`, 
        priority: 'High',
        environment: 'Production' 
      },
      avatarUrl: `https://picsum.photos/seed/${newId}/200`
    };

    setActivities(prev => [newActivity, ...prev]);
  };

  return (
    <div className="flex h-screen bg-slate-50 antialiased overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar 
          searchValue={searchQuery} 
          setSearchValue={setSearchQuery} 
          placeholder="Search activity stream..." 
          showLogout 
        />

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <div className="flex flex-col gap-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                  <ActivityIcon className="w-6 h-6 text-slate-600" />
                  Activity Feed
                </h1>
                <p className="text-sm text-slate-500">Real-time collaboration between Human & AI Agent resources</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={addRandomActivity}
                  className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg shadow-sm text-xs font-medium"
                >
                  Simulate Agent Action
                </Button>
                <Button
                  onClick={() => setShowOrbitalPanel(true)}
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-lg shadow-slate-900/10"
                >
                  <Play size={16} className="mr-2 fill-current" />
                  Ask Orbital
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-fit">
                  {['ALL', 'HUMAN', 'AGENT'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        filterType === type 
                        ? "bg-slate-100 text-slate-900 shadow-sm" 
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">
                  <FunnelIcon className="w-4 h-4" />
                  Advanced Filters
                </button>
              </div>

              {filteredActivities.length > 0 ? (
                filteredActivities.map((activity) => (
                  <ActivityCard 
                    key={activity.id} 
                    activity={activity} 
                    onClick={setSelectedActivity}
                  />
                ))
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-16 text-center shadow-sm">
                  <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <ActivityIcon className="w-6 h-6 text-slate-300" />
                  </div>
                  <h3 className="text-slate-900 font-semibold">No results found</h3>
                  <p className="text-slate-500 text-sm mt-1">Try adjusting your search or filters.</p>
                </div>
              )}
            </div>

            <aside className="lg:col-span-4">
              <div className="sticky top-0 space-y-6">
                <InsightsPanel insights={insights} loading={loadingInsights} />
                
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Live Statistics</h4>
                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Active Agents</p>
                        <p className="text-2xl font-bold text-slate-900">14</p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">+2 new</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">System Coverage</p>
                        <p className="text-2xl font-bold text-slate-900">98%</p>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">Optimal</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <OrbitalPanel isOpen={showOrbitalPanel} onClose={() => setShowOrbitalPanel(false)} />
      {selectedActivity && (
        <ActivityDetailModal 
          activity={selectedActivity} 
          onClose={() => setSelectedActivity(null)} 
        />
      )}
    </div>
  );
};

export default ActivityFeed;