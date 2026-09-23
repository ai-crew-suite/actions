import { isAbsolute, normalize, relative, resolve, sep } from 'node:path';
import type { FilePlan, RepositoryPlan, SyncConfig, SyncGroup } from './types.js';

function groupsFromConfig(config: SyncConfig): SyncGroup[] {
  return Object.values(config).flatMap(group => (Array.isArray(group) ? group : [group]));
}

function repositoryName(value: string): { owner: string; name: string } {
  const [owner, name] = value.trim().split('/');
  if (!owner || !name || name.includes('/')) {
    throw new Error(`Invalid repository name: ${value}`);
  }
  return { owner, name };
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