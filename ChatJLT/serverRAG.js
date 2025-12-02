const express = require('express');
const cors = require('cors');
const app = express();
const agentOpenAi = require('./agentOpenAi');

app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static('public'));

// Ruta para el chat
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const response = await agentOpenAi.handleRequest(message);
        res.json({ response });
    } catch (error) {
        console.error('Error in chat endpoint:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`RAG Server running on http://localhost:${PORT}`);
});
