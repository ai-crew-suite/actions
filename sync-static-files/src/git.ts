import { execFile } from 'node:child_process';
import { cp, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import type { FilePlan, RepositoryPlan } from './types.js';

const exec = promisify(execFile);
const branchPrefix = 'maintenance';

export interface PullRequest {
  number: number;
  html_url: string;
  body: string | null;
}

export interface GitHubClient {
  repos: {
    get(params: { owner: string; repo: string }): Promise<{ data: { default_branch: string } }>;
  };
  pulls: {
    list(params: { owner: string; repo: string; state: 'open'; head: string }): Promise<{ data: PullRequest[] }>;
    create(params: Record<string, string>): Promise<{ data: PullRequest }>;
    update(params: Record<string, string | number>): Promise<{ data: PullRequest }>;
  };
  issues: { addLabels(params: { owner: string; repo: string; issue_number: number; labels: string[] }): Promise<unknown> };
}

async function runGit(args: string[], cwd?: string): Promise<string> {
  const result = await exec('git', args, { cwd, maxBuffer: 10 * 1024 * 1024 });
  return result.stdout.trim();
}

function repositoryUrl(owner: string, name: string, token: string): string {
  return `https://x-access-token:${encodeURIComponent(token)}@github.com/${owner}/${name}.git`;
}

export async function syncRepository(
  client: GitHubClient,
  plan: RepositoryPlan,
  sourceRepository: string,
  token: string,
  labels: string[],
): Promise<PullRequest | undefined> {
  const directory = await mkdtemp(join(tmpdir(), 'sync-static-files-'));
  const branch = `${branchPrefix}/${sourceRepository.split('/').at(-1)}`;
  try {
    const { data: repository } = await client.repos.get({ owner: plan.owner, repo: plan.name });
    const url = repositoryUrl(plan.owner, plan.name, token);
    await runGit(['clone', '--depth', '1', '--branch', repository.default_branch, url, directory]);
    await runGit(['config', 'user.name', 'github-actions[bot]'], directory);
    await runGit(['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com'], directory);
    await runGit(['checkout', '-B', branch], directory);

    for (const file of plan.files) await copyFile(file, directory);

    await runGit(['add', '--all'], directory);
    if (!(await runGit(['status', '--porcelain'], directory))) return undefined;
    await runGit(['commit', '-m', `maintenance: sync static files from ${sourceRepository}`], directory);
    await runGit(['push', '--force', 'origin', branch], directory);

    const existing = await client.pulls.list({ owner: plan.owner, repo: plan.name, state: 'open', head: `${plan.owner}:${branch}` });
    const body = `Synchronize static files from [${sourceRepository}](https://github.com/${sourceRepository}).`;
    const pullRequest = existing.data[0]
      ? (await client.pulls.update({ owner: plan.owner, repo: plan.name, pull_number: existing.data[0].number, title: 'maintenance: sync static files', body })).data
      : (await client.pulls.create({ owner: plan.owner, repo: plan.name, title: 'maintenance: sync static files', head: branch, base: repository.default_branch, body })).data;
    if (labels.length) {
      await client.issues.addLabels({ owner: plan.owner, repo: plan.name, issue_number: pullRequest.number, labels });
    }
    return pullRequest;
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

async function copyFile(file: FilePlan, repositoryDirectory: string): Promise<void> {
  if (!existsSync(file.sourcePath)) throw new Error(`Source file not found: ${file.sourcePath}`);
  const destination = join(repositoryDirectory, file.dest);
  await mkdir(join(destination, '..'), { recursive: true });
  await cp(file.sourcePath, destination, { recursive: true, force: true });
}