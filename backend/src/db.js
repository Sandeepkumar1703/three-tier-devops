const { randomUUID } = require('crypto');
const { newDb } = require('pg-mem');
const { Pool } = require('pg');
const config = require('./config');

let pool;

if (process.env.USE_PG_MEM === 'true' || process.env.NODE_ENV === 'test') {
  const db = newDb();
  db.public.registerFunction({
    name: 'gen_random_uuid',
    args: [],
    returns: 'uuid',
    implementation: () => randomUUID(),
    impure: false,
  });
  const pg = db.adapters.createPg();
  pool = new pg.Pool();
} else {
  pool = new Pool({
    host: config.db.host,
    port: config.db.port,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}

pool.on && pool.on('error', (err) => {
  console.error('Unexpected database error:', err.message);
});

module.exports = pool;
