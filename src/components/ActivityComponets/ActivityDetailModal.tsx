import React from 'react';
import { Activity, EntityType } from '../../../types';
import { CATEGORY_ICONS, ENTITY_ICONS } from '../../constants';
import { XMarkIcon, ClockIcon, InformationCircleIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface ActivityDetailModalProps {
  activity: Activity;
  onClose: () => void;
}

const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({ activity, onClose }) => {
  const isAgent = activity.entityType === EntityType.AGENT;
  
  const categoryColor = "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border ${categoryColor}`}>
              {CATEGORY_ICONS[activity.category]}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">{activity.title}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <ClockIcon className="w-3 h-3" />
                  {format(new Date(activity.timestamp), 'MMM dd, yyyy · HH:mm:ss')}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200/50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-8 bg-white">
          <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <img 
              src={activity.avatarUrl || `https://picsum.photos/seed/${activity.id}/200`} 
              alt={activity.entityName} 
              className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900">{activity.entityName}</h3>
                <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${isAgent ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}>
                  {ENTITY_ICONS[activity.entityType]}
                  {activity.entityType}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{activity.role}</p>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed border-l-2 border-slate-200 pl-3 italic">
                {activity.description}
              </p>
            </div>
          </div>

          {activity.longDescription && (
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-tight">
                <InformationCircleIcon className="w-4 h-4 text-slate-400" />
                Extended Context
              </h4>
              <div className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                {activity.longDescription}
              </div>
            </div>
          )}

          {activity.logs && activity.logs.length > 0 && (
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-tight">
                <ListBulletIcon className="w-4 h-4 text-slate-400" />
                Execution Logs
              </h4>
              <div className="font-mono text-[11px] bg-slate-900 text-slate-300 p-4 rounded-xl space-y-1.5 overflow-x-auto border border-slate-800 shadow-inner">
                {activity.logs.map((log, i) => (
                  <div key={i} className="whitespace-nowrap opacity-80 hover:opacity-100 transition-opacity">
                    <span className="text-slate-500 mr-3 select-none">{(i + 1).toString().padStart(2, '0')}</span>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activity.metadata && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Resource Metadata</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(activity.metadata).map(([key, val]) => (
                  <div key={key} className="p-3 bg-white border border-slate-200 rounded-lg">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">{key.replace('_', ' ')}</div>
                    <div className="text-xs font-semibold text-slate-800 break-words">{val.toString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 p-4 bg-slate-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Dismiss
          </button>
          <button 
            className="px-4 py-2 text-sm font-bold bg-slate-900 text-white rounded-lg shadow-sm hover:bg-slate-800 transition-all"
          >
            Investigate Context
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetailModal;