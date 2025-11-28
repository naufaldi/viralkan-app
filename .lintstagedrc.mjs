/**
 * Lint-Staged Configuration for Alternative 2: Fast Commit + Pre-Push Build
 *
 * This configuration runs on STAGED FILES ONLY for maximum speed.
 * Build verification happens on PUSH (not commit).
 *
 * Important: Run ESLint from each package's directory where the eslint.config.js exists
 */

const config = {
  // API package files
  'apps/api/**/*.{ts,tsx}': [
    'cd apps/api && eslint --fix --ext .ts,.tsx',
    'prettier --write',
  ],

  // Web package files
  'apps/web/**/*.{ts,tsx,js,jsx}': [
    'cd apps/web && eslint --fix --ext .ts,.tsx,.js,.jsx',
    'prettier --write',
  ],

  // Docs package files
  'apps/docs/**/*.{ts,tsx,js,jsx}': [
    'cd apps/docs && eslint --fix --ext .ts,.tsx,.js,.jsx',
    'prettier --write',
  ],

  // UI package files
  'packages/ui/**/*.{ts,tsx,js,jsx}': [
    'cd packages/ui && eslint --fix --ext .ts,.tsx,.js,.jsx',
    'prettier --write',
  ],

  // Root-level config and docs files
  '*.{json,md,yml,yaml}': [
    'prettier --write',
  ],

  // CSS, SCSS, Less
  '*.{css,scss,less}': [
    'prettier --write',
  ],
};

export default config;
