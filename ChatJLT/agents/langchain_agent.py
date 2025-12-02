from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_chroma import Chroma
from langchain.chains import ConversationalRetrievalChain
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.prompts import ChatPromptTemplate
from dotenv import load_dotenv
import os
import logging
from typing import List, Dict, Optional

# Configurar logging con más detalle
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Cargar variables de entorno
load_dotenv()

class LangChainAgent:
    def __init__(self):
        """Inicializa el agente con los componentes de LangChain para RAG"""
        logger.info("Inicializando LangChainAgent...")
        
        # Componentes base
        self.embeddings = OpenAIEmbeddings()
        self.llm = ChatOpenAI(temperature=0, model="gpt-3.5-turbo-16k")
        
        # Text Splitter optimizado para código
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=2000,
            chunk_overlap=200,
            add_start_index=True,
            length_function=len
        )
        
        # Vector store para documentos
        logger.info("Cargando vector store desde ./vector_store")
        self.store = Chroma(
            collection_name="code_store",
            embedding_function=self.embeddings,
            persist_directory="./vector_store"
        )
        
        # Log del número de documentos
        collection = self.store._collection
        logger.info(f"Vector store cargado con {collection.count()} documentos")
        
        # Retriever con MMR para mejor diversidad
        self.retriever = self.store.as_retriever(
            search_type="mmr",
            search_kwargs={
                "k": 4,
                "fetch_k": 20,
                "lambda_mult": 0.8
            }
        )

        # Prompt personalizado
        qa_prompt = ChatPromptTemplate.from_messages([
            ("system", """Eres un asistente experto en desarrollo de software que ayuda a entender y trabajar con código. 
            Utiliza el siguiente contexto para responder a las preguntas del usuario.
            Si el contexto no contiene información relevante para responder la pregunta, dilo claramente.
            No inventes información ni hagas suposiciones.
            No menciones el contexto explícitamente en tu respuesta, simplemente úsalo para informar tu respuesta.
            
            Contexto: {context}"""),
            ("human", "{question}")
        ])
        
        # Chain RAG con memory y prompt personalizado
        self.chain = ConversationalRetrievalChain.from_llm(
            llm=self.llm,
            retriever=self.retriever,
            chain_type="stuff",  # Cambiado de "refine" a "stuff" para respuestas más concisas
            combine_docs_chain_kwargs={"prompt": qa_prompt},
            return_source_documents=True,
            verbose=True
        )
        logger.info("LangChainAgent inicializado correctamente")

    async def add_documents(self, texts: List[str], metadatas: Optional[List[Dict]] = None) -> None:
        """Añade documentos al vector store"""
        if not texts:
            logger.warning("No texts provided")
            return
            
        try:
            # Dividir y procesar documentos
            chunks = []
            chunk_metadatas = []
            
            for i, text in enumerate(texts):
                doc_chunks = self.text_splitter.split_text(text)
                chunks.extend(doc_chunks)
                
                if metadatas:
                    chunk_metadatas.extend([metadatas[i]] * len(doc_chunks))
            
            logger.info(f"Split {len(texts)} documents into {len(chunks)} chunks")
            
            # Añadir al vector store
            self.store.add_texts(
                texts=chunks,
                metadatas=chunk_metadatas if chunk_metadatas else None
            )
            logger.info("Successfully added documents")
            
        except Exception as e:
            logger.error(f"Error adding documents: {str(e)}")
            raise

    async def process_message(self, message: str) -> Dict:
        """Procesa un mensaje y retorna respuesta con fuentes"""
        try:
            logger.info(f"Procesando mensaje: {message}")
            
            # Log de los documentos recuperados antes de procesarlos
            docs = self.retriever.get_relevant_documents(message)
            logger.info(f"Documentos recuperados: {len(docs)}")
            for i, doc in enumerate(docs):
                logger.info(f"Documento {i+1}:")
                logger.info(f"  Fuente: {doc.metadata.get('source', 'Unknown')}")
                logger.info(f"  Contenido: {doc.page_content[:200]}...")
            
            # Procesar con la chain
            response = await self.chain.acall({
                "question": message,
                "chat_history": []
            })
            
            logger.info("Respuesta generada exitosamente")
            return {
                "response": response["answer"],
                "source_documents": [
                    {
                        "content": doc.page_content,
                        "source": doc.metadata.get("source", "Unknown")
                    }
                    for doc in response["source_documents"]
                ]
            }
            
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}")
            raise

# Instancia global del agente
agent = LangChainAgent()
