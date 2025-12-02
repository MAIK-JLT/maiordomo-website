document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.getElementById('send-button');
    const messageInput = document.getElementById('message-input');
    const agentSelect = document.getElementById('agent');
    const serverSelect = document.getElementById('server');  // Aún podemos seleccionar el servidor, pero no cambiaremos la URL.

    const sendMessage = async () => {
        const message = messageInput.value;
        const agent = agentSelect.value;

        if (!message) {
            alert('Please enter a message');
            return;
        }

        try {
            // Asegúrate de usar HTTPS si tu dominio lo tiene disponible.
            const response = await fetch('https://tu-dominio.com/query', {  // Cambiar a HTTPS.
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message, agent }),
            });

            // Procesar la respuesta correctamente
            const rawData = await response.text();
            console.log('Raw Response:', rawData);

            // Verificar que la respuesta sea JSON antes de intentar parsear
            const data = JSON.parse(rawData);
            
            // Actualizar la interfaz con la respuesta
            document.getElementById('messages').innerHTML += `<div>User: ${message}</div>`;
            document.getElementById('messages').innerHTML += `<div>Assistant: ${data.response}</div>`;

            // Limpiar el campo de entrada
            messageInput.value = '';
        } catch (error) {
            console.error('Error al enviar el mensaje:', error);
        }
    };

    // Agregar eventos para enviar el mensaje
    sendButton.addEventListener('click', sendMessage);

    messageInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendMessage();
        }
    });
});
