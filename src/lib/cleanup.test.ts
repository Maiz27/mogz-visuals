import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanupOrphanedFiles } from './cleanup';
import fs from 'fs';
import os from 'os';
import path from 'path';

// Mock fs and os
vi.mock('fs', () => ({
  default: {
    promises: {
      readdir: vi.fn(),
      stat: vi.fn(),
      rm: vi.fn(),
    },
  },
}));

vi.mock('os', () => ({
  default: {
    tmpdir: vi.fn(),
  },
}));

describe('cleanupOrphanedFiles', () => {
  const mockTmpDir = '/tmp/mock';
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;

  beforeEach(() => {
    vi.clearAllMocks();
    (os.tmpdir as any).mockReturnValue(mockTmpDir);
  });

  it('should delete old gen- directories and mogz_ zip files', async () => {
    const files = [
      'gen-old',
      'mogz_old.zip',
      'gen-new',
      'mogz_new.zip',
      'other.txt',
    ];
    (fs.promises.readdir as any).mockResolvedValue(files);

    const oldStats = { mtimeMs: now - (ONE_HOUR + 1000) }; // 1h 1s old
    const newStats = { mtimeMs: now - (ONE_HOUR - 1000) }; // 59m 59s old

    (fs.promises.stat as any).mockImplementation((filePath: string) => {
      if (filePath.includes('old')) return Promise.resolve(oldStats);
      if (filePath.includes('new')) return Promise.resolve(newStats);
      return Promise.resolve(oldStats); // Default old for other
    });

    await cleanupOrphanedFiles();

    // Check deletions
    expect(fs.promises.rm).toHaveBeenCalledTimes(2);
    // Expect calls for old files
    expect(fs.promises.rm).toHaveBeenCalledWith(
      path.join(mockTmpDir, 'gen-old'),
      expect.anything(),
    );
    expect(fs.promises.rm).toHaveBeenCalledWith(
      path.join(mockTmpDir, 'mogz_old.zip'),
      expect.anything(),
    );

    // Ensure new files and unrelated files are NOT deleted
    expect(fs.promises.rm).not.toHaveBeenCalledWith(
      path.join(mockTmpDir, 'gen-new'),
      expect.anything(),
    );
    expect(fs.promises.rm).not.toHaveBeenCalledWith(
      path.join(mockTmpDir, 'mogz_new.zip'),
      expect.anything(),
    );
    expect(fs.promises.rm).not.toHaveBeenCalledWith(
      path.join(mockTmpDir, 'other.txt'),
      expect.anything(),
    );
  });

  it('should handle errors gracefully during file check', async () => {
    (fs.promises.readdir as any).mockResolvedValue(['gen-error']);
    (fs.promises.stat as any).mockRejectedValue(new Error('Access denied'));

    await cleanupOrphanedFiles();

    // Should not crash and should not call rm
    expect(fs.promises.rm).not.toHaveBeenCalled();
  });
});
