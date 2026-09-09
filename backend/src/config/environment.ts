export interface Environment {
  CORS_ORIGIN: string;
  DATABASE_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
}

export function validateEnvironment(
  values: Record<string, unknown>,
): Environment {
  const nodeEnvironment = values.NODE_ENV ?? 'development';

  if (
    !['development', 'production', 'test'].includes(String(nodeEnvironment))
  ) {
    throw new Error('NODE_ENV must be development, production, or test');
  }

  const port = Number(values.PORT ?? 3001);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  const databaseUrl = String(values.DATABASE_URL ?? '');

  if (!databaseUrl.startsWith('postgresql://')) {
    throw new Error('DATABASE_URL must be a PostgreSQL connection string');
  }

  return {
    CORS_ORIGIN: String(values.CORS_ORIGIN ?? 'http://localhost:3000'),
    DATABASE_URL: databaseUrl,
    NODE_ENV: nodeEnvironment as Environment['NODE_ENV'],
    PORT: port,
  };
}
