/*
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
module.exports = {
  name: 'yarn-block-add',
  factory: (require) => {
    return {
      hooks: {
        validateProject(project, report) {
          const argv = process.argv;

          if (argv.includes('add')) {
            console.error('\n' + '='.repeat(80));
            console.error('❌ DIRECT "yarn add" COMMANDS ARE PROHIBITED IN THIS MONOREPO');
            console.error('='.repeat(80));
            console.error('\nTo keep our automated Renovate PR notifications operating correctly, all');
            console.error('dependencies must use central Named Catalogs. Direct version tracking');
            console.error('inside package.json files breaks our version-bump reporting scripts.\n');
            console.error('👉 HOW TO ADD A DEPENDENCY CORRECTLY:\n');
            console.error('1️⃣ Open the root .yarnrc.yml file.\n');
            console.error('2️⃣ Manually add the dependency and its version range inside the proper catalog:\n');
            console.error('    catalogs:');
            console.error('      prod:          # For code executed in production actions runtimes');
            console.error('        lodash: "^4.17.21"');
            console.error('      dev:           # For test, lint, and build infrastructure tooling');
            console.error('        vitest: "^1.6.0"\n');
            console.error('3️⃣ Reference it inside your target package.json using catalog syntax:\n');
            console.error('    "dependencies": {');
            console.error('      "lodash": "catalog:prod:lodash"');
            console.error('    }\n');
            console.error('4️⃣ Run a root "yarn install" to synchronize your local workspace node_modules.');
            console.error('\n' + '='.repeat(80) + '\n');

            process.exit(1);
          }
        }
      }
    };
  }
};
