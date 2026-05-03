const parseOrigins = (value: string | undefined): string[] => {
  if (!value) {
    return ['http://localhost:3000'];
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export const unifiedConfig = () => ({
  app: {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 4000),
    frontendOrigins: parseOrigins(process.env.FRONTEND_ORIGINS),
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET ?? 'development-only-secret',
    accessTokenTtl: process.env.JWT_ACCESS_TOKEN_TTL ?? '15m',
    refreshTokenTtlDays: Number(process.env.JWT_REFRESH_TOKEN_TTL_DAYS ?? 7),
  },
  database: {
    url: process.env.DATABASE_URL ?? '',
  },
  redis: {
    url: process.env.REDIS_URL,
  },
});

export type UnifiedConfig = ReturnType<typeof unifiedConfig>;
