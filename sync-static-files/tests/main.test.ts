
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
import { run } from '../src/main';
import * as core from '@actions/core';
import * as github from '@actions/github';
import { readConfig } from '../src/config.js';
import { loadConfig } from '../src/loader.js';
import { buildPlans } from '../src/planner.js';
import { syncRepository } from '../src/git.js';

vi.mock('@actions/core', () => ({
  info: vi.fn(),
  setFailed: vi.fn(),
}));

vi.mock('@actions/github', () => ({
  getOctokit: vi.fn(() => ({
    rest: { mockClient: true }
  })),
  context: {
    repo: {
      owner: 'ai-crew-suite',
      repo: 'infra-central'
    }
  }
}));

vi.mock('../src/config.js', () => ({ readConfig: vi.fn() }));
vi.mock('../src/loader.js', () => ({ loadConfig: vi.fn() }));
vi.mock('../src/planner.js', () => ({ buildPlans: vi.fn() }));
vi.mock('../src/git.js', () => ({ syncRepository: vi.fn() }));

describe('Main Action Orchestrator Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully orchestrate pipeline execution loops and log updates for changed/unchanged repositories', async () => {
    vi.mocked(readConfig).mockReturnValue({
      sourcePath: 'infra/assets',
      token: 'ghp_mock_token',
      labels: ['sync'],
    });

    vi.mocked(loadConfig).mockResolvedValue({ default: [] } as any);

    const mockPlans = [
      { owner: 'ai-crew-suite', name: 'core', files: [] },
      { owner: 'ai-crew-suite', name: 'drivers', files: [] },
    ];
    vi.mocked(buildPlans).mockReturnValue(mockPlans);

    vi.mocked(syncRepository)
      .mockResolvedValueOnce({ number: 1, html_url: 'https://github.com', body: '' })
      .mockResolvedValueOnce(undefined);

    await run();

    expect(readConfig).toHaveBeenCalled();
    expect(loadConfig).toHaveBeenCalledWith('infra/assets');
    expect(buildPlans).toHaveBeenCalledWith({ default: [] }, 'infra/assets/src');

    expect(github.getOctokit).toHaveBeenCalledWith('ghp_mock_token');

    expect(syncRepository).toHaveBeenCalledTimes(2);
    expect(syncRepository).toHaveBeenNthCalledWith(
      1,
      { mockClient: true } as any,
      mockPlans[0],
      'ai-crew-suite/infra-central',
      'ghp_mock_token',
      ['sync']
    );

    expect(core.info).toHaveBeenCalledWith('Updated ai-crew-suite/core: https://github.com');
    expect(core.info).toHaveBeenCalledWith('No changes for ai-crew-suite/drivers');
    expect(core.setFailed).not.toHaveBeenCalled();
  });

  it('should cleanly intercept errors from failing sub-modules and report them to GitHub UI using setFailed', async () => {
    vi.mocked(readConfig).mockImplementation(() => {
      throw new Error('Missing configuration input: GH_PAT');
    });

    await run();

    expect(core.setFailed).toHaveBeenCalledWith('Missing configuration input: GH_PAT');
    expect(syncRepository).not.toHaveBeenCalled();
  });

  it('should cleanly stringify and catch non-Error string runtime exceptions safely', async () => {
    vi.mocked(readConfig).mockReturnValue({ sourcePath: 'src', token: 'tok', labels: [] });
    vi.mocked(loadConfig).mockRejectedValue('Fatal Framework Evaluation Crash');

    await run();

    expect(core.setFailed).toHaveBeenCalledWith('Fatal Framework Evaluation Crash');
  });

  it('should complete gracefully without calling syncRepository or throwing exceptions if no plans are generated', async () => {
    vi.mocked(readConfig).mockReturnValue({
      sourcePath: 'infra/assets',
      token: 'ghp_mock_token',
      labels: ['sync'],
    });
    vi.mocked(loadConfig).mockResolvedValue({ default: [] } as any);

    // Planner returns zero target repositories
    vi.mocked(buildPlans).mockReturnValue([]);

    await run();

    expect(syncRepository).not.toHaveBeenCalled();
    expect(core.info).not.toHaveBeenCalled();
    expect(core.setFailed).not.toHaveBeenCalled();
  });

  it('should immediately abort the remaining execution loop if a single repository synchronization throws an error', async () => {
    vi.mocked(readConfig).mockReturnValue({
      sourcePath: 'infra/assets',
      token: 'ghp_mock_token',
      labels: ['sync'],
    });
    vi.mocked(loadConfig).mockResolvedValue({ default: [] } as any);

    const mockPlans = [
      { owner: 'ai-crew-suite', name: 'repo-one', files: [] },
      { owner: 'ai-crew-suite', name: 'repo-two', files: [] }, // This will be bypassed
    ];
    vi.mocked(buildPlans).mockReturnValue(mockPlans);

    // Force the first syncRepository call to blow up with an upstream network exception
    vi.mocked(syncRepository).mockRejectedValueOnce(new Error('Network Timeout Connecting to API'));

    await run();

    expect(syncRepository).toHaveBeenCalledTimes(1); // Aborted before processing repo-two
    expect(core.setFailed).toHaveBeenCalledWith('Network Timeout Connecting to API');
  });
});
