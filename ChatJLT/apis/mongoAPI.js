// apis/mongoAPI.js

const { getMongoConnection } = require('../connections/mongoConnection');

let conversationsCollection;

// Conexión a MongoDB y obtención de la colección
(async () => {
  try {
    const db = await getMongoConnection();
    conversationsCollection = db.collection('conversations');
    console.log('Conectado a MongoDB desde mongoAPI.js');
  } catch (error) {
    console.error('Error al conectar con MongoDB:', error);
  }
})();

// Función para obtener el historial de conversaciones
async function getConversationHistory() {
  try {
    const history = await conversationsCollection
      .find()
      .sort({ _id: 1 }) // Ordenar por orden de inserción
      .toArray();
    return history;
  } catch (error) {
    console.error('Error al obtener el historial de conversaciones:', error);
    return [];
  }
}

// Función para guardar mensajes en la base de datos
async function saveMessages(messages) {
  try {
    await conversationsCollection.insertMany(messages);
  } catch (error) {
    console.error('Error al guardar los mensajes:', error);
  }
}

module.exports = {
  getConversationHistory,
  saveMessages,
};
