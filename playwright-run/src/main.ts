import * as core from '@actions/core';
import * as github from '@actions/github';

export function findSuccessForSha(runs: any[], expectedSha: string): boolean {
  for (const workflowRun of runs) {
    if (!workflowRun || workflowRun.head_sha !== expectedSha) {
      continue;
    }
    return workflowRun.conclusion === 'success';
  }
  return false;
}

export async function run(): Promise<void> {
  try {
    // 1. Gather all inputs using the standard core SDK instead of manual env parsing
    const token = core.getInput('github_token', { required: true });
    const expectedSha = core.getInput('expected_sha', { required: true });
    const workflowFile = core.getInput('workflow_file') || 'playwright.yml';

    const perPageInput = core.getInput('per_page') || '50';
    const perPage = parseInt(perPageInput, 10) || 50;

    const preReleaseBypass = core.getInput('pre_release_bypass') || 'true';

    // 2. Resolve target repository naming matrices natively
    const { owner, repo } = github.context.repo;
    if (!owner || !repo) {
      throw new Error('Could not resolve repository owner or name from context targets.');
    }

    core.info(`🔍 Checking completed runs of '${workflowFile}' in ${owner}/${repo} for SHA: ${expectedSha}...`);

    // 3. Initialize Octokit and fetch completed workflow runs
    const octokit = github.getOctokit(token);

    const { data } = await octokit.rest.actions.listWorkflowRuns({
      owner,
      repo,
      workflow_id: workflowFile,
      status: 'completed',
      per_page: perPage,
    });

    const runs = data.workflow_runs || [];

    // 4. Evaluate the run status and enforce gates
    if (findSuccessForSha(runs, expectedSha)) {
      core.info('✅ Playwright succeeded for this SHA');
      return;
    }

    // Handle early development pre-release bypass conditions
    if (preReleaseBypass.toLowerCase() === 'true') {
      core.warning(`⚠️ WARNING: Playwright has not completed successfully for SHA ${expectedSha}!`);
      core.warning('⚠️ [EARLY DEVELOPMENT BYPASS] Allowing deployment anyway. Remember to enforce this check later.');
      return;
    }

    core.setFailed(`❌ Playwright has not completed successfully for SHA ${expectedSha}; aborting deploy.`);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(`Guardrail Execution Failure: ${error.message}`);
    }
  }
}

if (require.main === module) {
  run();
}
