import { describe, it, expect } from 'vitest';
import { validateProjectName, isValidKebabCase } from '../src/validation/index.js';

describe('isValidKebabCase', () => {
  it('should accept valid kebab-case names', () => {
    expect(isValidKebabCase('my-api')).toBe(true);
    expect(isValidKebabCase('my-cool-app')).toBe(true);
    expect(isValidKebabCase('app')).toBe(true);
    expect(isValidKebabCase('a1')).toBe(true);
    expect(isValidKebabCase('my-app-2')).toBe(true);
  });

  it('should reject invalid names', () => {
    expect(isValidKebabCase('MyApi')).toBe(false);
    expect(isValidKebabCase('my_api')).toBe(false);
    expect(isValidKebabCase('my api')).toBe(false);
    expect(isValidKebabCase('-my-api')).toBe(false);
    expect(isValidKebabCase('my-api-')).toBe(false);
    expect(isValidKebabCase('1my-api')).toBe(false);
    expect(isValidKebabCase('')).toBe(false);
  });
});

describe('validateProjectName', () => {
  it('should accept valid project names', () => {
    expect(validateProjectName('my-api').valid).toBe(true);
    expect(validateProjectName('cool-app').valid).toBe(true);
    expect(validateProjectName('app').valid).toBe(true);
  });

  it('should reject empty names', () => {
    const result = validateProjectName('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Project name cannot be empty');
  });

  it('should reject reserved names', () => {
    const result = validateProjectName('node_modules');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('reserved');
  });

  it('should reject invalid kebab-case and suggest alternative', () => {
    const result = validateProjectName('MyApi');
    expect(result.valid).toBe(false);
    expect(result.suggestion).toBe('myapi');
  });

  it('should suggest valid alternative for names with spaces', () => {
    const result = validateProjectName('My Cool App');
    expect(result.valid).toBe(false);
    expect(result.suggestion).toBe('my-cool-app');
  });
});
