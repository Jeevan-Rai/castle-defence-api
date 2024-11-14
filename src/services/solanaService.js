const web3 = require('@solana/web3.js');
const connection = require('../config/solana');

class SolanaService {
    async getPlayerBalance(address) {
        const publicKey = new web3.PublicKey(address);
        return await connection.getBalance(publicKey);
    }

    async createTransaction(from, to, amount) {
        // Implement transaction creation
    }
}

module.exports = new SolanaService();