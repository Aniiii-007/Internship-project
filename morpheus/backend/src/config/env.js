import 'dotenv/config';

const required = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'RESEND_API_KEY',
  'GROQ_API_KEY',
  'IMAGEKIT_PUBLIC_KEY',
  'IMAGEKIT_PRIVATE_KEY',
  'IMAGEKIT_URL_ENDPOINT',
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  PORT: parseInt(process.env.PORT || '3000', 10),

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',

  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  RESEND_API_KEY: process.env.RESEND_API_KEY,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM || 'Morpheus <onboarding@resend.dev>',

  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT,

  NODE_ENV: process.env.NODE_ENV || 'development',
};
