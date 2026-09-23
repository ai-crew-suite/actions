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
// Location: eslint-config-sync/tests/main.test.ts
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as github from '@actions/github';

import { run } from '../src/main';

const createCommentSpy = vi.fn().mockResolvedValue({ status: 201 });

vi.mock('@actions/github', () => {
  return {
    context: {
      repo: {
        owner: 'ai-crew-suite',
        repo: 'actions',
      },
    },
    getOctokit: vi.fn().mockImplementation(() => ({
      rest: {
        issues: {
          createComment: createCommentSpy,
        },
      },
    })),
  };
});

describe('ESLint Config Sync Action Tests', () => {
  const tmpDir = path.join(__dirname, '../tmp-test-workspace');

  beforeEach(() => {
    if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });
    fs.mkdirSync(tmpDir, { recursive: true });
    vi.spyOn(process, 'cwd').mockReturnValue(tmpDir);
    vi.stubEnv('GITHUB_TOKEN', 'mock-github-token');
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('✅ Should execute the sync run pipeline successfully', async () => {
    // 1. Seed the package json with the caret to trigger fallback logic
    const mockPkg = { devDependencies: { '@backstage/cli': '^1.24.0' } };
    fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify(mockPkg));

    // 2. Seed a mock yarn.lock to satisfy the fallback string parser
    const mockLock = `"@backstage/cli@npm:^1.24.0":\n  version "1.24.0"\n`;
    fs.writeFileSync(path.join(tmpDir, 'yarn.lock'), mockLock);

    const localConfigPath = path.join(tmpDir, 'packages/config-eslint/src');
    fs.mkdirSync(localConfigPath, { recursive: true });
    fs.writeFileSync(path.join(localConfigPath, 'index.ts'), 'export const config = {};');

    const mockEvent = { pull_request: { number: 42, comments_url: 'https://github.com' } };
    const eventFilePath = path.join(tmpDir, 'event.json');
    fs.writeFileSync(eventFilePath, JSON.stringify(mockEvent));
    vi.stubEnv('GITHUB_EVENT_PATH', eventFilePath);

    vi.spyOn(global, 'fetch').mockImplementation(async (url) => {
      const urlStr = url.toString();
      if (urlStr.includes('://raw.githubusercontent.com')) {
        return { ok: true, text: async () => 'module.exports = { upstreamRules: true };' } as Response;
      }
      if (urlStr.includes('copilot_internal/v2/token')) {
        return { ok: true, json: async () => ({ token: 'mock-exchanged-proxy-token' }) } as Response;
      }
      if (urlStr.includes('://api.githubcopilot.com')) {
        return {
          ok: true,
          json: async () => ({
            choices: [{ message: { content: 'AI analysis: Everything aligns perfectly.' } }],
          }),
        } as Response;
      }
      return { ok: false } as Response;
    });

    await run();

    expect(createCommentSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        issue_number: 42,
        body: expect.stringContaining('Everything aligns perfectly.'),
      })
    );
  });
});
