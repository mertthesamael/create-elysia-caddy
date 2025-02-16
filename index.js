#!/usr/bin/env node

/// <reference path="./types.d.ts" />

import fs from 'node:fs';
import path from 'node:path';
import minimist from 'minimist';

import {
  promptOptions,
  promptOnInvalidTemplate,
  promptOnMissingTargetDir
} from './scripts/prompt.js';

import {
  exitOnError,
  getCommandsFor,
  fillPlaceholders,
  renameIgnoreFiles,
  resolveTemplatePath,
  readScaffoldingConfigOnce
} from './scripts/utils.js';

const DEFAULT_TARGET_DIR = 'elysia-caddy-project';

try {
  /**
   * @type {{ _: string[], template?: Template }}
   */
  const argv = minimist(process.argv.slice(2));

  /**
   * @type {Options}
   */
  const options = argv.template
    ? {
        targetDir: argv._[0],
        template: argv.template
      }
    : await promptOptions(DEFAULT_TARGET_DIR);

  if (!options.targetDir) {
    options.targetDir = await promptOnMissingTargetDir(DEFAULT_TARGET_DIR);
  }

  const CWD = process.cwd();

  let templatePath = resolveTemplatePath(options.template);

  if (!fs.existsSync(templatePath)) {
    options.template = await promptOnInvalidTemplate(options.template);
    templatePath = resolveTemplatePath(options.template);
  }

  const targetDirPath = path.resolve(CWD, options.targetDir);

  console.log(`\nScaffolding project in ${targetDirPath}...`);

  if (options.targetDir !== '.') {
    fs.mkdirSync(targetDirPath);
  }

  fs.cpSync(templatePath, targetDirPath, { recursive: true });

  const config = readScaffoldingConfigOnce(targetDirPath);

  fillPlaceholders(
    targetDirPath,
    {
      $PROJECT_NAME$: path.basename(targetDirPath)
    },
    config
  );

  renameIgnoreFiles(targetDirPath, config);

  const commands = getCommandsFor(options)
    .map((command) => `\t${command}`)
    .join('\n');

  console.log(`
✅ Done. Now run:

${commands}
`);
} catch (error) {
  exitOnError(error);
}

