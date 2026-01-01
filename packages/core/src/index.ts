// Types
export type { GenerationContext, Template, Framework, Logger, Database, ORM, Language, PackageManager } from './types.js';

// Tokens
export { replaceTokens, replaceTokensInFile, TOKEN_DEFINITIONS } from './tokens/index.js';

// Templates
export { copyTemplate, shouldIncludeFile, stripConditions, transformFilename } from './templates/index.js';

// Package JSON generation
export { generatePackageJson } from './templates/package-json.js';

// Validation
export { validateProjectName, validatePath, isValidKebabCase } from './validation/index.js';

// Package Manager
export { detectPackageManager, runInstall, getInstallCommand, getLockfileName } from './pm/index.js';

// Utilities
export { gitInit, ensureDir, pathExists, isEmptyDir } from './utils/index.js';
