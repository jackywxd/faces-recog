import type { Photo, FaceEncoding, SearchJob } from "../types";

// 存储服务抽象
export interface StorageAdapter {
  upload(file: Buffer, key: string, mimeType?: string): Promise<string>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  getUrl(key: string): Promise<string>;
  exists(key: string): Promise<boolean>;
}

// 数据库仓库接口
export interface PhotoRepository {
  create(photo: Omit<Photo, "id" | "uploadedAt">): Promise<Photo>;
  findById(id: string): Promise<Photo | null>;
  findAll(limit?: number, offset?: number): Promise<Photo[]>;
  update(id: string, updates: Partial<Photo>): Promise<Photo | null>;
  delete(id: string): Promise<boolean>;
  search(query: string): Promise<Photo[]>;
}

export interface FaceEncodingRepository {
  create(
    encoding: Omit<FaceEncoding, "id" | "createdAt">
  ): Promise<FaceEncoding>;
  findById(id: string): Promise<FaceEncoding | null>;
  findByPhotoId(photoId: string): Promise<FaceEncoding[]>;
  findAll(limit?: number, offset?: number): Promise<FaceEncoding[]>;
  delete(id: string): Promise<boolean>;
  deleteByPhotoId(photoId: string): Promise<number>;
  findSimilar(encoding: number[], threshold: number): Promise<FaceEncoding[]>;
}

export interface SearchJobRepository {
  create(
    job: Omit<SearchJob, "id" | "createdAt" | "updatedAt">
  ): Promise<SearchJob>;
  findById(id: string): Promise<SearchJob | null>;
  findAll(limit?: number, offset?: number): Promise<SearchJob[]>;
  update(id: string, updates: Partial<SearchJob>): Promise<SearchJob | null>;
  delete(id: string): Promise<boolean>;
  findByStatus(status: SearchJob["status"]): Promise<SearchJob[]>;
}

// 数据库适配器抽象
export interface DatabaseAdapter {
  photos: PhotoRepository;
  faceEncodings: FaceEncodingRepository;
  searchJobs: SearchJobRepository;

  // 事务支持
  transaction<T>(callback: (db: DatabaseAdapter) => Promise<T>): Promise<T>;

  // 连接管理
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  healthCheck(): Promise<boolean>;
}

// 人脸检测服务抽象
export interface FaceDetectionService {
  detectFaces(imageBuffer: Buffer): Promise<import("../types").FaceDetection[]>;
  extractEncoding(
    imageBuffer: Buffer,
    detection: import("../types").FaceDetection
  ): Promise<number[]>;
  compareFaces(encoding1: number[], encoding2: number[]): Promise<number>;
  isValidFace(detection: import("../types").FaceDetection): boolean;
}

// 缓存服务抽象
export interface CacheAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  exists(key: string): Promise<boolean>;
}

// 服务工厂接口
export interface ServiceContainer {
  storage: StorageAdapter;
  database: DatabaseAdapter;
  faceDetection: FaceDetectionService;
  cache: CacheAdapter;
}

// 环境适配器工厂
export type AdapterFactory<T> = (
  env: "development" | "production" | "test"
) => T;

// 存储适配器工厂
export const createStorageAdapter: AdapterFactory<StorageAdapter> = (env) => {
  // 运行时实现将在具体的应用中提供
  throw new Error("Storage adapter factory not implemented");
};

// 数据库适配器工厂
export const createDatabaseAdapter: AdapterFactory<DatabaseAdapter> = (env) => {
  // 运行时实现将在具体的应用中提供
  throw new Error("Database adapter factory not implemented");
};

// 人脸检测服务工厂
export const createFaceDetectionService: AdapterFactory<
  FaceDetectionService
> = (env) => {
  // 运行时实现将在具体的应用中提供
  throw new Error("Face detection service factory not implemented");
};

// 缓存适配器工厂
export const createCacheAdapter: AdapterFactory<CacheAdapter> = (env) => {
  // 运行时实现将在具体的应用中提供
  throw new Error("Cache adapter factory not implemented");
};
