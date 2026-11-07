import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const testsDirectory = fileURLToPath(new URL('../tests/', import.meta.url));
const testFilePattern = /\.(test|spec)\.(ts|tsx)$/;

async function findTestFiles(directory) {
  let entries;

  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }

  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findTestFiles(path)));
    } else if (testFilePattern.test(entry.name)) {
      files.push(path);
    }
  }

  return files;
}

const testFiles = await findTestFiles(testsDirectory);

if (testFiles.length === 0) {
  console.warn('No tests found yet for this feature — generate Vitest tests before pushing.');
}
