(function () {
    // Configuración
    const API_BASE_URL = 'https://maiordomo.com/bodel_estetica_api';

    // Crear estilos
    const style = document.createElement('style');
    style.textContent = `
        #chat-widget-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            font-family: Arial, sans-serif;
        }
        #chat-widget-button {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background-color: #007bff;
            color: white;
            border: none;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            transition: transform 0.3s;
        }
        #chat-widget-button:hover {
            transform: scale(1.1);
        }
        #chat-widget-window {
            display: none;
            width: 350px;
            height: 500px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            flex-direction: column;
            margin-bottom: 20px;
            overflow: hidden;
        }
        #chat-widget-header {
            background: #007bff;
            color: white;
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        #chat-widget-messages {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
            background: #f9f9f9;
        }
        #chat-widget-input-area {
            padding: 15px;
            border-top: 1px solid #eee;
            display: flex;
            gap: 10px;
        }
        #chat-widget-input {
            flex: 1;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        #chat-widget-send {
            padding: 8px 15px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .chat-message {
            margin-bottom: 10px;
            padding: 8px 12px;
            border-radius: 8px;
            max-width: 80%;
            word-wrap: break-word;
        }
        .user-message {
            background: #e3f2fd;
            margin-left: auto;
        }
        .bot-message {
            background: white;
            border: 1px solid #eee;
            margin-right: auto;
        }
        .typing-indicator {
            font-style: italic;
            color: #888;
            font-size: 12px;
        }
    `;
    document.head.appendChild(style);

    // Crear elementos HTML
    const container = document.createElement('div');
    container.id = 'chat-widget-container';

    const windowDiv = document.createElement('div');
    windowDiv.id = 'chat-widget-window';
    windowDiv.innerHTML = `
        <div id="chat-widget-header">
            <span>Asistente Virtual</span>
            <button id="chat-widget-close" style="background:none;border:none;color:white;cursor:pointer;">✕</button>
        </div>
        <div id="chat-widget-messages"></div>
        <div id="chat-widget-input-area">
            <input type="text" id="chat-widget-input" placeholder="Escribe tu mensaje...">
            <button id="chat-widget-send">Enviar</button>
        </div>
    `;

    const button = document.createElement('button');
    button.id = 'chat-widget-button';
    button.innerHTML = '💬';

    container.appendChild(windowDiv);
    container.appendChild(button);
    document.body.appendChild(container);

    // Lógica del chat
    let isOpen = false;
    const messagesDiv = windowDiv.querySelector('#chat-widget-messages');
    const input = windowDiv.querySelector('#chat-widget-input');
    const sendBtn = windowDiv.querySelector('#chat-widget-send');
    const closeBtn = windowDiv.querySelector('#chat-widget-close');

    function toggleChat() {
        isOpen = !isOpen;
        windowDiv.style.display = isOpen ? 'flex' : 'none';
        button.style.display = isOpen ? 'none' : 'flex';
        if (isOpen) input.focus();
    }

    function addMessage(text, sender) {
        const div = document.createElement('div');
        div.className = `chat-message ${sender}-message`;
        div.textContent = text;
        messagesDiv.appendChild(div);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        input.value = '';

        try {
            const response = await fetch(`${API_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });
            const data = await response.json();
            addMessage(data.response, 'bot');
        } catch (error) {
            addMessage('Error de conexión', 'bot');
            console.error(error);
        }
    }

    // Event Listeners
    button.onclick = toggleChat;
    closeBtn.onclick = toggleChat;
    sendBtn.onclick = sendMessage;
    input.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };

    // Auto-crawling al iniciar
    async function initCrawler() {
        try {
            console.log('Iniciando indexación de:', window.location.href);
            await fetch(`${API_BASE_URL}/api/crawl`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: window.location.href })
            });
            console.log('Indexación iniciada');
        } catch (error) {
            console.error('Error iniciando indexación:', error);
        }
    }

    // Iniciar crawler después de cargar
    setTimeout(initCrawler, 1000);

})();
