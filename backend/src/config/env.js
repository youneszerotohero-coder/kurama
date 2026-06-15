import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 5000;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const DATABASE_URL = process.env.DATABASE_URL;
export const DIRECT_URL = process.env.DIRECT_URL;
export const JWT_SECRET = process.env.JWT_SECRET || 'electrohub_super_secure_jwt_secret_key_2026';

if (!DATABASE_URL) {
  console.warn('WARNING: DATABASE_URL environment variable is not defined.');
}
