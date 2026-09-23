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
import { syncRepository, repositoryUrl, copyFile, runGit } from '../src/git';
import * as fsPromises from 'node:fs/promises';
import * as fs from 'node:fs';
import { execFile } from 'node:child_process';
import type { RepositoryPlan } from '../src/types';

// Mock node core modules
vi.mock('node:child_process', () => ({
  execFile: vi.fn()
}));

vi.mock('node:fs/promises', () => ({
  cp: vi.fn(),
  mkdir: vi.fn(),
  mkdtemp: vi.fn(() => Promise.resolve('/tmp/mock-dir')),
  rm: vi.fn(),
}));

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
}));

describe('Repository Sync Engine', () => {
  const createMockGitHubClient = () => ({
    repos: {
      get: vi.fn().mockResolvedValue({ data: { default_branch: 'main' } }),
    },
    pulls: {
      list: vi.fn().mockResolvedValue({ data: [] }),
      create: vi.fn().mockResolvedValue({ data: { number: 42, html_url: 'http://pr-42', body: '' } }),
      update: vi.fn().mockResolvedValue({ data: { number: 42, html_url: 'http://pr-42', body: '' } }),
    },
    issues: {
      addLabels: vi.fn().mockResolvedValue({}),
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('repositoryUrl()', () => {
    it('should cleanly format authentic remote pathways and escape auth secrets', () => {
      const url = repositoryUrl('ai-crew-suite', 'core', 'my@token!');
      expect(url).toBe('https://x-access-token:my%40token!@github.com/ai-crew-suite/core.git');
    });
  });

  describe('copyFile()', () => {
    it('should throw an explicit exception if the local tracking source file does not exist', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      await expect(
        copyFile({ source: 'missing.json', sourcePath: 'missing.json', dest: 'dest.json' }, '/tmp')
      ).rejects.toThrow('Source file not found: missing.json');
    });

    it('should properly generate structural directories and copy dependencies', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);

      await copyFile({ source: 'src/file.ts', sourcePath: 'src/file.ts', dest: '.github/file.ts' }, '/tmp/repo');

      expect(fsPromises.mkdir).toHaveBeenCalledWith('/tmp/repo/.github', { recursive: true });
      expect(fsPromises.cp).toHaveBeenCalledWith('src/file.ts', '/tmp/repo/.github/file.ts', { recursive: true, force: true });
    });

    it('should accurately calculate deeply nested destination parent folders for mkdir', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);

      await copyFile({ source: 'src/file.ts', sourcePath: 'src/file.ts', dest: 'deeply/nested/folder/app.ts' }, '/tmp/repo');

      expect(fsPromises.mkdir).toHaveBeenCalledWith('/tmp/repo/deeply/nested/folder', { recursive: true });
      expect(fsPromises.cp).toHaveBeenCalledWith('src/file.ts', '/tmp/repo/deeply/nested/folder/app.ts', { recursive: true, force: true });
    });
  });

  describe('syncRepository()', () => {
    const defaultPlan: RepositoryPlan = {
      owner: 'ai-crew-suite',
      name: 'core',
      files: [{ source: 'src/a.txt', sourcePath: 'src/a.txt', dest: 'a.txt' }]
    };

    it('should short-circuit and cleanly exit early if no modified changes are detected', async () => {
      const client = createMockGitHubClient();
      vi.mocked(fs.existsSync).mockReturnValue(true);

      vi.mocked(execFile).mockImplementation((cmd, args, opts, callback) => {
        const argsStr = args?.join(' ') || '';
        const stdout = argsStr.includes('status --porcelain') ? '' : 'fallback stdout';
        // @ts-ignore
        callback(null, { stdout, stderr: '' });
        return {} as any;
      });

      const result = await syncRepository(client, defaultPlan, 'ai-crew-suite/infra', 'token', ['sync']);

      expect(result).toBeUndefined();
      expect(fsPromises.rm).toHaveBeenCalledWith('/tmp/mock-dir', { recursive: true, force: true });
    });

    it('should create a fresh Pull Request and append labels when changes exist and no PR is currently open', async () => {
      const client = createMockGitHubClient();
      vi.mocked(fs.existsSync).mockReturnValue(true);

      vi.mocked(execFile).mockImplementation((cmd, args, opts, callback) => {
        const argsStr = args?.join(' ') || '';
        const stdout = argsStr.includes('status --porcelain') ? 'M a.txt' : 'stdout';
        // @ts-ignore
        callback(null, { stdout, stderr: '' });
        return {} as any;
      });

      const result = await syncRepository(client, defaultPlan, 'ai-crew-suite/infra', 'token', ['sync-label']);

      expect(result).toEqual({ number: 42, html_url: 'http://pr-42', body: '' });
      expect(client.pulls.create).toHaveBeenCalledWith({
        owner: 'ai-crew-suite',
        repo: 'core',
        title: 'maintenance: sync static files',
        head: 'maintenance/infra',
        base: 'main',
        body: 'Synchronize static files from [ai-crew-suite/infra](https://github.com/ai-crew-suite/infra).'
      });
      expect(client.issues.addLabels).toHaveBeenCalledWith({
        owner: 'ai-crew-suite',
        repo: 'core',
        issue_number: 42,
        labels: ['sync-label']
      });
    });

    it('should cleanly update an existing Pull Request when a previous open tracking branch is discovered', async () => {
      const client = createMockGitHubClient();
      vi.mocked(fs.existsSync).mockReturnValue(true);

      client.pulls.list.mockResolvedValue({
        data: [{ number: 99, html_url: 'http://pr-99', body: 'old-body' }]
      });

      vi.mocked(execFile).mockImplementation((cmd, args, opts, callback) => {
        const argsStr = args?.join(' ') || '';
        const stdout = argsStr.includes('status --porcelain') ? 'M a.txt' : 'stdout';
        // @ts-ignore
        callback(null, { stdout, stderr: '' });
        return {} as any;
      });

      await syncRepository(client, defaultPlan, 'ai-crew-suite/infra', 'token', []);

      expect(client.pulls.update).toHaveBeenCalledWith({
        owner: 'ai-crew-suite',
        repo: 'core',
        pull_number: 99,
        title: 'maintenance: sync static files',
        body: 'Synchronize static files from [ai-crew-suite/infra](https://github.com/ai-crew-suite/infra).'
      });
      expect(client.pulls.create).not.toHaveBeenCalled();
    });

    it('should propagate errors but still clean up the temporary workspace if a git command fails', async () => {
      const client = createMockGitHubClient();
      vi.mocked(fs.existsSync).mockReturnValue(true);

      vi.mocked(execFile).mockImplementation((cmd, args, opts, callback) => {
        // @ts-ignore
        callback(new Error('Fatal: Repository not found'), { stdout: '', stderr: 'mocked error' });
        return {} as any;
      });

      await expect(
        syncRepository(client, defaultPlan, 'ai-crew-suite/infra', 'token', [])
      ).rejects.toThrow('Fatal: Repository not found');

      expect(fsPromises.rm).toHaveBeenCalledWith('/tmp/mock-dir', { recursive: true, force: true });
    });

    it('should recognize untracked files as valid workspace modifications', async () => {
      const client = createMockGitHubClient();
      vi.mocked(fs.existsSync).mockReturnValue(true);

      vi.mocked(execFile).mockImplementation((cmd, args, opts, callback) => {
        const argsStr = args?.join(' ') || '';
        const stdout = argsStr.includes('status --porcelain') ? '?? src/new-file.json' : 'stdout';
        // @ts-ignore
        callback(null, { stdout, stderr: '' });
        return {} as any;
      });

      await syncRepository(client, defaultPlan, 'ai-crew-suite/infra', 'token', []);
      expect(client.pulls.create).toHaveBeenCalled();
    });

    it('should propagate errors directly if updating an existing pull request fails', async () => {
      const client = createMockGitHubClient();
      vi.mocked(fs.existsSync).mockReturnValue(true);

      client.pulls.list.mockResolvedValue({
        data: [{ number: 99, html_url: 'http://pr-99', body: 'old-body' }]
      });

      vi.mocked(execFile).mockImplementation((cmd, args, opts, callback) => {
        const argsStr = args?.join(' ') || '';
        const stdout = argsStr.includes('status --porcelain') ? 'M a.txt' : 'stdout';
        // @ts-ignore
        callback(null, { stdout, stderr: '' });
        return {} as any;
      });

      client.pulls.update.mockRejectedValue(new Error('GitHub API Error: Pull Request is locked'));

      await expect(
        syncRepository(client, defaultPlan, 'ai-crew-suite/infra', 'token', [])
      ).rejects.toThrow('GitHub API Error: Pull Request is locked');
    });

    it('should completely bypass calling addLabels if the consumer provides an empty array', async () => {
      const client = createMockGitHubClient();
      vi.mocked(fs.existsSync).mockReturnValue(true);

      vi.mocked(execFile).mockImplementation((cmd, args, opts, callback) => {
        const argsStr = args?.join(' ') || '';
        const stdout = argsStr.includes('status --porcelain') ? 'M a.txt' : 'stdout';
        // @ts-ignore
        callback(null, { stdout, stderr: '' });
        return {} as any;
      });

      await syncRepository(client, defaultPlan, 'ai-crew-suite/infra', 'token', []);

      expect(client.pulls.create).toHaveBeenCalled();
      expect(client.issues.addLabels).not.toHaveBeenCalled();
    });

  });

  describe('runGit()', () => {
    it('should trim surrounding whitespace and line breaks from command outputs', async () => {
      vi.mocked(execFile).mockImplementation((cmd, args, opts, callback) => {
        // @ts-ignore
        callback(null, { stdout: '  v2.41.0\n\n ', stderr: '' });
        return {} as any;
      });

      const output = await runGit(['version']);
      expect(output).toBe('v2.41.0');
    });
  });
});
