import Editor from "@monaco-editor/react";

interface MonacoCanvasProps {
  value: string;
  setValue: (val: string) => void;
}

const MonacoCanvas = ({ value, setValue }: MonacoCanvasProps) => (
  <div className="flex flex-col w-[30%] min-w-[260px] max-w-[600px] bg-gray-50 h-full">
    <div className="font-semibold text-gray-700 p-2">Canvas</div>
    <div className="flex-1 rounded-lg border border-gray-200 overflow-hidden m-2">
      <Editor
        height="100%"
        defaultLanguage="typescript"
        value={value}
        theme="vs-light"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
        onChange={(v) => setValue(v || "")}
      />
    </div>
  </div>
);

export default MonacoCanvas;