import * as core from '@actions/core';
import * as fs from 'fs';
import * as path from 'path';

const SCOPE = "@ai-crew-suite";

interface ValidationResult {
  isValid: boolean;
  result: string | null;
}

// Synchronously searches directories while ignoring runtime artifacts recursively
function globPackageJsons(dir: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

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
    const content = fs.readFileSync(packageJsonPath, 'utf8');
    const pkg = JSON.parse(content);
    const pkgName = pkg.name;

    if (!pkgName || !pkgName.startsWith(`${SCOPE}/`)) {
      return { isValid: true, result: null };
    }

    const workingDir = process.cwd();
    const absolutePath = path.resolve(packageJsonPath);

    if (!absolutePath.startsWith(workingDir)) {
      return { isValid: false, result: `Package file ${packageJsonPath} is outside working directory.` };
    }

    const relPath = path.relative(workingDir, path.dirname(absolutePath));
    const segments = relPath.split(path.sep);

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
  const rootPlugins = path.join(process.cwd(), 'plugins');

  if (!fs.existsSync(rootPlugins)) {
    core.setFailed("❌ Error: Must run this script from the root of your turbo monorepo.");
    return;
  }

  core.info(`Checking architecture constraints for scope: ${SCOPE}...\n`);
  const packageJsons = globPackageJsons(rootPlugins);

  for (const pJson of packageJsons) {
    const { isValid, result } = validatePackage(pJson);

    if (!isValid) {
      exitCode = 1;
      const relLocation = path.relative(process.cwd(), path.dirname(pJson));
      core.error("❌ Architecture Violation Found!");
      core.error(`  Location: ${relLocation}`);

      if (result && result.startsWith(SCOPE)) {
        let foundName = "Unknown";
        try {
          foundName = JSON.parse(fs.readFileSync(pJson, 'utf8')).name || "Unknown";
        } catch {}
        core.error(`  Found   : "${foundName}"`);
        core.error(`  Expected: "${result}"\n`);
      } else {
        core.error(`  Error   : ${result}\n`);
      }
    }
  }

  if (exitCode === 0) {
    core.info("✅ Success: All internal workspace names perfectly match the structural layout rules.");
  } else {
    core.setFailed("❌ Architecture check failed due to naming convention drifts.");
  }
}

if (require.main === module) {
  run();
}
