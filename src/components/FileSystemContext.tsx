import React, { createContext, useContext, useState, ReactNode } from "react";

// Types
export type ItemType = "file" | "folder";

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  size?: number;
  url?: string;
  mimeType?: string;
  createdAt?: string;
  children?: Item[];
  // ADDED: Store the actual file object for local use
  originalFile?: File; 
}

interface FileSystemContextType {
  items: Item[];
  addItem: (item: Item, parentId?: string) => void;
  removeItem: (id: string) => void;
}

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined);

export const FileSystemProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<Item[]>(() => {
    
    const content = "Hello World! Welcome to the file system.";
    const file = new File([content], "hello_world.txt", { type: "text/plain" });
    const url = URL.createObjectURL(file);

    return [
      { 
        id: "f-1", 
        name: file.name, 
        type: "file", 
        size: file.size, 
        createdAt: new Date().toISOString(), 
        mimeType: file.type,
        url: url,
        originalFile: file 
      },
      { id: "d-1", name: "Project Assets", type: "folder", children: [] },
    ];
  });

  const addItem = (newItem: Item, parentId?: string) => {
    if (!parentId) {
      setItems((prev) => [newItem, ...prev]);
      return;
    }

    const addToFolder = (list: Item[]): Item[] => {
      return list.map((item) => {
        if (item.id === parentId && item.type === "folder") {
          return { ...item, children: [...(item.children || []), newItem] };
        }
        if (item.children) {
          return { ...item, children: addToFolder(item.children) };
        }
        return item;
      });
    };
    
    setItems((prev) => addToFolder(prev));
  };

  const removeItem = (id: string) => {
    const removeRec = (list: Item[]): Item[] =>
      list
        .filter((it) => it.id !== id)
        .map((it) =>
          it.children ? { ...it, children: removeRec(it.children) } : it
        );
    setItems((prev) => removeRec(prev));
  };

  return (
    <FileSystemContext.Provider value={{ items, addItem, removeItem }}>
      {children}
    </FileSystemContext.Provider>
  );
};

export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error("useFileSystem must be used within a FileSystemProvider");
  }
  return context;
};