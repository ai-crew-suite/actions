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
import { describe, it, expect } from 'vitest';
import { buildPlans, parseLabels } from '../src/planner.js';

describe('sync planner', () => {
  const sourceRoot = '/infra/src';

  describe('parseLabels()', () => {
    it('parses and deduplicates pull request labels', () => {
      expect(parseLabels('sync, maintenance\nimportant, sync')).toEqual(['sync', 'maintenance', 'important']);
    });

    it('should split, trim, filter, and successfully deduplicate complex input label variants', () => {
      const result = parseLabels(' infra , bug \n infra , feature ,, ');
      expect(result).toEqual(['infra', 'bug', 'feature']);
    });

    it('should return an empty array if given a blank or space-only input string', () => {
      expect(parseLabels('   ')).toEqual([]);
    });
  });

  describe('buildPlans()', () => {
    it('flattens groups and deduplicates files for each repository', () => {
      const plans = buildPlans(
        {
          default: [
            { repos: 'org/one\norg/two', files: [{ source: 'a.txt', dest: 'a.txt' }] },
            { repos: ['org/one'], files: [{ source: 'a.txt', dest: 'a.txt' }, { source: 'b.txt', dest: 'b.txt' }] },
          ],
        },
        sourceRoot,
      );

      expect(plans).toEqual([
        {
          owner: 'org',
          name: 'one',
          files: [
            { source: 'a.txt', dest: 'a.txt', sourcePath: '/infra/src/a.txt' },
            { source: 'b.txt', dest: 'b.txt', sourcePath: '/infra/src/b.txt' },
          ],
        },
        { owner: 'org', name: 'two', files: [{ source: 'a.txt', dest: 'a.txt', sourcePath: '/infra/src/a.txt' }] },
      ]);
    });

    it('rejects mappings that escape the source directory', () => {
      expect(() => buildPlans({ default: { repos: 'org/repo', files: [{ source: '../secret', dest: 'secret' }] } }, sourceRoot)).toThrow('must stay inside');
    });

    it('rejects mappings that escape the target repository', () => {
      expect(() => buildPlans({ default: { repos: 'org/repo', files: [{ source: 'file', dest: '../secret' }] } }, sourceRoot)).toThrow('target repository');
    });

    it('should throw a directory traversal error if a destination path specifies an absolute path file layout', () => {
      const config = {
        default: [{ name: 'Breaker', repos: 'org/repo', files: [{ source: 'a.txt', dest: '/etc/passwd' }] }]
      };
      expect(() => buildPlans(config, sourceRoot)).toThrow('Destination path must stay inside the target repository: /etc/passwd');
    });

    it('should throw a validation error if conflicting source elements map into the same destination path', () => {
      const config = {
        default: [
          {
            name: 'Conflict Configuration',
            repos: ['ai-crew-suite/core'],
            files: [
              { source: 'source-one.ts', dest: 'app.ts' },
              { source: 'source-two.ts', dest: 'app.ts' } // Collision target
            ]
          }
        ]
      };
      expect(() => buildPlans(config, sourceRoot)).toThrow('Conflicting mappings for ai-crew-suite/core:app.ts');
    });

    it('should throw an explicit error if a repository entry name pattern is malformed', () => {
      const config = {
        default: [{ name: 'Test', repos: 'invalid-repo-name-no-slash', files: [{ source: 'a', dest: 'b' }] }]
      };
      expect(() => buildPlans(config, sourceRoot)).toThrow('Invalid repository name: invalid-repo-name-no-slash');
    });

    it('should throw an error if an array item structure misses the required files matrix schema', () => {
      const config = {
        default: [{ name: 'Bad Group', repos: 'a/b', files: undefined as any }]
      };
      expect(() => buildPlans(config, sourceRoot)).toThrow('Each sync group must contain a files array');
    });

    it('should throw an exception if invalid, null, or empty file configuration mappings are injected', () => {
      const config = {
        default: [{ name: 'Bad File Object', repos: 'a/b', files: [{ source: '', dest: 'dest.js' }] }]
      };
      expect(() => buildPlans(config, sourceRoot)).toThrow('Invalid file mapping in group Bad File Object');
    });

    it('should throw an explicit error if a repository path string contains too many structural slashes', () => {
      const config = {
        default: [{ name: 'Deep Split', repos: 'ai-crew-suite/core/nested-folder', files: [{ source: 'a.txt', dest: 'a.txt' }] }]
      };
      // Note: Because name.includes('/') is validated against the split tail, verify it rejects it cleanly
      expect(() => buildPlans(config, sourceRoot)).toThrow('Invalid repository name');
    });

    it('should successfully parse a flat configuration group block that is defined as an object literal instead of an array', () => {
      const config = {
        // Passing a raw object instead of a wrapping array block [ {} ]
        customGroup: {
          name: 'Flat Group Configuration',
          repos: ['ai-crew-suite/infra'],
          files: [{ source: 'config.json', dest: 'config.json' }]
        }
      };

      const plans = buildPlans(config as any, sourceRoot);
      expect(plans).toHaveLength(1);
      expect(plans[0].name).toBe('infra');
    });
  });
});
