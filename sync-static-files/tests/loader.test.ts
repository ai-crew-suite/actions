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
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadConfig } from '../src/loader';
import { createJiti } from 'jiti';
import { resolve } from 'node:path';

const mockImport = vi.fn();

vi.mock('jiti', () => ({
  createJiti: vi.fn(() => ({
    import: mockImport,
  })),
}));

describe('loadConfig()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully return the default exported object configuration matrix', async () => {
    const expectedConfig = {
      default: [
        { name: 'Common Files', repos: 'ai-crew-suite/infra', files: [] }
      ]
    };
    mockImport.mockResolvedValue({ default: expectedConfig });

    const result = await loadConfig('/workspace/project');

    expect(result).toEqual(expectedConfig);
    expect(createJiti).toHaveBeenCalledWith(expect.stringContaining('src/loader.ts'));
    expect(mockImport).toHaveBeenCalledWith(resolve('/workspace/project', 'sync.ts'));
  });

  it('should throw an explicit error if the targeted file has an empty or missing default export', async () => {
    mockImport.mockResolvedValue({ default: undefined });

    await expect(loadConfig('/workspace/project')).rejects.toThrow(
      `sync.ts must default-export a configuration object: ${resolve('/workspace/project', 'sync.ts')}`
    );
  });

  it('should throw an explicit error if the default export is present but is not a valid object schema', async () => {
    mockImport.mockResolvedValue({ default: 'invalid-string-export' });

    await expect(loadConfig('/workspace/project')).rejects.toThrow(
      `sync.ts must default-export a configuration object: ${resolve('/workspace/project', 'sync.ts')}`
    );
  });

  it('should propagate standard filesystem or evaluation errors if the sync.ts file does not exist', async () => {
    mockImport.mockRejectedValue(new Error("Cannot find module 'sync.ts'"));

    await expect(loadConfig('/workspace/empty-project')).rejects.toThrow(
      "Cannot find module 'sync.ts'"
    );
  });

  it('should throw an explicit error if the default export is present but resolves to a null value', async () => {
    mockImport.mockResolvedValue({ default: null });

    await expect(loadConfig('/workspace/project')).rejects.toThrow(
      `sync.ts must default-export a configuration object: ${resolve('/workspace/project', 'sync.ts')}`
    );
  });
});
