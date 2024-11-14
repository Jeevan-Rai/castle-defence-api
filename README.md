# Castle Defense Game - Backend Documentation

## Project Overview
Backend infrastructure for a Castle Defense game designed to integrate with Catoff Blinks platform.

### Tech Stack
- Node.js/Express
- MongoDB
- JWT Authentication
- RESTful API Architecture

## Quick Start
```bash
# Install dependencies
npm install

# Environment Setup
Create .env file with:
MONGO_URI=your_mongodb_uri
PORT=5000
JWT_SECRET=your_jwt_secret
CATOFF_API_URL=your_catoff_api_endpoint
CATOFF_API_KEY=your_api_key

# Start server
npm start
```

## Core Features

### 1. Player Management
```plaintext
Endpoints:
POST /api/players/register
- Register new player with wallet
- Initialize player resources and stats

GET /api/players/:address
- Fetch player stats and inventory

PUT /api/players/:walletAddress/inventory
- Update player inventory

POST /api/players/:walletAddress/craft
- Craft items using resources
```

### 2. Match System
```plaintext
Endpoints:
POST /api/matches/start
- Start new game match
- Initialize wave system

POST /api/matches/end
- End match and calculate rewards
- Update player statistics
```

### 3. Wave Management
```plaintext
Endpoints:
POST /api/waves/start
- Start new wave with scaled difficulty
- Configure enemy types and rewards

POST /api/waves/complete
- Process wave completion
- Calculate and distribute rewards
```

### 4. Castle System
```plaintext
Endpoints:
POST /api/castle/upgrade/:walletAddress
- Upgrade castle components
- Apply enhancement effects

POST /api/castle/repair/:walletAddress
- Repair castle damage
- Resource management
```

### 5. Ability System
```plaintext
Endpoints:
POST /api/abilities/unlock/:walletAddress
- Unlock new abilities
- Resource cost management

POST /api/abilities/use/:walletAddress
- Use abilities in-game
- Cooldown management
```

## Data Models

### Player Model
```javascript
{
    walletAddress: String,
    username: String,
    stats: {
        highScore: Number,
        gamesPlayed: Number,
        wavesCompleted: Number
    },
    resources: {
        wood: Number,
        iron: Number,
        gold: Number
    },
    inventory: {
        basicArrows: Number,
        fireArrows: Number,
        iceArrows: Number
    }
}
```

### Match Model
```javascript
{
    playerAddress: String,
    status: String,
    score: Number,
    wavesCompleted: Number,
    startTime: Date,
    endTime: Date
}
```

## Integration Points

### Catoff Blinks Integration
- Match registration
- Score submission
- Reward distribution
- Player verification

### Planned Web3 Integration
- Wallet authentication
- On-chain transactions
- NFT integration
- Token rewards

## Development Roadmap

### Current Features
- ✓ Core game mechanics
- ✓ Player management
- ✓ Match system
- ✓ Wave mechanics
- ✓ Castle upgrades
- ✓ Achievement system

### Upcoming Features
- Solana integration
- Real-time multiplayer
- Enhanced security
- Advanced analytics

## Testing
```bash
# Run tests
npm test

# API endpoint testing
Use Postman collection included in /tests folder
```

## Security Features
- Rate limiting
- JWT authentication
- Request validation
- Error handling
- CORS configuration

## API Documentation
Full API documentation available at:
```
http://localhost:5000/api/docs
```

## Error Handling
```javascript
{
    success: boolean,
    message: string,
    error?: string
}
```

## Performance Considerations
- Database indexing
- Caching implementation
- Transaction handling
- Resource optimization

## Contact
[Your Name]
[Your Email]
[Your Phone Number]

---

This backend is ready for integration with Unity frontend and Catoff Blinks platform. Future improvements will include Solana blockchain integration and enhanced multiplayer features.