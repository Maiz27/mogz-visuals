import 'server-only';

if (!process.env.ENCRYPTION_KEY) {
  throw new Error('Missing ENCRYPTION_KEY environment variable');
}

export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
