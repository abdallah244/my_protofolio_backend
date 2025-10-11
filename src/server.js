// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const express = require('express');
const cors = require('cors');
const colors = require('colors');

// Import custom modules
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/error.middleware');
const { createAdminUser } = require('./controllers/auth.controller');
const { createDefaultContent, createDefaultSkills } = require('./controllers/content.controller');

// Import route files
const authRoutes = require('./routes/auth.routes');
const mediaRoutes = require('./routes/media.routes');
const projectRoutes = require('./routes/project.routes');
const userRoutes = require('./routes/user.routes');
const navigationRoutes = require('./routes/navigation.routes');
const adminRoutes = require('./routes/admin.routes');
const contentRoutes = require('./routes/content.routes');
const skillRoutes = require('./routes/skill.routes');
const contactRoutes = require('./routes/contact.routes'); 

// Initialize express application
const app = express();

// Connect to MongoDB database
connectDB();

// Create admin user and default content after DB connection
setTimeout(async () => {
    try {
        await createAdminUser();
        await createDefaultContent();
        await createDefaultSkills();
        console.log('✅ Default data created successfully'.green);
    } catch (error) {
        console.error('❌ Error creating default data:'.red, error.message);
    }
}, 2000);

// Middlewares
// Enable CORS
app.use(cors({
    origin: ['http://localhost:4200', 'http://localhost:3000', 'http://localhost:5000', 'https://my-protofolio-frontend.vercel.app' ],
    // credentials: true,
    // methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    // allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Enable CORS in general
// app.use(cors());

// Handle preflight requests
// app.options('*', (req, res) => {
//     res.header('Access-Control-Allow-Origin', req.headers.origin);
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
//     res.header('Access-Control-Allow-Credentials', 'true');
//     res.status(200).send();
// });

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
    next();
});

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running!',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

// API Routes - FIXED ORDER
app.use('/api/auth', authRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/navigation', navigationRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/contact', contactRoutes); 

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.originalUrl} not found`,
        path: req.originalUrl,
        method: req.method
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`.green.bold);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`.yellow);
    console.log(`📋 Health: http://localhost:${PORT}/api/health`.blue.underline);
    console.log(`🔗 API: http://localhost:${PORT}/api`.cyan.underline);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`❌ Unhandled Rejection: ${err.message}`.red.bold);
    console.error(err.stack);
    server.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.log(`❌ Uncaught Exception: ${err.message}`.red.bold);
    console.error(err.stack);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('💤 Process terminated');
        process.exit(0);
    });
});

module.exports = app;
