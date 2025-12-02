class AgentOpenAi {
    async handleRequest(message) {
        try {
            const connectionRAG = require('./connectionRAG');
            
            // Obtener contexto con historial
            const { context, conversationHistory, hasFailed, isInLoop } = 
                await connectionRAG.retrieveContext(message);

            let response;
            
            if (isInLoop) {
                response = "Parece que estamos en un bucle. ¿Podrías reformular tu pregunta de otra manera?";
            } else if (hasFailed) {
                response = "Veo que intentos similares no han funcionado antes. Sugiero un enfoque diferente.";
            } else {
                // Tu lógica normal de procesamiento aquí
                response = await this.processNormalRequest(message, context);
            }

            // Guardar la conversación
            await connectionRAG.storeConversation(message, response, true);
            
            return response;

        } catch (error) {
            // Guardar la conversación fallida
            await connectionRAG.storeConversation(message, error.message, false);
            throw error;
        }
    }
}
