import { expect, test } from 'vitest'
import { run } from '../src/run.js'

import * as core from '@actions/core';
import { run } from '../src/main';

jest.mock('@actions/core');

test('reads inputs and logs progress accurately', async () => {
  // Mock the GitHub action runner environment inputs
  (core.getInput as jest.Mock).mockReturnValue('my-python-script.py');

  await run();

  // Verify the action reacted appropriately
  expect(core.info).toHaveBeenCalledWith('Executing my-python-script.py...');
});
