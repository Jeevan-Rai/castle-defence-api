require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const rateLimit = require('./middleware/rateLimit');

// Import routes
const playerRoutes = require('./routes/playerRoutes');
const matchRoutes = require('./routes/matchRoutes');
const gameRoutes = require('./routes/gameRoutes');
const waveRoutes = require('./routes/waveRoutes');
const castleRoutes = require('./routes/castleRoutes');
const abilityRoutes = require('./routes/abilityRoutes');

const app = express();

// Connect to Database
connectDB();

// Global Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimit);  // Rate limiting for all routes

// CORS setup
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
        return res.status(200).json({});
    }
    next();
});

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// API Routes
app.use('/api/players', playerRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/waves', waveRoutes);
app.use('/api/castle', castleRoutes);
app.use('/api/abilities', abilityRoutes);

// API Documentation route
app.get('/api/docs', (req, res) => {
    res.json({
        endpoints: {
            players: {
                register: 'POST /api/players/register',
                getStats: 'GET /api/players/:address',
                updateInventory: 'PUT /api/players/:walletAddress/inventory',
                craftArrows: 'POST /api/players/:walletAddress/craft'
            },
            matches: {
                start: 'POST /api/matches/start',
                end: 'POST /api/matches/end',
                getHistory: 'GET /api/matches/:playerAddress'
            },
            waves: {
                start: 'POST /api/waves/start',
                complete: 'POST /api/waves/complete'
            },
            castle: {
                upgrade: 'POST /api/castle/upgrade/:walletAddress',
                repair: 'POST /api/castle/repair/:walletAddress'
            },
            abilities: {
                unlock: 'POST /api/abilities/unlock/:walletAddress',
                use: 'POST /api/abilities/use/:walletAddress'
            }
        }
    });
});

// Error Handlers
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    app.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API Documentation available at http://localhost:${PORT}/api/docs`);
});

module.exports = server; // For testing purposes