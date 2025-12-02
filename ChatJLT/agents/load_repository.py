import os
import asyncio
from typing import List
from agents.langchain_agent import agent
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_files_to_index(root_dir: str) -> List[str]:
    """Obtiene lista de archivos para indexar, ignorando carpetas comunes"""
    files_to_index = []
    ignore_dirs = {'.git', 'node_modules', 'venv', '__pycache__', '.idea', '.vscode', 'vector_store', 'python.langchain.com', 'langchain_tutorial'}
    ignore_extensions = {'.pyc', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.zip', '.tar', '.gz', '.db', '.sqlite3'}
    
    for root, dirs, files in os.walk(root_dir):
        # Filtrar directorios ignorados
        dirs[:] = [d for d in dirs if d not in ignore_dirs]
        
        for file in files:
            if any(file.endswith(ext) for ext in ignore_extensions):
                continue
                
            file_path = os.path.join(root, file)
            files_to_index.append(file_path)
            
    return files_to_index

async def load_repository():
    """Carga el repositorio actual en el vector store"""
    root_dir = os.getcwd()
    logger.info(f"Escaneando archivos en {root_dir}...")
    
    files = get_files_to_index(root_dir)
    logger.info(f"Encontrados {len(files)} archivos para indexar")
    
    texts = []
    metadatas = []
    
    for file_path in files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                if content.strip():  # Ignorar archivos vacíos
                    texts.append(content)
                    metadatas.append({"source": os.path.relpath(file_path, root_dir)})
        except Exception as e:
            logger.warning(f"No se pudo leer {file_path}: {e}")
            
    if texts:
        logger.info(f"Indexando {len(texts)} documentos...")
        
        # Procesar en lotes para evitar límites de tokens
        batch_size = 5  # Procesar 5 archivos a la vez
        for i in range(0, len(texts), batch_size):
            batch_texts = texts[i:i + batch_size]
            batch_metadatas = metadatas[i:i + batch_size]
            
            logger.info(f"Procesando lote {i//batch_size + 1} de {(len(texts) + batch_size - 1)//batch_size}")
            try:
                await agent.add_documents(batch_texts, batch_metadatas)
            except Exception as e:
                logger.error(f"Error en lote {i}: {e}")
                
        logger.info("Indexación completada!")
    else:
        logger.warning("No se encontraron documentos válidos para indexar")

if __name__ == "__main__":
    asyncio.run(load_repository())
