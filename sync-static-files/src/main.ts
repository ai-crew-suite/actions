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