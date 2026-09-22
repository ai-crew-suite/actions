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
// Location: lint-architecture/tests/main.test.ts
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, rmSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { validatePackage } from '../src/main';

describe('Monorepo Architecture Layout Validations', () => {
  const sandboxWorkspace = join(__dirname, '../tmp-architecture-sandbox');

  beforeEach(() => {
    if (existsSync(sandboxWorkspace)) {
      rmSync(sandboxWorkspace, { recursive: true, force: true });
    }
    mkdirSync(sandboxWorkspace, { recursive: true });
    vi.spyOn(process, 'cwd').mockReturnValue(sandboxWorkspace);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (existsSync(sandboxWorkspace)) {
      rmSync(sandboxWorkspace, { recursive: true, force: true });
    }
  });

  test('✅ Should pass valid core infrastructure structures', () => {
    const targetDir = join(sandboxWorkspace, 'plugins', 'core', 'infra', 'database', 'postgres');
    mkdirSync(targetDir, { recursive: true });

    const targetFile = join(targetDir, 'package.json');
    writeFileSync(targetFile, JSON.stringify({ name: '@ai-crew-suite/infra-database-postgres' }));

    const { isValid, result } = validatePackage(targetFile);
    expect(isValid).toBe(true);
    expect(result).toBeNull();
  });

  test('❌ Should fail misaligned agent tier configurations', () => {
    const targetDir = join(sandboxWorkspace, 'plugins', 'agents', 'custom-domain', 'wrong-tier');
    mkdirSync(targetDir, { recursive: true });

    const targetFile = join(targetDir, 'package.json');
    writeFileSync(targetFile, JSON.stringify({ name: '@ai-crew-suite/agent-invalid-name-format' }));

    const { isValid, result } = validatePackage(targetFile);
    expect(isValid).toBe(false);
    expect(result).toBe('@ai-crew-suite/agent-custom-domain-wrong-tier');
  });

  test('✅ Should completely ignore unscoped packages', () => {
    const targetDir = join(sandboxWorkspace, 'plugins', 'tools', 'utility', 'helper');
    mkdirSync(targetDir, { recursive: true });

    const targetFile = join(targetDir, 'package.json');
    writeFileSync(targetFile, JSON.stringify({ name: 'third-party-unscoped-library' }));

    const { isValid, result } = validatePackage(targetFile);
    expect(isValid).toBe(true);
    expect(result).toBeNull();
  });
});
