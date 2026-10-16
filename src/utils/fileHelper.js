import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';

/**
 * Safely unlinks a file if it exists, without throwing errors.
 * @param {string} filePath 
 */
export async function safeUnlink(filePath) {
  if (filePath && existsSync(filePath)) {
    try {
      await fs.unlink(filePath);
    } catch (_) {}
  }
}

/**
 * Ensures required directories exist.
 * @param {string[]} dirs 
 */
export async function ensureDirs(dirs) {
  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }
}
