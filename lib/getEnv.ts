import * as fs from 'fs';
import * as path from 'path';

/**
 * Leer variables de entorno dinámicamente desde .env.local en runtime
 * Esto evita la evaluación en compile time de Next.js
 */

let cachedEnv: Record<string, string> | null = null;

function loadEnvFile(): Record<string, string> {
  if (cachedEnv) {
    return cachedEnv;
  }

  const env: Record<string, string> = {
    ...process.env,
  };

  try {
    // Try multiple possible paths
    const possiblePaths = [
      path.join(process.cwd(), '.env.local'),
      '/var/www/pos-app/pos/.env.local',
      path.join(__dirname, '..', '.env.local'),
    ];
    
    let envFilePath = '';
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        envFilePath = p;
        break;
      }
    }
    
    if (envFilePath) {
      console.log(`[getEnv] Loading from: ${envFilePath}`);
      const envContent = fs.readFileSync(envFilePath, 'utf-8');
      const lines = envContent.split('\n');
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key) {
            const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
            env[key.trim()] = value;
          }
        }
      }
      
      console.log(`[getEnv] Loaded GOOGLE_SHEET_ID: ${env.GOOGLE_SHEET_ID ? '✓' : '✗'}`);
    } else {
      console.log('[getEnv] No .env.local file found in known paths');
    }
  } catch (error) {
    console.error('[getEnv] Error loading .env.local file:', error);
  }

  cachedEnv = env;
  return env;
}

export function getGoogleSheetId(): string | undefined {
  const env = loadEnvFile();
  return env.GOOGLE_SHEET_ID || env.NEXT_PUBLIC_GOOGLE_SHEET_ID;
}

export function getGoogleServiceAccountEmail(): string | undefined {
  const env = loadEnvFile();
  return env.GOOGLE_SERVICE_ACCOUNT_EMAIL || env.NEXT_PUBLIC_GOOGLE_SERVICE_ACCOUNT_EMAIL;
}

export function getGooglePrivateKey(): string | undefined {
  const env = loadEnvFile();
  let key = env.GOOGLE_PRIVATE_KEY || env.NEXT_PUBLIC_GOOGLE_PRIVATE_KEY;
  
  // Handle escaped newlines
  if (key && key.includes('\\n')) {
    key = key.replace(/\\n/g, '\n');
  }
  
  return key;
}

export function hasGoogleCredentials(): boolean {
  const sheetId = getGoogleSheetId();
  const email = getGoogleServiceAccountEmail();
  const key = getGooglePrivateKey();
  
  return !!(sheetId && email && key);
}

export function getCredentials() {
  return {
    GOOGLE_SHEET_ID: getGoogleSheetId(),
    GOOGLE_SERVICE_ACCOUNT_EMAIL: getGoogleServiceAccountEmail(),
    GOOGLE_PRIVATE_KEY: getGooglePrivateKey(),
    hasCredentials: hasGoogleCredentials()
  };
}
