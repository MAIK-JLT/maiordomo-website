const { MongoClient } = require('mongodb');
require('dotenv').config();

class MongoConnection {
    constructor() {
        this.client = null;
        this.db = null;
    }

    async connect() {
        try {
            if (this.client) return this.db;

            this.client = await MongoClient.connect(process.env.MONGODB_URI);
            this.db = this.client.db('ragDatabase');
            console.log('Connected to MongoDB');
            return this.db;
        } catch (error) {
            console.error('MongoDB connection error:', error);
            throw error;
        }
    }

    async getDb() {
        if (!this.db) {
            await this.connect();
        }
        return this.db;
    }

    async close() {
        if (this.client) {
            await this.client.close();
            this.client = null;
            this.db = null;
        }
    }
}

module.exports = new MongoConnection();