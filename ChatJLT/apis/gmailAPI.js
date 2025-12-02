// apis/gmailAPI.js

const { google } = require('googleapis');
const { getGmailConnection } = require('../connections/gmailConnection');

// Obtener la conexión a Gmail
const gmailClient = getGmailConnection();

// Función para obtener mensajes de Gmail
async function getEmails(query) {
  try {
    const gmail = google.gmail({ version: 'v1', auth: gmailClient });

    // Listar mensajes
    const res = await gmail.users.messages.list({
      userId: 'me',
      q: query || '', // Ajusta la consulta según tus necesidades
    });

    const messages = res.data.messages || [];

    // Obtener los detalles de cada mensaje
    const emailPromises = messages.map(async (message) => {
      const msg = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'full',
      });
      return msg.data;
    });

    const emails = await Promise.all(emailPromises);
    return emails;
  } catch (error) {
    console.error('Error al obtener emails:', error);
    throw error;
  }
}

// Función para enviar un email
async function sendEmail(to, subject, body) {
  try {
    const gmail = google.gmail({ version: 'v1', auth: gmailClient });

    const rawMessage = createRawMessage(to, subject, body);

    const res = await gmail.users.messages.send({
      userId: 'me',
      resource: {
        raw: rawMessage,
      },
    });

    return res.data;
  } catch (error) {
    console.error('Error al enviar email:', error);
    throw error;
  }
}

// Función para crear el mensaje en formato raw
function createRawMessage(to, subject, body) {
  const messageParts = [
    `To: ${to}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
    '',
    body,
  ];
  const message = messageParts.join('\n');

  // Convertir a base64url
  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return encodedMessage;
}

module.exports = {
  getEmails,
  sendEmail,
};
