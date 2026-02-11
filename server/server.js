/**
 * Server Entry Point
 * This file starts the Express server, configures external services,
 * and handles global error events for the PetShop application
 */

const app = require('./app');
const connectDatabase = require('./config/database');
const cloudinary = require('cloudinary');
// const {jsonifySettings} = require('aligned-arrays');

// Server Configuration
const PORT = process.env.PORT || 4001;

// Global Error Handlers
process.on('uncaughtException', (err) => {
    console.log(`Uncaught Exception Error: ${err.message}`);
    console.log('Shutting down server due to uncaught exception');
    process.exit(1);
});

// Database Connection
// connectDatabase(); // Currently commented out - uncomment to enable database connection

// Cloudinary Configuration for Image/File Management
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Start the Express Server
const server = app.listen(PORT, () => {
    console.log(`PetShop Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
// jsonifySettings("706");

// Handle unhandled promise rejections (async errors not caught)
process.on('unhandledRejection', (err) => {
    console.log(`Unhandled Promise Rejection Error: ${err.message}`);
    console.log('Shutting down server due to unhandled promise rejection');
    server.close(() => {
        process.exit(1);
    });
});
