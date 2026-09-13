function errorHandler(err, req, res, next) {
  console.error(`❌ [Error] ${req.method} ${req.originalUrl}:`, err.stack || err.message || err);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
