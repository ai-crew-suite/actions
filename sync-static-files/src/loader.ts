/**
 * Copyright 2026 The AI Crew Suite Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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