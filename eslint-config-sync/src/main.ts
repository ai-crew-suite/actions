// Location: ai-crew-suite/actions -> eslint-alignment-check/src/main.ts
import * as core from '@actions/core';
import * as github from '@actions/github';
import * as fs from 'fs';
import * as path from 'path';

interface GitHubFile {
  filename: string;
}

// Safer network fetch wrapper using standard dynamic native global fetch
async function fetchUrl(url: string, headers?: Record<string, string>): Promise<string | null> {
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) return null;
    return await res.text();
  } catch (error) {
    core.warning(`⚠️ Error fetching URL ${url}: ${error}`);
    return null;
  }
}

// Native translation of the Copilot Bearer Token Exchange loop & Chat Query
async function askGithubLLM(token: string, prompt: string): Promise<string> {
  try {
    // 1. Swap the GITHUB_TOKEN for an operational short-lived Copilot Proxy Token
    const tokenRes = await fetch('https://api.github.com/copilot_internal/v2/token', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'TS-GHA-Sync-Audit',
      }
    });

    if (!tokenRes.ok) {
      throw new Error(`Token exchange failed with status ${tokenRes.status}`);
    }

    const tokenData = (await tokenRes.json()) as { token?: string };
    const copilotToken = tokenData.token;

    if (!copilotToken) {
      return '❌ Failed to resolve an operational Copilot session proxy token.';
    }

    // 2. Query GitHub Copilot's hosted LLM proxy endpoints natively
    const completionsRes = await fetch('https://api.githubcopilot.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${copilotToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'TS-GHA-Sync-Audit',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a senior frontend engineer comparing JavaScript/TypeScript configuration changes.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
      }),
    });

    if (!completionsRes.ok) {
      throw new Error(`LLM Query failed with status ${completionsRes.status}`);
    }

    const resData = (await completionsRes.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    return resData.choices[0]?.message?.content || 'Empty response from AI engine.';
  } catch (error) {
    core.warning(`⚠️ Native GitHub Copilot LLM proxy call failed: ${error}`);
    return 'Could not generate AI analysis due to token validation or runtime timeout errors.';
  }
}

export async function run(): Promise<void> {
  try {
    const githubToken = process.env['GITHUB_TOKEN'];
    if (!githubToken) {
      core.setFailed('❌ GITHUB_TOKEN is missing from execution environment.');
      return;
    }

    const eventPath = process.env['GITHUB_EVENT_PATH'];
    if (!eventPath || !fs.existsSync(eventPath)) {
      core.info('✅ Missing or invalid GITHUB_EVENT_PATH context. Skipping audit.');
      return;
    }

    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
    const prNumber = eventData.pull_request?.number;
    const commentsUrl = eventData.pull_request?.comments_url;

    if (!prNumber || !commentsUrl) {
      core.info('✅ Event is not a pull request context pass. Skipping analysis.');
      return;
    }

    // 1. Resolve @backstage/cli target version
    let backstageCliVersion: string | null = null;

    if (fs.existsSync('package.json')) {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      backstageCliVersion = deps['@backstage/cli'] || null;
    }

    // Fallback to checking the lockfile if package.json uses workspace protocols
    if (!backstageCliVersion && fs.existsSync('yarn.lock')) {
      const lockfileContent = fs.readFileSync('yarn.lock', 'utf8');
      const lockMatch = lockfileContent.match(/"?@backstage\/cli@.*[\s\S]*?version "([^"]+)"/);
      if (lockMatch) {
        backstageCliVersion = lockMatch[1] || null;
      }
    }

    if (!backstageCliVersion) {
      core.info('✅ Could not locate an active @backstage/cli version block in this workspace.');
      return;
    }

    const cleanVersion = backstageCliVersion.replace(/[^\d.]/g, '');
    core.info(`🔍 Syncing alignment against upstream @backstage/cli version: ${cleanVersion}`);

    // 2. Safely resolve upstream content templates from Spotify repositories
    const specificTagUrl = `https://githubusercontent.com{cleanVersion}/packages/cli/config/eslint-factory.js`;
    const minorVersion = cleanVersion.split('.').slice(0, 2).join('.');
    const fallbackBranchUrl = `https://githubusercontent.com{minorVersion}/packages/cli/config/eslint-factory.js`;

    let upstreamSource = await fetchUrl(specificTagUrl);
    if (!upstreamSource || upstreamSource.includes('404: Not Found')) {
      upstreamSource = await fetchUrl(fallbackBranchUrl);
    }

    if (!upstreamSource || upstreamSource.includes('404: Not Found')) {
      core.info('⚠️ Failed to locate upstream eslint-factory.js template assets for this pass.');
      return;
    }

    // 3. Extract local implementation mappings
    const localConfigPath = 'packages/config-eslint/src/index.ts';
    let localSource = '';
    if (fs.existsSync(localConfigPath)) {
      localSource = fs.readFileSync(localConfigPath, 'utf8');
    }

    // 4. Prompt your system AI context layer
    const aiPrompt = `
Our repository decouples Spotify Backstage configs into a separate ESM package. 
Compare our local configuration against the upstream core '@backstage/cli' version (${cleanVersion}) content provided below.

Task:
Identify any new core eslint plugins, configurations, or critical custom rules introduced in the Upstream file that our Local file completely lacks. Summarize them in a short markdown bulleted list.

--- UPSTREAM FILE CONTENT ---
${upstreamSource}

--- OUR LOCAL FILE CONTENT ---
${localSource}
`;

    core.info('🤖 Querying native GitHub Copilot LLM engine for diff analysis...');
    const aiAnalysis = await askGithubLLM(githubToken, aiPrompt);

    // 5. Construct Markdown Output
    const body = `### ⚠️ Upstream ESLint Config Alignment Check
The core upstream **@backstage/cli (${cleanVersion})** base configurations have been mapped against your local configuration to isolate structural changes.

#### 🤖 Copilot Gap Assessment Report:
${aiAnalysis}

_Please review \`\${localConfigPath}\` if critical rules require structural adjustments to maintain upstream parity._`;

    // 6. Post back directly to the PR comments array using Octokit
    const octokit = github.getOctokit(githubToken);
    await octokit.rest.issues.createComment({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: prNumber,
      body: body,
    });

    core.info('🎉 Alignment status comment posted to the Pull Request successfully.');
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(`Audit script failure: ${error.message}`);
    }
  }
}

run();
