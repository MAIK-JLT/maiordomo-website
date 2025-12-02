const mongoConnection = require('./mongoConnection');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

class ConnectionRAG {
    constructor() {
        this.openai = new OpenAIApi(new Configuration({
            apiKey: process.env.OPENAI_API_KEY
        }));
    }

    async generateEmbedding(text) {
        if (!text || typeof text !== 'string' || text.trim() === '') {
            throw new Error('El texto para generar embedding no puede estar vacío');
        }

        try {
            const response = await this.openai.createEmbedding({
                model: "text-embedding-ada-002",
                input: text.trim()
            });
            return response.data.data[0].embedding;
        } catch (error) {
            console.error('Error al generar embedding:', error);
            throw error;
        }
    }

    async storeConversation(message, response, success = true) {
        try {
            const db = await mongoConnection.getDb();
            const collection = db.collection('conversations');

            await collection.insertOne({
                message,
                response,
                success,
                timestamp: new Date(),
                embedding: await this.generateEmbedding(message + ' ' + response)
            });
        } catch (error) {
            console.error('Error storing conversation:', error);
        }
    }

    async getRelevantConversationHistory(currentQuery) {
        try {
            const queryEmbedding = await this.generateEmbedding(currentQuery);
            const db = await mongoConnection.getDb();
            const collection = db.collection('conversations');

            const relevantHistory = await collection.aggregate([
                {
                    $vectorSearch: {
                        index: "conversation_vector_index",
                        path: "embedding",
                        queryVector: queryEmbedding,
                        numCandidates: 100,
                        limit: 5
}
                },
                {
                    $project: {
                        message: 1,
                        response: 1,
                        success: 1,
                        timestamp: 1,
                        score: { $meta: "vectorSearchScore" }
                    }
                },
                {
                    $sort: { timestamp: -1 }
                }
            ]).toArray();

            return relevantHistory;
        } catch (error) {
            console.error('Error retrieving conversation history:', error);
            return [];
        }
    }

    async retrieveContext(userQuery) {
        try {
            const [codeContext, conversationHistory] = await Promise.all([
                this.retrieveCodeContext(userQuery),
                this.getRelevantConversationHistory(userQuery)
            ]);

            const previousAttempts = conversationHistory.filter(
                conv => this.isSimilarQuery(conv.message, userQuery)
            );

            const hasFailed = previousAttempts.some(attempt => !attempt.success);
            const isInLoop = this.detectLoop(previousAttempts);

            let finalContext = codeContext;

            if (hasFailed) {
                finalContext += "\nNOTE: Previous similar attempts have failed. Consider a different approach.";
            }

            if (isInLoop) {
                finalContext += "\nWARNING: Detected a potential conversation loop. Try reformulating the question.";
            }

            return {
                context: finalContext,
                conversationHistory: previousAttempts,
                hasFailed,
                isInLoop
            };
        } catch (error) {
            console.error('Error in retrieveContext:', error);
            throw error;
        }
    }

    async addContext(content) {
        try {
            if (!content || typeof content !== 'string' || content.trim() === '') {
                throw new Error('El contenido no puede estar vacío');
            }

            const embedding = await this.generateEmbedding(content);
            const db = await mongoConnection.getDb();
            const collection = db.collection('contexts');

            await collection.insertOne({
                content: content.trim(),
                embedding,
                createdAt: new Date()
            });

            return true;
        } catch (error) {
            console.error('Error al añadir contexto:', error);
            throw error;
        }
    }

    isSimilarQuery(query1, query2) {
        const words1 = new Set(query1.toLowerCase().split(/\s+/));
        const words2 = new Set(query2.toLowerCase().split(/\s+/));
        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        return intersection.size / union.size > 0.7;
    }

    detectLoop(conversations) {
        if (conversations.length < 3) return false;
        const lastThree = conversations.slice(-3);
        return lastThree.every(conv => !conv.success);
    }
}

module.exports = new ConnectionRAG();