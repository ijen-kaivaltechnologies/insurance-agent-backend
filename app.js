const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const insuranceRoutes = require('./routes/insuranceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const policyTypeRoutes = require('./routes/policyTypeRoutes');
const policiesRoutes = require('./routes/policiesRoutes');
const fileUploadRoutes = require('./routes/fileUpload');
const env = require('./config/env');

const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(rateLimiter.apiLimiter);

//serve static files
app.use('/uploads', express.static(env.uploadsDir));

// Routes setup
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/policies', policiesRoutes);
app.use('/api/insurance', insuranceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/policy-types', policyTypeRoutes);
app.use('/api/file-upload', fileUploadRoutes);

// Error handling middleware
app.use(errorHandler);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date() });
});

// 404 handler for non-existent routes
app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found',
        timestamp: new Date()
    });
});

module.exports = app;