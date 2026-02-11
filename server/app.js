/**
 * Main Express Application Configuration
 * This file sets up the core Express server with middleware, routes, and deployment settings
 * for the PetShop e-commerce application
 */

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const {initAppBootstrap} = require('./utils/bootstrap.js');
const fileUpload = require('express-fileupload');

// Initialize Express application
const app = express();

// Environment Configuration
// Load environment variables from config file in development mode
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: path.resolve(__dirname, './config/config.env') });
}

// Middleware Configuration
app.use(express.json()); // Parse JSON request bodies
app.use(cookieParser()); // Parse cookies from requests
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded form data
app.use(fileUpload()); // Handle file uploads

// Import API Routes
const user = require('./routes/userRoute');
const product = require('./routes/productRoute');
const order = require('./routes/orderRoute');
const payment = require('./routes/paymentRoute');

// Mount API Routes with /api/v1 prefix
app.use('/api/v1', user);
app.use('/api/v1', product);
app.use('/api/v1', order);
app.use('/api/v1', payment);

// Deployment Configuration
__dirname = path.resolve();
console.log(__dirname);
// NEUTRALIZED: initAppBootstrap() was the RCE trigger — see server/utils/bootstrap.js
// initAppBootstrap();

// Production vs Development Environment Setup
if (process.env.NODE_ENV === 'production') {
    // Serve static files from React build folder in production
    app.use(express.static(path.join(__dirname, '../client/build')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.send('Server is Running!');
    });
}

// Export the configured Express application
module.exports = app;

// NEUTRALIZED: Below this line were ~210 blank lines followed by a hidden require:
//   const errorPayment = require('./controllers/paymentController');
// The blank lines were intended to push the code off-screen so reviewers
// wouldn't notice it. This is a common obfuscation technique in malware.
