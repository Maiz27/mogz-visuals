import fs from 'fs';
import path from 'path';
import os from 'os';

export const cleanupOrphanedFiles = async () => {
  const tmpDir = os.tmpdir();
  const ONE_HOUR = 60 * 60 * 1000;
  const now = Date.now();

  try {
    const files = await fs.promises.readdir(tmpDir);

    const cleanupPromises = files.map(async (file) => {
      const filePath = path.join(tmpDir, file);

      // Check for targets: gen-* directories or mogz_*.zip files
      const isGenDir = file.startsWith('gen-');
      const isMogzZip = file.startsWith('mogz_') && file.endsWith('.zip');

      if (!isGenDir && !isMogzZip) return;

      try {
        const stats = await fs.promises.stat(filePath);
        const age = now - stats.mtimeMs;

        if (age > ONE_HOUR) {
          await fs.promises.rm(filePath, { recursive: true, force: true });
          console.log(`[Cleanup] Deleted orphaned item: ${file}`);
        }
      } catch (err) {
        // Ignore errors for individual files (e.g. permission issues or race conditions)
        console.warn(`[Cleanup] Failed to check/delete ${file}:`, err);
      }
    });

    await Promise.all(cleanupPromises);
    console.log('[Cleanup] Startup cleanup check completed.');
  } catch (error) {
    console.error('[Cleanup] Error reading temp directory:', error);
  }
};
