const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { config } = require('./config/env');
const errorHandler = require('./middleware/errorHandler');

const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const folderRoutes = require('./routes/folderRoutes');
const fileRoutes = require('./routes/fileRoutes');
const searchRoutes = require('./routes/searchRoutes');
const shareRoutes = require('./routes/shareRoutes');
const trashRoutes = require('./routes/trashRoutes');
const activityRoutes = require('./routes/activityRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const storageRoutes = require('./routes/storageRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Security Header Configuration
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS Configuration
const allowedOrigins = [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Route Mounts
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/trash', trashRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/admin', adminRoutes);

// Catch-all 404 handler for undefined API routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.originalUrl} not found`,
    code: 'ROUTE_NOT_FOUND',
  });
});

// Centralized Error Middleware
app.use(errorHandler);

module.exports = app;
