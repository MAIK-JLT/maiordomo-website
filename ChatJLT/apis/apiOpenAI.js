// apiOpenAi.js
const connectionOpenAi = require('../Connections/connectionOpenAi');

class ApiOpenAi {
    // Método para hacer una solicitud de completion al modelo de OpenAI
    async getCompletion(prompt, maxTokens = 150, temperature = 0.7) {
        const data = {
            model: 'gpt-4o', // O el modelo que estés utilizando
            prompt: prompt,
            max_tokens: maxTokens,
            temperature: temperature
        };

        // Usar ConnectionOpenAI para hacer la llamada autenticada
        return await connectionOpenAi.request('completions', data);
    }

    // Aquí podrías agregar más funciones para diferentes endpoints de OpenAI
    // como embeddings, fine-tuning, etc.
}

module.exports = new ApiOpenAi();
