const dotenv = require('dotenv');
const path = require('path');
const app = require('./app');

// Load environment variables
dotenv.config();

// Get the port from environment or use default
const PORT = process.env.PORT || 3000;

// Server setup
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

// Error handling for unhandled rejections
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection at:', error.stack);
    process.exit(1);
});

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});