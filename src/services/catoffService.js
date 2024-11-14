const axios = require('axios');

class CatoffService {
    constructor() {
        this.apiUrl = process.env.CATOFF_API_URL;
        this.apiKey = process.env.CATOFF_API_KEY;
    }

    async registerMatch(matchData) {
        return await axios.post(
            `${this.apiUrl}/matches/register`,
            matchData,
            {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            }
        );
    }

    async submitMatchResult(matchData) {
        return await axios.post(
            `${this.apiUrl}/matches/result`,
            matchData,
            {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            }
        );
    }
}

module.exports = new CatoffService();