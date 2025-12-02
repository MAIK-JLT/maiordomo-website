// apis/openaiAPI.js

const { getOpenAIConnection } = require('../connections/openaiConnection');
const openai = getOpenAIConnection();

// Función para crear una completación de chat (completar conversaciones)
async function createChatCompletion(messages, model = 'gpt-4', max_tokens = 150, temperature = 0.7) {
    try {
        const response = await openai.createChatCompletion({
            model: model,
            messages: messages,
            max_tokens: max_tokens,
            temperature: temperature,
        });
        
        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error en la creación de la completación de chat:', error);
        throw error;
    }
}

// Función para obtener un listado de modelos disponibles en OpenAI
async function listModels() {
    try {
        const response = await openai.listModels();
        return response.data.data; // Devuelve la lista de modelos
    } catch (error) {
        console.error('Error al listar los modelos:', error);
        throw error;
    }
}

// Función para obtener el historial de conversación guardado en MongoDB
const { getConversationHistory, saveMessages } = require('./mongoAPI');

async function getConversationHistoryFromDB() {
    try {
        const history = await getConversationHistory();
        return history;
    } catch (error) {
        console.error('Error al obtener el historial de conversación:', error);
        throw error;
    }
}

// Guardar mensajes en la base de datos
async function saveChatMessages(messages) {
    try {
        await saveMessages(messages);
    } catch (error) {
        console.error('Error al guardar mensajes:', error);
        throw error;
    }
}

module.exports = { createChatCompletion, listModels, getConversationHistoryFromDB, saveChatMessages };
