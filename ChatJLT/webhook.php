<?php
// webhook.php
header("Content-Type: application/json");

// Lee el contenido de la solicitud
$input = file_get_contents("php://input");
$data = json_decode($input, true);

// Abre el log y registra la información recibida
file_put_contents("webhook_log.txt", print_r($data, true), FILE_APPEND);

// Verifica el token (WhatsApp enviará un reto de verificación para confirmar la URL)
$verify_token = "TU_TOKEN_DE_VERIFICACION"; // Define tu token aquí
if (isset($_GET['hub_verify_token']) && $_GET['hub_verify_token'] === $verify_token) {
    echo $_GET['hub_challenge'];
    exit;
}

// Procesa la información del mensaje (esto se puede expandir según los estados o tipos de mensajes)
if (isset($data['messages'])) {
    foreach ($data['messages'] as $message) {
        $from = $message['from']; // Número del remitente
        $text = $message['text']['body']; // Texto del mensaje recibido
        // Aquí puedes registrar el mensaje en la base de datos o llamar a otros servicios
        file_put_contents("messages_log.txt", "From: $from - Message: $text\n", FILE_APPEND);
    }
}

// Responde para confirmar recepción
echo json_encode(['status' => 'received']);
