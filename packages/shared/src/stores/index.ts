import { create } from "zustand";
import type { UploadProgress, SearchJob } from "../types";

// 文件上传状态管理
interface UploadState {
  files: UploadProgress[];
  isUploading: boolean;

  // Actions
  addFile: (file: UploadProgress) => void;
  updateProgress: (fileId: string, progress: number) => void;
  setStatus: (fileId: string, status: UploadProgress["status"]) => void;
  setError: (fileId: string, error: string) => void;
  removeFile: (fileId: string) => void;
  clearFiles: () => void;
  setUploading: (uploading: boolean) => void;
}

export const useUploadStore = create<UploadState>((set, get) => ({
  files: [],
  isUploading: false,

  addFile: (file) =>
    set((state) => ({
      files: [...state.files, file],
    })),

  updateProgress: (fileId, progress) =>
    set((state) => ({
      files: state.files.map((file) =>
        file.fileId === fileId ? { ...file, progress } : file
      ),
    })),

  setStatus: (fileId, status) =>
    set((state) => ({
      files: state.files.map((file) =>
        file.fileId === fileId ? { ...file, status } : file
      ),
    })),

  setError: (fileId, error) =>
    set((state) => ({
      files: state.files.map((file) =>
        file.fileId === fileId ? { ...file, error, status: "failed" } : file
      ),
    })),

  removeFile: (fileId) =>
    set((state) => ({
      files: state.files.filter((file) => file.fileId !== fileId),
    })),

  clearFiles: () => set({ files: [] }),

  setUploading: (uploading) => set({ isUploading: uploading }),
}));

// 搜索状态管理
interface SearchState {
  currentJob: SearchJob | null;
  jobHistory: SearchJob[];
  isSearching: boolean;

  // Actions
  setCurrentJob: (job: SearchJob | null) => void;
  updateJob: (jobUpdate: Partial<SearchJob>) => void;
  addToHistory: (job: SearchJob) => void;
  clearHistory: () => void;
  setSearching: (searching: boolean) => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  currentJob: null,
  jobHistory: [],
  isSearching: false,

  setCurrentJob: (job) => set({ currentJob: job }),

  updateJob: (jobUpdate) =>
    set((state) => ({
      currentJob: state.currentJob
        ? { ...state.currentJob, ...jobUpdate }
        : null,
    })),

  addToHistory: (job) =>
    set((state) => ({
      jobHistory: [job, ...state.jobHistory.slice(0, 9)], // 保持最近 10 条记录
    })),

  clearHistory: () => set({ jobHistory: [] }),

  setSearching: (searching) => set({ isSearching: searching }),
}));

// 应用状态管理
interface AppState {
  theme: "light" | "dark";
  sidebarOpen: boolean;

  // Actions
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark") => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: "light",
  sidebarOpen: false,

  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === "light" ? "dark" : "light",
    })),

  setTheme: (theme) => set({ theme }),

  toggleSidebar: () =>
    set((state) => ({
      sidebarOpen: !state.sidebarOpen,
    })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
