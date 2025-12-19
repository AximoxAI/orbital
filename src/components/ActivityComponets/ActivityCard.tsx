import React from 'react';
import { Activity, EntityType } from '../../../types';
import { CATEGORY_ICONS, ENTITY_ICONS } from '../../constants';
import { formatDistanceToNow } from 'date-fns';

interface ActivityCardProps {
  activity: Activity;
  onClick: (activity: Activity) => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onClick }) => {
  const isAgent = activity.entityType === EntityType.AGENT;
  
  const categoryColor = {
    CODE: 'bg-blue-100 text-blue-700 border-blue-200',
    INFRA: 'bg-orange-100 text-orange-700 border-orange-200',
    CONFIG: 'bg-slate-100 text-slate-700 border-slate-200',
    MANAGEMENT: 'bg-purple-100 text-purple-700 border-purple-200',
    SECURITY: 'bg-red-100 text-red-700 border-red-200',
    QA: 'bg-green-100 text-green-700 border-green-200',
  }[activity.category];

  return (
    <div 
      onClick={() => onClick(activity)}
      className="group relative bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 hover:border-slate-300 cursor-pointer active:scale-[0.98]"
    >
      <div className="flex gap-4">
        <div className="relative flex-shrink-0">
          <img 
            src={activity.avatarUrl || `https://picsum.photos/seed/${activity.id}/200`} 
            alt={activity.entityName} 
            className={`w-12 h-12 rounded-full border-2 ${isAgent ? 'border-slate-400' : 'border-slate-200'} bg-slate-100 object-cover`}
          />
          <div className={`absolute -bottom-1 -right-1 p-1 rounded-full shadow-sm ${isAgent ? 'bg-slate-500' : 'bg-slate-500'} text-white`}>
            {ENTITY_ICONS[activity.entityType]}
          </div>
        </div>

        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-semibold text-slate-900 truncate flex items-center gap-2">
              {activity.entityName}
              <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200">
                {activity.role}
              </span>
            </h4>
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
            </span>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-bold ${categoryColor}`}>
              {CATEGORY_ICONS[activity.category]}
              {activity.category}
            </div>
            <h3 className="text-sm font-medium text-slate-800 leading-tight">
              {activity.title}
            </h3>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed mb-2">
            {activity.description}
          </p>

          {activity.metadata && (
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(activity.metadata).slice(0, 3).map(([key, val]) => (
                <span key={key} className="mono text-[10px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-100">
                  {key}: {val.toString()}
                </span>
              ))}
              {Object.keys(activity.metadata).length > 3 && (
                <span className="text-[10px] text-slate-400 font-bold px-1.5 py-0.5">
                  +{Object.keys(activity.metadata).length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;