const request = require('supertest');
const app = require('./server');
const pool = require('./db');

beforeAll(async () => {
  if (typeof pool.query === 'function') {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }
});

afterAll(async () => {
  if (typeof pool.end === 'function') {
    await pool.end();
  }
});

describe('API health and auth', () => {
  it('should return health status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status');
  });

  it('should register and login a user', async () => {
    const email = `user-${Date.now()}@example.com`;

    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Demo User',
        email,
        password: 'password123',
      });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body).toHaveProperty('token');

    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email,
        password: 'password123',
      });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty('token');
  });

  it('should reject invalid login', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'bad@example.com', password: 'wrong' });

    expect(response.status).toBe(401);
  });
});
