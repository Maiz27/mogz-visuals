export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { cleanupOrphanedFiles } = await import('@/lib/cleanup');
    // Run cleanup without blocking startup completely, or await if fast enough.
    // Given it's just checking specific files, it should be fast.
    await cleanupOrphanedFiles();
  }
}
