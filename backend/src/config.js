require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.BACKEND_PORT || 5000),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  db: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: Number(process.env.POSTGRES_PORT || 5432),
    database: process.env.POSTGRES_DB || 'appdb',
    user: process.env.POSTGRES_USER || 'appuser',
    password: process.env.POSTGRES_PASSWORD || 'change-me',
  },
};

module.exports = config;
