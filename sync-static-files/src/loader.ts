import { resolve } from 'node:path';
import { createJiti } from 'jiti';
import type { SyncConfig } from './types.js';

export async function loadConfig(directory: string): Promise<SyncConfig> {
  const configPath = resolve(directory, 'sync.ts');
  const module = await createJiti(import.meta.url).import<{ default: SyncConfig }>(configPath);
  if (!module.default || typeof module.default !== 'object') {
    throw new Error(`sync.ts must default-export a configuration object: ${configPath}`);
  }
  return module.default;
}