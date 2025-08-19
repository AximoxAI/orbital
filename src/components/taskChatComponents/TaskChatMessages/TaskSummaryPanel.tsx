import React from "react"
import ReactMarkdown from "react-markdown"

export const TaskSummaryPanel = ({ summary }: { summary: string[] }) => {
  const uniqueSummary = Array.from(new Set(summary));
  if (!uniqueSummary || uniqueSummary.length === 0) return null;

  // The last element is the "actual summary", the rest (if any) is "output"
  const output = uniqueSummary.slice(0, -1);
  const actualSummary = uniqueSummary[uniqueSummary.length - 1];

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mt-3 overflow-x-auto">
      <div className="flex flex-col gap-4">
        {output.length > 0 && (
          <div className="text-slate-900 text-sm leading-relaxed whitespace-pre-wrap font-normal font-inter border-b border-emerald-200 pb-3 overflow-x-auto">
            <div className="max-w-full break-words">
              <strong className="text-emerald-700 font-semibold mb-1 block">Agent</strong>
              {output.map((s, idx) => (
                <div key={idx} className="break-words">
                  <ReactMarkdown>{s}</ReactMarkdown>
                </div>
              ))}
            </div>
          </div>
        )}
        {actualSummary && (
          <div className="text-slate-900 text-sm leading-relaxed whitespace-pre-wrap font-normal font-inter overflow-x-auto">
            <div className="prose prose-sm max-w-full break-words">
              <strong className="text-green-700 font-semibold mb-1 block">Summary</strong>
              <ReactMarkdown>{actualSummary}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};