// Location: ai-crew-suite/actions -> playwright-check/src/main.test.ts
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import * as core from '@actions/core';
import { findSuccessForSha, run } from './main';

// 1. Establish central mocks for the actions context abstractions
vi.mock('@actions/core', () => ({
  getInput: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
  setFailed: vi.fn(),
}));

const mockListWorkflowRuns = vi.fn();
vi.mock('@actions/github', () => ({
  context: {
    repo: {
      owner: 'ai-crew-suite',
      repo: 'actions',
    },
  },
  getOctokit: vi.fn().mockImplementation(() => ({
    rest: {
      actions: {
        listWorkflowRuns: mockListWorkflowRuns,
      },
    },
  })),
}));

describe('Playwright Deployment Gatekeeper Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // --- Test 1: Evaluation Core Mapping ---
  test('🎯 findSuccessForSha matches target SHAs and verifies successful conclusions', () => {
    const mockRuns = [
      { head_sha: 'aaa', conclusion: 'success' },
      { head_sha: 'bbb', conclusion: 'failure' },
      { head_sha: 'ccc', conclusion: 'in_progress' },
    ];

    expect(findSuccessForSha(mockRuns, 'aaa')).toBe(true);
    expect(findSuccessForSha(mockRuns, 'bbb')).toBe(false);
    expect(findSuccessForSha(mockRuns, 'ccc')).toBe(false);
    expect(findSuccessForSha(mockRuns, 'ddd')).toBe(false); // Unknown SHA
  });

  // --- Test 2: Successful API Cycle Pass ---
  test('✅ Successful workflow run match executes without throwing failures', async () => {
    // Inject required mock inputs
    vi.mocked(core.getInput).mockImplementation((name: string) => {
      if (name === 'github_token') return 'mock-token';
      if (name === 'expected_sha') return 'target-sha-123';
      if (name === 'workflow_file') return 'playwright.yml';
      return '';
    });

    // Mock an active successful network dataset response matching the Octokit contract
    mockListWorkflowRuns.mockResolvedValue({
      data: {
        workflow_runs: [{ head_sha: 'target-sha-123', conclusion: 'success' }],
      },
    });

    await run();

    expect(core.info).toHaveBeenCalledWith(expect.stringContaining('Playwright succeeded for this SHA'));
    expect(core.setFailed).not.toHaveBeenCalled();
  });

  // --- Test 3: API Error Exception Handling ---
  test('❌ Upstream API network crashes throw standard failure catch blocks', async () => {
    vi.mocked(core.getInput).mockImplementation((name: string) => {
      if (name === 'github_token') return 'mock-token';
      if (name === 'expected_sha') return 'target-sha-123';
      return '';
    });

    // Simulate an unexpected API crash or authentication drop
    mockListWorkflowRuns.mockRejectedValue(new Error('GitHub API rate limit exceeded (403)'));

    await run();

    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining('Guardrail Execution Failure: GitHub API rate limit exceeded')
    );
  });
});
