import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tsParser from '@typescript-eslint/parser';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import { createNodeResolver, importX } from 'eslint-plugin-import-x';

const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));

function listSubdirs(parentDir) {
  if (!fs.existsSync(parentDir)) {
    return [];
  }
  return fs
    .readdirSync(parentDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

const APPS = listSubdirs(path.join(ROOT_DIR, 'apps')).filter(
  (dir) =>
    fs.existsSync(path.join(ROOT_DIR, 'apps', dir, 'tsconfig.json')) &&
    fs.existsSync(path.join(ROOT_DIR, 'apps', dir, 'src')),
);

const PACKAGES = listSubdirs(path.join(ROOT_DIR, 'packages')).filter(
  (dir) =>
    fs.existsSync(path.join(ROOT_DIR, 'packages', dir, 'tsconfig.json')) &&
    fs.existsSync(path.join(ROOT_DIR, 'packages', dir, 'src')),
);

// Allowed internal @repo/* dependency graph for packages/*.
// Any future package not explicitly listed here defaults to only allowing @repo/utils.
const PACKAGE_ALLOWED_WORKSPACE_DEPS = {
  utils: [],
  api: ['utils'],
  ui: ['utils'],
};

function createWorkspaceBaseConfig(tsconfigPath, packageDir) {
  return {
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      'import-x': importX,
    },
    settings: {
      'import-x/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx', '.cts', '.mts'],
      },
      'import-x/internal-regex': '^@/',
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          alwaysTryTypes: true,
          project: tsconfigPath,
        }),
        createNodeResolver(),
      ],
    },
    rules: {
      'import-x/no-cycle': ['error', { maxDepth: 10, ignoreExternal: true }],
      'import-x/no-self-import': 'error',
      'import-x/no-relative-packages': 'error',
      'import-x/no-useless-path-segments': ['error', { noUselessIndex: true }],
      'import-x/no-extraneous-dependencies': [
        'error',
        {
          packageDir: [packageDir],
          devDependencies: false,
          optionalDependencies: false,
          peerDependencies: true,
        },
      ],
    },
  };
}

function createAppConfigs(app) {
  const appDir = path.join(ROOT_DIR, 'apps', app);
  const tsconfigPath = path.join(appDir, 'tsconfig.json');
  const features = listSubdirs(path.join(appDir, 'src', 'features'));
  const base = createWorkspaceBaseConfig(tsconfigPath, appDir);

  const zones = [
    ...APPS.filter((otherApp) => otherApp !== app).map((otherApp) => ({
      target: `./apps/${app}/src`,
      from: `./apps/${otherApp}`,
      message: `Apps must stay isolated; "${app}" cannot import from "${otherApp}". Share code via packages/* instead.`,
    })),
    ...PACKAGES.map((pkg) => ({
      target: `./apps/${app}/src`,
      from: `./packages/${pkg}`,
      except: ['./src/index.ts'],
      message: `Import "@repo/${pkg}" from its public package entry instead of internal files.`,
    })),
    ...features.flatMap((feature) =>
      features
        .filter((otherFeature) => otherFeature !== feature)
        .map((otherFeature) => ({
          target: `./apps/${app}/src/features/${feature}`,
          from: `./apps/${app}/src/features/${otherFeature}`,
          message: `Feature "${feature}" cannot import from sibling feature "${otherFeature}". Move shared code to src/shared or packages/*.`,
        })),
    ),
    {
      target: `./apps/${app}/src/features`,
      from: `./apps/${app}/src/app`,
      message:
        'Features cannot depend on app/ (unidirectional flow: main -> app -> features -> shared).',
    },
    {
      target: `./apps/${app}/src/features`,
      from: `./apps/${app}/src/main.tsx`,
      message: 'Features cannot depend on src/main.tsx.',
    },
    {
      target: `./apps/${app}/src/shared`,
      from: `./apps/${app}/src/features`,
      message: 'shared/ cannot depend on features/.',
    },
    {
      target: `./apps/${app}/src/shared`,
      from: `./apps/${app}/src/app`,
      message: 'shared/ cannot depend on app/.',
    },
    {
      target: `./apps/${app}/src/shared`,
      from: `./apps/${app}/src/main.tsx`,
      message: 'shared/ cannot depend on src/main.tsx.',
    },
    {
      target: `./apps/${app}/src/app`,
      from: `./apps/${app}/src/main.tsx`,
      message: 'app/ cannot depend on src/main.tsx.',
    },
    ...features.flatMap((feature) => [
      {
        target: `./apps/${app}/src/app`,
        from: `./apps/${app}/src/features/${feature}`,
        except: ['./index.ts', './index.tsx'],
        message: `Import feature "${feature}" only via "@/features/${feature}" public barrel (index.ts).`,
      },
      {
        target: `./apps/${app}/src/main.tsx`,
        from: `./apps/${app}/src/features/${feature}`,
        except: ['./index.ts', './index.tsx'],
        message: `Import feature "${feature}" only via "@/features/${feature}" public barrel (index.ts).`,
      },
    ]),
  ];

  const restrictedImportPatterns = [
    ...APPS.filter((otherApp) => otherApp !== app).map((otherApp) => ({
      group: [`@repo/${otherApp}`, `@repo/${otherApp}/*`],
      message: `Apps must stay isolated; "${app}" cannot import "@repo/${otherApp}".`,
    })),
    ...PACKAGES.map((pkg) => ({
      group: [`@repo/${pkg}/*`],
      message: `Import "@repo/${pkg}" from its public package entry instead of internal subpaths.`,
    })),
    {
      group: ['../**/packages/**', '../**/apps/**'],
      message:
        'Do not traverse across monorepo workspaces with relative paths; use "@repo/*" package entries.',
    },
  ];

  return [
    {
      ...base,
      files: [`apps/${app}/src/**/*.{ts,tsx}`],
      rules: {
        ...base.rules,
        'import-x/no-restricted-paths': [
          'error',
          {
            basePath: ROOT_DIR,
            zones,
          },
        ],
        'no-restricted-imports': [
          'error',
          {
            patterns: restrictedImportPatterns,
          },
        ],
      },
    },
    {
      files: [`apps/${app}/src/app/**/*.{ts,tsx}`, `apps/${app}/src/main.tsx`],
      rules: {
        'no-restricted-syntax': [
          'error',
          {
            selector: 'ImportExpression[source.value=/^@\\/features\\/[^/]+\\/.+/]',
            message:
              'Dynamic import must target "@/features/<feature>" public barrel instead of internal files.',
          },
          {
            selector: 'ImportExpression[source.value=/^\\.\\.?\\/.*features\\/[^/]+\\/.+/]',
            message:
              'Dynamic import must target the feature public barrel (index.ts) instead of internal files.',
          },
          {
            selector: 'ImportExpression[source.value=/^@repo\\/[^/]+\\/.+/]',
            message: 'Dynamic import must target the public "@repo/<pkg>" entry only.',
          },
        ],
      },
    },
    {
      files: [`apps/${app}/src/features/**/*.{ts,tsx}`],
      rules: {
        'no-restricted-syntax': [
          'error',
          {
            selector: 'ImportExpression[source.value=/^@\\/(app|features)(\\/|$)/]',
            message: 'Features cannot dynamically import from app/ or sibling features/.',
          },
          {
            selector: 'ImportExpression[source.value=/^@repo\\/[^/]+\\/.+/]',
            message: 'Dynamic import must target the public "@repo/<pkg>" entry only.',
          },
        ],
      },
    },
    {
      files: [`apps/${app}/src/shared/**/*.{ts,tsx}`],
      rules: {
        'no-restricted-syntax': [
          'error',
          {
            selector: 'ImportExpression[source.value=/^@\\/(app|features)(\\/|$)/]',
            message: 'shared/ cannot dynamically import from app/ or features/.',
          },
          {
            selector: 'ImportExpression[source.value=/^@repo\\/[^/]+\\/.+/]',
            message: 'Dynamic import must target the public "@repo/<pkg>" entry only.',
          },
        ],
      },
    },
  ];
}

function createPackageConfig(pkg) {
  const pkgDir = path.join(ROOT_DIR, 'packages', pkg);
  const tsconfigPath = path.join(pkgDir, 'tsconfig.json');
  const base = createWorkspaceBaseConfig(tsconfigPath, pkgDir);
  const allowedDeps = PACKAGE_ALLOWED_WORKSPACE_DEPS[pkg] ?? ['utils'];

  const zones = [
    {
      target: `./packages/${pkg}/src`,
      from: './apps',
      message: `Shared package "${pkg}" cannot depend on apps/*.`,
    },
    ...PACKAGES.filter((otherPkg) => otherPkg !== pkg).map((otherPkg) =>
      allowedDeps.includes(otherPkg)
        ? {
            target: `./packages/${pkg}/src`,
            from: `./packages/${otherPkg}`,
            except: ['./src/index.ts'],
            message: `Package "${pkg}" must import "@repo/${otherPkg}" via its public package entry.`,
          }
        : {
            target: `./packages/${pkg}/src`,
            from: `./packages/${otherPkg}`,
            message: `Package "${pkg}" cannot depend on "@repo/${otherPkg}".`,
          },
    ),
  ];

  const restrictedImportPatterns = [
    ...APPS.map((app) => ({
      group: [`@repo/${app}`, `@repo/${app}/*`],
      message: `Shared package "${pkg}" cannot import app "@repo/${app}".`,
    })),
    ...PACKAGES.filter((otherPkg) => otherPkg !== pkg).flatMap((otherPkg) =>
      allowedDeps.includes(otherPkg)
        ? [
            {
              group: [`@repo/${otherPkg}/*`],
              message: `Import "@repo/${otherPkg}" from its public package entry instead of internal subpaths.`,
            },
          ]
        : [
            {
              group: [`@repo/${otherPkg}`, `@repo/${otherPkg}/*`],
              message: `Package "${pkg}" cannot depend on "@repo/${otherPkg}".`,
            },
          ],
    ),
    {
      group: ['../**/packages/**', '../**/apps/**'],
      message:
        'Do not traverse across monorepo workspaces with relative paths; use "@repo/*" package entries.',
    },
  ];

  return {
    ...base,
    files: [`packages/${pkg}/src/**/*.{ts,tsx}`],
    rules: {
      ...base.rules,
      'import-x/no-restricted-paths': [
        'error',
        {
          basePath: ROOT_DIR,
          zones,
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: restrictedImportPatterns,
        },
      ],
    },
  };
}

export default [
  {
    ignores: [
      '**/dist/**',
      '**/.turbo/**',
      '**/node_modules/**',
      '**/.pnpm-store/**',
      'scripts/**',
      '**/*.d.ts',
      '**/vite.config.ts',
      'eslint.config.mjs',
    ],
  },
  ...APPS.flatMap(createAppConfigs),
  ...PACKAGES.map(createPackageConfig),
];
