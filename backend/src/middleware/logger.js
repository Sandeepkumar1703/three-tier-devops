const fs = require('fs');
const path = require('path');

const logDir = path.resolve(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true, mode: 0o755 });
}

const logger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTimeMs: duration,
      ip: req.ip,
    };

    const message = JSON.stringify(logEntry);
    const logFile = path.join(logDir, 'access.log');
    fs.appendFileSync(logFile, `${message}\n`);
    console.log(message);
  });

  next();
};

module.exports = logger;
