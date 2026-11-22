#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const NULL_SHA_RE = /^0+$/;
const DEFAULT_BASE_CANDIDATES = ['origin/develop', 'develop', 'origin/main', 'main', 'HEAD~1'];

function printHelp() {
  const text = `Usage: node scripts/affected-apps.mjs [options]

Detect affected apps under apps/* via Turborepo dependency graph.

Options:
  --base <ref>           Git base ref/SHA (default: TURBO_SCM_BASE or auto-detect)
  --head <ref>           Optional Git head ref/SHA (default: TURBO_SCM_HEAD or working tree)
  --mode <mode>          Detection mode: ref | deploy-tags (default: ref)
  --tag-prefix <prefix>  Tag prefix for deploy-tags mode (default: deploy/)
  --app <nameOrDir>      Target a single app by package name or directory name
  --all                  Force select all apps (or the single --app if specified)
  --format <format>      Output format: pretty | json | matrix | names | dirs (default: pretty)
  --github-output <file> Append outputs for GitHub Actions ($GITHUB_OUTPUT)
  --dotenv <file>        Write GitLab CI dotenv artifact file
  --cwd <dir>            Repository root directory (default: process.cwd())
  -h, --help             Show this help message
`;
  process.stdout.write(text);
}

function parseArgs(argv) {
  const options = {
    base: undefined,
    head: undefined,
    mode: 'ref',
    tagPrefix: 'deploy/',
    app: undefined,
    all: false,
    format: 'pretty',
    githubOutput: undefined,
    dotenv: undefined,
    cwd: process.cwd(),
    help: false,
  };

  const valueFlags = new Set([
    '--base',
    '--head',
    '--mode',
    '--tag-prefix',
    '--app',
    '--format',
    '--github-output',
    '--dotenv',
    '--cwd',
  ]);

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '-h' || arg === '--help') {
      options.help = true;
      continue;
    }
    if (arg === '--all') {
      options.all = true;
      continue;
    }

    let flag = arg;
    let value;
    const eqIdx = arg.indexOf('=');
    if (eqIdx !== -1) {
      flag = arg.slice(0, eqIdx);
      value = arg.slice(eqIdx + 1);
    }

    if (!valueFlags.has(flag)) {
      throw new Error(`Unknown option: ${arg}`);
    }

    if (value === undefined) {
      if (i + 1 >= argv.length) {
        throw new Error(`Missing value for option: ${flag}`);
      }
      value = argv[i + 1];
      i += 1;
    }

    switch (flag) {
      case '--base':
        options.base = value;
        break;
      case '--head':
        options.head = value;
        break;
      case '--mode':
        options.mode = value;
        break;
      case '--tag-prefix':
        options.tagPrefix = value;
        break;
      case '--app':
        options.app = value;
        break;
      case '--format':
        options.format = value;
        break;
      case '--github-output':
        options.githubOutput = value;
        break;
      case '--dotenv':
        options.dotenv = value;
        break;
      case '--cwd':
        options.cwd = path.resolve(value);
        break;
      default:
        throw new Error(`Unsupported option: ${flag}`);
    }
  }

  if (!['ref', 'deploy-tags'].includes(options.mode)) {
    throw new Error(`Invalid --mode "${options.mode}". Expected "ref" or "deploy-tags".`);
  }
  if (!['pretty', 'json', 'matrix', 'names', 'dirs'].includes(options.format)) {
    throw new Error(
      `Invalid --format "${options.format}". Expected pretty, json, matrix, names, or dirs.`,
    );
  }

  return options;
}

function resolveTurboBin(cwd) {
  const binName = process.platform === 'win32' ? 'turbo.cmd' : 'turbo';
  const candidates = [
    path.join(cwd, 'node_modules', '.bin', binName),
    path.resolve(SCRIPT_DIR, '..', 'node_modules', '.bin', binName),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return binName;
}

function runTurboLs(turboBin, cwd, extraArgs, extraEnv = {}) {
  const args = ['ls', ...extraArgs, '--output=json'];
  let stdout;
  try {
    stdout = execFileSync(turboBin, args, {
      cwd,
      env: {
        ...process.env,
        TURBO_TELEMETRY_DISABLED: '1',
        ...extraEnv,
      },
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    const stderr = error.stderr ? String(error.stderr).trim() : error.message;
    throw new Error(`Failed running turbo ${args.join(' ')}: ${stderr}`);
  }

  const jsonStart = stdout.indexOf('{');
  if (jsonStart === -1) {
    throw new Error(`Unexpected turbo ls output (no JSON object found): ${stdout}`);
  }
  const parsed = JSON.parse(stdout.slice(jsonStart));
  return parsed.packages?.items ?? [];
}

function normalizeApp(item, reason) {
  const normalizedPath = item.path.replace(/\\/g, '/');
  const dir = path.posix.basename(normalizedPath);
  const envSuffix = dir.toUpperCase().replace(/[^A-Z0-9]+/g, '_');
  return {
    name: item.name,
    dir,
    path: normalizedPath,
    distDir: `${normalizedPath}/dist`,
    envFlag: `DEPLOY_${envSuffix}`,
    reason,
  };
}

function resolveGitBin() {
  if (process.platform === 'win32') {
    return 'git';
  }
  const pathDirs = (process.env.PATH || '').split(path.delimiter).filter(Boolean);
  const candidates = [
    ...pathDirs.map((dir) => path.join(dir, 'git')),
    '/opt/homebrew/bin/git',
    '/usr/local/bin/git',
    '/usr/bin/git',
  ];
  for (const candidate of candidates) {
    try {
      fs.accessSync(candidate, fs.constants.X_OK);
      return candidate;
    } catch {
      // Ignore missing or inaccessible PATH entries (e.g. sandboxed home dirs).
    }
  }
  return 'git';
}

const GIT_BIN = resolveGitBin();

function gitRefExists(cwd, ref) {
  if (!ref || NULL_SHA_RE.test(ref)) {
    return false;
  }
  try {
    execFileSync(GIT_BIN, ['rev-parse', '--verify', '--quiet', `${ref}^{commit}`], {
      cwd,
      stdio: ['ignore', 'ignore', 'ignore'],
    });
    return true;
  } catch (error) {
    if (error.status === undefined || error.status === null) {
      throw new Error(`Failed executing git (${GIT_BIN}): ${error.message}`);
    }
    return false;
  }
}

function resolveBaseRef(cwd, explicitBase) {
  const configured = explicitBase || process.env.TURBO_SCM_BASE || '';
  if (configured) {
    if (gitRefExists(cwd, configured)) {
      return { base: configured, valid: true };
    }
    return { base: configured, valid: false };
  }

  for (const candidate of DEFAULT_BASE_CANDIDATES) {
    if (gitRefExists(cwd, candidate)) {
      return { base: candidate, valid: true };
    }
  }
  return { base: null, valid: false };
}

function buildHeadEnv(explicitHead) {
  const head = explicitHead || process.env.TURBO_SCM_HEAD || '';
  if (!head) {
    return {};
  }
  return { TURBO_SCM_HEAD: head };
}

function detectAffectedApps(options) {
  const turboBin = resolveTurboBin(options.cwd);
  const rawApps = runTurboLs(turboBin, options.cwd, ['--filter={./apps/*}']);
  const allApps = rawApps
    .map((item) => normalizeApp(item, 'discovered'))
    .sort((a, b) => a.dir.localeCompare(b.dir));

  let targetApps = allApps;
  if (options.app) {
    const matched = allApps.filter(
      (app) => app.name === options.app || app.dir === options.app || app.path === options.app,
    );
    if (matched.length === 0) {
      const available = allApps.map((app) => `${app.dir} (${app.name})`).join(', ');
      throw new Error(`Unknown app "${options.app}". Available apps: ${available}`);
    }
    targetApps = matched;
  }

  if (options.all) {
    return {
      allApps,
      affectedApps: targetApps.map((app) => ({ ...app, reason: 'forced-all' })),
      base: options.mode === 'ref' ? options.base || process.env.TURBO_SCM_BASE || null : null,
      tagPrefix: options.mode === 'deploy-tags' ? options.tagPrefix : null,
    };
  }

  const headEnv = buildHeadEnv(options.head);

  if (options.mode === 'deploy-tags') {
    const affectedApps = [];
    for (const app of targetApps) {
      const tag = `${options.tagPrefix}${app.dir}`;
      const tagRef = `refs/tags/${tag}`;
      if (!gitRefExists(options.cwd, tagRef)) {
        affectedApps.push({ ...app, reason: 'no-deploy-tag' });
        continue;
      }

      const items = runTurboLs(turboBin, options.cwd, ['--affected', `--filter=${app.name}`], {
        TURBO_SCM_BASE: tagRef,
        ...headEnv,
      });
      if (items.length > 0) {
        affectedApps.push({ ...app, reason: `changed-since:${tag}` });
      }
    }

    return {
      allApps,
      affectedApps,
      base: null,
      tagPrefix: options.tagPrefix,
    };
  }

  const { base, valid } = resolveBaseRef(options.cwd, options.base);
  if (!valid) {
    const label = base ?? '<none>';
    process.stderr.write(
      `[affected-apps] Warning: git base ref "${label}" is missing or invalid; falling back to all target apps.\n`,
    );
    return {
      allApps,
      affectedApps: targetApps.map((app) => ({ ...app, reason: 'fallback-all-invalid-base' })),
      base,
      tagPrefix: null,
    };
  }

  const filterExpr = options.app ? targetApps[0].name : '{./apps/*}';
  const items = runTurboLs(turboBin, options.cwd, ['--affected', `--filter=${filterExpr}`], {
    TURBO_SCM_BASE: base,
    ...headEnv,
  });

  const reason = `changed-since:${base}`;
  const affectedApps = items
    .map((item) => normalizeApp(item, reason))
    .sort((a, b) => a.dir.localeCompare(b.dir));

  return {
    allApps,
    affectedApps,
    base,
    tagPrefix: null,
  };
}

function formatPretty(result, options) {
  const lines = [];
  lines.push(`Mode: ${options.mode}`);
  if (result.base) {
    lines.push(`Base: ${result.base}`);
  }
  if (result.tagPrefix) {
    lines.push(`Tag Prefix: ${result.tagPrefix}`);
  }
  lines.push(`Affected Apps: ${result.affectedApps.length} / ${result.allApps.length}`);

  if (result.affectedApps.length === 0) {
    lines.push('No affected apps detected.');
    return `${lines.join('\n')}\n`;
  }

  lines.push('');
  for (const app of result.affectedApps) {
    lines.push(`- ${app.dir} (${app.name}) [${app.path}] -> ${app.reason}`);
  }

  const filterArgs = result.affectedApps.map((app) => `--filter=${app.name}...`).join(' ');
  lines.push('');
  lines.push(`Suggested build command: pnpm exec turbo run build ${filterArgs}`);
  return `${lines.join('\n')}\n`;
}

function writeGithubOutput(filePath, result) {
  const names = result.affectedApps.map((app) => app.name).join(' ');
  const dirs = result.affectedApps.map((app) => app.dir).join(' ');
  const lines = [
    `affected_apps=${JSON.stringify(result.affectedApps)}`,
    `has_affected=${String(result.affectedApps.length > 0)}`,
    `affected_count=${String(result.affectedApps.length)}`,
    `affected_dirs=${dirs}`,
    `affected_names=${names}`,
  ];
  fs.appendFileSync(filePath, `${lines.join('\n')}\n`, 'utf8');
}

function writeDotenv(filePath, result) {
  const affectedDirs = new Set(result.affectedApps.map((app) => app.dir));
  const names = result.affectedApps.map((app) => app.name).join(' ');
  const dirs = result.affectedApps.map((app) => app.dir).join(' ');
  const lines = [
    `HAS_AFFECTED=${String(result.affectedApps.length > 0)}`,
    `AFFECTED_COUNT=${String(result.affectedApps.length)}`,
    `AFFECTED_DIRS=${dirs}`,
    `AFFECTED_NAMES=${names}`,
  ];

  for (const app of result.allApps) {
    lines.push(`${app.envFlag}=${String(affectedDirs.has(app.dir))}`);
  }

  fs.mkdirSync(path.dirname(path.resolve(filePath)), { recursive: true });
  fs.writeFileSync(filePath, `${lines.join('\n')}\n`, 'utf8');
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`Error: ${error.message}\n`);
    process.exit(1);
  }

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  let result;
  try {
    result = detectAffectedApps(options);
  } catch (error) {
    process.stderr.write(`Error: ${error.message}\n`);
    process.exit(1);
  }

  if (options.githubOutput) {
    writeGithubOutput(options.githubOutput, result);
  }
  if (options.dotenv) {
    writeDotenv(options.dotenv, result);
  }

  const payload = {
    mode: options.mode,
    base: result.base,
    tagPrefix: result.tagPrefix,
    totalApps: result.allApps.length,
    affectedCount: result.affectedApps.length,
    hasAffected: result.affectedApps.length > 0,
    apps: result.affectedApps,
  };

  switch (options.format) {
    case 'pretty':
      process.stdout.write(formatPretty(result, options));
      break;
    case 'json':
      process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
      break;
    case 'matrix':
      process.stdout.write(`${JSON.stringify(result.affectedApps)}\n`);
      break;
    case 'names':
      process.stdout.write(`${result.affectedApps.map((app) => app.name).join(' ')}\n`);
      break;
    case 'dirs':
      process.stdout.write(`${result.affectedApps.map((app) => app.dir).join(' ')}\n`);
      break;
  }
}

main();
