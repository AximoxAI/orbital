import { Search, ChevronDown, MoreHorizontal, Book, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const LeftPanel = () => {
  return (
    <div className="flex flex-col w-[300px] bg-white border-r border-gray-200 h-full px-5 py-4 justify-between">
      {/* Top: Logo and search */}
      <div>
        <div className="pb-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">O</span>
            </div>
            <span className="font-semibold text-gray-800">Orbital</span>
          </div>
        </div>
        {/* Search bar */}
        <div className="relative mb-6">
          <input
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white border border-transparent focus:border-indigo-200 transition"
            placeholder="Search for repos or tasks"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>
        {/* Recent tasks */}
        <div className="mb-2 flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wide gap-2">
          <span>Recent tasks</span>
          <ChevronDown className="w-4 h-4" />
        </div>
        <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 mb-6 gap-2">
          <span className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-indigo-400 bg-white">
            <svg height={14} width={14} viewBox="0 0 20 20" className="text-indigo-500"><circle cx={10} cy={10} r={8} stroke="currentColor" strokeWidth={2} fill="none"/><path d="M5 10l3 3 6-6" stroke="currentColor" strokeWidth={2} fill="none"/></svg>
          </span>
          <span className="flex-1 text-sm text-gray-800 truncate">give me sim... code lo...</span>
          <MoreHorizontal className="w-4 h-4 text-gray-400 cursor-pointer" />
        </div>
        {/* Codebases */}
        <div className="mb-2 flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wide gap-2">
          <span>Codebases</span>
          <ChevronDown className="w-4 h-4" />
        </div>
        <div className="flex items-center gap-2 pl-2 mb-7">
          <svg width={18} height={18} fill="none" viewBox="0 0 24 24" className="text-gray-700">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.729.084-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.835 2.809 1.305 3.495.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.336-5.466-5.93 0-1.31.469-2.381 1.236-3.221-.124-.304-.536-1.527.117-3.182 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.655 1.655.243 2.878.12 3.182.77.84 1.235 1.911 1.235 3.221 0 4.609-2.805 5.625-5.475 5.921.429.369.824 1.096.824 2.211v3.281c0 .322.218.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" fill="currentColor"/>
          </svg>
          <span className="text-sm text-gray-700">pranav-94/AlarmClock</span>
        </div>
      </div>
      {/* Bottom: Limit bar and actions */}
      <div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 flex gap-2 items-center justify-center text-indigo-600 border-gray-200">
            <Book className="w-4 h-4" /> Docs
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LeftPanel;