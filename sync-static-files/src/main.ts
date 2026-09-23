import { info, setFailed } from '@actions/core';
import * as github from '@actions/github';
import { readConfig } from './config.js';
import { syncRepository } from './git.js';
import { loadConfig } from './loader.js';
import { buildPlans } from './planner.js';

export async function run(): Promise<void> {
  try {
    const config = readConfig();
    const syncConfig = await loadConfig(config.sourcePath);
    const plans = buildPlans(syncConfig, `${config.sourcePath}/src`);
    const client = github.getOctokit(config.token).rest as Parameters<typeof syncRepository>[0];
    const sourceRepository = `${github.context.repo.owner}/${github.context.repo.repo}`;

    for (const plan of plans) {
      const pullRequest = await syncRepository(client, plan, sourceRepository, config.token, config.labels);
      info(pullRequest ? `Updated ${plan.owner}/${plan.name}: ${pullRequest.html_url}` : `No changes for ${plan.owner}/${plan.name}`);
    }
  } catch (error) {
    setFailed(error instanceof Error ? error.message : String(error));
  }
}

if (process.env['NODE_ENV'] !== 'test') void run();