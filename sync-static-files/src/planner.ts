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
import { isAbsolute, normalize, relative, resolve, sep } from 'node:path';
import type { FilePlan, RepositoryPlan, SyncConfig, SyncGroup } from './types.js';

function groupsFromConfig(config: SyncConfig): SyncGroup[] {
  return Object.values(config).flatMap(group => (Array.isArray(group) ? group : [group]));
}

function repositoryName(value: string): { owner: string; name: string } {
  const parts = value.trim().split('/');

  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error(`Invalid repository name: ${value}`);
  }

  return { owner: parts[0], name: parts[1] };
}

function resolveInside(root: string, candidate: string, description: string): string {
  const resolvedRoot = resolve(root);
  const resolvedCandidate = resolve(resolvedRoot, candidate);
  const pathFromRoot = relative(resolvedRoot, resolvedCandidate);

  if (isAbsolute(pathFromRoot) || pathFromRoot === '..' || pathFromRoot.startsWith(`..${sep}`)) {
    throw new Error(`${description} must stay inside ${resolvedRoot}: ${candidate}`);
  }

  return resolvedCandidate;
}

export function buildPlans(config: SyncConfig, sourceRoot: string): RepositoryPlan[] {
  const plans = new Map<string, RepositoryPlan>();

  for (const group of groupsFromConfig(config)) {
    if (!group || !Array.isArray(group.files)) {
      throw new Error('Each sync group must contain a files array');
    }

    const repositories = typeof group.repos === 'string' ? group.repos.split(/\r?\n/) : group.repos;

    for (const repository of repositories.map(value => value.trim()).filter(Boolean)) {
      const target = repositoryName(repository);
      const key = `${target.owner}/${target.name}`;
      const plan = plans.get(key) ?? { ...target, files: [] };

      for (const file of group.files) {
        if (!file?.source || !file.dest) {
          throw new Error(`Invalid file mapping in group ${group.name ?? 'unnamed'}`);
        }

        const normalizedDestination = normalize(file.dest);

        if (isAbsolute(file.dest) || normalizedDestination === '..' || normalizedDestination.startsWith(`..${sep}`)) {
          throw new Error(`Destination path must stay inside the target repository: ${file.dest}`);
        }

        const filePlan: FilePlan = {
          ...file,
          sourcePath: resolveInside(sourceRoot, file.source, 'Source path'),
        };

        const duplicate = plan.files.find(existing => existing.dest === file.dest);

        if (duplicate) {
          if (duplicate.source !== file.source) {
            throw new Error(`Conflicting mappings for ${key}:${file.dest}`);
          }

          continue;
        }

        plan.files.push(filePlan);
      }

      plans.set(key, plan);
    }
  }

  return [...plans.values()];
}

export function parseLabels(value: string): string[] {
  return [...new Set(value.split(/[\n,]/).map(label => label.trim()).filter(Boolean))];
}