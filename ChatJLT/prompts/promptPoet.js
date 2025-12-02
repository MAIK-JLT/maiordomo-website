class PromptPoet {
  generatePrompt(userQuery, context) {
      const systemInstructions = `Aquí está la información relevante: ${context}`;
      const userMessage = `Usuario preguntó: ${userQuery}`;
      const assistantResponsePrefix = "Respuesta:";

      return [
          { role: "system", content: systemInstructions },
          { role: "user", content: userMessage },
          { role: "assistant", content: assistantResponsePrefix }
      ];
  }
}

module.exports = new PromptPoet();
