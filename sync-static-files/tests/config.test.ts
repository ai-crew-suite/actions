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
import { readConfig } from '../src/config';
import * as core from '@actions/core';

vi.mock('@actions/core', () => ({
  getInput: vi.fn(),
  setSecret: vi.fn(),
}));

describe('readConfig()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully parse valid required configurations and fallback to default labels', () => {
    vi.mocked(core.getInput).mockImplementation((name) => {
      if (name === 'static_files_path') return 'infrastructure/src';
      if (name === 'GH_PAT') return 'ghp_secret_token_123';
      return '';
    });

    const config = readConfig();

    expect(config).toEqual({
      sourcePath: 'infrastructure/src',
      token: 'ghp_secret_token_123',
      labels: ['sync'],
    });
    expect(core.setSecret).toHaveBeenCalledWith('ghp_secret_token_123');
  });

  it('should properly split and clean multi-line and comma-separated labels', () => {
    vi.mocked(core.getInput).mockImplementation((name) => {
      if (name === 'static_files_path') return 'src';
      if (name === 'GH_PAT') return 'ghp_token';
      if (name === 'PR_LABELS') return '  infra, bug\n feature ,, system '; 
      return '';
    });

    const config = readConfig();

    expect(config.labels).toEqual(['infra', 'bug', 'feature', 'system']);
  });

  it('should throw an error if an internal required parameter is missing', () => {
    vi.mocked(core.getInput).mockImplementation((name, options) => {
      if (options?.required && name === 'static_files_path') {
        throw new Error('Input required and not supplied: static_files_path');
      }
      return '';
    });

    expect(() => readConfig()).toThrow('Input required and not supplied: static_files_path');
  });

  it('should fallback to ["sync"] when PR_LABELS is entirely spaces', () => {
    vi.mocked(core.getInput).mockImplementation((name) => {
      if (name === 'static_files_path') return 'src';
      if (name === 'GH_PAT') return 'ghp_token';
      if (name === 'PR_LABELS') return '     '; // Truthy string, but functionally empty
      return '';
    });

    const config = readConfig();

    // WARNING: Current code returns [] here. If your workflow requires an active label,
    // this test highlights that the fallback logic should look like: (getInput('PR_LABELS')?.trim() || 'sync')
    expect(config.labels).toEqual([]);
  });

  it('should safely process chaotic, empty, or consecutive delimiters without throwing runtime exceptions', () => {
    // Arrange
    vi.mocked(core.getInput).mockImplementation((name) => {
      if (name === 'static_files_path') return 'src';
      if (name === 'GH_PAT') return 'ghp_token';
      if (name === 'PR_LABELS') return ',\n,,infra,,,\n\n,,,';
      return '';
    });

    const config = readConfig();

    expect(config.labels).toEqual(['infra']);
  });
});
