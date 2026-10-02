import process = require("process");

const getEnv = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
};

export const env = {
  port: Number(getEnv('PORT')),
  nodeEnv: getEnv('NODE_ENV'),
  frontendUrl: getEnv('FRONTEND_URL',),
};