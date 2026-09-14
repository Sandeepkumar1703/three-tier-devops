const express = require('express');
const morgan = require('morgan');
const pool = require('./db');
const { authenticate, generateToken } = require('./utils/auth');
const config = require('./config');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());
app.use(morgan('combined'));
app.use(logger);

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    return res.status(500).json({ status: 'error', database: 'disconnected', message: error.message });
  }
});

app.get('/api/v1', (req, res) => {
  res.json({ name: 'TaskFlow API', version: 'v1', status: 'ok' });
});

app.post(
  '/api/v1/auth/register',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name is required'),
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { name, email, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    try {
      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ message: 'User already exists' });
      }

      const result = await pool.query(
        'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
        [name, email, passwordHash],
      );

      const user = result.rows[0];
      const token = generateToken(user);
      return res.status(201).json({ message: 'User registered successfully', token, user });
    } catch (error) {
      return res.status(500).json({ message: 'Registration failed', error: error.message });
    }
  },
);

app.post(
  '/api/v1/auth/login',
  [
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const safeUser = { id: user.id, name: user.name, email: user.email };
      const token = generateToken(safeUser);
      return res.json({ message: 'Login successful', token, user: safeUser });
    } catch (error) {
      return res.status(500).json({ message: 'Login failed', error: error.message });
    }
  },
);

app.get('/api/v1/tasks', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, description, created_at FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id],
    );
    res.json({ tasks: result.rows });
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch tasks', error: error.message });
  }
});

app.post(
  '/api/v1/tasks',
  authenticate,
  [
    body('title').trim().isLength({ min: 2 }).withMessage('Title is required'),
    body('description').optional().trim().isLength({ max: 1000 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { title, description } = req.body;

    try {
      const result = await pool.query(
        'INSERT INTO tasks (user_id, title, description) VALUES ($1, $2, $3) RETURNING *',
        [req.user.id, title, description || ''],
      );
      return res.status(201).json({ message: 'Task created', task: result.rows[0] });
    } catch (error) {
      return res.status(500).json({ message: 'Unable to create task', error: error.message });
    }
  },
);

app.put(
  '/api/v1/tasks/:id',
  authenticate,
  [
    body('title').optional().trim().isLength({ min: 2 }).withMessage('Title must be at least 2 characters'),
    body('description').optional().trim().isLength({ max: 1000 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { title, description } = req.body;

    try {
      const result = await pool.query(
        `UPDATE tasks
         SET title = COALESCE($2, title), description = COALESCE($3, description), updated_at = NOW()
         WHERE id = $1 AND user_id = $4
         RETURNING *`,
        [req.params.id, title, description, req.user.id],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Task not found' });
      }

      return res.json({ message: 'Task updated', task: result.rows[0] });
    } catch (error) {
      return res.status(500).json({ message: 'Unable to update task', error: error.message });
    }
  },
);

app.delete('/api/v1/tasks/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.json({ message: 'Task deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to delete task', error: error.message });
  }
});

app.use(errorHandler);

const port = config.port;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`API server listening on port ${port}`);
  });
}

module.exports = app;
