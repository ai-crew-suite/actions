// Location: ai-crew-suite/actions -> lint-architecture/src/main.test.ts
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { validatePackage } from './main';

describe('Monorepo Architecture Layout Validations', () => {
  const sandboxWorkspace = path.join(__dirname, '../tmp-architecture-sandbox');

  beforeEach(() => {
    // Generate an isolated, clean repository filesystem context for each validation run
    if (fs.existsSync(sandboxWorkspace)) {
      fs.rmSync(sandboxWorkspace, { recursive: true, force: true });
    }
    fs.mkdirSync(sandboxWorkspace, { recursive: true });
    vi.spyOn(process, 'cwd').mockReturnValue(sandboxWorkspace);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (fs.existsSync(sandboxWorkspace)) {
      fs.rmSync(sandboxWorkspace, { recursive: true, force: true });
    }
  });

  test('✅ Should pass valid core infrastructure structures', () => {
    const targetDir = path.join(sandboxWorkspace, 'plugins/core/infra/database/postgres');
    fs.mkdirSync(targetDir, { recursive: true });

    const targetFile = path.join(targetDir, 'package.json');
    fs.writeFileSync(targetFile, JSON.stringify({ name: '@ai-crew-suite/infra-database-postgres' }));

    const { isValid, result } = validatePackage(targetFile);
    expect(isValid).toBe(true);
    expect(result).toBeNull();
  });

  test('❌ Should fail misaligned agent tier configurations', () => {
    const targetDir = path.join(sandboxWorkspace, 'plugins/agents/custom-domain/wrong-tier');
    fs.mkdirSync(targetDir, { recursive: true });

    const targetFile = path.join(targetDir, 'package.json');
    fs.writeFileSync(targetFile, JSON.stringify({ name: '@ai-crew-suite/agent-invalid-name-format' }));

    const { isValid, result } = validatePackage(targetFile);
    expect(isValid).toBe(false);
    expect(result).toBe('@ai-crew-suite/agent-custom-domain-wrong-tier');
  });

  test('✅ Should completely ignore untracked or non-scoped packages', () => {
    const targetDir = path.join(sandboxWorkspace, 'plugins/tools/utility/helper');
    fs.mkdirSync(targetDir, { recursive: true });

    const targetFile = path.join(targetDir, 'package.json');
    fs.writeFileSync(targetFile, JSON.stringify({ name: 'third-party-unscoped-library' }));

    const { isValid, result } = validatePackage(targetFile);
    expect(isValid).toBe(true);
    expect(result).toBeNull();
  });
});
