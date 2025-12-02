const mongoConnection = require('./mongoConnection');

async function initializeDatabase() {
    try {
        const db = await mongoConnection.getDb();

        // Crear índice para las conversaciones
        await db.collection('conversations').createIndex(
            { embedding: "vectorSearch" },
            {
                name: "conversation_vector_index",
                dimension: 1536,
                similarity: "cosine"
            }
        );

        // Crear índice para el código
        await db.collection('code_embeddings').createIndex(
            { embedding: "vectorSearch" },
            {
                name: "code_vector_index",
                dimension: 1536,
                similarity: "cosine"
            }
        );

        console.log('Database indexes created successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        await mongoConnection.close();
    }
}

initializeDatabase();

