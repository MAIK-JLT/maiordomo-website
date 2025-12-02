// Selecciona los elementos del DOM y agrega logs para verificar que los elementos están siendo encontrados
const chatInput = document.getElementById('chat-input');
const chatButton = document.getElementById('chat-button');
const chatWindow = document.getElementById('chat-window');

if (chatInput && chatButton && chatWindow) {
    console.log("Elementos DOM seleccionados correctamente");
} else {
    console.error("Error seleccionando elementos DOM");
}

// Función para enviar mensajes al servidor
async function sendMessage(message) {
    console.log("Enviando mensaje:", message);  // Log del mensaje enviado

    try {
        const response = await fetch('http://localhost:3001/api/openai/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: message }),
        });

        console.log("Respuesta recibida del servidor:", response);  // Log de la respuesta

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log("Datos recibidos:", data);  // Log de los datos recibidos
        displayMessage('Tú', message);
        displayMessage('ChatJLT', data.data);

    } catch (error) {
        console.error('Error enviando mensaje:', error);
        displayMessage('Error', 'Hubo un problema enviando tu mensaje');
    }
}

// Función para mostrar mensajes en la ventana del chat
function displayMessage(sender, message) {
    console.log(`Mostrando mensaje de ${sender}: ${message}`);  // Log de cada mensaje mostrado
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight; // Desplaza el chat hacia abajo
}

// Evento para enviar mensaje al hacer clic en el botón
chatButton.addEventListener('click', () => {
    console.log("Botón enviar presionado");
    const message = chatInput.value;
    if (message) {
        console.log("Mensaje capturado:", message);
        sendMessage(message);
        chatInput.value = '';
    } else {
        console.warn("No se ingresó mensaje");
    }
});

// Permitir enviar el mensaje con la tecla "Enter"
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        console.log("Tecla Enter presionada");
        const message = chatInput.value;
        if (message) {
            console.log("Mensaje capturado con Enter:", message);
            sendMessage(message);
            chatInput.value = '';
        } else {
            console.warn("No se ingresó mensaje con Enter");
        }
    }
});
