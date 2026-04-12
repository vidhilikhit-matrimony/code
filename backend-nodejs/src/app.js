const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');
const config = require('./config/env');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { User } = require('./models');

// Import routes
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: config.cors.origins,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Static File Serving with Cache Headers ──────────────────────
// Serve frontend build with aggressive caching (30 days)
// Vite adds content-hash to filenames so cache busting is automatic
app.use(express.static(path.join(__dirname, '../../frontend-react/dist'), {
    maxAge: '30d',
    etag: true,
    lastModified: true,
    immutable: true  // Vite hashed filenames never change
}));

// Cache control for API responses
app.use('/api', (req, res, next) => {
    if (req.method === 'GET') {
        // Cache profile listings for 2 minutes (reduces redundant fetches)
        if (req.path === '/profiles') {
            res.set('Cache-Control', 'private, max-age=120');
        }
        // Cache visitor count for 5 minutes
        if (req.path === '/visitors') {
            res.set('Cache-Control', 'public, max-age=300');
        }
    }
    next();
});

// Request logging middleware (development)
if (config.nodeEnv === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// Routes
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: `Welcome to ${config.app.name} API`,
        version: config.app.version,
        endpoints: {
            auth: '/api/auth',
            profiles: '/api/profiles',
            admin: '/api/admin',
            subscriptions: '/api/subscriptions',
            successStories: '/api/success-stories'
        },
        documentation: '/api/docs'
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

const subscriptionRoutes = require('./routes/subscription.routes');
const adminRoutes = require('./routes/admin.routes');
const reportRoutes = require('./routes/report.routes');
const planRoutes = require('./routes/plan.routes');
const visitorRoutes = require('./routes/visitor.routes');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/visitors', visitorRoutes);

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

// Create admin user on startup
const createAdminUser = async () => {
    try {
        const existingAdmin = await User.findOne({ firstName: config.admin.firstName });
        if (!existingAdmin) {
            await User.create({
                username: config.admin.username,
                email: config.admin.email,
                firstName: "admin",
                lastName: "kulkarni",
                hashedPassword: config.admin.password,
                isVerified: true,
                isActive: true,
                role: 'admin'
            });
            console.log(`✅ Admin user created: ${config.admin.firstName}`);
        } else {
            console.log(`✅ Admin user already exists: ${config.admin.firstName}`);
        }
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
    }
};

// Start server
const PORT = config.port;

const server = app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${config.nodeEnv}`);
    console.log(`🌐 API: http://localhost:${PORT}`);
    console.log(`📚 Docs: http://localhost:${PORT}/api/docs\n`);

    // Create admin user after server starts
    createAdminUser();
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});

module.exports = app;
