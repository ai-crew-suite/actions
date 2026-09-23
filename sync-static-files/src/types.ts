export interface SyncFile {
  source: string;
  dest: string;
}

export interface SyncGroup {
  name?: string;
  repos: string | string[];
  files: SyncFile[];
}

export type SyncConfig = Record<string, SyncGroup | SyncGroup[]>;

export interface FilePlan extends SyncFile {
  sourcePath: string;
}

export interface RepositoryPlan {
  owner: string;
  name: string;
  files: FilePlan[];
}