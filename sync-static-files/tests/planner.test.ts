import { describe, expect, test } from 'vitest';
import { buildPlans, parseLabels } from '../src/planner.js';

describe('sync planner', () => {
  test('flattens groups and deduplicates files for each repository', () => {
    const plans = buildPlans(
      {
        default: [
          { repos: 'org/one\norg/two', files: [{ source: 'a.txt', dest: 'a.txt' }] },
          { repos: ['org/one'], files: [{ source: 'a.txt', dest: 'a.txt' }, { source: 'b.txt', dest: 'b.txt' }] },
        ],
      },
      '/infra/src',
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

  test('rejects mappings that escape the source directory', () => {
    expect(() => buildPlans({ default: { repos: 'org/repo', files: [{ source: '../secret', dest: 'secret' }] } }, '/infra/src')).toThrow('must stay inside');
  });

  test('rejects mappings that escape the target repository', () => {
    expect(() => buildPlans({ default: { repos: 'org/repo', files: [{ source: 'file', dest: '../secret' }] } }, '/infra/src')).toThrow('target repository');
  });

  test('parses and deduplicates pull request labels', () => {
    expect(parseLabels('sync, maintenance\nimportant, sync')).toEqual(['sync', 'maintenance', 'important']);
  });
});