const web3 = require('@solana/web3.js');

class SolanaConnection {
    constructor() {
        this.connection = new web3.Connection(
            process.env.SOLANA_RPC_URL,
            'confirmed'
        );
    }

    async getBalance(publicKey) {
        try {
            return await this.connection.getBalance(new web3.PublicKey(publicKey));
        } catch (error) {
            console.error('Error getting balance:', error);
            throw error;
        }
    }

    async getTransaction(signature) {
        try {
            return await this.connection.getTransaction(signature);
        } catch (error) {
            console.error('Error getting transaction:', error);
            throw error;
        }
    }

}

module.exports = new SolanaConnection();