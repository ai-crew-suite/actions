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
import { setFailed, error, info } from '@actions/core';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { dirname, join, resolve, relative, sep } from 'path';

const SCOPE = "@ai-crew-suite";

interface ValidationResult {
  isValid: boolean;
  result: string | null;
}

function globPackageJsons(dir: string): string[] {
  let results: string[] = [];
  if (!existsSync(dir)) return results;

  const list = readdirSync(dir);
  for (const file of list) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat && stat.isDirectory()) {
      if (file === 'node_modules' || file === 'dist' || file === '.turbo' || file === '.yarn') {
        continue;
      }
      results = results.concat(globPackageJsons(filePath));
    } else if (file === 'package.json') {
      results.push(filePath);
    }
  }
  return results;
}

export function validatePackage(packageJsonPath: string): ValidationResult {
  try {
    const content = readFileSync(packageJsonPath, 'utf8');
    const pkg = JSON.parse(content);
    const pkgName = pkg.name;

    if (!pkgName || !pkgName.startsWith(`${SCOPE}/`)) {
      return { isValid: true, result: null };
    }

    const workingDir = process.cwd();
    const absolutePath = resolve(packageJsonPath);

    // 🔴 FIX: Restored native 'absolutePath.startsWith' string method call
    if (!absolutePath.startsWith(workingDir)) {
      return { isValid: false, result: `Package file ${packageJsonPath} is outside working directory.` };
    }

    const relPath = relative(workingDir, dirname(absolutePath));
    // 🔴 FIX: Restored native 'relPath.split' character separator array split
    const segments = relPath.split(sep);

    if (segments.length < 2 || segments[0] !== 'plugins') {
      return { isValid: true, result: null };
    }

    let expectedName: string | null = null;
    const category = segments[1];

    if (category === 'core') {
      if (segments.length >= 3) {
        if (segments[2] !== 'infra') {
          const tier = segments[2];
          expectedName = `${SCOPE}/core-${tier}`;
        } else if (segments.length >= 5) {
          const domain = segments[3];
          const provider = segments[4];
          expectedName = `${SCOPE}/infra-${domain}-${provider}`;
        }
      }
    } else if (category === 'agents') {
      if (segments.length >= 3) {
        if (segments[2] === 'core-frontend') {
          expectedName = `${SCOPE}/agent-core-frontend`;
        } else if (segments.length >= 4) {
          const domain = segments[2];
          const tier = segments[3];
          expectedName = `${SCOPE}/agent-${domain}-${tier}`;
        }
      }
    } else if (category === 'tools') {
      if (segments.length >= 4) {
        const domain = segments[2];
        const provider = segments[3];
        expectedName = `${SCOPE}/tool-${domain}-${provider}`;
      }
    }

    if (expectedName && pkgName !== expectedName) {
      return { isValid: false, result: expectedName };
    }

    return { isValid: true, result: null };
  } catch (error: any) {
    return { isValid: false, result: `Failed to read or parse file: ${error.message}` };
  }
}

export function run(): void {
  let exitCode = 0;
  const rootPlugins = join(process.cwd(), 'plugins');

  if (!existsSync(rootPlugins)) {
    setFailed("❌ Error: Must run this script from the root of your turbo monorepo.");
    return;
  }

  info(`Checking architecture constraints for scope: ${SCOPE}...\n`);
  const packageJsons = globPackageJsons(rootPlugins);

  for (const pJson of packageJsons) {
    const { isValid, result } = validatePackage(pJson);

    if (!isValid) {
      exitCode = 1;
      const relLocation = relative(process.cwd(), dirname(pJson));
      error("❌ Architecture Violation Found!");
      error(`  Location: ${relLocation}`);

      if (result && result.startsWith(SCOPE)) {
        let foundName = "Unknown";
        try {
          foundName = JSON.parse(readFileSync(pJson, 'utf8')).name || "Unknown";
        } catch {}
        error(`  Found   : "${foundName}"`);
        error(`  Expected: "${result}"\n`);
      } else {
        error(`  Error   : ${result}\n`);
      }
    }
  }

  if (exitCode === 0) {
    info("✅ Success: All internal workspace names perfectly match the structural layout rules.");
  } else {
    setFailed("❌ Architecture check failed due to naming convention drifts.");
  }
}

if (typeof require !== 'undefined' && require.main === module) {
  run();
}
