// serverOpenAi.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { getOpenAIConnection } = require('../Connections/openaiConnection');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());


// Servir archivos estáticos desde la raíz del proyecto
app.use(express.static(path.join(__dirname, '../')));
// Middleware
app.use(bodyParser.json());
// Rutas
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


// Ruta para manejar las peticiones de chat
app.post('/api/query', async (req, res) => {
  const { query } = req.body;
  
  // Log para verificar el mensaje recibido
  console.log('Consulta recibida del cliente:', query);

  if (!query) {
    console.log('Error: El mensaje está vacío');
    return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
  }

  try {
    // Llamada a OpenAI desde la conexión
    const response = await connectionOpenAi.request('completions', {
      model: 'text-davinci-003',
      prompt: query,
      max_tokens: 150,
    });

    const prompt = response.choices[0].text.trim();
    return res.json({ prompt });
  } catch (error) {
    console.error('Error al obtener respuesta de OpenAI:', error.message);
    return res.status(500).json({ error: 'Error en el servidor.' });
  }
});


// Iniciar el servidor
const PORT = process.env.PORT || 4000;
console.log(`Intentando iniciar el servidor en el puerto ${PORT}`);
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});