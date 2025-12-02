const { Configuration, OpenAIApi } = require('openai');

// Configurar la conexión con OpenAI
function getOpenAIConnection() {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY, // Clave API desde el archivo .env
  });
  const openai = new OpenAIApi(configuration);
  return openai;
}

// Prueba de conexión a OpenAI
(async () => {
  try {
    const testResponse = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo', // Cambia a 'gpt-3.5-turbo' si es necesario
      messages: [{ role: 'user', content: 'Hola' }],
      max_tokens: 5,
    });
    console.log('Conexión exitosa a OpenAI');
  } catch (error) {
    console.error('Error al conectar con OpenAI:', error.response ? error.response.data : error.message);
  }
})();

module.exports = { getOpenAIConnection };
