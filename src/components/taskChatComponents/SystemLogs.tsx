import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Clock, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

interface LogEntry {
  id: string;
  status: string;
  message: string;
  summary?: string;
  timestamp?: string;
  filePath?: string;
}

interface SystemLogsCardProps {
  logs: LogEntry[];
  taskId: string;
  taskName: string;
}

const SystemLogsCard = ({ logs, taskId, taskName }: SystemLogsCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Get status icon and color
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'connection':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'execution':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'file':
        return <Info className="w-4 h-4 text-purple-500" />;
      case 'waiting':
        return <Clock className="w-4 h-4 text-orange-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'connection':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'execution':
        return 'bg-blue-50 border-blue-200';
      case 'in_progress':
        return 'bg-yellow-50 border-yellow-200';
      case 'file':
        return 'bg-purple-50 border-purple-200';
      case 'waiting':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (logs.length === 0) return null;

  return (
    <div className="mb-2 ">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        {/* Header */}
        <div
          className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {isExpanded ?
                <ChevronDown className="w-3 h-3 text-gray-500" /> :
                <ChevronRight className="w-3 h-3 text-gray-500" />
              }
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">System Logs</h3>
              <p className="text-xs text-gray-600">
                "{taskName}" • {logs.length} logs
              </p>
            </div>
          </div>
          <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
            {taskId}
          </span>
        </div>

        {/* Expandable Content */}
        {isExpanded && (
          <div className="border-t border-gray-200">
            {/* Log Entries */}
            <div className="max-h-[150px] overflow-y-auto">
              {logs.length === 0 ? (
                <div className="p-2 text-center text-gray-500 text-xs">
                  No logs found
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-2 rounded border ${getStatusColor(log.status)} transition-all hover:shadow-sm`}
                    >
                      <div className="flex items-start space-x-2">
                        <div className="flex-shrink-0 mt-0.5">
                          {getStatusIcon(log.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs font-medium text-gray-900 capitalize">
                              {log.status.replace('_', ' ')}
                            </span>
                            {log.timestamp && (
                              <span className="text-[10px] text-gray-500">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-700 leading-relaxed">
                            {log.message}
                          </p>
                          {log.summary && (
                            <div className="mt-1 p-1 bg-white/50 rounded border border-gray-200/50">
                              <p className="text-[10px] text-gray-600">
                                <span className="font-medium">Summary:</span> {log.summary}
                              </p>
                            </div>
                          )}
                          {log.filePath && (
                            <div className="mt-1">
                              <span className="inline-flex items-center text-[10px] text-gray-600 bg-white/70 px-2 py-0.5 rounded border border-gray-200/50">
                                📄 {log.filePath}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer with stats */}
            <div className="border-t border-gray-100 px-2 py-2 bg-gray-50">
              <div className="flex items-center justify-between text-[10px] text-gray-500">
                <span>
                  Showing {logs.length} / {logs.length}
                </span>
                <div className="flex items-center space-x-2">
                  {['connection', 'execution', 'file', 'error'].map(status => {
                    const count = logs.filter(log => log.status.toLowerCase() === status).length;
                    if (count === 0) return null;
                    return (
                      <span key={status} className="flex items-center space-x-1">
                        {getStatusIcon(status)}
                        <span>{count}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemLogsCard;