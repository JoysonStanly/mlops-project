import AdmZip from 'adm-zip';

const SUPPORTED_EXTENSIONS = ['.py', '.js', '.ts', '.tsx', '.java', '.txt', '.md', '.json', '.csv', '.jsx'];
const IGNORED_PATH_SEGMENTS = [
  'node_modules/',
  '.git/',
  'dist/',
  'build/',
  '.next/',
  'coverage/',
  '__pycache__/',
  '.venv/',
  'venv/',
  'vendor/',
  'target/',
  'out/',
  '.idea/',
  '.vscode/',
];
const IGNORED_FILE_NAMES = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb', 'poetry.lock'];
const MAX_FILE_BYTES = 300_000;
const MAX_ENTRY_CHARS = 80_000;
const MAX_TOTAL_CHARS = 1_000_000;

function toNormalizedPath(path: string): string {
  return path.replace(/\\/g, '/').toLowerCase();
}

function hasMostlyTextContent(content: string): boolean {
  if (!content) {
    return false;
  }
  const controlCharMatches = content.match(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g) ?? [];
  return controlCharMatches.length / content.length < 0.02;
}

export function toTextContent(buffer: Buffer, fileName: string) {
  const lowerName = fileName.toLowerCase();
  if (SUPPORTED_EXTENSIONS.some((extension) => lowerName.endsWith(extension))) {
    return buffer.toString('utf8');
  }
  return undefined;
}

export function isZipFile(fileName: string): boolean {
  return fileName.toLowerCase().endsWith('.zip');
}

export function extractZipContent(buffer: Buffer): string {
  try {
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();
    const textContents: string[] = [];
    let totalChars = 0;

    for (const entry of entries) {
      if (entry.isDirectory) continue;

      const normalizedPath = toNormalizedPath(entry.entryName);
      const fileName = normalizedPath.split('/').pop() ?? normalizedPath;
      const hasSupportedExtension = SUPPORTED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
      const isIgnoredPath = IGNORED_PATH_SEGMENTS.some((segment) => normalizedPath.includes(segment));
      const isIgnoredFileName = IGNORED_FILE_NAMES.includes(fileName);

      if (hasSupportedExtension && !isIgnoredPath && !isIgnoredFileName && entry.header.size <= MAX_FILE_BYTES) {
        try {
          const content = entry.getData().toString('utf8').slice(0, MAX_ENTRY_CHARS);
          if (!hasMostlyTextContent(content)) {
            continue;
          }

          textContents.push(`\n--- File: ${entry.entryName} ---\n${content}`);
          totalChars += content.length;
          if (totalChars >= MAX_TOTAL_CHARS) {
            break;
          }
        } catch {
          // Skip files that can't be decoded as UTF8
        }
      }
    }

    if (textContents.length === 0) {
      throw new Error('No supported code files found in the ZIP archive');
    }

    return textContents.join('\n');
  } catch (error) {
    throw new Error(`Failed to extract ZIP file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
